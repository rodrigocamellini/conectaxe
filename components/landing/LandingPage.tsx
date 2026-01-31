import React, { useState, useEffect } from 'react';
import { LandingPageService, LandingPageConfig } from '../../services/landingPageService';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import AIAssistant from './components/AIAssistant';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { FAQItem, SocialConfig } from './types';
import './Marquee.css';

interface ClientLogo {
  id: string;
  name: string;
  location: string;
  logoUrl: string;
  visible: boolean;
}

const DEFAULT_CLIENT_LOGOS: ClientLogo[] = [
  { id: '1', name: 'Ilê Axé Ogum', location: 'Irecê - BA', logoUrl: 'https://ui-avatars.com/api/?name=IA&background=f97316&color=fff&rounded=true&bold=true', visible: true },
  { id: '2', name: 'Aldeia Beira Mar', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=AB&background=4f46e5&color=fff&rounded=true&bold=true', visible: true },
  { id: '3', name: 'Terreiro Pena Branca', location: 'Petrolina - PE', logoUrl: 'https://ui-avatars.com/api/?name=TP&background=0ea5e9&color=fff&rounded=true&bold=true', visible: true },
  { id: '4', name: 'Casa Mãe Guacyara', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=CM&background=10b981&color=fff&rounded=true&bold=true', visible: true },
  { id: '5', name: 'Ylê Africano', location: 'Porto Alegre - RS', logoUrl: 'https://ui-avatars.com/api/?name=YA&background=8b5cf6&color=fff&rounded=true&bold=true', visible: true },
  { id: '6', name: 'Aldeia Pena Branca', location: 'Monte Santo - MG', logoUrl: 'https://ui-avatars.com/api/?name=AP&background=f43f5e&color=fff&rounded=true&bold=true', visible: true },
  { id: '7', name: 'Roda Itaussu', location: 'São Paulo - SP', logoUrl: 'https://ui-avatars.com/api/?name=RI&background=eab308&color=fff&rounded=true&bold=true', visible: true },
  { id: '8', name: 'Caboclo Akuan', location: 'Campinas - SP', logoUrl: 'https://ui-avatars.com/api/?name=CA&background=ec4899&color=fff&rounded=true&bold=true', visible: true },
];

interface TestimonialItem {
  id: string;
  text: string;
  authorName: string;
  authorRole: string; 
  terreiro: string;
  photoUrl: string;
  visible: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    text: "Antigamente eu perdia horas com planilhas e cadernetas para saber quem tinha pago a mensalidade. Hoje o ConectAxé faz tudo sozinho. Sobra mais tempo para eu me dedicar ao que realmente importa: a espiritualidade.",
    authorName: "Mãe Luciana de Iansã",
    terreiro: "Templo Luz do Oriente",
    photoUrl: "https://picsum.photos/seed/p1/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '2',
    text: "A transparência financeira aumentou muito. Os filhos recebem o recibo direto no celular. O sistema é intuitivo e as escalas de giras acabaram com as confusões de datas no grupo de WhatsApp.",
    authorName: "Pai Ricardo de Ogum",
    terreiro: "Centro Cultural Axé Vivo",
    photoUrl: "https://picsum.photos/seed/p2/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '3',
    text: "A organização dos ebós e das obrigações anuais ficou impecável. O sistema me avisa com antecedência e não deixamos passar nada. É uma bênção.",
    authorName: "Mãe Jandira de Nanã",
    terreiro: "Ilê Axé Nanã Buruquê",
    photoUrl: "https://picsum.photos/seed/p3/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '4',
    text: "Gerenciar a cantina e a loja do terreiro era uma dor de cabeça. Com o módulo de estoque, sei exatamente o que precisa repor para a próxima gira.",
    authorName: "Pai Carlos de Xangô",
    terreiro: "Tenda Justiça Divina",
    photoUrl: "https://picsum.photos/seed/p4/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '5',
    text: "O cadastro de consulentes nos ajudou a acolher melhor quem chega. Sabemos quem vem sempre e podemos dar um atendimento mais fraterno e organizado.",
    authorName: "Mãe Solange de Iemanjá",
    terreiro: "Casa das Águas",
    photoUrl: "https://picsum.photos/seed/p5/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '6',
    text: "A plataforma EAD tem sido fundamental para os estudos dos iniciantes. Eles acessam o material de casa e chegam no terreiro com as dúvidas certas.",
    authorName: "Pai Pedro de Oxóssi",
    terreiro: "Cabana do Caboclo",
    photoUrl: "https://picsum.photos/seed/p6/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '7',
    text: "Desde que implantamos o sistema, a inadimplência caiu drásticamente. Os lembretes automáticos ajudam muito na gestão financeira da casa.",
    authorName: "Mãe Teresa de Oxum",
    terreiro: "Solar de Mamãe Oxum",
    photoUrl: "https://picsum.photos/seed/p7/60/60",
    visible: true,
    authorRole: ""
  },
  {
    id: '8',
    text: "O suporte é incrível e o sistema está sempre evoluindo. Sinto que finalmente temos uma ferramenta feita por quem entende a nossa realidade.",
    authorName: "Pai Jorge de Aruanda",
    terreiro: "Terreiro Vovó Cambinda",
    photoUrl: "https://picsum.photos/seed/p8/60/60",
    visible: true,
    authorRole: ""
  }
];

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  { id: '1', visible: true, question: "O sistema é seguro? Meus dados rituais ficam expostos?", answer: "Absolutamente não. Utilizamos criptografia de nível bancário e seus dados são privados. Apenas administradores autorizados por você têm acesso." },
  { id: '2', visible: true, question: "Preciso instalar algo no meu computador?", answer: "Não. O ConectAxé é 100% na nuvem. Você acessa pelo navegador do celular, tablet ou computador, de onde estiver." },
  { id: '3', visible: true, question: "Como funciona o período de teste?", answer: "Você tem 7 dias para usar todas as funcionalidades sem pagar nada. Se gostar, escolhe um plano e continua. Se não, sua conta é desativada sem custos." },
  { id: '4', visible: true, question: "Vocês dão suporte para configurar o sistema?", answer: "Sim! Temos uma equipe pronta para te ajudar a importar seus dados e treinar sua equipe administrativa." }
];

const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com'
};

const LandingPage: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [faqItems, setFaqItems] = useState<FAQItem[]>(DEFAULT_FAQ_ITEMS);
  const [socialConfig, setSocialConfig] = useState<SocialConfig>(DEFAULT_SOCIAL_CONFIG);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(DEFAULT_CLIENT_LOGOS);
  const [heroConfig, setHeroConfig] = useState<{ title?: string; subtitle?: string; backgroundImage?: string; dashboardImage?: string }>({});
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [cnpj, setCnpj] = useState<string>('');

  useEffect(() => {
    // Subscribe to config updates from Firebase
    const unsubscribe = LandingPageService.subscribeToConfig((config: LandingPageConfig) => {
      if (config.landing_page_whatsapp) setWhatsappNumber(config.landing_page_whatsapp);
      if (config.landing_page_cnpj) setCnpj(config.landing_page_cnpj);
      
      if (config.landing_page_hero) {
        setHeroConfig(config.landing_page_hero);
      }
      
      if (config.landing_page_faq && Array.isArray(config.landing_page_faq)) {
        setFaqItems(config.landing_page_faq);
      }
      
      if (config.landing_page_social) {
        setSocialConfig(config.landing_page_social);
      }
      
      if (config.landing_page_testimonials && Array.isArray(config.landing_page_testimonials)) {
        setTestimonials(config.landing_page_testimonials);
      }
      
      if (config.landing_page_client_logos && Array.isArray(config.landing_page_client_logos)) {
        setClientLogos(config.landing_page_client_logos);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Calcula se o usuário chegou ao final da página (com margem de 300px)
      const scrollPosition = window.innerHeight + window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      
      // Mostra o botão apenas quando estiver nos últimos 800px da página (perto do rodapé)
      if (scrollPosition > scrollHeight - 800) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero {...heroConfig} />
      
      {/* Stats Section */}
      <section className="bg-white py-12 border-y border-slate-100">
        <div className="container mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          <div className="group min-w-[140px]">
            <div className="text-4xl font-bold text-slate-900 mb-1 transition-colors group-hover:text-orange-500">50+</div>
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider transition-colors group-hover:text-orange-500">Terreiros</div>
          </div>
          <div className="group min-w-[140px]">
            <div className="text-4xl font-bold text-slate-900 mb-1 transition-colors group-hover:text-orange-500">2k+</div>
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider transition-colors group-hover:text-orange-500">Médiuns</div>
          </div>
          <div className="group min-w-[140px]">
            <div className="text-4xl font-bold text-slate-900 mb-1 transition-colors group-hover:text-orange-500">99.9%</div>
            <div className="text-slate-500 text-sm font-medium uppercase tracking-wider transition-colors group-hover:text-orange-500">Uptime</div>
          </div>
        </div>
      </section>

      {/* Clients Marquee Section */}
      <section className="py-12 bg-slate-200 border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6 text-center mb-10">
          <h2 className="text-xl md:text-2xl font-medium text-slate-600">Mais de 50 terreiros confiam em nossa plataforma</h2>
        </div>
        
        <div className="relative w-full overflow-hidden pt-16 pb-4">
          <div className="flex w-max animate-scroll pause-on-hover">
            {/* Original Set */}
            <div className="flex gap-16 px-8 items-start">
              {clientLogos.filter(l => l.visible).map((logo) => (
                <div key={logo.id} className="relative flex flex-col items-center gap-3 w-40 flex-shrink-0 group cursor-default">
                  <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center p-1 border border-slate-100 group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-200 relative z-20">
                     <img src={logo.logoUrl} alt={logo.name} className="w-full h-full rounded-full object-cover" />
                     {/* Tooltip */}
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 pointer-events-none whitespace-nowrap z-30">
                       <p className="text-slate-800 font-bold text-sm leading-tight">{logo.name}</p>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-100"></div>
                     </div>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 text-xs font-medium mt-2">{logo.location}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Duplicate Set for Loop */}
            <div className="flex gap-16 px-8 items-start">
              {clientLogos.filter(l => l.visible).map((logo) => (
                <div key={`dup-${logo.id}`} className="relative flex flex-col items-center gap-3 w-40 flex-shrink-0 group cursor-default">
                   <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center p-1 border border-slate-100 group-hover:scale-110 transition-transform duration-300 group-hover:border-orange-200 relative z-20">
                     <img src={logo.logoUrl} alt={logo.name} className="w-full h-full rounded-full object-cover" />
                     {/* Tooltip */}
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 pointer-events-none whitespace-nowrap z-30">
                       <p className="text-slate-800 font-bold text-sm leading-tight">{logo.name}</p>
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-100"></div>
                     </div>
                  </div>
                   <div className="text-center">
                    <p className="text-slate-700 text-xs font-medium mt-2">{logo.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient Overlay for Fade Effect */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-200 to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-200 to-transparent z-10"></div>
        </div>
      </section>

      <Features />

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-900/30 skew-x-12 transform translate-x-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16 gap-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 whitespace-nowrap">Vozes de quem já encontrou o equilíbrio</h2>
              <p className="text-xl text-slate-200/70">A tecnologia a serviço do sagrado, transformando a vida de zeladores em todo o Brasil.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.filter(t => t.visible).map((testimonial) => (
              <div key={testimonial.id} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                <div className="text-orange-400 text-4xl mb-6">"</div>
                <p className="text-sm italic leading-relaxed mb-6 text-slate-100">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.photoUrl} className="w-12 h-12 rounded-full border-2 border-orange-400 object-cover" alt={testimonial.authorName} />
                  <div>
                    <div className="font-bold text-sm text-white">{testimonial.authorName}</div>
                    <div className="text-orange-400 text-xs font-medium uppercase">{testimonial.terreiro}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-2">
            {faqItems.filter(item => item.visible).map((item) => (
              <details key={item.id} className="group border border-slate-100 rounded-2xl bg-slate-50/50 p-4">
                <summary className="flex justify-between items-center font-bold text-lg cursor-pointer list-none text-slate-950">
                  {item.question}
                  <span className="text-orange-600 transition-transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-orange-600 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Pronto para dar o próximo passo na sua gestão?</h2>
          <p className="text-2xl text-orange-100 mb-12 max-w-3xl mx-auto">Junte-se a centenas de terreiros que já profissionalizaram seu axé com a ConectAxé.</p>
          <button className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 active:scale-95">
            Começar Meu Teste Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2 flex-wrap">
            <span>&copy; 2026 ConectAxé. Todos os direitos reservados.</span>
            {cnpj && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>CNPJ: {cnpj}</span>
              </>
            )}
          </p>
        </div>
      </footer>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-slate-800 text-white px-4 py-3 rounded-full shadow-lg hover:bg-slate-700 transition-all z-40 flex items-center gap-2 animate-bounce-slow"
          aria-label="Voltar ao topo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          <span className="font-bold text-sm">Topo</span>
        </button>
      )}

      <AIAssistant whatsappNumber={whatsappNumber} />
    </div>
  );
};

export default LandingPage;
