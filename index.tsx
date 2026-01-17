
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class GlobalErrorBoundary extends React.Component<{}, { hasError: boolean; error: Error | null }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Global render error', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 text-center">
            <h1 className="text-xl font-black text-red-600 uppercase mb-4">
              Erro ao carregar o sistema
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              Ocorreu um erro interno. Envie esta mensagem para o desenvolvedor:
            </p>
            {this.state.error?.message && (
              <pre className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-2xl p-4 overflow-auto text-left whitespace-pre-wrap break-words mb-6">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
