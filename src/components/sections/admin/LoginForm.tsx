'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

export function LoginForm() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
      setErrors({ general: errMsg });
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

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
      <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <span className="text-xl">🔒</span>
        </div>
        <h3 className="text-headline-sm font-extrabold text-primary">
          Adivasi Producer Company
        </h3>
        <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
          Staff & Coordinator Portal Login
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left animate-shake">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <h5 className="font-extrabold text-red-800 text-label-sm">Login Failed</h5>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                {errors.general}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-label-sm font-extrabold text-on-surface" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              disabled={isLoading}
              className={inputStyles(!!errors.email)}
              placeholder="e.g. coord_rayagada@adivasiproducer.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-label-sm font-extrabold text-on-surface" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                disabled={isLoading}
                className={cn(inputStyles(!!errors.password), 'pr-10')}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors cursor-pointer select-none focus:outline-none"
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
            {errors.password && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-body-sm select-none pt-1">
            <label className="flex items-center gap-2 font-medium text-on-surface-variant cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-outline-variant bg-white text-primary focus:ring-primary/20 accent-primary cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <Link
              href="/staff-portal/forgot-password"
              className="font-bold text-primary hover:text-dark-green hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sign In...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>
    </div>
  );
}
