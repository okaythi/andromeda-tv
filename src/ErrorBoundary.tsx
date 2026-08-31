import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled application error', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#0A0A0A] px-8 py-16 text-white">
          <div className="mx-auto max-w-xl rounded-2xl border border-red-400/20 bg-red-500/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">Andromeda TV</p>
            <h1 className="mt-3 text-3xl font-bold">Não foi possível abrir esta tela.</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Atualize o aplicativo para tentar novamente. Se o problema persistir, envie os detalhes ao suporte.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 overflow-auto rounded-lg bg-black/30 p-4 text-xs text-red-100">
                {this.state.error.stack ?? this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Atualizar aplicativo
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
