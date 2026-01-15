
import React, { useMemo, useState } from 'react';
import { InventoryItem, InventoryCategory, SystemConfig } from '../types';
import { 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3, 
  Box,
  Printer,
  FileText,
  X,
  ShoppingCart,
  ArrowDownCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { DEFAULT_LOGO_URL } from '../constants';

interface InventoryDashboardProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  config: SystemConfig;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ items, categories, config }) => {
  const [showReport, setShowReport] = useState(false);

  const stats = useMemo(() => {
    const critical = items.filter(i => i.currentStock < i.minStock).length;
    const warning = items.filter(i => i.currentStock >= i.minStock && i.currentStock <= i.minStock * 1.3).length;
    const healthy = items.length - critical - warning;

    return { critical, warning, healthy, total: items.length };
  }, [items]);

  const getItemStatus = (item: InventoryItem) => {
    if (item.currentStock < item.minStock) return { color: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-600', icon: AlertTriangle, label: 'Crítico' };
    if (item.currentStock <= item.minStock * 1.3) return { color: 'bg-amber-400', border: 'border-amber-400', text: 'text-amber-600', icon: AlertCircle, label: 'Alerta' };
    return { color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', icon: CheckCircle2, label: 'Seguro' };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #inventory-print-area, #inventory-print-area * { visibility: visible; }
          #inventory-print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 20px;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sumário Executivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-gray-800">{stats.total}</p>
            <Package size={16} className="text-indigo-400" />
          </div>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col gap-1">
          <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Crítico</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-rose-700">{stats.critical}</p>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col gap-1">
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Alerta</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-amber-700">{stats.warning}</p>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col gap-1">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Seguro</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black text-emerald-700">{stats.healthy}</p>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md"><BarChart3 size={16} /></div>
             <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Monitoramento de Níveis</h3>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
             >
                <ShoppingCart size={14} /> Gerar Lista de Compras
             </button>
             <div className="hidden sm:flex gap-4 border-l border-gray-200 pl-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[8px] font-black text-gray-400 uppercase">Crítico</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[8px] font-black text-gray-400 uppercase">Alerta</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-black text-gray-400 uppercase">Seguro</span></div>
             </div>
          </div>
        </div>

        <div className="p-6 space-y-10">
           {categories.map(cat => {
             const catItems = items.filter(i => i.categoryId === cat.id);
             if (catItems.length === 0) return null;

             return (
               <div key={cat.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-indigo-600 rounded-full" />
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.name}</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                     {catItems.map(item => {
                       const status = getItemStatus(item);
                       const StatusIcon = status.icon;
                       const percentage = Math.min((item.currentStock / (item.minStock * 2 || 1)) * 100, 100);

                       return (
                         <div key={item.id} className="group p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all">
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2 overflow-hidden">
                                  <div className={`p-0.5 rounded-lg bg-white shadow-xs border-2 ${status.border} w-10 h-10 shrink-0 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110`}>
                                     {item.imageUrl ? (
                                       <img src={item.imageUrl} className="w-full h-full object-cover" />
                                     ) : (
                                       <div className={status.text}><StatusIcon size={14} /></div>
                                     )}
                                  </div>
                                  <div className="overflow-hidden">
                                     <p className="font-black text-gray-800 text-[11px] uppercase truncate" title={item.name}>{item.name}</p>
                                     <p className="text-[8px] font-bold text-gray-400 uppercase">{item.unit} • Mín: {item.minStock}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className={`text-sm font-black leading-none ${status.text}`}>{item.currentStock}</p>
                               </div>
                            </div>
                            
                            <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                               <div 
                                 className={`h-full rounded-full transition-all duration-700 ease-out ${status.color}`}
                                 style={{ width: `${Math.max(percentage, 5)}%` }}
                               />
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
             );
           })}

           {items.length === 0 && (
             <div className="py-20 text-center flex flex-col items-center gap-3">
                <Box size={40} className="text-gray-200" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum item em estoque</p>
             </div>
           )}
        </div>
      </div>

      {/* Modal de Lista de Compras */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                     <FileText size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Lista de Compras / Reposição</h3>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Planejamento de estoque baseado em níveis mínimos</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={handlePrint}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-200"
                  >
                     <Printer size={18} /> Imprimir Lista
                  </button>
                  <button 
                    onClick={() => setShowReport(false)}
                    className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-gray-600 rounded-2xl transition-all"
                  >
                     <X size={20} />
                  </button>
               </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
              <div id="inventory-print-area" className="bg-white p-0 md:p-8 rounded-3xl border border-gray-100 shadow-inner">
                {/* Header Impressão */}
                <div className="hidden print:flex justify-between items-center mb-8 border-b-2 border-gray-100 pb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-2">
                        <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                      </div>
                      <div>
                         <h1 className="text-2xl font-black uppercase tracking-tight">{config.systemName}</h1>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Reposição de Estoque</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400">Data do Relatório</p>
                      <p className="text-xs font-bold">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                   </div>
                </div>

                <div className="space-y-8">
                  {categories.map(cat => {
                    const catItems = items.filter(i => i.categoryId === cat.id);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-l-4 border-black pl-3">{cat.name}</h4>
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-100 text-[10px] font-black uppercase text-gray-400">
                              <th className="py-3 px-2">Item</th>
                              <th className="py-3 px-2 text-center">Unidade</th>
                              <th className="py-3 px-2 text-center">Atual</th>
                              <th className="py-3 px-2 text-center">Mínimo</th>
                              <th className="py-3 px-2 text-right">Sugestão de Compra</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {catItems.map(item => {
                              const needsRestock = item.currentStock < item.minStock;
                              const status = getItemStatus(item);
                              const toBuy = Math.max(0, item.minStock - item.currentStock);

                              return (
                                <tr key={item.id} className={`${needsRestock ? 'bg-rose-50/50 print:bg-gray-50' : ''} group`}>
                                  <td className="py-3 px-2">
                                    <p className="font-bold text-gray-800 uppercase text-xs">{item.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                       <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                       <span className={`text-[9px] font-black uppercase ${status.text}`}>{status.label}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-center text-[10px] font-bold text-gray-400">{item.unit}</td>
                                  <td className={`py-3 px-2 text-center font-black ${needsRestock ? 'text-rose-600' : 'text-gray-600'}`}>{item.currentStock}</td>
                                  <td className="py-3 px-2 text-center text-gray-400 font-bold">{item.minStock}</td>
                                  <td className="py-3 px-2 text-right">
                                     {toBuy > 0 ? (
                                       <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-sm print:shadow-none print:border print:border-black print:text-black">
                                          <ShoppingCart size={10} className="print:hidden" />
                                          <span className="text-[11px] font-black uppercase">Repor {toBuy} {item.unit}</span>
                                       </div>
                                     ) : (
                                       <span className="text-[10px] font-black text-emerald-500 uppercase">Em conformidade</span>
                                     )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>

                {/* Rodapé Relatório */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                   <p>{config.systemName} - Módulo de Estoque</p>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Reposição Urgente</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> Reposição Preventiva</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
