
import React, { useState, useEffect } from 'react';
import { CanteenItem, CanteenOrder, SystemConfig, User } from '../types';
import { 
  ShoppingCart, 
  Coffee, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  History, 
  Package, 
  Save, 
  CreditCard, 
  DollarSign, 
  Zap,
  Clock,
  Printer,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface CanteenManagementProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: CanteenItem[];
  orders: CanteenOrder[];
  config: SystemConfig;
  user: User;
  onAddItem: (item: Partial<CanteenItem>) => void;
  onUpdateItem: (id: string, item: Partial<CanteenItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddOrder: (order: CanteenOrder) => void;
}

export const CanteenManagement: React.FC<CanteenManagementProps> = ({
  activeTab,
  setActiveTab,
  items,
  orders,
  config,
  user,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ item: CanteenItem; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'card'>('pix');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Partial<CanteenItem>>({ name: '', price: 0, stock: 0, category: 'Comida' });

  // PDV Logic
  const addToCart = (item: CanteenItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.item.id !== itemId));

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => i.item.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const cartTotal = cart.reduce((acc, i) => acc + (i.item.price * i.quantity), 0);

  const handleFinishOrder = () => {
    if (cart.length === 0) return;
    const newOrder: CanteenOrder = {
      id: `VDA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: cart.map(c => ({ itemId: c.item.id, name: c.item.name, quantity: c.quantity, price: c.item.price })),
      total: cartTotal,
      paymentMethod,
      date: new Date().toISOString(),
      responsible: user.name
    };
    onAddOrder(newOrder);
    setCart([]);
    alert("Venda finalizada com sucesso!");
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button onClick={() => setActiveTab('canteen-pdv')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'canteen-pdv' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Zap size={14} /> Caixa Rápido</button>
        <button onClick={() => setActiveTab('canteen-mgmt')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'canteen-mgmt' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Package size={14} /> Cardápio</button>
        <button onClick={() => setActiveTab('canteen-history')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'canteen-history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><History size={14} /> Vendas</button>
      </div>

      {activeTab === 'canteen-pdv' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <Search className="text-gray-400" size={18} />
              <input type="text" placeholder="Pesquisar no cardápio..." className="flex-1 outline-none text-sm font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[2rem] border-2 border-transparent hover:border-indigo-600 transition-all shadow-sm flex flex-col items-center text-center group active:scale-95">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform"><Coffee size={28} /></div>
                  <h4 className="text-[10px] font-black uppercase text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-xs font-black text-indigo-600 mt-1">R$ {item.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col sticky top-6">
             <div className="p-6 bg-indigo-900 text-white flex items-center justify-between"><div className="flex items-center gap-3"><ShoppingCart size={20} className="text-[#ADFF2F]" /><h3 className="text-sm font-black uppercase">Carrinho</h3></div><span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black">{cart.length} itens</span></div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center gap-4"><div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0"><Coffee size={16} className="text-gray-400" /></div><div className="flex-1 overflow-hidden"><p className="text-[10px] font-black uppercase text-gray-800 truncate">{item.name}</p><p className="text-[9px] font-bold text-gray-400 uppercase">R$ {item.price.toFixed(2)}</p></div><div className="flex items-center gap-2"><button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded"><Minus size={12} /></button><span className="text-xs font-black w-4 text-center">{quantity}</span><button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} /></button></div></div>
                ))}
             </div>
             <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4"><div className="flex justify-between items-end"><p className="text-[10px] font-black text-gray-400 uppercase">Total Geral</p><p className="text-3xl font-black text-indigo-900">R$ {cartTotal.toFixed(2)}</p></div><button onClick={handleFinishOrder} disabled={cart.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50 transition-all">Finalizar Venda</button></div>
          </div>
        </div>
      )}

      {activeTab === 'canteen-mgmt' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead><tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase"><th className="px-8 py-5">Produto</th><th className="px-8 py-5">Categoria</th><th className="px-8 py-5">Preço Unit.</th><th className="px-8 py-5 text-right">Ação</th></tr></thead><tbody className="divide-y divide-gray-50">{items.map(item => (<tr key={item.id} className="hover:bg-indigo-50/20 transition-all"><td className="px-8 py-4 font-black text-gray-800 uppercase text-xs">{item.name}</td><td className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">{item.category}</td><td className="px-8 py-4 font-black text-indigo-600 text-xs">R$ {item.price.toFixed(2)}</td><td className="px-8 py-4 text-right"><button onClick={() => onDeleteItem(item.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div>
      )}

      {activeTab === 'canteen-history' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead><tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase"><th className="px-8 py-4">Data / ID</th><th className="px-8 py-4">Operador</th><th className="px-8 py-4 text-right">Valor Total</th></tr></thead><tbody className="divide-y divide-gray-50">{[...orders].reverse().map(order => (<tr key={order.id} className="hover:bg-slate-50 transition-all"><td className="px-8 py-4"><p className="font-mono text-[10px] font-black text-indigo-600">#{order.id}</p><p className="text-[9px] font-bold text-gray-400">{format(new Date(order.date), 'dd/MM/yy HH:mm')}</p></td><td className="px-8 py-4 font-black text-gray-700 uppercase text-[10px]">{order.responsible}</td><td className="px-8 py-4 text-right font-black text-indigo-900 text-xs">R$ {order.total.toFixed(2)}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
};
