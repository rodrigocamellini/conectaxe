
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  logoUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logoUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href.startsWith('/')) {
      navigate(href);
      return;
    }

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      // Calculate offset for fixed navbar
      const navbarHeight = 80; // approximate height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/90 backdrop-blur-md py-4 shadow-sm'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center relative z-[101]">
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src={logoUrl || '/images/logo_conectaxe.png'}
            alt="ConectAxé"
            className="h-10 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {[
            { label: 'Funcionalidades', href: '#funcionalidades' },
            { label: 'Depoimentos', href: '#depoimentos' },
            { label: 'Preços', href: '#preços' },
            { label: 'Blog', href: '/blog' },
            { label: 'FAQ', href: '#faq' }
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              onClick={(e) => handleNavClick(e, item.href)}
              className="font-medium text-slate-700 transition-colors hover:text-orange-500 cursor-pointer"
            >
              {item.label}
            </a>
          ))}
          <button 
            className="flex items-center gap-2 border-2 border-orange-500 text-orange-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-50 transition-all transform hover:scale-105"
            onClick={() => navigate('/login')}
          >
            <User size={16} />
            Área do Cliente
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg shadow-orange-200">
            Começar Agora
          </button>
        </div>

        <button 
          className="md:hidden text-slate-900 focus:outline-none p-2 -mr-2 cursor-pointer z-[102] relative"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-4 px-6 flex flex-col space-y-4 z-[99]">
          {[
            { label: 'Funcionalidades', href: '#funcionalidades' },
            { label: 'Depoimentos', href: '#depoimentos' },
            { label: 'Preços', href: '#preços' },
            { label: 'Blog', href: '/blog' },
            { label: 'FAQ', href: '#faq' }
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              onClick={(e) => handleNavClick(e, item.href)}
              className="font-medium text-slate-700 hover:text-orange-500 py-2 border-b border-gray-50"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              className="flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-all"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/login');
              }}
            >
              <User size={18} />
              Área do Cliente
            </button>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              Começar Agora
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
