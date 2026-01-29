import React, { useState, useRef, useEffect } from 'react';
import { getSpiritualAssistantResponse } from '../../../services/geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Axé! Sou o assistente da ConectAxé. Como posso ajudar com a organização da sua casa hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getSpiritualAssistantResponse(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl w-[350px] md:w-[400px] flex flex-col overflow-hidden border border-slate-200 animate-slide-up">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-orange-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-700 overflow-hidden">
                <img
                  src="/images/whatsapp-logo.png"
                  alt="WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold">Guia Digital <span className="text-orange-500">ConectAxé</span></h4>
                <p className="text-xs text-slate-300">Sempre online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm rounded-tl-none border border-slate-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-orange-600 text-white p-2.5 rounded-xl hover:bg-orange-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
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
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
