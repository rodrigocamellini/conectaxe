
import React, { useState } from 'react';
import { Member, SystemConfig, Donation } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  Home,
  Droplets,
  Zap,
  Wifi,
  Phone,
  Wand2,
  Flame,
  Wine,
  Clock,
  AlertCircle,
  Eye,
  X,
  Printer,
  FileText,
  CheckCircle2,
  MinusCircle,
  Heart,
  Info,
  UserCheck,
  PieChart,
  Target,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DEFAULT_LOGO_URL } from '../constants';

interface FinancialReportsProps {
  members: Member[];
  donations: Donation[];
  config: SystemConfig;
}

const MONTHS = [
  { id: '01', name: 'Janeiro' },
  { id: '02', name: 'Fevereiro' },
  { id: '03', name: 'Março' },
  { id: '04', name: 'Abril' },
  { id: '05', name: 'Maio' },
  { id: '06', name: 'Junho' },
  { id: '07', name: 'Julho' },
  { id: '08', name: 'Agosto' },
  { id: '09', name: 'Setembro' },
  { id: '10', name: 'Outubro' },
  { id: '11', name: 'Novembro' },
  { id: '12', name: 'Dezembro' },
];

export const FinancialReports: React.FC<FinancialReportsProps> = ({ members, donations, config }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [showPreview, setShowPreview] = useState(false);

  const currentMonthKey = `${selectedYear}-${selectedMonth}`;
  const payers = members.filter(m => m.isMedium || m.isCambone);
  
  const memberIncome = payers.reduce((acc, member) => {
    const status = member.monthlyPayments?.[currentMonthKey] || 'unpaid';
    const values = [];
    if (member.isMedium) values.push(config.financialConfig.mediumValue);
    if (member.isCambone) values.push(config.financialConfig.camboneValue);
    const value = values.length > 0 ? Math.max(...values) : 0;

    if (status === 'paid') {
      acc.paidCount += 1;
      acc.totalCollected += value;
      acc.paidMembers.push({ name: member.name, value, status: 'Pago' });
    } else if (status === 'justified') {
      acc.justifiedCount += 1;
      acc.totalJustified += value;
      acc.unpaidMembers.push({ name: member.name, value, status: 'Justificado' });
    } else {
      acc.pendingCount += 1;
      acc.totalPending += value;
      acc.unpaidMembers.push({ name: member.name, value, status: 'Pendente' });
    }
    acc.totalExpected += value;
    return acc;
  }, { 
    paidCount: 0, 
    pendingCount: 0, 
    justifiedCount: 0,
    totalCollected: 0, 
    totalPending: 0, 
    totalJustified: 0,
    totalExpected: 0,
    paidMembers: [] as any[],
    unpaidMembers: [] as any[]
  });

  const monthDonations = donations.filter(d => d.type === 'money' && d.date.startsWith(currentMonthKey));
  const totalDonationsAmount = monthDonations.reduce((acc, d) => acc + (d.value || 0), 0);
  const totalArrecadado = memberIncome.totalCollected + totalDonationsAmount;
  const fixedExpenses = config.financialConfig.fixedExpenses || [];
  const totalFixedExpenses = fixedExpenses.reduce((acc, exp) => acc + exp.value, 0);
  const netBalance = totalArrecadado - totalFixedExpenses;
  const collectionRate = memberIncome.totalExpected > 0 ? (memberIncome.totalCollected / memberIncome.totalExpected) * 100 : 0;

  const toggleYear = (direction: 'prev' | 'next') => setSelectedYear(prev => direction === 'next' ? prev + 1 : prev - 1);
  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #financial-print-area, #financial-print-area * { visibility: visible; }
          #financial-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 1.5cm; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><PieChart size={240} /></div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl shadow-inner border border-white/30"><Target size={40} className="text-[#ADFF2F]" /></div>
           <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Dashboard Financeiro Real</h2>
              <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs">Ano Base {selectedYear} • Gestão Profissional</p>
           </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-4 items-center">
           <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
              <button onClick={() => toggleYear('prev')} className="p-2 hover:bg-white/20 rounded-xl transition-all"><ChevronLeft size={20} /></button>
              <span className="px-6 font-black text-white text-lg">{selectedYear}</span>
              <button onClick={() => toggleYear('next')} className="p-2 hover:bg-white/20 rounded-xl transition-all"><ChevronRight size={20} /></button>
           </div>
           <select 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white/10 backdrop-blur-md font-black text-white outline-none cursor-pointer text-lg p-3 rounded-2xl border border-white/10 appearance-none"
           >
             {MONTHS.map(m => <option key={m.id} value={m.id} className="text-slate-800">{m.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col justify-between group hover:border-emerald-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
               <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Entradas</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrecadação Total</p>
               <h3 className="text-3xl font-black text-slate-800">R$ {totalArrecadado.toFixed(2)}</h3>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col justify-between group hover:border-rose-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown size={24} /></div>
               <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-3 py-1 rounded-full uppercase">Saídas</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gastos Operacionais</p>
               <h3 className="text-3xl font-black text-slate-800">R$ {totalFixedExpenses.toFixed(2)}</h3>
            </div>
         </div>
         <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col justify-between transition-all ${netBalance >= 0 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-white/20 rounded-2xl"><ShieldCheck size={24} /></div>
               <span className="text-[10px] font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase">Status</span>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Saldo em Caixa</p>
               <h3 className="text-3xl font-black">R$ {netBalance.toFixed(2)}</h3>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col justify-between group hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Layers size={24} /></div>
               <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">Performance</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxa de Adimplência</p>
               <h3 className="text-3xl font-black text-slate-800">{Math.round(collectionRate)}%</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">Composição de Receita</h3>
          <div className="relative w-72 h-72 mb-8">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-gray-100" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-indigo-600" strokeWidth="4" strokeDasharray={`${(memberIncome.totalCollected / totalArrecadado) * 100 || 0} 100`} />
              <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-[#ADFF2F]" strokeWidth="4" strokeDasharray={`${(totalDonationsAmount / totalArrecadado) * 100 || 0} 100`} strokeDashoffset={`-${(memberIncome.totalCollected / totalArrecadado) * 100 || 0}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-black text-slate-800">R$ {totalArrecadado.toFixed(0)}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Bruto</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-4">
             <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 text-center"><p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Mensalidades</p><p className="text-xl font-black text-slate-800">R$ {memberIncome.totalCollected.toFixed(2)}</p></div>
             <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 text-center"><p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Doações</p><p className="text-xl font-black text-slate-800">R$ {totalDonationsAmount.toFixed(2)}</p></div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">Análise de Fluxo Líquido</h3>
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
               <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-500 uppercase">Receita Operacional</span><span className="font-black text-emerald-600">+ R$ {totalArrecadado.toFixed(2)}</span></div>
               <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-500 uppercase">Gastos Fixos Mensais</span><span className="font-black text-rose-600">- R$ {totalFixedExpenses.toFixed(2)}</span></div>
               <div className="h-px bg-gray-200" />
               <div className="flex justify-between items-center"><span className="text-lg font-black text-slate-800 uppercase">Margem Livre</span><span className={`text-xl font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {netBalance.toFixed(2)}</span></div>
            </div>
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col items-center text-center gap-4 shadow-xl">
               <div className="p-3 bg-white/20 rounded-2xl"><Info size={24} /></div>
               <p className="text-sm font-medium leading-relaxed">Você precisa de pelo menos <strong>R$ {totalFixedExpenses.toFixed(2)}</strong> todos os meses para manter as portas abertas sem depender de doações externas.</p>
               <button onClick={() => setShowPreview(true)} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"><Eye size={18} /> Ver Relatório para Impressão</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
