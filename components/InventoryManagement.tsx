
import React, { useState, useRef } from 'react';
import { InventoryItem, InventoryCategory, StockLog, SystemConfig } from '../types';
import { Plus, Trash2, ChevronDown, AlertCircle, AlertTriangle, Camera, Upload, ImageIcon, History, Package, Search, Eye, Printer, X, ClipboardCheck, UserCircle } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DEFAULT_LOGO_URL } from '../constants';

interface InventoryManagementProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  logs: StockLog[];
  config: SystemConfig;
  onAddItem: (item: Partial<InventoryItem>) => void;
  onAddCategory: (name: string) => void;
  onDeleteItem: (id: string) => void;
}

const COMMON_UNITS = [
  { value: 'UN', label: 'Unidade' },
  { value: 'KG', label: 'Kilo (KG)' },
  { value: 'LT', label: 'Litro (LT)' },
  { value: 'PCT', label: 'Pacote' },
  { value: 'CX', label: 'Caixa' }
];

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  items,
  categories,
  logs,
  config,
  onAddItem,
  onAddCategory,
  onDeleteCategory,
  onDeleteItem
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedLogForView, setSelectedLogForView] = useState<StockLog | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '', unit: 'UN', minStock: 0, currentStock: 0, expiryDate: '', categoryId: '', responsible: '', imageUrl: ''
  });

  const getExpiryStatus = (dateStr: string) => {
    if (!dateStr) return 'ok';
    const diff = differenceInDays(new Date(dateStr), new Date());
    if (diff <= 1) return 'danger';
    if (diff <= 7) return 'warning';
    return 'ok';
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(formData);
    setShowItemModal(false);
    setFormData({ name: '', unit: 'UN', minStock: 0, currentStock: 0, expiryDate: '', categoryId: '', responsible: '', imageUrl: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintLog = () => {
    window.print();
  };

  const filteredLogs = logs.filter(l => 
    (l.itemName || '').toLowerCase().includes(logSearchQuery.toLowerCase()) || 
    (l.responsible || '').toLowerCase().includes(logSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-log-area, #print-log-area * { visibility: visible !important; }
          #print-log-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            padding: 2cm !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
      
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button onClick={() => setActiveTab('catalog')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Package size={14} /> Catálogo</button>
        <button onClick={() => setActiveTab('logs')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><History size={14} /> Logs de Movimentação</button>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Categorias</h3>
            <div className="flex gap-3 max-w-md">
              <input placeholder="Ex: VELAS, ERVAS..." className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-1 uppercase font-bold" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              <button onClick={() => { if(newCatName) { onAddCategory(newCatName.toUpperCase()); setNewCatName(''); } }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"><Plus size={20} /> Adicionar</button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Estoque</h3>
            <button onClick={() => setShowItemModal(true)} className="bg-indigo-600 text-white rounded-xl px-6 py-2.5 hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 font-black text-xs uppercase"><Plus size={20} /> Novo Produto</button>
          </div>

          {categories.map(cat => (
            <div key={cat.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-gray-800 uppercase tracking-widest flex items-center gap-2"><ChevronDown size={18} className="text-indigo-600" /> {cat.name}</h4>
                <button 
                  onClick={() => { 
                    const hasItems = items.some(i => i.categoryId === cat.id);
                    if (hasItems) {
                      alert('Não é possível excluir categoria com itens. Remova os itens primeiro.');
                      return;
                    }
                    if(window.confirm('Excluir categoria?')) onDeleteCategory(cat.id); 
                  }} 
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Excluir Categoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Produto</th>
                      <th className="px-6 py-3 font-semibold">Unidade</th>
                      <th className="px-6 py-3 font-semibold">Saldo</th>
                      <th className="px-6 py-3 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.filter(i => i.categoryId === cat.id).map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-3 font-bold">{item.name}</td>
                        <td className="px-6 py-3 text-gray-500 uppercase">{item.unit}</td>
                        <td className={`px-6 py-3 font-bold ${item.currentStock < item.minStock ? 'text-red-600' : ''}`}>{item.currentStock}</td>
                        <td className="px-6 py-3"><button onClick={() => onDeleteItem(item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><History size={24} /></div>
                 <div><h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Audit de Movimentações</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Histórico de entradas e saídas</p></div>
              </div>
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input placeholder="Buscar produto ou responsável..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-1 text-sm font-bold" value={logSearchQuery} onChange={e => setLogSearchQuery(e.target.value)} />
              </div>
           </div>

           <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <th className="px-8 py-5">Data / Hora</th>
                       <th className="px-8 py-5">Produto</th>
                       <th className="px-8 py-5 text-center">Tipo</th>
                       <th className="px-8 py-5 text-center">Movimentação</th>
                       <th className="px-8 py-5 text-center">Saldo</th>
                       <th className="px-8 py-5 text-right">Ação</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredLogs.map(log => (
                       <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-4 font-bold text-gray-500">{format(new Date(log.date), "dd/MM/yy HH:mm")}</td>
                          <td className="px-8 py-4 font-black text-gray-800 uppercase tracking-tighter">{log.itemName}</td>
                          <td className="px-8 py-4 text-center">
                             <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${log.type === 'entrada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{log.type}</span>
                          </td>
                          <td className={`px-8 py-4 text-center font-black ${log.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{log.change > 0 ? `+${log.change}` : log.change}</td>
                          <td className="px-8 py-4 text-center font-black text-indigo-600">{log.newStock}</td>
                          <td className="px-8 py-4 text-right">
                             <button onClick={() => setSelectedLogForView(log)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Eye size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {selectedLogForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300 border border-white/20">
              <div id="print-log-area" className="p-10 space-y-8 bg-white text-slate-900">
                 <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                       <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-16 h-16 object-contain" />
                       <div><h4 className="text-lg font-black uppercase tracking-tight">{config.systemName}</h4><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Comprovante de Movimentação</p></div>
                    </div>
                    <div className="text-right"><p className="text-[9px] font-black text-gray-400 uppercase">Data/Hora</p><p className="text-xs font-bold">{format(new Date(selectedLogForView.date), "dd/MM/yyyy HH:mm")}</p></div>
                 </div>

                 <div className="space-y-6">
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Produto</p><p className="text-xl font-black text-indigo-900 uppercase">{selectedLogForView.itemName}</p></div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 bg-gray-50 rounded-2xl text-center"><p className="text-[8px] font-black text-gray-400 uppercase">Anterior</p><p className="text-lg font-black">{selectedLogForView.previousStock}</p></div>
                       <div className="p-4 bg-indigo-50 rounded-2xl text-center"><p className="text-[8px] font-black text-indigo-600 uppercase">Variação</p><p className={`text-lg font-black ${selectedLogForView.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedLogForView.change > 0 ? `+${selectedLogForView.change}` : selectedLogForView.change}</p></div>
                       <div className="p-4 bg-slate-900 rounded-2xl text-center"><p className="text-[8px] font-black text-slate-400 uppercase">Final</p><p className="text-lg font-black text-[#ADFF2F]">{selectedLogForView.newStock}</p></div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl"><div className="p-2 bg-white rounded-lg"><UserCircle size={20} className="text-indigo-600" /></div><div><p className="text-[8px] font-black text-gray-400 uppercase">Operador</p><p className="text-sm font-black uppercase">{selectedLogForView.responsible}</p></div></div>
                 </div>
                 <div className="pt-6 border-t border-dashed border-gray-200 text-center"><p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Autenticação: {selectedLogForView.id.toUpperCase()}</p></div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4 no-print">
                 <button onClick={() => setSelectedLogForView(null)} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-xs text-gray-500 uppercase">Fechar</button>
                 <button onClick={handlePrintLog} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-2"><Printer size={16} /> Imprimir</button>
              </div>
           </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Novo Produto</h3><button onClick={() => setShowItemModal(false)} className="text-2xl">&times;</button></div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div><label className="text-xs font-black uppercase text-gray-400">Categoria</label><select required className="w-full p-2.5 border rounded-lg" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}><option value="">Selecione...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-xs font-black uppercase text-gray-400">Produto</label><input required className="w-full p-2.5 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-black uppercase text-gray-400">Unidade</label><select className="w-full p-2.5 border rounded-lg" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>{COMMON_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
                <div><label className="text-xs font-black uppercase text-gray-400">Estoque Mín.</label><input type="number" className="w-full p-2.5 border rounded-lg" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} /></div>
              </div>
              <div className="pt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowItemModal(false)} className="px-6 py-2 text-gray-400 font-bold uppercase text-xs">Cancelar</button><button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-black uppercase text-xs">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
