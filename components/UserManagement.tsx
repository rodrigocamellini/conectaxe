
import React, { useState, useRef } from 'react';
import { User, SystemConfig, RoleDefinition } from '../types';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Camera, 
  Upload, 
  Shield, 
  User as UserIcon, 
  Lock, 
  Layers, 
  X, 
  Palette, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  HandHelping, 
  Heart, 
  Star, 
  Zap, 
  Medal,
  Settings,
  Leaf
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  config: SystemConfig;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateConfig: (config: SystemConfig) => void;
}

const SELECTABLE_ICONS = [
  { name: 'crown', icon: Crown },
  { name: 'shield', icon: ShieldCheck },
  { name: 'sparkles', icon: Sparkles },
  { name: 'hand-helping', icon: HandHelping },
  { name: 'user', icon: UserIcon },
  { name: 'heart', icon: Heart },
  { name: 'star', icon: Star },
  { name: 'zap', icon: Zap },
  { name: 'medal', icon: Medal },
  { name: 'settings', icon: Settings },
  { name: 'layers', icon: Layers },
  { name: 'leaf', icon: Leaf },
];

export const RoleIconComponent = ({ name, size = 16, className = "" }: { name?: string, size?: number, className?: string }) => {
  const IconComp = SELECTABLE_ICONS.find(i => i.name === name)?.icon || UserIcon;
  return <IconComp size={size} className={className} />;
};

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  config,
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  onUpdateConfig
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#6366f1');
  const [newRoleIcon, setNewRoleIcon] = useState('user');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'medium',
    password: '',
    photo: '',
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'medium', password: '', photo: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ ...user, password: '' });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const dataToSave = { ...formData };
      if (!dataToSave.password) delete dataToSave.password;
      onUpdateUser(editingId, dataToSave);
    } else {
      if (!formData.password) {
        alert("Senha é obrigatória para novos usuários.");
        return;
      }
      onAddUser(formData);
    }
    setShowModal(false);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const roleId = newRoleName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    
    if (config.userRoles.find(r => r.id === roleId)) {
      alert('Esta categoria já existe!');
      return;
    }

    const newRoles = [...config.userRoles, { id: roleId, label: newRoleName, color: newRoleColor, iconName: newRoleIcon }];
    onUpdateConfig({ ...config, userRoles: newRoles });
    setNewRoleName('');
    setNewRoleColor('#6366f1');
    setNewRoleIcon('user');
  };

  const handleDeleteRole = (id: string) => {
    if (id === 'admin') return;
    if (confirm('Deseja realmente excluir esta categoria? Usuários vinculados a ela perderão o acesso.')) {
      const newRoles = config.userRoles.filter(r => r.id !== id);
      onUpdateConfig({ ...config, userRoles: newRoles });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-2xl font-black text-gray-800 tracking-tight">Equipe Administrativa</h3>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Gerencie quem pode operar o sistema</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowRolesModal(true)}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase text-gray-500 shadow-sm hover:bg-gray-50 transition-all"
          >
            <Layers size={18} /> Categorias de Acesso
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex-1 md:flex-none px-6 py-3 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase shadow-xl transition-all active:scale-95"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Plus size={20} /> Novo Operador
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const role = config.userRoles.find(r => r.id === user.role);
          return (
            <div key={user.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 group transition-all hover:shadow-lg hover:border-indigo-100 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-1.5 h-full" 
                style={{ backgroundColor: role?.color || '#cbd5e1' }}
              />
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={24} className="text-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-800 truncate tracking-tight">{user.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold truncate mb-2 uppercase tracking-tight">{user.email}</p>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm text-white"
                    style={{ backgroundColor: role?.color || '#64748b' }}
                  >
                    <RoleIconComponent name={role?.iconName} size={10} />
                    {role?.label || user.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(user)}
                  className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => { if(confirm('Excluir este usuário?')) onDeleteUser(user.id); }}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Gestão de Categorias (Roles) */}
      {showRolesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Categorias de Acesso</h3>
                <p className="text-xs text-white/60 font-medium">Defina os tipos de cargo e ícones hierárquicos</p>
              </div>
              <button onClick={() => setShowRolesModal(false)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex gap-2 mb-4">
                  <input 
                    placeholder="Nome do Cargo..." 
                    className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 font-bold text-sm"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                  />
                  <div className="relative group p-1 bg-white border border-gray-200 rounded-2xl flex items-center justify-center">
                    <input 
                      type="color" 
                      className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent"
                      value={newRoleColor}
                      onChange={e => setNewRoleColor(e.target.value)}
                    />
                    <Palette size={14} className="absolute pointer-events-none text-white drop-shadow-md" />
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2">Selecione um Ícone representativo</p>
                   <div className="grid grid-cols-6 gap-2">
                      {SELECTABLE_ICONS.map(item => (
                        <button 
                          key={item.name}
                          type="button"
                          onClick={() => setNewRoleIcon(item.name)}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${newRoleIcon === item.name ? 'bg-white border-indigo-500 shadow-md text-indigo-600' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-200'}`}
                        >
                          <item.icon size={20} />
                        </button>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={handleAddRole}
                  className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Criar Nova Categoria
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {config.userRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl shadow-inner flex items-center justify-center text-white"
                        style={{ backgroundColor: role.color || '#cbd5e1' }}
                      >
                         <RoleIconComponent name={role.iconName} size={18} />
                      </div>
                      <span className="font-bold text-gray-700 text-sm uppercase tracking-tight">{role.label}</span>
                      {role.isSystem && <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">FIXO</span>}
                    </div>
                    {!role.isSystem && (
                      <button 
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 pt-0">
               <button 
                onClick={() => setShowRolesModal(false)}
                className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
              <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? 'Editar Operador' : 'Novo Operador'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-black/20 rounded-full transition-all">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400 transition-colors group relative shadow-inner"
                >
                  {formData.photo ? (
                    <>
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={28} className="text-gray-200 mb-1" />
                      <span className="text-[10px] text-gray-400 font-black uppercase">FOTO</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
                  <input 
                    required 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-bold text-gray-700"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">E-mail de Acesso</label>
                  <input 
                    required 
                    type="email"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-bold text-gray-700"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Cargo / Categoria</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-black text-gray-700 uppercase text-xs"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                  >
                    {config.userRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                    {editingId ? 'Nova Senha (deixe em branco se não quiser mudar)' : 'Senha de Acesso'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="password"
                      placeholder={editingId ? "••••••••" : "Mínimo 6 caracteres"}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-medium"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-400 font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {editingId ? 'Salvar' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
