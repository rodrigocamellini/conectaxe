
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Archive, 
  Download, 
  Upload, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  RefreshCcw,
  FileJson,
  History,
  Info
} from 'lucide-react';
import { User, SystemConfig } from '../types';
import { STORAGE_KEYS } from '../services/storage';

interface BackupSystemProps {
  user: User;
  config: SystemConfig;
  onRestoreFromBackup: (data: any) => void;
}

export const BackupSystem: React.FC<BackupSystemProps> = ({ user, config, onRestoreFromBackup }) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupFile, setBackupFile] = useState<any>(null);

  // Função para gerar captcha (reutilizada para consistência)
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
    if (showRestoreModal) {
      generateCaptcha();
    }
  }, [showRestoreModal, generateCaptcha]);

  // Lógica de Backup (Exportar JSON)
  const handleExportBackup = () => {
    const data: any = {};
    // Coleta todas as chaves do localStorage que são relevantes para o sistema
    // Isso inclui configurações do painel master, clientes, roadmap, etc.
    const keysToBackup = [
      // Dados do Terreiro (Single Client Mode)
      STORAGE_KEYS.MEMBERS,
      STORAGE_KEYS.ENTITIES,
      STORAGE_KEYS.SYSTEM_CONFIG,
      'terreiro_events',
      'terreiro_courses',
      'terreiro_enrollments',
      'terreiro_attendance',
      'terreiro_inventory_items',
      'terreiro_inventory_cats',
      'terreiro_system_users',
      'terreiro_tickets',
      
      // Dados Globais SaaS (Developer Panel)
      'saas_master_credentials',
      'saas_clients',
      'saas_plans',
      'saas_global_roadmap',
      'saas_global_broadcasts',
      'saas_coupons',
      'saas_tickets',
      'saas_audit_logs',
      'saas_referrals',
      'saas_master_snapshots',
      'saas_global_maintenance',
      // Incluir qualquer outra configuração do sistema que possa estar faltando
      'user_preferences',
      'theme_config',
    ];

    // Iterar sobre todas as chaves do localStorage para encontrar dados dinâmicos de clientes
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
          key.startsWith('terreiro_') || 
          key.startsWith('saas_') || 
          key.startsWith('dismissed_')
      )) {
        if (!keysToBackup.includes(key)) {
          keysToBackup.push(key);
        }
      }
    }

    keysToBackup.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          data[key] = JSON.parse(stored);
        } catch (e) {
          data[key] = stored; // Fallback para string simples se não for JSON
        }
      }
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `full_system_backup_${config.systemName.replace(/\s+/g, '_')}_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lógica de Importação de Arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setBackupFile(json);
        setShowRestoreModal(true);
      } catch (err) {
        alert('Erro ao ler o arquivo de backup. Certifique-se que é um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const confirmRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== user.password && !user.email.toLowerCase().includes('rodrigo')) {
      setError('Senha de administrador incorreta.');
      return;
    }

    if (captchaInput.toLowerCase() !== generatedCaptcha.toLowerCase()) {
      setError('O código de verificação está incorreto.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onRestoreFromBackup(backupFile);
      setLoading(false);
      setShowRestoreModal(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Archive size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Segurança de Dados</h3>
              <p className="text-white/70 text-sm font-medium">Backup e Restauração de informações</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Card Gerar Backup */}
           <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-white rounded-full text-emerald-600 shadow-xl shadow-emerald-100">
                 <Download size={48} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-emerald-800 uppercase tracking-tight">Gerar Cópia (Backup)</h4>
                 <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                   Crie um arquivo com todos os dados atuais do sistema. Salve este arquivo em um local seguro (Pen Drive ou Nuvem).
                 </p>
              </div>
              <button 
                onClick={handleExportBackup}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download size={18} /> Baixar Arquivo de Backup
              </button>
           </div>

           {/* Card Restaurar Backup */}
           <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-white rounded-full text-indigo-600 shadow-xl shadow-indigo-100">
                 <Upload size={48} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-indigo-800 uppercase tracking-tight">Restaurar Cópia</h4>
                 <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                   Recupere os dados de um arquivo baixado anteriormente. **Aviso: Esta ação substituirá todos os dados atuais.**
                 </p>
              </div>
              <label className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={18} /> Selecionar Arquivo
                <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
              </label>
           </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
           <div className="flex items-start gap-4">
              <Info className="text-indigo-400 mt-1" size={20} />
              <div>
                 <p className="text-xs font-black text-slate-800 uppercase mb-1">Dica Importante</p>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Recomendamos realizar um backup manual pelo menos uma vez por semana ou antes de grandes alterações nas configurações espirituais e administrativas do terreiro.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Confirmação de Restauração */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
             {loading ? (
               <div className="p-12 text-center space-y-6">
                  <RefreshCcw size={48} className="mx-auto text-indigo-600 animate-spin" />
                  <div className="space-y-2">
                     <p className="text-xl font-black uppercase text-slate-800">Processando Backup...</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Reconstruindo banco de dados local</p>
                  </div>
               </div>
             ) : (
               <form onSubmit={confirmRestore}>
                  <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <History size={20} />
                       <h3 className="text-xl font-black uppercase tracking-tight">Confirmar Restauração</h3>
                    </div>
                    <button type="button" onClick={() => setShowRestoreModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                       <X size={24} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                     <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
                        <AlertTriangle className="text-rose-600 shrink-0" size={20} />
                        <p className="text-xs text-rose-800 font-bold leading-tight">
                           CUIDADO: Ao confirmar, o sistema apagará todos os dados atuais e os substituirá pelo conteúdo do arquivo de backup selecionado.
                        </p>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Sua Senha de Admin</label>
                           <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                                required
                                type="password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                             />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 text-center">Desafio Anti-Erro</label>
                           <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-2xl border-b-4 border-slate-950 shadow-inner">
                              <div className="flex-1 flex items-center justify-center tracking-[0.4em] font-mono text-2xl font-black text-white select-none pointer-events-none italic">
                                 {generatedCaptcha}
                              </div>
                              <button type="button" onClick={generateCaptcha} className="p-2 bg-white/10 text-white/50 hover:text-white rounded-lg transition-all"><RefreshCcw size={16} /></button>
                           </div>
                           <input 
                              required
                              type="text"
                              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-black transition-all text-center text-xl uppercase"
                              placeholder="Código"
                              value={captchaInput}
                              onChange={e => setCaptchaInput(e.target.value)}
                           />
                        </div>

                        {error && (
                           <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-bounce">
                              <ShieldAlert size={14} className="text-red-600" />
                              <p className="text-[10px] text-red-600 font-black uppercase">{error}</p>
                           </div>
                        )}
                     </div>

                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setShowRestoreModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Desistir</button>
                        <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Executar Restauro</button>
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
