import React, { useMemo, useRef, useState } from 'react';
import { Banho, Erva, SystemConfig } from '../types';
import { Sprout, Droplets, Plus, Trash2, Edit2, Search, X, Upload, Image as ImageIcon, Info } from 'lucide-react';

interface MediaErvasBanhosProps {
  ervas: Erva[];
  banhos: Banho[];
  config: SystemConfig;
  onAddErva: (erva: Erva) => void;
  onUpdateErva: (id: string, erva: Partial<Erva>) => void;
  onDeleteErva: (id: string) => void;
  onAddBanho: (banho: Banho) => void;
  onUpdateBanho: (id: string, banho: Partial<Banho>) => void;
  onDeleteBanho: (id: string) => void;
}

const DEFAULT_ERVA_AREAS = [
  'Defumação',
  'Banhos',
  'Chás',
  'Ambiente'
];

const DEFAULT_BANHO_PURPOSES = [
  'Proteção',
  'Descarrego',
  'Abertura de Caminhos',
  'Limpeza',
  'Equilíbrio'
];

const DEFAULT_BANHO_DIRECTIONS = [
  'Da cabeça para baixo',
  'Do pescoço para baixo'
];

const DEFAULT_ERVA_PHOTO = '/images/erva_padrao.png';

export const MediaErvasBanhos: React.FC<MediaErvasBanhosProps> = ({
  ervas,
  banhos,
  config,
  onAddErva,
  onUpdateErva,
  onDeleteErva,
  onAddBanho,
  onUpdateBanho,
  onDeleteBanho
}) => {
  const [activeSection, setActiveSection] = useState<'ervas' | 'banhos'>('ervas');

  const [ervaViewMode, setErvaViewMode] = useState<'list' | 'form' | 'detail'>('list');
  const [banhoViewMode, setBanhoViewMode] = useState<'list' | 'form' | 'detail'>('list');

  const [selectedErva, setSelectedErva] = useState<Erva | null>(null);
  const [selectedBanho, setSelectedBanho] = useState<Banho | null>(null);

  const [ervaSearch, setErvaSearch] = useState('');
  const [ervaAreaFilter, setErvaAreaFilter] = useState('');
  const [ervaLineFilter, setErvaLineFilter] = useState('');

  const [banhoSearch, setBanhoSearch] = useState('');
  const [banhoPurposeFilter, setBanhoPurposeFilter] = useState('');
  const [banhoDirectionFilter, setBanhoDirectionFilter] = useState('');
  const [banhoTargetFilter, setBanhoTargetFilter] = useState('');

  const [ervaForm, setErvaForm] = useState<Partial<Erva>>({
    name: '',
    description: '',
    photo: '',
    areas: [],
    lines: []
  });

  const [banhoForm, setBanhoForm] = useState<Partial<Banho>>({
    name: '',
    description: '',
    ervaIds: [],
    area: '',
    target: '',
    purpose: '',
    direction: ''
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const lineOptions = useMemo(() => {
    if (config.pontoCategories && config.pontoCategories.length > 0) {
      return config.pontoCategories;
    }
    if (config.rezaCategories && config.rezaCategories.length > 0) {
      return config.rezaCategories;
    }
    return [];
  }, [config.pontoCategories, config.rezaCategories]);

  const ervaAreaOptions = DEFAULT_ERVA_AREAS;
  const banhoPurposeOptions = DEFAULT_BANHO_PURPOSES;
  const banhoDirectionOptions = DEFAULT_BANHO_DIRECTIONS;

  const filteredErvas = useMemo(() => {
    return ervas.filter(e => {
      const query = ervaSearch.toLowerCase();
      const matchesSearch =
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query);
      const matchesArea = ervaAreaFilter ? e.areas.includes(ervaAreaFilter) : true;
      const matchesLine = ervaLineFilter ? e.lines.includes(ervaLineFilter) : true;
      return matchesSearch && matchesArea && matchesLine;
    });
  }, [ervas, ervaSearch, ervaAreaFilter, ervaLineFilter]);

  const filteredBanhos = useMemo(() => {
    return banhos.filter(b => {
      const query = banhoSearch.toLowerCase();
      const matchesSearch =
        b.name.toLowerCase().includes(query) ||
        (b.description || '').toLowerCase().includes(query);
      const matchesPurpose = banhoPurposeFilter ? b.purpose === banhoPurposeFilter : true;
      const matchesDirection = banhoDirectionFilter ? b.direction === banhoDirectionFilter : true;
      const matchesTarget = banhoTargetFilter ? b.target === banhoTargetFilter : true;
      return matchesSearch && matchesPurpose && matchesDirection && matchesTarget;
    });
  }, [banhos, banhoSearch, banhoPurposeFilter, banhoDirectionFilter, banhoTargetFilter]);

  const handleToggleErvaArea = (area: string) => {
    setErvaForm(prev => {
      const current = prev.areas || [];
      const exists = current.includes(area);
      const areas = exists ? current.filter(a => a !== area) : [...current, area];
      return { ...prev, areas };
    });
  };

  const handleToggleErvaLine = (line: string) => {
    setErvaForm(prev => {
      const current = prev.lines || [];
      const exists = current.includes(line);
      const lines = exists ? current.filter(l => l !== line) : [...current, line];
      return { ...prev, lines };
    });
  };

  const handleToggleBanhoErva = (id: string) => {
    setBanhoForm(prev => {
      const current = prev.ervaIds || [];
      const exists = current.includes(id);
      const ervaIds = exists ? current.filter(eid => eid !== id) : [...current, id];
      return { ...prev, ervaIds };
    });
  };

  const handleOpenNewErva = () => {
    setSelectedErva(null);
    setErvaForm({
      name: '',
      description: '',
      photo: '',
      areas: [],
      lines: []
    });
    setErvaViewMode('form');
  };

  const handleOpenEditErva = (erva: Erva) => {
    setSelectedErva(erva);
    setErvaForm({
      name: erva.name,
      description: erva.description,
      photo: erva.photo,
      areas: erva.areas || [],
      lines: erva.lines || []
    });
    setErvaViewMode('form');
  };

  const handleOpenViewErva = (erva: Erva) => {
    setSelectedErva(erva);
    setErvaViewMode('detail');
  };

  const handleSubmitErva = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (ervaForm.name || '').trim();
    const description = (ervaForm.description || '').trim();
    const areas = ervaForm.areas || [];
    const lines = ervaForm.lines || [];
    if (!name || !description || areas.length === 0) return;

    if (selectedErva) {
      onUpdateErva(selectedErva.id, {
        name,
        description,
        photo: ervaForm.photo,
        areas,
        lines
      });
    } else {
      const newErva: Erva = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name,
        description,
        photo: ervaForm.photo || '',
        areas,
        lines,
        createdAt: new Date().toISOString()
      };
      onAddErva(newErva);
    }
    setErvaViewMode('list');
  };

  const handleOpenNewBanho = () => {
    setSelectedBanho(null);
    setBanhoForm({
      name: '',
      description: '',
      ervaIds: [],
      area: '',
      target: '',
      purpose: '',
      direction: ''
    });
    setBanhoViewMode('form');
  };

  const handleOpenEditBanho = (banho: Banho) => {
    setSelectedBanho(banho);
    setBanhoForm({
      name: banho.name,
      description: banho.description || '',
      ervaIds: banho.ervaIds || [],
      area: banho.area,
      target: banho.target,
      purpose: banho.purpose,
      direction: banho.direction
    });
    setBanhoViewMode('form');
  };

  const handleOpenViewBanho = (banho: Banho) => {
    setSelectedBanho(banho);
    setBanhoViewMode('detail');
  };

  const handleSubmitBanho = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (banhoForm.name || '').trim();
    const description = (banhoForm.description || '').trim();
    const ervaIds = banhoForm.ervaIds || [];
    const area = banhoForm.area || '';
    const target = banhoForm.target || '';
    const purpose = banhoForm.purpose || '';
    const direction = banhoForm.direction || '';
    if (!name || ervaIds.length === 0 || !area || !target || !purpose || !direction) return;

    if (selectedBanho) {
      onUpdateBanho(selectedBanho.id, {
        name,
        description,
        ervaIds,
        area,
        target,
        purpose,
        direction
      });
    } else {
      const newBanho: Banho = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name,
        description,
        ervaIds,
        area,
        target,
        purpose,
        direction,
        createdAt: new Date().toISOString()
      };
      onAddBanho(newBanho);
    }
    setBanhoViewMode('list');
  };

  const getErvaName = (id: string) => {
    const er = ervas.find(e => e.id === id);
    return er ? er.name : id;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setErvaForm(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderErvasSection = () => {
    if (ervaViewMode === 'form') {
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <Sprout className="text-emerald-600" />
                {selectedErva ? 'Editar Erva' : 'Nova Erva'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cadastre as ervas com foto, descrição, linhas e áreas de atuação.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErvaViewMode('list')}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitErva} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-2">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome da Erva</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={ervaForm.name || ''}
                  onChange={e => setErvaForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição / Propriedades</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                  value={ervaForm.description || ''}
                  onChange={e => setErvaForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Áreas de Atuação</label>
                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                      <Info size={12} />
                      Selecione se é para defumação, banho, etc.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ervaAreaOptions.map(area => {
                      const selected = (ervaForm.areas || []).includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleToggleErvaArea(area)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
                            selected
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Linhas / Entidades</label>
                    <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                      <Info size={12} />
                      Para quais linhas ou orixás ela serve.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {lineOptions.map(line => {
                      const selected = (ervaForm.lines || []).includes(line);
                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => handleToggleErvaLine(line)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          {line}
                        </button>
                      );
                    })}
                    {lineOptions.length === 0 && (
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Configure as linhas no módulo de entidades.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-32 h-32 rounded-2xl border border-gray-200 overflow-hidden mb-3 bg-white flex items-center justify-center">
                  {ervaForm.photo ? (
                    <img src={ervaForm.photo} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={40} className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-black uppercase flex items-center gap-2 hover:bg-gray-800 transition-all"
                >
                  <Upload size={14} />
                  Escolher Foto
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-[10px] text-gray-400 font-medium text-center mt-2">
                  Utilize uma foto da erva ou ilustração representativa.
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                {selectedErva ? 'Salvar Alterações' : 'Cadastrar Erva'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (ervaViewMode === 'detail' && selectedErva) {
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                {selectedErva.photo ? (
                  <img src={selectedErva.photo} className="w-full h-full object-cover" />
                ) : (
                  <Sprout size={40} className="text-emerald-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {selectedErva.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Erva cadastrada em {new Date(selectedErva.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedErva.areas.map(area => (
                    <span
                      key={area}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                    >
                      {area}
                    </span>
                  ))}
                  {selectedErva.lines.map(line => (
                    <span
                      key={line}
                      className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErvaViewMode('list')}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={16} />
              Voltar
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Descrição e Uso
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedErva.description}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Sprout size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Ervas Cadastradas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Biblioteca de ervas utilizadas em banhos, defumações e trabalhos espirituais.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex-1 relative min-w-[180px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou uso..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                value={ervaSearch}
                onChange={e => setErvaSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleOpenNewErva}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 justify-center shadow-sm hover:bg-emerald-700"
            >
              <Plus size={16} />
              Nova Erva
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 bg-white"
            value={ervaAreaFilter}
            onChange={e => setErvaAreaFilter(e.target.value)}
          >
            <option value="">Todas as Áreas</option>
            {ervaAreaOptions.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 bg-white"
            value={ervaLineFilter}
            onChange={e => setErvaLineFilter(e.target.value)}
          >
            <option value="">Todas as Linhas</option>
            {lineOptions.map(line => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredErvas.map(erva => (
            <div
              key={erva.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="flex gap-4 p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                  {erva.photo ? (
                    <img src={erva.photo} className="w-full h-full object-cover" />
                  ) : (
                    <Sprout size={32} className="text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-2">
                      {erva.name}
                    </h4>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditErva(erva)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Remover esta erva do cadastro?')) {
                            onDeleteErva(erva.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {erva.areas.map(area => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest"
                      >
                        {area}
                      </span>
                    ))}
                    {erva.lines.slice(0, 2).map(line => (
                      <span
                        key={line}
                        className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-600 line-clamp-3">
                    {erva.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenViewErva(erva)}
                className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-t border-gray-100 hover:bg-gray-100"
              >
                Ver detalhes e instruções de uso
              </button>
            </div>
          ))}
          {filteredErvas.length === 0 && (
            <div className="col-span-full">
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                <Sprout size={40} className="text-gray-200" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">
                  Nenhuma erva cadastrada
                </p>
                <p className="text-xs text-gray-400 max-w-md">
                  Comece cadastrando as ervas utilizadas na casa para organizar banhos, defumações
                  e outras aplicações.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewErva}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700"
                >
                  Cadastrar primeira erva
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBanhosSection = () => {
    if (banhoViewMode === 'form') {
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <Droplets className="text-sky-600" />
                {selectedBanho ? 'Editar Banho' : 'Novo Banho'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Monte a receita selecionando as ervas, propósito e forma de aplicação.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBanhoViewMode('list')}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitBanho} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-2">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome do Banho</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
                  value={banhoForm.name || ''}
                  onChange={e => setBanhoForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Descrição / Instruções</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px]"
                  value={banhoForm.description || ''}
                  onChange={e => setBanhoForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Área de Atuação</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    value={banhoForm.area || ''}
                    onChange={e => setBanhoForm(prev => ({ ...prev, area: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {ervaAreaOptions.map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Orixá / Entidade Alvo</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    value={banhoForm.target || ''}
                    onChange={e => setBanhoForm(prev => ({ ...prev, target: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {lineOptions.map(line => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Finalidade</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    value={banhoForm.purpose || ''}
                    onChange={e => setBanhoForm(prev => ({ ...prev, purpose: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {banhoPurposeOptions.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Direção da Aplicação</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    value={banhoForm.direction || ''}
                    onChange={e => setBanhoForm(prev => ({ ...prev, direction: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {banhoDirectionOptions.map(dir => (
                      <option key={dir} value={dir}>
                        {dir}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase">
                    Ervas Utilizadas
                  </label>
                  <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                    <Info size={12} />
                    Selecione na lista abaixo
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-2 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                  {ervas.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-medium text-center py-4">
                      Cadastre as ervas antes de montar um banho.
                    </p>
                  )}
                  {ervas.map(erva => {
                    const selected = (banhoForm.ervaIds || []).includes(erva.id);
                    return (
                      <button
                        key={erva.id}
                        type="button"
                        onClick={() => handleToggleBanhoErva(erva.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          selected
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-sky-50'
                        }`}
                      >
                        <span className="truncate text-left">{erva.name}</span>
                        {selected && <Droplets size={14} className="ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all"
              >
                {selectedBanho ? 'Salvar Alterações' : 'Cadastrar Banho'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (banhoViewMode === 'detail' && selectedBanho) {
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplets size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {selectedBanho.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                    {selectedBanho.area}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-widest">
                    {selectedBanho.purpose}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                    {selectedBanho.target}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                    {selectedBanho.direction}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBanhoViewMode('list')}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
            >
              <X size={16} />
              Voltar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Descrição e Orientações
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedBanho.description || 'Sem observações adicionais.'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Ervas deste Banho
              </h4>
              <div className="space-y-2">
                {selectedBanho.ervaIds.map(id => (
                  <div
                    key={id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700"
                  >
                    <span className="truncate">{getErvaName(id)}</span>
                    <Sprout size={14} className="text-emerald-500" />
                  </div>
                ))}
                {selectedBanho.ervaIds.length === 0 && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    Nenhuma erva associada a este banho.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
              <Droplets size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Banhos Cadastrados</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Organize receitas com ervas cadastradas, propósito espiritual e direção correta.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex-1 relative min-w-[180px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou finalidade..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500"
                value={banhoSearch}
                onChange={e => setBanhoSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleOpenNewBanho}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 justify-center shadow-sm hover:bg-sky-700"
            >
              <Plus size={16} />
              Novo Banho
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 bg-white"
            value={banhoPurposeFilter}
            onChange={e => setBanhoPurposeFilter(e.target.value)}
          >
            <option value="">Todas as Finalidades</option>
            {banhoPurposeOptions.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 bg-white"
            value={banhoDirectionFilter}
            onChange={e => setBanhoDirectionFilter(e.target.value)}
          >
            <option value="">Todas as Direções</option>
            {banhoDirectionOptions.map(dir => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 bg-white"
            value={banhoTargetFilter}
            onChange={e => setBanhoTargetFilter(e.target.value)}
          >
            <option value="">Todos os Orixás/Entidades</option>
            {lineOptions.map(line => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanhos.map(banho => (
            <div
              key={banho.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-2">
                    {banho.name}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanho(banho)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Remover este banho do cadastro?')) {
                          onDeleteBanho(banho.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest">
                    {banho.area}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[9px] font-black uppercase tracking-widest">
                    {banho.purpose}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest">
                    {banho.target}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest">
                    {banho.direction}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3 mt-1">
                  {banho.description || 'Sem observações adicionais.'}
                </p>
                <div className="mt-2 space-y-1.5">
                  {banho.ervaIds.slice(0, 3).map(id => {
                    const erva = ervas.find(e => e.id === id);
                    if (!erva) return null;
                    const subtitleSource = erva.areas.length > 0 ? erva.areas : erva.lines;
                    const photo = erva.photo && erva.photo.trim() !== '' ? erva.photo : DEFAULT_ERVA_PHOTO;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                          <img src={photo} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest truncate">
                            {erva.name}
                          </p>
                          {subtitleSource.length > 0 && (
                            <p className="text-[10px] text-gray-400 truncate">
                              {subtitleSource.join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {banho.ervaIds.length > 3 && (
                    <p className="text-[9px] font-black uppercase text-gray-400">
                      +{banho.ervaIds.length - 3} ervas
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenViewBanho(banho)}
                className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-gray-50 border-t border-gray-100 hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <Droplets size={14} />
                Ver detalhes e ervas
              </button>
            </div>
          ))}
          {filteredBanhos.length === 0 && (
            <div className="col-span-full">
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                <Droplets size={40} className="text-gray-200" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">
                  Nenhum banho cadastrado
                </p>
                <p className="text-xs text-gray-400 max-w-md">
                  Monte banhos selecionando ervas cadastradas, área de atuação, entidade alvo e
                  direção correta da aplicação.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewBanho}
                  className="mt-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700"
                >
                  Cadastrar primeiro banho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Sprout size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              Ervas e Banhos
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Cadastre as ervas da casa e monte banhos com direção e finalidade correta.
            </p>
          </div>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSection('ervas')}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1 ${
              activeSection === 'ervas'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sprout size={14} />
            Ervas
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('banhos')}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1 ${
              activeSection === 'banhos'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Droplets size={14} />
            Banhos
          </button>
        </div>
      </div>

      {activeSection === 'ervas' && renderErvasSection()}
      {activeSection === 'banhos' && renderBanhosSection()}
    </div>
  );
};
