
import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, BlogCategory } from '../types';
import { BlogService } from '../services/blogService';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Search, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Save, 
  FileText, 
  Layout, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export const MasterBlogManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing States
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<BlogCategory>>({});

  // Refs for file inputs
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedCategories] = await Promise.all([
        BlogService.getAllPosts(),
        BlogService.getAllCategories()
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading blog data:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      // Ensure we have categories
      let catGeral = categories.find(c => c.name === 'Geral');
      let catDatas = categories.find(c => c.name === 'Datas Comemorativas');
      let catReflexao = categories.find(c => c.name === 'Reflexão');
      let catNoticias = categories.find(c => c.name === 'Notícias');

      if (!catGeral) {
        const id = await BlogService.saveCategory({ name: 'Geral', slug: 'geral' });
        catGeral = { id, name: 'Geral', slug: 'geral' };
      }
      if (!catDatas) {
        const id = await BlogService.saveCategory({ name: 'Datas Comemorativas', slug: 'datas-comemorativas' });
        catDatas = { id, name: 'Datas Comemorativas', slug: 'datas-comemorativas' };
      }
      if (!catReflexao) {
         const id = await BlogService.saveCategory({ name: 'Reflexão', slug: 'reflexao' });
         catReflexao = { id, name: 'Reflexão', slug: 'reflexao' };
      }
      if (!catNoticias) {
         const id = await BlogService.saveCategory({ name: 'Notícias', slug: 'noticias' });
         catNoticias = { id, name: 'Notícias', slug: 'noticias' };
      }

      // Check and add posts
      const iemanjaExists = posts.some(p => p.title.includes('Iemanjá'));
      if (!iemanjaExists) {
        await BlogService.savePost({
          title: 'Dia de Iemanjá: A Rainha do Mar',
          slug: 'dia-de-iemanja-rainha-do-mar',
          content: 'No dia 2 de fevereiro, celebramos Iemanjá, a Rainha do Mar. Orixá de grande poder, protetora dos pescadores e mãe de todas as cabeças. Neste dia, devotos levam oferendas ao mar, vestem branco e pedem por proteção e caminhos abertos. Iemanjá representa a fertilidade, a família e o amor incondicional. Salve a Rainha do Mar! Odoyá!',
          excerpt: 'Celebração do dia 2 de fevereiro, dia de Iemanjá, a Rainha do Mar. Conheça a importância desta data.',
          status: 'published',
          category: catDatas?.id || catGeral?.id || '',
          coverImage: 'https://images.unsplash.com/photo-1568817765239-688164019688?q=80&w=1000&auto=format&fit=crop' // Generic ocean/spiritual image
        });
      }

      const intoleranceExists = posts.some(p => p.title.includes('Intolerância'));
      if (!intoleranceExists) {
        await BlogService.savePost({
          title: 'Combate à Intolerância Religiosa',
          slug: 'combate-a-intolerancia-religiosa',
          content: 'A intolerância religiosa é um crime que fere a liberdade de crença e a dignidade humana. É fundamental respeitar todas as manifestações de fé. As religiões de matriz africana, em especial, sofrem com preconceitos históricos. O diálogo e a educação são as principais armas contra o ódio. Juntos somos mais fortes na luta por um mundo com mais respeito e axé.',
          excerpt: 'Reflexão sobre a importância do respeito e da luta contra a intolerância religiosa no Brasil.',
          status: 'published',
          category: catReflexao?.id || catGeral?.id || '',
          coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop' // Hands/unity image
        });
      }

      const growthExists = posts.some(p => p.title.includes('Crescimento'));
      if (!growthExists) {
        await BlogService.savePost({
           title: 'O Crescimento da Umbanda e Candomblé',
           slug: 'o-crescimento-da-umbanda-e-candomble',
           content: 'Nos últimos anos, observamos um crescimento significativo no interesse e na adesão às religiões de matriz africana. Esse movimento reflete uma busca por reconexão com a ancestralidade e por uma espiritualidade mais acolhedora e inclusiva. Terreiros estão se abrindo mais para a comunidade, desmistificando preconceitos e levando a mensagem de amor e caridade para mais pessoas.',
           excerpt: 'Análise sobre o aumento de adeptos e o fortalecimento das religiões de matriz africana.',
           status: 'published',
           category: catNoticias?.id || catGeral?.id || '',
           coverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop' // Spiritual gathering/nature
        });
      }

      alert('Posts iniciais criados com sucesso!');
      loadData();
    } catch (err) {
      console.error("Error seeding data:", err);
      alert('Erro ao criar posts iniciais.');
    } finally {
      setLoading(false);
    }
  };
  // Cleanup

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.content) return;

    try {
      const slug = currentPost.slug || currentPost.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const postToSave: BlogPost = {
        id: currentPost.id || crypto.randomUUID(),
        title: currentPost.title,
        slug,
        content: currentPost.content,
        excerpt: currentPost.excerpt || currentPost.content.substring(0, 150) + '...',
        coverImage: currentPost.coverImage || '',
        category: currentPost.category || '',
        author: currentPost.author || 'Master',
        status: currentPost.status || 'draft',
        createdAt: currentPost.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await BlogService.savePost(postToSave);
      setIsEditingPost(false);
      setCurrentPost({});
      loadData();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Erro ao salvar postagem");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta postagem?")) return;
    try {
      await BlogService.deletePost(id);
      loadData();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.name) return;

    try {
      const slug = currentCategory.slug || currentCategory.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const categoryToSave: BlogCategory = {
        id: currentCategory.id || crypto.randomUUID(),
        name: currentCategory.name,
        slug,
        image: currentCategory.image
      };

      await BlogService.saveCategory(categoryToSave);
      setIsEditingCategory(false);
      setCurrentCategory({});
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Erro ao salvar categoria");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await BlogService.deleteCategory(id);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'post' | 'category') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'post') {
        setCurrentPost(prev => ({ ...prev, coverImage: base64 }));
      } else {
        setCurrentCategory(prev => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando blog...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'posts' 
              ? 'text-indigo-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Postagens
          {activeTab === 'posts' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'categories' 
              ? 'text-indigo-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Categorias
          {activeTab === 'categories' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
      </div>

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isEditingPost ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800 uppercase">Gerenciar Postagens</h2>
                <div className="flex gap-2">
                  <button
                    onClick={seedInitialData}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold text-xs uppercase"
                  >
                    <Upload size={16} /> Semear Posts
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPost({ status: 'draft' });
                      setIsEditingPost(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold text-xs uppercase"
                  >
                    <Plus size={16} /> Nova Postagem
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {posts.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    Nenhuma postagem encontrada.
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800 text-lg truncate pr-4">{post.title}</h3>
                          <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(post.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })}
                            </span>
                            {post.category && (
                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                                {categories.find(c => c.id === post.category)?.name || 'Categoria Removida'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setCurrentPost(post); setIsEditingPost(true); }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black text-gray-800 uppercase">
                  {currentPost.id ? 'Editar Postagem' : 'Nova Postagem'}
                </h3>
                <button 
                  onClick={() => { setIsEditingPost(false); setCurrentPost({}); }}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                      <input
                        type="text"
                        value={currentPost.title || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-700"
                        placeholder="Título da postagem..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resumo (Excerpt)</label>
                      <textarea
                        value={currentPost.excerpt || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-20 resize-none"
                        placeholder="Breve resumo para exibição nos cards..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Conteúdo</label>
                      <textarea
                        value={currentPost.content || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[300px] font-mono text-sm leading-relaxed"
                        placeholder="Escreva seu conteúdo aqui..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                      <select
                        value={currentPost.status || 'draft'}
                        onChange={e => setCurrentPost(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-gray-700"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                      <select
                        value={currentPost.category || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-gray-700"
                      >
                        <option value="">Selecione uma categoria...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagem de Capa</label>
                      <div 
                        onClick={() => postImageInputRef.current?.click()}
                        className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors group relative overflow-hidden"
                      >
                        {currentPost.coverImage ? (
                          <>
                            <img src={currentPost.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="text-gray-300 mb-2" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Upload Imagem</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={postImageInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'post')} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditingPost(false); setCurrentPost({}); }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} /> Salvar Postagem
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Form */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6">
                <h3 className="text-lg font-black text-gray-800 uppercase mb-6">
                  {currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                    <input
                      type="text"
                      value={currentCategory.name || ''}
                      onChange={e => setCurrentCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-700"
                      placeholder="Nome da categoria..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagem do Botão (Opcional)</label>
                    <p className="text-[10px] text-gray-400 mb-2">
                      Use uma imagem retangular (tipo 1 dedo de altura) para substituir o texto no botão.
                    </p>
                    <div 
                      onClick={() => categoryImageInputRef.current?.click()}
                      className="w-full h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors group relative overflow-hidden"
                    >
                      {currentCategory.image ? (
                        <>
                          <img src={currentCategory.image} alt="Category Button" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={16} />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon size={16} className="text-gray-300" />
                          <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Upload Botão</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={categoryImageInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, 'category')} 
                    />
                    {currentCategory.image && (
                      <button
                        type="button"
                        onClick={() => setCurrentCategory(prev => ({ ...prev, image: undefined }))}
                        className="text-[10px] text-rose-500 font-bold uppercase mt-2 hover:underline"
                      >
                        Remover Imagem
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {currentCategory.id && (
                      <button
                        type="button"
                        onClick={() => { setIsEditingCategory(false); setCurrentCategory({}); }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-indigo-700 transition-colors"
                    >
                      {currentCategory.id ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Category List */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0 overflow-hidden">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        cat.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{cat.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setCurrentCategory(cat); setIsEditingCategory(true); }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  Nenhuma categoria cadastrada.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
