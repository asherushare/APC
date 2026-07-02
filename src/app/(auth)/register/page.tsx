'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePublicAuth } from '@/context/PublicAuthContext';
import { apiRequest, ApiError } from '@/lib/api-client';

export default function PublicRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading } = usePublicAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/portal');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input validations
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest<{ success: boolean; message: string }>('/public-auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber,
          email: email.trim() || undefined,
          password,
        }),
      });

      setSuccess('Account registered successfully! Redirecting to login page...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
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
          <span className="text-4xl">🌱</span>
          <h2 className="text-headline-sm font-black text-on-surface">
            Producer Registration
          </h2>
          <p className="text-body-xs text-on-surface-variant font-black uppercase tracking-wider text-[10px]">
            Join APC Odisha and build enterprise equity
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-600 font-semibold leading-relaxed flex items-start gap-2 animate-fade-in">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-600 font-semibold leading-relaxed flex items-start gap-2 animate-fade-in">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-label-sm font-extrabold text-on-surface">
              Full Name (As in Aadhaar)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">👤</span>
              <input
                id="reg-name"
                type="text"
                required
                disabled={isSubmitting || !!success}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="e.g. Laxmi Dharua"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-phone" className="text-label-sm font-extrabold text-on-surface">
              Active Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">📞</span>
              <input
                id="reg-phone"
                type="tel"
                pattern="[0-9]*"
                maxLength={10}
                required
                disabled={isSubmitting || !!success}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-label-sm font-extrabold text-on-surface">
              Email Address (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">✉</span>
              <input
                id="reg-email"
                type="email"
                disabled={isSubmitting || !!success}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="e.g. laxmi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-pass" className="text-label-sm font-extrabold text-on-surface">
              Create Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">🔑</span>
              <input
                id="reg-pass"
                type="password"
                required
                disabled={isSubmitting || !!success}
                className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!success}
            className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-label-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-body-xs text-on-surface-variant font-medium">
            Already have an account?{' '}
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
