import React, { useState } from 'react';
import { MasterAuditLog } from '../types';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Download,
  Calendar,
  Eye,
  Activity,
  User,
  Globe,
  FileText,
  Trash2,
  Lock
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

// Helper to safely format dates
const formatSafe = (dateStr: string, formatStr: string, options?: any) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (!isValid(date)) return '-';
  return format(date, formatStr, options);
};

interface AuditTabProps {
  logs: MasterAuditLog[];
  onReset: (password: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({ logs, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'danger' | 'critical'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'security' | 'client_management' | 'financial' | 'system'>('all');
  const [selectedLog, setSelectedLog] = useState<MasterAuditLog | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.clientName && log.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.masterEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;

    return matchesSearch && matchesSeverity && matchesCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    const validA = isValid(dateA) ? dateA.getTime() : 0;
    const validB = isValid(dateB) ? dateB.getTime() : 0;
    return validB - validA;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="text-red-500" size={16} />;
      case 'danger': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'warning': return <Info className="text-yellow-500" size={16} />;
      default: return <CheckCircle2 className="text-emerald-500" size={16} />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'danger': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Hora,Ação,Categoria,Severidade,Autor,Cliente,Detalhes\n"
      + filteredLogs.map(log => {
          const date = formatSafe(log.timestamp, 'dd/MM/yyyy');
          const time = formatSafe(log.timestamp, 'HH:mm:ss');
          return `"${date}","${time}","${log.action}","${log.category}","${log.severity}","${log.masterEmail}","${log.clientName || '-'}","${log.details || '-'}"`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_master_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header e Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total de Eventos</p>
            <h3 className="text-2xl font-bold text-white">{logs.length}</h3>
          </div>
        </div>
        
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Eventos Críticos</p>
            <h3 className="text-2xl font-bold text-white">
              {logs.filter(l => l.severity === 'critical' || l.severity === 'danger').length}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Ações de Usuário</p>
            <h3 className="text-2xl font-bold text-white">
              {logs.filter(l => l.category === 'client_management').length}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Acessos ao Sistema</p>
            <h3 className="text-2xl font-bold text-white">
              {logs.filter(l => l.action.includes('Acesso') || l.action.includes('Login')).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar em logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          
          <div className="relative">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 pl-4 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todas Severidades</option>
              <option value="info">Informativo</option>
              <option value="warning">Atenção</option>
              <option value="danger">Perigo</option>
              <option value="critical">Crítico</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>

          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 pl-4 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              <option value="security">Segurança</option>
              <option value="client_management">Gestão de Clientes</option>
              <option value="financial">Financeiro</option>
              <option value="system">Sistema</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Resetar
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-40">Data/Hora</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12 text-center">Sev.</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ação</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoria</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Alvo (Cliente)</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium text-sm">
                          {formatSafe(log.timestamp, "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Calendar size={10} />
                          {formatSafe(log.timestamp, "HH:mm:ss")}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {getSeverityIcon(log.severity)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-200 font-medium block">{log.action}</span>
                      {log.details && (
                        <span className="text-slate-500 text-xs truncate max-w-[200px] block" title={log.details}>
                          {log.details}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-xs border border-slate-700">
                        {log.category === 'client_management' ? 'Gestão Clientes' : 
                         log.category === 'security' ? 'Segurança' :
                         log.category === 'financial' ? 'Financeiro' : 'Sistema'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                          {log.masterEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-300 text-sm truncate max-w-[150px]">{log.masterEmail}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.clientName ? (
                        <span className="text-slate-300 text-sm">{log.clientName}</span>
                      ) : (
                        <span className="text-slate-600 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={32} className="opacity-20" />
                      <p>Nenhum registro de auditoria encontrado com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${getSeverityBadgeClass(selectedLog.severity)}`}>
                  {getSeverityIcon(selectedLog.severity)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Detalhes do Evento</h3>
                  <p className="text-slate-400 text-sm">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center">×</div>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Data e Hora</label>
                  <p className="text-white font-medium">
                    {selectedLog && formatSafe(selectedLog.timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Autor</label>
                  <p className="text-white font-medium">{selectedLog.masterEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Ação</label>
                  <p className="text-white font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Categoria</label>
                  <span className="inline-block px-2 py-1 rounded bg-slate-800 text-slate-300 text-sm border border-slate-700 mt-1">
                    {selectedLog.category}
                  </span>
                </div>
              </div>

              {selectedLog.clientName && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Alvo da Ação</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedLog.clientName}</p>
                      <p className="text-slate-500 text-xs">ID: {selectedLog.clientId}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
                    <FileText size={14} />
                    Detalhes Técnicos
                  </label>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedLog.details}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Resetar Logs de Auditoria</h3>
              <p className="text-slate-400 text-sm mb-6">
                Você está prestes a apagar permanentemente todo o histórico de auditoria. Esta ação não pode ser desfeita.
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Senha de Desenvolvedor
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="password" 
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Digite sua senha master..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowResetModal(false);
                    setResetPassword('');
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onReset(resetPassword);
                    setShowResetModal(false);
                    setResetPassword('');
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Confirmar Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
