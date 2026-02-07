
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Member, IDCardConfig, IDCardLog, SystemConfig, User, ElementStyle, SpiritualEntity } from '../types';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Contact2, 
  Save, 
  Printer, 
  History, 
  Layout, 
  Search, 
  CheckSquare, 
  Square, 
  ArrowLeft, 
  X, 
  Camera, 
  Upload, 
  ImageIcon,
  Move,
  Palette,
  Fingerprint,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Filter,
  Users,
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DEFAULT_LOGO_URL, DEFAULT_IDCARD_CONFIG } from '../constants';

interface IDCardManagementProps {
  members: Member[];
  entities: SpiritualEntity[];
  logs: IDCardLog[];
  config: SystemConfig;
  currentUser: User;
  onUpdateLogs: (logs: IDCardLog[]) => void;
  onUpdateConfig: (config: SystemConfig) => void;
}

export const IDCardManagement: React.FC<IDCardManagementProps> = ({
  members,
  entities,
  logs,
  config,
  currentUser,
  onUpdateLogs,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'issue' | 'history'>('issue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printingBatch, setPrintingBatch] = useState<Member[]>([]);
  
  const [cardEditorData, setCardEditorData] = useState<IDCardConfig>(
    config.idCardConfig || DEFAULT_IDCARD_CONFIG
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const frontBgInputRef = useRef<HTMLInputElement>(null);
  const backBgInputRef = useRef<HTMLInputElement>(null);

  // Travar o scroll quando o preview estiver aberto
  useEffect(() => {
    if (showPrintPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPrintPreview]);

  const handleSaveConfig = () => {
    onUpdateConfig({ ...config, idCardConfig: cardEditorData });
    alert("Layout da carteirinha salvo com sucesso!");
  };

  const handleMouseDown = (elementKey: string) => setDraggingElement(elementKey);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setCardEditorData(prev => {
      const newData = { ...prev } as any;
      const styleKey = `${draggingElement}Style`;
      if (newData[styleKey]) {
        newData[styleKey] = { ...newData[styleKey], x: clampedX, y: clampedY };
      }
      return newData;
    });
  };

  const handleMouseUp = () => setDraggingElement(null);

  useEffect(() => {
    if (draggingElement) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingElement]);

  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGenerateCards = () => {
    const selected = members.filter(m => selectedMemberIds.includes(m.id));
    if (selected.length === 0) {
      alert("Selecione ao menos um membro para visualizar.");
      return;
    }

    setPrintingBatch(selected);
    
    // Registrar Logs
    const newLogs: IDCardLog[] = selected.map(m => {
      const previousIssues = logs.filter(l => l.memberId === m.id);
      return {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        memberId: m.id || 'N/A',
        memberName: m.name || 'Sem Nome',
        issueDate: new Date().toISOString(),
        version: previousIssues.length + 1,
        issuedBy: currentUser.name
      };
    });

    onUpdateLogs([...newLogs, ...logs]);
    setShowPrintPreview(true);
  };

  const openSinglePreview = (member: Member) => {
    setPrintingBatch([member]);
    setShowPrintPreview(true);
  };

  const handleGenerateSecondCopy = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const previousIssues = logs.filter(l => l.memberId === memberId);
    const newLog: IDCardLog = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      memberId: member.id,
      memberName: member.name,
      issueDate: new Date().toISOString(),
      version: previousIssues.length + 1,
      issuedBy: currentUser.name
    };

    onSaveLog(newLog).catch(console.error);
    setPrintingBatch([member]);
    setShowPrintPreview(true);
  };

  const handleBgUpload = (side: 'front' | 'back', file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardEditorData(prev => ({ ...prev, [side === 'front' ? 'frontBg' : 'backBg']: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.id || '').includes(searchQuery)
  );

  const getRoleName = (roleId?: string) => entities.find(e => e.id === roleId)?.name || 'Membro';

  const StyleControl = ({ label, styleKey }: { label: string, styleKey: keyof IDCardConfig }) => {
    const style = cardEditorData[styleKey] as any;
    if (!style) return null;

    return (
      <div className="p-3 bg-white border border-gray-100 rounded-2xl space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
           <div className="flex gap-2">
              <button 
                onClick={() => setCardEditorData(prev => ({ ...prev, [styleKey]: { ...style, visible: !style.visible } }))}
                className={`p-1 rounded ${style.visible ? 'text-indigo-600' : 'text-gray-300'}`}
              >
                {style.visible ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>
              {style.color !== undefined && (
                <input 
                  type="color" 
                  className="w-4 h-4 rounded-full cursor-pointer border-none p-0 bg-transparent"
                  value={style.color}
                  onChange={e => setCardEditorData(prev => ({ ...prev, [styleKey]: { ...style, color: e.target.value } }))}
                />
              )}
           </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[8px] font-bold text-gray-300">TAM</span>
           <input 
            type="range" min={styleKey.includes('Style') && !['logoStyle', 'photoStyle', 'qrCodeStyle'].includes(styleKey) ? "6" : "20"} max="200" 
            className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={style.size || style.fontSize}
            onChange={e => setCardEditorData(prev => ({
              ...prev, [styleKey]: { ...style, [style.size !== undefined ? 'size' : 'fontSize']: Number(e.target.value) }
            }))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #idcard-portal-root, #idcard-portal-root * { visibility: visible !important; }
          #idcard-print-area, #idcard-print-area * { visibility: visible !important; }
          #idcard-print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            height: auto !important;
            padding: 0 !important; 
            margin: 0 !important; 
            background: white !important;
            z-index: 99999 !important;
          }
          .no-print { display: none !important; }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <button onClick={() => setActiveTab('issue')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === 'issue' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Gerar Carteirinhas</button>
          <button onClick={() => setActiveTab('editor')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Editor de Layout</button>
          <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Histórico de Emissões</button>
        </div>
        
        {activeTab === 'issue' && (
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedMemberIds.length} selecionados</span>
              <button 
                onClick={handleGenerateCards}
                disabled={selectedMemberIds.length === 0}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl transition-all flex items-center gap-2 ${selectedMemberIds.length > 0 ? 'bg-emerald-600 text-white hover:scale-105 animate-bounce' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                  <Printer size={18} /> Abrir Visualização
              </button>
           </div>
        )}
      </div>

      {activeTab === 'issue' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Pesquisar por nome ou ID..." 
                   className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedMemberIds(filteredMembers.map(m => m.id))} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Selecionar Todos</button>
                 <button onClick={() => setSelectedMemberIds([])} className="text-[10px] font-black uppercase text-gray-400 hover:underline">Limpar</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => {
                 const isSelected = selectedMemberIds.includes(member.id);
                 const lastLog = [...logs].reverse().find(l => l.memberId === member.id);
                 
                 return (
                   <div 
                     key={member.id}
                     onClick={() => toggleMemberSelection(member.id)}
                     className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden ${isSelected ? 'bg-indigo-50 border-indigo-600 shadow-lg scale-[1.02]' : 'bg-white border-gray-100 hover:border-indigo-200'}`}
                   >
                      <div className="relative shrink-0">
                         <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}
                         </div>
                         <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-gray-200'}`}>
                            {isSelected ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className={`font-black text-xs uppercase truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{member.name || 'Sem Nome'}</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">{getRoleName(member.cargoId)}</p>
                         {lastLog ? (
                           <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit">
                              <History size={8} /> v{lastLog.version} em {format(new Date(lastLog.issueDate), 'dd/MM/yy')}
                           </span>
                         ) : (
                           <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase w-fit">Inédita</span>
                         )}
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); openSinglePreview(member); }}
                        className="absolute bottom-4 right-4 p-2 bg-indigo-100 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white"
                        title="Visualizar Agora"
                      >
                         <Eye size={16} />
                      </button>
                   </div>
                 );
              })}
              {filteredMembers.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400">
                  <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
                  <p className="font-bold uppercase text-xs tracking-widest">Nenhum membro encontrado</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
           <div className="xl:col-span-4 space-y-6">
              <div className="p-6 bg-indigo-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl"><Palette size={20} /></div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Layout</h4>
                 </div>
                 <button onClick={handleSaveConfig} className="px-6 py-2 bg-[#ADFF2F] text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"><Save size={16} /></button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                 <div className="p-4 bg-white border border-gray-100 rounded-[2rem] space-y-4 shadow-sm">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Fundos (8.5 x 5.4 cm)</h5>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => frontBgInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-indigo-50 transition-all">
                          <ImageIcon size={20} className="text-indigo-400" />
                          <span className="text-[8px] font-black uppercase">Frente</span>
                       </button>
                       <button onClick={() => backBgInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-indigo-50 transition-all">
                          <ImageIcon size={20} className="text-indigo-400" />
                          <span className="text-[8px] font-black uppercase">Verso</span>
                       </button>
                       <input type="file" ref={frontBgInputRef} className="hidden" accept="image/*" onChange={e => handleBgUpload('front', e.target.files?.[0] || null)} />
                       <input type="file" ref={backBgInputRef} className="hidden" accept="image/*" onChange={e => handleBgUpload('back', e.target.files?.[0] || null)} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                    <StyleControl label="Logo Casa" styleKey="logoStyle" />
                    <StyleControl label="Foto" styleKey="photoStyle" />
                    <StyleControl label="Nome" styleKey="nameStyle" />
                    <StyleControl label="Função" styleKey="roleStyle" />
                    <StyleControl label="Matrícula" styleKey="idStyle" />
                    <StyleControl label="CPF" styleKey="cpfStyle" />
                    <StyleControl label="RG" styleKey="rgStyle" />
                    <StyleControl label="Emissão" styleKey="issueDateStyle" />
                    <StyleControl label="QR Code" styleKey="qrCodeStyle" />
                 </div>
              </div>
           </div>

           <div className="xl:col-span-8 space-y-6">
              <div 
                ref={previewRef}
                onMouseMove={handleMouseMove}
                className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-12"
              >
                 <div className="relative w-full max-w-[400px] aspect-[1.586/1] bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-800 cursor-crosshair select-none">
                    {cardEditorData.frontBg && <img src={cardEditorData.frontBg} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
                    {cardEditorData.logoStyle?.visible && (
                      <div onMouseDown={() => handleMouseDown('logo')} className="absolute z-20 cursor-move" style={{ left: `${cardEditorData.logoStyle.x}%`, top: `${cardEditorData.logoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.logoStyle.size}px` }}>
                        <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain pointer-events-none opacity-60" />
                      </div>
                    )}
                    {cardEditorData.photoStyle?.visible && (
                      <div onMouseDown={() => handleMouseDown('photo')} className="absolute z-20 cursor-move bg-gray-100 rounded-xl border-2 border-white shadow-md flex items-center justify-center overflow-hidden" style={{ left: `${cardEditorData.photoStyle.x}%`, top: `${cardEditorData.photoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.photoStyle.size}px`, height: `${cardEditorData.photoStyle.size}px` }}>
                        <Camera size={24} className="text-gray-300" />
                      </div>
                    )}
                    {cardEditorData.nameStyle?.visible && (
                      <div onMouseDown={() => handleMouseDown('name')} className="absolute z-20 cursor-move whitespace-nowrap font-black uppercase text-center" style={{ left: `${cardEditorData.nameStyle.x}%`, top: `${cardEditorData.nameStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${cardEditorData.nameStyle.fontSize}px`, color: cardEditorData.nameStyle.color }}>NOME DO MEMBRO</div>
                    )}
                    <div className="absolute top-2 right-4 text-[7px] font-black text-gray-300 uppercase">Frente</div>
                 </div>

                 <div className="relative w-full max-w-[400px] aspect-[1.586/1] bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-800 cursor-crosshair select-none">
                    {cardEditorData.backBg && <img src={cardEditorData.backBg} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
                    {cardEditorData.qrCodeStyle?.visible && (
                      <div onMouseDown={() => handleMouseDown('qrCode')} className="absolute z-20 cursor-move p-2 bg-white rounded-lg border border-gray-100 flex items-center justify-center" style={{ left: `${cardEditorData.qrCodeStyle.x}%`, top: `${cardEditorData.qrCodeStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.qrCodeStyle.size}px`, height: `${cardEditorData.qrCodeStyle.size}px` }}>
                        <Fingerprint size={(cardEditorData.qrCodeStyle.size || 40) * 0.6} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-4 text-[7px] font-black text-gray-300 uppercase">Verso</div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
           <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <History size={18} className="text-indigo-600" />
                 <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Logs de Emissão</h4>
              </div>
              <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase">{logs.length} Registros</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <th className="px-8 py-4">Membro</th>
                       <th className="px-8 py-4">Data/Hora</th>
                       <th className="px-8 py-4 text-center">Via</th>
                       <th className="px-8 py-4 text-right">Ação</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {logs.length > 0 ? [...logs].reverse().map(log => (
                       <tr key={log.id} className="hover:bg-indigo-50/10 transition-colors group">
                          <td className="px-8 py-4">
                             <p className="font-bold text-gray-700 text-xs uppercase">{log.memberName || 'N/A'}</p>
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-gray-500">
                             {isValid(new Date(log.issueDate)) ? format(new Date(log.issueDate), "dd/MM/yyyy HH:mm") : 'Data Inválida'}
                          </td>
                          <td className="px-8 py-4 text-center">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${log.version > 1 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {log.version === 1 ? 'Original' : `${log.version}ª Via`}
                             </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <button 
                                onClick={() => handleGenerateSecondCopy(log.memberId)}
                                className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase ml-auto"
                             >
                                <RotateCcw size={14} /> Reemitir
                             </button>
                          </td>
                       </tr>
                    )) : (
                       <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic text-sm font-black uppercase">Vazio</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {showPrintPreview && createPortal(
        <div 
          id="idcard-portal-root" 
          className="fixed inset-0 bg-slate-950 flex flex-col z-[99999] no-print overflow-hidden pointer-events-auto"
        >
           <header className="p-6 border-b border-white/10 flex justify-between items-center text-white bg-slate-900 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg"><Printer size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Visualização Final</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{(printingBatch || []).length} carteirinha(s) pronta(s)</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowPrintPreview(false)} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs transition-all">Sair</button>
                 <button onClick={() => window.print()} className="px-12 py-3 bg-[#ADFF2F] text-slate-900 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Printer size={18} /> Confirmar e Imprimir</button>
              </div>
           </header>

           <div className="flex-1 overflow-y-auto p-12 bg-slate-900 flex justify-center scrollbar-hide">
              <div id="idcard-print-area" className="bg-white p-[1.5cm] min-h-[29.7cm] w-full max-w-[21cm] flex flex-col items-center shadow-2xl border border-gray-100">
                 <div className="grid grid-cols-1 gap-12 w-full">
                    {(printingBatch || []).map((member) => (
                       <div key={member?.id || Math.random()} className={`flex flex-col gap-10 items-center justify-center p-8 border-b-2 border-dashed border-gray-100 pb-12 last:border-b-0 w-full`}>
                          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
                             <div className="relative w-[8.56cm] h-[5.4cm] bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 shrink-0">
                                {cardEditorData.frontBg && <img src={cardEditorData.frontBg} className="absolute inset-0 w-full h-full object-cover" />}
                                {cardEditorData.logoStyle?.visible && (
                                  <div className="absolute" style={{ left: `${cardEditorData.logoStyle.x}%`, top: `${cardEditorData.logoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.logoStyle.size}px` }}>
                                     <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain" />
                                  </div>
                                )}
                                {cardEditorData.photoStyle?.visible && (
                                  <div className="absolute bg-gray-100 rounded-lg border-2 border-white shadow-sm flex items-center justify-center overflow-hidden" style={{ left: `${cardEditorData.photoStyle.x}%`, top: `${cardEditorData.photoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.photoStyle.size}px`, height: `${cardEditorData.photoStyle.size}px` }}>
                                     {member?.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users className="text-gray-200" size={(cardEditorData.photoStyle.size || 80) * 0.4} />}
                                  </div>
                                )}
                                {cardEditorData.nameStyle?.visible && (
                                  <div className="absolute whitespace-nowrap font-black uppercase text-center leading-none" style={{ left: `${cardEditorData.nameStyle.x}%`, top: `${cardEditorData.nameStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${cardEditorData.nameStyle.fontSize}px`, color: cardEditorData.nameStyle.color }}>{member?.name || '---'}</div>
                                )}
                                {cardEditorData.roleStyle?.visible && (
                                  <div className="absolute whitespace-nowrap font-bold uppercase text-center opacity-80" style={{ left: `${cardEditorData.roleStyle.x}%`, top: `${cardEditorData.roleStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${cardEditorData.roleStyle.fontSize}px`, color: cardEditorData.roleStyle.color }}>{getRoleName(member?.cargoId)}</div>
                                )}
                                {cardEditorData.idStyle?.visible && (
                                  <div className="absolute whitespace-nowrap font-mono font-black opacity-40" style={{ left: `${cardEditorData.idStyle.x}%`, top: `${cardEditorData.idStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${cardEditorData.idStyle.fontSize}px`, color: cardEditorData.idStyle.color }}>ID: #{(member?.id || '').toUpperCase()}</div>
                                )}
                             </div>
                             <div className="relative w-[8.56cm] h-[5.4cm] bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 shrink-0">
                                {cardEditorData.backBg && <img src={cardEditorData.backBg} className="absolute inset-0 w-full h-full object-cover" />}
                                {cardEditorData.cpfStyle?.visible && (
                                  <div className="absolute font-bold whitespace-nowrap" style={{ left: `${cardEditorData.cpfStyle.x}%`, top: `${cardEditorData.cpfStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${cardEditorData.cpfStyle.fontSize}px`, color: cardEditorData.cpfStyle.color }}>CPF: {member?.cpf || '---'}</div>
                                )}
                                {cardEditorData.qrCodeStyle?.visible && (
                                  <div className="absolute p-2 bg-white rounded-lg flex items-center justify-center" style={{ left: `${cardEditorData.qrCodeStyle.x}%`, top: `${cardEditorData.qrCodeStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${cardEditorData.qrCodeStyle.size}px`, height: `${cardEditorData.qrCodeStyle.size}px` }}>
                                     <Fingerprint size={(cardEditorData.qrCodeStyle.size || 40) * 0.7} className="text-gray-300" />
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};
