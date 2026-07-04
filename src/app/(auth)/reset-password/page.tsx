'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInvalidLink = !token || !email;
  const activeError = error || (isInvalidLink ? 'Invalid recovery link. Please request a new password reset link.' : null);

  const validate = () => {
    if (!password) {
      setError('Password is required.');
      return false;
    }
    // Length check
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    // Complexity check: 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token || !email) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/public-auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token,
          password
        }),
      });
      setSuccess('Your password has been successfully reset. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Something went wrong.');
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = (hasError: boolean) => cn(
    'w-full rounded-xl border bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all duration-200',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 animate-[shake_0.4s_ease-in-out]'
      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
  );

  return (
    <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <span className="text-xl">🌾</span>
        </div>
        <h3 className="text-headline-sm font-extrabold text-primary">
          Reset Password
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
          Create a new secure password for your portal account
        </p>
      </div>

      <div className="p-8 space-y-6">
        {activeError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left animate-shake">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-red-800 text-label-sm">Validation Error</h5>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                {activeError}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-left animate-fade-in">
            <span className="text-sm shrink-0">✅</span>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-green-800 text-label-sm">Successfully Reset</h5>
              <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Lock form fields if recovery parameters are missing */}
        {(!token || !email) ? (
          <div className="text-center pt-2">
            <Link
              href="/forgot-password"
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center uppercase tracking-wider text-label-sm"
            >
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label htmlFor="new-password" className="text-label-sm font-extrabold text-on-surface">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                disabled={isSubmitting}
                className={inputStyles(!!error)}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="confirm-new-password" className="text-label-sm font-extrabold text-on-surface">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                disabled={isSubmitting}
                className={inputStyles(!!error)}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-label-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-outline-variant/20">
          <p className="text-body-xs text-on-surface-variant font-medium">
            Remembered password?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-dark-green font-bold underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PublicResetPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-surface-container-lowest select-none">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-body-sm text-on-surface-variant font-medium">Loading form content...</p>
        </div>
      }>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
