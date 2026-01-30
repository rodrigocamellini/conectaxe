import React from 'react';

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  visible?: boolean;
}

const DEFAULT_FEATURES = [
  {
    title: "Dashboard Principal",
    description: "Visão geral completa com indicadores, estatísticas e atalhos rápidos para a gestão do dia a dia.",
    icon: "📊"
  },
  {
    title: "Agenda de Eventos",
    description: "Calendário organizado de giras, festas e obrigações, mantendo todos informados sobre as datas importantes.",
    icon: "📅"
  },
  // ... (keeping a few defaults just in case)
];

interface FeaturesProps {
  modules?: any[];
}

const Features: React.FC<FeaturesProps> = ({ modules }) => {
  const displayFeatures = modules && modules.length > 0 ? modules.filter(m => m.visible) : DEFAULT_FEATURES;

  return (
    <section id="funcionalidades" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full font-bold text-sm mb-6 animate-pulse">
            FUNCIONALIDADES COMPLETAS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Tudo o que seu terreiro precisa em um só lugar
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Ferramentas desenvolvidas especificamente para as necessidades das casas de axé, respeitando as tradições e facilitando a organização.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feature: any, index: number) => (
            <div key={index} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-orange-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
