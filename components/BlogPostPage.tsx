import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogSidebar } from './BlogSidebar';
import { BlogService } from '../services/blogService';
import { BlogPost, BlogAuthor, BlogComment } from '../types';
import Navbar from './landing/components/Navbar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, Instagram, Users, Send, CheckCircle2, X, ShieldCheck } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment System States
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState({ authorName: '', content: '', mathAnswer: '' });
  const [mathChallenge, setMathChallenge] = useState({ num1: 0, num2: 0 });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Share Modal State
  const [shareModal, setShareModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'info' }>({ 
    isOpen: false, title: '', message: '', type: 'info' 
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await BlogService.getPostBySlug(slug);
        setPost(data);
        
        if (data) {
          // Fetch Author
          if (data.authorId) {
            const authorData = await BlogService.getAuthorById(data.authorId);
            setAuthor(authorData);
          }
          
          // Fetch Comments
          const fetchedComments = await BlogService.getCommentsByPost(data.id);
          setComments(fetchedComments);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    generateMathChallenge();
  }, [slug]);

  const generateMathChallenge = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setMathChallenge({ num1: n1, num2: n2 });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    if (parseInt(newComment.mathAnswer) !== mathChallenge.num1 + mathChallenge.num2) {
      setShareModal({
        isOpen: true,
        title: 'Erro de Validação',
        message: 'A resposta do desafio matemático está incorreta. Tente novamente.',
        type: 'info'
      });
      generateMathChallenge();
      setNewComment(prev => ({ ...prev, mathAnswer: '' }));
      return;
    }

    setSubmittingComment(true);
    try {
      const comment: BlogComment = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        postId: post.id,
        postTitle: post.title,
        authorName: newComment.authorName,
        content: newComment.content,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await BlogService.saveComment(comment);
      setCommentSuccess(true);
      setNewComment({ authorName: '', content: '', mathAnswer: '' });
      generateMathChallenge();
      
      // Hide success message after 5 seconds
      setTimeout(() => setCommentSuccess(false), 5000);
    } catch (error) {
      console.error("Error saving comment:", error);
      setShareModal({
        isOpen: true,
        title: 'Erro',
        message: 'Ocorreu um erro ao enviar seu comentário. Tente novamente.',
        type: 'info'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Post não encontrado</h1>
        <button onClick={() => navigate('/blog')} className="text-orange-600 font-bold hover:underline">Voltar para o Blog</button>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const handleShare = (platform: string) => {
    let url = '';
    const text = post.title;
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
    }
    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShareModal({
      isOpen: true,
      title: 'Link Copiado!',
      message: 'O link foi copiado com sucesso. Cole onde desejar compartilhar!',
      type: 'success'
    });
  };

  const handleInstagramShare = () => {
    setShareModal({
      isOpen: true,
      title: 'Compartilhar no Instagram',
      message: 'O Instagram não permite compartilhamento direto via web. Copie o link abaixo e cole no seu Story ou envie por Direct!',
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <Navbar /> 

      {/* Share/Notification Modal */}
      {shareModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${shareModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
               {shareModal.type === 'success' ? <CheckCircle2 size={32} /> : <Share2 size={32} />}
             </div>
             <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{shareModal.title}</h3>
             <p className="text-gray-600 text-center mb-6">{shareModal.message}</p>
             
             {shareModal.title.includes('Instagram') && (
               <div className="bg-gray-100 p-3 rounded-lg mb-6 flex items-center gap-2 overflow-hidden">
                  <span className="text-xs text-gray-500 truncate flex-1">{shareUrl}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Copiado</span>
               </div>
             )}
             
             <button 
               onClick={() => setShareModal(prev => ({ ...prev, isOpen: false }))}
               className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
             >
               Entendi
             </button>
          </div>
        </div>
      )}
      
      <div className="pt-32 pb-20 container mx-auto px-4 lg:px-8">
        <button 
          onClick={() => navigate('/blog')}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Voltar para o Blog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Main Content */}
           <div className="lg:col-span-8">
              <article className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video overflow-hidden bg-gray-100 relative">
                   {post.coverImage && (
                     <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                   )}
                </div>
                
                <div className="p-8 md:p-12">
                   <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-medium border-b border-gray-100 pb-6">
                      <span>{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                      <span>•</span>
                      <span>{author ? author.name : (post.author || 'Equipe ConectAxé')}</span>
                   </div>
                   
                   <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                     {post.title}
                   </h1>

                   <div className="prose prose-lg prose-orange max-w-none text-gray-600 leading-relaxed">
                      {post.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4">{paragraph}</p>
                      ))}
                   </div>

                   {/* Keywords */}
                   {post.keywords && (
                     <div className="mt-8 flex flex-wrap gap-2">
                       {post.keywords.split(',').map((keyword, idx) => (
                         <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-default">
                           #{keyword.trim()}
                         </span>
                       ))}
                     </div>
                   )}

                   {/* Social Share Section */}
                   <div className="mt-12 pt-8 border-t border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <Share2 size={20} className="text-orange-600" />
                       Compartilhar este artigo
                     </h3>
                     <div className="flex flex-wrap gap-3">
                       <button onClick={() => handleShare('facebook')} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Facebook">
                         <Facebook size={20} />
                       </button>
                       <button onClick={handleInstagramShare} className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity" title="Instagram">
                         <Instagram size={20} />
                       </button>
                       <button onClick={() => handleShare('twitter')} className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors" title="Twitter">
                         <Twitter size={20} />
                       </button>
                       <button onClick={() => handleShare('linkedin')} className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors" title="LinkedIn">
                         <Linkedin size={20} />
                       </button>
                       <button onClick={() => handleShare('whatsapp')} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors" title="WhatsApp">
                         <MessageCircle size={20} />
                       </button>
                       <button onClick={copyLink} className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors" title="Copiar Link">
                         <LinkIcon size={20} />
                       </button>
                     </div>
                   </div>

                   {/* Author Section */}
                   {(author || post.author) && (
                     <div className="mt-12 p-8 bg-white rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left border border-gray-100 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                       <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                       
                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-gray-100 ring-4 ring-orange-50 z-10">
                         {author?.photo ? (
                           <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-orange-300 bg-orange-50">
                             <Users size={32} />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 z-10">
                         <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                           <h3 className="text-2xl font-bold text-gray-900">{author ? author.name : post.author}</h3>
                           {author?.role && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider self-center">{author.role}</span>}
                         </div>
                         
                         <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
                           {author?.bio || 'Autor colaborador do Blog ConectAxé. Especialista em religiosidade e cultura afro-brasileira.'}
                         </p>
                         
                         {author?.socialLinks && (
                           <div className="flex justify-center md:justify-start gap-3">
                             {author.socialLinks.instagram && (
                               <a 
                                 href={`https://instagram.com/${author.socialLinks.instagram.replace('@', '').replace('https://instagram.com/', '')}`} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:opacity-80 transition-opacity shadow-sm"
                                 title="Instagram"
                               >
                                 <Instagram size={16} />
                               </a>
                             )}
                             {author.socialLinks.facebook && (
                               <a 
                                 href={author.socialLinks.facebook} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity shadow-sm"
                                 title="Facebook"
                               >
                                 <Facebook size={16} />
                               </a>
                             )}
                             {author.socialLinks.linkedin && (
                               <a 
                                 href={author.socialLinks.linkedin} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white hover:opacity-80 transition-opacity shadow-sm"
                                 title="LinkedIn"
                               >
                                 <Linkedin size={16} />
                               </a>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {/* Comments Section */}
                   <div className="mt-12 pt-8 border-t border-gray-100">
                     <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                       <MessageCircle className="text-orange-600" />
                       Comentários ({comments.length})
                     </h3>
                     
                     {/* Comment List */}
                     <div className="space-y-6 mb-12">
                       {comments.length === 0 ? (
                         <p className="text-gray-500 italic">Seja o primeiro a comentar!</p>
                       ) : (
                         comments.map(comment => (
                           <div key={comment.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                             <div className="flex justify-between items-start mb-2">
                               <h4 className="font-bold text-gray-900">{comment.authorName}</h4>
                               <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), "dd MMM, yyyy", { locale: ptBR })}</span>
                             </div>
                             <p className="text-gray-600 leading-relaxed">{comment.content}</p>
                           </div>
                         ))
                       )}
                     </div>

                     {/* Comment Form */}
                     <div className="bg-orange-50/50 p-8 rounded-2xl border border-orange-100">
                       <h4 className="text-lg font-bold text-orange-900 mb-6">Deixe seu comentário</h4>
                       
                       {commentSuccess ? (
                         <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                           <CheckCircle2 size={24} />
                           <div>
                             <p className="font-bold">Comentário enviado!</p>
                             <p className="text-sm">Seu comentário foi enviado para moderação e aparecerá em breve.</p>
                           </div>
                         </div>
                       ) : (
                         <form onSubmit={handleCommentSubmit} className="space-y-4">
                           <div className="grid md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Seu Nome</label>
                               <input 
                                 type="text" 
                                 required
                                 value={newComment.authorName}
                                 onChange={e => setNewComment({...newComment, authorName: e.target.value})}
                                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                 placeholder="Como você quer ser chamado"
                               />
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                               <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-600" />
            Verificação de Segurança
          </label>
          <div className="relative flex items-center gap-3">
                                 <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-lg font-bold text-gray-600 border border-gray-200 min-w-[100px] text-center select-none">
                                   {mathChallenge.num1} + {mathChallenge.num2} = ?
                                 </div>
                                 <input 
                                   type="number" 
                                   required
                                   value={newComment.mathAnswer}
                                   onChange={e => setNewComment({...newComment, mathAnswer: e.target.value})}
                                   className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-bold text-center text-lg"
                                   placeholder="Resposta"
                                 />
                               </div>
                               <p className="text-xs text-gray-400 mt-2">Digite o resultado da soma acima para confirmar que você é humano.</p>
                             </div>
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Comentário</label>
                               <textarea 
                                 required
                                 value={newComment.content}
                                 onChange={e => setNewComment({...newComment, content: e.target.value})}
                                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all h-32 resize-none"
                                 placeholder="Escreva sua opinião sobre o artigo..."
                               />
                             </div>
                             <button 
                               type="submit" 
                               disabled={submittingComment}
                               className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                               {submittingComment ? 'Enviando...' : (
                                 <>
                                   <Send size={18} />
                                   Enviar Comentário
                                 </>
                               )}
                             </button>
                         </form>
                       )}
                     </div>
                   </div>

                </div>
              </article>
           </div>

           {/* Sidebar */}
           <div className="lg:col-span-4">
              <div className="sticky top-32">
                 <BlogSidebar />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
