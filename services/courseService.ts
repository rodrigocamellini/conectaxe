import { db } from './firebaseConfig';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { Course, Enrollment } from '../types';

const CLIENTS_COLLECTION = 'saas_clients';
const SUBCOL_COURSES = 'courses';
const SUBCOL_ENROLLMENTS = 'enrollments';

export const CourseService = {
  // Courses
  saveCourse: async (clientId: string, course: Course): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      if (!course.id) throw new Error("Course ID required");
      const cleanCourse = JSON.parse(JSON.stringify(course));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_COURSES, course.id), cleanCourse);
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      throw error;
    }
  },

  deleteCourse: async (clientId: string, courseId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_COURSES, courseId));
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
      throw error;
    }
  },

  getCourses: async (clientId: string): Promise<Course[]> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const snapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_COURSES));
      return snapshot.docs.map(d => d.data() as Course);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      return [];
    }
  },

  // Enrollments
  saveEnrollment: async (clientId: string, enrollment: Enrollment): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      if (!enrollment.id) throw new Error("Enrollment ID required");
      const cleanEnrollment = JSON.parse(JSON.stringify(enrollment));
      await setDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENROLLMENTS, enrollment.id), cleanEnrollment);
    } catch (error) {
      console.error("Erro ao salvar matrícula:", error);
      throw error;
    }
  },

  deleteEnrollment: async (clientId: string, enrollmentId: string): Promise<void> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENROLLMENTS, enrollmentId));
    } catch (error) {
      console.error("Erro ao deletar matrícula:", error);
      throw error;
    }
  },

  getEnrollments: async (clientId: string): Promise<Enrollment[]> => {
    if (!clientId) throw new Error("Client ID required");
    try {
      const snapshot = await getDocs(collection(db, CLIENTS_COLLECTION, clientId, SUBCOL_ENROLLMENTS));
      return snapshot.docs.map(d => d.data() as Enrollment);
    } catch (error) {
      console.error("Erro ao buscar matrículas:", error);
      return [];
    }
  }
};
