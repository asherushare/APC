'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePublicAuth } from '@/context/PublicAuthContext';
import { ApiError } from '@/lib/api-client';

export default function PublicLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = usePublicAuth();
  const router = useRouter();

  // Redirect to portal if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/portal');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(phoneNumber, password);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Invalid credentials. Please check and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface select-none">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-surface-container-lowest select-none">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl">
        <div className="text-center space-y-2">
          <span className="text-4xl">🌾</span>
          <h2 className="text-headline-sm font-black text-on-surface">
            Producer Portal Login
          </h2>
          <p className="text-body-xs text-on-surface-variant font-black uppercase tracking-wider text-[10px]">
            Access your cooperative shareholder account
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-semibold leading-relaxed flex items-start gap-2 animate-fade-in">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="phone-number" className="text-label-sm font-extrabold text-on-surface">
              Registered Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">📞</span>
              <input
                id="phone-number"
                type="tel"
                pattern="[0-9]*"
                maxLength={10}
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-label-sm font-extrabold text-on-surface">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">🔑</span>
              <input
                id="login-password"
                type="password"
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-body-xs text-primary hover:text-dark-green font-bold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-label-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-body-xs text-on-surface-variant font-medium">
            Not registered yet?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-dark-green font-bold underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
