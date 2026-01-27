import React, { useState, useMemo, useRef } from 'react';
import { Reza, SystemConfig } from '../types';
import { Plus, Trash2, Edit2, Search, Music, Youtube, Mic, BookOpen, X, PlayCircle, Save, Bold, Italic, Underline, Palette, Printer, Scroll } from 'lucide-react';

interface MediaRezasProps {
  rezas: Reza[];
  config: SystemConfig;
  onAddReza: (reza: Reza) => void;
  onUpdateReza: (id: string, reza: Partial<Reza>) => void;
  onDeleteReza: (id: string) => void;
}

const DEFAULT_TYPES = [
  'Abertura',
  'Proteção',
  'Louvação',
  'Encerramento'
];

const DEFAULT_CATEGORIES = [
  'Exu',
  'Pomba Gira',
  'Exu Mirim',
  'Ogum',
  'Oxossi',
  'Xangô',
  'Iansã',
  'Oxum',
  'Iemanjá',
  'Nanã',
  'Obaluaê',
  'Oxalá',
  'Preto Velho',
  'Caboclo',
  'Erê',
  'Boiadeiro',
  'Marinheiro',
  'Baiano',
  'Cigano',
  'Malandro'
];

export const MediaRezas: React.FC<MediaRezasProps> = ({
  rezas,
  config,
  onAddReza,
  onUpdateReza,
  onDeleteReza,
  activeTab
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form' | 'index'>('index');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [indexViewMode, setIndexViewMode] = useState<'general' | 'type' | 'category'>('general');
  const [lastViewMode, setLastViewMode] = useState<'list' | 'index'>('index');
  const [selectedReza, setSelectedReza] = useState<Reza | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  
  const typeOptions = (config.rezaTypes && config.rezaTypes.length > 0 ? config.rezaTypes : DEFAULT_TYPES).filter(
    (value, index, self) => self.indexOf(value) === index
  );
  const categoryOptions = (config.rezaCategories && config.rezaCategories.length > 0 ? config.rezaCategories : DEFAULT_CATEGORIES).filter(
    (value, index, self) => self.indexOf(value) === index
  );

  const [formData, setFormData] = useState<Partial<Reza>>({
    title: '',
    type: '',
    category: '',
    lyrics: '',
    youtubeUrl: '',
    audioUrl: ''
  });

  const filteredRezas = useMemo(() => {
    return rezas.filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.lyrics.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType ? r.type === filterType : true;
      const matchesCategory = filterCategory ? r.category === filterCategory : true;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [rezas, searchQuery, filterType, filterCategory]);

  const indexGroups = useMemo(() => {
    if (indexViewMode === 'general') {
      return [{
        key: 'Índice Geral',
        items: rezas.slice().sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      }];
    }

    if (indexViewMode === 'type') {
      const groups: Record<string, Reza[]> = {};
      rezas.forEach(r => {
        if (!r.type) return;
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
      });
      return Object.keys(groups)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map(key => ({
          key,
          items: groups[key].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
        }));
    }

    if (indexViewMode === 'category') {
      const groups: Record<string, Reza[]> = {};
      rezas.forEach(r => {
        if (!r.category) return;
        if (!groups[r.category]) groups[r.category] = [];
        groups[r.category].push(r);
      });
      return Object.keys(groups)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .map(key => ({
          key,
          items: groups[key].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
        }));
    }

    return [];
  }, [rezas, indexViewMode]);

  const applyFormatting = (before: string, after: string) => {
    const textarea = textRef.current;
    if (!textarea) return;
    const value = formData.lyrics || '';
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selected = value.slice(start, end) || 'texto';
    const newValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    setFormData({ ...formData, lyrics: newValue });
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handlePrint = () => {
    if (!selectedReza) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const safeTitle = selectedReza.title || '';
    const safeType = selectedReza.type || '';
    const safeCategory = selectedReza.category || '';
    const textHtml = selectedReza.lyrics || '';
    win.document.write(`
      <html>
        <head>
          <title>${safeTitle}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #0f172a; }
            h1 { font-size: 28px; margin-bottom: 4px; }
            h2 { font-size: 14px; margin: 0 0 24px 0; color: #6b7280; text-transform: uppercase; letter-spacing: .12em; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-right: 8px; }
            .badge-type { background: #eef2ff; color: #4f46e5; }
            .badge-category { background: #ecfeff; color: #0369a1; }
            .text { margin-top: 24px; font-size: 16px; line-height: 1.8; white-space: pre-wrap; font-family: Georgia, 'Times New Roman', serif; }
          </style>
        </head>
        <body>
          <h1>${safeTitle}</h1>
          <h2>Livro de Rezas</h2>
          <div>
            <span class="badge badge-type">${safeType}</span>
            <span class="badge badge-category">${safeCategory}</span>
          </div>
          <div class="text">${textHtml}</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleEdit = (reza: Reza) => {
    if (viewMode === 'list' || viewMode === 'index') {
      setLastViewMode(viewMode);
    }
    setFormData(reza);
    setSelectedReza(reza);
    setViewMode('form');
  };

  const handleView = (reza: Reza) => {
    if (viewMode === 'list' || viewMode === 'index') {
      setLastViewMode(viewMode);
    }
    setSelectedReza(reza);
    setViewMode('detail');
  };

  const handleAddNew = () => {
    if (viewMode === 'list' || viewMode === 'index') {
      setLastViewMode(viewMode);
    }
    setFormData({
      title: '',
      type: '',
      category: '',
      lyrics: '',
      youtubeUrl: '',
      audioUrl: ''
    });
    setSelectedReza(null);
    setViewMode('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.lyrics) return;

    if (selectedReza) {
      onUpdateReza(selectedReza.id, formData);
    } else {
      const newReza: Reza = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        title: formData.title!,
        type: formData.type || '',
        category: formData.category || '',
        lyrics: formData.lyrics!,
        youtubeUrl: formData.youtubeUrl,
        audioUrl: formData.audioUrl
      };
      onAddReza(newReza);
    }
    setViewMode(lastViewMode);
  };

  const getYoutubeEmbedId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Scroll className="text-indigo-600" />
            Livro de Rezas
          </h2>
          <p className="text-gray-500 text-sm mt-1">Organize e consulte as rezas e orações do terreiro.</p>
        </div>
        
        {(viewMode === 'list' || viewMode === 'index') && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('index')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  viewMode === 'index'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Índice
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Cartões
              </button>
            </div>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Reza
            </button>
          </div>
        )}

        {(viewMode === 'form' || viewMode === 'detail') && (
          <button
            onClick={() => setViewMode(lastViewMode)}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <X size={20} />
            Voltar
          </button>
        )}
      </div>

      {viewMode === 'list' && (
        <>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por título ou texto..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas as Linhas</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select 
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRezas.map(reza => (
              <div key={reza.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      {reza.category}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(reza)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if(window.confirm('Excluir esta reza?')) onDeleteReza(reza.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{reza.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {reza.type}
                  </p>
                  
                  <div className="flex gap-3 h-24">
                    <div className="flex-1 overflow-hidden relative">
                      <p className="text-gray-600 text-sm whitespace-pre-wrap font-serif italic">
                        {reza.lyrics}
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                    </div>
                    {reza.youtubeUrl && getYoutubeEmbedId(reza.youtubeUrl) && (
                      <div className="w-32 h-full shrink-0 rounded-lg overflow-hidden bg-black shadow-sm">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`https://www.youtube.com/embed/${getYoutubeEmbedId(reza.youtubeUrl)}?controls=0`}
                          title="YouTube video player" 
                          frameBorder="0" 
                          loading="lazy"
                          className="w-full h-full object-cover"
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-3 text-gray-400">
                    {reza.youtubeUrl && <Youtube size={18} className="text-red-500" />}
                    {reza.audioUrl && <Mic size={18} className="text-blue-500" />}
                  </div>
                  <button 
                    onClick={() => handleView(reza)}
                    className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    Ver Texto <BookOpen size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredRezas.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Music size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma reza encontrada.</p>
            </div>
          )}
        </>
      )}

      {viewMode === 'index' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em]">
                Índice de Rezas por Liturgia
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Visualize rapidamente todas as rezas separadas por linha/entidade ou tipo/momento.
              </p>
            </div>
            <div className="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIndexViewMode('general')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  indexViewMode === 'general'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Geral
              </button>
              <button
                type="button"
                onClick={() => setIndexViewMode('type')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  indexViewMode === 'type'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Por Momento
              </button>
              <button
                type="button"
                onClick={() => setIndexViewMode('category')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all ${
                  indexViewMode === 'category'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Por Entidade
              </button>
            </div>
          </div>

          {indexGroups.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Music size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma reza cadastrada.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {indexGroups.map(group => (
              <div
                key={group.key}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.18em]">
                    {group.key}
                  </h3>
                  <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-black">
                    {group.items.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.items.map(r => {
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleView(r)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {r.title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.type && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wide">
                                {r.type}
                              </span>
                            )}
                            {r.category && (
                              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-wide">
                                {r.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.youtubeUrl && (
                            <Youtube size={22} className="text-red-500" />
                          )}
                          <BookOpen size={22} className="text-gray-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'form' && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
          <h3 className="text-xl font-black text-gray-800 mb-6 pb-4 border-b border-gray-100">
            {selectedReza ? 'Editar Reza' : 'Nova Reza'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Título da Reza</label>
                <input 
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Reza de Proteção - Anjo de Guarda"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Linha / Entidade</label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">
                      Sem linha/entidade
                    </option>
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tipo / Momento</label>
                <div className="relative">
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={formData.type || ''}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">
                      Sem tipo/momento
                    </option>
                    {typeOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Link do YouTube (Opcional)</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.youtubeUrl}
                    onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Texto da Reza</label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.18em]">
                  Formatação Rápida
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyFormatting('<strong>', '</strong>')}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xs font-bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<em>', '</em>')}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xs font-bold"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<u>', '</u>')}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xs font-bold"
                  >
                    <Underline size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyFormatting(
                        '<span style="color:#dc2626">',
                        '</span>',
                      )
                    }
                    className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Palette size={14} />
                    <span className="text-[10px] uppercase">Cor</span>
                  </button>
                </div>
              </div>
              <textarea
                required
                rows={12}
                ref={textRef}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-lg leading-relaxed"
                value={formData.lyrics}
                onChange={e =>
                  setFormData({ ...formData, lyrics: e.target.value })
                }
                placeholder="Digite o texto da reza aqui... Use os botões acima para aplicar negrito, itálico, sublinhado ou cor."
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setViewMode(lastViewMode)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Salvar Reza
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'detail' && selectedReza && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-in zoom-in duration-300">
          <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Music size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wide border border-white/10">
                  {selectedReza.category}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wide border border-white/10">
                  {selectedReza.type}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{selectedReza.title}</h2>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-inner">
                <div
                  className="whitespace-pre-wrap font-serif text-xl text-gray-700 leading-loose font-medium"
                  dangerouslySetInnerHTML={{
                    __html: selectedReza.lyrics || '',
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {selectedReza.youtubeUrl && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Youtube className="text-red-600" />
                    Vídeo / Áudio
                  </h4>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    {getYoutubeEmbedId(selectedReza.youtubeUrl) ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${getYoutubeEmbedId(selectedReza.youtubeUrl)}`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-xs">Link inválido</div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                  <PlayCircle size={16} />
                  Dica de Uso
                </h4>
                <p className="text-blue-600 text-xs leading-relaxed">
                  Use esta reza preferencialmente durante o momento de <strong>{selectedReza.type}</strong> ou em trabalhos de <strong>{selectedReza.category}</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
             <button 
                onClick={() => setViewMode(lastViewMode)}
                className="text-gray-500 font-bold hover:text-gray-800 transition-colors"
              >
                Voltar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={() => handleEdit(selectedReza)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Edit2 size={16} /> Editar
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

