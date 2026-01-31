import React from 'react';
import { Check, Minus, X, HelpCircle, Sprout, Zap, Crown } from 'lucide-react';

const PlanComparison: React.FC = () => {
  const features = [
    {
      category: "Essencial",
      items: [
        { name: "Gestão de Membros e Filhos", iniciante: "30 Membros e Consulentes", expandido: "100 Membros e Consulentes", pro: "Membros e Consulentes Ilimitados" },
        { name: "Cadastro de Entidades Espirituais", iniciante: true, expandido: true, pro: true },
        { name: "Mídia e Acervo (Pontos/Rezas)", iniciante: true, expandido: true, pro: true },
        { name: "Agenda de Giras", iniciante: "Visualização", expandido: "Completo", pro: "Completo" },
      ]
    },
    {
      category: "Financeiro & Recursos",
      items: [
        { name: "Controle de Mensalidades", iniciante: true, expandido: true, pro: true },
        { name: "Fluxo de Caixa e Relatórios", iniciante: false, expandido: true, pro: true },
        { name: "Cantina e PDV", iniciante: false, expandido: true, pro: true },
        { name: "Controle de Estoque", iniciante: false, expandido: true, pro: true },
      ]
    },
    {
      category: "Expansão & Ensino",
      items: [
        { name: "Gestão de Eventos", iniciante: false, expandido: "Lista Simples", pro: "Check-in Digital" },
        { name: "Plataforma EAD (Cursos)", iniciante: false, expandido: false, pro: true },
        { name: "Múltiplos Administradores", iniciante: false, expandido: false, pro: true },
        { name: "Auditoria de Ações", iniciante: false, expandido: false, pro: true },
      ]
    },
    {
      category: "Valores dos Planos",
      items: [
        { name: "Plano Mensal", iniciante: "R$9.999,00", expandido: "R$9.999,00", pro: "R$9.999,00" },
        { name: "Plano Trimestral", iniciante: "R$9.999,00", expandido: "R$9.999,00", pro: "R$9.999,00" },
        { name: "Plano Semestral", iniciante: "R$9.999,00", expandido: "R$9.999,00", pro: "R$9.999,00" },
        { name: "Plano Anual", iniciante: "R$9.999,00", expandido: "R$9.999,00", pro: "R$9.999,00" },
        { name: "Plano Vitalício", iniciante: "R$9.999,00", expandido: "R$9.999,00", pro: "R$9.999,00" },
      ]
    }
  ];

  return (
    <div className="mt-0 overflow-x-auto">
      <div className="min-w-[800px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 bg-slate-900 text-white p-6">
          <div className="flex items-end pb-2">
            <span className="font-bold text-lg text-slate-400 uppercase tracking-widest">Comparativo</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sprout className="text-slate-300" size={24} />
              <h3 className="font-bold text-xl text-slate-300">Iniciante</h3>
            </div>
            <p className="text-xs text-slate-400">Organização & Espiritualidade</p>
          </div>
          <div className="text-center relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg">
              MAIS POPULAR
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="text-indigo-400" size={24} />
              <h3 className="font-bold text-xl text-indigo-400">Expandido</h3>
            </div>
            <p className="text-xs text-slate-400">Gestão & Recursos</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="text-amber-400" size={24} />
              <h3 className="font-bold text-xl text-amber-400">Terreiro Pro</h3>
            </div>
            <p className="text-xs text-slate-400">Educação & Escala</p>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {features.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="bg-slate-50 px-6 py-3 font-bold text-sm text-amber-600 uppercase tracking-widest mt-0">
                {section.category}
              </div>
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="grid grid-cols-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center group">
                  <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    {item.name}
                    <HelpCircle size={14} className="text-slate-300 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Iniciante Column */}
                  <div className="text-center flex justify-center text-sm text-slate-600">
                    {item.iniciante === true ? (
                      <Check className="text-emerald-500" size={20} />
                    ) : item.iniciante === false ? (
                      <X className="text-red-500" size={20} />
                    ) : (
                      <span className="font-bold text-slate-700">{item.iniciante}</span>
                    )}
                  </div>

                  {/* Expandido Column */}
                  <div className="text-center flex justify-center text-sm text-slate-600 bg-indigo-50/30 -my-4 py-4">
                    {item.expandido === true ? (
                      <Check className="text-indigo-600" size={20} strokeWidth={3} />
                    ) : item.expandido === false ? (
                      <X className="text-red-500" size={20} />
                    ) : (
                      <span className="font-bold text-indigo-700">{item.expandido}</span>
                    )}
                  </div>

                  {/* Pro Column */}
                  <div className="text-center flex justify-center text-sm text-slate-600">
                    {item.pro === true ? (
                      <div className="bg-amber-100 p-1 rounded-full">
                        <Check className="text-amber-600" size={16} strokeWidth={3} />
                      </div>
                    ) : item.pro === false ? (
                      <X className="text-red-500" size={20} />
                    ) : (
                      <span className="font-bold text-amber-600">{item.pro}</span>
                    )}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {/* Footer Buttons */}
        <div className="grid grid-cols-4 p-8 bg-slate-50 border-t border-slate-200 gap-4">
          <div></div>
          <button className="py-3 rounded-xl bg-slate-600 text-white font-bold shadow-lg shadow-slate-300 hover:bg-slate-700 transition-all text-sm transform hover:-translate-y-1">
            Escolher Iniciante
          </button>
          <button className="py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm transform hover:-translate-y-1">
            Escolher Expandido
          </button>
          <button className="py-3 rounded-xl bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all text-sm transform hover:-translate-y-1">
            Falar com Consultor
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;
