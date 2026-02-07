import React from 'react';
import { EmailMessage } from '../../types';
import { ArrowLeft, Trash, Reply, Star, Download, MoreVertical, Forward } from 'lucide-react';

interface EmailViewProps {
  message: EmailMessage;
  onBack: () => void;
  onDelete: () => void;
  onReply: () => void;
  onForward: () => void;
}

export const EmailView: React.FC<EmailViewProps> = ({ message, onBack, onDelete, onReply, onForward }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex space-x-2">
            <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-red-600" title="Excluir">
              <Trash size={20} />
            </button>
            <button onClick={onReply} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600" title="Responder">
              <Reply size={20} />
            </button>
            <button onClick={onForward} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600" title="Encaminhar">
              <Forward size={20} />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(message.date).toLocaleString()}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{message.subject}</h1>
        
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
            {(message.fromName || message.from || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{message.fromName || message.from}</div>
            <div className="text-sm text-gray-500">&lt;{message.from}&gt;</div>
            <div className="text-sm text-gray-500 mt-1">Para: {message.to.join(', ')}</div>
          </div>
        </div>

        <div 
          className="prose max-w-none text-gray-800 font-sans"
          dangerouslySetInnerHTML={{ __html: message.body }}
        />

        {message.hasAttachments && message.attachments && (
          <div className="mt-8 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Anexos</h3>
            <div className="flex flex-wrap gap-4">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="mr-3 bg-gray-100 p-2 rounded">
                    <Download size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{att.name}</div>
                    <div className="text-xs text-gray-500">{att.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
