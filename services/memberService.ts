
import { Member } from '../types';
import { generateUUID } from '../utils/ids';
import { ImageService } from './imageService';

export const MemberService = {
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
