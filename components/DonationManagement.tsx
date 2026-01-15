
import React, { useState } from 'react';
import { Donation, InventoryItem, SystemConfig } from '../types';
import { 
  Heart, 
  DollarSign, 
  Package, 
  Calendar, 
  User, 
  Trash2, 
  Plus, 
  Info, 
  CheckCircle2, 
  X, 
  Printer, 
  FileText, 
  History as LucideHistory 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { DEFAULT_LOGO_URL } from '../constants';

interface DonationManagementProps {
  donations: Donation[];
  inventoryItems: InventoryItem[];
  config: SystemConfig;
  onAddDonation: (donation: Partial<Donation>) => void;
  onDeleteDonation: (id: string) => void;
}

export const DonationManagement: React.FC<DonationManagementProps> = ({
  donations,
  inventoryItems,
  config,
  onAddDonation,
  onDeleteDonation
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<Donation>>({
    donorName: 'Anônimo',
    type: 'money',
    value: 0,
    itemId: '',
    quantity: 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDonation(formData);
    setShowModal(false);
    setFormData({
      donorName: 'Anônimo',
      type: 'money',
      value: 0,
      itemId: '',
      quantity: 1,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: ''
    });
  };

  const totalMoney = donations.filter(d => d.type === 'money').reduce((acc, d) => acc + (d.value || 0), 0);
  const selectedItem = inventoryItems.find(i => i.id === formData.itemId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #donation-print-area, #donation-print-area * { visibility: visible; }
          #donation-print-area { 
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
           <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Registro de Caridade</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Gerencie doações espontâneas</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowPrintPreview(true)}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase hover:bg-gray-50 transition-all"
          >
            <Printer size={16} /> Imprimir Relatório
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-8 py-3 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Plus size={18} /> Registrar Doação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
              <LucideHistory size={18} className="text-indigo-600" />
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Histórico de Doações</h4>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-gray-50/30 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-4">Doador / Data</th>
                       <th className="px-8 py-4">Tipo</th>
                       <th className="px-8 py-4">Conteúdo</th>
                       <th className="px-8 py-4 text-right">Ação</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {donations.length > 0 ? [...donations].reverse().map(donation => {
                       const item = inventoryItems.find(i => i.id === donation.itemId);
                       return (
                          <tr key={donation.id} className="hover:bg-indigo-50/20 transition-all group">
                             <td className="px-8 py-4">
                                <p className="font-bold text-gray-800 text-xs uppercase">{donation.donorName}</p>
                                <p className="text-[9px] text-gray-400 font-bold">{donation.date.split('-').reverse().join('/')}</p>
                             </td>
                             <td className="px-8 py-4">
                                {donation.type === 'money' ? (
                                   <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[8px] font-black uppercase">Dinheiro</span>
                                ) : (
                                   <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8px] font-black uppercase">Item</span>
                                )}
                             </td>
                             <td className="px-8 py-4">
                                {donation.type === 'money' ? (
                                   <p className="font-black text-emerald-600 text-xs">R$ {donation.value?.toFixed(2)}</p>
                                ) : (
                                   <p className="font-black text-indigo-600 text-xs uppercase">{donation.quantity} {item?.unit} {item?.name}</p>
                                )}
                             </td>
                             <td className="px-8 py-4 text-right">
                                <button 
                                   onClick={() => onDeleteDonation(donation.id)}
                                   className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                   <Trash2 size={14} />
                                </button>
                             </td>
                          </tr>
                       );
                    }) : (
                       <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-gray-400 italic text-xs">Sem registros.</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           {/* Card de Total Financeiro Atualizado com Ícone */}
           <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl flex items-center justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-2">Total Financeiro</p>
                <h2 className="text-3xl font-black">R$ {totalMoney.toFixed(2)}</h2>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm relative z-10 transform transition-transform group-hover:scale-110 duration-300">
                <DollarSign size={32} strokeWidth={3} />
              </div>
              {/* Círculo decorativo de fundo */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
           </div>

           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <Heart className="text-indigo-600" size={20} />
                 <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Importância</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">As doações espontâneas ajudam na manutenção da casa e nas ações de caridade da corrente.</p>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-6 bg-indigo-600 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
                 <h3 className="text-lg font-black uppercase tracking-tight">Nova Doação</h3>
                 <button onClick={() => setShowModal(false)} className="p-1 hover:bg-black/20 rounded-full transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button type="button" onClick={() => setFormData({...formData, type: 'money'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.type === 'money' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>Dinheiro</button>
                    <button type="button" onClick={() => setFormData({...formData, type: 'item'})} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${formData.type === 'item' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Item</button>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Doador</label>
                       <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 font-bold text-xs" value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} />
                    </div>
                    {formData.type === 'money' ? (
                       <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Valor (R$)</label>
                          <input type="number" step="0.01" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 font-black text-emerald-600" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Produto</label>
                             <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 font-bold text-xs" value={formData.itemId} onChange={e => setFormData({...formData, itemId: e.target.value})}>
                                <option value="">Selecione...</option>
                                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Quantidade</label>
                             <input type="number" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 font-black text-indigo-600" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                          </div>
                       </div>
                    )}
                 </div>
                 <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Salvar Doação</button>
              </form>
           </div>
        </div>
      )}

      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col z-[120] animate-in fade-in duration-300 no-print">
           <header className="p-6 border-b border-white/10 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-600 rounded-xl shadow-lg"><FileText size={20} /></div>
                 <h3 className="text-lg font-black uppercase">Relatório de Caridade</h3>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowPrintPreview(false)} className="px-4 py-2 border border-white/20 rounded-xl text-xs font-bold">Voltar</button>
                 <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 rounded-xl text-xs font-black uppercase">Imprimir</button>
              </div>
           </header>
           <div className="flex-1 overflow-y-auto p-12 flex justify-center">
              <div id="donation-print-area" className="bg-white w-full max-w-[21cm] p-12 shadow-2xl font-serif text-black border">
                 <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-8">
                    <h1 className="text-2xl font-black uppercase">{config.systemName}</h1>
                    <p className="text-xs font-bold uppercase">Relatório de Doações</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-100 rounded-xl border border-black/10">
                       <p className="text-[9px] font-black uppercase">Arrecadação Bruta</p>
                       <p className="text-xl font-black font-sans">R$ {totalMoney.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-xl border border-black/10 text-right">
                       <p className="text-[9px] font-black uppercase">Total de Registros</p>
                       <p className="text-xl font-black font-sans">{donations.length}</p>
                    </div>
                 </div>
                 <table className="w-full text-left text-[10px]">
                    <thead>
                       <tr className="border-b-2 border-black">
                          <th className="py-2">Data</th>
                          <th className="py-2">Doador</th>
                          <th className="py-2">Conteúdo</th>
                          <th className="py-2 text-right">Valor</th>
                       </tr>
                    </thead>
                    <tbody>
                       {donations.map((d, i) => {
                          const item = inventoryItems.find(it => it.id === d.itemId);
                          return (
                             <tr key={i} className="border-b border-black/5">
                                <td className="py-2">{d.date.split('-').reverse().join('/')}</td>
                                <td className="py-2 font-bold uppercase">{d.donorName}</td>
                                <td className="py-2 uppercase">{d.type === 'money' ? 'Dinheiro' : `${d.quantity} ${item?.unit} ${item?.name}`}</td>
                                <td className="py-2 text-right font-black">{d.type === 'money' ? `R$ ${d.value?.toFixed(2)}` : '---'}</td>
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
                 <div className="mt-auto pt-10 text-center text-[8px] font-black text-gray-300 uppercase tracking-widest italic">
                    Gerado pelo sistema em {format(new Date(), "dd/MM/yyyy HH:mm")}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
