import React, { useState, useMemo } from 'react';
import { Course, Lesson, Enrollment, Member, User, SystemConfig } from '../types';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Star, 
  ArrowLeft, 
  ChevronRight, 
  Video, 
  FileText, 
  Type, 
  Award, 
  Download, 
  Clock,
  Printer,
  X,
  Search,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Fix: Import DEFAULT_LOGO_URL from constants to resolve undefined reference error
import { DEFAULT_LOGO_URL } from '../constants';

interface EadPlatformProps {
  user: User;
  members: Member[];
  courses: Course[];
  enrollments: Enrollment[];
  config: SystemConfig;
  onEnroll: (memberId: string, courseId: string) => void;
  onUpdateProgress: (enrollmentId: string, lessonId: string) => void;
  onCompleteCourse: (enrollmentId: string) => void;
}

export const EadPlatform: React.FC<EadPlatformProps> = ({
  user,
  members,
  courses,
  enrollments,
  config,
  onEnroll,
  onUpdateProgress,
  onCompleteCourse
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showCertificate, setShowCertificate] = useState<{ course: Course, enrollment?: Enrollment, isPreview: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user.role === 'admin';

  const currentMember = useMemo(() => {
    return members.find(m => m.email.toLowerCase() === user.email.toLowerCase());
  }, [members, user.email]);

  const availableCourses = useMemo(() => {
    return courses.filter(course => {
      return course.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [courses, searchQuery]);

  const checkEligibility = (course: Course) => {
    if (isAdmin) return { eligible: true, reason: '' };
    if (!currentMember) return { eligible: false, reason: 'Vínculo de membro necessário' };

    const isMedium = currentMember.isMedium && course.audience.medium;
    const isCambone = currentMember.isCambone && course.audience.cambone;
    const isConsulente = (currentMember.isConsulente || currentMember.status === 'consulente') && course.audience.consulente;
    
    if (isMedium || isCambone || isConsulente) {
      return { eligible: true, reason: '' };
    }

    const target = [];
    if (course.audience.medium) target.push('Médiuns');
    if (course.audience.cambone) target.push('Cambones');
    if (course.audience.consulente) target.push('Consulentes');

    return { 
      eligible: false, 
      reason: `Exclusivo para: ${target.join(', ')}` 
    };
  };

  const handleEnroll = (course: Course) => {
    const { eligible } = checkEligibility(course);
    
    if (!eligible) {
      if (isAdmin) {
        setSelectedCourse(course);
      }
      return;
    }

    if (currentMember) {
      onEnroll(currentMember.id, course.id);
    }
  };

  const toggleLessonComplete = (enrollment: Enrollment, lessonId: string) => {
    onUpdateProgress(enrollment.id, lessonId);
    
    const course = courses.find(c => c.id === enrollment.courseId);
    if (course) {
      const isCompleting = !enrollment.progress.includes(lessonId) && enrollment.progress.length + 1 === course.lessons.length;
      if (isCompleting) {
        onCompleteCourse(enrollment.id);
      }
    }
  };

  const getEnrollment = (courseId: string) => {
    if (!currentMember) return undefined;
    return enrollments.find(e => e.memberId === currentMember.id && e.courseId === courseId);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (selectedCourse) {
    const enrollment = getEnrollment(selectedCourse.id);
    const lessons = selectedCourse.lessons;
    const currentLesson = activeLesson || lessons[0];
    const progress = enrollment?.progress || [];
    const percent = lessons.length > 0 ? Math.round((progress.length / lessons.length) * 100) : 0;

    return (
      <div className="animate-in fade-in duration-500 space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedCourse(null); setActiveLesson(null); }}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 shadow-sm hover:bg-indigo-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight line-clamp-1">{selectedCourse.title}</h3>
            {isAdmin && !currentMember ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                <ShieldCheck size={10} /> Modo Visualização Admin
              </span>
            ) : (
              <div className="flex items-center gap-4 mt-1">
                 <div className="flex-1 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
                 </div>
                 <span className="text-[10px] font-black text-indigo-600 uppercase">{percent}% Concluído</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
               {currentLesson.type === 'video' ? (
                 <div className="aspect-video bg-black flex items-center justify-center relative group">
                    <iframe 
                      className="w-full h-full"
                      src={currentLesson.content.includes('youtube.com') ? currentLesson.content.replace('watch?v=', 'embed/') : currentLesson.content}
                      title={currentLesson.title}
                      allowFullScreen
                    />
                 </div>
               ) : currentLesson.type === 'pdf' ? (
                 <div className="p-12 text-center space-y-6">
                    <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                       <FileText size={48} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-gray-800 uppercase">{currentLesson.title}</h4>
                       <p className="text-sm text-gray-400 font-medium mt-2">Esta aula contém uma apostila para download.</p>
                    </div>
                    <a 
                      href={currentLesson.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                       <Download size={20} /> Baixar Apostila
                    </a>
                 </div>
               ) : (
                 <div className="p-10 md:p-16 prose prose-indigo max-w-none">
                    <h1 className="text-3xl font-black text-gray-800 uppercase mb-8">{currentLesson.title}</h1>
                    <div className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {currentLesson.content}
                    </div>
                 </div>
               )}
               
               <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-gray-800 uppercase text-sm">{currentLesson.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{currentLesson.type} • {currentLesson.duration || 'N/A'}</p>
                  </div>
                  {enrollment && (
                    <button 
                      onClick={() => toggleLessonComplete(enrollment, currentLesson.id)}
                      className={`px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg transition-all flex items-center gap-2 ${
                        progress.includes(currentLesson.id) 
                          ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {progress.includes(currentLesson.id) ? <CheckCircle2 size={18} /> : null}
                      {progress.includes(currentLesson.id) ? 'Aula Concluída' : 'Marcar como Concluída'}
                    </button>
                  )}
               </div>
            </div>

            {percent === 100 && (
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner">
                      <Award size={48} className="text-yellow-400" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase tracking-tight">Parabéns pela Conclusão!</h4>
                      <p className="text-white/70 font-medium">Você finalizou todos os módulos deste treinamento.</p>
                   </div>
                </div>
                <button 
                  onClick={() => enrollment && setShowCertificate({ course: selectedCourse, enrollment, isPreview: false })}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                >
                  <Download size={18} /> Gerar Meu Certificado
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Conteúdo do Curso</h4>
             <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {lessons.map((lesson, idx) => {
                  const isDone = progress.includes(lesson.id);
                  const isActive = currentLesson.id === lesson.id;
                  
                  return (
                    <button 
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all text-left group ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                         isDone ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                       }`}>
                          {isDone ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{idx + 1}</span>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`font-black text-xs uppercase truncate ${isActive ? 'text-indigo-900' : 'text-gray-600'}`}>{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             {lesson.type === 'video' ? <Video size={10} /> : lesson.type === 'pdf' ? <FileText size={10} /> : <Type size={10} />}
                             <span className="text-[9px] font-bold text-gray-400 uppercase">{lesson.type} • {lesson.duration || '--'}</span>
                          </div>
                       </div>
                       {isActive && <ChevronRight size={16} className="text-indigo-400" />}
                    </button>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <div className="flex items-center gap-2">
               <h3 className="text-3xl font-black text-gray-800 tracking-tight">Caminho do Conhecimento</h3>
               {isAdmin && <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Admin View</span>}
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Plataforma EAD - Todos os Treinamentos Disponíveis</p>
         </div>
         <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar curso..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 transition-all shadow-sm text-sm font-medium"
              style={{ '--tw-ring-color': config.primaryColor } as any}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableCourses.map(course => {
          const enrollment = getEnrollment(course.id);
          const isEnrolled = !!enrollment;
          const isCompleted = !!enrollment?.completedAt;
          const { eligible, reason } = checkEligibility(course);
          
          const progressPercent = enrollment && course.lessons.length > 0 
            ? Math.round((enrollment.progress.length / course.lessons.length) * 100) 
            : 0;

          return (
            <div key={course.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
               <div className="aspect-video relative overflow-hidden bg-gray-50">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                       <BookOpen size={48} className="opacity-20 mb-2" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < course.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>

               <div className="p-8 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                     {course.audience.medium && <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[9px] font-black uppercase rounded-lg border border-purple-100">Médium</span>}
                     {course.audience.cambone && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-lg border border-amber-100">Cambone</span>}
                     {course.audience.consulente && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-lg border border-emerald-100">Consulente</span>}
                  </div>
                  
                  <h4 className="text-xl font-black text-gray-800 uppercase mb-3 leading-tight">{course.title}</h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-6 flex-1">{course.description}</p>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                     <button 
                        onClick={() => setShowCertificate({ course, isPreview: true })}
                        className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                     >
                        <Eye size={16} /> Visualizar Modelo
                     </button>

                     {isEnrolled ? (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase">
                              <span className="text-gray-400">{isCompleted ? 'Curso Concluído' : 'Seu Progresso'}</span>
                              <span className="text-indigo-600">{progressPercent}%</span>
                           </div>
                           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progressPercent}%` }} />
                           </div>
                           <button 
                            onClick={() => setSelectedCourse(course)}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-all active:scale-[0.95] flex items-center justify-center gap-2 ${
                              isCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                            }`}
                           >
                              {isCompleted ? <Award size={18} /> : <Play size={18} fill="currentColor" />}
                              {isCompleted ? 'Revisar / Certificado' : 'Continuar Assistindo'}
                           </button>
                        </div>
                     ) : (
                        <div className="flex flex-col gap-3">
                           {!eligible && (
                             <div className="flex items-center gap-1.5 text-red-500 px-2 py-1 bg-red-50 rounded-lg self-start">
                                <Lock size={12} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">{reason}</span>
                             </div>
                           )}
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-gray-400">
                                 <Clock size={14} />
                                 <span className="text-[10px] font-black uppercase">{course.lessons.length} aulas</span>
                              </div>
                              <button 
                               onClick={() => handleEnroll(course)}
                               disabled={!eligible && !isAdmin}
                               className={`px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition-all ${
                                 eligible || isAdmin
                                   ? 'bg-indigo-600 text-white hover:scale-105 active:scale-95' 
                                   : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                               }`}
                              >
                                 {isAdmin && !currentMember ? 'Visualizar Grade' : 'Matricular-se Agora'}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {showCertificate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col my-auto no-print">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[3rem]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                      <Award size={24} />
                  </div>
                  <div>
                      <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                        {showCertificate.isPreview ? 'Modelo de Certificado' : 'Seu Certificado Digital'}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {showCertificate.isPreview ? 'Visualização prévia do layout' : 'Documento oficial de conclusão'}
                      </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCertificate(null)} className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100">Fechar</button>
                  {!showCertificate.isPreview && (
                    <button onClick={handlePrintCertificate} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
                      <Printer size={18} /> Imprimir Certificado
                    </button>
                  )}
                </div>
              </div>

              <div className="p-12 overflow-y-auto flex justify-center bg-gray-200/50">
                <div id="print-area" className="bg-white w-full aspect-[1.414/1] p-16 flex flex-col font-serif text-black border-[12px] border-double border-indigo-900 shadow-inner relative overflow-hidden">
                  
                  {/* Fundo do Certificado */}
                  {(showCertificate.course.certificateTemplate || config.defaultCertificateTemplate) && (
                    <img 
                      src={showCertificate.course.certificateTemplate || config.defaultCertificateTemplate} 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                      style={{ zIndex: 0 }}
                    />
                  )}

                  {/* ELEMENTOS DINÂMICOS BASEADOS NO CONFIG */}
                  {config.certificateConfig && (
                    <div className="relative h-full w-full" style={{ zIndex: 10 }}>
                        
                        {/* Logo */}
                        <div 
                          className="absolute"
                          style={{ 
                            left: `${config.certificateConfig.logoStyle.x}%`, 
                            top: `${config.certificateConfig.logoStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            width: `${config.certificateConfig.logoStyle.size}px`
                          }}
                        >
                           {/* Fix: Using DEFAULT_LOGO_URL which was missing from imports */}
                           <img src={config.logoUrl || DEFAULT_LOGO_URL} className="w-full h-full object-contain" />
                        </div>

                        {/* Título */}
                        <div 
                          className="absolute whitespace-nowrap text-center"
                          style={{ 
                            left: `${config.certificateConfig.headerStyle.x}%`, 
                            top: `${config.certificateConfig.headerStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${config.certificateConfig.headerStyle.fontSize}px`,
                            color: config.certificateConfig.headerStyle.color,
                            fontWeight: 900,
                            fontFamily: 'sans-serif'
                          }}
                        >
                          {config.certificateConfig.headerTitle}
                        </div>

                        {/* Intro */}
                        <div 
                          className="absolute whitespace-nowrap text-center"
                          style={{ 
                            left: `${config.certificateConfig.introStyle.x}%`, 
                            top: `${config.certificateConfig.introStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${config.certificateConfig.introStyle.fontSize}px`,
                            color: config.certificateConfig.introStyle.color,
                            fontStyle: 'italic'
                          }}
                        >
                          {config.certificateConfig.introText}
                        </div>

                        {/* Aluno */}
                        <div 
                          className="absolute whitespace-nowrap text-center"
                          style={{ 
                            left: `${config.certificateConfig.studentStyle.x}%`, 
                            top: `${config.certificateConfig.studentStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${config.certificateConfig.studentStyle.fontSize}px`,
                            color: config.certificateConfig.studentStyle.color,
                            fontWeight: 900,
                            textDecoration: 'underline',
                            textUnderlineOffset: '8px'
                          }}
                        >
                          {showCertificate.isPreview ? 'NOME DO ALUNO (MODELO)' : (currentMember?.name || user.name)}
                        </div>

                        {/* Conclusão */}
                        <div 
                          className="absolute whitespace-nowrap text-center"
                          style={{ 
                            left: `${config.certificateConfig.conclusionStyle.x}%`, 
                            top: `${config.certificateConfig.conclusionStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${config.certificateConfig.conclusionStyle.fontSize}px`,
                            color: config.certificateConfig.conclusionStyle.color,
                            fontStyle: 'italic'
                          }}
                        >
                          {config.certificateConfig.conclusionText}
                        </div>

                        {/* Curso */}
                        <div 
                          className="absolute whitespace-nowrap text-center"
                          style={{ 
                            left: `${config.certificateConfig.courseStyle.x}%`, 
                            top: `${config.certificateConfig.courseStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${config.certificateConfig.courseStyle.fontSize}px`,
                            color: config.certificateConfig.courseStyle.color,
                            fontWeight: 900,
                            textTransform: 'uppercase'
                          }}
                        >
                          {showCertificate.course.title}
                        </div>

                        {/* Assinaturas */}
                        <div 
                          className="absolute text-center"
                          style={{ 
                            left: `${config.certificateConfig.sigLeftStyle.x}%`, 
                            top: `${config.certificateConfig.sigLeftStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            width: '25%',
                            fontSize: `${config.certificateConfig.sigLeftStyle.fontSize}px`,
                            color: config.certificateConfig.sigLeftStyle.color,
                            borderTop: `2px solid ${config.certificateConfig.sigLeftStyle.color}`,
                            paddingTop: '8px'
                          }}
                        >
                          <p className="font-black uppercase">{config.systemName}</p>
                          <p className="opacity-60 uppercase font-bold text-[0.8em]">{config.certificateConfig.signatureLeftLabel}</p>
                        </div>

                        <div 
                          className="absolute text-center"
                          style={{ 
                            left: `${config.certificateConfig.sigRightStyle.x}%`, 
                            top: `${config.certificateConfig.sigRightStyle.y}%`, 
                            transform: 'translate(-50%, -50%)',
                            width: '25%',
                            fontSize: `${config.certificateConfig.sigRightStyle.fontSize}px`,
                            color: config.certificateConfig.sigRightStyle.color,
                            borderTop: `2px solid ${config.certificateConfig.sigRightStyle.color}`,
                            paddingTop: '8px'
                          }}
                        >
                          <p className="font-black">
                            {showCertificate.isPreview 
                              ? format(new Date(), "dd/MM/yyyy")
                              : showCertificate.enrollment?.completedAt 
                                ? format(new Date(showCertificate.enrollment.completedAt), "dd/MM/yyyy") 
                                : '--/--/----'
                            }
                          </p>
                          <p className="opacity-60 uppercase font-bold text-[0.8em]">{config.certificateConfig.signatureRightLabel}</p>
                        </div>

                        {config.certificateConfig.showAuthenticityCode && (
                          <div className="absolute bottom-4 right-4 text-[9px] font-bold text-gray-300 tracking-widest uppercase">
                            Autenticidade: {showCertificate.isPreview ? '0000-MODELO-0000' : (showCertificate.enrollment?.id || '---')}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
