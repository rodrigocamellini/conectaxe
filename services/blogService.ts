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
import { BlogPost, BlogCategory } from '../types';

const BLOG_POSTS_COLLECTION = 'blog_posts';
const BLOG_CATEGORIES_COLLECTION = 'blog_categories';

export const BlogService = {
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
      const q = query(
        collection(db, BLOG_POSTS_COLLECTION), 
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      return [];
    }
  },

  getRecentPosts: async (count: number = 3): Promise<BlogPost[]> => {
    try {
      const q = query(
        collection(db, BLOG_POSTS_COLLECTION),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
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
  }
};
