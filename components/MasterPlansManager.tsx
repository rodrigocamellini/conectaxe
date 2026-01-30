import React, { useMemo, useState, useEffect } from 'react';
import { SaaSPlan, PlanLimits, SaaSClient } from '../types';
import { Settings, CreditCard, Calendar, Clock, Infinity, Gift, Plus, Trash2, Edit2, Save, X, Lock, AlertTriangle, Play, ShieldAlert } from 'lucide-react';
import { MasterService } from '../services/masterService';

interface MasterPlansManagerProps {
  plans: SaaSPlan[];
  onUpdatePlans: (plans: SaaSPlan[]) => void;
  onRunAutoBlock: () => void;
  clients?: SaaSClient[];
  masterPassword?: string;
}

export const MasterPlansManager: React.FC<MasterPlansManagerProps> = ({ 
  plans, 
  onUpdatePlans, 
  onRunAutoBlock,
  clients = [],
  masterPassword = ''
}) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(49.9);
  const [newDuration, setNewDuration] = useState(30);
  const [newLifetime, setNewLifetime] = useState(false);

  // Auto Block Config
  const [autoBlockConfig, setAutoBlockConfig] = useState<{enabled: boolean, days: number}>({ enabled: false, days: 5 });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await MasterService.getAutoBlockConfig();
        setAutoBlockConfig(config);
      } catch (e) {
        console.error("Erro ao carregar config de auto block:", e);
      }
    };
    loadConfig();
  }, []);

  const handleSaveAutoBlock = async () => {
    try {
      await MasterService.saveAutoBlockConfig(autoBlockConfig);
      alert('Configuração de bloqueio automático salva!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar configuração.');
    }
  };

  // Edit State
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDuration, setEditDuration] = useState(30);
  const [editLifetime, setEditLifetime] = useState(false);
  const [editLimits, setEditLimits] = useState<PlanLimits>({});

  // Delete Confirmation State
  const [planToDelete, setPlanToDelete] = useState<SaaSPlan | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const totalPlans = plans.length;
  const averagePrice = useMemo(() => {
    if (!plans.length) return 0;
    const sum = plans.reduce((acc, p) => acc + (p.price || 0), 0);
    return sum / plans.length;
  }, [plans]);

  const lifetimeCount = useMemo(() => plans.filter(p => p.durationDays === null).length, [plans]);

  const handleAddPlan = async (e: React.FormEvent) => {
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
      durationDays: newLifetime ? null : newDuration,
      enabledModules: [] // Initialize with no modules enabled by default
    };

    try {
      await MasterService.savePlan(plan);
      // Update local state via prop to reflect changes immediately in UI
      onUpdatePlans([...plans, plan]);
      setNewName('');
      setNewPrice(49.9);
      setNewDuration(30);
      setNewLifetime(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Erro ao salvar o plano. Tente novamente.");
    }
  };

  const startEdit = (plan: SaaSPlan) => {
    setEditingPlan(plan);
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
    setEditingPlan(null);
    setEditName('');
    setEditPrice(0);
    setEditDuration(30);
    setEditLifetime(false);
    setEditLimits({});
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const name = editName.trim();
    if (!name) {
      alert('Informe um nome para o plano.');
      return;
    }
    if (plans.some(p => p.id !== editingPlan.id && p.name.toLowerCase() === name.toLowerCase())) {
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

    const updatedPlan = {
      ...editingPlan,
      name,
      price: editPrice,
      durationDays: editLifetime ? null : editDuration,
      limits: {
        maxMembers: editLimits.maxMembers ?? null,
        maxConsulentes: editLimits.maxConsulentes ?? null
      }
    };

    try {
      await MasterService.savePlan(updatedPlan);
      const updated = plans.map(p => p.id === editingPlan.id ? updatedPlan : p);
      onUpdatePlans(updated);
      cancelEdit();
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Erro ao atualizar o plano. Tente novamente.");
    }
  };

  const handleDeleteClick = (plan: SaaSPlan) => {
    // Check if plan is in use
    const isInUse = clients.some(c => c.plan === plan.name);
    if (isInUse) {
      alert(`Este plano não pode ser excluído pois existem clientes vinculados a ele.`);
      return;
    }
    setPlanToDelete(plan);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    
    if (deletePassword !== masterPassword) {
      setDeleteError('Senha de desenvolvedor incorreta.');
      return;
    }

    try {
      await MasterService.deletePlan(planToDelete.id);
      onUpdatePlans(plans.filter(p => p.id !== planToDelete.id));
      // If editing the plan being deleted, close edit modal
      if (editingPlan?.id === planToDelete.id) {
        cancelEdit();
      }
      setPlanToDelete(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Erro ao excluir o plano. Tente novamente.");
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
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 relative">
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
        <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
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

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
           <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} /> Bloqueio Automático
          </h3>
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-start gap-3">
                 <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                   O sistema verificará diariamente clientes com pagamentos atrasados e bloqueará o acesso automaticamente.
                 </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                Dias de tolerância após vencimento
              </label>
              <input
                type="number"
                min={1}
                value={autoBlockConfig.days}
                onChange={e => setAutoBlockConfig(prev => ({ ...prev, days: Number(e.target.value) }))}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-red-500 focus:ring-red-500"
                checked={autoBlockConfig.enabled}
                onChange={e => setAutoBlockConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Ativar bloqueio automático
            </label>

            <button
              type="button"
              onClick={handleSaveAutoBlock}
              className="w-full py-3 mt-2 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Save size={16} /> Salvar Configuração
            </button>

            <div className="pt-2 border-t border-slate-800">
               <button
                type="button"
                onClick={onRunAutoBlock}
                className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-black uppercase text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Play size={16} /> Executar Verificação Agora
              </button>
              <p className="text-[9px] text-center text-slate-500 mt-2">
                Isso forçará a verificação de inadimplência imediatamente para todos os clientes ativos.
              </p>
            </div>
          </div>
        </div>
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
                    return (
                      <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors group align-middle">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                              {renderPlanIcon(plan)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white uppercase">
                                {plan.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                ID: {plan.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-xs font-black text-emerald-400">
                            R$ {plan.price.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-xs font-black text-slate-300">
                            {formatDuration(plan.durationDays)}
                          </p>
                        </td>
                        <td className="px-8 py-4">
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
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(plan)}
                              className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
                              title="Editar Plano"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(plan)}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                              title="Excluir Plano"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Edit2 className="text-emerald-500" size={24} />
                <h3 className="text-lg font-black text-white uppercase">Editar Plano</h3>
              </div>
              <button 
                onClick={cancelEdit}
                className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                  Nome do Plano
                </label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                    Duração (Dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    disabled={editLifetime}
                    value={editLifetime ? '' : editDuration}
                    onChange={e => setEditDuration(Number(e.target.value))}
                    className={`w-full p-3 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 ${
                      editLifetime
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-lifetime"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  checked={editLifetime}
                  onChange={e => setEditLifetime(e.target.checked)}
                />
                <label htmlFor="edit-lifetime" className="text-[11px] text-slate-400 cursor-pointer select-none">
                  Plano vitalício (nunca expira)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                    Max. Membros
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
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ilimitado"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                    Max. Consulentes
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
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-black uppercase text-xs hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-500" size={24} />
                <h3 className="text-lg font-black text-white uppercase">Confirmar Exclusão</h3>
              </div>
              <button 
                onClick={() => setPlanToDelete(null)}
                className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <p className="text-xs text-red-400 leading-relaxed font-medium">
                  Você está prestes a excluir o plano <span className="text-white font-bold">"{planToDelete.name}"</span>.
                  Esta ação é irreversível.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                  Senha de Desenvolvedor
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input
                    type="password"
                    autoFocus
                    value={deletePassword}
                    onChange={e => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    placeholder="Digite sua senha..."
                  />
                </div>
                {deleteError && (
                  <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 animate-in slide-in-from-top-1">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPlanToDelete(null)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-black uppercase text-xs hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
