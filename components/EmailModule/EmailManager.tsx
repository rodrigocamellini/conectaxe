import React, { useState, useEffect } from 'react';
import { Mail, Settings, Plus, RefreshCw, Inbox, Send, Trash, AlertCircle, Menu } from 'lucide-react';
import { EmailService } from '../../services/EmailService';
import { EmailAccount, EmailMessage } from '../../types';
import { EmailList } from './EmailList';
import { EmailView } from './EmailView';
import { EmailCompose } from './EmailCompose';
import { EmailAccounts } from './EmailAccounts';

type EmailViewType = 'list' | 'read' | 'compose' | 'settings';
type FolderType = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam';

export const EmailManager: React.FC = () => {
  const [view, setView] = useState<EmailViewType>('list');
  const [currentFolder, setCurrentFolder] = useState<FolderType>('inbox');
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<EmailAccount | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initial load and default account setup
  useEffect(() => {
    const loadAccounts = () => {
      const storedAccounts = EmailService.getAccounts();
      
      if (storedAccounts.length === 0) {
        // Create default account as requested
        const defaultAccount: EmailAccount = {
          id: 'default-hostinger',
          email: 'contato@conectaxe.com.br',
          name: 'Contato Conectaxe',
          imapHost: 'imap.hostinger.com',
          imapPort: 993,
          imapSecure: true,
          popHost: 'pop.hostinger.com',
          popPort: 995,
          popSecure: true,
          smtpHost: 'smtp.hostinger.com',
          smtpPort: 465,
          smtpSecure: true,
          isDefault: true,
          password: '' // User will need to enter this
        };
        EmailService.saveAccount(defaultAccount);
        setAccounts([defaultAccount]);
        setCurrentAccount(defaultAccount);
      } else {
        setAccounts(storedAccounts);
        // Select default or first account
        const defaultAcc = storedAccounts.find(a => a.isDefault) || storedAccounts[0];
        setCurrentAccount(defaultAcc);
      }
    };

    loadAccounts();
  }, [refreshTrigger]);

  const handleRefresh = async () => {
    if (!currentAccount) return;
    setIsLoading(true);
    try {
      await EmailService.checkMail(currentAccount);
      // Trigger a re-render of the list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error checking mail:', error);
      alert('Erro ao verificar emails. Verifique as configurações da conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompose = () => {
    setComposeInitialData(undefined);
    setView('compose');
  };

  const handleSelectMessage = (message: EmailMessage) => {
    setSelectedMessage(message);
    setView('read');
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
    setView('list');
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setCurrentAccount(account);
      setView('list');
      setCurrentFolder('inbox');
    }
  };

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Mail size={48} className="mb-4" />
          <p>Nenhuma conta de email configurada.</p>
          <button 
            onClick={() => setView('settings')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Configurar Email
          </button>
        </div>
      );
    }

    switch (view) {
      case 'list':
        return (
          <EmailList 
            account={currentAccount}
            folder={currentFolder}
            onSelectMessage={handleSelectMessage}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'read':
        return selectedMessage ? (
          <EmailView 
            message={selectedMessage} 
            onBack={handleBackToList}
            onDelete={() => {
              EmailService.deleteMessage(selectedMessage);
              handleBackToList();
              setRefreshTrigger(prev => prev + 1);
            }}
            onReply={() => {
              setComposeInitialData({
                to: [selectedMessage.from],
                subject: `Re: ${selectedMessage.subject}`,
                body: `<br><br><div class="gmail_quote">Em ${new Date(selectedMessage.date).toLocaleString()}, ${selectedMessage.from} escreveu:<br><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">${selectedMessage.body}</blockquote></div>`
              });
              setView('compose');
            }}
            onForward={() => {
              setComposeInitialData({
                to: [],
                subject: `Fwd: ${selectedMessage.subject}`,
                body: `<br><br><div class="gmail_quote">---------- Forwarded message ---------<br>From: <strong>${selectedMessage.fromName || selectedMessage.from}</strong> <span dir="ltr">&lt;${selectedMessage.from}&gt;</span><br>Date: ${new Date(selectedMessage.date).toLocaleString()}<br>Subject: ${selectedMessage.subject}<br>To: ${selectedMessage.to.join(', ')}<br><br>${selectedMessage.body}</div>`
              });
              setView('compose');
            }}
          />
        ) : null;
      case 'compose':
        return (
          <EmailCompose 
            account={currentAccount}
            initialData={composeInitialData}
            onCancel={handleBackToList}
            onSent={() => {
              handleBackToList();
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        );
      case 'settings':
        return (
          <EmailAccounts 
            accounts={accounts}
            onUpdate={() => setRefreshTrigger(prev => prev + 1)}
            onBack={handleBackToList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Mail className="text-white" size={20} />
            </div>
            <span className="font-bold text-gray-800">Email Manager</span>
          </div>
          
          <button 
            onClick={handleCompose}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Nova Mensagem</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conta</label>
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={currentAccount?.id || ''}
              onChange={(e) => handleAccountChange(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.email})</option>
              ))}
            </select>
          </div>

          <nav className="space-y-1 px-2 mt-6">
            <button
              onClick={() => { setView('list'); setCurrentFolder('inbox'); }}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                view === 'list' && currentFolder === 'inbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Inbox size={18} />
              <span>Caixa de Entrada</span>
            </button>
            <button
              onClick={() => { setView('list'); setCurrentFolder('sent'); }}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                view === 'list' && currentFolder === 'sent' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Send size={18} />
              <span>Enviados</span>
            </button>
            <button
              onClick={() => { setView('list'); setCurrentFolder('trash'); }}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                view === 'list' && currentFolder === 'trash' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Trash size={18} />
              <span>Lixeira</span>
            </button>
          </nav>

          <div className="mt-8 px-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ferramentas</label>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="mt-2 w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setView('settings')}
              className={`mt-1 w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                view === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={18} />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
