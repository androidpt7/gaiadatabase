import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      const isConfigError = error?.message.includes('Supabase configuration missing');

      return (
        <div className="min-h-screen bg-[#2A2A2A] flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full bg-[#1A1A1A] border border-red-500/30 p-8 rounded-lg shadow-2xl text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2 uppercase tracking-tight">
              {isConfigError ? 'Configuration Required' : 'Something went wrong'}
            </h1>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {error?.message || 'An unexpected error occurred.'}
            </p>
            
            {isConfigError ? (
              <div className="bg-[#2A2A2A] p-4 rounded text-left mb-6 border border-[#333]">
                <p className="text-[10px] uppercase font-bold text-[#90EE90] mb-2">How to fix:</p>
                <ol className="text-xs space-y-2 text-gray-300 list-decimal list-inside">
                  <li>Open the <b>Secrets</b> panel in AI Studio.</li>
                  <li>Add <b>VITE_SUPABASE_URL</b>.</li>
                  <li>Add <b>VITE_SUPABASE_ANON_KEY</b>.</li>
                  <li>Refresh the page.</li>
                </ol>
              </div>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 mx-auto bg-[#333] hover:bg-[#444] px-6 py-2 rounded text-xs font-bold transition-colors"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
