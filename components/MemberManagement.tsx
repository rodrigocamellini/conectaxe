
import React, { useState, useRef, useEffect } from 'react';
import { Member, SpiritualEntity, ModulePermission, SystemConfig, PaymentStatus } from '../types';
import { Plus, Search, Filter, Camera, Pencil, Trash2, Upload, CheckSquare, Square, Printer, X, UserCircle, FileText, Mail, MapPin, Phone, Contact, Calendar, Sparkles, Award, Minus, Info, GraduationCap, Briefcase, Baby, BookOpen, MessageSquare, DollarSign, Wallet, Check, Clock, Globe, ShieldCheck } from 'lucide-react';
import { format, differenceInYears, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
// Fix: Import BRAZILIAN_STATES from constants to avoid duplication and fix scope issues
import { DEFAULT_LOGO_URL, BRAZILIAN_STATES } from '../constants';

interface MemberManagementProps {
  members: Member[];
  entities: SpiritualEntity[];
  permissions: ModulePermission;
  config: SystemConfig;
  onAddMember: (member: Partial<Member>) => void;
  onUpdateMember: (id: string, member: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
}

const MARITAL_STATUS_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
];

const MONTHS_LIST = [
  { id: '01', name: 'Jan' }, { id: '02', name: 'Fev' }, { id: '03', name: 'Mar' },
  { id: '04', name: 'Abr' }, { id: '05', name: 'Mai' }, { id: '06', name: 'Jun' },
  { id: '07', name: 'Jul' }, { id: '08', name: 'Ago' }, { id: '09', name: 'Set' },
  { id: '10', name: 'Out' }, { id: '11', name: 'Nov' }, { id: '12', name: 'Dez' },
];

export const MemberManagement: React.FC<MemberManagementProps> = ({ 
  members, 
  entities,
  permissions,
  config,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMemberForView, setSelectedMemberForView] = useState<Member | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pessoal' | 'contato' | 'espiritual' | 'observacoes'>('pessoal');
  const [viewProfileTab, setViewProfileTab] = useState<'perfil' | 'financeiro'>('perfil');
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '', email: '', rg: '', cpf: '', phone: '', emergencyPhone: '',
    address: '', bairro: '', cidade: '', estado: 'SP', birthDate: '',
    status: 'ativo', paiCabecaId: '', maeCabecaId: '', guiaFrenteId: '',
    cargoId: '', photo: '', houseRoles: [], 
    nationality: 'Brasileira', birthPlace: '', maritalStatus: 'solteiro',
    spouseName: '', education: '', profession: '', hasChildren: false,
    childrenNames: [], isBaptized: false, baptismDate: '', baptismLocation: '',
    observations: '', isMedium: false, isCambone: false, isConsulente: false
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', rg: '', cpf: '', phone: '', emergencyPhone: '',
      address: '', bairro: '', cidade: '', estado: 'SP', birthDate: '', 
      status: 'ativo', paiCabecaId: '', maeCabecaId: '', guiaFrenteId: '', 
      cargoId: '', photo: '', houseRoles: [],
      nationality: 'Brasileira', birthPlace: '', maritalStatus: 'solteiro',
      spouseName: '', education: '', profession: '', hasChildren: false,
      childrenNames: [], isBaptized: false, baptismDate: '', baptismLocation: '',
      observations: '', isMedium: false, isCambone: false, isConsulente: false
    });
    setActiveTab('pessoal');
    setShowEditModal(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingId(member.id);
    setFormData({ 
      ...member,
      childrenNames: member.childrenNames || [],
      houseRoles: member.houseRoles || []
    });
    setActiveTab('pessoal');
    setShowEditModal(true);
  };

  const handleDelete = (member: Member) => {
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir permanentemente o membro "${member.name}"? Esta ação não pode ser desfeita.`)) {
      onDeleteMember(member.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateMember(editingId, formData);
    } else {
      onAddMember(formData);
    }
    setShowEditModal(false);
  };

  const toggleHouseRole = (roleId: string) => {
    setFormData(prev => {
      const current = prev.houseRoles || [];
      const isSelected = current.includes(roleId);
      let newRoles: string[];
      
      if (isSelected) {
        newRoles = current.filter(id => id !== roleId);
      } else {
        newRoles = [...current, roleId];
      }

      const allSelectedNames = entities
        .filter(e => newRoles.includes(e.id))
        .map(e => e.name.toLowerCase());

      return { 
        ...prev, 
        houseRoles: newRoles,
        isMedium: allSelectedNames.some(n => n.includes('médium')),
        isCambone: allSelectedNames.some(n => n.includes('cambone')),
        isConsulente: allSelectedNames.some(n => n.includes('consulente'))
      };
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    try {
      const d = new Date(birthDate);
      if (!isValid(d)) return 0;
      return differenceInYears(new Date(), d);
    } catch {
      return 0;
    }
  };

  const formatSafeDate = (dateStr: string | undefined, pattern: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (dateStr.length === 10) {
        const [y, m, day] = dateStr.split('-').map(Number);
        const adjusted = new Date(y, m - 1, day);
        if (isValid(adjusted)) return format(adjusted, pattern, { locale: ptBR });
      }
      if (!isValid(d)) return '---';
      return format(d, pattern, { locale: ptBR });
    } catch {
      return '---';
    }
  };

  const pais = entities.filter(e => e.type === 'pai_cabeca');
  const maes = entities.filter(e => e.type === 'mae_cabeca');
  const guias = entities.filter(e => e.type === 'guia_frente');
  const cargos = entities.filter(e => e.type === 'cargo');
  const funcoesCasa = entities.filter(e => e.type === 'funcao');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.cpf?.includes(searchQuery) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-1 max-w-md">
          <Search size={20} className="text-gray-400 ml-2" />
          <input 
            type="text" 
            placeholder="Filtrar por nome, CPF, ID ou e-mail..." 
            className="flex-1 outline-none text-sm" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {permissions.add && (
          <button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all">
            <Plus size={20} /> Novo Membro
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
              <tr>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Foto</th>
                <th className="px-6 py-4 font-bold">Membro</th>
                <th className="px-6 py-4 font-bold">Cargo</th>
                <th className="px-6 py-4 font-bold">Contato</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} onClick={() => setSelectedMemberForView(m)} className="hover:bg-indigo-50/40 transition-all group cursor-pointer">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">#{m.id}</td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {m.photo ? <img src={m.photo} className="w-full h-full object-cover" /> : <Camera size={16} className="text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{m.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">CPF: {m.cpf || '-'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    {entities.find(e => e.id === m.cargoId)?.name || 'N/D'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-700">{m.phone || '-'}</div>
                    <div className="text-[10px] text-gray-400">{m.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${m.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                       <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(m); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil size={18} /></button>
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(m); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-xl"><UserCircle size={24} /></div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{editingId ? `Editar Membro #${editingId}` : 'Novo Cadastro'}</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-2xl transition-colors">&times;</button>
            </div>

            <div className="bg-gray-50 border-b border-gray-100 flex px-6 overflow-x-auto scrollbar-hide">
              {[
                { id: 'pessoal', label: 'Dados Pessoais', icon: UserCircle },
                { id: 'contato', label: 'Contato e Endereço', icon: MapPin },
                { id: 'espiritual', label: 'Vida Espiritual', icon: Sparkles },
                { id: 'observacoes', label: 'Observações', icon: MessageSquare }
              ].map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>
              {activeTab === 'pessoal' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative shadow-inner">
                      {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <><Camera size={32} className="text-gray-400" /><span className="text-[10px] font-black uppercase">FOTO</span></>}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={24} className="text-white" /></div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <select className="w-full p-2.5 border border-gray-300 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-indigo-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="ativo">Ativo</option><option value="consulente">Consulente</option><option value="inativo">Inativo</option><option value="desligado">Desligado</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label><input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nascimento</label><input type="date" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">RG</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Civil</label><select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value as any})}>{MARITAL_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  </div>
                </div>
              )}

              {activeTab === 'contato' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label><input type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone Principal</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço Completo</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bairro</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 font-bold text-sm" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} /></div>
                </div>
              )}

              {activeTab === 'espiritual' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} /> Hierarquia e Coroação</h4>
                       <div className="grid grid-cols-1 gap-5">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Pai de Cabeça</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" value={formData.paiCabecaId} onChange={e => setFormData({...formData, paiCabecaId: e.target.value})}>
                              <option value="">---</option>
                              {pais.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mãe de Cabeça</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" value={formData.maeCabecaId} onChange={e => setFormData({...formData, maeCabecaId: e.target.value})}>
                              <option value="">---</option>
                              {maes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Guia de Frente</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" value={formData.guiaFrenteId} onChange={e => setFormData({...formData, guiaFrenteId: e.target.value})}>
                              <option value="">---</option>
                              {guias.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cargo na Casa</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" value={formData.cargoId} onChange={e => setFormData({...formData, cargoId: e.target.value})}>
                              <option value="">---</option>
                              {cargos.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2"><Award size={16} /> Funções Ativas</h4>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Marque as funções que este membro exerce na casa:</p>
                       <div className="grid grid-cols-2 gap-3">
                          {funcoesCasa.map(role => {
                            const isSelected = (formData.houseRoles || []).includes(role.id);
                            return (
                              <div key={role.id} onClick={() => toggleHouseRole(role.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${isSelected ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}>
                                 {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                                 <span className="text-[10px] font-black uppercase tracking-tight">{role.name}</span>
                              </div>
                            )
                          })}
                       </div>
                       <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                          <Info size={16} className="text-indigo-600 shrink-0" />
                          <p className="text-[10px] text-indigo-900 font-medium leading-relaxed">As funções marcadas definem as permissões e o valor da mensalidade no módulo financeiro.</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'observacoes' && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Anotações Internas</label>
                  <textarea rows={10} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 font-medium text-sm resize-none" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} placeholder="Histórico espiritual, evoluções, restrições médicas ou observações comportamentais..." />
                </div>
              )}

              <div className="pt-8 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-8 py-3.5 border border-gray-300 rounded-2xl hover:bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
                <button type="submit" className="px-12 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all">Salvar Ficha</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMemberForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="relative h-56 bg-indigo-900" style={{ backgroundColor: config.sidebarColor }}>
              <div className="absolute top-8 right-8 flex items-center gap-4 z-10">
                <button onClick={() => setShowPrintPreview(true)} className="p-4 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-all shadow-xl flex items-center gap-2 font-black text-sm uppercase"><Printer size={20} /> Imprimir</button>
                <button onClick={() => setSelectedMemberForView(null)} className="p-4 bg-black/20 hover:bg-black/40 text-white rounded-2xl transition-all backdrop-blur-md"><X size={20} /></button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute -bottom-16 left-16 flex items-end gap-8">
                <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white bg-gray-100 shadow-2xl overflow-hidden flex items-center justify-center">
                  {selectedMemberForView.photo ? <img src={selectedMemberForView.photo} className="w-full h-full object-cover" /> : <UserCircle size={60} className="text-gray-300" />}
                </div>
                <div className="mb-20">
                  <h3 className="text-4xl font-black text-white drop-shadow-xl">{selectedMemberForView.name}</h3>
                  <div className="flex gap-3 mt-3">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-black uppercase tracking-widest border border-white/10">ID #{selectedMemberForView.id}</span>
                    <span className={`px-4 py-1.5 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/20 ${selectedMemberForView.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{selectedMemberForView.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-16 pt-20 border-b border-gray-100 flex gap-8">
               <button onClick={() => setViewProfileTab('perfil')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-4 ${viewProfileTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Ficha Cadastral</button>
               {(selectedMemberForView.isMedium || selectedMemberForView.isCambone) && (
                 <button onClick={() => setViewProfileTab('financeiro')} className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-4 ${viewProfileTab === 'financeiro' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Histórico Financeiro</button>
               )}
            </div>

            <div className="p-16 overflow-y-auto max-h-[55vh] space-y-12" style={{ scrollbarWidth: 'thin' }}>
              {viewProfileTab === 'perfil' ? (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                       <div className="flex items-center gap-3 border-b border-gray-100 pb-4"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Calendar size={20} /></div><h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">Informações Pessoais</h4></div>
                       <div className="grid grid-cols-2 gap-8">
                          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Nascimento</p><p className="font-bold text-gray-800">{formatSafeDate(selectedMemberForView.birthDate, "dd/MM/yyyy")} <span className="text-indigo-500">({calculateAge(selectedMemberForView.birthDate)} anos)</span></p></div>
                          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Profissão</p><p className="font-bold text-gray-800">{selectedMemberForView.profession || '---'}</p></div>
                          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">CPF</p><p className="font-bold text-gray-800">{selectedMemberForView.cpf || '---'}</p></div>
                          <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Endereço</p><p className="font-bold text-gray-800">{selectedMemberForView.address || '---'}</p></div>
                       </div>
                    </div>
                    <div className="bg-indigo-900 rounded-[2rem] p-8 text-white space-y-4 shadow-xl">
                       <p className="text-xs font-black uppercase text-white/50 tracking-widest text-center border-b border-white/10 pb-4">Funções Espirituais</p>
                       <div className="flex flex-wrap gap-2 justify-center">
                          {(selectedMemberForView.houseRoles || []).map(roleId => <span key={roleId} className="px-3 py-1.5 bg-[#ADFF2F] text-slate-900 rounded-xl text-[9px] font-black uppercase">{entities.find(e => e.id === roleId)?.name}</span>)}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><Wallet size={24} /></div>
                         <div>
                            <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">Registro de Mensalidades</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Acompanhamento de contribuições do membro</p>
                         </div>
                      </div>
                      <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                         <button onClick={() => setFinanceYear(prev => prev - 1)} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400"><Minus size={16} /></button>
                         <span className="px-4 font-black text-indigo-600">{financeYear}</span>
                         <button onClick={() => setFinanceYear(prev => prev + 1)} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400"><Plus size={16} /></button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {MONTHS_LIST.map(m => {
                         const key = `${financeYear}-${m.id}`;
                         const status = selectedMemberForView.monthlyPayments?.[key] || 'unpaid';
                         return (
                            <div key={m.id} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${
                               status === 'paid' ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-100' :
                               status === 'justified' ? 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-100' :
                               'bg-white border-gray-100 grayscale opacity-50'
                            }`}>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.name}</span>
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                                 status === 'paid' ? 'bg-emerald-500' : status === 'justified' ? 'bg-amber-500' : 'bg-gray-200'
                               }`}>
                                  {status === 'paid' ? <Check size={24} strokeWidth={4} /> : status === 'justified' ? <Clock size={24} strokeWidth={4} /> : <DollarSign size={20} />}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedMemberForView(null)} className="px-12 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 shadow-sm hover:bg-gray-100 transition-all">Fechar Ficha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
