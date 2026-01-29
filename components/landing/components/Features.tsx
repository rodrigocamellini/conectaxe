import React from 'react';

const features = [
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
  {
    title: "Gestão de Eventos e Portaria",
    description: "Controle avançado de eventos com lista de convidados, check-in na portaria e venda de ingressos.",
    icon: "🎫"
  },
  {
    title: "Plataforma EAD",
    description: "Ambiente exclusivo para o aprendizado dos filhos de santo, com acesso a materiais de estudo e doutrina.",
    icon: "🎓"
  },
  {
    title: "Gestão de Cursos",
    description: "Ferramentas para mentores e pais/mães de santo criarem aulas e acompanharem o desenvolvimento teórico.",
    icon: "📚"
  },
  {
    title: "Pontos Cantados",
    description: "Acervo digital de áudios e letras dos pontos, organizados por linha e orixá para estudo da curimba.",
    icon: "🥁"
  },
  {
    title: "Rezas e Orações",
    description: "Biblioteca de preces e fundamentos litúrgicos, preservando a tradição oral da sua casa.",
    icon: "📿"
  },
  {
    title: "Ervas e Banhos",
    description: "Catálogo de conhecimentos sobre folhas, banhos e defumações, com suas propriedades e usos rituais.",
    icon: "🌿"
  },
  {
    title: "Cadastro de Membros",
    description: "Banco de dados seguro com informações completas dos filhos da casa, contatos e dados pessoais.",
    icon: "👥"
  },
  {
    title: "Caminhada Mediúnica",
    description: "Acompanhe a evolução espiritual e desenvolvimento de cada médium.",
    icon: "👣"
  },
  {
    title: "Obrigações do Médium",
    description: "Histórico completo de rituais, consagrações e obrigações.",
    icon: "✨"
  },
  {
    title: "Cadastro de Médiuns",
    description: "Fichas espirituais detalhadas com orixás, guias, datas de batismo e histórico de obrigações.",
    icon: "🕊️"
  },
  {
    title: "Cadastro de Consulentes",
    description: "Registro organizado dos visitantes e consulentes frequentes para melhor acolhimento e acompanhamento.",
    icon: "🙏"
  },
  {
    title: "Carteirinhas Digitais",
    description: "Geração automática de carteirinhas de identificação para membros e médiuns da casa.",
    icon: "💳"
  },
  {
    title: "Controle de Presença",
    description: "Sistema prático de chamada para acompanhar a assiduidade dos médiuns nas giras e trabalhos.",
    icon: "✅"
  },
  {
    title: "Gestão de Cantina",
    description: "Organize o cardápio, controle vendas em tempo real e acompanhe o caixa da cantina do terreiro.",
    icon: "☕"
  },
  {
    title: "Visualização de Estoque",
    description: "Painel rápido para conferir a disponibilidade de itens, velas, ervas e materiais rituais.",
    icon: "👁️"
  },
  {
    title: "Catálogo de Estoque",
    description: "Organização completa dos itens do almoxarifado, permitindo uma gestão eficiente dos recursos.",
    icon: "🗃️"
  },
  {
    title: "Entradas e Saídas",
    description: "Controle rigoroso do fluxo de materiais, registrando o que entra e o que é consumido na casa.",
    icon: "🔄"
  },
  {
    title: "Gestão de Mensalidades",
    description: "Controle financeiro das mensalidades, facilitando a organização das contribuições dos associados.",
    icon: "💲"
  },
  {
    title: "Gestão de Doações",
    description: "Registro transparente de todas as doações recebidas, auxiliando na prestação de contas da casa.",
    icon: "🎁"
  },
  {
    title: "Relatórios Financeiros",
    description: "Demonstrativos claros das receitas e despesas para uma gestão financeira transparente e segura.",
    icon: "📈"
  },
  {
    title: "Personalização do Sistema",
    description: "Configure a aparência, cores e logo do sistema para refletir a identidade visual do seu terreiro.",
    icon: "🎨"
  },
  {
    title: "Usuários e Permissões",
    description: "Gerencie quem tem acesso ao sistema e defina permissões específicas para cada função na casa.",
    icon: "🛡️"
  },
  {
    title: "Backup de Dados",
    description: "Segurança total com backups automáticos e possibilidade de exportação dos seus dados.",
    icon: "💾"
  },
  {
    title: "Sistema de Afiliados",
    description: "Ganhe comissões indicando o ConectAxé para outros terreiros e ajude a fortalecer nossa comunidade.",
    icon: "🤝"
  }
];

const Features: React.FC = () => {
  return (
    <section id="funcionalidades" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Tudo o que seu terreiro precisa para evoluir</h2>
          <p className="text-xl text-slate-600">Desenvolvemos ferramentas específicas para o dia a dia espiritual e administrativo das casas de Axé.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 group">
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
              <h3 className="text-lg font-bold text-indigo-950 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-snug">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
