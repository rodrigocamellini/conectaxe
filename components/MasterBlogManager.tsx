import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, BlogCategory, BlogComment } from '../types';
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
  Calendar,
  BookOpen,
  Megaphone,
  Globe,
  Link as LinkIcon,
  Users,
  MessageCircle,
  Check,
  Ban,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper for safe ID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const MasterBlogManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'banners' | 'authors' | 'comments'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Editing States
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<BlogCategory>>({});
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<any>({});
  const [isEditingAuthor, setIsEditingAuthor] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<any>({});
  
  // Keyword Input State
  const [keywordInput, setKeywordInput] = useState('');

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'post' | 'category' | 'banner' | 'author' | 'comment';
    id: string;
    title: string;
  }>({ isOpen: false, type: 'post', id: '', title: '' });

  // Refs for file inputs
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);
  const authorImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedCategories, fetchedBanners, fetchedAuthors, fetchedComments] = await Promise.all([
        BlogService.getAllPosts(),
        BlogService.getAllCategories(),
        BlogService.getBanners(),
        BlogService.getAllAuthors(),
        BlogService.getAllComments()
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
      setBanners(fetchedBanners);
      setAuthors(fetchedAuthors);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading blog data:", error);
      showNotification("Erro ao carregar dados do blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async (passedPosts?: BlogPost[] | any, passedCategories?: BlogCategory[]) => {
    // Handle arguments (if called via onClick, first arg is event)
    const currentPosts = Array.isArray(passedPosts) ? passedPosts : posts;
    const currentCategories = Array.isArray(passedCategories) ? passedCategories : categories;

    const isManual = !Array.isArray(passedPosts);
    if (loading && isManual) return; 
    
    try {
      if (isManual) setLoading(true);
      
      // Ensure we have categories
      let catGeral = currentCategories.find(c => c.name === 'Geral');
      let catDatas = currentCategories.find(c => c.name === 'Datas Comemorativas');
      let catReflexao = currentCategories.find(c => c.name === 'Reflexão');
      let catNoticias = currentCategories.find(c => c.name === 'Notícias');

      if (!catGeral) {
        const id = generateId();
        await BlogService.saveCategory({ id, name: 'Geral', slug: 'geral' });
        catGeral = { id, name: 'Geral', slug: 'geral' };
      }
      if (!catDatas) {
        const id = generateId();
        await BlogService.saveCategory({ id, name: 'Datas Comemorativas', slug: 'datas-comemorativas' });
        catDatas = { id, name: 'Datas Comemorativas', slug: 'datas-comemorativas' };
      }
      if (!catReflexao) {
         const id = generateId();
         await BlogService.saveCategory({ id, name: 'Reflexão', slug: 'reflexao' });
         catReflexao = { id, name: 'Reflexão', slug: 'reflexao' };
      }
      if (!catNoticias) {
         const id = generateId();
         await BlogService.saveCategory({ id, name: 'Notícias', slug: 'noticias' });
         catNoticias = { id, name: 'Notícias', slug: 'noticias' };
      }

      // Check and add posts
      const iemanjaExists = currentPosts.some(p => p.title.includes('Iemanjá'));
      if (!iemanjaExists) {
        await BlogService.savePost({
          id: generateId(),
          title: 'Dia de Iemanjá: A Rainha do Mar',
          slug: 'dia-de-iemanja-rainha-do-mar',
          content: 'No dia 2 de fevereiro, celebramos Iemanjá, a Rainha do Mar. Orixá de grande poder, protetora dos pescadores e mãe de todas as cabeças. Neste dia, devotos levam oferendas ao mar, vestem branco e pedem por proteção e caminhos abertos. Iemanjá representa a fertilidade, a família e o amor incondicional. Salve a Rainha do Mar! Odoyá!',
          excerpt: 'Celebração do dia 2 de fevereiro, dia de Iemanjá, a Rainha do Mar. Conheça a importância desta data.',
          status: 'published',
          category: catDatas?.id || catGeral?.id || '',
          coverImage: 'https://images.unsplash.com/photo-1568817765239-688164019688?q=80&w=1000&auto=format&fit=crop', // Generic ocean/spiritual image
          author: 'Master',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const intoleranceExists = currentPosts.some(p => p.title.includes('Intolerância'));
      if (!intoleranceExists) {
        await BlogService.savePost({
          id: generateId(),
          title: 'Combate à Intolerância Religiosa',
          slug: 'combate-a-intolerancia-religiosa',
          content: 'A intolerância religiosa é um crime que fere a liberdade de crença e a dignidade humana. É fundamental respeitar todas as manifestações de fé. As religiões de matriz africana, em especial, sofrem com preconceitos históricos. O diálogo e a educação são as principais armas contra o ódio. Juntos somos mais fortes na luta por um mundo com mais respeito e axé.',
          excerpt: 'Reflexão sobre a importância do respeito e da luta contra a intolerância religiosa no Brasil.',
          status: 'published',
          category: catReflexao?.id || catGeral?.id || '',
          coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop', // Hands/unity image
          author: 'Master',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const growthExists = currentPosts.some(p => p.title.includes('Crescimento'));
      if (!growthExists) {
        await BlogService.savePost({
          id: generateId(),
          title: 'O Crescimento da Umbanda e Candomblé',
          slug: 'o-crescimento-da-umbanda-e-candomble',
          content: 'Nos últimos anos, observamos um crescimento significativo no interesse e na adesão às religiões de matriz africana. Esse movimento reflete uma busca por reconexão com a ancestralidade e por uma espiritualidade mais acolhedora e inclusiva. Terreiros estão se abrindo mais para a comunidade, desmistificando preconceitos e levando a mensagem de amor e caridade para mais pessoas.',
          excerpt: 'Análise sobre o aumento de adeptos e o fortalecimento das religiões de matriz africana.',
          status: 'published',
          category: catNoticias?.id || catGeral?.id || '',
          coverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop', // Spiritual gathering/nature
          author: 'Master',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      if (isManual) {
        showNotification('Posts iniciais criados com sucesso!', 'success');
      }
      loadData();
    } catch (err) {
      console.error("Error seeding data:", err);
      if (isManual) {
        showNotification('Erro ao criar posts iniciais. Verifique o console.', 'error');
      }
    } finally {
      if (isManual) setLoading(false);
    }
  };

  // Auto-seed effect
  const hasSeeded = useRef(false);
  useEffect(() => {
    if (!loading && !hasSeeded.current) {
      // Wait a bit to ensure categories are fully loaded if they come from async
      const timer = setTimeout(() => {
        hasSeeded.current = true;
        seedInitialData(posts, categories);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.content) {
      showNotification("Preencha o título e o conteúdo.", "error");
      return;
    }

    try {
      const slug = currentPost.slug || currentPost.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const postToSave: BlogPost = {
        id: currentPost.id || generateId(),
        title: currentPost.title,
        slug,
        content: currentPost.content,
        excerpt: currentPost.excerpt || currentPost.content.substring(0, 150) + '...',
        coverImage: currentPost.coverImage || '',
        category: currentPost.category || '',
        author: currentPost.author || 'Master',
        authorId: currentPost.authorId, // Saved for relation
        status: currentPost.status || 'draft',
        keywords: currentPost.keywords || '',
        createdAt: currentPost.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await BlogService.savePost(postToSave);
      setIsEditingPost(false);
      setCurrentPost({});
      showNotification("Postagem salva com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error saving post:", error);
      showNotification("Erro ao salvar postagem", "error");
    }
  };

  const handleDeletePost = (post: BlogPost) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'post',
      id: post.id,
      title: post.title
    });
  };

  const handleDeleteCategory = (cat: BlogCategory) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'category',
      id: cat.id,
      title: cat.name
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.name) {
      showNotification("Preencha o nome da categoria.", "error");
      return;
    }

    try {
      const slug = currentCategory.slug || currentCategory.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const categoryToSave: BlogCategory = {
        id: currentCategory.id || generateId(),
        name: currentCategory.name,
        slug,
        image: currentCategory.image
      };

      await BlogService.saveCategory(categoryToSave);
      setIsEditingCategory(false);
      setCurrentCategory({});
      showNotification("Categoria salva com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      showNotification("Erro ao salvar categoria", "error");
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner.title || !currentBanner.imageUrl) {
      showNotification("Preencha o título e a imagem.", "error");
      return;
    }

    try {
      const bannerToSave = {
        id: currentBanner.id || generateId(),
        location: currentBanner.location || 'sidebar-top',
        title: currentBanner.title,
        imageUrl: currentBanner.imageUrl,
        linkUrl: currentBanner.linkUrl || '',
        active: currentBanner.active !== false
      };

      await BlogService.saveBanner(bannerToSave);
      setIsEditingBanner(false);
      setCurrentBanner({});
      showNotification("Banner salvo com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error saving banner:", error);
      showNotification("Erro ao salvar banner", "error");
    }
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAuthor.name || !currentAuthor.bio) {
      showNotification("Preencha o nome e a biografia.", "error");
      return;
    }

    try {
      const authorToSave = {
        id: currentAuthor.id || generateId(),
        name: currentAuthor.name,
        bio: currentAuthor.bio,
        role: currentAuthor.role || '',
        photo: currentAuthor.photo || '',
        socialLinks: currentAuthor.socialLinks || {}
      };

      await BlogService.saveAuthor(authorToSave);
      setIsEditingAuthor(false);
      setCurrentAuthor({});
      showNotification("Autor salvo com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error saving author:", error);
      showNotification("Erro ao salvar autor", "error");
    }
  };

  const handleDeleteAuthor = (author: any) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'author',
      id: author.id,
      title: author.name
    });
  };

  const handleApproveComment = async (comment: BlogComment) => {
    try {
      await BlogService.saveComment({ ...comment, status: 'approved' });
      showNotification("Comentário aprovado com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error approving comment:", error);
      showNotification("Erro ao aprovar comentário", "error");
    }
  };

  const handleRejectComment = async (comment: BlogComment) => {
    try {
      await BlogService.saveComment({ ...comment, status: 'rejected' });
      showNotification("Comentário rejeitado com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error rejecting comment:", error);
      showNotification("Erro ao rejeitar comentário", "error");
    }
  };

  const handleHideComment = async (comment: BlogComment) => {
    try {
      // @ts-ignore
      await BlogService.saveComment({ ...comment, status: 'hidden' });
      showNotification("Comentário ocultado com sucesso!", "success");
      loadData();
    } catch (error) {
      console.error("Error hiding comment:", error);
      showNotification("Erro ao ocultar comentário", "error");
    }
  };

  const handleResetComment = async (comment: BlogComment) => {
    try {
      await BlogService.saveComment({ ...comment, status: 'pending' });
      showNotification("Comentário movido para pendente!", "success");
      loadData();
    } catch (error) {
      console.error("Error resetting comment:", error);
      showNotification("Erro ao redefinir comentário", "error");
    }
  };

  const handleDeleteComment = (comment: BlogComment) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'comment',
      id: comment.id,
      title: `Comentário de ${comment.authorName}`
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.id) return;
    
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
    
    try {
      if (deleteConfirmation.type === 'post') {
        await BlogService.deletePost(deleteConfirmation.id);
        showNotification("Postagem excluída com sucesso!", "success");
      } else if (deleteConfirmation.type === 'category') {
        await BlogService.deleteCategory(deleteConfirmation.id);
        showNotification("Categoria excluída com sucesso!", "success");
      } else if (deleteConfirmation.type === 'banner') {
        await BlogService.deleteBanner(deleteConfirmation.id);
        showNotification("Banner excluído com sucesso!", "success");
      } else if (deleteConfirmation.type === 'author') {
        await BlogService.deleteAuthor(deleteConfirmation.id);
        showNotification("Autor excluído com sucesso!", "success");
      } else if (deleteConfirmation.type === 'comment') {
        await BlogService.deleteComment(deleteConfirmation.id);
        showNotification("Comentário excluído com sucesso!", "success");
      }
      loadData();
    } catch (error) {
      console.error("Error deleting:", error);
      showNotification("Erro ao excluir item", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'post' | 'category' | 'banner' | 'author') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit (approx 680KB base64)
      showNotification("A imagem deve ter no máximo 500KB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'post') {
        setCurrentPost(prev => ({ ...prev, coverImage: base64 }));
      } else if (type === 'category') {
        setCurrentCategory(prev => ({ ...prev, image: base64 }));
      } else if (type === 'banner') {
        setCurrentBanner(prev => ({ ...prev, imageUrl: base64 }));
      } else if (type === 'author') {
        setCurrentAuthor(prev => ({ ...prev, photo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter' && (e as React.KeyboardEvent).key !== ',') {
      return;
    }
    
    e.preventDefault();
    const value = keywordInput.trim().replace(/,/g, '');
    if (!value) return;

    const currentKeywords = currentPost.keywords ? currentPost.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
    if (!currentKeywords.includes(value)) {
      const newKeywords = [...currentKeywords, value].join(', ');
      setCurrentPost(prev => ({ ...prev, keywords: newKeywords }));
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const currentKeywords = currentPost.keywords ? currentPost.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
    const newKeywords = currentKeywords.filter(k => k !== keywordToRemove).join(', ');
    setCurrentPost(prev => ({ ...prev, keywords: newKeywords }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Carregando blog...</div>;
  }

  return (
    <div className="space-y-8 text-white relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-right border ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' : 'bg-red-900/90 border-red-500 text-red-100'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70"><X size={18} /></button>
        </div>
      )}

      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-slate-700 pb-1">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'posts' 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Postagens
          {activeTab === 'posts' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'categories' 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Categorias
          {activeTab === 'categories' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'banners' 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Banners & Anúncios
          {activeTab === 'banners' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative flex items-center gap-2 ${
            activeTab === 'comments' 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Comentários
          {comments.filter(c => c.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {comments.filter(c => c.status === 'pending').length}
            </span>
          )}
          {activeTab === 'comments' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 py-2 text-sm font-bold uppercase transition-colors relative ${
            activeTab === 'authors' 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Autores
          {activeTab === 'authors' && (
            <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      </div>

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isEditingPost ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="text-indigo-400" />
                  Gerenciar Postagens
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => seedInitialData()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                  >
                    <Save size={16} />
                    Semear Posts (3 Iniciais)
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPost({});
                      setIsEditingPost(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                  >
                    <Plus size={16} />
                    Nova Postagem
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 mb-4">Nenhuma postagem encontrada.</p>
                    <button onClick={() => seedInitialData()} className="text-indigo-400 hover:underline">
                      Clique aqui para criar posts de exemplo
                    </button>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-start hover:border-indigo-500/30 transition-colors">
                      {post.coverImage && (
                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(post.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white truncate">{post.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mt-1">{post.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => {
                            setCurrentPost(post);
                            setIsEditingPost(true);
                          }}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Pencil className="text-indigo-400" />
                  {currentPost.id ? 'Editar Postagem' : 'Nova Postagem'}
                </h2>
                <button
                  onClick={() => setIsEditingPost(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Título</label>
                      <input
                        type="text"
                        value={currentPost.title || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                        placeholder="Título da postagem"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Resumo (Excerpt)</label>
                      <textarea
                        value={currentPost.excerpt || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-white"
                        placeholder="Breve resumo para exibição nos cards..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Categoria</label>
                        <select
                          value={currentPost.category || ''}
                          onChange={e => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                        >
                          <option value="">Selecione...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Autor</label>
                        <select
                          value={currentPost.authorId || ''}
                          onChange={e => {
                            const authorId = e.target.value;
                            const author = authors.find(a => a.id === authorId);
                            setCurrentPost(prev => ({ 
                              ...prev, 
                              authorId: authorId,
                              author: author ? author.name : 'Master' // Fallback for legacy
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                        >
                          <option value="">Selecione...</option>
                          {authors.map(author => (
                            <option key={author.id} value={author.id}>{author.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                        <select
                          value={currentPost.status || 'draft'}
                          onChange={e => setCurrentPost(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                        >
                          <option value="draft">Rascunho</option>
                          <option value="published">Publicado</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Palavras-chave (Keywords)</label>
                      <div className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 flex flex-wrap gap-2 min-h-[42px]">
                        {currentPost.keywords && currentPost.keywords.split(',').map(k => k.trim()).filter(k => k).map((keyword, idx) => (
                          <span key={idx} className="bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded text-sm flex items-center gap-1 border border-indigo-500/30">
                            {keyword}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={e => setKeywordInput(e.target.value)}
                          onKeyDown={handleAddKeyword}
                          onBlur={(e) => {
                            if (keywordInput.trim()) handleAddKeyword(e as any);
                          }}
                          className="bg-transparent outline-none flex-1 text-white min-w-[150px]"
                          placeholder={!currentPost.keywords ? "Digite e aperte Enter..." : ""}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Pressione Enter ou vírgula para adicionar tags.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Imagem de Capa</label>
                    <div 
                      onClick={() => postImageInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors bg-slate-900 overflow-hidden relative group"
                    >
                      {currentPost.coverImage ? (
                        <>
                          <img src={currentPost.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2"><Upload size={20} /> Alterar Imagem</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-2">
                          <ImageIcon size={48} className="opacity-50" />
                          <span className="font-medium">Clique para adicionar imagem</span>
                          <span className="text-xs">Recomendado: 1200x630px</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={postImageInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'post')}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Ou URL da imagem</label>
                      <input
                        type="text"
                        value={currentPost.coverImage || ''}
                        onChange={e => setCurrentPost(prev => ({ ...prev, coverImage: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-300"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Conteúdo Completo</label>
                  <textarea
                    value={currentPost.content || ''}
                    onChange={e => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-64 font-mono text-sm text-white"
                    placeholder="Escreva o conteúdo do post aqui..."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Dica: Você pode usar HTML básico para formatação.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsEditingPost(false)}
                    className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    Salvar Postagem
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="text-indigo-400" />
              Gerenciar Categorias
            </h2>
            <button
              onClick={() => {
                setCurrentCategory({});
                setIsEditingCategory(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
            >
              <Plus size={16} />
              Nova Categoria
            </button>
          </div>

          {isEditingCategory && (
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 mb-6 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button onClick={() => setIsEditingCategory(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nome da Categoria</label>
                    <input
                      type="text"
                      value={currentCategory.name || ''}
                      onChange={e => setCurrentCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                      placeholder="Ex: Datas Comemorativas"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Imagem de Fundo (Botão)</label>
                     <div className="space-y-2">
                        <div 
                          onClick={() => categoryImageInputRef.current?.click()}
                          className="h-24 w-full border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors bg-slate-900 overflow-hidden relative group"
                        >
                          {currentCategory.image ? (
                             <>
                              <img src={currentCategory.image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={16} className="text-white" />
                              </div>
                             </>
                          ) : (
                            <span className="text-slate-500 text-xs text-center p-2">Clique para adicionar imagem (Retangular)</span>
                          )}
                           <input 
                            type="file" 
                            ref={categoryImageInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={e => handleImageUpload(e, 'category')}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-px bg-slate-700 flex-1"></div>
                           <span className="text-xs text-slate-500 font-medium">OU URL</span>
                           <div className="h-px bg-slate-700 flex-1"></div>
                        </div>
                        <input
                          type="text"
                          value={currentCategory.image || ''}
                          onChange={e => setCurrentCategory(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-300"
                          placeholder="https://..."
                        />
                     </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                   <button
                    type="button"
                    onClick={() => setIsEditingCategory(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm"
                  >
                    <Save size={16} />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <div className="w-12 h-8 rounded bg-slate-900 overflow-hidden">
                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-600">
                      <Layout size={16} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white">{cat.name}</h4>
                    <p className="text-xs text-slate-500">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setCurrentCategory(cat);
                      setIsEditingCategory(true);
                    }}
                    className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="text-indigo-400" />
              Gerenciar Banners
            </h2>
            <button
              onClick={() => {
                setCurrentBanner({ location: 'sidebar-top', active: true });
                setIsEditingBanner(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
            >
              <Plus size={16} />
              Novo Banner
            </button>
          </div>

          {isEditingBanner && (
             <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 mb-6 animate-in fade-in slide-in-from-top-4">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {currentBanner.id ? 'Editar Banner' : 'Novo Banner'}
                </h3>
                <button onClick={() => setIsEditingBanner(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Localização</label>
                      <select
                        value={currentBanner.location || 'sidebar-top'}
                        onChange={e => setCurrentBanner(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                      >
                        <option value="sidebar-top">Sidebar (Acima dos Posts Recentes)</option>
                        <option value="header">Cabeçalho (Topo da Página do Blog)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Título (Identificação Interna)</label>
                      <input
                        type="text"
                        value={currentBanner.title || ''}
                        onChange={e => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                        placeholder="Ex: Promoção de Natal"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Link de Destino (Opcional)</label>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={currentBanner.linkUrl || ''}
                          onChange={e => setCurrentBanner(prev => ({ ...prev, linkUrl: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                     <div>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={currentBanner.active !== false}
                            onChange={e => setCurrentBanner(prev => ({ ...prev, active: e.target.checked }))}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                          />
                          Banner Ativo
                        </label>
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Imagem do Banner</label>
                    <div 
                      onClick={() => bannerImageInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors bg-slate-900 overflow-hidden relative group"
                    >
                      {currentBanner.imageUrl ? (
                        <>
                          <img src={currentBanner.imageUrl} alt="Banner" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2"><Upload size={20} /> Alterar Imagem</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-2">
                          <ImageIcon size={48} className="opacity-50" />
                          <span className="font-medium">Clique para adicionar imagem</span>
                          <span className="text-xs">Recomendado: Vertical ou Quadrado</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={bannerImageInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'banner')}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsEditingBanner(false)}
                    className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    Salvar Banner
                  </button>
                </div>
              </form>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(banner => (
              <div key={banner.id} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/30 transition-all flex flex-col">
                <div className="h-40 bg-slate-900 relative">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${banner.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}`}>
                      {banner.active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">{banner.location}</p>
                      <h3 className="font-bold text-white text-lg leading-tight">{banner.title}</h3>
                    </div>
                  </div>
                  {banner.linkUrl && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-4 truncate">
                      <LinkIcon size={12} />
                      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 truncate">
                        {banner.linkUrl}
                      </a>
                    </div>
                  )}
                  
                  <div className="mt-auto flex gap-2 pt-4 border-t border-slate-700/50">
                     <button
                        onClick={() => {
                          setCurrentBanner(banner);
                          setIsEditingBanner(true);
                        }}
                        className="flex-1 py-2 bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Pencil size={16} /> Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation({
                          isOpen: true,
                          type: 'banner',
                          id: banner.id,
                          title: banner.title
                        })}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && !isEditingBanner && (
              <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <Megaphone size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum banner cadastrado.</p>
                <button onClick={() => setIsEditingBanner(true)} className="text-indigo-400 hover:underline mt-2">Criar primeiro banner</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-400">
                Tem certeza que deseja excluir {deleteConfirmation.type === 'post' ? 'a postagem' : deleteConfirmation.type === 'category' ? 'a categoria' : 'o banner'} <span className="text-white font-semibold">"{deleteConfirmation.title}"</span>?
                <br />
                <span className="text-red-400 text-sm mt-2 block">Esta ação não pode ser desfeita.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* COMMENTS TAB */}
      {activeTab === 'comments' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="text-indigo-400" />
              Gerenciar Comentários
            </h2>
          </div>

          <div className="space-y-4">
             {comments.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  <p className="text-slate-400">Nenhum comentário encontrado.</p>
                </div>
             ) : (
                comments.map(comment => (
                  <div key={comment.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${comment.status === 'pending' ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/40 border-slate-700/50'}`}>
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{comment.authorName}</span>
                              <span className="text-slate-500 text-xs">•</span>
                              <span className="text-slate-400 text-xs">{format(new Date(comment.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                comment.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                comment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                comment.status === 'hidden' ? 'bg-slate-500/20 text-slate-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {comment.status === 'approved' ? 'Aprovado' : 
                                 comment.status === 'rejected' ? 'Rejeitado' : 
                                 comment.status === 'hidden' ? 'Oculto' : 
                                 'Pendente'}
                              </span>
                           </div>
                           <p className="text-slate-300 text-sm">{comment.content}</p>
                           {comment.postTitle && (
                              <p className="text-indigo-400 text-xs mt-2 font-medium">Em: {comment.postTitle}</p>
                           )}
                        </div>
                        <div className="flex gap-2">
                           {comment.status !== 'approved' && (
                              <button 
                                onClick={() => handleApproveComment(comment)}
                                className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors"
                                title="Aprovar"
                              >
                                 <Check size={18} />
                              </button>
                           )}
                           
                           {comment.status !== 'rejected' && comment.status !== 'hidden' && (
                              <button 
                                onClick={() => handleRejectComment(comment)}
                                className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                                title="Rejeitar"
                              >
                                 <Ban size={18} />
                              </button>
                           )}

                           {comment.status !== 'hidden' && (
                              <button 
                                onClick={() => handleHideComment(comment)}
                                className="p-2 bg-slate-600/20 hover:bg-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                                title="Ocultar"
                              >
                                 <EyeOff size={18} />
                              </button>
                           )}

                           {comment.status !== 'pending' && (
                              <button 
                                onClick={() => handleResetComment(comment)}
                                className="p-2 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white rounded-lg transition-colors"
                                title="Mover para Pendente"
                              >
                                 <RotateCcw size={18} />
                              </button>
                           )}

                           <button 
                              onClick={() => handleDeleteComment(comment)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Excluir"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>
      )}

      {/* AUTHORS TAB */}
      {activeTab === 'authors' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isEditingAuthor ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="text-indigo-400" />
                  Gerenciar Autores
                </h2>
                <button
                  onClick={() => {
                    setCurrentAuthor({});
                    setIsEditingAuthor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                >
                  <Plus size={16} />
                  Novo Autor
                </button>
              </div>

              <div className="grid gap-4">
                {authors.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400">Nenhum autor encontrado.</p>
                  </div>
                ) : (
                  authors.map(author => (
                    <div key={author.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-center hover:border-indigo-500/30 transition-colors">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {author.photo ? (
                          <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Users size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{author.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-1">{author.role || 'Sem cargo'}</p>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{author.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentAuthor(author);
                            setIsEditingAuthor(true);
                          }}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAuthor(author)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {currentAuthor.id ? 'Editar Autor' : 'Novo Autor'}
                </h3>
                <button
                  onClick={() => setIsEditingAuthor(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveAuthor} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
                      <input
                        type="text"
                        value={currentAuthor.name || ''}
                        onChange={e => setCurrentAuthor({ ...currentAuthor, name: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ex: João Silva"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Cargo / Título</label>
                      <input
                        type="text"
                        value={currentAuthor.role || ''}
                        onChange={e => setCurrentAuthor({ ...currentAuthor, role: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ex: Sacerdote, Colaborador"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Foto de Perfil</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                          {currentAuthor.photo ? (
                            <img src={currentAuthor.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <Users size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            ref={authorImageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'author')}
                          />
                          <button
                            type="button"
                            onClick={() => authorImageInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Carregar Foto
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Biografia</label>
                      <textarea
                        value={currentAuthor.bio || ''}
                        onChange={e => setCurrentAuthor({ ...currentAuthor, bio: e.target.value })}
                        className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Breve descrição sobre o autor..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-3 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <label className="block text-sm font-bold text-slate-300 mb-2">Redes Sociais</label>
                      <div className="grid grid-cols-1 gap-3">
                         <div className="flex items-center gap-2">
                           <span className="text-slate-500 w-24 text-sm">Instagram</span>
                           <input
                             type="text"
                             value={currentAuthor.socialLinks?.instagram || ''}
                             onChange={e => setCurrentAuthor({ 
                               ...currentAuthor, 
                               socialLinks: { ...currentAuthor.socialLinks, instagram: e.target.value } 
                             })}
                             className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                             placeholder="@usuario"
                           />
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-slate-500 w-24 text-sm">Facebook</span>
                           <input
                             type="text"
                             value={currentAuthor.socialLinks?.facebook || ''}
                             onChange={e => setCurrentAuthor({ 
                               ...currentAuthor, 
                               socialLinks: { ...currentAuthor.socialLinks, facebook: e.target.value } 
                             })}
                             className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                             placeholder="URL do perfil"
                           />
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-slate-500 w-24 text-sm">Twitter/X</span>
                           <input
                             type="text"
                             value={currentAuthor.socialLinks?.twitter || ''}
                             onChange={e => setCurrentAuthor({ 
                               ...currentAuthor, 
                               socialLinks: { ...currentAuthor.socialLinks, twitter: e.target.value } 
                             })}
                             className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                             placeholder="@usuario"
                           />
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-slate-500 w-24 text-sm">LinkedIn</span>
                           <input
                             type="text"
                             value={currentAuthor.socialLinks?.linkedin || ''}
                             onChange={e => setCurrentAuthor({ 
                               ...currentAuthor, 
                               socialLinks: { ...currentAuthor.socialLinks, linkedin: e.target.value } 
                             })}
                             className="flex-1 bg-slate-900/50 border border-slate-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                             placeholder="URL do perfil"
                           />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsEditingAuthor(false)}
                    className="px-6 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Salvar Autor
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
