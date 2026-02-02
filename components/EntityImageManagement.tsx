
import React, { useRef, useState, useEffect } from 'react';
import { SpiritualEntity, SystemConfig } from '../types';
import { DEFAULT_ENTITY_IMAGES, INITIAL_ENTITIES } from '../constants';
import { Image as ImageIcon, Upload, Camera, Trash2, Search, Info, Sparkles, Layers } from 'lucide-react';

interface EntityImageManagementProps {
  entities: SpiritualEntity[];
  config: SystemConfig;
  onUpdateEntity: (id: string, data: Partial<SpiritualEntity>) => void;
  onAddEntity: (entity: Partial<SpiritualEntity>) => void;
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const ENTITY_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z'/%3E%3Cpath d='M12 6a3 3 0 1 0 3 3 3 3 0 0 0-3-3z'/%3E%3Cpath d='M6 19a6 6 0 0 1 12 0'/%3E%3C/svg%3E";

export const EntityImageManagement: React.FC<EntityImageManagementProps> = ({ 
  entities, 
  config, 
  onUpdateEntity,
  onAddEntity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Ensure default entities exist
  useEffect(() => {
    const missingEntities = INITIAL_ENTITIES.filter(
      initial => !entities.some(e => e.name === initial.name && e.type === initial.type)
    );

    if (missingEntities.length > 0) {
      console.log('Populating missing entities in Image Management:', missingEntities.length);
      missingEntities.forEach(entity => {
        onAddEntity(entity);
      });
    }
  }, [entities, onAddEntity]);

  const sections: { type: SpiritualEntity['type'], label: string, icon: any }[] = [
    { type: 'pai_cabeca', label: 'Pais de Cabeça', icon: Layers },
    { type: 'mae_cabeca', label: 'Mães de Cabeça', icon: Layers },
    { type: 'guia_frente', label: 'Guias de Frente', icon: Sparkles },
    { type: 'entidade', label: 'Entidades de Trabalho', icon: Sparkles },
  ];

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 800KB to be safe with Firestore 1MB limit)
      if (file.size > 800 * 1024) {
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 800KB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateEntity(id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    if (confirm('Deseja remover a imagem padrão desta entidade?')) {
      onUpdateEntity(id, { imageUrl: undefined });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 border-b border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40 mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome em todas as categorias..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm font-medium"
              style={{ '--tw-ring-color': config.primaryColor } as any}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
           <Info size={14} className="text-indigo-500" />
           Gerencie as fotos padrão das entidades do terreiro
        </div>
      </div>

      {sections.map(section => {
        const filteredEntities = entities.filter(e => 
          e.type === section.type && 
          (e.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <div key={section.type} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <section.icon size={20} />
               </div>
               <h3 className="text-lg font-black text-gray-700 uppercase tracking-tight">{section.label}</h3>
               <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400">
                 {filteredEntities.length}
               </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEntities.map(entity => {
                const slug = slugify(entity.name);
                // First check if there is a hardcoded default image for this entity ID or fallback to slug
                const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id] || `/images/entities/${slug}.png`;
                const hasCustomImage = !!entity.imageUrl;
                const showDefault = !hasCustomImage && !imageErrors[entity.id];

                return (
                <div key={entity.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                    {(hasCustomImage || showDefault) ? (
                      <img 
                        src={hasCustomImage ? entity.imageUrl : defaultImage} 
                        alt={entity.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={() => {
                          if (!hasCustomImage) {
                            setImageErrors(prev => ({ ...prev, [entity.id]: true }));
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-8">
                        <ImageIcon size={48} className="opacity-20 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-tighter">Sem Imagem Padrão</p>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => fileInputRefs.current[entity.id]?.click()}
                        className="p-3 bg-white text-indigo-600 rounded-2xl hover:scale-110 transition-transform shadow-lg"
                        title="Fazer Upload"
                      >
                        <Upload size={20} />
                      </button>
                      {entity.imageUrl && (
                        <button 
                          onClick={() => removeImage(entity.id)}
                          className="p-3 bg-white text-red-500 rounded-2xl hover:scale-110 transition-transform shadow-lg"
                          title="Remover Imagem"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      ref={el => fileInputRefs.current[entity.id] = el}
                      onChange={e => handleFileChange(entity.id, e)}
                    />
                  </div>
                  
                  <div className="p-6 text-center border-t border-gray-50">
                    <h4 className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tight">{entity.name}</h4>
                  </div>
                </div>
              )})}

              {filteredEntities.length === 0 && (
                <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                   <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Nenhum item em {section.label}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
