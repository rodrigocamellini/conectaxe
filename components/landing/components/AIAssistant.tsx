
import React, { useState, useEffect } from 'react';

interface AIAssistantProps {
  whatsappNumber?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ whatsappNumber }) => {
  const [link, setLink] = useState<string>('');

  useEffect(() => {
    const digits = (whatsappNumber || '').replace(/\D/g, '');
    const text = encodeURIComponent('Olá! Gostaria de saber mais sobre o ConectAxé.');
    if (digits) {
      setLink(`https://wa.me/${digits}?text=${text}`);
    } else {
      setLink('');
    }
  }, [whatsappNumber]);

  if (!link) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border border-slate-200"
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
          <img
            src="/images/whatsapp-logo.png"
            alt="WhatsApp"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4">
          <div className="absolute inset-0 rounded-full bg-green-700 opacity-60 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-green-700 border-2 border-white shadow-md"></div>
        </div>
      </a>
    </div>
  );
};

export default AIAssistant;
