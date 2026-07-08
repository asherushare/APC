'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api-client';
import { Container } from '@/components/common/Container';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // POST directly to the admin auth forgot-password endpoint
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof ApiError ? err.message : 'Failed to send recovery request.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = 'w-full rounded-xl border border-outline bg-white px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200';

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="relative z-10 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden animate-fade-in">
          
          <div className="px-8 pt-8 pb-6 text-center select-none bg-surface-container-low border-b border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="text-xl">🔑</span>
            </div>
            <h3 className="text-headline-sm font-extrabold text-primary">
              Reset Staff Password
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-1.5 font-medium">
              Enter your registered staff email address to receive a recovery link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-left animate-fade-in">
                <span className="text-sm shrink-0">📨</span>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-green-800 text-label-sm">Request Successful</h5>
                  <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                    If this email address exists in our database, we have sent a secure password reset link to it. Please check your inbox.
                  </p>
                </div>
              </div>
            ) : (
              <>
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
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-extrabold text-on-surface" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      className={inputStyles}
                      placeholder="e.g. admin@adivasiproducer.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <span>Send Recovery Link</span>
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
      </Container>
    </main>
  );
}
