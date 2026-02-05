import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from "./firebaseConfig";
import { BlogPost, BlogCategory, BlogBanner } from '../types';

const BLOG_POSTS_COLLECTION = 'blog_posts';
const BLOG_CATEGORIES_COLLECTION = 'blog_categories';
const BLOG_BANNERS_COLLECTION = 'blog_banners';
const BLOG_AUTHORS_COLLECTION = 'blog_authors';

export const BlogService = {
  // Authors
  getAllAuthors: async (): Promise<any[]> => {
    try {
      const snapshot = await getDocs(collection(db, BLOG_AUTHORS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching blog authors:", error);
      return [];
    }
  },

  getAuthorById: async (id: string): Promise<any | null> => {
    try {
      const docRef = doc(db, BLOG_AUTHORS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching author by id:", error);
      return null;
    }
  },

  saveAuthor: async (author: any): Promise<void> => {
    try {
      const authorRef = doc(db, BLOG_AUTHORS_COLLECTION, author.id);
      await setDoc(authorRef, author);
    } catch (error) {
      console.error("Error saving blog author:", error);
      throw error;
    }
  },

  deleteAuthor: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, BLOG_AUTHORS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting blog author:", error);
      throw error;
    }
  },

  // Posts
  getAllPosts: async (): Promise<BlogPost[]> => {
    try {
      const q = query(collection(db, BLOG_POSTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return [];
    }
  },

  getPublishedPosts: async (): Promise<BlogPost[]> => {
    try {
      // Fetch all posts ordered by date and filter in client to avoid Firestore Composite Index requirements
      const q = query(collection(db, BLOG_POSTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      return allPosts.filter(p => p.status === 'published');
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      return [];
    }
  },

  getRecentPosts: async (count: number = 3): Promise<BlogPost[]> => {
    try {
      // Use client-side filtering to avoid index issues
      const q = query(collection(db, BLOG_POSTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      return allPosts
        .filter(p => p.status === 'published')
        .slice(0, count);
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      return [];
    }
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const q = query(collection(db, BLOG_POSTS_COLLECTION), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
    } catch (error) {
      console.error("Error fetching post by slug:", error);
      return null;
    }
  },

  savePost: async (post: BlogPost): Promise<void> => {
    try {
      const postRef = doc(db, BLOG_POSTS_COLLECTION, post.id);
      await setDoc(postRef, post);
    } catch (error) {
      console.error("Error saving blog post:", error);
      throw error;
    }
  },

  deletePost: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, BLOG_POSTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },

  // Categories
  getAllCategories: async (): Promise<BlogCategory[]> => {
    try {
      const snapshot = await getDocs(collection(db, BLOG_CATEGORIES_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogCategory));
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      return [];
    }
  },

  saveCategory: async (category: BlogCategory): Promise<void> => {
    try {
      const catRef = doc(db, BLOG_CATEGORIES_COLLECTION, category.id);
      await setDoc(catRef, category);
    } catch (error) {
      console.error("Error saving blog category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, BLOG_CATEGORIES_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting blog category:", error);
      throw error;
    }
  },

  // Banners
  getBanners: async (): Promise<BlogBanner[]> => {
    try {
      const snapshot = await getDocs(collection(db, BLOG_BANNERS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogBanner));
    } catch (error) {
      console.error("Error fetching blog banners:", error);
      return [];
    }
  },

  getBannerByLocation: async (location: string): Promise<BlogBanner | null> => {
    try {
      const q = query(collection(db, BLOG_BANNERS_COLLECTION), where('location', '==', location), where('active', '==', true), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogBanner;
    } catch (error) {
      console.error("Error fetching blog banner by location:", error);
      return null;
    }
  },

  saveBanner: async (banner: BlogBanner): Promise<void> => {
    try {
      const bannerRef = doc(db, BLOG_BANNERS_COLLECTION, banner.id);
      await setDoc(bannerRef, banner);
    } catch (error) {
      console.error("Error saving blog banner:", error);
      throw error;
    }
  },

  deleteBanner: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, BLOG_BANNERS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting blog banner:", error);
      throw error;
    }
  }
};
