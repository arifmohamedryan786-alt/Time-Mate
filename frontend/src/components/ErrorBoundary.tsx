/**
 * TIME-MATE - React Error Boundary Component
 * 
 * Provides runtime exception containment for the React component tree.
 * Prevents full-application white-screen crashes by catching uncaught JavaScript
 * errors anywhere in child components, rendering an accessible fallback interface,
 * logging diagnostics to the console, and offering state recovery mechanisms.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  /**
   * Catches errors in descendant components and updates state to trigger fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  /**
   * Logs error metadata, component stack traces, and diagnostics for review.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.state = {
      ...this.state,
      errorInfo,
    };
    try {
      this.setState({ errorInfo });
    } catch {
      // Ignored if unmounted in test environments
    }
    console.error('🚨 [ErrorBoundary] Uncaught exception caught in component tree:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  /**
   * Resets the boundary state, attempting to re-render child components cleanly.
   */
  public handleReset = () => {
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
    try {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
      });
    } catch {
      // Ignored if unmounted in test environments
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public toggleDetails = () => {
    const nextVal = !this.state.showDetails;
    this.state = { ...this.state, showDetails: nextVal };
    try {
      this.setState({ showDetails: nextVal });
    } catch {
      // Ignored if unmounted in test environments
    }
  };

  public render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Something went wrong in this view',
        fallbackMessage = 'Time-Mate encountered an unexpected display error. Your saved data and tasks remain safe in your local database.',
      } = this.props;

      return (
        <div className="w-full min-h-[360px] p-6 sm:p-8 flex flex-col items-center justify-center bg-warm-50/60 rounded-2xl border border-warm-200 text-center my-4 transition-all">
          <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-warm-900 mb-2 font-display">
            {fallbackTitle}
          </h2>

          <p className="text-sm text-warm-700 max-w-md mb-6 leading-relaxed">
            {fallbackMessage}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-warm-800 hover:bg-warm-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-warm-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again & Reload View
            </button>

            <button
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-warm-100 text-warm-800 border border-warm-300 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Home className="w-4 h-4" />
              Refresh Application
            </button>
          </div>

          {/* Technical Diagnostics for Reviewers / Development */}
          <div className="w-full max-w-xl text-left border-t border-warm-200 pt-4 mt-2">
            <button
              onClick={this.toggleDetails}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-600 hover:text-warm-900 transition-colors"
            >
              <span>Technical Diagnostics & Stack Trace</span>
              {this.state.showDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {this.state.showDetails && (
              <div className="mt-3 p-4 bg-warm-900 text-warm-100 text-xs rounded-xl overflow-x-auto font-mono space-y-2 max-h-60 overflow-y-auto">
                <p className="font-semibold text-red-300">
                  {this.state.error?.name}: {this.state.error?.message}
                </p>
                {this.state.error?.stack && (
                  <pre className="text-[11px] text-warm-300 whitespace-pre-wrap leading-tight">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <div className="pt-2 border-t border-warm-700">
                    <p className="text-[11px] text-warm-400 font-semibold mb-1">Component Stack:</p>
                    <pre className="text-[10px] text-warm-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
