
import { db } from './firebaseConfig';
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_USERS = 'users';

export const UserService = {
  getAllUsers: async (clientId: string): Promise<User[]> => {
    if (!clientId) return [];
    try {
      console.log(`[UserService] Fetching users for client: ${clientId}`);
      const q = collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_USERS);
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => doc.data() as User);
      console.log(`[UserService] Found ${users.length} users for client ${clientId}:`, users);
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários do sistema:", error);
      return [];
    }
  },

  saveUser: async (clientId: string, user: User): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      // Ensure user has an ID
      if (!user.id) throw new Error("User ID required");
      
      const cleanUser = JSON.parse(JSON.stringify(user));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_USERS, user.id), cleanUser);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      throw error;
    }
  },

  deleteUser: async (clientId: string, userId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_USERS, userId));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      throw error;
    }
  }
};
