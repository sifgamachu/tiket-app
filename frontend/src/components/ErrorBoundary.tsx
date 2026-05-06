import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-tiket-cream text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-4">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-base font-black text-ink-900">Something went wrong</h1>
        <p className="text-xs text-ink-500 mt-1 max-w-sm">
          The app hit an unexpected error. Reloading usually helps. If it persists, contact support at @TiketEthiopia.
        </p>
        <button
          onClick={() => window.location.assign('/')}
          className="mt-5 rounded-xl bg-tiket-green text-white px-4 py-2 text-sm font-bold"
        >
          Reload app
        </button>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-6 text-[10px] text-left bg-white p-3 rounded-lg border border-ink-100 max-w-md overflow-x-auto">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
