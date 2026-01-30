
import { Member } from '../types';
import { generateUUID } from '../utils/ids';
import { ImageService } from './imageService';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_MEMBERS = 'members';

export const MemberService = {
  // --- CRUD Firebase ---

  getAllMembers: async (clientId: string): Promise<Member[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_MEMBERS));
      return querySnapshot.docs.map(doc => doc.data() as Member);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      return [];
    }
  },

  saveMember: async (clientId: string, member: Member): Promise<void> => {
    if (!clientId) return;
    try {
      // Garante que não salvamos campos undefined
      const cleanMember = JSON.parse(JSON.stringify(member));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_MEMBERS, member.id), cleanMember);
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      throw error;
    }
  },

  deleteMember: async (clientId: string, memberId: string): Promise<void> => {
    if (!clientId) return;
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_MEMBERS, memberId));
    } catch (error) {
      console.error("Erro ao excluir membro:", error);
      throw error;
    }
  },

  // --- Helpers ---
  
  /**
   * Prepares a new member object with standardized ID and defaults
   */
  createMember: async (data: Partial<Member>, existingMembers: Member[], isConsulente: boolean = false): Promise<Member> => {
    // Legacy support: We used to use sequential IDs. 
    // New strategy: Use UUIDs for robustness.
    // However, to maintain visual consistency if users expect numbers, we can keep sequential 
    // OR switch to UUIDs. 
    // The requirement is "Standardize IDs". UUID is the standard.
    // But we need to ensure we don't break sorting by ID if that's used.
    // Let's use UUIDs.
    
    const newId = generateUUID();
    const photo = ImageService.getProfileImage(data.photo);
    
    return {
      ...data,
      id: newId,
      photo,
      status: data.status || (isConsulente ? 'consulente' : 'ativo'),
      isConsulente,
      createdAt: new Date().toISOString(),
      name: data.name || 'Novo Membro'
    } as Member;
  },

  validateMember: (member: Partial<Member>): { valid: boolean; error?: string } => {
    if (!member.name) return { valid: false, error: 'Nome é obrigatório' };
    return { valid: true };
  }
};
