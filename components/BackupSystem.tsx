
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
  Info,
  Trash2,
  Clock,
  Save
} from 'lucide-react';
import { User, SystemConfig, StoredSnapshot } from '../types';
import { backupService } from '../services/backupService';

interface BackupSystemProps {
  user: User;
  config: SystemConfig;
  onRestoreFromBackup: (data: any) => void;
  onUpdateConfig?: (config: SystemConfig) => void;
  allowAutoBackup?: boolean;
  currentData?: any;
  clientId?: string;
  planName?: string;
}

export const BackupSystem: React.FC<BackupSystemProps> = ({ 
  user, 
  config, 
  onRestoreFromBackup, 
  onUpdateConfig, 
  allowAutoBackup = false,
  currentData,
  clientId,
  planName
}) => {
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null); // ID do backup a deletar
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupFile, setBackupFile] = useState<any>(null);

  // Determine effective ID and Plan
  const effectiveClientId = clientId || config.license?.clientId;
  const effectivePlanName = planName || config.license?.planName || '';

  // Snapshots State
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>([]);
  
  // Load Cloud Backups
  useEffect(() => {
    const loadBackups = async () => {
        if (effectiveClientId) {
            const backups = await backupService.getBackups(effectiveClientId);
            setSnapshots(backups);
        }
    };
    loadBackups();
  }, [effectiveClientId]);

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

  // Gerar Backup e Salvar na Lista
  const handleGenerateBackup = async () => {
    const dataToBackup = currentData || {};
    const newSnapshot = backupService.createSnapshotFromData(dataToBackup, 'Manual');
    
    if (effectiveClientId) {
        try {
            await backupService.saveBackup(effectiveClientId, newSnapshot);
            setSnapshots(prev => [newSnapshot, ...prev]);
            alert('Backup Cloud gerado e salvo com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar backup na nuvem.');
        }
    } else {
        // Fallback download if no client ID (shouldn't happen in prod)
        handleDownloadSnapshot(newSnapshot);
    }
  };

  // Download de um backup da lista
  const handleDownloadSnapshot = (snapshot: StoredSnapshot) => {
    const blob = new Blob([JSON.stringify(snapshot.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date(snapshot.date).toISOString().split('T')[0];
    link.href = url;
    link.download = `backup_terreiro_${config.systemName.replace(/\s+/g, '_')}_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Deletar backup da lista
  const confirmDeleteSnapshot = (id: string) => {
    setShowDeleteModal(id);
  };

  const isTestPlan = effectivePlanName.toLowerCase().includes('teste') || 
                     effectivePlanName.toLowerCase().includes('trial') ||
                     effectivePlanName.toLowerCase().includes('período de teste');

  if (isTestPlan) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Segurança de Dados</h3>
                <p className="text-white/70 text-sm font-medium">Backup e Restauração</p>
              </div>
            </div>
          </div>
          
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Lock size={48} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-black text-slate-800 uppercase">Funcionalidade Bloqueada</h3>
              <p className="text-slate-500 font-medium">
                A geração e exportação de backups não está disponível no Plano de Teste.
                Para garantir a segurança dos seus dados e habilitar esta função, atualize para um plano completo.
              </p>
            </div>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-indigo-700 transition-all">
              Ver Planos Disponíveis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteSnapshot = async () => {
    if (!showDeleteModal) return;
    
    if (effectiveClientId) {
        try {
            await backupService.deleteBackup(effectiveClientId, showDeleteModal);
            setSnapshots(prev => prev.filter(s => s.id !== showDeleteModal));
        } catch (error) {
             console.error(error);
             alert('Erro ao excluir backup da nuvem.');
        }
    }
    setShowDeleteModal(null);
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
                 <Save size={48} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-emerald-800 uppercase tracking-tight">Gerar Novo Backup</h4>
                 <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                   Crie uma cópia instantânea de todos os dados do sistema. O arquivo ficará salvo na lista abaixo para download.
                 </p>
              </div>
              <button 
                onClick={handleGenerateBackup}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Gerar Backup Agora
              </button>
           </div>

           {/* Card Restaurar Backup */}
           <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-6">
              <div className="p-6 bg-white rounded-full text-indigo-600 shadow-xl shadow-indigo-100">
                 <Upload size={48} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-indigo-800 uppercase tracking-tight">Restaurar de Arquivo</h4>
                 <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                   Funcionalidade desativada na versão Nuvem. Entre em contato com o suporte.
                 </p>
              </div>
              <label className="w-full py-4 bg-gray-400 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg cursor-not-allowed flex items-center justify-center gap-2">
                <Upload size={18} /> Restaurar Indisponível
              </label>
           </div>
        </div>

        {/* Configuração de Backup Automático */}
        {allowAutoBackup === true && onUpdateConfig && (
           <div className="px-8 pb-8">
             <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8">
               <div className="flex items-center gap-4 mb-6">
                 <Clock className="text-indigo-600" size={24} />
                 <div>
                   <h4 className="text-lg font-black text-slate-800 uppercase">Backup Automático</h4>
                   <p className="text-xs text-slate-500 font-medium">Configure a frequência de geração automática de cópias de segurança.</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { id: 'disabled', label: 'Desativado' },
                   { id: '7', label: 'A cada 7 dias' },
                   { id: '15', label: 'A cada 15 dias' },
                   { id: '30', label: 'A cada 30 dias' }
                 ].map(opt => (
                   <button
                     key={opt.id}
                     onClick={() => onUpdateConfig({ ...config, autoBackupFrequency: opt.id as any })}
                     className={`p-4 rounded-xl border-2 transition-all font-bold text-xs uppercase ${
                       (config.autoBackupFrequency || 'disabled') === opt.id
                         ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                         : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                     }`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
             </div>
           </div>
        )}

        {/* Lista de Backups */}
        <div className="border-t border-gray-100">
          <div className="p-8">
             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <History size={16} /> Histórico de Backups Gerados
             </h4>
             
             {snapshots.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                 <Archive className="mx-auto text-gray-300 mb-4" size={48} />
                 <p className="text-gray-400 font-medium">Nenhum backup gerado ainda.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {snapshots.map(snap => (
                   <div key={snap.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all shadow-sm group">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                         JSON
                       </div>
                       <div>
                         <p className="font-bold text-slate-700 text-sm">Backup {snap.type || 'Manual'}</p>
                         <p className="text-[10px] text-slate-400 font-medium">
                           {new Date(snap.date).toLocaleDateString()} às {new Date(snap.date).toLocaleTimeString()} • {snap.size}
                         </p>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleDownloadSnapshot(snap)}
                         className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                         title="Baixar"
                       >
                         <Download size={18} />
                       </button>
                       <button 
                        onClick={() => confirmDeleteSnapshot(snap.id)}
                        className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors hover:text-rose-600"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
       </div>

       <div className="p-8 bg-gray-50 border-t border-gray-100">
          <div className="flex items-start gap-4">
             <Info className="text-indigo-400 mt-1" size={20} />
             <div>
                <p className="text-xs font-black text-slate-800 uppercase mb-1">Dica Importante</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                   Recomendamos baixar os arquivos de backup gerados para um dispositivo seguro externo (Pen Drive ou Nuvem). Manter backups apenas aqui não protege contra perda total do dispositivo atual.
                </p>
             </div>
          </div>
       </div>
     </div>

     {/* Modal de Confirmação de Exclusão */}
     {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[130] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300 border-4 border-rose-100">
             <div className="p-8 bg-rose-50 border-b border-rose-100 text-rose-800 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Trash2 size={24} className="text-rose-600" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Excluir Backup</h3>
               </div>
               <button onClick={() => setShowDeleteModal(null)} className="p-2 hover:bg-rose-200/50 rounded-full transition-all text-rose-600">
                  <X size={24} />
               </button>
             </div>

             <div className="p-8 space-y-6">
                <p className="text-slate-600 font-medium text-center leading-relaxed">
                  Tem certeza que deseja excluir permanentemente este backup? <br/>
                  <span className="text-xs text-rose-500 font-bold uppercase mt-2 block">Esta ação não pode ser desfeita.</span>
                </p>

                <div className="flex gap-4">
                   <button 
                      onClick={() => setShowDeleteModal(null)}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                   >
                      Cancelar
                   </button>
                   <button 
                      onClick={handleDeleteSnapshot}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                   >
                      Sim, Excluir
                   </button>
                </div>
             </div>
          </div>
        </div>
     )}

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

                        <button 
                           type="submit"
                           className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                           <RefreshCcw size={18} /> Confirmar e Restaurar
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
