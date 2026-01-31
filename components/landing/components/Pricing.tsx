
import React from 'react';

const plans = [
  {
    name: "Iniciante",
    price: "49",
    description: "Para terreiros pequenos em início de jornada.",
    features: [
      "Até 30 Filhos de Santo",
      "Controle de Mensalidades",
      "Relatórios Financeiros Básicos",
      "Acesso Mobile",
    ]
  },
  {
    name: "Expandido",
    price: "89",
    description: "Ideal para casas em crescimento com alta rotatividade.",
    features: [
      "Filhos de Santo Ilimitados",
      "Controle de Estoque",
      "Escala de Trabalhos",
      "Envio de E-mail/WhatsApp",
      "Suporte Prioritário",
    ],
    recommended: true
  },
  {
    name: "Terreiro Pro",
    price: "149",
    description: "Gestão completa para grandes casas e fraternidades.",
    features: [
      "Múltiplas Unidades/Filiais",
      "Módulo de Loja Própria",
      "Consultoria de Implementação",
      "Backup Diário em 3 Locais",
      "Personalização de Domínio",
    ]
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="preços" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Planos Transparentes</h2>
          <p className="text-xl text-slate-600">Escolha o plano que melhor se adapta ao tamanho da sua corrente.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative p-8 rounded-3xl transition-all duration-300 ${plan.recommended ? 'bg-indigo-900 text-white shadow-2xl scale-105 z-10' : 'bg-white text-slate-900 border border-slate-200 hover:border-indigo-200 shadow-xl'}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Mais Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.recommended ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.description}</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">R$ {plan.price}</span>
                <span className={`text-lg font-medium ${plan.recommended ? 'text-indigo-300' : 'text-slate-400'}`}>/mês</span>
              </div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 ${plan.recommended ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.recommended ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg' : 'bg-slate-100 hover:bg-slate-200 text-indigo-900'}`}>
                Assinar Agora
              </button>
            </div>
          ))}
        </div>
        
        <p className="text-center mt-12 text-slate-500 text-sm">
          Sem taxas de adesão. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
