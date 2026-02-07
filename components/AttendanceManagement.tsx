
import React, { useState, useMemo } from 'react';
import { Member, AttendanceRecord, SystemConfig } from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardCheck,
  UserCheck,
  UserX,
  Sparkles,
  Award,
  Info,
  AlertCircle,
  BarChart3,
  Check,
  X,
  Clock,
  Printer,
  FileText,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';
import { format, addDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceManagementProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  config: SystemConfig;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  members,
  attendanceRecords,
  config,
  onUpdateAttendance
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'history'>('daily');
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  const eligibleMembers = useMemo(() => {
    return members.filter(m => (m.isMedium || m.isCambone) && m.status === 'ativo')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const recordedDates = useMemo(() => {
    const dates = Array.from(new Set(attendanceRecords.map(r => r.date).filter(Boolean))) as string[];
    return dates.sort((a, b) => b.localeCompare(a)).slice(0, 10);
  }, [attendanceRecords]);

  const filteredMembers = eligibleMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentDayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  const stats = useMemo(() => {
    const present = currentDayRecords.filter(r => r.status === 'presente').length;
    const absent = currentDayRecords.filter(r => r.status === 'ausente').length;
    const justified = currentDayRecords.filter(r => r.status === 'justificado').length;
    const total = eligibleMembers.length;
    const registered = present + absent + justified;
    const unregistered = total - registered;

    return { 
      present, 
      absent, 
      justified, 
      unregistered,
      total,
      presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPercent: total > 0 ? Math.round((absent / total) * 100) : 0,
      justifiedPercent: total > 0 ? Math.round((justified / total) * 100) : 0,
    };
  }, [currentDayRecords, eligibleMembers]);

  const updateStatus = async (memberId: string, status: 'presente' | 'ausente' | 'justificado') => {
    const existingRecord = attendanceRecords.find(r => r.date === selectedDate && r.memberId === memberId);

    if (existingRecord) {
      if (existingRecord.status === status) {
        // Toggle off -> Delete
        await onDeleteRecord(existingRecord.id);
      } else {
        // Update status
        await onSaveRecord({ ...existingRecord, status });
      }
    } else {
      // Create new
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: selectedDate,
        memberId,
        status
      };
      await onSaveRecord(newRecord);
    }
  };

  const markAllPresent = async () => {
    const recordsToSave: AttendanceRecord[] = [];
    
    eligibleMembers.forEach(m => {
      const existingRecord = attendanceRecords.find(r => r.date === selectedDate && r.memberId === m.id);
      if (existingRecord) {
        if (existingRecord.status !== 'presente') {
           recordsToSave.push({ ...existingRecord, status: 'presente' });
        }
      } else {
        recordsToSave.push({
          id: Math.random().toString(36).substr(2, 9),
          date: selectedDate,
          memberId: m.id,
          status: 'presente'
        });
      }
    });

    if (recordsToSave.length > 0) {
      if (onBatchSave) {
        await onBatchSave(recordsToSave);
      } else {
        // Fallback to sequential save if no batch handler
        for (const record of recordsToSave) {
          await onSaveRecord(record);
        }
      }
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    try {
      const current = new Date(selectedDate + 'T12:00:00');
      if (!isValid(current)) return;
      const next = direction === 'next' ? addDays(current, 1) : addDays(current, -1);
      setSelectedDate(format(next, 'yyyy-MM-dd'));
    } catch (e) {
      console.error("Erro ao mudar data", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatSafe = (dateStr: string, pattern: string) => {
    if (!dateStr) return '??';
    try {
      const d = new Date(dateStr + 'T12:00:00');
      if (!isValid(d)) return '??';
      return format(d, pattern, { locale: ptBR });
    } catch {
      return '??';
    }
  };

  if (viewMode === 'history') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #print-report, #print-report * { visibility: visible; }
            #print-report { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              padding: 1cm;
              background: white;
            }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode('daily')}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-indigo-600 shadow-sm transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Relatório de Assiduidade</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Histórico detalhado da corrente</p>
              </div>
           </div>
           <button 
            onClick={handlePrint}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
           >
              <Printer size={18} /> Imprimir Relatório
           </button>
        </div>

        <div id="print-report" className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden print:block mb-8 border-b-2 border-gray-100 pb-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <img src={config.logoUrl} className="w-16 h-16 object-contain" />
                   <div>
                      <h1 className="text-2xl font-black uppercase tracking-tight">{config.systemName}</h1>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Mapa de Frequência da Corrente</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-gray-400">Gerado em</p>
                   <p className="text-xs font-bold">{formatSafe(new Date().toISOString().split('T')[0], "dd/MM/yyyy HH:mm")}</p>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50 z-10 border-r border-gray-100">Membro da Corrente</th>
                  <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-r border-gray-100">% Pres.</th>
                  {recordedDates.map(date => (
                    <th key={date} className="px-2 py-5 text-[9px] font-black text-gray-500 uppercase tracking-tighter text-center min-w-[80px]">
                      {formatSafe(date, "dd/MM")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {eligibleMembers.map(member => {
                  const memberRecords = attendanceRecords.filter(r => r.memberId === member.id);
                  const totalGiras = recordedDates.length;
                  const presences = recordedDates.filter(d => memberRecords.find(r => r.date === d && r.status === 'presente')).length;
                  const attendanceRate = totalGiras > 0 ? Math.round((presences / totalGiras) * 100) : 0;

                  return (
                    <tr key={member.id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                            {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users size={14} className="text-gray-300" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-700 text-xs uppercase truncate max-w-[150px]">{member.name}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                              {member.isMedium ? 'Médium' : 'Cambone'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-100">
                         <span className={`text-[11px] font-black ${attendanceRate >= 80 ? 'text-emerald-600' : attendanceRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                           {attendanceRate}%
                         </span>
                      </td>
                      {recordedDates.map(date => {
                        const record = memberRecords.find(r => r.date === date);
                        return (
                          <td key={date} className="px-2 py-4 text-center">
                             {record?.status === 'presente' && (
                               <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm" title="Presente">
                                  <Check size={14} strokeWidth={4} />
                               </div>
                             )}
                             {record?.status === 'ausente' && (
                               <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm" title="Falta">
                                  <X size={14} strokeWidth={4} />
                               </div>
                             )}
                             {record?.status === 'justificado' && (
                               <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm" title="Justificado">
                                  <Clock size={14} strokeWidth={4} />
                               </div>
                             )}
                             {!record && (
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mx-auto" />
                             )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Calendar size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle de Frequência</p>
                <div className="flex items-center gap-3">
                   <button onClick={() => handleDateChange('prev')} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><ChevronLeft size={20} /></button>
                   <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      {formatSafe(selectedDate, "dd 'de' MMMM")}
                   </h3>
                   <button onClick={() => handleDateChange('next')} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><ChevronRight size={20} /></button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filtrar médiuns..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 text-sm font-medium"
                  style={{ '--tw-ring-color': config.primaryColor } as any}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <BarChart3 size={14} /> Distribuição de Presença
              </h4>
              <div className="flex gap-4">
                <button 
                  onClick={() => setViewMode('history')}
                  className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  <FileText size={12} /> Ver Relatório Geral
                </button>
                <button 
                  onClick={markAllPresent}
                  className="text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-800"
                >
                  Marcar Todos Presentes
                </button>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex w-full h-8 rounded-xl overflow-hidden shadow-inner bg-gray-100 border border-gray-100">
                 <div className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-black" style={{ width: `${stats.presentPercent}%` }} title={`Presentes: ${stats.present}`}>{stats.presentPercent > 10 && `${stats.presentPercent}%`}</div>
                 <div className="h-full bg-amber-400 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-black" style={{ width: `${stats.justifiedPercent}%` }} title={`Justificados: ${stats.justified}`}>{stats.justifiedPercent > 10 && `${stats.justifiedPercent}%`}</div>
                 <div className="h-full bg-red-500 transition-all duration-500 flex items-center justify-center text-[10px] text-white font-black" style={{ width: `${stats.absentPercent}%` }} title={`Ausentes: ${stats.absent}`}>{stats.absentPercent > 10 && `${stats.absentPercent}%`}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Médium / Cambone</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status Atual</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação de Chamada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((member) => {
                const record = currentDayRecords.find(r => r.memberId === member.id);
                const status = record?.status;

                return (
                  <tr key={member.id} className={`hover:bg-indigo-50/20 transition-all group ${!status ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-8 py-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users size={18} className="text-gray-300" />}
                          </div>
                          <div>
                             <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{member.name}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{member.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-4">
                       <div className="flex gap-2">
                          {member.isMedium && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-black uppercase">Médium</span>
                          )}
                          {member.isCambone && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-black uppercase">Cambone</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                       {status === 'presente' && (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase">
                            <UserCheck size={12} /> Presente
                         </div>
                       )}
                       {status === 'ausente' && (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase">
                            <UserX size={12} /> Ausente
                         </div>
                       )}
                       {status === 'justificado' && (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">
                            <Clock size={12} /> Justificado
                         </div>
                       )}
                       {!status && (
                         <span className="text-[9px] font-black text-gray-300 uppercase italic">Aguardando...</span>
                       )}
                    </td>
                    <td className="px-8 py-4 text-right">
                       <div className="inline-flex p-1 bg-gray-100 rounded-2xl gap-1">
                          <button onClick={() => updateStatus(member.id, 'presente')} title="Marcar como Presente" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === 'presente' ? 'bg-emerald-500 text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-white hover:text-emerald-500'}`}><Check size={18} strokeWidth={3} /></button>
                          <button onClick={() => updateStatus(member.id, 'justificado')} title="Marcar como Justificado" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === 'justificado' ? 'bg-amber-400 text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-white hover:text-amber-500'}`}><AlertCircle size={18} strokeWidth={3} /></button>
                          <button onClick={() => updateStatus(member.id, 'ausente')} title="Marcar como Ausente" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === 'ausente' ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-gray-400 hover:bg-white hover:text-red-500'}`}><X size={18} strokeWidth={3} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
