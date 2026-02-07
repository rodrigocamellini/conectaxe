import React, { useState } from 'react';
import { EmailAccount } from '../../types';
import { EmailService } from '../../services/EmailService';
import { Trash, Plus, ArrowLeft, Download, Save } from 'lucide-react';

interface EmailAccountsProps {
  accounts: EmailAccount[];
  onUpdate: () => void;
  onBack: () => void;
}

export const EmailAccounts: React.FC<EmailAccountsProps> = ({ accounts, onUpdate, onBack }) => {
  const [editingAccount, setEditingAccount] = useState<Partial<EmailAccount> | null>(null);

  const handleSave = () => {
    if (!editingAccount?.email || !editingAccount?.name) {
      alert('Email e Nome são obrigatórios.');
      return;
    }

    const accountToSave: EmailAccount = {
      id: editingAccount.id || `acc-${Date.now()}`,
      email: editingAccount.email,
      name: editingAccount.name,
      imapHost: editingAccount.imapHost || '',
      imapPort: editingAccount.imapPort || 993,
      imapSecure: editingAccount.imapSecure ?? true,
      popHost: editingAccount.popHost || '',
      popPort: editingAccount.popPort || 995,
      popSecure: editingAccount.popSecure ?? true,
      smtpHost: editingAccount.smtpHost || '',
      smtpPort: editingAccount.smtpPort || 465,
      smtpSecure: editingAccount.smtpSecure ?? true,
      isDefault: editingAccount.isDefault || false,
      password: editingAccount.password || '',
      signature: editingAccount.signature || ''
    };

    EmailService.saveAccount(accountToSave);
    onUpdate();
    setEditingAccount(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta conta? Todas as mensagens serão perdidas.')) {
      EmailService.deleteAccount(id);
      onUpdate();
    }
  };

  const handleBackup = (account: EmailAccount) => {
    const json = EmailService.exportBackup(account);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${account.email}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (editingAccount) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
          <button onClick={() => setEditingAccount(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{editingAccount.id ? 'Editar Conta' : 'Nova Conta'}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome de Exibição</label>
                  <input
                    type="text"
                    value={editingAccount.name || ''}
                    onChange={e => setEditingAccount({...editingAccount, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingAccount.email || ''}
                    onChange={e => setEditingAccount({...editingAccount, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <input
                    type="password"
                    value={editingAccount.password || ''}
                    onChange={e => setEditingAccount({...editingAccount, password: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Deixe em branco para não alterar"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={editingAccount.isDefault || false}
                    onChange={e => setEditingAccount({...editingAccount, isDefault: e.target.checked})}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Conta Padrão</label>
                </div>
              </div>
            </div>

            {/* IMAP Config */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Servidor de Entrada (IMAP)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Host</label>
                <input
                  type="text"
                  value={editingAccount.imapHost || ''}
                  onChange={e => setEditingAccount({...editingAccount, imapHost: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Porta</label>
                  <input
                    type="number"
                    value={editingAccount.imapPort || 993}
                    onChange={e => setEditingAccount({...editingAccount, imapPort: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={editingAccount.imapSecure ?? true}
                    onChange={e => setEditingAccount({...editingAccount, imapSecure: e.target.checked})}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">SSL/TLS</label>
                </div>
              </div>
            </div>

            {/* SMTP Config */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Servidor de Saída (SMTP)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Host</label>
                <input
                  type="text"
                  value={editingAccount.smtpHost || ''}
                  onChange={e => setEditingAccount({...editingAccount, smtpHost: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Porta</label>
                  <input
                    type="number"
                    value={editingAccount.smtpPort || 465}
                    onChange={e => setEditingAccount({...editingAccount, smtpPort: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={editingAccount.smtpSecure ?? true}
                    onChange={e => setEditingAccount({...editingAccount, smtpSecure: e.target.checked})}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">SSL/TLS</label>
                </div>
              </div>
            </div>
            
             {/* Signature */}
             <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Assinatura</h3>
              <textarea
                value={editingAccount.signature || ''}
                onChange={e => setEditingAccount({...editingAccount, signature: e.target.value})}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Assinatura que será adicionada ao final dos emails..."
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
             <button
              onClick={() => setEditingAccount(null)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
            >
              <Save size={18} className="mr-2" />
              Salvar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Configurações de Contas</h2>
        </div>
        <button 
          onClick={() => setEditingAccount({})}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Nova Conta</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {accounts.map(acc => (
            <div key={acc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{acc.name}</h3>
                  {acc.isDefault && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Padrão
                    </span>
                  )}
                </div>
                <p className="text-gray-500">{acc.email}</p>
                <div className="text-xs text-gray-400 mt-1">
                  IMAP: {acc.imapHost}:{acc.imapPort} | SMTP: {acc.smtpHost}:{acc.smtpPort}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBackup(acc)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Fazer Backup"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setEditingAccount(acc)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
