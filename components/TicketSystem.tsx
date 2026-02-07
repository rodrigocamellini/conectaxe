
import React, { useState, useMemo, useRef } from 'react';
import { SupportTicket, SupportTicketReply, SystemConfig, User, SupportTicketAttachment } from '../types';
import { 
  Plus, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  AlertCircle, 
  Search, 
  Filter, 
  X,
  User as UserIcon,
  ShieldCheck,
  ArrowLeft,
  Info,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Upload,
  Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketSystemProps {
  user: User;
  config: SystemConfig;
  tickets: SupportTicket[];
  onUpdateTickets: (tickets: SupportTicket[]) => void;
}

export const TicketSystem: React.FC<TicketSystemProps> = ({ user, config, tickets, onUpdateTickets }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<SupportTicketAttachment[]>([]);
  const [initialAttachments, setInitialAttachments] = useState<SupportTicketAttachment[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<SupportTicket>>({
    subject: '',
    category: 'tecnico',
    priority: 'media',
    description: ''
  });

  const myTickets = useMemo(() => {
    const clientId = config.license?.clientId || user.id;
    return tickets.filter(t => t.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tickets, config, user]);

  const filteredTickets = myTickets.filter(t => 
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isInitial: boolean) => {
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
        if (isInitial) {
          setInitialAttachments(prev => [...prev, attachment]);
        } else {
          setSelectedAttachments(prev => [...prev, attachment]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input to allow picking another file (even the same one)
  };

  const removeAttachment = (id: string, isInitial: boolean) => {
    if (isInitial) {
      setInitialAttachments(prev => prev.filter(a => a.id !== id));
    } else {
      setSelectedAttachments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newTicket: SupportTicket = {
      id,
      clientId: config.license?.clientId || user.id,
      clientName: config.systemName,
      subject: formData.subject || 'Sem Assunto',
      category: (formData.category as any) || 'tecnico',
      priority: (formData.priority as any) || 'media',
      status: 'aberto',
      description: formData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      initialAttachments: initialAttachments.length > 0 ? initialAttachments : undefined
    };

    onUpdateTickets([newTicket, ...tickets]);
    setShowAddModal(false);
    setFormData({ subject: '', category: 'tecnico', priority: 'media', description: '' });
    setInitialAttachments([]);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!newMessage.trim() && selectedAttachments.length === 0)) return;

    const reply: SupportTicketReply = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: user.name,
      senderRole: 'admin',
      message: newMessage,
      timestamp: new Date().toISOString(),
      attachments: selectedAttachments.length > 0 ? selectedAttachments : undefined
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, reply],
      updatedAt: new Date().toISOString(),
      status: 'aberto'
    };

    onUpdateTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage('');
    setSelectedAttachments([]);
  };

  const downloadConversation = (ticket: SupportTicket) => {
    let content = `LOG DE ATENDIMENTO - CHAMADO #${ticket.id}\n`;
    content += `Assunto: ${ticket.subject}\n`;
    content += `Status Final: ${ticket.status.toUpperCase()}\n`;
    content += `Data de Abertura: ${format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}\n`;
    content += `--------------------------------------------------\n\n`;
    content += `[${format(new Date(ticket.createdAt), 'dd/MM HH:mm')}] ${ticket.clientName}: ${ticket.description}\n`;
    if (ticket.initialAttachments) {
      ticket.initialAttachments.forEach(a => content += `> Anexo Inicial: ${a.name}\n`);
    }
    content += `\n`;

    ticket.replies.forEach(r => {
      content += `[${format(new Date(r.timestamp), 'dd/MM HH:mm')}] ${r.senderName}${r.senderRole === 'master' ? ' (Suporte Master)' : ''}: ${r.message}\n`;
      if (r.attachments) {
        r.attachments.forEach(a => content += `> Anexo: ${a.name}\n`);
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Conversa_Ticket_${ticket.id}.txt`;
    link.click();
  };

  const getStatusStyle = (status: SupportTicket['status']) => {
    switch (status) {
      case 'aberto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'em_analise': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'concluido': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'aguardando_usuario': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const renderAttachment = (attachment: SupportTicketAttachment) => {
    const isImage = attachment.type.startsWith('image/');
    return (
      <div key={attachment.id} className="mt-3 p-3 bg-white/50 rounded-xl border border-gray-200 inline-block max-w-full group/att">
         <div className="flex items-center gap-3">
            {isImage ? <ImageIcon size={16} className="text-indigo-500" /> : <FileText size={16} className="text-red-500" />}
            <p className="text-[10px] font-black text-gray-600 truncate max-w-[200px]">{attachment.name}</p>
            <div className="flex items-center gap-1">
              <a href={attachment.data} download={attachment.name} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">
                <Download size={14} />
              </a>
              {isImage && (
                <button 
                  onClick={() => setZoomedImage(attachment.data)}
                  className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                >
                  <Maximize2 size={14} />
                </button>
              )}
            </div>
         </div>
         {isImage && (
           <img 
            src={attachment.data} 
            onClick={() => setZoomedImage(attachment.data)}
            className="mt-2 rounded-lg max-h-40 object-contain border border-gray-100 cursor-zoom-in hover:opacity-90 transition-opacity" 
           />
         )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Modal de Zoom de Imagem */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all shadow-2xl" onClick={() => setZoomedImage(null)}>
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
                  onClick={() => setSelectedTicket(null)}
                  className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-indigo-600 shadow-sm transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Chamado #{selectedTicket.id}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedTicket.subject}</p>
                </div>
              </div>
              <button 
                onClick={() => downloadConversation(selectedTicket)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-black text-[10px] uppercase hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Download size={16} /> Baixar Conversa
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                 <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-[600px]">
                    <div className="flex-1 overflow-y-auto space-y-6 pr-4" style={{ scrollbarWidth: 'thin' }}>
                       {/* Mensagem Inicial */}
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                             <UserIcon size={20} />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-1">
                                <p className="font-black text-xs text-gray-800 uppercase">{selectedTicket.clientName}</p>
                                <p className="text-[10px] font-bold text-gray-400">{format(new Date(selectedTicket.createdAt), 'dd/MM HH:mm')}</p>
                             </div>
                             <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none border border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTicket.initialAttachments?.map(renderAttachment)}
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Respostas */}
                       {selectedTicket.replies.map(reply => (
                          <div key={reply.id} className={`flex gap-4 ${reply.senderRole === 'master' ? 'flex-row-reverse' : ''}`}>
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${reply.senderRole === 'master' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                {reply.senderRole === 'master' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
                             </div>
                             <div className={`flex-1 ${reply.senderRole === 'master' ? 'text-right' : ''}`}>
                                <div className={`flex items-center gap-3 mb-1 ${reply.senderRole === 'master' ? 'justify-end' : ''}`}>
                                   <p className="font-black text-xs text-gray-800 uppercase">{reply.senderName} {reply.senderRole === 'master' && '• Suporte Master'}</p>
                                   <p className="text-[10px] font-bold text-gray-400">{format(new Date(reply.timestamp), 'dd/MM HH:mm')}</p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${reply.senderRole === 'master' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-gray-50 text-gray-700 border-gray-100 rounded-tl-none'}`}>
                                   <p className="text-sm leading-relaxed">{reply.message}</p>
                                   <div className="flex flex-wrap gap-2">
                                      {reply.attachments?.map(renderAttachment)}
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                       {selectedAttachments.length > 0 && (
                         <div className="mb-3 space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Anexos para enviar ({selectedAttachments.length}):</p>
                            <div className="flex flex-wrap gap-2">
                               {selectedAttachments.map(a => (
                                 <div key={a.id} className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2 animate-in slide-in-from-left-2">
                                    <Paperclip size={12} className="text-indigo-600" />
                                    <span className="text-[9px] font-black text-indigo-700 uppercase truncate max-w-[120px]">{a.name}</span>
                                    <button onClick={() => removeAttachment(a.id, false)} className="p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 transition-colors"><X size={12} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       <form onSubmit={handleReply} className="flex gap-3">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center shrink-0"
                            disabled={selectedTicket.status === 'concluido'}
                          >
                             <Paperclip size={20} />
                             <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, false)} />
                          </button>
                          <input 
                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-bold text-sm"
                            style={{ '--tw-ring-color': config.primaryColor } as any}
                            placeholder="Digite sua mensagem..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            disabled={selectedTicket.status === 'concluido'}
                          />
                          <button 
                           disabled={selectedTicket.status === 'concluido' || (!newMessage.trim() && selectedAttachments.length === 0)}
                           className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                           style={{ backgroundColor: config.primaryColor }}
                          >
                             <Send size={20} />
                          </button>
                       </form>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Detalhes Técnicos</h4>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status do Chamado</p>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(selectedTicket.status)}`}>
                             {selectedTicket.status.replace('_', ' ')}
                          </span>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Categoria</p>
                          <p className="text-sm font-black text-gray-800 uppercase">{selectedTicket.category}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Prioridade</p>
                          <p className={`text-sm font-black uppercase ${selectedTicket.priority === 'urgente' || selectedTicket.priority === 'alta' ? 'text-red-500' : 'text-emerald-500'}`}>{selectedTicket.priority}</p>
                       </div>
                    </div>
                 </div>
                 {selectedTicket.status === 'concluido' && (
                   <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed uppercase">Este chamado foi encerrado pelo suporte. Você pode baixar a conversa para seus registros.</p>
                      </div>
                      <button 
                        onClick={() => downloadConversation(selectedTicket)}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-2"
                      >
                         <Download size={14} /> Exportar Log de Conversa
                      </button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-inner">
                <MessageCircle size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Central de Suporte</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Envie suas dúvidas e solicitações técnicas</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Plus size={18} /> Novo Chamado
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total</p>
                <p className="text-2xl font-black text-slate-800">{myTickets.length}</p>
             </div>
             <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Abertos</p>
                <p className="text-2xl font-black text-emerald-700">{myTickets.filter(t => t.status === 'aberto').length}</p>
             </div>
             <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Em Análise</p>
                <p className="text-2xl font-black text-indigo-700">{myTickets.filter(t => t.status === 'em_analise').length}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Concluídos</p>
                <p className="text-2xl font-black text-slate-600">{myTickets.filter(t => t.status === 'concluido').length}</p>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                   <Clock size={16} className="text-indigo-400" />
                   <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Seu Histórico de Chamados</h4>
                </div>
                <div className="relative w-full md:w-80">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="Filtrar por assunto..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 text-xs font-bold"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/30 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                         <th className="px-8 py-4">ID / Assunto</th>
                         <th className="px-8 py-4">Categoria</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4">Última Atualização</th>
                         <th className="px-8 py-4 text-right">Ação</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                         <tr key={ticket.id} className="hover:bg-indigo-50/20 transition-all cursor-pointer group" onClick={() => setSelectedTicket(ticket)}>
                            <td className="px-8 py-5">
                               <p className="font-mono text-[10px] font-black text-indigo-600">#{ticket.id}</p>
                               <p className="font-bold text-gray-800 text-sm uppercase truncate max-w-[250px]">{ticket.subject}</p>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{ticket.category}</p>
                            </td>
                            <td className="px-8 py-5">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(ticket.status)}`}>
                                  {ticket.status.replace('_', ' ')}
                               </span>
                            </td>
                            <td className="px-8 py-5 text-xs font-bold text-gray-400">
                               {format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm')}
                            </td>
                            <td className="px-8 py-5 text-right">
                               <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-colors ml-auto" />
                            </td>
                         </tr>
                      )) : (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">Nenhum chamado aberto.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Novo Chamado de Suporte</h3>
                    <p className="text-xs text-white/70 font-medium">Conteúdo direcionado ao suporte master Rodrigo Dev</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Assunto Curto</label>
                       <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-bold text-gray-700" placeholder="Ex: Erro ao gerar certificado" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Categoria</label>
                       <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-black text-[10px] uppercase text-gray-700" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                          <option value="tecnico">Problema Técnico</option>
                          <option value="financeiro">Financeiro / Pagamento</option>
                          <option value="duvida">Dúvida de Uso</option>
                          <option value="sugestao">Sugestão de Melhoria</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Prioridade</label>
                       <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                          {['baixa', 'media', 'alta', 'urgente'].map(p => (
                            <button key={p} type="button" onClick={() => setFormData({...formData, priority: p as any})} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${formData.priority === p ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:bg-white/50'}`}>{p}</button>
                          ))}
                       </div>
                    </div>
                    <div className="flex flex-col justify-end">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Anexar Arquivos ({initialAttachments.length})</label>
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button 
                                type="button" 
                                onClick={() => initialFileInputRef.current?.click()}
                                className={`flex-1 p-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase ${initialAttachments.length > 0 ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Paperclip size={16} />
                                {initialAttachments.length > 0 ? 'Adicionar Mais' : 'Enviar Prints/Arquivos'}
                            </button>
                          </div>
                          <input type="file" ref={initialFileInputRef} className="hidden" multiple onChange={(e) => handleFileChange(e, true)} />
                          
                          {initialAttachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                               {initialAttachments.map(a => (
                                 <div key={a.id} className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-indigo-700 truncate max-w-[100px]">{a.name}</span>
                                    <button type="button" onClick={() => removeAttachment(a.id, true)} className="text-red-400 hover:text-red-600 transition-colors"><X size={12} /></button>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Descrição Detalhada</label>
                    <textarea required rows={5} className="w-full p-6 bg-gray-50 border border-gray-200 rounded-[2rem] outline-none focus:ring-2 font-medium text-sm text-gray-700 resize-none" placeholder="Descreva aqui o que está acontecendo..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancelar</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.01] active:scale-95 transition-all" style={{ backgroundColor: config.primaryColor }}>Enviar Solicitação</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
