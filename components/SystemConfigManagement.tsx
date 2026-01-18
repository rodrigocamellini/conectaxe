
import React, { useState, useRef } from 'react';
import { SystemConfig } from '../types';
import { Palette, Type, Layout, Upload, Save, RefreshCcw, Sparkle, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_SYSTEM_CONFIG, DEFAULT_LOGO_URL } from '../constants';

interface SystemConfigManagementProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
}

export const SystemConfigManagement: React.FC<SystemConfigManagementProps> = ({ config, onUpdateConfig }) => {
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const spiritualColors =
    formData.spiritualSectionColors ||
    DEFAULT_SYSTEM_CONFIG.spiritualSectionColors || {
      pai_cabeca: formData.primaryColor,
      mae_cabeca: formData.primaryColor,
      guia_frente: formData.primaryColor,
      cargo: formData.primaryColor,
      entidade: formData.primaryColor,
      funcao: formData.primaryColor
    };

  const spiritualSections = [
    { key: 'pai_cabeca', label: 'Pai de Cabeça' },
    { key: 'mae_cabeca', label: 'Mãe de Cabeça' },
    { key: 'guia_frente', label: 'Guia de Frente' },
    { key: 'cargo', label: 'Cargos' },
    { key: 'entidade', label: 'Entidades' },
    { key: 'funcao', label: 'Funções da Casa' }
  ] as const;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateConfig(formData);
    alert('Configurações de layout salvas com sucesso!');
  };

  const handleReset = () => {
    if (confirm('Deseja realmente resetar o layout para o padrão da aplicação?')) {
      setFormData(DEFAULT_SYSTEM_CONFIG);
      onUpdateConfig(DEFAULT_SYSTEM_CONFIG);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-indigo-600 text-white flex items-center justify-between" style={{ backgroundColor: formData.primaryColor }}>
          <div className="flex items-center gap-3">
            <Layout size={24} />
            <h3 className="text-xl font-bold">Personalização do Sistema</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCcw size={16} /> Resetar Padrão
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-white rounded-lg text-sm font-extrabold flex items-center gap-2 shadow-lg transition-all active:scale-95"
              style={{ color: formData.primaryColor }}
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Identidade */}
          <div className="space-y-8">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} style={{ color: formData.primaryColor }} /> Identidade Visual
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Sistema / Terreiro</label>
                <input 
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all font-medium"
                  style={{ '--tw-ring-color': formData.primaryColor } as any}
                  value={formData.systemName}
                  onChange={e => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="Ex: Terreiro Estrela do Oriente"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">Logo do Terreiro</label>
                
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-32 h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group shrink-0 shadow-inner">
                    <img src={formData.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <ImageIcon size={24} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                     <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                        <button 
                          onClick={() => setLogoInputMode('upload')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${logoInputMode === 'upload' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Upload size={12} /> Upload
                        </button>
                        <button 
                          onClick={() => setLogoInputMode('url')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${logoInputMode === 'url' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <LinkIcon size={12} /> Link Externo
                        </button>
                     </div>

                     {logoInputMode === 'upload' ? (
                       <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Selecione um arquivo de imagem:</p>
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2"
                         >
                            <Upload size={14} /> Escolher do Computador
                         </button>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                       </div>
                     ) : (
                       <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Cole a URL direta da imagem:</p>
                         <div className="relative">
                            <input 
                              type="text"
                              className="w-full p-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 transition-all"
                              style={{ '--tw-ring-color': formData.primaryColor } as any}
                              placeholder="https://exemplo.com/logo.png"
                              value={formData.logoUrl?.startsWith('data:') ? '' : formData.logoUrl}
                              onChange={e => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                            />
                            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                         </div>
                       </div>
                     )}
                     <p className="text-[10px] text-gray-400 italic">Recomendado: Imagens em formato PNG com fundo transparente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cores e Fontes */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} style={{ color: formData.primaryColor }} /> Estilização
            </h4>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 shadow-sm"
                      value={formData.primaryColor}
                      onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formData.primaryColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Cor do Menu</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 shadow-sm"
                      value={formData.sidebarColor}
                      onChange={e => setFormData(prev => ({ ...prev, sidebarColor: e.target.value }))}
                    />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formData.sidebarColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                    Escrita do Menu
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 shadow-sm"
                      value={formData.sidebarTextColor}
                      onChange={e => setFormData(prev => ({ ...prev, sidebarTextColor: e.target.value }))}
                    />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formData.sidebarTextColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1">
                    Destaque <Sparkle size={10} className="text-amber-400" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-none p-0 shadow-sm"
                      value={formData.accentColor}
                      onChange={e => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                    />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{formData.accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                  Cores das Barras Espirituais
                  <Sparkle size={10} className="text-amber-400" />
                </label>
                <p className="text-[11px] text-gray-400">
                  Personalize as barras usadas em &quot;Config. Espirituais&quot; para cada tipo.
                </p>
                <div className="space-y-2 mt-2">
                  {spiritualSections.map(section => {
                    const value = spiritualColors[section.key];
                    return (
                      <div key={section.key} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-2 rounded-full border border-black/5"
                            style={{ backgroundColor: value }}
                          />
                          <span className="text-[11px] font-black uppercase text-gray-500">
                            {section.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 shadow-sm"
                            value={value}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                spiritualSectionColors: {
                                  ...(prev.spiritualSectionColors || spiritualColors),
                                  [section.key]: e.target.value
                                }
                              }))
                            }
                          />
                          <span className="text-[10px] font-mono text-gray-400 uppercase min-w-[84px] text-right">
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tamanho da Fonte (Dashboard)</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setFormData(prev => ({ ...prev, dashboardFontSize: size }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        formData.dashboardFontSize === size 
                          ? 'bg-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      style={formData.dashboardFontSize === size ? { color: formData.primaryColor } : {}}
                    >
                      {size === 'small' ? 'Pequena' : size === 'medium' ? 'Média' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/50">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Preview em tempo real</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div 
              className="w-full sm:w-48 h-24 rounded-xl flex items-center justify-center gap-2 shadow-md border border-black/5 overflow-hidden"
              style={{ backgroundColor: formData.sidebarColor }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white overflow-hidden shrink-0">
                <img src={formData.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain p-1" alt="Logo" />
              </div>
              <span className="font-bold text-xs truncate max-w-[100px]" style={{ color: formData.sidebarTextColor }}>{formData.systemName}</span>
            </div>
            <div className="flex-1 h-24 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col justify-center">
              <div 
                className="w-1/3 h-2 rounded-full mb-2"
                style={{ backgroundColor: formData.accentColor }}
              />
              <div className="w-2/3 h-2 bg-gray-100 rounded-full mb-2" />
              <div 
                className="font-black text-gray-800"
                style={{ fontSize: formData.dashboardFontSize === 'small' ? '12px' : formData.dashboardFontSize === 'medium' ? '16px' : '20px' }}
              >
                Preview de texto
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
