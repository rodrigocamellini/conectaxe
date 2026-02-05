import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BlogService } from '../services/blogService';
import { BlogPost, BlogCategory, BlogBanner } from '../types';

interface BlogSidebarProps {
  onSearch?: (query: string) => void;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [banner, setBanner] = useState<BlogBanner | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [posts, cats, adBanner] = await Promise.all([
          BlogService.getRecentPosts(3),
          BlogService.getAllCategories(),
          BlogService.getBannerByLocation('sidebar-top')
        ]);
        setRecentPosts(posts);
        setCategories(cats);
        setBanner(adBanner);
      } catch (error) {
        console.error("Error loading sidebar data:", error);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/blog?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Widget */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-3">Pesquisar</h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Buscar no blog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Ad Banner Widget */}
      {banner && banner.active && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative">
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
            Publicidade
          </div>
          {banner.linkUrl ? (
            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-auto object-cover hover:opacity-95 transition-opacity" 
              />
            </a>
          ) : (
             <img 
                src={banner.imageUrl} 
                alt={banner.title} 
                className="w-full h-auto object-cover" 
              />
          )}
        </div>
      )}

      {/* Recent Posts Widget */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 border-l-4 border-orange-500 pl-3">Posts Recentes</h3>
        <div className="space-y-6">
          {recentPosts.length > 0 ? (
            recentPosts.map(post => (
              <div key={post.id} className="group cursor-pointer" onClick={() => navigate(`/blog/${post.slug}`)}>
                <div className="flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-xs">Sem img</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider group-hover:underline">Leia mais</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum post recente.</p>
          )}
        </div>
      </div>

      {/* Categories Widget */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 border-l-4 border-orange-500 pl-3">Categorias</h3>
        <div className="space-y-2">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div key={cat.id}>
                {cat.image ? (
                  <button
                    onClick={() => navigate(`/blog?category=${cat.slug}`)}
                    className="w-full h-12 rounded-lg overflow-hidden relative group hover:shadow-md transition-all"
                    title={cat.name}
                  >
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/blog?category=${cat.slug}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition-all border border-transparent hover:border-gray-100"
                  >
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-gray-300 text-xs">→</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhuma categoria encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
};
