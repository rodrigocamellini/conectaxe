
import React, { useState, useMemo, useEffect } from 'react';
import { SystemConfig, SystemLicense, SaaSClient } from '../types';
import { 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Lock, 
  Mail, 
  ExternalLink, 
  Save, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  Info, 
  X,
  Landmark,
  Smartphone,
  Copy,
  Banknote,
  Fingerprint,
  Infinity,
  Snowflake,
  Check,
  FileText,
  Clock,
  Printer,
  // Added Gift icon to fix "Cannot find name 'Gift'" error on line 166
  Gift
} from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { SAAS_PLANS, DEFAULT_LOGO_URL } from '../constants';
import { MasterService } from '../services/masterService';

interface SaaSManagerProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
  isMasterMode?: boolean; 
  clientData?: SaaSClient | null;
}

const MONTHS = [
  { id: '01', name: 'Jan' }, { id: '02', name: 'Fev' }, { id: '03', name: 'Mar' },
  { id: '04', name: 'Abr' }, { id: '05', name: 'Mai' }, { id: '06', name: 'Jun' },
  { id: '07', name: 'Jul' }, { id: '08', name: 'Ago' }, { id: '09', name: 'Set' },
  { id: '10', name: 'Out' }, { id: '11', name: 'Nov' }, { id: '12', name: 'Dez' },
];

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const PixIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size * 0.45} viewBox="0 0 70 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`inline-block select-none ${className}`}><text x="0" y="26" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="bold" fill="#777777" letterSpacing="-1.5">p<tspan dx="1">ı</tspan><tspan dx="1">x</tspan></text><circle cx="23.5" cy="5.5" r="4" fill="#32BCAD" /></svg>
);

export const SaaSManager: React.FC<SaaSManagerProps> = ({ config, onUpdateConfig, isMasterMode = false, clientData }) => {
  const [showPayModal, setShowPayModal] = useState(false);
  const currentYear = new Date().getFullYear();
  
  const [masterData, setMasterData] = useState({ email: 'rodrigo@dev.com', whatsapp: '', pixKey: 'Não configurado', bankDetails: 'Não configurado' });

  useEffect(() => {
    const loadMasterCredentials = async () => {
      try {
        const creds = await MasterService.getMasterCredentials();
        setMasterData(creds);
      } catch (e) {
        console.error("Failed to load master credentials", e);
      }
    };
    loadMasterCredentials();
  }, []);

  const [license, setLicense] = useState<SystemLicense>(config.license || {
    status: 'active', expirationDate: format(new Date(), 'yyyy-12-31'), planName: SAAS_PLANS[0], supportContact: masterData.email, paymentLink: '#'
  });

  const formattedClientId = useMemo(() => license.clientId?.toUpperCase() || '---', [license.clientId]);
  const isVitalicio = license.expirationDate === '2099-12-31' || (license.planName || '').toLowerCase().includes('vitalício');
  const isFrozen = license.status === 'frozen';
  const isExpired = !isAfter(new Date(license.expirationDate + 'T12:00:00'), new Date());

  const handleSave = () => {
    if (!isMasterMode) return;
    onUpdateConfig({ ...config, license: license });
    alert('As configurações de aluguel deste terreiro foram salvas com sucesso!');
  };

  const handleWhatsApp = () => {
    const phone = masterData.whatsapp?.replace(/\D/g, '') || '';
    if (!phone) { alert("O contato de suporte ainda não foi configurado pelo desenvolvedor."); return; }
    const message = `Olá, sou administrador do terreiro ${config.systemName} (ID: ${formattedClientId}) e gostaria de suporte sobre minha assinatura.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    if (!text || text === 'Não configurado') return;
    navigator.clipboard.writeText(text.toUpperCase());
    alert('ID copiado com sucesso!');
  };

  const handleExportHistory = () => {
    alert("Gerando extrato detalhado de pagamentos para o ano de " + currentYear + "... O download começará em instantes.");
  };

  if (!isMasterMode) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-10 bg-indigo-900 text-white text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden border border-white/30">
               <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain p-2" alt="Logo do Sistema" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tight">Detalhes da Assinatura</h3>
            <p className="text-indigo-300 font-medium mt-1">Gerencie seu contrato do {config.systemName}</p>
          </div>

          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano Atual</p>
               <div className="flex items-center justify-center gap-2">{isVitalicio && <Infinity size={20} className="text-indigo-600" />}<p className="text-xl font-black text-indigo-600">{license.planName}</p></div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
               <div className="flex items-center justify-center gap-2">{isFrozen ? (<Snowflake size={20} className="text-blue-500 animate-pulse" />) : (<div className={`w-2 h-2 rounded-full ${license.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />)}<p className={`text-xl font-black uppercase ${isFrozen ? 'text-blue-500' : license.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>{isFrozen ? 'CONGELADO' : license.status}</p></div>
            </div>
            <div className="p-6 bg-indigo-50 border-2 border-indigo-100 rounded-3xl text-center space-y-2 relative overflow-hidden group">
               <div className="absolute -top-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity"><Fingerprint size={80} className="text-indigo-400" /></div>
               <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">ID de Cliente</p>
               <div className="flex flex-col items-center"><p className="text-xl font-black font-mono tracking-tighter text-indigo-900">ID: <span className="text-red-600">{formattedClientId}</span></p><button onClick={() => license.clientId && copyToClipboard(license.clientId)} className="text-[8px] font-black uppercase text-indigo-400 mt-1 hover:underline flex items-center gap-1"><Copy size={8} /> Copiar ID</button></div>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimento</p>
               <div className="flex items-center justify-center gap-2">{isVitalicio && <Infinity size={18} className="text-emerald-600" />}<p className={`text-xl font-black ${isVitalicio ? 'text-emerald-600' : isExpired ? 'text-red-600' : 'text-slate-800'}`}>{isVitalicio ? 'VITALÍCIO' : new Date(license.expirationDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p></div>
            </div>
          </div>

          {/* TABELA DE PAGAMENTOS (ESTILO MENSALIDADE MÉDIUNS) */}
          <div className="px-10 mb-10">
             <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-6 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><Calendar size={20} /></div>
                      <div>
                         <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Histórico de Quitação SaaS</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Ciclo de Pagamento {currentYear}</p>
                      </div>
                   </div>
                   <button 
                     onClick={handleExportHistory}
                     className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-indigo-600 font-black text-[10px] uppercase shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
                   >
                      <Printer size={14} /> Baixar Extrato
                   </button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-center border-collapse">
                      <thead>
                         <tr className="bg-gray-100/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {MONTHS.map(m => <th key={m.id} className="py-4 px-2">{m.name}</th>)}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         <tr>
                            {MONTHS.map(m => {
                               const monthKey = `${currentYear}-${m.id}`;
                               const status = clientData?.payments?.[monthKey] || 'unpaid';
                               return (
                                  <td key={m.id} className="py-6 px-1">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all duration-700 border-2 ${
                                       status === 'paid' ? 'bg-emerald-100 border-emerald-500 text-emerald-600 shadow-md scale-110' :
                                       status === 'justified' ? 'bg-amber-100 border-amber-500 text-amber-600 shadow-sm' :
                                       'bg-gray-50 border-gray-100 text-gray-200'
                                     }`}>
                                        {status === 'paid' ? <Check size={20} strokeWidth={4} /> : status === 'justified' ? <Gift size={16} strokeWidth={3} /> : <Clock size={16} strokeWidth={2} />}
                                     </div>
                                  </td>
                               );
                            })}
                         </tr>
                      </tbody>
                   </table>
                </div>
                <div className="p-4 bg-indigo-50/50 flex justify-center gap-6">
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /><span className="text-[8px] font-black text-slate-500 uppercase">Confirmado</span></div>
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500" /><span className="text-[8px] font-black text-slate-500 uppercase">Cortesia / Bônus</span></div>
                   <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-gray-200" /><span className="text-[8px] font-black text-slate-500 uppercase">Aguardando</span></div>
                </div>
             </div>
          </div>

          <div className="px-10 mb-6">
             <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <p className="text-sm font-black text-amber-800 uppercase tracking-tight">Aviso: Ao entrar em contato com o suporte, forneça seu ID de cliente (<span className="text-red-600">{formattedClientId}</span>) para agilizar seu atendimento.</p>
             </div>
          </div>

          <div className="px-10 pb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => setShowPayModal(true)} className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-5 hover:scale-[1.02] transition-all text-left"><div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><CreditCard size={24} /></div><div><p className="text-sm font-black text-emerald-800 uppercase leading-none mb-1">Regularizar Plano</p><p className="text-xs text-emerald-600 font-medium">Ver dados de pagamento (PIX / Banco)</p></div></button>
             <button onClick={handleWhatsApp} className="p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-5 hover:scale-[1.02] transition-all text-left"><div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><WhatsAppIcon size={24} /></div><div><p className="text-sm font-black text-indigo-800 uppercase leading-none mb-1">Falar com Suporte</p><p className="text-xs text-indigo-600 font-medium">Atendimento prioritário via WhatsApp</p></div></button>
          </div>
        </div>

        {showPayModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
               <div className="p-8 bg-emerald-600 text-white flex justify-between items-center"><div className="flex items-center gap-3"><Banknote className="text-white" size={24} /><h3 className="text-xl font-black uppercase tracking-tight">Dados de Pagamento</h3></div><button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-black/20 rounded-full"><X size={24} /></button></div>
               <div className="p-8 space-y-8"><div className="space-y-4"><div className="flex items-center justify-between"><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chave PIX</h4><button onClick={() => copyToClipboard(masterData.pixKey)} className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:underline"><Copy size={10} /> Copiar Chave</button></div><div className="p-4 bg-gray-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-4"><div className="p-2 flex items-center justify-center overflow-hidden shrink-0"><PixIcon size={80} /></div><p className="font-black text-slate-700 break-all">{masterData.pixKey}</p></div></div><div className="space-y-4"><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Depósito / Transferência</h4><div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-4"><Landmark className="text-indigo-400 mt-1" size={20} /><pre className="font-sans text-sm font-bold text-slate-600 whitespace-pre-wrap">{masterData.bankDetails}</pre></div></div><div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100"><p className="text-xs text-indigo-700 font-medium text-center">Após efetuar o pagamento, envie o comprovante informando seu ID <span className="text-red-600 font-bold">{formattedClientId}</span>.</p></div><button onClick={() => setShowPayModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Entendi, fechar</button></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex items-center justify-between"><div className="flex items-center gap-4"><div className="p-3 bg-amber-50 rounded-2xl shadow-lg shadow-amber-500/30"><ShieldCheck size={32} /></div><div><h3 className="text-2xl font-black uppercase tracking-tight">Painel Master (Rodrigo)</h3></div></div><button onClick={handleSave} className="px-8 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"><Save size={18} /> Salvar Edições</button></div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12"><div className="space-y-6"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Lock size={14} className="text-amber-500" /> Controle de Acesso</h4><div className="space-y-4"><div><label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Status</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setLicense({...license, status: 'active'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${license.status === 'active' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>Ativo</button><button onClick={() => setLicense({...license, status: 'expired'})} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${license.status === 'expired' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>Expirado</button></div></div><div><label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Vencimento</label><input type="date" className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={license.expirationDate} onChange={e => setLicense({...license, expirationDate: e.target.value})} /></div><div><label className="block text-xs font-black text-slate-500 uppercase mb-1 ml-1">ID Cliente</label><div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 font-mono text-xs font-bold text-indigo-900">ID: <span className="text-red-600">{formattedClientId}</span></div></div></div></div><div className="space-y-6"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} className="text-amber-500" /> Plano</h4><div className="space-y-4"><div><label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Plano</label><select className="w-full p-3 bg-slate-50 border border-gray-200 rounded-2xl font-bold outline-none" value={license.planName} onChange={e => setLicense({...license, planName: e.target.value})}>{SAAS_PLANS.map(plan => (<option key={plan} value={plan}>{plan}</option>))}</select></div><div><label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Checkout</label><input type="text" className="w-full p-3 bg-slate-50 border border-gray-200 rounded-2xl font-mono text-xs" value={license.paymentLink} onChange={e => setLicense({...license, paymentLink: e.target.value})} /></div><div><label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">E-mail Notif.</label><input type="email" className="w-full p-3 bg-slate-50 border border-gray-200 rounded-2xl font-bold" value={license.supportContact} onChange={e => setLicense({...license, supportContact: e.target.value})} /></div></div></div></div>
      </div>
    </div>
  );
};
