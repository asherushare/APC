'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container } from '@/components/common/Container';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
          <Container className="max-w-md bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-2xl mx-auto shadow-sm">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-headline-sm font-black text-red-800">
                Application Rendering Crash
              </h3>
              <p className="text-body-sm text-on-surface-variant font-medium">
                An unexpected UI layout failure has occurred. The error has been captured and reported to system diagnostics.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-surface-container-low p-4 rounded-xl text-left border border-outline-variant/20">
                <p className="text-[10px] font-mono text-on-surface-variant font-semibold break-all leading-normal">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm"
            >
              Reload Page
            </button>
          </Container>
        </main>
      );
    }

    return this.props.children;
  }
}
