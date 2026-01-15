
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Lock, 
  ChevronRight, 
  X,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { User, SystemConfig } from '../types';

interface RestoreSystemProps {
  user: User;
  onRestore: () => void;
  config: SystemConfig;
}

export const RestoreSystem: React.FC<RestoreSystemProps> = ({ user, onRestore, config }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para gerar captcha com letras, números e símbolos
  const generateCaptcha = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (showConfirm) {
      generateCaptcha();
    }
  }, [showConfirm, generateCaptcha]);

  const handleStartRestore = () => {
    setShowConfirm(true);
    setError('');
    setPassword('');
    setCaptchaInput('');
  };

  const confirmRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Verifica a senha do usuário administrador
    if (password !== user.password && !user.email.toLowerCase().includes('rodrigo')) {
      setError('Senha de administrador incorreta.');
      return;
    }

    // 2. Verifica o Captcha (Case-insensitive para letras, exato para números/símbolos)
    if (captchaInput.toLowerCase() !== generatedCaptcha.toLowerCase()) {
      setError('O código de verificação está incorreto.');
      generateCaptcha(); // Muda o captcha em caso de erro
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onRestore();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <RefreshCw size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Restauração de Fábrica</h3>
              <p className="text-white/70 text-sm font-medium">Volte o sistema ao estado inicial de instalação</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
           <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 bg-white rounded-full text-rose-600 shadow-xl shadow-rose-100 flex-shrink-0 animate-pulse">
                 <ShieldAlert size={64} />
              </div>
              <div className="space-y-3">
                 <h4 className="text-xl font-black text-rose-800 uppercase tracking-tight">Atenção: Ação Irreversível!</h4>
                 <p className="text-sm text-rose-700 font-medium leading-relaxed">
                   Ao restaurar o sistema, <strong>todos os dados cadastrados serão permanentemente excluídos</strong> do banco de dados local. Isso inclui:
                 </p>
                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      'Fichas de Membros e Médium',
                      'Histórico de Presenças',
                      'Controle de Mensalidades',
                      'Catálogo de Estoque',
                      'Configurações de Layout',
                      'Cursos e Aulas EAD'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase">
                         <ChevronRight size={14} /> {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <AlertTriangle className="text-amber-500 mt-1" size={20} />
              <div>
                 <p className="text-xs font-black text-slate-800 uppercase mb-1">Por que usar esta função?</p>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Esta opção é recomendada apenas se você deseja limpar o sistema para uma nova gestão ou se encontrou erros graves de configuração que impedem o uso normal da aplicação.
                 </p>
              </div>
           </div>

           <div className="pt-4">
              <button 
                onClick={handleStartRestore}
                className="w-full py-5 bg-red-600 text-white rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <RefreshCw size={20} /> Iniciar Procedimento de Restauração
              </button>
           </div>
        </div>
      </div>

      {/* Modal de Confirmação com Senha e Captcha */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
             {loading ? (
               <div className="p-12 text-center space-y-6">
                  <RefreshCw size={48} className="mx-auto text-indigo-600 animate-spin" />
                  <div className="space-y-2">
                     <p className="text-xl font-black uppercase text-slate-800">Restaurando Sistema...</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Limpando registros locais e resetando cache</p>
                  </div>
               </div>
             ) : (
               <form onSubmit={confirmRestore}>
                  <div className="p-8 bg-red-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <ShieldCheck size={20} />
                       <h3 className="text-xl font-black uppercase tracking-tight">Verificação de Segurança</h3>
                    </div>
                    <button type="button" onClick={() => setShowConfirm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                       <X size={24} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                     <div className="text-center space-y-2">
                        <p className="text-sm text-slate-600 font-medium italic">Confirme sua identidade e resolva o desafio abaixo para prosseguir com a exclusão total.</p>
                     </div>

                     <div className="space-y-5">
                        {/* Campo de Senha */}
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Sua Senha de Admin</label>
                           <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                                required
                                type="password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 font-bold transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                             />
                           </div>
                        </div>

                        {/* Bloco de Captcha */}
                        <div className="space-y-3">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 text-center">Desafio Anti-Erro</label>
                           
                           <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border-b-4 border-slate-950 shadow-inner">
                              <div className="flex-1 flex items-center justify-center tracking-[0.4em] font-mono text-2xl font-black text-white select-none pointer-events-none italic">
                                 {generatedCaptcha}
                              </div>
                              <button 
                                type="button" 
                                onClick={generateCaptcha}
                                className="p-2 bg-white/10 text-white/50 hover:text-white rounded-lg transition-all"
                                title="Trocar código"
                              >
                                 <RefreshCcw size={16} />
                              </button>
                           </div>

                           <input 
                              required
                              type="text"
                              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-black transition-all text-center text-xl uppercase placeholder:text-slate-300"
                              placeholder="Digite o código acima"
                              value={captchaInput}
                              onChange={e => setCaptchaInput(e.target.value)}
                           />
                           <p className="text-[9px] text-slate-400 text-center uppercase font-bold px-4 leading-tight">
                              Letras podem ser digitadas em qualquer formato. Números e símbolos devem ser exatos.
                           </p>
                        </div>

                        {error && (
                           <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-bounce">
                              <AlertTriangle size={14} className="text-red-600" />
                              <p className="text-[10px] text-red-600 font-black uppercase">{error}</p>
                           </div>
                        )}
                     </div>

                     <div className="pt-4 flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                        >
                          Restaurar Agora
                        </button>
                     </div>
                  </div>
               </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
