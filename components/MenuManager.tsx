
import React, { useState, useEffect } from 'react';
import { MenuItemConfig, SystemConfig } from '../types';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
  X, 
  Save, 
  Search, 
  Layout,
  ChevronLeft
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { MENU_ICONS_CATALOG, DEFAULT_LOGO_URL, INITIAL_MASTER_MENU_CONFIG } from '../constants';

interface MenuManagerProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
}

const DynamicIcon = ({ name, size = 16, className = "", color }: { name: string, size?: number, className?: string, color?: string }) => {
  const IconComp = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComp size={size} className={className} style={color ? { color } : {}} />;
};

export const MenuManager: React.FC<MenuManagerProps> = ({ config, onUpdateConfig }) => {
  const [activeMenuType, setActiveMenuType] = useState<'client' | 'master'>('client');
  const [clientMenu, setClientMenu] = useState<MenuItemConfig[]>(config.menuConfig || []);
  const [masterMenu, setMasterMenu] = useState<MenuItemConfig[]>(config.masterMenuConfig || INITIAL_MASTER_MENU_CONFIG);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItemConfig> | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (config.menuConfig) setClientMenu(config.menuConfig);
  }, [config.menuConfig]);

  useEffect(() => {
    if (config.masterMenuConfig) setMasterMenu(config.masterMenuConfig);
  }, [config.masterMenuConfig]);

  const menu = activeMenuType === 'master' ? masterMenu : clientMenu;

  const saveMenu = (newMenu: MenuItemConfig[]) => {
    if (activeMenuType === 'master') {
      setMasterMenu(newMenu);
      onUpdateConfig({ ...config, masterMenuConfig: newMenu });
    } else {
      setClientMenu(newMenu);
      onUpdateConfig({ ...config, menuConfig: newMenu });
    }
  };

  const handleAddItem = (parentId?: string) => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const newItem: MenuItemConfig = { 
      id: `aba-${randomId}`, 
      label: 'Nova Aba', 
      icon: 'LayoutDashboard' 
    };

    if (!parentId) {
      saveMenu([...menu, newItem]);
    } else {
      const updateChildren = (items: MenuItemConfig[]): MenuItemConfig[] => {
        return items.map(item => {
          if (item.id === parentId) return { ...item, subItems: [...(item.subItems || []), newItem] };
          if (item.subItems) return { ...item, subItems: updateChildren(item.subItems) };
          return item;
        });
      };
      saveMenu(updateChildren(menu));
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Deseja excluir este item e todas as suas sub-abas?')) return;
    const filterItems = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items.filter(item => item.id !== id).map(item => ({ 
        ...item, 
        subItems: item.subItems ? filterItems(item.subItems) : undefined 
      }));
    };
    saveMenu(filterItems(menu));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const move = (items: MenuItemConfig[]): MenuItemConfig[] => {
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        const newItems = [...items];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < newItems.length) [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
        return newItems;
      }
      return items.map(i => ({ ...i, subItems: i.subItems ? move(i.subItems) : undefined }));
    };
    saveMenu(move(menu));
  };

  const startEdit = (item: MenuItemConfig) => {
    setEditingItem({ ...item });
    setShowEditor(true);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const update = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items.map(i => {
        if (i.id === editingItem.id) return editingItem as MenuItemConfig;
        if (i.subItems) return { ...i, subItems: update(i.subItems) };
        return i;
      });
    };
    saveMenu(update(menu));
    setShowEditor(false);
    setEditingItem(null);
  };

  const filteredIcons = MENU_ICONS_CATALOG.filter(i => i.toLowerCase().includes(iconSearch.toLowerCase()));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
      {/* LADO ESQUERDO: EDITOR */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-gray-50 p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
              <div>
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Editor de Navegação</h3>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Personalize a estrutura de menus</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 bg-slate-800 rounded-2xl p-1 text-[10px] font-black uppercase tracking-widest">
                  <button
                    onClick={() => setActiveMenuType('client')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${activeMenuType === 'client' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Menu do Terreiro
                  </button>
                  <button
                    onClick={() => setActiveMenuType('master')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${activeMenuType === 'master' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Painel Master
                  </button>
                </div>
                <button 
                  onClick={() => handleAddItem()} 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> Nova Aba Principal
                </button>
              </div>
           </div>
           
           <div className="space-y-4">
              {menu.map((item) => (
                <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-3 p-4 bg-slate-950/40 border border-slate-800 rounded-2xl group hover:border-indigo-500 transition-all">
                      <div className="p-2 bg-slate-900 rounded-xl shadow-sm border border-slate-700" style={item.color ? { color: item.color } : { color: config.primaryColor }}>
                        <DynamicIcon name={item.icon} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-50 uppercase text-xs">{item.label}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">{item.id}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => moveItem(item.id, 'up')} className="p-2 text-gray-400 hover:text-indigo-600"><ChevronUp size={16} /></button>
                         <button onClick={() => moveItem(item.id, 'down')} className="p-2 text-gray-400 hover:text-indigo-600"><ChevronDown size={16} /></button>
                         <button onClick={() => handleAddItem(item.id)} title="Nova Sub-aba" className="p-2 text-emerald-400"><Plus size={16} /></button>
                         <button onClick={() => startEdit(item)} className="p-2 text-indigo-500"><Pencil size={16} /></button>
                         <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400"><Trash2 size={16} /></button>
                      </div>
                   </div>
                   
                   <div className="ml-12 space-y-2 border-l-2 border-slate-800 pl-4">
                      {item.subItems?.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl group/sub hover:border-indigo-500/70 transition-all">
                           <div className="p-1.5 bg-slate-950 rounded-lg" style={sub.color ? { color: sub.color } : { color: config.primaryColor }}>
                             <DynamicIcon name={sub.icon} size={14} />
                           </div>
                           <span className="flex-1 text-[11px] font-bold text-slate-100 uppercase">{sub.label}</span>
                           <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                              <button onClick={() => moveItem(sub.id, 'up')} className="p-1 text-gray-300"><ChevronUp size={14} /></button>
                              <button onClick={() => moveItem(sub.id, 'down')} className="p-1 text-gray-300"><ChevronDown size={14} /></button>
                              <button onClick={() => startEdit(sub)} className="p-1 text-indigo-400 ml-2"><Pencil size={14} /></button>
                              <button onClick={() => handleDeleteItem(sub.id)} className="p-1 text-red-300"><Trash2 size={14} /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* LADO DIREITO: PREVIEW REAL-TIME */}
      <div className="xl:col-span-4 no-print">
        <div className="sticky top-8 space-y-4">
           <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 flex flex-col h-[600px]">
              <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                       <Layout size={16} />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Simulador Sidebar</span>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ backgroundColor: activeMenuType === 'master' ? '#020617' : config.sidebarColor }}>
                 {menu.map(item => {
                    const hasSub = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedPreview === item.id;
                    const itemColor = item.color || (activeMenuType === 'master' ? '#e5e7eb' : config.sidebarTextColor);

                    return (
                       <div key={item.id} className="space-y-1">
                          <button 
                             onClick={() => hasSub && setExpandedPreview(isExpanded ? null : item.id)}
                             className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                             style={{ color: itemColor }}
                          >
                             <div className="flex items-center gap-3">
                                <DynamicIcon name={item.icon} size={16} />
                                <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{item.label}</span>
                             </div>
                             {hasSub && <ChevronRight size={12} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />}
                          </button>

                          {hasSub && isExpanded && (
                             <div className="ml-6 space-y-1 border-l border-white/10 pl-2 animate-in slide-in-from-top-2 duration-200">
                                {item.subItems!.map(sub => (
                                   <div key={sub.id} className="p-2 text-[9px] font-black uppercase flex items-center gap-2 opacity-60" style={{ color: sub.color || config.sidebarTextColor }}>
                                      <DynamicIcon name={sub.icon} size={12} />
                                      {sub.label}
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    )
                 })}
              </div>
              
              <div className="p-4 bg-slate-950/80 text-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Visualização em Tempo Real</p>
              </div>
           </div>
           
           <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                 <LucideIcons.Info size={14} /> Dica Master
              </h4>
              <p className="text-[10px] font-medium leading-relaxed opacity-80">
                 As alterações feitas aqui são aplicadas globalmente para todos os usuários que tiverem permissão de acesso à respectiva aba.
              </p>
           </div>
        </div>
      </div>

      {/* MODAL DO EDITOR */}
      {showEditor && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Pencil size={24} />
                    <h3 className="text-xl font-black uppercase">Editar Aba</h3>
                 </div>
                 <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome de Exibição</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:ring-2" value={editingItem.label} onChange={e => setEditingItem({...editingItem, label: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cor Fixa (Opcional)</label>
                    <div className="flex items-center gap-4">
                       <input type="color" className="w-14 h-14 rounded-2xl border-none cursor-pointer p-0 bg-transparent shadow-sm" value={editingItem.color || '#6366f1'} onChange={e => setEditingItem({...editingItem, color: e.target.value})} />
                       <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-xs font-bold text-gray-400">{editingItem.color || 'Usando Padrão'}</div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escolher Ícone</label>
                       <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                          <input placeholder="Buscar..." className="pl-6 pr-2 py-1 text-[10px] bg-gray-100 rounded-lg outline-none" value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
                       </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 rounded-2xl max-h-40 overflow-y-auto">
                       {filteredIcons.map(iconName => (
                          <button key={iconName} onClick={() => setEditingItem({...editingItem, icon: iconName})} className={`p-3 rounded-xl transition-all flex items-center justify-center border-2 ${editingItem.icon === iconName ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110' : 'bg-white border-transparent text-gray-400 hover:border-gray-200'}`}>
                             <DynamicIcon name={iconName} size={20} />
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
                 <button onClick={() => setShowEditor(false)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black uppercase text-xs">Cancelar</button>
                 <button onClick={saveEdit} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"><Save size={18} /> Salvar Aba</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
