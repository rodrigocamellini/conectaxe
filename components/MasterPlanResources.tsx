import React, { useState } from 'react';
import { SaaSPlan, PlanLimits } from '../types';
import { AVAILABLE_MODULES } from '../constants';
import * as LucideIcons from 'lucide-react';
import { ShieldCheck, Layout, Users, Package, CheckCircle2, Circle, Check } from 'lucide-react';

interface MasterPlanResourcesProps {
  plans: SaaSPlan[];
  onUpdatePlans: (plans: SaaSPlan[]) => void;
}

const DynamicIcon = ({ name, size = 16, className = "", color }: { name: string, size?: number, className?: string, color?: string }) => {
  const IconComp = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComp size={size} className={className} style={color ? { color } : {}} />;
};

export const MasterPlanResources: React.FC<MasterPlanResourcesProps> = ({ plans, onUpdatePlans }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id || null);
  
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleUpdateLimits = (field: keyof PlanLimits, value: string) => {
    if (!selectedPlan) return;
    
    const numValue = value === '' ? null : parseInt(value);
    const updatedPlan = {
      ...selectedPlan,
      limits: {
        ...selectedPlan.limits,
        [field]: numValue
      }
    };
    
    onUpdatePlans(plans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
  };

  const toggleModule = (moduleId: string, subModulesIds?: string[]) => {
    if (!selectedPlan) return;
    
    // If enabledModules is undefined, it means all are enabled by default.
    // So we start with all available modules.
    const getAllModules = () => {
      const all: string[] = [];
      AVAILABLE_MODULES.forEach(m => {
        all.push(m.id);
        if ((m as any).subModules) {
          (m as any).subModules.forEach((s: any) => all.push(s.id));
        }
      });
      return all;
    };

    const currentModules = selectedPlan.enabledModules || getAllModules();
    const isEnabled = currentModules.includes(moduleId);
    
    let newModules = [...currentModules];
    
    if (isEnabled) {
      // Disabling
      newModules = newModules.filter(m => m !== moduleId);
      // If it has submodules, remove them too
      if (subModulesIds) {
        newModules = newModules.filter(m => !subModulesIds.includes(m));
      }
    } else {
      // Enabling
      newModules.push(moduleId);
      // Auto-enable submodules for better UX
      if (subModulesIds) {
        subModulesIds.forEach(id => {
          if (!newModules.includes(id)) newModules.push(id);
        });
      }
    }
    
    const updatedPlan = {
      ...selectedPlan,
      enabledModules: newModules
    };
    
    onUpdatePlans(plans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
  };

  const toggleSubModule = (subModuleId: string, parentId: string) => {
    if (!selectedPlan) return;
    
    const getAllModules = () => {
      const all: string[] = [];
      AVAILABLE_MODULES.forEach(m => {
        all.push(m.id);
        if ((m as any).subModules) {
          (m as any).subModules.forEach((s: any) => all.push(s.id));
        }
      });
      return all;
    };

    const currentModules = selectedPlan.enabledModules || getAllModules();
    const isEnabled = currentModules.includes(subModuleId);
    
    let newModules = [...currentModules];
    
    if (isEnabled) {
      newModules = newModules.filter(m => m !== subModuleId);
    } else {
      newModules.push(subModuleId);
      // Ensure parent is enabled
      if (!newModules.includes(parentId)) newModules.push(parentId);
    }

    const updatedPlan = {
      ...selectedPlan,
      enabledModules: newModules
    };
    
    onUpdatePlans(plans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Sidebar: Lista de Planos */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">
            Selecione o Plano
          </h3>
          <div className="space-y-2">
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  selectedPlanId === plan.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="font-bold text-sm uppercase">{plan.name}</span>
                {selectedPlanId === plan.id && <ShieldCheck size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Editor de Recursos */}
      <div className="lg:col-span-8 space-y-6">
        {selectedPlan ? (
          <div className="space-y-8">
            {/* Cabeçalho do Plano */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Recursos do Plano
                </h2>
                <p className="text-slate-400 text-sm">
                  Configurando: <span className="text-indigo-400 font-bold">{selectedPlan.name}</span>
                </p>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Layout className="text-indigo-400" size={32} />
              </div>
            </div>

            {/* Configuração de Limites */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-emerald-400" size={24} />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Limites de Cadastros
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Máximo de Membros
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Ilimitado"
                      value={selectedPlan.limits?.maxMembers ?? ''}
                      onChange={(e) => handleUpdateLimits('maxMembers', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {selectedPlan.limits?.maxMembers ? 'Membros' : 'Sem limite'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Deixe em branco para cadastros ilimitados.
                  </p>
                </div>

                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    Máximo de Consulentes
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Ilimitado"
                      value={selectedPlan.limits?.maxConsulentes ?? ''}
                      onChange={(e) => handleUpdateLimits('maxConsulentes', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {selectedPlan.limits?.maxConsulentes ? 'Pessoas' : 'Sem limite'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Deixe em branco para cadastros ilimitados.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuração de Módulos */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-amber-400" size={24} />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Módulos Habilitados
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_MODULES.map(module => {
                  const subModules = (module as any).subModules;
                  const isEnabled = selectedPlan.enabledModules 
                    ? selectedPlan.enabledModules.includes(module.id)
                    : true;
                  
                  return (
                    <div 
                      key={module.id}
                      className={`rounded-3xl border transition-all relative overflow-hidden group ${
                        isEnabled 
                          ? 'bg-indigo-600/10 border-indigo-500/50' 
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => toggleModule(module.id, subModules?.map((s:any) => s.id))}
                        className="w-full text-left p-5 flex items-start justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-xl ${isEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                              <DynamicIcon name={module.icon} size={20} />
                            </div>
                            <div>
                                <h4 className={`font-black text-sm uppercase mb-1 ${isEnabled ? 'text-white' : 'text-slate-400'}`}>
                                  {module.label}
                                </h4>
                                <p className={`text-[10px] font-medium ${isEnabled ? 'text-indigo-200' : 'text-slate-600'}`}>
                                  {module.description}
                                </p>
                            </div>
                        </div>
                        <div className={`transition-colors ${isEnabled ? 'text-indigo-400' : 'text-slate-600'}`}>
                          {isEnabled ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                      </button>

                      {/* Submodules Section */}
                      {subModules && subModules.length > 0 && isEnabled && (
                        <div className="px-5 pb-5 pt-0 space-y-2">
                            <div className="h-px bg-slate-800/50 w-full mb-3" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Sub-módulos</p>
                            <div className="grid grid-cols-1 gap-2">
                                {subModules.map((sub: any) => {
                                    const isSubEnabled = selectedPlan.enabledModules 
                                        ? selectedPlan.enabledModules.includes(sub.id)
                                        : true;
                                    return (
                                        <button
                                            key={sub.id}
                                            onClick={() => toggleSubModule(sub.id, module.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                                                isSubEnabled
                                                    ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSubEnabled ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                                                {sub.label}
                                            </span>
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                                isSubEnabled ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                                            }`}>
                                                {isSubEnabled && <Check size={10} className="text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
            <ShieldCheck size={64} className="mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-2">Nenhum plano selecionado</h3>
            <p className="text-sm">Selecione um plano na lista ao lado para editar seus recursos.</p>
          </div>
        )}
      </div>
    </div>
  );
};
