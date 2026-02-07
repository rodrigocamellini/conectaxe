
import { TerreiroEvent, EventTicket, CalendarEvent } from '../types';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, collectionGroup, query, where, limit, documentId } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_EVENTS = 'terreiro_events';
const SUBCOL_TICKETS = 'event_tickets';
const SUBCOL_CALENDAR = 'calendar_events';

export const EventService = {
  findEventAndClient: async (eventId: string): Promise<{ event: TerreiroEvent, clientId: string } | null> => {
    try {
      console.log(`Buscando evento com ID: ${eventId}`);
      
      let snapshot = null;
      let foundEvent: TerreiroEvent | null = null;
      let foundDocRef = null;

      // 1. Tentar buscar pelo documentId() primeiro (mais eficiente e não requer índice composto em collectionGroup)
      // Nota: documentId() em collectionGroup pode exigir que o valor seja o caminho completo se houver colisão,
      // mas para IDs únicos (UUIDs/PushIDs), geralmente funciona ou é a melhor aposta inicial.
      // Se falhar (retornar vazio), tentamos o campo 'id'.
      try {
        const qDocId = query(collectionGroup(db, SUBCOL_EVENTS), where(documentId(), '==', eventId), limit(1));
        const snapshotDocId = await getDocs(qDocId);
        
        if (!snapshotDocId.empty) {
           console.log(`Evento encontrado via documentId()`);
           snapshot = snapshotDocId;
        }
      } catch (err) {
        console.warn("Erro ao buscar por documentId(), tentando fallback:", err);
      }

      // 2. Se não encontrou por documentId, tenta buscar pelo campo 'id'
      // Isso requer índice 'COLLECTION_GROUP_ASC' no campo 'id' para a coleção 'terreiro_events'
      if (!snapshot || snapshot.empty) {
        try {
          console.log(`Tentando buscar pelo campo 'id'...`);
          const qId = query(collectionGroup(db, SUBCOL_EVENTS), where('id', '==', eventId), limit(1));
          const snapshotId = await getDocs(qId);
          
          if (!snapshotId.empty) {
             console.log(`Evento encontrado via campo 'id'`);
             snapshot = snapshotId;
          }
        } catch (err: any) {
          // Se for erro de índice, logamos mas não travamos se já tivéssemos tentado outras formas (mas aqui é a última chance)
          if (err.code === 'failed-precondition' && err.message.includes('index')) {
             console.error("FALTA ÍNDICE NO FIRESTORE: É necessário criar um índice CollectionGroup para 'terreiro_events' no campo 'id'.");
             console.error("Link para criar: ", err.message.match(/https:\/\/[^\s]+/)?.[0]);
          } else {
             console.warn("Erro ao buscar por campo 'id':", err);
          }
        }
      }
      
      if (!snapshot || snapshot.empty) {
         console.warn(`Evento ${eventId} não encontrado em nenhuma coleção.`);
         return null;
      }
      
      const doc = snapshot.docs[0];
      const event = doc.data() as TerreiroEvent;
      
      // Garante que o ID do evento está correto com base no ID do documento
      if (!event.id) event.id = doc.id;
      
      // The parent of the event is 'terreiro_events', the parent of that is the client doc
      const clientDocRef = doc.ref.parent.parent;
      const clientId = clientDocRef?.id;
      
      console.log(`Evento encontrado! ClientID: ${clientId}`);
      
      if (!clientId) return null;
      
      return { event, clientId };
    } catch (error) {
      console.error("Erro fatal ao buscar evento público:", error);
      return null;
    }
  },

  getAllEvents: async (clientId: string): Promise<TerreiroEvent[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_EVENTS));
      return querySnapshot.docs.map(doc => doc.data() as TerreiroEvent);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      return [];
    }
  },

  saveEvent: async (clientId: string, event: TerreiroEvent): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanEvent = JSON.parse(JSON.stringify(event));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_EVENTS, event.id), cleanEvent);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      throw error;
    }
  },

  deleteEvent: async (clientId: string, eventId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_EVENTS, eventId));
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      throw error;
    }
  },

  getAllTickets: async (clientId: string): Promise<EventTicket[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_TICKETS));
      return querySnapshot.docs.map(doc => doc.data() as EventTicket);
    } catch (error) {
      console.error("Erro ao buscar ingressos:", error);
      return [];
    }
  },

  saveTicket: async (clientId: string, ticket: EventTicket): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanTicket = JSON.parse(JSON.stringify(ticket));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_TICKETS, ticket.id), cleanTicket);
    } catch (error) {
      console.error("Erro ao salvar ingresso:", error);
      throw error;
    }
  },

  getAllCalendarEvents: async (clientId: string): Promise<CalendarEvent[]> => {
    if (!clientId) return [];
    try {
      const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_CALENDAR));
      return querySnapshot.docs.map(doc => doc.data() as CalendarEvent);
    } catch (error) {
      console.error("Erro ao buscar eventos do calendário:", error);
      return [];
    }
  },

  saveCalendarEvent: async (clientId: string, event: CalendarEvent): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const cleanEvent = JSON.parse(JSON.stringify(event));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CALENDAR, event.id), cleanEvent);
    } catch (error) {
      console.error("Erro ao salvar evento do calendário:", error);
      throw error;
    }
  },

  deleteCalendarEvent: async (clientId: string, eventId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_CALENDAR, eventId));
    } catch (error) {
      console.error("Erro ao excluir evento do calendário:", error);
      throw error;
    }
  }
};
