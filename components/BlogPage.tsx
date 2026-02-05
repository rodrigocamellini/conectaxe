import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BlogSidebar } from './BlogSidebar';
import { BlogService } from '../services/blogService';
import { BlogPost, BlogCategory, BlogBanner } from '../types';
import Navbar from './landing/components/Navbar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BlogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [headerBanner, setHeaderBanner] = useState<BlogBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [allPostsData, allCategories, banner] = await Promise.all([
          BlogService.getPublishedPosts(),
          BlogService.getAllCategories(),
          BlogService.getBannerByLocation('header')
        ]);
        
        setCategories(allCategories);
        setHeaderBanner(banner);
        let allPosts = allPostsData;
        
        if (categorySlug) {
           const category = allCategories.find(c => c.slug === categorySlug);
           if (category) {
             allPosts = allPosts.filter(p => p.category === category.id);
           } else {
             allPosts = [];
           }
        }
        
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          allPosts = allPosts.filter(p => 
            p.title.toLowerCase().includes(q) || 
            p.content.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q)
          );
        }

        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [categorySlug, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar /> 
      
      <div className="pt-32 pb-20 container mx-auto px-4 lg:px-8">
        <div className="mb-8">
           <button 
             onClick={() => window.location.href = '/'} 
             className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
           >
              ← Voltar para Home
           </button>
        </div>

        {/* Default Orange Banner */}
        <div className="text-center mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 md:p-10 text-white shadow-xl group">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">Blog ConectAxé</h1>
            <p className="text-base md:text-lg font-medium text-orange-100 max-w-3xl mx-auto whitespace-nowrap overflow-hidden text-ellipsis">Notícias, atualizações e conhecimento para gestão de terreiros.</p>
          </div>
           {/* Decorative Background Elements */}
           <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
           </div>
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-all duration-1000"></div>
        </div>

        {/* Ad Banner (Header Location) */}
        {headerBanner && headerBanner.active && (
          <div className="mb-12 mx-auto max-w-[900px] rounded-2xl overflow-hidden shadow-md border border-gray-100 group relative">
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded z-10">
              Publicidade
            </div>
            {headerBanner.linkUrl ? (
              <a href={headerBanner.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">
                 <img 
                   src={headerBanner.imageUrl} 
                   alt={headerBanner.title} 
                   className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
                   style={{ aspectRatio: '900/300' }}
                 />
              </a>
            ) : (
               <img 
                 src={headerBanner.imageUrl} 
                 alt={headerBanner.title} 
                 className="w-full h-auto object-cover"
                 style={{ aspectRatio: '900/300' }}
               />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Main Content */}
           <div className="lg:col-span-8 space-y-8">
              {loading ? (
                <div className="text-center py-20">Carregando...</div>
              ) : posts.length > 0 ? (
                posts.map(post => {
                  const categoryName = categories.find(c => c.id === post.category)?.name || 'Geral';
                  return (
                    <article key={post.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
                      <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden bg-gray-100 relative">
                         {post.coverImage && (
                           <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         )}
                         <div className="absolute top-4 left-4">
                            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-indigo-600 shadow-lg">
                              {categoryName}
                            </span>
                         </div>
                      </Link>
                      <div className="p-8 md:p-10 flex flex-col flex-1">
                         <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                            <span>{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                            <span>•</span>
                            <span>{post.author || 'Equipe ConectAxé'}</span>
                         </div>
                         <Link to={`/blog/${post.slug}`} className="block">
                           <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                             {post.title}
                           </h2>
                         </Link>
                         <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                           {post.excerpt}
                         </p>
                         <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 font-black text-indigo-600 uppercase tracking-widest text-xs hover:gap-4 transition-all">
                           Ler Artigo Completo <span className="text-lg">→</span>
                         </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100">
                   <p className="text-gray-500 font-medium">Nenhum post encontrado.</p>
                </div>
              )}
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
