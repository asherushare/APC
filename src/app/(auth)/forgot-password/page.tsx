'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export default function PublicForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validate = () => {
    if (!email) {
      setError('Email address is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    if (countdown > 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/public-auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSuccess('If the email is registered, a password reset link has been dispatched to your mailbox.');
      setCountdown(60); // 60s cooldown
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-surface-container-lowest select-none">
      <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
        <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="text-xl">🌾</span>
          </div>
          <h3 className="text-headline-sm font-extrabold text-primary">
            Forgot Password?
          </h3>
          <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
            Enter your registered email to receive a reset link
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left animate-shake">
              <span className="text-sm shrink-0">⚠️</span>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-red-800 text-label-sm">Request Failed</h5>
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
                <h5 className="font-extrabold text-green-800 text-label-sm">Dispatched Link</h5>
                <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                  {success}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRequest} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label htmlFor="recovery-email" className="text-label-sm font-extrabold text-on-surface">
                Email Address
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                disabled={isSubmitting}
                className={inputStyles(!!error)}
                placeholder="e.g. farmer@adivasiproducer.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || countdown > 0}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-label-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : countdown > 0 ? (
                <span>Retry in {countdown}s</span>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-outline-variant/20">
            <p className="text-body-xs text-on-surface-variant font-medium">
              Back to{' '}
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
    </div>
  );
}
