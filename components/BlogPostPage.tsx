import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogSidebar } from './BlogSidebar';
import { BlogService } from '../services/blogService';
import { BlogPost, BlogAuthor } from '../types';
import Navbar from './landing/components/Navbar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, Instagram, Users } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await BlogService.getPostBySlug(slug);
        setPost(data);
        
        if (data && data.authorId) {
            const authorData = await BlogService.getAuthorById(data.authorId);
            setAuthor(authorData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Post não encontrado</h1>
        <button onClick={() => navigate('/blog')} className="text-indigo-600 font-bold hover:underline">Voltar para o Blog</button>
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
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar /> 
      
      <div className="pt-32 pb-20 container mx-auto px-4 lg:px-8">
        <button 
          onClick={() => navigate('/blog')}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
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

                   <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed">
                      {post.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4">{paragraph}</p>
                      ))}
                   </div>

                   {/* Keywords */}
                   {post.keywords && (
                     <div className="mt-8 flex flex-wrap gap-2">
                       {post.keywords.split(',').map((keyword, idx) => (
                         <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">
                           #{keyword.trim()}
                         </span>
                       ))}
                     </div>
                   )}

                   {/* Social Share Section */}
                   <div className="mt-12 pt-8 border-t border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <Share2 size={20} className="text-indigo-600" />
                       Compartilhar este artigo
                     </h3>
                     <div className="flex flex-wrap gap-3">
                       <button onClick={() => handleShare('facebook')} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Facebook">
                         <Facebook size={20} />
                       </button>
                       {/* Instagram Button */}
                       <button onClick={() => alert('O compartilhamento direto no Instagram não é suportado via web. Copie o link!')} className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity" title="Instagram">
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
                   {author && (
                     <div className="mt-12 p-8 bg-gray-50 rounded-2xl flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                         {author.photo ? (
                           <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400">
                             <Users size={32} />
                           </div>
                         )}
                       </div>
                       <div className="flex-1">
                         <h3 className="text-xl font-bold text-gray-900 mb-1">{author.name}</h3>
                         {author.role && <p className="text-indigo-600 font-medium text-sm mb-3 uppercase tracking-wider">{author.role}</p>}
                         <p className="text-gray-600 leading-relaxed mb-4">
                           {author.bio}
                         </p>
                         {author.socialLinks && (
                           <div className="flex justify-center md:justify-start gap-3">
                             {author.socialLinks.instagram && (
                               <a href={`https://instagram.com/${author.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
                             )}
                             {author.socialLinks.facebook && (
                               <a href={author.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={18} /></a>
                             )}
                             {author.socialLinks.twitter && (
                               <a href={`https://twitter.com/${author.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors"><Twitter size={18} /></a>
                             )}
                             {author.socialLinks.linkedin && (
                               <a href={author.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin size={18} /></a>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   )}
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
