
import { FinancialTransaction, Member, Donation } from '../types';
import { generateUUID } from '../utils/ids';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_TRANSACTIONS = 'financial_transactions';
const SUBCOL_DONATIONS = 'financial_donations';

export const FinancialService = {
  // --- CRUD Firebase ---

  getAllTransactions: async (clientId: string): Promise<FinancialTransaction[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_TRANSACTIONS));
      return querySnapshot.docs.map(doc => doc.data() as FinancialTransaction);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      return [];
    }
  },

  saveTransaction: async (clientId: string, transaction: FinancialTransaction): Promise<void> => {
    if (!clientId) return;
    try {
      const cleanTransaction = JSON.parse(JSON.stringify(transaction));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_TRANSACTIONS, transaction.id), cleanTransaction);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      throw error;
    }
  },

  deleteTransaction: async (clientId: string, transactionId: string): Promise<void> => {
    if (!clientId) return;
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_TRANSACTIONS, transactionId));
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw error;
    }
  },

  getAllDonations: async (clientId: string): Promise<Donation[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_DONATIONS));
      return querySnapshot.docs.map(doc => doc.data() as Donation);
    } catch (error) {
      console.error("Erro ao buscar doações:", error);
      return [];
    }
  },

  saveDonation: async (clientId: string, donation: Donation): Promise<void> => {
    if (!clientId) return;
    try {
      const cleanDonation = JSON.parse(JSON.stringify(donation));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_DONATIONS, donation.id), cleanDonation);
    } catch (error) {
      console.error("Erro ao salvar doação:", error);
      throw error;
    }
  },

  deleteDonation: async (clientId: string, donationId: string): Promise<void> => {
    if (!clientId) return;
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_DONATIONS, donationId));
    } catch (error) {
      console.error("Erro ao excluir doação:", error);
      throw error;
    }
  },

  // --- Helpers ---

  /**
   * Creates a new financial transaction with standardized ID and defaults
   */
  createTransaction: (data: Partial<FinancialTransaction>): FinancialTransaction => {
    return {
      id: generateUUID(),
      date: new Date().toISOString(),
      status: 'paid', // Default to paid for now, can be overridden
      amount: 0,
      type: 'income',
      description: '',
      ...data
    } as FinancialTransaction;
  },

  /**
   * Migrates legacy member monthly payments to standardized transactions
   * @param members List of members with legacy monthlyPayments object
   * @returns Array of new FinancialTransaction objects
   */
  migrateLegacyPayments: (members: Member[]): FinancialTransaction[] => {
    const transactions: FinancialTransaction[] = [];

    members.forEach(member => {
      if (!member.monthlyPayments) return;

      Object.entries(member.monthlyPayments).forEach(([monthKey, status]) => {
        if (status === 'paid' || status === 'partial') { // Only migrate actual payments
          // monthKey is usually "YYYY-MM"
          const [year, month] = monthKey.split('-');
          // Create a date for the 1st of that month, or try to find a real date if stored elsewhere
          // For legacy migration, 1st of month is an acceptable approximation
          const date = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();

          transactions.push({
            id: generateUUID(),
            type: 'mensalidade',
            description: `Mensalidade ${month}/${year} - ${member.name}`,
            amount: 0, // Legacy data might not have amount, would need default or manual fix
            date: date,
            status: 'paid',
            category: 'Mensalidades',
            memberId: member.id,
            memberName: member.name,
            monthReference: monthKey,
            paymentMethod: 'legacy_migration',
            notes: 'Migrado automaticamente do sistema antigo'
          });
        }
      });
    });

    return transactions;
  },

  /**
   * Validates a transaction before saving
   */
  validateTransaction: (transaction: Partial<FinancialTransaction>): { valid: boolean; error?: string } => {
    if (!transaction.description) return { valid: false, error: 'Descrição é obrigatória' };
    if (transaction.amount === undefined || transaction.amount === null) return { valid: false, error: 'Valor é obrigatório' };
    return { valid: true };
  }
};
