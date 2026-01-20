import React, { useState } from 'react';
import { TerreiroEvent, EventTicket, SystemConfig } from '../../types';
import { Calendar, Clock, MapPin, Ticket, User, Phone, CheckCircle, AlertCircle, Copy, CreditCard } from 'lucide-react';

interface PublicEventRegistrationProps {
  event: TerreiroEvent;
  config: SystemConfig;
  onRegister: (ticketData: Omit<EventTicket, 'id' | 'createdAt' | 'attendance'>) => Promise<EventTicket>;
  existingTickets: EventTicket[];
}

export function PublicEventRegistration({ event, config, onRegister, existingTickets }: PublicEventRegistrationProps) {
  const [step, setStep] = useState<'details' | 'form' | 'success'>('details');
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    type: 'normal' as 'normal' | 'preferencial'
  });
  const [generatedTicket, setGeneratedTicket] = useState<EventTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSoldOut = event.ticketsIssued >= event.capacity;
  const isWaitlist = isSoldOut && event.waitingListEnabled;
  const isHappening = event.status === 'acontecendo';
  const isEnded = event.status === 'encerrado' || event.status === 'cancelado';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.guestName.trim()) throw new Error('Nome é obrigatório');
      if (!formData.guestPhone.trim()) throw new Error('Telefone é obrigatório');

      // Check capacity again just in case
      if (isSoldOut && !isWaitlist) {
        throw new Error('Evento lotado.');
      }

      // Generate ticket number
      const nextTicketNumber = existingTickets.filter(t => t.eventId === event.id).length + 1;

      const ticket = await onRegister({
        eventId: event.id,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        ticketNumber: nextTicketNumber,
        type: formData.type,
        paymentStatus: event.isPaid ? 'pendente' : 'gratuito',
        status: isWaitlist ? 'lista_espera' : 'confirmado'
      });

      setGeneratedTicket(ticket);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar inscrição');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    if (event.pixKey) {
      navigator.clipboard.writeText(event.pixKey);
      alert('Chave Pix copiada!');
    }
  };

  if (step === 'success' && generatedTicket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className={`${generatedTicket.status === 'lista_espera' ? 'bg-amber-600' : 'bg-green-600'} p-8 text-center text-white`}>
            {generatedTicket.status === 'lista_espera' ? (
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-90" />
            ) : (
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
            )}
            <h1 className="text-2xl font-bold mb-2">
              {generatedTicket.status === 'lista_espera' ? 'Lista de Espera' : 'Inscrição Confirmada!'}
            </h1>
            <p className="opacity-90">
              {generatedTicket.status === 'lista_espera' 
                ? 'Você será avisado caso surja uma vaga.' 
                : 'Sua presença está garantida.'}
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {generatedTicket.status === 'lista_espera' ? 'Posição na Fila' : 'Sua Senha'}
              </span>
              <div className="text-6xl font-black text-slate-800 mt-2">
                {generatedTicket.status === 'lista_espera' 
                  ? `WL-${String(generatedTicket.ticketNumber).padStart(3, '0')}`
                  : `#${String(generatedTicket.ticketNumber).padStart(3, '0')}`
                }
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-indigo-500 mt-1" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Data e Hora</p>
                  <p className="text-slate-600">{new Date(event.date).toLocaleDateString()} às {event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-indigo-500 mt-1" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Local</p>
                  <p className="text-slate-600">{event.location || 'Terreiro'}</p>
                </div>
              </div>
            </div>

                {event.isPaid && generatedTicket.paymentStatus === 'pendente' && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-orange-800 text-sm font-medium mb-2 flex items-center gap-2">
                  <CreditCard size={16} />
                  Pagamento Pendente
                </p>
                <p className="text-orange-600 text-xs mb-3">
                  Para confirmar sua vaga, realize o Pix de <strong>R$ {event.price?.toFixed(2)}</strong> e envie o comprovante.
                </p>
                {(event.pixKey || config.financialConfig?.pixKey) && (
                  <button 
                    onClick={copyPix}
                    className="w-full bg-white border border-orange-200 text-orange-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={14} />
                    Copiar Chave Pix
                  </button>
                )}
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Nova Inscrição
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header Image/Color */}
        <div className="h-32 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          {config.logoUrl && (
            <img src={config.logoUrl} alt="Logo" className="absolute bottom-4 left-6 w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
          )}
        </div>

        <div className="pt-6 px-8 pb-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {event.type}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight mb-2">{event.title}</h1>
            <p className="text-slate-500 text-sm">{event.description || 'Sem descrição.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Calendar className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase">Data</p>
              <p className="text-slate-700 font-medium">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Clock className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase">Horário</p>
              <p className="text-slate-700 font-medium">{event.time}</p>
            </div>
          </div>

          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium">Vagas Restantes</span>
                <span className={`text-lg font-bold ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
                  {isSoldOut ? 'Esgotado' : event.capacity - event.ticketsIssued}
                </span>
              </div>

              {isEnded ? (
                 <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-xl font-bold text-center cursor-not-allowed">
                  Evento Encerrado
                </div>
              ) : isSoldOut && !isWaitlist ? (
                <div className="w-full bg-slate-200 text-slate-500 py-4 rounded-xl font-bold text-center cursor-not-allowed">
                  Esgotado
                </div>
              ) : (
                <button 
                  onClick={() => setStep('form')}
                  className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isWaitlist 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  }`}
                >
                  <Ticket size={20} />
                  {isWaitlist ? 'Entrar na Lista de Espera' : 'Garantir minha Senha'}
                </button>
              )}
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Digite seu nome"
                    value={formData.guestName}
                    onChange={e => setFormData({...formData, guestName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Seu WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    value={formData.guestPhone}
                    onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                  />
                </div>
              </div>

              {event.isPaid && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-800 font-bold">Valor da Contribuição</span>
                    <span className="text-indigo-600 font-black text-lg">R$ {event.price?.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-indigo-600 opacity-80">O pagamento deverá ser realizado via Pix após a confirmação.</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Confirmando...' : 'Confirmar Inscrição'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
