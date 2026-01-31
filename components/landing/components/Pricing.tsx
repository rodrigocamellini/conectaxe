
import React from 'react';
import PlanComparison from './PlanComparison';

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

interface PricingProps {
  whatsappNumber?: string;
  messageIniciante?: string;
  messageExpandido?: string;
  messagePro?: string;
}

const Pricing: React.FC<PricingProps> = ({ 
  whatsappNumber, 
  messageIniciante, 
  messageExpandido, 
  messagePro 
}) => {
  return (
    <section id="preços" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Planos Transparentes</h2>
          <p className="text-xl text-slate-600">Escolha o plano que melhor se adapta ao tamanho da sua corrente.</p>
        </div>

        <PlanComparison 
          whatsappNumber={whatsappNumber}
          messageIniciante={messageIniciante}
          messageExpandido={messageExpandido}
          messagePro={messagePro}
        />

        <p className="text-center mt-6 text-slate-500 text-sm">
          Sem taxas de adesão. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
