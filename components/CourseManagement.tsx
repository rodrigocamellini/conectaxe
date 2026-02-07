
import React, { useState, useRef, useEffect } from 'react';
import { Course, Lesson, Member, Enrollment, SystemConfig, CertificateConfig, ElementStyle } from '../types';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Video, 
  FileText, 
  Type, 
  X, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Star,
  Camera,
  Search,
  BookOpen,
  Award,
  Upload,
  Image as ImageIcon,
  Check,
  Eye,
  Printer,
  FileBadge,
  DownloadCloud,
  Type as TypeIcon,
  Save,
  Layers,
  Move,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DEFAULT_LOGO_URL, DEFAULT_SYSTEM_CONFIG } from '../constants';

interface CourseManagementProps {
  courses: Course[];
  members: Member[];
  enrollments: Enrollment[];
  config: SystemConfig;
  onAddCourse: (course: Partial<Course>) => void;
  onUpdateCourse: (id: string, course: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onUpdateConfig?: (config: SystemConfig) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  members,
  enrollments,
  config,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onUpdateConfig
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'completions' | 'certificates'>('list');
  const [previewCert, setPreviewCert] = useState<{ course?: Course, isDefault: boolean } | null>(null);
  const [showBlueprintOverlay, setShowBlueprintOverlay] = useState(false);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  
  // Define qual fundo exibir no editor visual (Global ou de um curso específico)
  const [editorBackgroundSource, setEditorBackgroundSource] = useState<'global' | string>('global');
  
  const previewRef = useRef<HTMLDivElement>(null);

  const [certEditorData, setCertEditorData] = useState<CertificateConfig>(
    config.certificateConfig || DEFAULT_SYSTEM_CONFIG.certificateConfig!
  );

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    thumbnail: '',
    rating: 5,
    audience: { medium: true, cambone: true, consulente: true },
    lessons: []
  });

  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    type: 'video',
    content: '',
    duration: ''
  });

  // Resolve qual imagem de fundo deve ser mostrada no editor
  const currentEditorBg = editorBackgroundSource === 'global' 
    ? config.defaultCertificateTemplate 
    : courses.find(c => c.id === editorBackgroundSource)?.certificateTemplate || config.defaultCertificateTemplate;

  const handleSaveCertTexts = () => {
    if (onUpdateConfig) {
      onUpdateConfig({ ...config, certificateConfig: certEditorData });
      alert("Configurações visuais do certificado salvas com sucesso!");
    }
  };

  const handleMouseDown = (elementKey: string) => {
    setDraggingElement(elementKey);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setCertEditorData(prev => {
      const newData = { ...prev };
      if (draggingElement === 'logo') {
        newData.logoStyle = { ...prev.logoStyle, x: clampedX, y: clampedY };
      } else {
        const styleKey = `${draggingElement}Style` as keyof CertificateConfig;
        (newData[styleKey] as ElementStyle) = { ...(prev[styleKey] as ElementStyle), x: clampedX, y: clampedY };
      }
      return newData;
    });
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  useEffect(() => {
    if (draggingElement) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingElement]);

  const downloadBlueprint = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 848;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Se houver um fundo, desenha ele, senão fundo branco
    if (currentEditorBg) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawMarkers();
        finishDownload();
      };
      img.src = currentEditorBg;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawMarkers();
      finishDownload();
    }

    function drawMarkers() {
      const drawBox = (xPercent: number, yPercent: number, label: string, color: string) => {
        const x = (xPercent / 100) * canvas.width;
        const y = (yPercent / 100) * canvas.height;
        ctx.fillStyle = color + '40';
        ctx.fillRect(x - 150, y - 30, 300, 60);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 150, y - 30, 300, 60);
        ctx.fillStyle = color;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 6);
      };

      drawBox(certEditorData.logoStyle.x, certEditorData.logoStyle.y, "ÁREA DO LOGO", "#6366f1");
      drawBox(certEditorData.headerStyle.x, certEditorData.headerStyle.y, "TÍTULO: " + certEditorData.headerTitle, "#4f46e5");
      drawBox(certEditorData.studentStyle.x, certEditorData.studentStyle.y, "NOME DO ALUNO", "#ef4444");
      drawBox(certEditorData.courseStyle.x, certEditorData.courseStyle.y, "TÍTULO DO CURSO", "#10b981");
      drawBox(certEditorData.sigLeftStyle.x, certEditorData.sigLeftStyle.y, "ASSINATURA ESQ.", "#f59e0b");
      drawBox(certEditorData.sigRightStyle.x, certEditorData.sigRightStyle.y, "ASSINATURA DIR.", "#f59e0b");
    }

    function finishDownload() {
      const link = document.createElement('a');
      link.download = 'GABARITO_FINAL_AJUSTADO.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleAddLesson = () => {
    if (!newLesson.title || !newLesson.content) return;
    const lesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: newLesson.title,
      type: newLesson.type as any,
      content: newLesson.content,
      duration: newLesson.duration
    };
    setFormData(prev => ({
      ...prev,
      lessons: [...(prev.lessons || []), lesson]
    }));
    setNewLesson({ title: '', type: 'video', content: '', duration: '' });
  };

  const removeLesson = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lessons: (prev.lessons || []).filter(l => l.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateCourse(editingId, formData);
    } else {
      onAddCourse({ ...formData, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '', description: '', thumbnail: '', rating: 5,
      audience: { medium: true, cambone: true, consulente: true },
      lessons: []
    });
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData(course);
    setShowModal(true);
  };

  const handleCertificateUpload = (courseId: string | 'default', file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (courseId === 'default') {
        if (onUpdateConfig) {
          onUpdateConfig({ ...config, defaultCertificateTemplate: base64 });
        }
      } else {
        onUpdateCourse(courseId, { certificateTemplate: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const completions = enrollments.filter(e => e.completedAt);

  const StyleControl = ({ label, styleKey, textKey }: { label: string, styleKey: keyof CertificateConfig, textKey?: keyof CertificateConfig }) => {
    const style = certEditorData[styleKey] as ElementStyle;
    return (
      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
           <input 
             type="color" 
             className="w-5 h-5 rounded-full cursor-pointer border-none p-0 bg-transparent"
             value={style.color}
             onChange={e => setCertEditorData(prev => ({
               ...prev, [styleKey]: { ...style, color: e.target.value }
             }))}
           />
        </div>
        
        {textKey && (
          <input 
            className="w-full p-2 bg-white border border-gray-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-300"
            value={certEditorData[textKey] as string}
            onChange={e => setCertEditorData(prev => ({ ...prev, [textKey]: e.target.value }))}
          />
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase">
             <span>Tam.</span>
             <span>{style.fontSize}px</span>
          </div>
          <input 
            type="range" min="8" max="150" 
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={style.fontSize}
            onChange={e => setCertEditorData(prev => ({
              ...prev, [styleKey]: { ...style, fontSize: Number(e.target.value) }
            }))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
          <button onClick={() => setActiveView('list')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeView === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Lista de Cursos</button>
          <button onClick={() => setActiveView('completions')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeView === 'completions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Conclusões</button>
          <button onClick={() => setActiveView('certificates')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeView === 'certificates' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Certificados</button>
        </div>

        {activeView === 'list' && (
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"><Plus size={18} /> Novo Curso</button>
        )}
      </div>

      {activeView === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col h-full">
              <div className="aspect-video relative overflow-hidden bg-gray-50 shrink-0">
                {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><BookOpen size={40} className="opacity-20 mb-2" /><span className="text-[10px] font-black uppercase">Sem Capa</span></div>}
                <div className="absolute bottom-4 left-4 flex gap-2"><div onClick={() => setPreviewCert({ course, isDefault: false })} className={`p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center gap-2 ${course.certificateTemplate ? 'bg-emerald-500/80 text-white' : 'bg-indigo-600/80 text-white'}`}><Award size={14} /><span className="text-[8px] font-black uppercase tracking-tighter">{course.certificateTemplate ? 'Certificado Próprio' : 'Certificado Padrão'}</span></div></div>
                <div className="absolute top-4 right-4 flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < course.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-3">
                  {course.audience.medium && <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-black uppercase rounded">Médiuns</span>}
                  {course.audience.cambone && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded">Cambones</span>}
                  {course.audience.consulente && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded">Consulentes</span>}
                </div>
                <h4 className="text-lg font-black text-gray-800 uppercase mb-2 line-clamp-1">{course.title}</h4>
                <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-6 flex-1">{course.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50"><span className="text-[10px] font-black text-gray-400 uppercase">{course.lessons.length} Aulas</span><div className="flex gap-2"><button onClick={() => handleEdit(course)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-xl transition-all"><Pencil size={18} /></button><button onClick={() => onDeleteCourse(course.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button></div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'certificates' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
             
             {/* Painel de Estilos Compacto (5 Colunas na grade XL) */}
             <div className="xl:col-span-5 space-y-4">
                <div className="p-6 bg-indigo-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl"><Palette size={20} /></div>
                      <h4 className="text-sm font-black uppercase tracking-widest">Painel de Design</h4>
                   </div>
                   <button onClick={handleSaveCertTexts} className="px-6 py-2 bg-[#ADFF2F] text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2"><Save size={16} /> Salvar Tudo</button>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                   {/* Seletor de Fundo do Preview */}
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Fundo para Visualização</label>
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-xs text-gray-600 appearance-none"
                        value={editorBackgroundSource}
                        onChange={e => setEditorBackgroundSource(e.target.value)}
                      >
                         <option value="global">🎨 Template Padrão (Global)</option>
                         <optgroup label="Templates por Curso">
                            {courses.filter(c => c.certificateTemplate).map(c => (
                              <option key={c.id} value={c.id}>📘 {c.title}</option>
                            ))}
                         </optgroup>
                      </select>
                   </div>

                   {/* Grade 2 Colunas de Controles */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Tamanho da Logomarca</span>
                        <input type="range" min="30" max="300" className="w-full h-1 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={certEditorData.logoStyle.size} onChange={e => setCertEditorData(prev => ({ ...prev, logoStyle: { ...prev.logoStyle, size: Number(e.target.value) } }))} />
                      </div>

                      <StyleControl label="Cabeçalho / Título" styleKey="headerStyle" textKey="headerTitle" />
                      <StyleControl label="Texto Introdução" styleKey="introStyle" textKey="introText" />
                      <StyleControl label="Nome do Aluno" styleKey="studentStyle" />
                      <StyleControl label="Texto Conclusão" styleKey="conclusionStyle" textKey="conclusionText" />
                      <StyleControl label="Título do Curso" styleKey="courseStyle" />
                      <StyleControl label="Assinatura Esquerda" styleKey="sigLeftStyle" textKey="signatureLeftLabel" />
                      <StyleControl label="Assinatura Direita" styleKey="sigRightStyle" textKey="signatureRightLabel" />
                   </div>
                </div>
             </div>

             {/* LIVE EDITOR VISUAL (7 Colunas na grade XL) */}
             <div className="xl:col-span-7 space-y-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden h-full flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><Move size={18} /></div>
                         <div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Preview Interativo</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Clique e arraste os elementos abaixo</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => setShowBlueprintOverlay(!showBlueprintOverlay)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${showBlueprintOverlay ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-transparent text-gray-400 border-gray-100 hover:bg-gray-50'}`}>{showBlueprintOverlay ? 'Ocultar Grid' : 'Mostrar Grid'}</button>
                         <button onClick={downloadBlueprint} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-gray-50 shadow-sm"><DownloadCloud size={14} /> Baixar Blueprint</button>
                      </div>
                   </div>

                   <div 
                     ref={previewRef}
                     onMouseMove={handleMouseMove}
                     className="relative w-full aspect-[1.414/1] bg-white border-2 border-gray-100 shadow-2xl overflow-hidden rounded-2xl cursor-crosshair select-none flex-1"
                   >
                      {currentEditorBg && <img src={currentEditorBg} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" />}

                      {showBlueprintOverlay && <div className="absolute inset-0 z-10 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '25px 25px' }} />}

                      {/* Elementos Arrastáveis */}
                      <div onMouseDown={() => handleMouseDown('logo')} className={`absolute z-30 cursor-move group ${draggingElement === 'logo' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.logoStyle.x}%`, top: `${certEditorData.logoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${certEditorData.logoStyle.size}px` }}>
                         <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('header')} className={`absolute z-30 cursor-move group whitespace-nowrap text-center ${draggingElement === 'header' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.headerStyle.x}%`, top: `${certEditorData.headerStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.headerStyle.fontSize * 0.08}vw`, color: certEditorData.headerStyle.color, fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.1em' }}>
                         {certEditorData.headerTitle}
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('intro')} className={`absolute z-30 cursor-move group whitespace-nowrap text-center ${draggingElement === 'intro' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.introStyle.x}%`, top: `${certEditorData.introStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.introStyle.fontSize * 0.08}vw`, color: certEditorData.introStyle.color, fontStyle: 'italic' }}>
                         {certEditorData.introText}
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('student')} className={`absolute z-30 cursor-move group whitespace-nowrap text-center ${draggingElement === 'student' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.studentStyle.x}%`, top: `${certEditorData.studentStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.studentStyle.fontSize * 0.08}vw`, color: certEditorData.studentStyle.color, fontWeight: 900, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                         NOME DO ALUNO (MODELO)
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('conclusion')} className={`absolute z-30 cursor-move group text-center ${draggingElement === 'conclusion' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.conclusionStyle.x}%`, top: `${certEditorData.conclusionStyle.y}%`, transform: 'translate(-50%, -50%)', width: '70%', fontSize: `${certEditorData.conclusionStyle.fontSize * 0.08}vw`, color: certEditorData.conclusionStyle.color, fontStyle: 'italic', lineHeight: 1 }}>
                         {certEditorData.conclusionText}
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('course')} className={`absolute z-30 cursor-move group whitespace-nowrap text-center ${draggingElement === 'course' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.courseStyle.x}%`, top: `${certEditorData.courseStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.courseStyle.fontSize * 0.08}vw`, color: certEditorData.courseStyle.color, fontWeight: 900, textTransform: 'uppercase' }}>
                         TÍTULO DO CURSO EXIBIDO AQUI
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('sigLeft')} className={`absolute z-30 cursor-move group text-center border-t border-gray-300 pt-1 ${draggingElement === 'sigLeft' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.sigLeftStyle.x}%`, top: `${certEditorData.sigLeftStyle.y}%`, transform: 'translate(-50%, -50%)', width: '20%', fontSize: `${certEditorData.sigLeftStyle.fontSize * 0.08}vw`, color: certEditorData.sigLeftStyle.color, borderColor: certEditorData.sigLeftStyle.color }}>
                         <p className="font-black uppercase">{config.systemName}</p>
                         <p className="opacity-60 text-[0.8em]">{certEditorData.signatureLeftLabel}</p>
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>

                      <div onMouseDown={() => handleMouseDown('sigRight')} className={`absolute z-30 cursor-move group text-center border-t border-gray-300 pt-1 ${draggingElement === 'sigRight' ? 'ring-2 ring-indigo-500' : ''}`} style={{ left: `${certEditorData.sigRightStyle.x}%`, top: `${certEditorData.sigRightStyle.y}%`, transform: 'translate(-50%, -50%)', width: '20%', fontSize: `${certEditorData.sigRightStyle.fontSize * 0.08}vw`, color: certEditorData.sigRightStyle.color, borderColor: certEditorData.sigRightStyle.color }}>
                         <p className="font-black uppercase">{format(new Date(), 'dd/MM/yyyy')}</p>
                         <p className="opacity-60 text-[0.8em]">{certEditorData.signatureRightLabel}</p>
                         <div className="absolute -inset-2 border-2 border-dashed border-indigo-400 opacity-0 group-hover:opacity-100 rounded-lg" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* LISTAGEM DE LAYOUTS DE FUNDO */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center gap-3">
                  <Award size={20} className="text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Imagens de Fundo (Templates)</h4>
               </div>
            </div>

            <div className="p-6 border-b border-gray-100 bg-indigo-50/10">
               <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-40 h-28 rounded-2xl bg-white border-2 border-dashed border-indigo-900 overflow-hidden relative shadow-md shrink-0">
                    {config.defaultCertificateTemplate ? <img src={config.defaultCertificateTemplate} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full opacity-20"><ImageIcon size={30} /></div>}
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-indigo-600 text-white rounded text-[7px] font-black uppercase">PADRÃO</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-800 uppercase text-xs">Layout Global</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-tight mt-1">Este fundo será usado por todos os cursos que não tiverem uma arte exclusiva enviada abaixo.</p>
                    <div className="mt-3 flex gap-2">
                        <label className="cursor-pointer px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2">
                          <Upload size={12} /> Trocar Fundo Global
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleCertificateUpload('default', e.target.files?.[0] || null)} />
                        </label>
                        {config.defaultCertificateTemplate && <button onClick={() => onUpdateConfig?.({ ...config, defaultCertificateTemplate: undefined })} className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-100">Remover</button>}
                    </div>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Curso Vinculado</th>
                    <th className="px-8 py-4">Arte Exclusiva</th>
                    <th className="px-8 py-4 text-right">Upload de Arte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-800 uppercase text-[10px]">{course.title}</td>
                      <td className="px-8 py-4">
                        {course.certificateTemplate ? (
                          <div className="w-16 h-10 rounded-lg border border-indigo-200 overflow-hidden shadow-sm"><img src={course.certificateTemplate} className="w-full h-full object-cover" /></div>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-300 uppercase italic">Usando Global</span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <label className="cursor-pointer p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all shadow-sm" title="Upload Arte do Curso">
                              <Upload size={14} /><input type="file" className="hidden" accept="image/*" onChange={e => handleCertificateUpload(course.id, e.target.files?.[0] || null)} />
                           </label>
                           {course.certificateTemplate && <button onClick={() => onUpdateCourse(course.id, { certificateTemplate: undefined })} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100" title="Voltar para Global"><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização Ampliada Final (Modo Print) */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col my-auto no-print">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[3rem]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Award size={24} /></div>
                <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Visualização de Modelo</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{previewCert.isDefault ? 'Padrão do Sistema' : `Template: ${previewCert.course?.title}`}</p>
                </div>
              </div>
              <button onClick={() => setPreviewCert(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all">Fechar</button>
            </div>

            <div className="p-12 overflow-y-auto flex justify-center bg-gray-200/50">
              <div className="bg-white w-full aspect-[1.414/1] p-16 flex flex-col font-serif text-black border-[12px] border-double border-indigo-900 shadow-inner relative overflow-hidden">
                {((!previewCert.isDefault && previewCert.course?.certificateTemplate) || config.defaultCertificateTemplate) && (
                  <img src={(!previewCert.isDefault && previewCert.course?.certificateTemplate) || config.defaultCertificateTemplate} className="absolute inset-0 w-full h-full object-cover z-0" />
                )}
                <div className="relative h-full w-full" style={{ zIndex: 10 }}>
                    <div className="absolute" style={{ left: `${certEditorData.logoStyle.x}%`, top: `${certEditorData.logoStyle.y}%`, transform: 'translate(-50%, -50%)', width: `${certEditorData.logoStyle.size}px` }}>
                       <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain" />
                    </div>

                    <div className="absolute whitespace-nowrap text-center" style={{ left: `${certEditorData.headerStyle.x}%`, top: `${certEditorData.headerStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.headerStyle.fontSize}px`, color: certEditorData.headerStyle.color, fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.1em' }}>{certEditorData.headerTitle}</div>

                    <div className="absolute whitespace-nowrap text-center" style={{ left: `${certEditorData.introStyle.x}%`, top: `${certEditorData.introStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.introStyle.fontSize}px`, color: certEditorData.introStyle.color, fontStyle: 'italic' }}>{certEditorData.introText}</div>

                    <div className="absolute whitespace-nowrap text-center" style={{ left: `${certEditorData.studentStyle.x}%`, top: `${certEditorData.studentStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.studentStyle.fontSize}px`, color: certEditorData.studentStyle.color, fontWeight: 900, textDecoration: 'underline', textUnderlineOffset: '8px' }}>NOME DO ALUNO</div>

                    <div className="absolute text-center" style={{ left: `${certEditorData.conclusionStyle.x}%`, top: `${certEditorData.conclusionStyle.y}%`, transform: 'translate(-50%, -50%)', width: '80%', fontSize: `${certEditorData.conclusionStyle.fontSize}px`, color: certEditorData.conclusionStyle.color, fontStyle: 'italic' }}>{certEditorData.conclusionText}</div>

                    <div className="absolute whitespace-nowrap text-center" style={{ left: `${certEditorData.courseStyle.x}%`, top: `${certEditorData.courseStyle.y}%`, transform: 'translate(-50%, -50%)', fontSize: `${certEditorData.courseStyle.fontSize}px`, color: certEditorData.courseStyle.color, fontWeight: 900, textTransform: 'uppercase' }}>{previewCert.isDefault ? 'TÍTULO DO CURSO EXEMPLO' : previewCert.course?.title}</div>

                    <div className="absolute text-center border-t-2 border-gray-800 pt-2" style={{ left: `${certEditorData.sigLeftStyle.x}%`, top: `${certEditorData.sigLeftStyle.y}%`, transform: 'translate(-50%, -50%)', width: '25%', fontSize: `${certEditorData.sigLeftStyle.fontSize}px`, color: certEditorData.sigLeftStyle.color, borderColor: certEditorData.sigLeftStyle.color }}>
                        <p className="font-black uppercase">{config.systemName}</p>
                        <p className="opacity-60">{certEditorData.signatureLeftLabel}</p>
                    </div>

                    <div className="absolute text-center border-t-2 border-gray-800 pt-2" style={{ left: `${certEditorData.sigRightStyle.x}%`, top: `${certEditorData.sigRightStyle.y}%`, transform: 'translate(-50%, -50%)', width: '25%', fontSize: `${certEditorData.sigRightStyle.fontSize}px`, color: certEditorData.sigRightStyle.color, borderColor: certEditorData.sigRightStyle.color }}>
                        <p className="font-black uppercase">{format(new Date(), 'dd/MM/yyyy')}</p>
                        <p className="opacity-60">{certEditorData.signatureRightLabel}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição de Curso */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? 'Editar Curso' : 'Novo Curso EAD'}</h3>
                <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Configuração Técnica</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Título do Curso</label>
                    <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-bold text-gray-700" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                    <textarea required rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-bold text-gray-700 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Público-alvo</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['medium', 'cambone', 'consulente'].map(type => (
                         <button key={type} type="button" onClick={() => setFormData({...formData, audience: {...formData.audience!, [type]: !formData.audience![type as keyof typeof formData.audience]}})} className={`p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase ${formData.audience![type as keyof typeof formData.audience] ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-transparent border-gray-100 text-gray-400'}`}>{type}</button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">URL da Thumbnail</label>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">{formData.thumbnail ? <img src={formData.thumbnail} className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-300" />}</div>
                      <input className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 font-mono text-xs" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avaliação</label>
                    <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">{[1, 2, 3, 4, 5].map(v => (<button key={v} type="button" onClick={() => setFormData({...formData, rating: v})} className={`p-2 transition-all ${formData.rating! >= v ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}><Star size={20} fill={formData.rating! >= v ? 'currentColor' : 'none'} /></button>))}</div>
                  </div>
                </div>
              </div>

              {/* Grade Curricular */}
              <div className="space-y-4 pt-8 border-t border-gray-100">
                 <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2"><Video size={18} className="text-indigo-600" /> Grade Curricular</h4>
                 <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="lg:col-span-2"><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Título da Aula</label><input className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 font-bold text-sm" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} /></div>
                       <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Tipo</label><select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 font-black text-[10px] uppercase" value={newLesson.type} onChange={e => setNewLesson({...newLesson, type: e.target.value as any})}><option value="video">Vídeo</option><option value="text">Texto</option><option value="pdf">PDF</option></select></div>
                       <div><label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Duração</label><input className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 font-bold text-sm" value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: e.target.value})} /></div>
                    </div>
                    <textarea rows={2} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 font-medium text-xs" value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} placeholder="URL ou Conteúdo" />
                    <button type="button" onClick={handleAddLesson} className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-50 flex items-center justify-center gap-2"><Plus size={16} /> Adicionar Aula</button>
                 </div>
                 <div className="space-y-2">{formData.lessons?.map((lesson, idx) => (<div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group"><div className="flex items-center gap-4"><span className="text-[10px] font-black text-gray-300 w-4">{idx + 1}º</span><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">{lesson.type === 'video' ? <Video size={16} /> : lesson.type === 'pdf' ? <FileText size={16} /> : <Type size={16} />}</div><div><p className="font-bold text-gray-700 text-xs">{lesson.title}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{lesson.type} • {lesson.duration || 'N/A'}</p></div></div><button type="button" onClick={() => removeLesson(lesson.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button></div>))}</div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]">{editingId ? 'Salvar Alterações' : 'Publicar Curso'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
