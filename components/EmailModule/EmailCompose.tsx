import React, { useState } from 'react';
import { EmailAccount, EmailMessage } from '../../types';
import { EmailService } from '../../services/EmailService';
import { X, Paperclip } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface EmailComposeProps {
  account: EmailAccount;
  initialData?: Partial<EmailMessage>;
  onCancel: () => void;
  onSent: () => void;
}

export const EmailCompose: React.FC<EmailComposeProps> = ({ account, initialData, onCancel, onSent }) => {
  const [to, setTo] = useState(initialData?.to?.join(', ') || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSending(true);
    try {
      await EmailService.sendMessage(account, {
        to: to.split(',').map(e => e.trim()),
        from: account.email,
        fromName: account.name,
        subject,
        body,
        hasAttachments: false
      });
      alert('Email enviado com sucesso!');
      onSent();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erro ao enviar email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">Nova Mensagem</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Para:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="destinatario@exemplo.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assunto:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Assunto da mensagem"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-[300px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem:</label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Digite sua mensagem aqui..."
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <button className="text-gray-500 hover:text-gray-700 p-2" title="Anexar arquivo (em breve)">
          <Paperclip size={20} />
        </button>
        <div className="flex space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Enviar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
