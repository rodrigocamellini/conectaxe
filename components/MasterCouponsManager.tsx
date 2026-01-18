import React, { useState, useMemo } from 'react';
import { GlobalCoupon } from '../types';
import { Tag, Plus, Trash2, Calendar as CalendarIcon, Percent, Power } from 'lucide-react';
import { format } from 'date-fns';

interface MasterCouponsManagerProps {
  coupons: GlobalCoupon[];
  onUpdateCoupons: (coupons: GlobalCoupon[]) => void;
}

export const MasterCouponsManager: React.FC<MasterCouponsManagerProps> = ({ coupons, onUpdateCoupons }) => {
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newExpiry, setNewExpiry] = useState('');

  const totalActive = useMemo(() => coupons.filter(c => c.active).length, [coupons]);
  const totalUsed = useMemo(() => coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0), [coupons]);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) {
      alert('Informe um código para o cupom.');
      return;
    }
    if (coupons.some(c => c.code === code)) {
      alert('Já existe um cupom com este código.');
      return;
    }
    if (!newDiscount || newDiscount <= 0 || newDiscount > 100) {
      alert('Informe um desconto entre 1% e 100%.');
      return;
    }

    const coupon: GlobalCoupon = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      code,
      discountPercent: newDiscount,
      expiryDate: newExpiry || '',
      usageCount: 0,
      active: true
    };

    onUpdateCoupons([coupon, ...coupons]);
    setNewCode('');
    setNewDiscount(10);
    setNewExpiry('');
  };

  const handleToggleActive = (id: string) => {
    onUpdateCoupons(
      coupons.map(c => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm('Remover este cupom permanentemente?')) return;
    onUpdateCoupons(coupons.filter(c => c.id !== id));
  };

  const formatExpiry = (value?: string) => {
    if (!value) return 'Sem validade definida';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return 'Data inválida';
      return format(d, 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Tag size={140} className="text-emerald-400" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-emerald-500 rounded-3xl text-slate-900 shadow-xl shadow-emerald-500/20">
            <Percent size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Cupons de Desconto
            </h2>
            <p className="text-slate-500 font-medium">
              Crie códigos promocionais para oferecer condições especiais nos planos do ecossistema.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 min-w-[220px] relative z-10">
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Cupons Ativos
            </p>
            <p className="text-2xl font-black text-emerald-400">{totalActive}</p>
          </div>
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Usos Registrados
            </p>
            <p className="text-2xl font-black text-indigo-400">{totalUsed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Plus size={14} /> Criar novo cupom
          </h3>
          <form onSubmit={handleAddCoupon} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                Código do Cupom
              </label>
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="EX: AXE20"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-mono uppercase outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                Desconto (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newDiscount}
                  onChange={e => setNewDiscount(Number(e.target.value))}
                  className="w-24 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400">
                  Desconto aplicado sobre o valor do plano.
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                Validade opcional
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <CalendarIcon size={16} className="text-slate-500" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-2 bg-emerald-500 text-slate-900 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={16} /> Salvar Cupom
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Cupons configurados
            </h3>
            <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">
              {coupons.length} REGISTROS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-4">Cupom / Desconto</th>
                  <th className="px-8 py-4">Validade</th>
                  <th className="px-8 py-4 text-center">Uso</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons.length > 0 ? (
                  [...coupons].map(coupon => (
                    <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-4">
                        <p className="text-xs font-mono text-white tracking-[0.2em]">
                          {coupon.code}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-black mt-1">
                          {coupon.discountPercent}% de desconto
                        </p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs text-slate-300">
                          {formatExpiry(coupon.expiryDate)}
                        </p>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {coupon.usageCount || 0} uso(s)
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all flex items-center gap-2 mx-auto ${
                            coupon.active
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-600 border-slate-700'
                          }`}
                        >
                          <Power size={10} />
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center flex flex-col items-center gap-3"
                    >
                      <Tag size={40} className="text-slate-800 opacity-20" />
                      <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">
                        Nenhum cupom cadastrado
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

