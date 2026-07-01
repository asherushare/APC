'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength checklist computed at render time (avoids synchronous setState inside useEffect)
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const allPassed = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !token) {
      setError('Invalid or expired reset parameters. Please request a new link.');
      return;
    }

    if (!allPassed) {
      setError('Please satisfy all password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, password }),
      });
      setSuccess('Your password has been successfully updated. You can now sign in.');
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000); // Redirect after 3s
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Reset failed. Try again.');
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkItem = (label: string, passed: boolean) => (
    <div className="flex items-center gap-2 text-[11px] font-medium transition-colors">
      <span className={cn('text-xs shrink-0', passed ? 'text-green-500' : 'text-on-surface-variant/30')}>
        {passed ? '●' : '○'}
      </span>
      <span className={passed ? 'text-green-700' : 'text-on-surface-variant/60'}>{label}</span>
    </div>
  );

  const inputStyles = (hasError: boolean) => cn(
    'w-full rounded-xl border bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all duration-200',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
  );

  return (
    <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <span className="text-xl">🛡️</span>
        </div>
        <h3 className="text-headline-sm font-extrabold text-primary">
          Reset Password
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
          Set a secure password for your administrator profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-left animate-fade-in">
            <span className="text-sm shrink-0">✅</span>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-green-800 text-label-sm">Success</h5>
              <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                {success}
              </p>
            </div>
          </div>
        )}

        {!success && (
          <>
            <div className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  className={inputStyles(!!error)}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  disabled={isSubmitting}
                  className={inputStyles(!!error)}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Real-time Checklist */}
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-3.5 space-y-2">
                <h6 className="text-[10px] uppercase font-bold text-on-surface-variant/80 tracking-wider">
                  Password Requirements
                </h6>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {checkItem('At least 8 characters', checks.length)}
                  {checkItem('One uppercase letter', checks.uppercase)}
                  {checkItem('One lowercase letter', checks.lowercase)}
                  {checkItem('One number (0-9)', checks.number)}
                  {checkItem('One special character (@$!%*?&)', checks.special)}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !allPassed || password !== confirmPassword}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </>
        )}

        <div className="text-center pt-2">
          <Link href="/admin/login" className="text-label-sm font-extrabold text-primary hover:text-dark-green transition-all uppercase tracking-wide">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
