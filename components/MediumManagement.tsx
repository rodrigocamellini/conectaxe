
import React, { useState } from 'react';
import { Member, SpiritualEntity, SystemConfig } from '../types';
import { Search, Camera, Sparkles, X, CheckSquare, Square, Info, Pencil, UserCircle, LayoutGrid, Printer, FileText } from 'lucide-react';

interface MediumManagementProps {
  members: Member[];
  entities: SpiritualEntity[];
  config: SystemConfig;
  onUpdateMemberSpiritualInfo: (memberId: string, entityIds: string[], entityNames: Record<string, string>) => void;
}

const ENTITY_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z'/%3E%3Cpath d='M12 6a3 3 0 1 0 3 3 3 3 0 0 0-3-3z'/%3E%3Cpath d='M6 19a6 6 0 0 1 12 0'/%3E%3C/svg%3E";

export const MediumManagement: React.FC<MediumManagementProps> = ({ 
  members, 
  entities, 
  config,
  onUpdateMemberSpiritualInfo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediumForEdit, setSelectedMediumForEdit] = useState<Member | null>(null);
  const [selectedMediumForView, setSelectedMediumForView] = useState<Member | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const mediums = members.filter(m => m.isMedium && m.status !== 'desligado');
  
  const filteredMediums = mediums.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.id.includes(searchQuery)
  );

  const entitiesList = entities.filter(e => e.type === 'entidade');

  const handleToggleEntity = (entityId: string) => {
    if (!selectedMediumForEdit) return;
    
    const currentEntities = selectedMediumForEdit.assignedEntities || [];
    const currentNames = { ...(selectedMediumForEdit.entityNames || {}) };
    let newEntities: string[];
    
    if (currentEntities.includes(entityId)) {
      newEntities = currentEntities.filter(id => id !== entityId);
      delete currentNames[entityId];
    } else {
      newEntities = [...currentEntities, entityId];
    }
    
    const updatedMedium = { 
      ...selectedMediumForEdit, 
      assignedEntities: newEntities,
      entityNames: currentNames
    };
    setSelectedMediumForEdit(updatedMedium);
    onUpdateMemberSpiritualInfo(selectedMediumForEdit.id, newEntities, currentNames);
  };

  const handleUpdateSpecificName = (entityId: string, name: string) => {
    if (!selectedMediumForEdit) return;
    
    const currentNames = { ...(selectedMediumForEdit.entityNames || {}) };
    currentNames[entityId] = name;
    
    const updatedMedium = { ...selectedMediumForEdit, entityNames: currentNames };
    setSelectedMediumForEdit(updatedMedium);
    onUpdateMemberSpiritualInfo(selectedMediumForEdit.id, selectedMediumForEdit.assignedEntities || [], currentNames);
  };

  const handlePrint = () => {
    window.print();
  };

  const openPrintPreview = (m: Member) => {
    setSelectedMediumForView(m);
    setShowPrintPreview(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0;
            margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar médium por nome ou ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all text-sm font-medium"
              style={{ '--tw-ring-color': config.primaryColor } as any}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <div className="flex items-center gap-1.5"><Info size={14} className="text-indigo-500" /> Clique na linha para visualizar e imprimir</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Médium</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pai/Mãe de Cabeça</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qtd Entidades</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMediums.length > 0 ? (
                filteredMediums.map((m) => (
                  <tr 
                    key={m.id} 
                    onClick={() => setSelectedMediumForView(m)}
                    className="hover:bg-indigo-50/20 transition-all group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 text-sm">#{m.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                           <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                           <p className="text-[10px] font-black uppercase text-indigo-400 tracking-tighter">Médium Atuante</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs space-y-0.5">
                          <p className="font-bold text-gray-600">
                            {entities.find(e => e.id === m.paiCabecaId)?.name || <span className="text-gray-300 italic">Não informado</span>}
                          </p>
                          <p className="font-bold text-gray-600">
                            {entities.find(e => e.id === m.maeCabecaId)?.name || <span className="text-gray-300 italic">Não informado</span>}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                          <Sparkles size={12} />
                          <span className="text-[10px] font-black">{(m.assignedEntities || []).length}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                         m.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                       }`}>
                         {m.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediumForEdit(m);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all active:scale-90"
                        title="Gerenciar Entidades"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">
                    Nenhum médium encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de VISUALIZAÇÃO (Perfil Espiritual) */}
      {selectedMediumForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="relative h-48 bg-indigo-900" style={{ backgroundColor: config.sidebarColor }}>
              <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                <button 
                  onClick={() => setShowPrintPreview(true)}
                  className="p-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-full transition-all shadow-lg flex items-center gap-2"
                  title="Imprimir Ficha Espiritual"
                >
                  <Printer size={20} />
                </button>
                <button 
                  onClick={() => setSelectedMediumForView(null)}
                  className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute -bottom-12 left-12 flex items-end gap-6">
                <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-100 shadow-2xl overflow-hidden flex items-center justify-center">
                  {selectedMediumForView.photo ? (
                    <img src={selectedMediumForView.photo} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-gray-300" />
                  )}
                </div>
                <div className="mb-14">
                  <h3 className="text-3xl font-black text-white drop-shadow-lg">{selectedMediumForView.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      ID #{selectedMediumForView.id}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      {selectedMediumForView.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20 p-12 overflow-y-auto max-h-[60vh]" style={{ scrollbarWidth: 'thin' }}>
              <div className="mb-10 flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight">Trabalho Espiritual</h4>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {(selectedMediumForView.assignedEntities || []).length} Entidades Ativas
                </div>
              </div>

              {(selectedMediumForView.assignedEntities || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedMediumForView.assignedEntities?.map(entityId => {
                    const category = entities.find(e => e.id === entityId);
                    const specificName = (selectedMediumForView.entityNames || {})[entityId] || 'Nome não definido';
                    const displayImage = category?.imageUrl || ENTITY_PLACEHOLDER;
                    
                    return (
                      <div key={entityId} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                        <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center shadow-inner border border-gray-50 overflow-hidden group-hover:scale-110 transition-transform">
                          <img 
                            src={displayImage} 
                            className={`w-full h-full object-cover ${category?.imageUrl ? 'opacity-100' : 'opacity-60 p-4'} group-hover:opacity-100 transition-opacity`} 
                            alt={category?.name} 
                          />
                        </div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{category?.name || 'Entidade'}</p>
                        <h5 className="text-lg font-black text-gray-800 leading-tight">
                          {specificName}
                        </h5>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                   <LayoutGrid size={48} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhuma entidade vinculada a este perfil</p>
                </div>
              )}

              {/* Informações Complementares com IMAGENS */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Pai de Cabeça', id: selectedMediumForView.paiCabecaId, color: 'indigo' },
                  { label: 'Mãe de Cabeça', id: selectedMediumForView.maeCabecaId, color: 'pink' },
                  { label: 'Guia de Frente', id: selectedMediumForView.guiaFrenteId, color: 'emerald' }
                ].map((item, idx) => {
                  const ent = entities.find(e => e.id === item.id);
                  const colors = {
                    indigo: { bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-400' },
                    pink: { bg: 'bg-pink-50/50', border: 'border-pink-100', text: 'text-pink-400' },
                    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-400' }
                  }[item.color as keyof typeof colors];

                  return (
                    <div key={idx} className={`${colors.bg} rounded-3xl p-5 border ${colors.border} flex items-center gap-4`}>
                      <div className="w-12 h-12 rounded-2xl bg-white border border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        {ent?.imageUrl ? (
                          <img src={ent.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="text-gray-200" size={24} />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-[10px] font-black uppercase ${colors.text} mb-1`}>{item.label}</p>
                        <p className="font-black text-gray-700 truncate text-sm">{ent?.name || '---'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedMediumForView(null)}
                className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 shadow-sm transition-all hover:bg-gray-100 active:scale-95"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PREVIA DE IMPRESSÃO INDIVIDUAL */}
      {showPrintPreview && selectedMediumForView && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-10 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col my-auto no-print">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                    <FileText size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-gray-800">Prévia da Ficha Espiritual Individual</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Documento oficial de assentamento</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowPrintPreview(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Printer size={18} /> Confirmar Impressão
                </button>
              </div>
            </div>

            <div className="p-10 overflow-y-auto bg-gray-200/50 flex justify-center">
              {/* ÁREA QUE SERÁ IMPRESSA */}
              <div id="print-area" className="bg-white w-full p-[1.5cm] min-h-[29.7cm] flex flex-col font-serif text-black border shadow-inner">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-8">
                  <div className="flex items-center gap-6">
                     {config.logoUrl && <img src={config.logoUrl} className="w-20 h-20 object-contain" />}
                     <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{config.systemName}</h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Ficha de Identificação Espiritual</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase mb-1">Registro Gerado em:</p>
                     <p className="text-xs font-bold">{new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}</p>
                  </div>
                </div>

                {/* Perfil do Médium */}
                <div className="flex gap-10 items-center bg-gray-50 p-6 rounded-3xl mb-10 border border-gray-200">
                   <div className="w-40 h-40 rounded-3xl border-2 border-black/10 overflow-hidden flex items-center justify-center bg-white shadow-sm shrink-0">
                      {selectedMediumForView.photo ? (
                        <img src={selectedMediumForView.photo} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={60} className="text-gray-200" />
                      )}
                   </div>
                   <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-3xl font-black uppercase leading-tight">{selectedMediumForView.name}</h2>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs font-black uppercase bg-white px-3 py-1 border border-black/10 rounded-full">ID #{selectedMediumForView.id}</span>
                          <span className="text-xs font-black uppercase bg-black text-white px-3 py-1 rounded-full">{selectedMediumForView.status}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase">
                        <div>
                          <p className="text-[9px] text-gray-400 mb-0.5">E-mail</p>
                          <p>{selectedMediumForView.email || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 mb-0.5">Membro desde</p>
                          <p>{new Date(selectedMediumForView.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Coroação / Pais de Cabeça */}
                <div className="mb-10">
                   <h3 className="text-sm font-black uppercase tracking-widest border-b border-black mb-6 pb-2">Hierarquia Espiritual (Coroação)</h3>
                   <div className="grid grid-cols-3 gap-8">
                     {[
                        { label: 'Pai de Cabeça', id: selectedMediumForView.paiCabecaId },
                        { label: 'Mãe de Cabeça', id: selectedMediumForView.maeCabecaId },
                        { label: 'Guia de Frente', id: selectedMediumForView.guiaFrenteId }
                     ].map((item, idx) => {
                        const ent = entities.find(e => e.id === item.id);
                        return (
                          <div key={idx} className="flex flex-col items-center text-center p-4 border border-gray-100 rounded-3xl bg-gray-50/30">
                            <div className="w-20 h-20 rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden mb-3 flex items-center justify-center">
                               {ent?.imageUrl ? (
                                 <img src={ent.imageUrl} className="w-full h-full object-cover" />
                               ) : (
                                 <UserCircle className="text-gray-100" size={32} />
                               )}
                            </div>
                            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{item.label}</p>
                            <p className="text-sm font-black uppercase">{ent?.name || '---'}</p>
                          </div>
                        )
                     })}
                   </div>
                </div>

                {/* Entidades de Trabalho */}
                <div className="flex-1">
                   <h3 className="text-sm font-black uppercase tracking-widest border-b border-black mb-6 pb-2">Corpo de Entidades (Trabalho Ativo)</h3>
                   <div className="grid grid-cols-3 gap-6">
                      {(selectedMediumForView.assignedEntities || []).map(entityId => {
                        const category = entities.find(e => e.id === entityId);
                        const specificName = (selectedMediumForView.entityNames || {})[entityId] || 'Não definido';
                        return (
                          <div key={entityId} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                             <div className="w-14 h-14 rounded-full bg-white border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                                {category?.imageUrl ? (
                                  <img src={category.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <Sparkles size={20} className="text-gray-200" />
                                )}
                             </div>
                             <div className="overflow-hidden">
                                <p className="text-[9px] font-black uppercase text-gray-400">{category?.name || 'Entidade'}</p>
                                <p className="text-xs font-black uppercase truncate">{specificName}</p>
                             </div>
                          </div>
                        )
                      })}
                      {(selectedMediumForView.assignedEntities || []).length === 0 && (
                        <p className="col-span-3 text-center py-10 text-xs italic text-gray-400">Nenhuma entidade de trabalho registrada no assentamento.</p>
                      )}
                   </div>
                </div>

                {/* Rodapé e Autenticação */}
                <div className="mt-auto pt-10 border-t border-black/10">
                   <div className="grid grid-cols-2 gap-20">
                      <div className="text-center pt-8 border-t border-black/20">
                         <p className="text-[10px] font-bold uppercase mb-1">Médium / Responsável</p>
                         <p className="text-[10px] text-gray-500 italic">Assinatura do Médium</p>
                      </div>
                      <div className="text-center pt-8 border-t border-black/20">
                         <p className="text-[10px] font-bold uppercase mb-1">Diretoria Espiritual</p>
                         <p className="text-[10px] text-gray-500 italic">Visto da Casa</p>
                      </div>
                   </div>
                   <div className="text-center mt-12 opacity-50 italic text-[9px]">
                      <p>Este documento é para uso interno e religioso. Informações protegidas pelo estatuto da casa.</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl text-center">
              <p className="text-xs text-gray-400 font-bold uppercase flex items-center justify-center gap-2">
                 <Info size={14} className="text-indigo-400" />
                 A ficha individual inclui todas as imagens padrão cadastradas no sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de EDIÇÃO (Inalterado) */}
      {selectedMediumForEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 text-white flex justify-between items-center" style={{ backgroundColor: config.primaryColor }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30">
                  {selectedMediumForEdit.photo ? <img src={selectedMediumForEdit.photo} className="w-full h-full object-cover" /> : <Camera size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-black">{selectedMediumForEdit.name}</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Gerenciar Entidades de Trabalho</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMediumForEdit(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                 <Sparkles className="text-indigo-600 mt-1 shrink-0" size={20} />
                 <div>
                    <p className="text-sm font-bold text-indigo-900">Configuração de Trabalho Espiritual</p>
                    <p className="text-xs text-indigo-600 font-medium">Marque as categorias e registre o nome de cada entidade de trabalho.</p>
                 </div>
              </div>

              {entitiesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {entitiesList.map(entity => {
                     const isSelected = (selectedMediumForEdit.assignedEntities || []).includes(entity.id);
                     const specificName = (selectedMediumForEdit.entityNames || {})[entity.id] || '';
                     
                     return (
                       <div key={entity.id} className="flex flex-col gap-2">
                         <div 
                          onClick={() => handleToggleEntity(entity.id)}
                          className={`
                            p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group
                            ${isSelected 
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm' 
                              : 'bg-white border-gray-100 hover:border-gray-200 text-gray-500'
                            }
                          `}
                         >
                           <span className="font-bold text-sm uppercase tracking-tight">{entity.name}</span>
                           <div className={`transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-200 group-hover:text-gray-300'}`}>
                              {isSelected ? <CheckSquare size={22} strokeWidth={2.5} /> : <Square size={22} strokeWidth={2} />}
                           </div>
                         </div>
                         
                         {isSelected && (
                           <div className="px-2 animate-in slide-in-from-top-2 duration-300">
                             <div className="relative group">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                                 <UserCircle size={16} />
                               </div>
                               <input 
                                 type="text"
                                 placeholder={`Nome do(a) ${entity.name}...`}
                                 className="w-full pl-9 pr-4 py-2 bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs font-bold text-indigo-900 placeholder:text-indigo-300 placeholder:font-medium"
                                 value={specificName}
                                 onChange={(e) => handleUpdateSpecificName(entity.id, e.target.value)}
                               />
                             </div>
                           </div>
                         )}
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 space-y-3">
                   <Info size={40} className="mx-auto opacity-20" />
                   <p className="font-bold">Nenhuma entidade cadastrada nas configurações.</p>
                   <p className="text-xs">Vá em "Config. Espirituais" &gt; "Entidades" para cadastrar.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedMediumForEdit(null)}
                className="px-8 py-3 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 shadow-sm transition-all active:scale-95 hover:bg-gray-100"
              >
                Concluir Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
