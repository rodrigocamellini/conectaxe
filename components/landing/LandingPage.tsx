import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import AIAssistant from './components/AIAssistant';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();

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
      <Hero />
      
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

      <Features />

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-900/30 skew-x-12 transform translate-x-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Vozes de quem já encontrou o equilíbrio</h2>
              <p className="text-xl text-slate-200/70">A tecnologia a serviço do sagrado, transformando a vida de zeladores em todo o Brasil.</p>
            </div>
            <button className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">Ver todos os relatos</button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-orange-400 text-4xl mb-6">"</div>
              <p className="text-xl italic leading-relaxed mb-8 text-slate-100">
                "Antigamente eu perdia horas com planilhas e cadernetas para saber quem tinha pago a mensalidade. Hoje o ConectAxé faz tudo sozinho. Sobra mais tempo para eu me dedicar ao que realmente importa: a espiritualidade."
              </p>
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/p1/60/60" className="w-14 h-14 rounded-full border-2 border-orange-400" alt="Mãe de Santo" />
                <div>
                  <div className="font-bold text-lg text-white">Mãe Luciana de Iansã</div>
                  <div className="text-orange-400 text-sm font-medium uppercase">Templo Luz do Oriente</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-orange-400 text-4xl mb-6">"</div>
              <p className="text-xl italic leading-relaxed mb-8 text-slate-100">
                "A transparência financeira aumentou muito. Os filhos recebem o recibo direto no celular. O sistema é intuitivo e as escalas de giras acabaram com as confusões de datas no grupo de WhatsApp."
              </p>
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/p2/60/60" className="w-14 h-14 rounded-full border-2 border-orange-400" alt="Pai de Santo" />
                <div>
                  <div className="font-bold text-lg text-white">Pai Ricardo de Ogum</div>
                  <div className="text-orange-400 text-sm font-medium uppercase">Centro Cultural Axé Vivo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              { q: "O sistema é seguro? Meus dados rituais ficam expostos?", a: "Absolutamente não. Utilizamos criptografia de nível bancário e seus dados são privados. Apenas administradores autorizados por você têm acesso." },
              { q: "Preciso instalar algo no meu computador?", a: "Não. O ConectAxé é 100% na nuvem. Você acessa pelo navegador do celular, tablet ou computador, de onde estiver." },
              { q: "Como funciona o período de teste?", a: "Você tem 7 dias para usar todas as funcionalidades sem pagar nada. Se gostar, escolhe um plano e continua. Se não, sua conta é desativada sem custos." },
              { q: "Vocês dão suporte para configurar o sistema?", a: "Sim! Temos uma equipe pronta para te ajudar a importar seus dados e treinar sua equipe administrativa." }
            ].map((item, i) => (
              <details key={i} className="group border border-slate-100 rounded-2xl bg-slate-50/50 p-6">
                <summary className="flex justify-between items-center font-bold text-lg cursor-pointer list-none text-slate-950">
                  {item.q}
                  <span className="text-orange-600 transition-transform group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {item.a}
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
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Começar Meu Teste Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center">
              <img
                src="/images/logo_conectaxe_rodape.png"
                alt="ConectAxé"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              O software de gestão mais completo do Brasil dedicado exclusivamente ao universo das religiões de matriz africana. Organização, transparência e respeito à tradição.
            </p>
            <p className="font-bold text-white mb-2">Siga-nos em Nossas Redes Sociais</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <Facebook size={20} />
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <Instagram size={20} />
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                <Youtube size={20} />
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-6 text-orange-400">Plataforma</h5>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#preços" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog do Axé</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-6 text-orange-400">Suporte</h5>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#faq" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ConectAxé. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
        </div>
      </footer>

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 left-6 z-[110] flex flex-col gap-4">
        {showBackToTop && (
          <button 
            onClick={scrollToTop}
            className="bg-orange-500 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex flex-col items-center justify-center text-[10px] md:text-xs font-bold hover:bg-orange-600 hover:-translate-y-1 transition-all animate-bounce-slow"
            aria-label="Voltar para o topo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            TOP
          </button>
        )}
      </div>
      <AIAssistant />
    </div>
  );
};

export default LandingPage;
