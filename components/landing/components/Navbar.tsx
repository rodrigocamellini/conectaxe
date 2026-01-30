import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  logoUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logoUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/90 backdrop-blur-md py-4 shadow-sm'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={logoUrl || "/images/logo_conectaxe.png"}
            alt="ConectAxé"
            className="h-10 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {[
            { label: 'Funcionalidades', href: '#funcionalidades' },
            { label: 'Depoimentos', href: '#depoimentos' },
            { label: 'Preços', href: '#preços' },
            { label: 'FAQ', href: '#faq' }
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="font-medium text-slate-700 transition-colors hover:text-orange-500"
            >
              {item.label}
            </a>
          ))}
          <button 
            className="flex items-center gap-2 border-2 border-orange-500 text-orange-600 px-6 py-2.5 rounded-full font-bold hover:bg-orange-50 transition-all transform hover:scale-105"
            onClick={() => navigate('/login')}
          >
            <User size={18} />
            Área do Cliente
          </button>
          <button 
            className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg shadow-orange-200"
            onClick={() => navigate('/login')}
          >
            Começar Agora
          </button>
        </div>

        <button className="md:hidden text-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
