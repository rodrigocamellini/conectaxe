import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-500 font-medium">Carregando...</p>
    </div>
  </div>
);
