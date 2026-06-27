// api-client.ts
// Independent fetch wrapper for APC backend communication

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let currentAccessToken: string | null = null;
let onTokenStateChange: ((token: string | null) => void) | null = null;
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string | null) => void; reject: (err: unknown) => void }> = [];

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  if (onTokenStateChange) {
    onTokenStateChange(token);
  }
};

export const getAccessToken = () => currentAccessToken;

export const registerTokenStateListener = (callback: (token: string | null) => void) => {
  onTokenStateChange = callback;
};

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Executes a network fetch with timeout support.
 */
async function fetchWithTimeout(url: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds`);
    }
    throw err;
  }
}

/**
 * Core API Client execution helper.
 */
export async function apiRequest<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  // Configure headers
  const headers = new Headers(options.headers || {});
  if (currentAccessToken) {
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: ApiRequestOptions = {
    ...options,
    headers,
    credentials: 'include', // Ensure refresh token cookies are sent
  };

  try {
    const response = await fetchWithTimeout(url, fetchOptions);

    if (response.status === 401) {
      // Check if we can perform a refresh
      const result = await handleUnauthorized(endpoint, options);
      if (result !== null) return result as T;
    }

    if (!response.ok) {
      let errorBody: Record<string, unknown> = {};
      try {
        errorBody = await response.json() as Record<string, unknown>;
      } catch {
        // Fallback for non-JSON errors
      }

      const errObj = errorBody.error as Record<string, unknown> | undefined;
      const message = (errObj?.message || errorBody.message || response.statusText || 'API Request failed') as string;
      const code = (errObj?.code || errorBody.code || 'UNKNOWN_ERROR') as string;
      const details = errObj?.details || errorBody.details || null;

      throw new ApiError(message, response.status, code, details);
    }

    // Success response parsing
    if (response.status === 204) {
      return {} as T;
    }
    return await response.json() as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    const errMsg = err instanceof Error ? err.message : 'Network communication error';
    throw new ApiError(errMsg, 500, 'NETWORK_ERROR');
  }
}

/**
 * Handles 401 Unauthorized responses by issuing automatic refresh token rotation checks.
 */
async function handleUnauthorized(endpoint: string, options: ApiRequestOptions): Promise<unknown> {
  // If we are already attempting refresh, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: (token) => {
          const headers = new Headers(options.headers || {});
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          resolve(apiRequest(endpoint, { ...options, headers }));
        },
        reject: (err) => reject(err),
      });
    });
  }

  isRefreshing = true;

  try {
    // Call refresh token rotation endpoint
    const refreshResponse = await fetchWithTimeout(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!refreshResponse.ok) {
      throw new Error('Session expired');
    }

    const data = await refreshResponse.json() as { accessToken: string };
    const newAccessToken = data.accessToken;
    
    setAccessToken(newAccessToken);
    isRefreshing = false;

    // Process all requests waiting in the queue
    refreshQueue.forEach((q) => q.resolve(newAccessToken));
    refreshQueue = [];

    // Retry the current request
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${newAccessToken}`);
    return await apiRequest(endpoint, { ...options, headers });
  } catch (err) {
    isRefreshing = false;
    setAccessToken(null); // Log out locally
    refreshQueue.forEach((q) => q.reject(err));
    refreshQueue = [];
    return null;
  }
}

/**
 * Fetches a binary/authenticated resource (e.g. a streamed document) and returns
 * it as a Blob. Used by the admin document viewer, where the download endpoint
 * proxies the file through the server and requires a Bearer access token (the
 * token is held in memory, so a plain window.open(url) would be unauthorized).
 *
 * On 401, performs the same token-refresh retry path as apiRequest.
 */
export async function fetchBlob(endpoint: string, options: ApiRequestOptions = {}): Promise<Blob> {
  const attempt = async (token: string | null): Promise<Blob> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetchWithTimeout(url, { ...options, headers, credentials: 'include' });
    if (!response.ok) {
      let errorBody: Record<string, unknown> = {};
      try {
        errorBody = await response.json() as Record<string, unknown>;
      } catch {
        // Non-JSON error (e.g. raw text); ignore
      }
      const errObj = errorBody.error as Record<string, unknown> | undefined;
      const message = (errObj?.message || errorBody.message || response.statusText || 'Download failed') as string;
      const code = (errObj?.code || errorBody.code || 'UNKNOWN_ERROR') as string;
      throw new ApiError(message, response.status, code, errObj?.details || null);
    }
    return await response.blob();
  };

  try {
    return await attempt(currentAccessToken);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) {
      // Attempt a single refresh + retry, mirroring apiRequest's recovery path.
      try {
        const refreshResponse = await fetchWithTimeout(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!refreshResponse.ok) throw new Error('Session expired');
        const data = await refreshResponse.json() as { accessToken: string };
        setAccessToken(data.accessToken);
        return await attempt(data.accessToken);
      } catch {
        setAccessToken(null);
        throw new ApiError('Session expired', 401, 'INVALID_ACCESS_TOKEN');
      }
    }
    throw err;
  }
}

/**
 * Uploads a file via multipart form-data using XMLHttpRequest to support progress events.
 */
export function uploadWithProgress<T = unknown>(
  endpoint: string,
  formData: FormData,
  uploadToken: string,
  onProgress: (progress: number) => void,
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.withCredentials = true; // Ensure refresh token cookies are sent

    // Set custom upload token header
    xhr.setRequestHeader('X-Upload-Token', uploadToken);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resJson = JSON.parse(xhr.responseText) as T;
          resolve(resJson);
        } catch {
          resolve(xhr.responseText as unknown as T);
        }
      } else {
        let errBody: Record<string, unknown> = {};
        try {
          errBody = JSON.parse(xhr.responseText) as Record<string, unknown>;
        } catch {
          // Fallback
        }
        const errObj = errBody.error as Record<string, unknown> | undefined;
        const message = (errObj?.message || errBody.message || xhr.statusText || 'Upload failed') as string;
        const code = (errObj?.code || errBody.code || 'UPLOAD_FAILED') as string;
        reject(new ApiError(message, xhr.status, code, errObj?.details || null));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError('Network error during file upload', 500, 'NETWORK_ERROR'));
    };

    xhr.ontimeout = () => {
      reject(new ApiError(`Upload timed out after ${timeout / 1000} seconds`, 408, 'REQUEST_TIMEOUT'));
    };

    xhr.timeout = timeout;
    xhr.send(formData);
  });
}
