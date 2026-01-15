
import React, { useState } from 'react';
import { SpiritualEntity, ModulePermission } from '../types';
import { Plus, Trash2, Layers, Award, Sparkles, X, Home } from 'lucide-react';

interface EntityManagementProps {
  entities: SpiritualEntity[];
  permissions: ModulePermission;
  onAddEntity: (name: string, type: SpiritualEntity['type']) => void;
  onDeleteEntity: (id: string) => void;
}

export const EntityManagement: React.FC<EntityManagementProps> = ({ 
  entities, 
  permissions,
  onAddEntity, 
  onDeleteEntity 
}) => {
  const [names, setNames] = useState({ pai_cabeca: '', mae_cabeca: '', guia_frente: '', cargo: '', entidade: '', funcao: '' });

  const sections: { type: SpiritualEntity['type'], label: string, icon: any, itemIcon: any }[] = [
    { type: 'pai_cabeca', label: 'Pai de Cabeça', icon: Layers, itemIcon: Sparkles },
    { type: 'mae_cabeca', label: 'Mãe de Cabeça', icon: Layers, itemIcon: Sparkles },
    { type: 'guia_frente', label: 'Guia de Frente', icon: Layers, itemIcon: Sparkles },
    { type: 'cargo', label: 'Cargos', icon: Award, itemIcon: Award },
    { type: 'entidade', label: 'Entidades', icon: Sparkles, itemIcon: Sparkles },
    { type: 'funcao', label: 'Funções da Casa', icon: Home, itemIcon: Home },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {sections.map(section => (
        <div key={section.type} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[550px]">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between" style={{ backgroundColor: 'var(--primary-color)' }}>
            <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <section.icon size={14} />
              {section.label}
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {entities.filter(e => e.type === section.type).length}
            </span>
          </div>

          {permissions.add && (
            <div className="p-3 border-b border-gray-100 bg-gray-50/30">
              <div className="flex gap-2">
                <input 
                  placeholder="Novo..." 
                  className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  value={names[section.type]}
                  onChange={e => setNames({...names, [section.type]: e.target.value})}
                  onKeyDown={e => {
                    if(e.key === 'Enter' && names[section.type]) {
                      onAddEntity(names[section.type], section.type);
                      setNames({...names, [section.type]: ''});
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if(names[section.type]) {
                      onAddEntity(names[section.type], section.type);
                      setNames({...names, [section.type]: ''});
                    }
                  }}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {entities.filter(e => e.type === section.type).map(entity => (
              <div 
                key={entity.id} 
                className="group relative p-2 rounded-lg border border-indigo-100 bg-indigo-50/50 shadow-sm transition-all hover:scale-[1.02] hover:bg-white hover:border-indigo-300"
              >
                <div className="flex items-center gap-2 pr-6">
                  <div className="p-1 rounded bg-white shadow-xs text-indigo-600">
                    <section.itemIcon size={12} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-900 uppercase truncate tracking-tight">
                    {entity.name}
                  </span>
                </div>
                
                {permissions.delete && (
                  <button 
                    onClick={() => onDeleteEntity(entity.id)}
                    className="absolute top-1/2 -translate-y-1/2 right-1.5 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            ))}
            
            {entities.filter(e => e.type === section.type).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <section.icon size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
