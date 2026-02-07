import React, { useEffect, useState } from 'react';
import { EmailAccount, EmailMessage } from '../../types';
import { EmailService } from '../../services/EmailService';
import { Star, Paperclip, Search } from 'lucide-react';

interface EmailListProps {
  account: EmailAccount;
  folder: string;
  onSelectMessage: (msg: EmailMessage) => void;
  refreshTrigger: number;
}

export const EmailList: React.FC<EmailListProps> = ({ account, folder, onSelectMessage, refreshTrigger }) => {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const msgs = EmailService.getMessages(account.id, folder as any);
    setMessages(msgs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [account, folder, refreshTrigger]);

  const filteredMessages = messages.filter(msg => 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize text-gray-800">
          {folder === 'inbox' ? 'Caixa de Entrada' : 
           folder === 'sent' ? 'Enviados' :
           folder === 'trash' ? 'Lixeira' : folder}
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar emails..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Nenhuma mensagem encontrada nesta pasta.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!msg.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${!msg.isRead ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    {(msg.fromName || msg.from || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium text-gray-900 truncate ${!msg.isRead ? 'font-bold' : ''}`}>
                      {msg.fromName || msg.from}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm text-gray-800 truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                      {msg.subject}
                    </span>
                    {msg.hasAttachments && <Paperclip size={14} className="text-gray-400 ml-2" />}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {msg.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
