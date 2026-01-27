
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
  X,
  Edit,
  Image as ImageIcon,
  AlertTriangle
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
  onDeleteOrder: (id: string) => void;
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
  onAddOrder,
  onDeleteOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ item: CanteenItem; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Pix' | 'Cartão de Débito' | 'Cartão de Crédito'>('Pix');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CanteenItem>>({ name: '', price: 0, stock: 0, category: 'Comida', image: '' });

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
    setCart(prev => {
      return prev.map(i => {
        if (i.item.id === itemId) {
           const newQuantity = i.quantity + delta;
           if (newQuantity <= 0) return i; // Don't remove here, let explicit remove button do it, or remove if 0? User asked for remove option.
           return { ...i, quantity: newQuantity };
        }
        return i;
      });
    });
  };

  const cartTotal = cart.reduce((acc, i) => acc + (i.item.price * i.quantity), 0);

  const handleFinishOrder = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const confirmOrder = () => {
    const newOrder: CanteenOrder = {
      id: `VDA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: cart.map(c => ({ itemId: c.item.id, name: c.item.name, quantity: c.quantity, price: c.item.price })),
      total: cartTotal,
      status: 'paid',
      paymentMethod,
      date: new Date().toISOString(),
      responsible: user.name
    };
    onAddOrder(newOrder);
    setCart([]);
    setShowCheckoutModal(false);
    alert("Venda finalizada com sucesso!");
  };

  const handleDeleteOrderClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      onDeleteOrder(orderToDelete);
      setOrderToDelete(null);
      setShowDeleteConfirmModal(false);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button onClick={() => setActiveTab('cantina_pdv')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'cantina_pdv' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Zap size={14} /> Caixa Rápido</button>
        <button onClick={() => setActiveTab('cantina_gestao')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'cantina_gestao' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><Package size={14} /> Cardápio</button>
        <button onClick={() => setActiveTab('cantina_historico')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'cantina_historico' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}><History size={14} /> Vendas</button>
      </div>

      {activeTab === 'cantina_pdv' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <Search className="text-gray-400" size={18} />
              <input type="text" placeholder="Pesquisar no cardápio..." className="flex-1 outline-none text-sm font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[2rem] border-2 border-transparent hover:border-indigo-600 transition-all shadow-sm flex flex-col items-center text-center group active:scale-95">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform overflow-hidden relative">
                     {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                        <Coffee size={28} />
                     )}
                  </div>
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
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                       {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Coffee size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-[10px] font-black uppercase text-gray-800 truncate">{item.name}</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Remover"><Trash2 size={12} /></button>
                       <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded"><Minus size={12} /></button>
                       <span className="text-xs font-black w-4 text-center">{quantity}</span>
                       <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
             </div>
             <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4"><div className="flex justify-between items-end"><p className="text-[10px] font-black text-gray-400 uppercase">Total Geral</p><p className="text-3xl font-black text-indigo-900">R$ {cartTotal.toFixed(2)}</p></div><button onClick={handleFinishOrder} disabled={cart.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50 transition-all">Finalizar Venda</button></div>
          </div>
        </div>
      )}

      {activeTab === 'cantina_gestao' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Package size={20} /></div>
               <div>
                 <h3 className="text-sm font-black text-gray-800 uppercase">Gestão de Cardápio</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Cadastre itens para venda</p>
               </div>
             </div>
             <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
               <Plus size={16} /> Novo Produto
             </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                  <th className="px-8 py-5">Produto</th>
                  <th className="px-8 py-5">Categoria</th>
                  <th className="px-8 py-5">Preço Unit.</th>
                  <th className="px-8 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 && (
                  <tr><td colSpan={4} className="px-8 py-8 text-center text-xs text-gray-400 font-bold uppercase">Nenhum item cadastrado no cardápio</td></tr>
                )}
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-indigo-50/20 transition-all">
                    <td className="px-8 py-4 font-black text-gray-800 uppercase text-xs">{item.name}</td>
                    <td className="px-8 py-4 text-xs font-bold text-gray-500 uppercase">{item.category}</td>
                    <td className="px-8 py-4 font-black text-indigo-600 text-xs">R$ {item.price.toFixed(2)}</td>
                    <td className="px-8 py-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => {
                         setFormData(item);
                         setShowAddModal(true);
                      }} className="p-2 text-indigo-300 hover:text-indigo-500"><Edit size={18} /></button>
                      <button onClick={() => onDeleteItem(item.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cantina_historico' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase">
                    <th className="px-8 py-4">Data / ID</th>
                    <th className="px-8 py-4">Operador</th>
                    <th className="px-8 py-4">Pagamento</th>
                    <th className="px-8 py-4 text-right">Valor Total</th>
                    <th className="px-8 py-4 text-right">Ação</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {[...orders].reverse().map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-all">
                       <td className="px-8 py-4">
                          <p className="font-mono text-[10px] font-black text-indigo-600">#{order.id}</p>
                          <p className="text-[9px] font-bold text-gray-400">{format(new Date(order.date), 'dd/MM/yy HH:mm')}</p>
                       </td>
                       <td className="px-8 py-4 font-black text-gray-700 uppercase text-[10px]">{order.responsible}</td>
                       <td className="px-8 py-4 font-bold text-gray-500 uppercase text-[10px]">{order.paymentMethod || 'Pix'}</td>
                       <td className="px-8 py-4 text-right font-black text-indigo-900 text-xs">R$ {order.total.toFixed(2)}</td>
                       <td className="px-8 py-4 text-right">
                          <button onClick={() => handleDeleteOrderClick(order.id)} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-sm font-black text-gray-800 uppercase flex items-center gap-2"><Plus size={16} className="text-indigo-600" /> {formData.id ? 'Editar Item' : 'Novo Item'}</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                    <input autoFocus type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ex: Refrigerante Lata" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">URL da Imagem (Opcional)</label>
                    <div className="flex gap-2">
                       <input type="text" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="https://..." value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} />
                       <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                          {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                       <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          <option value="Comida">Comida</option>
                          <option value="Bebida">Bebida</option>
                          <option value="Doce">Doce</option>
                          <option value="Salgado">Salgado</option>
                          <option value="Outros">Outros</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preço (R$)</label>
                       <input type="number" step="0.01" min="0" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                    </div>
                 </div>
                 <button onClick={() => {
                    if(!formData.name || !formData.price) return alert('Preencha nome e preço!');
                    if (formData.id) {
                       onUpdateItem(formData.id, formData);
                    } else {
                       onAddItem(formData);
                    }
                    setFormData({ name: '', price: 0, stock: 0, category: 'Comida', image: '' });
                    setShowAddModal(false);
                 }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                    <Save size={16} /> Salvar Produto
                 </button>
              </div>
           </div>
        </div>
      )}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="text-sm font-black text-gray-800 uppercase flex items-center gap-2"><ShoppingCart size={16} className="text-indigo-600" /> Finalizar Venda</h3>
                 <button onClick={() => setShowCheckoutModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo do Pedido</p>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto">
                       {cart.map((c, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                             <span className="font-bold text-gray-700">{c.quantity}x {c.item.name}</span>
                             <span className="font-black text-indigo-600">R$ {(c.item.price * c.quantity).toFixed(2)}</span>
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-xs font-black text-gray-500 uppercase">Total a Pagar</span>
                       <span className="text-xl font-black text-indigo-900">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forma de Pagamento</p>
                    <div className="grid grid-cols-2 gap-2">
                       {['Dinheiro', 'Pix', 'Cartão de Débito', 'Cartão de Crédito'].map((method) => (
                          <button
                             key={method}
                             onClick={() => setPaymentMethod(method as any)}
                             className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all border-2 ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                          >
                             {method}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button onClick={confirmOrder} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Confirmar Venda
                 </button>
              </div>
           </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center space-y-4">
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertTriangle size={32} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-gray-800">Cancelar Venda?</h3>
                    <p className="text-xs text-gray-500 mt-2">Tem certeza que deseja cancelar esta venda? O estoque será restaurado.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-3 pt-4">
                    <button onClick={() => setShowDeleteConfirmModal(false)} className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black uppercase text-xs transition-all">Cancelar</button>
                    <button onClick={confirmDeleteOrder} className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase text-xs shadow-lg transition-all">Sim, Cancelar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
