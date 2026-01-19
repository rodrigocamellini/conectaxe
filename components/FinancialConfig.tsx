
import React, { useState } from 'react';
import { FinancialConfig, SystemConfig, FixedExpense } from '../types';
import { Calculator, Save, Info, Landmark, Plus, Trash2, ReceiptText, QrCode } from 'lucide-react';

interface FinancialConfigProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
}

export const FinancialConfigComponent: React.FC<FinancialConfigProps> = ({ config, onUpdateConfig }) => {
  // Inicialização segura para garantir que fixedExpenses sempre seja um array
  const [formData, setFormData] = useState<FinancialConfig>(() => ({
    ...config.financialConfig,
    fixedExpenses: config.financialConfig.fixedExpenses || [],
    pixKey: config.financialConfig.pixKey || '',
    pixKeyType: config.financialConfig.pixKeyType || 'email'
  }));

  const [newExpenseName, setNewExpenseName] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      financialConfig: formData
    });
    alert('Configurações financeiras atualizadas com sucesso!');
  };

  const updateExpenseValue = (id: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(exp => exp.id === id ? { ...exp, value } : exp)
    }));
  };

  const addNewExpense = () => {
    if (!newExpenseName.trim()) return;
    
    const newExp: FixedExpense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newExpenseName.trim(),
      value: 0
    };

    setFormData(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, newExp]
    }));
    setNewExpenseName('');
  };

  const removeExpense = (id: string) => {
    if (!confirm('Deseja remover esta conta fixa?')) return;
    setFormData(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(exp => exp.id !== id)
    }));
  };

  const totalFixed = formData.fixedExpenses.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white flex items-center justify-between" style={{ backgroundColor: config.primaryColor }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Calculator size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black">Configuração Financeira</h3>
              <p className="text-white/70 text-sm font-medium">Configure mensalidades e gastos fixos do Terreiro</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-white rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ color: config.primaryColor }}
          >
            Salvar Tudo
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Seção de PIX */}
          <section className="space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <QrCode size={14} style={{ color: config.primaryColor }} /> Configuração PIX (Eventos Pagos)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Chave PIX</label>
                <input 
                  type="text"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-black text-lg text-gray-700"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  placeholder="Ex: seu@email.com"
                  value={formData.pixKey || ''}
                  onChange={e => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Chave</label>
                 <div className="relative">
                    <select
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-black text-lg text-gray-700 appearance-none cursor-pointer"
                      style={{ '--tw-ring-color': config.primaryColor } as any}
                      value={formData.pixKeyType || 'email'}
                      onChange={e => setFormData(prev => ({ ...prev, pixKeyType: e.target.value as any }))}
                    >
                      <option value="email">E-mail</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="phone">Celular</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                 </div>
              </div>
            </div>
          </section>

          {/* Seção de Mensalidades */}
          <section className="space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Landmark size={14} style={{ color: config.primaryColor }} /> Valores de Mensalidade
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mensalidade Médium</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-indigo-600 transition-colors">R$</div>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-black text-xl text-gray-700"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={formData.mediumValue}
                    onChange={e => setFormData(prev => ({ ...prev, mediumValue: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mensalidade Cambone</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-indigo-600 transition-colors">R$</div>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 transition-all font-black text-xl text-gray-700"
                    style={{ '--tw-ring-color': config.primaryColor } as any}
                    value={formData.camboneValue}
                    onChange={e => setFormData(prev => ({ ...prev, camboneValue: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Contas Fixas */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ReceiptText size={14} style={{ color: config.primaryColor }} /> Tabela de Contas Fixas
              </h4>
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Total Fixo: R$ {totalFixed.toFixed(2)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição da Conta</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-48">Valor Mensal (R$)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.fixedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">{expense.name}</td>
                      <td className="px-6 py-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                          <input 
                            type="number"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 transition-all font-black text-gray-700"
                            style={{ '--tw-ring-color': config.primaryColor } as any}
                            value={expense.value}
                            onChange={e => updateExpenseValue(expense.id, Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <button 
                          onClick={() => removeExpense(expense.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/50">
                    <td className="px-4 py-3" colSpan={3}>
                       <div className="flex gap-2">
                         <input 
                          type="text"
                          placeholder="Nova conta (ex: IPTU, Taxa...)"
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 text-sm font-bold"
                          style={{ '--tw-ring-color': config.primaryColor } as any}
                          value={newExpenseName}
                          onChange={e => setNewExpenseName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addNewExpense()}
                         />
                         <button 
                          onClick={addNewExpense}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-xs hover:bg-indigo-100 transition-colors flex items-center gap-2"
                         >
                           <Plus size={16} /> Adicionar Conta
                         </button>
                       </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 px-1">
              <Info size={10} /> Estas contas serão subtraídas da arrecadação bruta nos relatórios para cálculo do saldo.
            </p>
          </section>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              className="w-full py-4 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Save size={20} /> Salvar Todas as Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
