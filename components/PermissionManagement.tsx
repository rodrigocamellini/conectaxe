
import React, { useState } from 'react';
import { StaffPermissions, SystemConfig, ModulePermission, RoleDefinition } from '../types';
import { ShieldCheck, Eye, Plus, Pencil, Trash2, Save, Info, Key, Minus, Users, Archive, RefreshCw, Wallet2, CheckCircle, X } from 'lucide-react';
import { RoleIconComponent } from './RoleIcon';

interface PermissionManagementProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
}

const MODULES = [
  { id: 'dashboard', label: 'Dashboard Principal', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'agenda', label: 'Agenda de Eventos', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'gestao_eventos', label: 'Giras e Eventos (Avançado)', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'ead', label: 'Plataforma EAD (Aluno)', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'course-mgmt', label: 'Gestão de Cursos (Professor)', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'members', label: 'Cadastro de Membros', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'mediums', label: 'Fichas Espirituais (Médiuns)', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'consulentes', label: 'Cadastro de Consulentes', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'idcards', label: 'Carteirinhas', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'attendance', label: 'Controle de Presença', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'inventory-dashboard', label: 'Itens em Estoque (Visual)', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'inventory', label: 'Catálogo de Estoque (Gestão)', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'inventory-entry', label: 'Entradas/Saídas de Estoque', supports: { view: true, add: true, edit: false, delete: false } },
  { id: 'cantina_pdv', label: 'Cantina (PDV)', supports: { view: true, add: true, edit: false, delete: false } },
  { id: 'cantina_gestao', label: 'Cantina (Gestão)', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'cantina_historico', label: 'Cantina (Histórico)', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'mensalidades', label: 'Gestão de Pagamentos', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'cash-flow', label: 'Fluxo de Caixa', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'donations', label: 'Gestão de Doações', supports: { view: true, add: true, edit: false, delete: true } },
  { id: 'finance-reports', label: 'Relatórios Financeiros', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'finance-config', label: 'Configuração Financeira', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'midia_pontos', label: 'Mídia: Pontos', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'midia_rezas', label: 'Mídia: Rezas', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'midia_ervas', label: 'Mídia: Ervas', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'maintenance-root', label: 'Configurações do Sistema', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'indicacoes', label: 'Programa de Afiliados', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'layout', label: 'Aparência e Layout', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'users', label: 'Usuários Operadores', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'entities', label: 'Categorias Espirituais', supports: { view: true, add: true, edit: true, delete: true } },
  { id: 'entity-images', label: 'Imagens das Entidades', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'permissions', label: 'Matriz de Permissões', supports: { view: true, add: false, edit: true, delete: false } },
  { id: 'backup', label: 'Backup de Dados', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'restore-system', label: 'Restaurar Sistema', supports: { view: true, add: false, edit: false, delete: false } },
  { id: 'saas-manager', label: 'Gestão de Assinatura', supports: { view: true, add: false, edit: false, delete: false } }
];

export const PermissionManagement: React.FC<PermissionManagementProps> = ({ config, onUpdateConfig }) => {
  const [selectedRole, setSelectedRole] = useState<string>(config.userRoles[1]?.id || 'staff');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [localPermissionsByRole, setLocalPermissionsByRole] = useState<Record<string, StaffPermissions>>(() => {
    const perms = { ...(config.rolePermissions || {}) };
    config.userRoles.forEach(role => {
      if (!perms[role.id]) {
        const defaultPerms: StaffPermissions = {};
        MODULES.forEach(mod => {
          defaultPerms[mod.id] = { view: false, add: false, edit: false, delete: false };
        });
        perms[role.id] = defaultPerms;
      }
    });
    return perms;
  });

  // Sync state with config prop when it changes (e.g. after async load)
  React.useEffect(() => {
    if (config.rolePermissions) {
      setLocalPermissionsByRole(prev => {
        const perms = { ...prev, ...config.rolePermissions };
        config.userRoles.forEach(role => {
          if (!perms[role.id]) {
            const defaultPerms: StaffPermissions = {};
            MODULES.forEach(mod => {
              defaultPerms[mod.id] = { view: false, add: false, edit: false, delete: false };
            });
            perms[role.id] = defaultPerms;
          }
        });
        return perms;
      });
    }
  }, [config.rolePermissions, config.userRoles]);

  const togglePermission = (roleId: string, moduleId: string, field: keyof ModulePermission) => {
    if (roleId === 'admin') return; 
    
    setLocalPermissionsByRole(prev => {
      const rolePerms = prev[roleId] || {};
      const modPerms = rolePerms[moduleId] || { view: false, add: false, edit: false, delete: false };
      
      return {
        ...prev,
        [roleId]: {
          ...rolePerms,
          [moduleId]: {
            ...modPerms,
            [field]: !modPerms[field]
          }
        }
      };
    });
  };

  const handleSave = () => {
    onUpdateConfig({
      ...config,
      rolePermissions: localPermissionsByRole
    });
    setShowSuccessModal(true);
  };

  const currentRole = config.userRoles.find(r => r.id === selectedRole);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle size={32} strokeWidth={3} />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-gray-900">Permissões Salvas!</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  As configurações de acesso para o perfil <strong>{currentRole?.label}</strong> foram atualizadas e já estão valendo para todos os usuários deste grupo.
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200 mt-4"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white flex items-center justify-between" style={{ backgroundColor: config.primaryColor }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Key size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black">Matriz de Acessos</h3>
              <p className="text-white/70 text-sm font-medium">Configure as permissões detalhadas por categoria de usuário</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-white rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{ color: config.primaryColor }}
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>

        <div className="bg-gray-50 p-2 flex gap-2 overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {config.userRoles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
                selectedRole === role.id 
                  ? 'bg-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-200 border-transparent'
              }`}
              style={selectedRole === role.id ? { borderColor: role.color || '#e2e8f0', color: role.color || '#4f46e5' } : {}}
            >
              <RoleIconComponent name={role.iconName} size={14} /> {role.label}
              {role.id === 'admin' && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">SISTEMA</span>}
            </button>
          ))}
        </div>

        <div className="p-8">
          {selectedRole === 'admin' ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
               <div className="p-6 bg-red-50 rounded-full text-red-600 shadow-inner">
                  <ShieldCheck size={64} />
               </div>
               <div className="max-w-md">
                  <h4 className="text-xl font-black text-gray-800">Acesso Administrativo Maestro</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed mt-2">
                    Usuários Administradores possuem permissão total em todos os módulos, incluindo ferramentas de gestão e plataforma de ensino.
                  </p>
                  <p className="text-[10px] text-gray-400 font-black uppercase mt-4 flex items-center justify-center gap-2">
                    <Info size={12} /> Nota: O acesso do Admin é absoluto e ignora as tabelas manuais de permissão.
                  </p>
               </div>
            </div>
          ) : (
            <>
              <div className="mb-8 bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                   <Info className="text-indigo-600" size={20} />
                </div>
                <div className="text-sm text-indigo-900">
                  <p className="font-bold uppercase tracking-tight flex items-center gap-2 mb-1">
                    Editando Permissões: 
                    <span className="px-3 py-1 rounded-lg text-white text-[10px] flex items-center gap-2 shadow-sm" style={{ backgroundColor: currentRole?.color }}>
                       <RoleIconComponent name={currentRole?.iconName} size={10} />
                       {currentRole?.label}
                    </span>
                  </p>
                  <p className="opacity-80">Marque abaixo o que este cargo pode acessar. O menu lateral do usuário será automaticamente atualizado.</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Módulo do Sistema</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Visualizar</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Adicionar</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Editar</th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Excluir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MODULES.map((module) => {
                      const perms = localPermissionsByRole[selectedRole] || {};
                      const perm = perms[module.id] || { view: false, add: false, edit: false, delete: false };
                      const { supports } = module;
                      
                      return (
                        <tr key={module.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{module.label}</span>
                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter mt-0.5">Módulo ID: {module.id}</p>
                          </td>
                          
                          <td className="px-4 py-5">
                            <button 
                              onClick={() => supports.view && togglePermission(selectedRole, module.id, 'view')}
                              className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                !supports.view ? 'bg-transparent text-gray-100 cursor-default' :
                                perm.view ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {supports.view ? <Eye size={20} strokeWidth={perm.view ? 3 : 2} /> : <Minus size={16} />}
                            </button>
                          </td>

                          <td className="px-4 py-5">
                            <button 
                              onClick={() => supports.add && togglePermission(selectedRole, module.id, 'add')}
                              className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                !supports.add ? 'bg-transparent text-gray-100 cursor-default' :
                                perm.add ? 'bg-blue-100 text-blue-600 shadow-sm' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {supports.add ? <Plus size={20} strokeWidth={perm.add ? 3 : 2} /> : <Minus size={16} />}
                            </button>
                          </td>

                          <td className="px-4 py-5">
                            <button 
                              onClick={() => supports.edit && togglePermission(selectedRole, module.id, 'edit')}
                              className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                !supports.edit ? 'bg-transparent text-gray-100 cursor-default' :
                                perm.edit ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {supports.edit ? <Pencil size={20} strokeWidth={perm.edit ? 3 : 2} /> : <Minus size={16} />}
                            </button>
                          </td>

                          <td className="px-4 py-5">
                            <button 
                              onClick={() => supports.delete && togglePermission(selectedRole, module.id, 'delete')}
                              className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                !supports.delete ? 'bg-transparent text-gray-100 cursor-default' :
                                perm.delete ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                            >
                              {supports.delete ? <Trash2 size={20} strokeWidth={perm.delete ? 3 : 2} /> : <Minus size={16} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
