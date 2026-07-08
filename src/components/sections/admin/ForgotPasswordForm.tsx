'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm() {
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
      await apiRequest('/auth/forgot-password', {
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
    <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <span className="text-xl">🔑</span>
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

        {!success ? (
          <form onSubmit={handleRequest} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-label-sm font-extrabold text-on-surface" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                disabled={isSubmitting}
                className={inputStyles(!!error)}
                placeholder="coord_rayagada@adivasiproducer.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => handleRequest()}
              disabled={countdown > 0 || isSubmitting}
              className="w-full bg-surface-container-high border border-outline-variant hover:bg-surface text-on-surface font-extrabold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : null}
              <span>{countdown > 0 ? `Resend Link (${countdown}s)` : 'Resend Link'}</span>
            </button>
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/staff-portal/login" className="text-label-sm font-extrabold text-primary hover:text-dark-green transition-all uppercase tracking-wide">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
