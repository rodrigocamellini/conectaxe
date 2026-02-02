import React, { useState, useEffect, useMemo } from 'react';
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
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [plans]);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(sortedPlans[0]?.id || null);
  const [showAutoConfigModal, setShowAutoConfigModal] = useState(false);
  const [configType, setConfigType] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  useEffect(() => {
    if (!selectedPlanId && sortedPlans.length > 0) {
      setSelectedPlanId(sortedPlans[0].id);
    }
  }, [sortedPlans, selectedPlanId]);

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

  const toggleModule = (moduleId: string, subModulesIds?: string[]) => {
    if (!selectedPlan) return;
    
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

  const toggleModuleForPlan = (planId: string, moduleId: string) => {
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return;
    
    // Logic to determine if enabled:
    // If enabledModules is undefined/null, it means ALL modules are enabled (legacy/default).
    // If enabledModules is an array, check if it includes the moduleId.
    const isEnabled = !targetPlan.enabledModules || targetPlan.enabledModules.includes(moduleId);
    
    let newModules: string[] = [];

    if (targetPlan.enabledModules) {
        // If it has a defined list, use it
        newModules = [...targetPlan.enabledModules];
    } else {
        // If undefined (all enabled), we must create the list.
        // Since we are toggling ONE module, we need to know the current state.
        // If it was "all enabled" (isEnabled=true), and we toggle, we want to DISABLE it.
        // So new list = All Available - This Module.
        const all = getAllModules();
        newModules = [...all];
    }
    
    if (isEnabled) {
      // Disable it
      newModules = newModules.filter(m => m !== moduleId);
      
      // Remove submodules if any
      const moduleDef = AVAILABLE_MODULES.find(m => m.id === moduleId);
      if (moduleDef && (moduleDef as any).subModules) {
         const subIds = (moduleDef as any).subModules.map((s:any) => s.id);
         newModules = newModules.filter(m => !subIds.includes(m));
      }
    } else {
      // Enable it
      if (!newModules.includes(moduleId)) {
          newModules.push(moduleId);
      }
      
      // Add submodules
      const moduleDef = AVAILABLE_MODULES.find(m => m.id === moduleId);
      if (moduleDef && (moduleDef as any).subModules) {
         (moduleDef as any).subModules.forEach((s:any) => {
             if(!newModules.includes(s.id)) newModules.push(s.id);
         });
      }
    }
    
    const updatedPlan = { ...targetPlan, enabledModules: newModules };
    onUpdatePlans(plans.map(p => p.id === planId ? updatedPlan : p));
  };

  const toggleSubModule = (subModuleId: string, parentId: string) => {
    if (!selectedPlan) return;

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

  const executeAutoConfigure = () => {
    setIsApplying(true);

    const getModulesForIds = (ids: string[]) => {
      const all: string[] = [];
      AVAILABLE_MODULES.forEach(m => {
        if (ids.includes(m.id)) {
          all.push(m.id);
          if ((m as any).subModules) {
            (m as any).subModules.forEach((s: any) => all.push(s.id));
          }
        }
      });
      return all;
    };

    setTimeout(() => {
      try {
        const updatedPlans = plans.map(p => {
          const name = p.name.toLowerCase();

          // Verificar se o plano corresponde ao tipo selecionado para configuração
          let shouldConfig = false;
          if (configType === 'iniciante' && (name.includes('iniciante') || (name.includes('mensal') && !name.includes('pro') && !name.includes('expandido')) || (name.includes('anual') && !name.includes('pro') && !name.includes('expandido')))) shouldConfig = true;
          if (configType === 'expandido' && (name.includes('expandido') || name.includes('extendido') || name.includes('intermediario') || name.includes('plus'))) shouldConfig = true;
          if (configType === 'pro' && (name.includes('pro') || name.includes('vitalicio') || name.includes('terreiro pro'))) shouldConfig = true;

          // Se não corresponder ao tipo selecionado, retorna o plano original
          if (!shouldConfig) return p;

          let enabledModules: string[] = [];
          let limits: PlanLimits = { maxMembers: null, maxConsulentes: null };
          let matched = false;

          // 1. Teste
          if (name.includes('teste')) {
            enabledModules = getAllModules().filter(m => m !== 'mod_backup_auto');
            limits = { maxMembers: 30, maxConsulentes: 30 };
            matched = true;
          } 
          // 2. Pro / Vitalício (Inclui "Terreiro Pro Mensal", "Terreiro Pro Anual", etc.)
          else if (name.includes('pro') || name.includes('vitalicio') || name.includes('vitalício') || name.includes('terreiro pro')) {
            enabledModules = getAllModules();
            limits = { maxMembers: null, maxConsulentes: null };
            matched = true;
          }
          // 3. Expandido / Intermediário
          else if (name.includes('expandido') || name.includes('extendido') || name.includes('intermediario') || name.includes('intermediário') || name.includes('plus') || name.includes('gold')) {
            // Plano intermediário: Tudo exceto Cursos e Backup Automático
            enabledModules = getModulesForIds(['agenda', 'midia', 'financeiro', 'gestao_eventos', 'estoque', 'cantina']);
            limits = { maxMembers: 200, maxConsulentes: null };
            matched = true;
          }
          // 4. Básico (Iniciante, Mensal, Trimestral, Semestral, Anual - se não for Pro/Expandido)
          else if (name.includes('iniciante') || name.includes('mensal') || name.includes('trimestral') || name.includes('semestral') || name.includes('anual')) {
            // Fallback: se getModulesForIds falhar (o que não deveria), garante os IDs manualmente
            const basicModules = ['agenda', 'midia', 'financeiro'];
            const modulesFromHelper = getModulesForIds(basicModules);
            
            if (modulesFromHelper.length > 0) {
              enabledModules = modulesFromHelper;
            } else {
              // Fallback de segurança caso AVAILABLE_MODULES não esteja carregado corretamente ou IDs não batam
              console.warn("AutoConfig: Fallback ativado para plano Mensal/Básico");
              enabledModules = basicModules;
              // Tenta adicionar submodulos manualmente se possível (simplificado)
              if (basicModules.includes('financeiro')) enabledModules.push('financeiro_mensalidades', 'financeiro_doacoes', 'financeiro_relatorios', 'financeiro_config');
              if (basicModules.includes('midia')) enabledModules.push('midia_pontos', 'midia_rezas', 'midia_ervas');
            }

            limits = { maxMembers: 50, maxConsulentes: 100 };
            matched = true;
          }

          if (matched) {
            return { ...p, enabledModules, limits };
          }
          return p;
        });

        onUpdatePlans(updatedPlans);
        setIsApplying(false);
        setShowAutoConfigModal(false);
      } catch (error) {
        console.error("Error auto-configuring plans:", error);
        setIsApplying(false);
        alert('Erro ao configurar planos.');
      }
    }, 1500);
  };

  const handleAutoConfigure = (type: string) => {
    setConfigType(type);
    setShowAutoConfigModal(true);
  };

  const getPlanColor = (planName: string) => {
    const name = (planName || '').toLowerCase();
    
    // 1. Teste (Mantém inalterado)
    if (name.includes('teste')) {
      return 'border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400';
    }

    // Definir cor base
    let colorType = 'slate';
    
    // Lógica de Categoria
    // Pro: Contém 'pro' ou é 'terreiro' sem ser iniciante/expandido
    if (name.includes('pro') || (name.includes('terreiro') && !name.includes('iniciante') && !name.includes('expandido') && !name.includes('extendido') && !name.includes('teste'))) {
      colorType = 'violet';
    }
    // Expandido
    else if (name.includes('expandido') || name.includes('extendido') || name.includes('intermediario') || name.includes('intermediário') || name.includes('plus') || name.includes('gold')) {
      colorType = 'blue';
    }
    // Iniciante / Básico
    else if (name.includes('iniciante') || name.includes('básico') || name.includes('basico') || name.includes('mensal')) {
      colorType = 'emerald';
    }
    else {
        if (name.includes('mensal') || name.includes('anual')) colorType = 'emerald';
    }

    // Definir Periodicidade para Opacidade
    let periodicity = 'vitalicio'; // Default 100%

    if (name.includes('vitalicio') || name.includes('vitalício')) periodicity = 'vitalicio';
    else if (name.includes('anual')) periodicity = 'anual';
    else if (name.includes('semestral')) periodicity = 'semestral';
    else if (name.includes('trimestral')) periodicity = 'trimestral';
    else if (name.includes('mensal')) periodicity = 'mensal';

    // Retornar classes completas para garantir que o Tailwind JIT as detecte
    // Opacidades: Vitalício(100%), Anual(90%), Semestral(80%), Trimestral(70%), Mensal(60%)

    if (colorType === 'violet') {
        if (periodicity === 'vitalicio') return 'border-violet-500 text-violet-500 hover:bg-violet-500/10';
        if (periodicity === 'anual') return 'border-violet-500/[0.90] text-violet-500/[0.90] hover:bg-violet-500/10';
        if (periodicity === 'semestral') return 'border-violet-500/[0.80] text-violet-500/[0.80] hover:bg-violet-500/10';
        if (periodicity === 'trimestral') return 'border-violet-500/[0.70] text-violet-500/[0.70] hover:bg-violet-500/10';
        if (periodicity === 'mensal') return 'border-violet-500/[0.60] text-violet-500/[0.60] hover:bg-violet-500/10';
    }
    
    if (colorType === 'blue') {
        if (periodicity === 'vitalicio') return 'border-blue-500 text-blue-500 hover:bg-blue-500/10';
        if (periodicity === 'anual') return 'border-blue-500/[0.90] text-blue-500/[0.90] hover:bg-blue-500/10';
        if (periodicity === 'semestral') return 'border-blue-500/[0.80] text-blue-500/[0.80] hover:bg-blue-500/10';
        if (periodicity === 'trimestral') return 'border-blue-500/[0.70] text-blue-500/[0.70] hover:bg-blue-500/10';
        if (periodicity === 'mensal') return 'border-blue-500/[0.60] text-blue-500/[0.60] hover:bg-blue-500/10';
    }

    if (colorType === 'emerald') {
        if (periodicity === 'vitalicio') return 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10';
        if (periodicity === 'anual') return 'border-emerald-500/[0.90] text-emerald-500/[0.90] hover:bg-emerald-500/10';
        if (periodicity === 'semestral') return 'border-emerald-500/[0.80] text-emerald-500/[0.80] hover:bg-emerald-500/10';
        if (periodicity === 'trimestral') return 'border-emerald-500/[0.70] text-emerald-500/[0.70] hover:bg-emerald-500/10';
        if (periodicity === 'mensal') return 'border-emerald-500/[0.60] text-emerald-500/[0.60] hover:bg-emerald-500/10';
    }

    return 'border-slate-700 text-slate-400 hover:bg-slate-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
        <div className="lg:col-span-12 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center justify-between relative">
        <div>
          <p className="text-slate-500 font-medium">
            Gerencie quais módulos e recursos estão disponíveis para cada plano.
          </p>
        </div>

        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
            <button 
                onClick={() => handleAutoConfigure('iniciante')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-xs"
            >
                <DynamicIcon name="Sparkles" size={16} />
                Config. Iniciante
            </button>
            <button 
                onClick={() => handleAutoConfigure('expandido')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all text-xs"
            >
                <DynamicIcon name="Sparkles" size={16} />
                Config. Expandido
            </button>
            <button 
                onClick={() => handleAutoConfigure('pro')}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all text-xs"
            >
                <DynamicIcon name="Sparkles" size={16} />
                Config. Pro
            </button>
        </div>
      </div>

      {/* Sidebar: Lista de Planos */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">
            Selecione o Plano
          </h3>
          <div className="space-y-2">
            {sortedPlans.map(plan => {
              const isSelected = selectedPlanId === plan.id;
              const colorClass = getPlanColor(plan.name);
              
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                    isSelected
                      ? `bg-slate-800 ${colorClass.replace('hover:', '')} shadow-lg`
                      : `bg-slate-950 hover:border-slate-700 ${colorClass}`
                  }`}
                >
                  <span className={`font-bold text-sm uppercase ${!isSelected && !colorClass.includes('text-') ? 'text-slate-400' : ''}`}>{plan.name}</span>
                  {isSelected && <ShieldCheck size={18} />}
                </button>
              );
            })}
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

                      {/* Lista de Planos para Backup Automático */}
                      {module.id === 'mod_backup_auto' && (
                        <div className="px-5 pb-5 pt-0 space-y-2">
                            <div className="h-px bg-slate-800/50 w-full mb-3" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Planos Compatíveis</p>
                            <div className="grid grid-cols-1 gap-2">
                                {sortedPlans.map(p => {
                                    const isPEnabled = !p.enabledModules || p.enabledModules.includes(module.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleModuleForPlan(p.id, module.id);
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                                                isPEnabled
                                                    ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isPEnabled ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                                                {p.name}
                                            </span>
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                                isPEnabled ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                                            }`}>
                                                {isPEnabled && <Check size={10} className="text-white" />}
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

      {/* Modal de Auto-Configuração */}
      {showAutoConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                        <DynamicIcon name="Sparkles" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Auto-Configurar</h3>
                        <p className="text-slate-400 text-sm">Aplicar regras padrão aos planos?</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Isso irá redefinir os módulos e limites dos planos do tipo <strong>{configType === 'iniciante' ? 'Iniciante' : configType === 'expandido' ? 'Expandido' : 'Pro'}</strong> com base nas regras padrão.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => setShowAutoConfigModal(false)}
                            disabled={isApplying}
                            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={executeAutoConfigure}
                            disabled={isApplying}
                            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isApplying ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Aplicando...
                                </>
                            ) : (
                                <>
                                    <DynamicIcon name="Check" size={16} />
                                    Confirmar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
