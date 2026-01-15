
import React, { useState } from 'react';
import { Referral, SystemConfig, SaaSClient } from '../types';
import { 
  UserRoundPlus, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  ExternalLink,
  Award,
  TrendingUp,
  Gift,
  FileText,
  X,
  Info,
  ShieldAlert,
  MessageSquareOff
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DEFAULT_LOGO_URL } from '../constants';

interface AffiliateSystemProps {
  config: SystemConfig;
  referrals: Referral[];
}

export const AffiliateSystem: React.FC<AffiliateSystemProps> = ({ config, referrals }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTableFilter, setActiveTableFilter] = useState<'todos' | 'aguardando' | 'aprovada' | 'reprovada'>('todos');
  
  const affiliateLink = config.license?.affiliateLink || "Link não gerado";
  const isBlocked = config.license?.affiliateBlocked;

  const myReferrals = referrals;

  const stats = {
    total: myReferrals.length,
    approved: myReferrals.filter(r => r.status === 'aprovada').length,
    pending: myReferrals.filter(r => r.status === 'aguardando').length,
    rejected: myReferrals.filter(r => r.status === 'reprovada').length,
  };

  const filteredList = myReferrals.filter(r => 
    activeTableFilter === 'todos' ? true : r.status === activeTableFilter
  );

  const handleCopyLink = () => {
    if (isBlocked) return;
    navigator.clipboard.writeText(affiliateLink);
    alert("Link de indicação copiado para a área de transferência!");
  };

  const handleShare = async () => {
    if (isBlocked) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sistema ${config.systemName}`,
          text: `Olá! Estou usando o sistema ${config.systemName} para gerir meu terreiro e recomendo. Confira através do meu link:`,
          url: affiliateLink,
        });
      } catch (err) {
        console.error("Erro ao compartilhar", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const formatSafe = (dateVal: string | Date, pattern: string) => {
    if (!dateVal) return '---';
    const d = new Date(dateVal);
    if (!isValid(d)) return '---';
    return format(d, pattern, { locale: ptBR });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[3rem] border-4 border-red-500/10 shadow-2xl animate-in zoom-in duration-500">
         <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-red-100 animate-bounce">
            <ShieldAlert size={48} />
         </div>
         <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter text-center mb-3">Programa de Afiliados Suspenso</h3>
         <p className="text-slate-500 font-medium text-center max-w-lg mb-8 leading-relaxed">Identificamos uma violação nas diretrizes de indicação ou um comportamento incomum em sua conta. Por motivos de segurança, sua capacidade de gerar novos leads foi temporariamente desativada.</p>
         <button onClick={() => window.open(`mailto:${config.license?.supportContact}`)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Falar com Suporte Master</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #affiliate-print-area, #affiliate-print-area * { visibility: visible; }
          #affiliate-print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 1.5cm;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 bg-[#ADFF2F]/10 border-b border-[#ADFF2F]/20 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-[#ADFF2F] rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-[#ADFF2F]/20 shrink-0">
             <UserRoundPlus size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Programa de Afiliados</h3>
             <p className="text-slate-500 font-medium max-w-xl">Compartilhe seu link exclusivo com outros terreiros. Para cada novo terreiro que assinar através do seu link, você ganha <strong>1 mês de mensalidade grátis</strong>!</p>
          </div>
          <button onClick={() => setShowPrintModal(true)} className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase text-slate-500 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><Printer size={18} /> Ver Indicações</button>
        </div>
        
        <div className="p-10">
           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Seu Link Personalizado</p>
                 <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-sm text-indigo-600 break-all select-all">{affiliateLink}</div>
              </div>
              <div className="flex gap-3 w-full md:w-auto shrink-0">
                 <button onClick={handleCopyLink} className="flex-1 md:flex-none p-4 bg-white border border-gray-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all shadow-sm flex flex-col items-center gap-1"><Copy size={20} /><span className="text-[9px] font-black uppercase">Copiar</span></button>
                 <button onClick={handleShare} className="flex-1 md:flex-none p-4 bg-[#ADFF2F] text-slate-900 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#ADFF2F]/20 flex flex-col items-center gap-1"><Share2 size={20} /><span className="text-[9px] font-black uppercase">Enviar</span></button>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-8 py-5">Terreiro Indicado</th>
                     <th className="px-8 py-5">Data da Indicação</th>
                     <th className="px-8 py-5 text-center">Status</th>
                     <th className="px-8 py-5 text-right">Recompensa</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredList.length > 0 ? [...filteredList].reverse().map(referral => (
                     <tr key={referral.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                           <p className="font-bold text-slate-800 text-sm">{referral.targetName}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Registro via Link</p>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500">
                           {formatSafe(referral.createdAt, 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                              referral.status === 'aprovada' ? 'bg-emerald-100 text-emerald-700' :
                              referral.status === 'reprovada' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700 animate-pulse'
                           }`}>
                              {referral.status}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           {referral.status === 'aprovada' ? (<div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase"><Gift size={12} /> +1 Mês Grátis</div>) : (<span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">---</span>)}
                        </td>
                     </tr>
                  )) : (
                     <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm">Nenhuma indicação encontrada.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex flex-col z-[120] animate-in fade-in duration-300 no-print">
          <header className="p-6 border-b border-white/10 flex justify-between items-center text-white">
             <div className="flex items-center gap-4"><div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><FileText size={24} /></div><div><h3 className="text-xl font-black uppercase tracking-tighter">Relatório de Afiliado</h3></div></div>
             <button onClick={() => setShowPrintModal(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase text-xs">Voltar</button>
          </header>
          <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-900/50">
             <div id="affiliate-print-area" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] p-12 flex flex-col font-serif text-black shadow-2xl">
                <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
                   <div className="flex items-center gap-6"><img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-20 h-20 object-contain" /><div><h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">{config.systemName}</h1><p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Relatório de Indicações</p></div></div>
                </div>
                <div className="flex-1">
                   <table className="w-full text-left text-xs border-collapse">
                      <thead><tr className="border-b border-black"><th className="py-2 px-1 uppercase font-black">Data/Hora</th><th className="py-2 px-1 uppercase font-black">Terreiro / Entidade</th><th className="py-2 px-1 uppercase font-black text-center">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{myReferrals.map((r, i) => (<tr key={i}><td className="py-3 font-mono text-[10px]">{formatSafe(r.createdAt, 'dd/MM/yyyy HH:mm')}</td><td className="py-3 font-bold uppercase">{r.targetName}</td><td className="py-3 text-center"><span className="uppercase text-[9px] font-black">{r.status}</span></td></tr>))}</tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
