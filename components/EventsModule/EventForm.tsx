
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Ticket, DollarSign, QrCode } from 'lucide-react';
import { TerreiroEvent, SystemConfig } from '../../types';

interface EventFormProps {
  onClose: () => void;
  onSave: (event: TerreiroEvent) => void;
  initialData?: TerreiroEvent | null;
  config: SystemConfig;
}

export function EventForm({ onClose, onSave, initialData, config }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<TerreiroEvent>>(initialData || {
    type: 'gira',
    status: 'agendado',
    capacity: 80,
    waitingListEnabled: true,
    isPaid: false,
    price: 0,
    pixKey: config.financialConfig?.pixKey || '',
    allowGuestRegistration: true,
    location: 'Terreiro (Sede)'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      title: formData.title || '',
      date: formData.date || '',
      time: formData.time || '',
      type: formData.type || 'gira',
      status: formData.status || 'agendado',
      capacity: formData.capacity || 0,
      ticketsIssued: formData.ticketsIssued || 0,
      waitingListEnabled: formData.waitingListEnabled || false,
      isPaid: formData.isPaid || false,
      price: formData.price,
      pixKey: formData.pixKey,
      allowGuestRegistration: formData.allowGuestRegistration || false,
      location: formData.location,
      description: formData.description
    } as TerreiroEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Evento' : 'Novo Evento / Gira'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} /> Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Gira de Exu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gira">Gira de Atendimento</option>
                  <option value="festa">Festa / Comemoração</option>
                  <option value="curso">Curso / Workshop</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                <input
                  type="time"
                  required
                  value={formData.time || ''}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição / Observações</label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Instruções para os consulentes..."
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Capacidade e Inscrições */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} /> Capacidade e Acesso
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lotação Máxima</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Total de senhas disponíveis</p>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="waitingList"
                  checked={formData.waitingListEnabled}
                  onChange={e => setFormData({ ...formData, waitingListEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="waitingList" className="text-sm font-medium text-slate-700">
                  Habilitar Lista de Espera Automática
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="guestReg"
                checked={formData.allowGuestRegistration}
                onChange={e => setFormData({ ...formData, allowGuestRegistration: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="guestReg" className="text-sm font-medium text-slate-700">
                Permitir inscrição pública (Link externo)
              </label>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Custos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} /> Valor e Pagamento
            </h3>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPaid: false })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  !formData.isPaid 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Evento Gratuito
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPaid: true })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.isPaid 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Evento Pago
              </button>
            </div>

            {formData.isPaid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Ingresso (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <QrCode size={14} /> Chave PIX
                  </label>
                  <input
                    type="text"
                    value={formData.pixKey || ''}
                    onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="CPF, Email ou Aleatória"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Salvar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
