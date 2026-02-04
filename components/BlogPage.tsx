import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BlogSidebar } from './BlogSidebar';
import { BlogService } from '../services/blogService';
import { BlogPost } from '../types';
import Navbar from './landing/components/Navbar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BlogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let allPosts = await BlogService.getPublishedPosts();
        
        if (categorySlug) {
           // Fetch categories to find ID from slug, or filter if post has slug.
           // Assuming post.category is ID. 
           // For now, let's filter by checking if any category matches.
           // Ideally, we should fetch category by slug to get ID, then filter posts by category ID.
           const categories = await BlogService.getAllCategories();
           const category = categories.find(c => c.slug === categorySlug);
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
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Blog ConectAxé</h1>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">Notícias, atualizações e conhecimento para gestão de terreiros.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Main Content */}
           <div className="lg:col-span-8 space-y-12">
              {loading ? (
                <div className="text-center py-20">Carregando...</div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <article key={post.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                    <div className="aspect-video overflow-hidden bg-gray-100 relative">
                       {post.coverImage && (
                         <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       )}
                       <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-indigo-600 shadow-lg">
                            Artigo
                          </span>
                       </div>
                    </div>
                    <div className="p-8 md:p-10">
                       <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
                          <span>{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                          <span>•</span>
                          <span>{post.author || 'Equipe ConectAxé'}</span>
                       </div>
                       <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                         {post.title}
                       </h2>
                       <p className="text-gray-600 leading-relaxed mb-8 line-clamp-3">
                         {post.excerpt}
                       </p>
                       <a href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 font-black text-indigo-600 uppercase tracking-widest text-xs hover:gap-4 transition-all">
                         Ler Artigo Completo <span className="text-lg">→</span>
                       </a>
                    </div>
                  </article>
                ))
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
