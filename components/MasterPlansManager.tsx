import React, { useMemo, useState } from 'react';
import { SaaSPlan, PlanLimits } from '../types';
import { Settings, CreditCard, Calendar, Clock, Infinity, Gift, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface MasterPlansManagerProps {
  plans: SaaSPlan[];
  onUpdatePlans: (plans: SaaSPlan[]) => void;
}

export const MasterPlansManager: React.FC<MasterPlansManagerProps> = ({ plans, onUpdatePlans }) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(49.9);
  const [newDuration, setNewDuration] = useState(30);
  const [newLifetime, setNewLifetime] = useState(false);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDuration, setEditDuration] = useState(30);
  const [editLifetime, setEditLifetime] = useState(false);
  const [editLimits, setEditLimits] = useState<PlanLimits>({});

  const totalPlans = plans.length;
  const averagePrice = useMemo(() => {
    if (!plans.length) return 0;
    const sum = plans.reduce((acc, p) => acc + (p.price || 0), 0);
    return sum / plans.length;
  }, [plans]);

  const lifetimeCount = useMemo(() => plans.filter(p => p.durationDays === null).length, [plans]);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      alert('Informe um nome para o plano.');
      return;
    }
    if (plans.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert('Já existe um plano com este nome.');
      return;
    }
    if (!newLifetime && (!newDuration || newDuration <= 0)) {
      alert('Informe a quantidade de dias do plano.');
      return;
    }
    if (newPrice < 0) {
      alert('O valor não pode ser negativo.');
      return;
    }

    const plan: SaaSPlan = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name,
      price: newPrice,
      durationDays: newLifetime ? null : newDuration
    };

    onUpdatePlans([...plans, plan]);
    setNewName('');
    setNewPrice(49.9);
    setNewDuration(30);
    setNewLifetime(false);
  };

  const startEdit = (plan: SaaSPlan) => {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
    setEditPrice(plan.price);
    setEditLimits(plan.limits || {});
    if (plan.durationDays === null) {
      setEditLifetime(true);
      setEditDuration(30);
    } else {
      setEditLifetime(false);
      setEditDuration(plan.durationDays);
    }
  };

  const cancelEdit = () => {
    setEditingPlanId(null);
    setEditName('');
    setEditPrice(0);
    setEditDuration(30);
    setEditLifetime(false);
    setEditLimits({});
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanId) return;
    const name = editName.trim();
    if (!name) {
      alert('Informe um nome para o plano.');
      return;
    }
    if (plans.some(p => p.id !== editingPlanId && p.name.toLowerCase() === name.toLowerCase())) {
      alert('Já existe outro plano com este nome.');
      return;
    }
    if (!editLifetime && (!editDuration || editDuration <= 0)) {
      alert('Informe a quantidade de dias do plano.');
      return;
    }
    if (editPrice < 0) {
      alert('O valor não pode ser negativo.');
      return;
    }

    const updated = plans.map(p => {
      if (p.id !== editingPlanId) return p;
      return {
        ...p,
        name,
        price: editPrice,
        durationDays: editLifetime ? null : editDuration,
        limits: {
          maxMembers: editLimits.maxMembers ?? null,
          maxConsulentes: editLimits.maxConsulentes ?? null
        }
      };
    });
    onUpdatePlans(updated);
    cancelEdit();
  };

  const deletePlan = (id: string) => {
    if (!confirm('Remover este plano permanentemente?')) return;
    onUpdatePlans(plans.filter(p => p.id !== id));
    if (editingPlanId === id) {
      cancelEdit();
    }
  };

  const renderPlanIcon = (plan: SaaSPlan) => {
    if (plan.durationDays === null) {
      return <Infinity size={18} className="text-amber-400" />;
    }
    if (plan.price === 0) {
      return <Gift size={18} className="text-emerald-400" />;
    }
    if ((plan.durationDays || 0) <= 30) {
      return <Calendar size={18} className="text-indigo-400" />;
    }
    return <Clock size={18} className="text-sky-400" />;
  };

  const formatDuration = (days: number | null) => {
    if (days === null) return 'Vitalício';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Settings size={140} className="text-emerald-400" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-emerald-500 rounded-3xl text-slate-900 shadow-xl shadow-emerald-500/20">
            <CreditCard size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Configurações de Planos
            </h2>
            <p className="text-slate-500 font-medium">
              Defina os planos disponíveis na criação de novos terreiros e ajuste valores e duração.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 min-w-[260px] relative z-10">
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Planos Ativos
            </p>
            <p className="text-2xl font-black text-emerald-400">{totalPlans}</p>
          </div>
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Ticket Médio
            </p>
            <p className="text-2xl font-black text-indigo-400">
              R$ {averagePrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Planos Vitalícios
            </p>
            <p className="text-2xl font-black text-amber-400">{lifetimeCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
          <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Plus size={14} /> Cadastrar novo plano
          </h3>
          <form onSubmit={handleAddPlan} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                Nome do Plano
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Plano Mensal"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                Valor (R$)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={newPrice}
                onChange={e => setNewPrice(Number(e.target.value))}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                  Duração em dias
                </label>
                <input
                  type="number"
                  min={1}
                  disabled={newLifetime}
                  value={newLifetime ? '' : newDuration}
                  onChange={e => setNewDuration(Number(e.target.value))}
                  className={`w-full p-3 border rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 ${
                    newLifetime
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                  placeholder="Ex: 30"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                checked={newLifetime}
                onChange={e => setNewLifetime(e.target.checked)}
              />
              Plano vitalício (nunca expira)
            </label>
            <button
              type="submit"
              className="w-full py-3 mt-2 bg-emerald-500 text-slate-900 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={16} /> Salvar Plano
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Planos configurados
            </h3>
            <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">
              {plans.length} REGISTROS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-4">Plano</th>
                  <th className="px-8 py-4">Valor</th>
                  <th className="px-8 py-4">Duração</th>
                  <th className="px-8 py-4">Limites de Uso</th>
                  <th className="px-8 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plans.length > 0 ? (
                  plans.map(plan => {
                    const isEditing = plan.id === editingPlanId;
                    return (
                      <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors group align-middle">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                              {renderPlanIcon(plan)}
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              ) : (
                                <p className="text-xs font-black text-white uppercase">
                                  {plan.name}
                                </p>
                              )}
                              {!isEditing && (
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  ID: {plan.id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={editPrice}
                              onChange={e => setEditPrice(Number(e.target.value))}
                              className="w-28 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          ) : (
                            <p className="text-xs font-black text-emerald-400">
                              R$ {plan.price.toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                disabled={editLifetime}
                                value={editLifetime ? '' : editDuration}
                                onChange={e => setEditDuration(Number(e.target.value))}
                                className={`w-24 p-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 ${
                                  editLifetime
                                    ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-950 border-slate-800 text-white'
                                }`}
                                placeholder="Dias"
                              />
                              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                                  checked={editLifetime}
                                  onChange={e => setEditLifetime(e.target.checked)}
                                />
                                Vitalício
                              </label>
                            </div>
                          ) : (
                            <p className="text-xs font-black text-slate-300">
                              {formatDuration(plan.durationDays)}
                            </p>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-2 max-w-xs">
                              <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 ml-0.5">
                                  Membros
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={editLimits.maxMembers ?? ''}
                                  onChange={e =>
                                    setEditLimits({
                                      ...editLimits,
                                      maxMembers: e.target.value === '' ? null : Number(e.target.value)
                                    })
                                  }
                                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                  placeholder="Ilimitado"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 ml-0.5">
                                  Consulentes
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={editLimits.maxConsulentes ?? ''}
                                  onChange={e =>
                                    setEditLimits({
                                      ...editLimits,
                                      maxConsulentes: e.target.value === '' ? null : Number(e.target.value)
                                    })
                                  }
                                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                  placeholder="Ilimitado"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-300 space-y-1">
                              <p>
                                <span className="font-black text-slate-500 uppercase mr-1">Membros:</span>
                                {plan.limits && plan.limits.maxMembers != null
                                  ? plan.limits.maxMembers
                                  : 'Ilimitado'}
                              </p>
                              <p>
                                <span className="font-black text-slate-500 uppercase mr-1">Consulentes:</span>
                                {plan.limits && plan.limits.maxConsulentes != null
                                  ? plan.limits.maxConsulentes
                                  : 'Ilimitado'}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-900 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-emerald-400 transition-all"
                              >
                                <Save size={14} /> Salvar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-slate-700 transition-all"
                              >
                                <X size={14} /> Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(plan)}
                                className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => deletePlan(plan.id)}
                                className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                      <td
                      colSpan={5}
                      className="px-8 py-20 text-center flex flex-col items-center gap-3"
                    >
                      <CreditCard size={40} className="text-slate-800 opacity-20" />
                      <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">
                        Nenhum plano cadastrado
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
};
