
import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Users, 
  Package, 
  DollarSign, 
  Calendar, 
  Monitor, 
  PlayCircle, 
  HelpCircle, 
  Menu,
  MousePointer2
} from 'lucide-react';
import { TUTORIALS, CATEGORIES, Tutorial, TutorialStep } from '../helpData';

interface HelpCenterProps {
  onStartTour: () => void;
}

const MockVisual = ({ visual }: { visual: TutorialStep['mockVisual'] }) => {
  if (!visual) return null;

  const { type, label, highlight, context } = visual;

  return (
    <div className="bg-slate-100 rounded-xl p-6 border-2 border-slate-200 border-dashed flex flex-col items-center justify-center gap-3 my-4 relative overflow-hidden group">
      {context && (
        <span className="absolute top-2 left-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {context}
        </span>
      )}
      
      {type === 'button' && (
        <div className={`
          px-6 py-3 rounded-xl font-bold text-sm shadow-lg transform transition-all
          ${highlight ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-200' : 'bg-slate-200 text-slate-600'}
        `}>
          {label}
        </div>
      )}

      {type === 'menu' && (
        <div className="w-48 bg-slate-900 rounded-lg p-2 shadow-xl">
          <div className={`
            flex items-center gap-3 p-3 rounded-lg
            ${highlight ? 'bg-indigo-600 text-white' : 'text-slate-400'}
          `}>
            <Menu size={16} />
            <span className="text-xs font-bold">{label}</span>
          </div>
          {!highlight && <div className="mt-1 h-8 bg-slate-800/50 rounded-lg mx-2" />}
          {!highlight && <div className="mt-1 h-8 bg-slate-800/50 rounded-lg mx-2" />}
        </div>
      )}

      {type === 'form' && (
        <div className="w-64 bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="h-2 w-1/3 bg-slate-200 rounded-full" />
          <div className={`
            w-full h-10 rounded-lg border-2 flex items-center px-3 text-xs text-slate-400
            ${highlight ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 bg-slate-50'}
          `}>
            {label}
          </div>
          <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
        </div>
      )}

      {type === 'card' && (
        <div className={`
          w-56 h-32 rounded-2xl p-4 flex flex-col justify-between shadow-lg
          ${highlight ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white border border-slate-200'}
        `}>
          <div className="h-8 w-8 rounded-full bg-white/20" />
          <div>
             <div className="h-2 w-1/2 bg-white/40 rounded-full mb-2" />
             <div className="h-4 w-3/4 bg-white/80 rounded-full" />
          </div>
        </div>
      )}

      {type === 'generic' && (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <MousePointer2 size={24} className={highlight ? 'text-indigo-500 animate-bounce' : 'text-slate-400'} />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};

export const HelpCenter: React.FC<HelpCenterProps> = ({ onStartTour }) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const filteredTutorials = TUTORIALS.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users size={20} />;
      case 'Package': return <Package size={20} />;
      case 'DollarSign': return <DollarSign size={20} />;
      case 'Calendar': return <Calendar size={20} />;
      case 'Monitor': return <Monitor size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  if (selectedTutorial) {
    return (
      <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-500">
        <button 
          onClick={() => setSelectedTutorial(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} /> Voltar para Central de Ajuda
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 p-10 text-white">
            <div className="flex items-center gap-3 mb-4 opacity-80">
               <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                 {CATEGORIES.find(c => c.id === selectedTutorial.category)?.label || 'Geral'}
               </span>
            </div>
            <h2 className="text-3xl font-black mb-2">{selectedTutorial.title}</h2>
            <p className="text-indigo-100 font-medium text-lg">{selectedTutorial.description}</p>
          </div>

          <div className="p-10 space-y-12">
            {selectedTutorial.steps.map((step, idx) => (
              <div key={idx} className="flex gap-6 relative">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg border-4 border-white shadow-lg relative z-10">
                    {idx + 1}
                  </div>
                  {idx !== selectedTutorial.steps.length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-full bg-indigo-100 -ml-[1px] -z-0" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4 pt-1">
                  <p className="text-slate-700 font-medium text-lg leading-relaxed">
                    {step.text}
                  </p>
                  
                  {step.mockVisual && <MockVisual visual={step.mockVisual} />}

                  {step.tip && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-700 text-sm font-medium">
                      <div className="mt-0.5">💡</div>
                      <p>{step.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
             <p className="text-slate-500 text-sm font-medium mb-4">Ainda com dúvidas?</p>
             <button 
               onClick={onStartTour}
               className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
             >
               <PlayCircle size={18} /> Iniciar Tour Interativo do Sistema
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <LifeBuoy size={24} />
            </div>
            <span className="font-black tracking-widest uppercase text-xs opacity-80">Suporte e Documentação</span>
          </div>
          <h1 className="text-4xl font-black mb-4">Como podemos ajudar hoje?</h1>
          <p className="text-indigo-100 font-medium text-lg mb-8">
            Explore nossos guias passo a passo ou inicie um tour interativo pelo sistema.
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
            <input 
              type="text" 
              placeholder="Busque por 'cadastro', 'estoque', 'financeiro'..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 font-medium outline-none focus:bg-white/20 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('todos')}
          className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeCategory === 'todos' 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === cat.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {getIcon(cat.icon)}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map(tutorial => (
          <button
            key={tutorial.id}
            onClick={() => setSelectedTutorial(tutorial)}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group h-full flex flex-col"
          >
            <div className="mb-4 p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              {getIcon(CATEGORIES.find(c => c.id === tutorial.category)?.icon || 'HelpCircle')}
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">
              {tutorial.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6 flex-1">
              {tutorial.description}
            </p>
            <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-wider">
              Ler Tutorial <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}

        {/* Card do Joyride */}
        <button
          onClick={onStartTour}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all text-left group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="mb-4 p-3 bg-white/10 rounded-2xl w-fit text-white">
              <PlayCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2 leading-tight">
              Tour Interativo
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-6">
              Deixe o sistema te guiar pelas principais funcionalidades em tempo real.
            </p>
            <div className="flex items-center text-white font-bold text-xs uppercase tracking-wider">
              Iniciar Agora <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
        </button>
      </div>
    </div>
  );
};
