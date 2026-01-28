
import React, { useState, useMemo } from 'react';
import { SystemConfig, FinancialTransaction } from '../types';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowRightLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateUUID } from '../utils/ids';

interface FinancialLedgerProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
  onDeleteTransaction?: (id: string) => void; // Optional for now
  onUpdateTransaction?: (id: string, data: Partial<FinancialTransaction>) => void; // Optional
  config: SystemConfig;
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  config
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    status: 'paid'
  });

  // Derived State
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (t.memberName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || 
                            (filterType === 'income' && (t.type === 'mensalidade' || t.type === 'doacao' || t.type === 'venda' || t.type === 'income')) ||
                            (filterType === 'expense' && (t.type === 'expense' || t.type === 'compra'));
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const isIncome = ['mensalidade', 'doacao', 'venda', 'income'].includes(t.type);
      if (isIncome) {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.date) return;

    if (editingId && onUpdateTransaction) {
      onUpdateTransaction(editingId, {
        ...newTransaction,
        amount: Number(newTransaction.amount)
      });
    } else {
      const transaction: FinancialTransaction = {
        id: generateUUID(),
        memberId: newTransaction.memberId, // Optional
        memberName: newTransaction.memberName, // Optional
        type: newTransaction.type as any,
        category: newTransaction.category || 'Outros',
        description: newTransaction.description,
        amount: Number(newTransaction.amount),
        date: newTransaction.date,
        monthReference: newTransaction.date.substring(0, 7), // YYYY-MM
        status: 'paid', // Default to paid for manual entry
        paymentMethod: newTransaction.paymentMethod || 'dinheiro',
        notes: newTransaction.notes
      };
      onAddTransaction(transaction);
    }

    setShowAddModal(false);
    setEditingId(null);
    setNewTransaction({
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      status: 'paid'
    });
  };

  const handleEditClick = (t: FinancialTransaction) => {
    setEditingId(t.id);
    setNewTransaction({
      ...t,
      date: t.date.split('T')[0] // Ensure date format for input
    });
    setShowAddModal(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      if (onDeleteTransaction) onDeleteTransaction(id);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setActiveMenuId(null)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Entradas</p>
            <h3 className="text-2xl font-black text-emerald-600">R$ {stats.income.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Saídas</p>
            <h3 className="text-2xl font-black text-rose-600">R$ {stats.expense.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Saldo Líquido</p>
            <h3 className={`text-2xl font-black ${stats.income - stats.expense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              R$ {(stats.income - stats.expense).toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Entradas
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Saídas
            </button>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={18} />
          Nova Transação
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const isIncome = ['mensalidade', 'doacao', 'venda', 'income'].includes(t.type);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {format(new Date(t.date), "dd/MM/yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-700">{t.description}</div>
                        {t.memberName && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            {t.memberName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                          {t.category || t.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {t.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wide border border-green-100">
                            <CheckCircle2 size={10} /> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wide border border-amber-100">
                            <Clock size={10} /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === t.id ? null : t.id); }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenuId === t.id && (
                          <div className="absolute right-8 top-8 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditClick(t); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 size={14} /> Editar
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(t.id); }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <ArrowRightLeft size={32} className="opacity-20" />
                      </div>
                      <p className="font-medium">Nenhuma transação encontrada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Nova Transação</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</label>
                  <select 
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({...newTransaction, type: e.target.value as any})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="expense">Saída (Despesa)</option>
                    <option value="income">Entrada (Receita)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data</label>
                  <input 
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Compra de velas, Pagamento de luz..."
                  value={newTransaction.description || ''}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valor (R$)</label>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newTransaction.amount || ''}
                    onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-bold text-lg focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</label>
                  <select 
                    value={newTransaction.category || 'Outros'}
                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Outros">Outros</option>
                    <option value="Material">Material Litúrgico</option>
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Observações</label>
                <textarea 
                  rows={3}
                  value={newTransaction.notes || ''}
                  onChange={e => setNewTransaction({...newTransaction, notes: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium focus:ring-2 focus:ring-indigo-100 resize-none"
                  placeholder="Detalhes adicionais..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); }}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  {editingId ? 'Salvar Alterações' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
