
import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import { Save, X, Search, Filter, ClipboardCheck, Package } from 'lucide-react';

interface InventoryEntryProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  onSaveUpdates: (updates: { id: string, currentStock: number }[]) => void;
}

export const InventoryEntry: React.FC<InventoryEntryProps> = ({
  items,
  categories,
  onSaveUpdates
}) => {
  const [localItems, setLocalItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    setLocalItems([...items]);
  }, [items]);

  const handleUpdateStock = (id: string, value: string) => {
    const numValue = Number(value);
    setLocalItems(prev => prev.map(i => i.id === id ? { ...i, currentStock: numValue } : i));
  };

  const handleSave = () => {
    const updates = localItems.map(i => ({ id: i.id, currentStock: i.currentStock }));
    onSaveUpdates(updates);
  };

  const handleDiscard = () => {
    setLocalItems([...items]);
  };

  const filteredItems = localItems.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCat || i.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><ClipboardCheck size={180} /></div>
         <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20"><Package size={32} className="text-[#ADFF2F]" /></div>
            <div>
               <h2 className="text-2xl font-black uppercase tracking-tight">Registro de Movimentação</h2>
               <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Atualize as quantidades em estoque e gere logs automáticos</p>
            </div>
         </div>
         <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleDiscard}
              className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase transition-all"
            >
              Descartar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none px-10 py-3 bg-[#ADFF2F] text-slate-900 rounded-xl text-xs font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar Alterações
            </button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar produto pelo nome..." 
              className="pl-12 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-1 font-black text-[10px] uppercase text-gray-500 min-w-[200px]"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            <option value="">Todas Categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-20">
              <tr>
                <th className="px-8 py-5 border-r border-gray-100">Produto</th>
                <th className="px-6 py-5 border-r border-gray-100 text-center">Unidade</th>
                <th className="px-6 py-5 border-r border-gray-100 text-center">Estoque Mín.</th>
                <th className="px-6 py-5 border-r border-gray-100 w-48 text-center bg-indigo-50/30">Quantidade em Mãos</th>
                <th className="px-8 py-5">Responsável Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const stockLow = item.currentStock < item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-8 py-5 border-r border-gray-100">
                        <div className="font-black text-slate-800 text-xs uppercase tracking-tight">{item.name}</div>
                        <div className="text-[9px] uppercase text-indigo-400 font-black tracking-widest mt-0.5">{categories.find(c => c.id === item.categoryId)?.name}</div>
                      </td>
                      <td className="px-6 py-5 border-r border-gray-100 text-center text-gray-500 font-bold uppercase text-[10px]">{item.unit}</td>
                      <td className="px-6 py-5 border-r border-gray-100 text-center text-gray-400 font-bold">{item.minStock}</td>
                      <td className={`px-6 py-5 border-r border-gray-100 w-48 ${stockLow ? 'bg-yellow-50/50' : 'bg-indigo-50/10'}`}>
                        <div className="relative group/input">
                           <input 
                             type="number" 
                             className={`w-full p-3 text-center border-2 rounded-2xl font-black text-lg outline-none transition-all shadow-inner ${
                               stockLow 
                                 ? 'border-yellow-400 bg-white text-yellow-800 focus:ring-yellow-500' 
                                 : 'border-transparent bg-white text-indigo-900 focus:ring-indigo-500 focus:border-indigo-500 group-hover/input:border-indigo-100'
                             }`}
                             value={item.currentStock}
                             onChange={e => handleUpdateStock(item.id, e.target.value)}
                           />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-400 font-bold uppercase text-[9px]">{item.responsible || 'Geral'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center flex flex-col items-center gap-3">
                     <Package size={48} className="text-gray-200" />
                     <p className="text-gray-300 font-black uppercase text-sm tracking-[0.3em]">Item não localizado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
