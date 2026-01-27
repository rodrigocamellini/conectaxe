import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SafeMasterPortal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Master Portal Crash:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900 text-white rounded-3xl">
          <ShieldAlert size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-black uppercase mb-2">Erro Crítico no Painel Master</h2>
          <p className="text-slate-400 mb-6 text-center text-sm">Detectamos uma falha estrutural. Geralmente causada por dados corrompidos.</p>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs text-red-400 font-mono mb-6 max-w-full overflow-auto border border-red-900/30">
            {this.state.error?.message}
          </pre>
          <button onClick={this.handleReset} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold uppercase text-xs transition-colors shadow-lg shadow-red-900/20">
            Limpar Cache e Reiniciar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
