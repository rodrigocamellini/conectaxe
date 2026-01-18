import React, { useState } from 'react';
import { SpiritualEntity, ModulePermission, SystemConfig } from '../types';
import { Plus, Sparkles, X, Home, Layers, Award } from 'lucide-react';
import { DEFAULT_SYSTEM_CONFIG } from '../constants';

interface EntityManagementProps {
  entities: SpiritualEntity[];
  permissions: ModulePermission;
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
  onAddEntity: (name: string, type: SpiritualEntity['type']) => void;
  onDeleteEntity: (id: string) => void;
}

export const EntityManagement: React.FC<EntityManagementProps> = ({
  entities,
  permissions,
  config,
  onUpdateConfig,
  onAddEntity,
  onDeleteEntity
}) => {
  const [names, setNames] = useState({
    pai_cabeca: '',
    mae_cabeca: '',
    guia_frente: '',
    cargo: '',
    entidade: '',
    funcao: ''
  });
  const [newLine, setNewLine] = useState('');
  const [newType, setNewType] = useState('');
  const [newRezaLine, setNewRezaLine] = useState('');
  const [newRezaType, setNewRezaType] = useState('');
  const [newErvaCategory, setNewErvaCategory] = useState('');
  const [newErvaType, setNewErvaType] = useState('');
  const [newBanhoCategory, setNewBanhoCategory] = useState('');
  const [newBanhoType, setNewBanhoType] = useState('');

  const baseConfig = config || DEFAULT_SYSTEM_CONFIG;

  const sections: { type: SpiritualEntity['type']; label: string; icon: any; itemIcon: any }[] = [
    { type: 'pai_cabeca', label: 'Pai de Cabeça', icon: Layers, itemIcon: Sparkles },
    { type: 'mae_cabeca', label: 'Mãe de Cabeça', icon: Layers, itemIcon: Sparkles },
    { type: 'guia_frente', label: 'Guia de Frente', icon: Layers, itemIcon: Sparkles },
    { type: 'cargo', label: 'Cargos', icon: Award, itemIcon: Award },
    { type: 'entidade', label: 'Entidades', icon: Sparkles, itemIcon: Sparkles },
    { type: 'funcao', label: 'Funções da Casa', icon: Home, itemIcon: Home }
  ];

  const colors = baseConfig.spiritualSectionColors || {
    pai_cabeca: baseConfig.primaryColor,
    mae_cabeca: baseConfig.primaryColor,
    guia_frente: baseConfig.primaryColor,
    cargo: baseConfig.primaryColor,
    entidade: baseConfig.primaryColor,
    funcao: baseConfig.primaryColor
  };

  const pontoCategories =
    baseConfig.pontoCategories && baseConfig.pontoCategories.length > 0
      ? baseConfig.pontoCategories
      : [];
  const pontoTypes =
    baseConfig.pontoTypes && baseConfig.pontoTypes.length > 0
      ? baseConfig.pontoTypes
      : [];

  const rezaCategories =
    baseConfig.rezaCategories && baseConfig.rezaCategories.length > 0
      ? baseConfig.rezaCategories
      : [];
  const rezaTypes =
    baseConfig.rezaTypes && baseConfig.rezaTypes.length > 0
      ? baseConfig.rezaTypes
      : [];

  const ervaCategories =
    baseConfig.ervaCategories && baseConfig.ervaCategories.length > 0
      ? baseConfig.ervaCategories
      : [];
  const ervaTypes =
    baseConfig.ervaTypes && baseConfig.ervaTypes.length > 0
      ? baseConfig.ervaTypes
      : [];

  const banhoCategories =
    baseConfig.banhoCategories && baseConfig.banhoCategories.length > 0
      ? baseConfig.banhoCategories
      : [];
  const banhoTypes =
    baseConfig.banhoTypes && baseConfig.banhoTypes.length > 0
      ? baseConfig.banhoTypes
      : [];

  const handleAddLine = () => {
    if (!newLine.trim()) return;
    const value = newLine.trim();
    if (pontoCategories.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      pontoCategories: [...pontoCategories, value]
    });
    setNewLine('');
  };

  const handleRemoveLine = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      pontoCategories: pontoCategories.filter(v => v !== value)
    });
  };

  const handleAddType = () => {
    if (!newType.trim()) return;
    const value = newType.trim();
    if (pontoTypes.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      pontoTypes: [...pontoTypes, value]
    });
    setNewType('');
  };

  const handleRemoveType = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      pontoTypes: pontoTypes.filter(v => v !== value)
    });
  };

  const handleAddRezaLine = () => {
    if (!newRezaLine.trim()) return;
    const value = newRezaLine.trim();
    if (rezaCategories.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      rezaCategories: [...rezaCategories, value]
    });
    setNewRezaLine('');
  };

  const handleRemoveRezaLine = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      rezaCategories: rezaCategories.filter(v => v !== value)
    });
  };

  const handleAddRezaType = () => {
    if (!newRezaType.trim()) return;
    const value = newRezaType.trim();
    if (rezaTypes.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      rezaTypes: [...rezaTypes, value]
    });
    setNewRezaType('');
  };

  const handleRemoveRezaType = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      rezaTypes: rezaTypes.filter(v => v !== value)
    });
  };

  const handleAddErvaCategory = () => {
    if (!newErvaCategory.trim()) return;
    const value = newErvaCategory.trim();
    if (ervaCategories.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      ervaCategories: [...ervaCategories, value]
    });
    setNewErvaCategory('');
  };

  const handleRemoveErvaCategory = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      ervaCategories: ervaCategories.filter(v => v !== value)
    });
  };

  const handleAddErvaType = () => {
    if (!newErvaType.trim()) return;
    const value = newErvaType.trim();
    if (ervaTypes.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      ervaTypes: [...ervaTypes, value]
    });
    setNewErvaType('');
  };

  const handleRemoveErvaType = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      ervaTypes: ervaTypes.filter(v => v !== value)
    });
  };

  const handleAddBanhoCategory = () => {
    if (!newBanhoCategory.trim()) return;
    const value = newBanhoCategory.trim();
    if (banhoCategories.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      banhoCategories: [...banhoCategories, value]
    });
    setNewBanhoCategory('');
  };

  const handleRemoveBanhoCategory = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      banhoCategories: banhoCategories.filter(v => v !== value)
    });
  };

  const handleAddBanhoType = () => {
    if (!newBanhoType.trim()) return;
    const value = newBanhoType.trim();
    if (banhoTypes.includes(value)) return;
    onUpdateConfig({
      ...baseConfig,
      banhoTypes: [...banhoTypes, value]
    });
    setNewBanhoType('');
  };

  const handleRemoveBanhoType = (value: string) => {
    onUpdateConfig({
      ...baseConfig,
      banhoTypes: banhoTypes.filter(v => v !== value)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {sections.map(section => (
          <div
            key={section.type}
            className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[550px]"
            style={{ borderColor: colors[section.type] || baseConfig.primaryColor }}
          >
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: colors[section.type] || baseConfig.primaryColor }}
            >
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
                    onChange={e => setNames({ ...names, [section.type]: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && names[section.type]) {
                        onAddEntity(names[section.type], section.type);
                        setNames({ ...names, [section.type]: '' });
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (names[section.type]) {
                        onAddEntity(names[section.type], section.type);
                        setNames({ ...names, [section.type]: '' });
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
              {entities
                .filter(e => e.type === section.type)
                .map(entity => (
                  <div
                    key={entity.id}
                    className="group relative p-2 rounded-lg border bg-white shadow-sm transition-all hover:scale-[1.02]"
                    style={{ borderColor: colors[section.type] || baseConfig.primaryColor }}
                  >
                    <div className="flex items-center gap-2 pr-6">
                      <div
                        className="p-1 rounded bg-white shadow-xs"
                        style={{ color: colors[section.type] || baseConfig.primaryColor }}
                      >
                        <section.itemIcon size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase truncate tracking-tight">
                        {entity.name}
                      </span>
                    </div>

                    {permissions.delete && (
                      <button
                        onClick={() => onDeleteEntity(entity.id)}
                        className="absolute top-1/2 -translate-y-1/2 right-1.5 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Linhas e Entidades do Cancioneiro
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {pontoCategories.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Nova linha/entidade..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newLine}
                onChange={e => setNewLine(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddLine();
                  }
                }}
              />
              <button
                onClick={handleAddLine}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {pontoCategories.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveLine(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {pontoCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Tipos e Momentos do Ponto
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {pontoTypes.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Novo tipo/momento..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddType();
                  }
                }}
              />
              <button
                onClick={handleAddType}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {pontoTypes.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveType(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {pontoTypes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Linhas e Entidades das Rezas
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {rezaCategories.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Nova linha/entidade..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newRezaLine}
                onChange={e => setNewRezaLine(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRezaLine();
                  }
                }}
              />
              <button
                onClick={handleAddRezaLine}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {rezaCategories.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveRezaLine(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {rezaCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Tipos e Momentos da Reza
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {rezaTypes.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Novo tipo/momento..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newRezaType}
                onChange={e => setNewRezaType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRezaType();
                  }
                }}
              />
              <button
                onClick={handleAddRezaType}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {rezaTypes.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveRezaType(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {rezaTypes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sparkles size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        {/* ERVAS E BANHOS CONFIGURATION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Áreas de Atuação (Ervas)
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {ervaCategories.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Nova área..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newErvaCategory}
                onChange={e => setNewErvaCategory(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddErvaCategory();
                  }
                }}
              />
              <button
                onClick={handleAddErvaCategory}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {ervaCategories.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveErvaCategory(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {ervaCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sprout size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Tipos de Ervas
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {ervaTypes.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Novo tipo..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newErvaType}
                onChange={e => setNewErvaType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddErvaType();
                  }
                }}
              />
              <button
                onClick={handleAddErvaType}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {ervaTypes.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveErvaType(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {ervaTypes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Sprout size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Áreas de Atuação (Banhos)
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {banhoCategories.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Novo propósito..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newBanhoCategory}
                onChange={e => setNewBanhoCategory(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddBanhoCategory();
                  }
                }}
              />
              <button
                onClick={handleAddBanhoCategory}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {banhoCategories.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveBanhoCategory(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {banhoCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Droplets size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest">
              Propósitos (Banhos)
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black">
              {banhoTypes.length}
            </span>
          </div>
          <div className="p-3 border-b border-gray-100 bg-gray-50/30">
            <div className="flex gap-2">
              <input
                placeholder="Novo propósito..."
                className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                value={newBanhoType}
                onChange={e => setNewBanhoType(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddBanhoType();
                  }
                }}
              />
              <button
                onClick={handleAddBanhoType}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/20" style={{ scrollbarWidth: 'thin' }}>
            {banhoTypes.map(value => (
              <div
                key={value}
                className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-[10px] font-black uppercase tracking-tight hover:border-indigo-500/70 hover:shadow-sm transition-all"
              >
                <span className="truncate">{value}</span>
                <button
                  onClick={() => handleRemoveBanhoType(value)}
                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {banhoTypes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8 text-center space-y-2 opacity-40">
                <Droplets size={24} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Lista vazia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
