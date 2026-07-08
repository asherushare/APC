'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!token) {
      setError('Invalid or expired password reset link.');
      return false;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#+^=])[A-Za-z\d@$!%*?&._\-#+^=]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // POST directly to the admin auth reset-password endpoint
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          password,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/staff-portal/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof ApiError ? err.message : 'Failed to reset password.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = 'w-full rounded-xl border border-outline bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200';

  const isInvalidLink = !token;

  return (
    <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <span className="text-xl">🛠️</span>
        </div>
        <h3 className="text-headline-sm font-extrabold text-primary">
          Choose New Password
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
          Set your new administrator password to restore access
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-left animate-fade-in">
            <span className="text-sm shrink-0">✅</span>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-green-800 text-label-sm">Password Reset Successful</h5>
              <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                Your password has been successfully updated. Redirecting you to the admin login page...
              </p>
            </div>
          </div>
        ) : (
          <>
            {isInvalidLink && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left">
                <span className="text-sm shrink-0">⚠️</span>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-red-800 text-label-sm">Invalid Request</h5>
                  <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                    This password reset link is invalid or has expired. Please request a new recovery link.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left animate-shake">
                <span className="text-sm shrink-0">⚠️</span>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-red-800 text-label-sm">Reset Failed</h5>
                  <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting || isInvalidLink}
                    className={cn(inputStyles, 'pr-10')}
                    placeholder="Min 8 chars (1 upper, 1 lower, 1 symbol)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={isInvalidLink}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors cursor-pointer select-none focus:outline-none disabled:opacity-30"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  disabled={isSubmitting || isInvalidLink}
                  className={inputStyles}
                  placeholder="Re-type your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isInvalidLink}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving changes...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </>
        )}

        <div className="pt-4 border-t border-outline-variant/30 text-center select-none">
          <Link
            href="/staff-portal/login"
            className="text-body-sm font-extrabold text-primary hover:text-dark-green transition-colors uppercase tracking-wider"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="relative z-10 flex items-center justify-center">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </Container>
    </main>
  );
}
