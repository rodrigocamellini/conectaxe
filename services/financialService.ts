import { FinancialTransaction, Member } from '../types';
import { generateUUID } from '../utils/ids';
import { storage, STORAGE_KEYS } from './storage';

export const FinancialService = {
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
    if (!transaction.amount && transaction.amount !== 0) return { valid: false, error: 'Valor é obrigatório' };
    if (!transaction.description) return { valid: false, error: 'Descrição é obrigatória' };
    if (!transaction.date) return { valid: false, error: 'Data é obrigatória' };
    return { valid: true };
  }
};
