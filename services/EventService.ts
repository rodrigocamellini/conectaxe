
import { TerreiroEvent, EventTicket, CalendarEvent } from '../types';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_EVENTS = 'terreiro_events';
const SUBCOL_TICKETS = 'event_tickets';
const SUBCOL_CALENDAR = 'calendar_events';

export const EventService = {
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
