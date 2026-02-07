
import { EmailAccount, EmailMessage } from '../types';
import { generateUUID } from '../utils/ids';

const ACCOUNTS_KEY = 'MASTER_EMAIL_ACCOUNTS';
const MESSAGES_KEY_PREFIX = 'MASTER_EMAIL_MESSAGES_';

export const EmailService = {
  getAccounts: (): EmailAccount[] => {
    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error loading email accounts", e);
      return [];
    }
  },

  saveAccount: (account: EmailAccount) => {
    const accounts = EmailService.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    let newAccounts;
    if (index >= 0) {
      newAccounts = [...accounts];
      newAccounts[index] = account;
    } else {
      newAccounts = [...accounts, account];
    }
    
    // Ensure only one default
    if (account.isDefault) {
      newAccounts = newAccounts.map(a => a.id === account.id ? a : { ...a, isDefault: false });
    }
    
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(newAccounts));
    return account;
  },

  deleteAccount: (id: string) => {
    const accounts = EmailService.getAccounts();
    const newAccounts = accounts.filter(a => a.id !== id);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(newAccounts));
    // Also delete messages
    localStorage.removeItem(`${MESSAGES_KEY_PREFIX}${id}`);
  },

  getMessages: (accountId: string, folder: string = 'inbox'): EmailMessage[] => {
    try {
      const stored = localStorage.getItem(`${MESSAGES_KEY_PREFIX}${accountId}`);
      const messages: EmailMessage[] = stored ? JSON.parse(stored) : [];
      return messages.filter(m => m.folder === folder).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("Error loading messages", e);
      return [];
    }
  },

  getAllMessages: (accountId: string): EmailMessage[] => {
    try {
      const stored = localStorage.getItem(`${MESSAGES_KEY_PREFIX}${accountId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveMessage: (message: EmailMessage) => {
    const accountId = message.accountId;
    const messages = EmailService.getAllMessages(accountId);
    const index = messages.findIndex(m => m.id === message.id);
    let newMessages;
    if (index >= 0) {
      newMessages = [...messages];
      newMessages[index] = message;
    } else {
      newMessages = [message, ...messages];
    }
    localStorage.setItem(`${MESSAGES_KEY_PREFIX}${accountId}`, JSON.stringify(newMessages));
  },

  deleteMessage: (message: EmailMessage) => {
    if (message.folder === 'trash') {
        // Permanently delete
        const messages = EmailService.getAllMessages(message.accountId);
        const newMessages = messages.filter(m => m.id !== message.id);
        localStorage.setItem(`${MESSAGES_KEY_PREFIX}${message.accountId}`, JSON.stringify(newMessages));
    } else {
        // Move to trash
        EmailService.saveMessage({ ...message, folder: 'trash' });
    }
  },

  sendMessage: async (account: EmailAccount, message: Omit<EmailMessage, 'id' | 'accountId' | 'folder' | 'date' | 'snippet' | 'isRead' | 'isStarred' | 'hasAttachments'>) => {
    // Simulate SMTP delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newMessage: EmailMessage = {
      ...message,
      id: generateUUID(),
      accountId: account.id,
      folder: 'sent',
      date: new Date().toISOString(),
      snippet: message.body.replace(/<[^>]*>?/gm, '').substring(0, 100),
      isRead: true,
      isStarred: false,
      hasAttachments: !!message.attachments?.length
    };

    EmailService.saveMessage(newMessage);
    return newMessage;
  },

  checkMail: async (account: EmailAccount) => {
    // Simulate IMAP check
    await new Promise(resolve => setTimeout(resolve, 2000));

    const messages = EmailService.getAllMessages(account.id);
    if (messages.length === 0) {
      // Add a welcome message if empty
      const welcomeMsg: EmailMessage = {
        id: generateUUID(),
        accountId: account.id,
        folder: 'inbox',
        from: 'sistema@conectaxe.com.br',
        fromName: 'Sistema ConectAxé',
        to: [account.email],
        subject: 'Bem-vindo ao seu Email Master',
        body: `<div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Bem-vindo ao ConectAxé!</h2>
          <p>Olá,</p>
          <p>Esta é uma mensagem de teste para confirmar que sua conta <strong>${account.email}</strong> foi configurada corretamente.</p>
          <hr>
          <p>Atenciosamente,<br><em>Equipe ConectAxé</em></p>
        </div>`,
        snippet: 'Esta é uma mensagem de teste para confirmar que sua conta...',
        date: new Date().toISOString(),
        isRead: false,
        isStarred: false,
        hasAttachments: false
      };
      EmailService.saveMessage(welcomeMsg);
      return [welcomeMsg];
    }
    return [];
  },
  
  exportBackup: (accountId: string) => {
    const account = EmailService.getAccounts().find(a => a.id === accountId);
    const messages = EmailService.getAllMessages(accountId);
    
    if (!account) throw new Error("Account not found");

    const backup = {
        account,
        messages,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    return JSON.stringify(backup, null, 2);
  }
};
