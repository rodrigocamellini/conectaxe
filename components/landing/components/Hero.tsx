import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  dashboardImage?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  title = "Gestão com Axé, Organização com Fé.", 
  subtitle = "Simplifique a administração financeira, o cadastro de filhos de santo e a agenda de giras do seu terreiro com a ConectAxé.", 
  backgroundImage = "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=2070",
  dashboardImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center pt-20 overflow-hidden" id="inicio">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Spiritual background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-white space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-sm font-medium mb-4">
            ✨ O Software #1 para Gestão de Terreiros
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }}>
          </h1>
          <p className="text-xl text-slate-100/80 max-w-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1"
            >
              Teste Grátis por 7 Dias
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
              Ver Vídeo Demo
            </button>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-sm pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i+10}/40/40`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="user" />
              ))}
            </div>
            <p>Inúmeros terreiros já transformaram sua gestão.</p>
          </div>
        </div>
        
        <div className="hidden md:block relative">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
             <img 
               src={dashboardImage}
               alt="Dashboard Preview" 
               className="rounded-2xl shadow-lg"
             />
             <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl text-slate-900 animate-bounce-slow">
               <div className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Entradas Hoje</div>
               <div className="text-3xl font-bold">R$ 1.250,00</div>
               <div className="text-xs text-green-500 font-bold mt-1">↑ 12% em relação a ontem</div>
             </div>
             <div className="absolute -top-6 -right-6 bg-orange-600 text-white p-6 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🔔</div>
                 <div>
                   <div className="text-sm font-bold">Próxima Gira</div>
                   <div className="text-xs opacity-80">Hoje, às 19:30h</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
