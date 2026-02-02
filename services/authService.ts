import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { User, MasterCredentials } from '../types';
import { MasterService } from './masterService';

const SESSIONS_COLLECTION = 'saas_sessions';
const CLIENTS_COLLECTION = 'saas_clients';

export const AuthService = {
  createSession: async (userId: string, userType: 'master' | 'client_admin' | 'system_user', clientId?: string): Promise<string> => {
    try {
        const sessionId = doc(collection(db, SESSIONS_COLLECTION)).id;
        const sessionData = {
        id: sessionId,
        userId,
        userType,
        clientId: clientId || null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        userAgent: navigator.userAgent
        };
        await setDoc(doc(db, SESSIONS_COLLECTION, sessionId), sessionData);
        return sessionId;
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
  },

  validateSession: async (sessionId: string): Promise<{ user: User, isMasterMode: boolean } | null> => {
    try {
      const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) return null;
      
      const session = sessionSnap.data();
      
      // Check expiration (e.g., 30 days)
      const now = new Date();
      const lastActive = new Date(session.lastActive);
      const diffDays = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays > 30) {
        await deleteDoc(sessionRef);
        return null;
      }

      // Update last active
      await setDoc(sessionRef, { ...session, lastActive: new Date().toISOString() }, { merge: true });

      // Fetch User
      if (session.userType === 'master') {
         const creds = await MasterService.getMasterCredentials();
         const masterUser: User = { 
             id: 'master', 
             name: 'Rodrigo Master', 
             email: creds?.email || 'rodrigo@dev.com', 
             role: 'admin',
             password: creds?.password || 'master'
         };
         return {
             user: masterUser,
             isMasterMode: true
         };
      } else if (session.userType === 'client_admin') {
         const clientRef = doc(db, CLIENTS_COLLECTION, session.userId);
         const clientSnap = await getDoc(clientRef);
         if (clientSnap.exists()) {
             const client = clientSnap.data();
             return {
                 user: { 
                     id: client.id, 
                     name: client.adminName, 
                     email: client.adminEmail, 
                     role: 'admin',
                     password: client.adminPassword 
                 },
                 isMasterMode: false
             };
         }
      } else if (session.userType === 'system_user' && session.clientId) {
         const userRef = doc(db, CLIENTS_COLLECTION, session.clientId, 'users', session.userId);
         const userSnap = await getDoc(userRef);
         if (userSnap.exists()) {
             return {
                 user: userSnap.data() as User,
                 isMasterMode: false
             };
         }
      }
      return null;
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  },

  invalidateSession: async (sessionId: string): Promise<void> => {
      try {
          if (!sessionId) return;
          await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
      } catch (e) {
          console.error("Error invalidating session", e);
      }
  },

  updateUser: async (clientId: string, userId: string, data: Partial<User>): Promise<void> => {
    try {
        if (!clientId || !userId) return;
        // Ensure we don't save undefined fields
        const cleanData = JSON.parse(JSON.stringify(data));
        
        // If the user is the Client Admin (userId matches clientId), update the client document itself
        if (clientId === userId) {
            const clientUpdate: any = {};
            if (cleanData.name) clientUpdate.adminName = cleanData.name;
            if (cleanData.email) clientUpdate.adminEmail = cleanData.email;
            if (cleanData.password) clientUpdate.adminPassword = cleanData.password;
            
            // Also update other common fields if necessary
            
            const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
            await setDoc(clientRef, clientUpdate, { merge: true });
            
            // We also verify if there is a shadow user document and update it too for consistency
            // But the primary source of truth for admin login is the client document
        } 
        
        // Always attempt to update the user in the users subcollection as well (for listings, etc.)
        const userRef = doc(db, CLIENTS_COLLECTION, clientId, 'users', userId);
        await setDoc(userRef, cleanData, { merge: true });

    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
  }
};
