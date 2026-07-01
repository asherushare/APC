'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

export function LoginForm() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              disabled={isLoading}
              className={inputStyles(!!errors.password)}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
            />
            {errors.password && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.password}</p>
            )}
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
              <span>Waking up server (please wait)...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>
    </div>
  );
}
