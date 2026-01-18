
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SupportTicket, SupportTicketReply, SaaSClient, PredefinedResponse, SupportTicketAttachment } from '../types';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  AlertCircle, 
  Search, 
  Filter, 
  X,
  ShieldCheck,
  ArrowLeft,
  User as UserIcon,
  Globe,
  MoreVertical,
  Check,
  History,
  Archive,
  Download,
  Upload,
  Zap,
  Book,
  Plus,
  Trash2,
  ChevronDown,
  Paperclip,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  DollarSign,
  HelpCircle,
  Lightbulb,
  Wrench,
  Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface MasterTicketManagerProps {
  tickets: SupportTicket[];
  onUpdateTickets: (tickets: SupportTicket[]) => void;
  clients: SaaSClient[];
}

export const MasterTicketManager: React.FC<MasterTicketManagerProps> = ({ tickets, onUpdateTickets, clients }) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aberto' | 'em_analise' | 'concluido'>('todos');
  const [selectedAttachments, setSelectedAttachments] = useState<SupportTicketAttachment[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [predefinedResponses, setPredefinedResponses] = useState<PredefinedResponse[]>(() => {
    const saved = localStorage.getItem('saas_support_templates');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Boas Vindas', content: 'Olá! Recebemos sua solicitação e nossa equipe técnica já está analisando o caso. Retornaremos em breve.' },
      { id: '2', title: 'Solicitar Print', content: 'Para que possamos agilizar o atendimento, poderia nos enviar um print da tela onde o erro ocorre?' },
      { id: '3', title: 'Correção Aplicada', content: 'Informamos que a correção para o problema relatado já foi aplicada em sua instância. Por favor, recarregue o sistema e teste novamente.' },
      { id: '4', title: 'Encerramento', content: 'Ficamos felizes em ajudar! Como o problema foi resolvido, estamos encerrando este chamado. Se precisar de algo mais, sinta-se à vontade para abrir um novo ticket.' }
    ];
  });

  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '' });

  useEffect(() => {
    localStorage.setItem('saas_support_templates', JSON.stringify(predefinedResponses));
  }, [predefinedResponses]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'todos' ? true : t.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tickets, searchQuery, statusFilter]);

  const groupedTickets = useMemo(() => {
    return {
      tecnico: filteredTickets.filter(t => t.category === 'tecnico'),
      financeiro: filteredTickets.filter(t => t.category === 'financeiro'),
      duvida: filteredTickets.filter(t => t.category === 'duvida'),
      sugestao: filteredTickets.filter(t => t.category === 'sugestao'),
    };
  }, [filteredTickets]);

  const updateStatus = (id: string, status: SupportTicket['status']) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t);
    onUpdateTickets(updated);
    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status, updatedAt: new Date().toISOString() });
    }
  };

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'aberto') {
      updateStatus(ticket.id, 'em_analise');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const attachment: SupportTicketAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          data: reader.result as string
        };
        setSelectedAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setSelectedAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket || (!newMessage.trim() && selectedAttachments.length === 0)) return;

    const reply: SupportTicketReply = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: 'Rodrigo Master',
      senderRole: 'master',
      message: newMessage,
      timestamp: new Date().toISOString(),
      attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, reply],
      updatedAt: new Date().toISOString(),
      status: 'aguardando_usuario'
    };

    onUpdateTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage('');
    setSelectedAttachments([]);
    setShowTemplatePicker(false);
  };

  const handleDeleteReply = (replyId: string) => {
    if (!selectedTicket || !confirm('Deseja realmente remover esta resposta da conversa?')) return;

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      replies: selectedTicket.replies.filter(r => r.id !== replyId),
      updatedAt: new Date().toISOString()
    };

    onUpdateTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (!confirm('Deseja realmente remover este ticket da fila de suporte?')) return;
    const updated = tickets.filter(t => t.id !== ticketId);
    onUpdateTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
      setSelectedAttachments([]);
      setNewMessage('');
      setShowTemplatePicker(false);
    }
  };

  const downloadConversation = (ticket: SupportTicket) => {
    let content = `LOG DE ATENDIMENTO MASTER - CHAMADO #${ticket.id}\n`;
    content += `Cliente: ${ticket.clientName} (ID: ${ticket.clientId})\n`;
    content += `Assunto: ${ticket.subject}\n`;
    content += `Status: ${ticket.status.toUpperCase()}\n`;
    content += `Data: ${format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}\n`;
    content += `--------------------------------------------------\n\n`;
    content += `[${format(new Date(ticket.createdAt), 'dd/MM HH:mm')}] ${ticket.clientName}: ${ticket.description}\n`;
    if (ticket.initialAttachments) {
      ticket.initialAttachments.forEach(a => content += `> Anexo Inicial: ${a.name}\n`);
    }
    content += `\n`;

    ticket.replies.forEach(r => {
      content += `[${format(new Date(r.timestamp), 'dd/MM HH:mm')}] ${r.senderName}${r.senderRole === 'master' ? ' (VOCÊ)' : ''}: ${r.message}\n`;
      if (r.attachments) {
        r.attachments.forEach(a => content += `> Anexo: ${a.name}\n`);
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Master_Ticket_${ticket.id}.txt`;
    link.click();
  };

  const handleAddTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) return;
    const template: PredefinedResponse = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTemplate.title,
      content: newTemplate.content
    };
    setPredefinedResponses([...predefinedResponses, template]);
    setNewTemplate({ title: '', content: '' });
  };

  const handleDeleteTemplate = (id: string) => {
    setPredefinedResponses(predefinedResponses.filter(r => r.id !== id));
  };

  const handleUseTemplate = (content: string) => {
    setNewMessage(content);
    setShowTemplatePicker(false);
  };

  const handleBackupTickets = () => {
    const data = {
      tickets,
      templates: predefinedResponses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SaaS_SUPPORT_SNAPSHOT_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  const handleRestoreTickets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('Importar dados de suporte?')) {
          if (data.tickets) onUpdateTickets(data.tickets);
          if (data.templates) setPredefinedResponses(data.templates);
          alert('Dados Importados!');
        }
      } catch (err) { alert('Erro ao ler arquivo.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'urgente': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'alta': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const renderAttachment = (attachment: SupportTicketAttachment) => {
    const isImage = attachment.type.startsWith('image/');
    return (
      <div key={attachment.id} className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 inline-block max-w-full group/att">
         <div className="flex items-center gap-3">
            {isImage ? <ImageIcon size={14} className="text-indigo-400" /> : <FileText size={14} className="text-red-400" />}
            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{attachment.name}</p>
            <div className="flex items-center gap-1">
              <a href={attachment.data} download={attachment.name} className="p-1 hover:bg-slate-800 rounded text-indigo-400 transition-colors">
                <Download size={12} />
              </a>
              {isImage && (
                <button 
                  onClick={() => setZoomedImage(attachment.data)}
                  className="p-1 hover:bg-slate-800 rounded text-indigo-400 transition-colors"
                >
                  <Maximize2 size={12} />
                </button>
              )}
            </div>
         </div>
         {isImage && (
           <img 
            src={attachment.data} 
            onClick={() => setZoomedImage(attachment.data)}
            className="mt-2 rounded-lg max-h-40 object-contain border border-slate-800 cursor-zoom-in hover:opacity-80 transition-opacity" 
           />
         )}
      </div>
    );
  };

  const TicketTable = ({ title, ticketsList, icon: Icon, colorClass }: { title: string, ticketsList: SupportTicket[], icon: any, colorClass: string }) => {
    if (ticketsList.length === 0) return null;
    return (
      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
        <div className={`p-6 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-slate-800 ${colorClass}`}>
              <Icon size={20} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
          </div>
          <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
            {ticketsList.length} CHAMADO(S)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="px-10 py-5">Terreiro de Origem</th>
                <th className="px-8 py-5">Assunto / Problema</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-center">Prioridade</th>
                <th className="px-10 py-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ticketsList.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-800/40 transition-all cursor-pointer group" onClick={() => handleOpenTicket(ticket)}>
                  <td className="px-10 py-5">
                    <p className="font-mono text-[10px] font-black text-indigo-400">#{ticket.id}</p>
                    <p className="font-black text-white uppercase text-xs tracking-tight mt-0.5">{ticket.clientName}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-300 text-sm uppercase truncate max-w-[220px]">{ticket.subject}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase mt-0.5">Última: {format(new Date(ticket.updatedAt), 'dd/MM HH:mm')}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${
                      ticket.status === 'aberto' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      ticket.status === 'em_analise' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      ticket.status === 'concluido' ? 'bg-slate-800 text-slate-500 border-slate-700' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>{ticket.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-0.5 rounded text-[9px] font-black uppercase border ${getPriorityStyle(ticket.priority)}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-10 py-5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
                        className="p-1 hover:bg-slate-800 rounded text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover ticket"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 transition-all flex items-center justify-center ml-auto shadow-lg">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Modal de Zoom de Imagem */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all" onClick={() => setZoomedImage(null)}>
            <X size={32} />
          </button>
          <img src={zoomedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in duration-300" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {selectedTicket ? (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => { setSelectedTicket(null); setShowTemplatePicker(false); setSelectedAttachments([]); }}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"
                 >
                   <ArrowLeft size={20} />
                 </button>
                 <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Atendimento #{selectedTicket.id}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedTicket.clientName}</p>
                      <span className="text-slate-600 text-[10px] font-bold">•</span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {selectedTicket.clientId}</p>
                   </div>
                 </div>
              </div>

              <div className="flex gap-2">
                 <button 
                    onClick={() => downloadConversation(selectedTicket)}
                    className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-black text-[9px] uppercase hover:text-white transition-all flex items-center gap-2"
                 >
                    <Download size={14} /> Exportar Log
                 </button>
                 <button onClick={() => updateStatus(selectedTicket.id, 'em_analise')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase transition-all ${selectedTicket.status === 'em_analise' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>Em Análise</button>
                 <button onClick={() => updateStatus(selectedTicket.id, 'concluido')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase transition-all ${selectedTicket.status === 'concluido' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>Concluir</button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                 <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl p-10 flex flex-col h-[650px]">
                    <div className="flex-1 overflow-y-auto space-y-8 pr-4" style={{ scrollbarWidth: 'thin' }}>
                       <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-600/20">
                             <Globe size={24} />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <p className="font-black text-xs text-white uppercase">{selectedTicket.clientName}</p>
                                <p className="text-[10px] font-bold text-slate-500">{format(new Date(selectedTicket.createdAt), 'dd/MM HH:mm')}</p>
                             </div>
                             <div className="p-6 bg-slate-950 rounded-3xl rounded-tl-none border border-slate-800 shadow-inner">
                                <h4 className="font-black text-indigo-400 uppercase text-xs mb-3 border-b border-slate-800 pb-2">{selectedTicket.subject}</h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedTicket.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTicket.initialAttachments?.map(renderAttachment)}
                                </div>
                             </div>
                          </div>
                       </div>

                       {selectedTicket.replies.map(reply => (
                          <div key={reply.id} className={`flex gap-4 group/reply ${reply.senderRole === 'master' ? 'flex-row-reverse' : ''}`}>
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${reply.senderRole === 'master' ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-indigo-600/20 text-indigo-400 border-indigo-600/20'}`}>
                                {reply.senderRole === 'master' ? <ShieldCheck size={24} /> : <UserIcon size={24} />}
                             </div>
                             <div className={`flex-1 ${reply.senderRole === 'master' ? 'text-right' : ''}`}>
                                <div className={`flex items-center gap-3 mb-2 ${reply.senderRole === 'master' ? 'justify-end' : ''}`}>
                                   <p className="font-black text-xs text-white uppercase">{reply.senderName} {reply.senderRole === 'master' && '(VOCÊ)'}</p>
                                   <p className="text-[10px] font-bold text-slate-500">{format(new Date(reply.timestamp), 'dd/MM HH:mm')}</p>
                                   {reply.senderRole === 'master' && (
                                     <button 
                                      onClick={() => handleDeleteReply(reply.id)}
                                      className="p-1.5 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover/reply:opacity-100"
                                      title="Apagar Resposta"
                                     >
                                        <Trash2 size={12} />
                                     </button>
                                   )}
                                </div>
                                <div className={`p-6 rounded-3xl border transition-all ${reply.senderRole === 'master' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-xl' : 'bg-slate-950 text-slate-300 border-slate-800 rounded-tl-none shadow-inner'}`}>
                                   <p className="text-sm leading-relaxed font-medium">{reply.message}</p>
                                   <div className="flex flex-wrap gap-2">
                                      {reply.attachments?.map(renderAttachment)}
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-800 relative">
                       {selectedAttachments.length > 0 && (
                         <div className="absolute bottom-full left-0 mb-4 w-full bg-slate-800 border border-slate-700 p-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Anexos prontos para envio ({selectedAttachments.length}):</p>
                            <div className="flex flex-wrap gap-2">
                               {selectedAttachments.map(a => (
                                 <div key={a.id} className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                                    <Paperclip size={12} className="text-indigo-400" />
                                    <span className="text-[9px] font-black text-slate-300 uppercase truncate max-w-[150px]">{a.name}</span>
                                    <button onClick={() => removeAttachment(a.id)} className="p-0.5 hover:bg-slate-800 rounded-full text-red-400 transition-all"><X size={12} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {showTemplatePicker && (
                         <div className="absolute bottom-full left-0 mb-4 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest p-2 border-b border-slate-700">Macros Rápidas</p>
                            <div className="max-h-48 overflow-y-auto mt-1" style={{ scrollbarWidth: 'thin' }}>
                               {predefinedResponses.map(resp => (
                                 <button 
                                  key={resp.id}
                                  onClick={() => handleUseTemplate(resp.content)}
                                  className="w-full text-left p-3 hover:bg-slate-700 rounded-xl transition-colors text-xs font-bold text-slate-300 flex items-center gap-2"
                                 >
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                    <span className="truncate">{resp.title}</span>
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}

                       <form onSubmit={handleReply} className="flex gap-4">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-5 bg-slate-950 text-slate-600 rounded-2xl hover:bg-slate-800 hover:text-indigo-400 transition-all flex items-center justify-center shrink-0 border border-slate-800"
                          >
                             <Paperclip size={24} />
                             <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                          </button>
                          <div className="flex-1 relative">
                             <input 
                               className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm text-white pr-14"
                               placeholder="Escreva sua resposta master..."
                               value={newMessage}
                               onChange={e => setNewMessage(e.target.value)}
                               disabled={selectedTicket.status === 'concluido'}
                             />
                             <button 
                              type="button"
                              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showTemplatePicker ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-indigo-400'}`}
                             >
                                <Zap size={18} fill={showTemplatePicker ? 'currentColor' : 'none'} />
                             </button>
                          </div>
                          <button 
                           disabled={selectedTicket.status === 'concluido' || (!newMessage.trim() && selectedAttachments.length === 0)}
                           className="px-8 py-5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                          >
                             <Send size={24} />
                          </button>
                       </form>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl p-10 space-y-8">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800 pb-4">Dossiê do Terreiro</h4>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl"><Globe size={20} /></div>
                          <div>
                             <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Terreiro</p>
                             <p className="text-xs font-black text-white uppercase">{selectedTicket.clientName}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <div className="p-3 bg-amber-600/10 text-amber-500 rounded-xl"><AlertCircle size={20} /></div>
                          <div>
                             <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Prioridade / Categoria</p>
                             <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getPriorityStyle(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[8px] font-black uppercase border border-slate-700">{selectedTicket.category}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="p-8 bg-indigo-600/10 border border-indigo-600/20 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                    <History className="text-indigo-400" size={32} />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocolo de Resposta</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Respostas master podem ser removidas se necessário. O cliente verá apenas o estado final da conversa.</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl text-indigo-400">
                   <MessageCircle size={40} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Fluxo de Suporte Master</h2>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Triagem consolidada e categorizada por área de atendimento</p>
                </div>
             </div>
             
             <div className="flex gap-4">
                <button onClick={() => setShowTemplateManager(true)} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2"><Book size={16} /> Macros</button>
                <button onClick={handleBackupTickets} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2"><Download size={16} /> Snapshot</button>
                <label className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2 cursor-pointer"><Upload size={16} /> Importar<input type="file" className="hidden" accept=".json" onChange={handleRestoreTickets} /></label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <button onClick={() => setStatusFilter('todos')} className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${statusFilter === 'todos' ? 'bg-indigo-600 border-indigo-500 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Global</p><h4 className="text-3xl font-black text-white">{tickets.length}</h4></button>
             <button onClick={() => setStatusFilter('aberto')} className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${statusFilter === 'aberto' ? 'bg-emerald-600 border-emerald-500 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Em Aberto</p><h4 className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'aberto').length}</h4></button>
             <button onClick={() => setStatusFilter('em_analise')} className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${statusFilter === 'em_analise' ? 'bg-amber-600 border-amber-500 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Em Triagem</p><h4 className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'em_analise').length}</h4></button>
             <button onClick={() => setStatusFilter('concluido')} className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-2 ${statusFilter === 'concluido' ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Concluídos</p><h4 className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'concluido').length}</h4></button>
          </div>

          <div className="relative mb-6">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
            <input 
              type="text" 
              placeholder="Pesquisar em todos os chamados..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-300 shadow-xl"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <TicketTable 
              title="Problemas Técnicos" 
              ticketsList={groupedTickets.tecnico} 
              icon={Wrench} 
              colorClass="text-indigo-400" 
            />
            <TicketTable 
              title="Assuntos Financeiros" 
              ticketsList={groupedTickets.financeiro} 
              icon={DollarSign} 
              colorClass="text-emerald-400" 
            />
            <TicketTable 
              title="Dúvidas de Uso" 
              ticketsList={groupedTickets.duvida} 
              icon={HelpCircle} 
              colorClass="text-amber-400" 
            />
            <TicketTable 
              title="Sugestões de Melhoria" 
              ticketsList={groupedTickets.sugestao} 
              icon={Lightbulb} 
              colorClass="text-cyan-400" 
            />
            
            {filteredTickets.length === 0 && (
              <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl p-32 text-center">
                 <LayoutGrid size={48} className="mx-auto text-slate-800 mb-4" />
                 <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">Fila Vazia • Sem chamados com os filtros atuais</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Gestão de Macros/Templates */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Zap size={24} fill="currentColor" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Macros de Resposta</h3>
                 </div>
                 <button onClick={() => setShowTemplateManager(false)} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                 <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Criar Novo Modelo</h4>
                    <input 
                      placeholder="Título Curto (Ex: Boas Vindas)" 
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newTemplate.title}
                      onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
                    />
                    <textarea 
                      placeholder="Conteúdo da Resposta..." 
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                      value={newTemplate.content}
                      onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                    />
                    <button 
                      onClick={handleAddTemplate}
                      disabled={!newTemplate.title || !newTemplate.content}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                       <Plus size={18} /> Adicionar aos Meus Modelos
                    </button>
                 </div>

                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Modelos Ativos ({predefinedResponses.length})</h4>
                    <div className="grid grid-cols-1 gap-3">
                       {predefinedResponses.map(resp => (
                         <div key={resp.id} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl flex justify-between items-start group">
                            <div className="flex-1 min-w-0">
                               <h5 className="text-sm font-black text-white uppercase mb-1">{resp.title}</h5>
                               <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{resp.content}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteTemplate(resp.id)}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="p-8 border-t border-slate-800 bg-slate-950/50 flex justify-center">
                 <button 
                  onClick={() => setShowTemplateManager(false)}
                  className="px-10 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs hover:bg-slate-700 transition-all"
                 >
                    Fechar Gestão
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
