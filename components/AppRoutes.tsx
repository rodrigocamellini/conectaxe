import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Member, CalendarEvent, Course, Enrollment, InventoryItem, 
  InventoryCategory, StockLog, Donation, CanteenItem, CanteenOrder, 
  User, StockUpdate, Ponto, Reza, Erva, Banho, SpiritualEntity
} from '../types';
import { INITIAL_MASTER_MENU_CONFIG } from '../constants';
import { UserService } from '../services/userService';
import { EntityService } from '../services/entityService';
import { CourseService } from '../services/courseService';

// Components
import { Dashboard } from './Dashboard';
import { MemberManagement } from './MemberManagement';
import { EntityManagement } from './EntityManagement';
import { MediumManagement } from './MediumManagement';
import { AttendanceManagement } from './AttendanceManagement';
import { InventoryManagement } from './InventoryManagement';
import { InventoryEntry } from './InventoryEntry';
import { InventoryDashboard } from './InventoryDashboard';
import { SystemConfigManagement } from './SystemConfigManagement';
import { UserManagement } from './UserManagement';
import { FinancialManagement } from './FinancialManagement';
import { FinancialLedger } from './FinancialLedger';
import { FinancialConfigComponent } from './FinancialConfig';
import { FinancialReports } from './FinancialReports';
import { PermissionManagement } from './PermissionManagement';
import { EntityImageManagement } from './EntityImageManagement';
import { AgendaManagement } from './AgendaManagement';
import { CourseManagement } from './CourseManagement';
import { EadPlatform } from './EadPlatform';
import { SaaSManager } from './SaaSManager';
import { DeveloperPortal } from './DeveloperPortal';
import { RestoreSystem } from './RestoreSystem';
import { BackupSystem } from './BackupSystem';
import { DonationManagement } from './DonationManagement';
import { TicketSystem } from './TicketSystem';
import { IDCardManagement } from './IDCardManagement';
import { CanteenManagement } from './CanteenManagement';
import { EventsManager } from './EventsModule/EventsManager';
import { HelpCenter } from './HelpCenter';
import { SafeMasterPortal } from './SafeMasterPortal';
import { MediaPontos } from './MediaPontos';
import { MediaRezas } from './MediaRezas';
import { MediaErvasBanhos } from './MediaErvasBanhos';
import { AffiliateSystem } from './AffiliateSystem';
import { RoadmapHistory } from './RoadmapHistory';

import { Layout } from './Layout';
import { Outlet } from 'react-router-dom';

const ProtectedLayout: React.FC = () => {
  const auth = useAuth();
  const { 
    systemConfig, setSystemConfig, 
    updateProfile,
    currentClient,
    roadmap
  } = useData();
  const [isSimulation, setIsSimulation] = useState(false);

  // Check for Blocked/Frozen Status
  // We check both systemConfig.license (loaded from local/server config) and currentClient (loaded from Firestore)
  const clientStatus = currentClient?.status || systemConfig.license?.status || 'active';
  const isBlocked = clientStatus === 'blocked' || clientStatus === 'frozen';

  // Allow Master to bypass block
  if (isBlocked && !auth.isMasterMode) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
          <div className="max-w-md text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
               <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-red-400">Acesso Suspenso</h1>
            <p className="text-slate-300 text-lg">
              {clientStatus === 'frozen' 
                ? 'Esta conta encontra-se congelada temporariamente.'
                : 'Esta conta encontra-se bloqueada.'}
            </p>
            <p className="text-slate-400">
              Entre em contato com o suporte para regularizar sua situação.
            </p>
            <button 
              onClick={() => auth.logout()}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      );
  }

  const latestVersion = React.useMemo(() => {
    if (!roadmap || roadmap.length === 0) return '0.0.0';
    const sorted = [...roadmap].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.version || '0.0.0';
  }, [roadmap]);
  
  // Dummy props for Layout since it handles routing internally now
  const handleLogout = async () => {
    await auth.logout();
  };

  return (
    <Layout
      user={auth.user!}
      config={systemConfig}
      onLogout={handleLogout}
      activeTab="" // Layout handles this via useLocation
      setActiveTab={() => {}} // Layout handles this via useNavigate
      onUpdateProfile={updateProfile}
      isMasterMode={auth.isMasterMode}
      enabledModules={currentClient?.enabledModules || systemConfig.enabledModules}
      systemVersion={latestVersion}
      isSimulation={isSimulation}
    >
      <Outlet />
    </Layout>
  );
};

import { generateUUID } from '../utils/ids';
import { MemberService } from '../services/memberService';
import { InventoryService } from '../services/inventoryService';
import { MediaService } from '../services/mediaService';
import { CanteenService } from '../services/canteenService';
import { EventService } from '../services/eventService';
import { FinancialService } from '../services/financialService';
import { AttendanceService } from '../services/AttendanceService';
import { IdCardService } from '../services/IdCardService';
import { SystemConfigService } from '../services/systemConfigService';

export const AppRoutes: React.FC<{ onStartTour?: () => void }> = ({ onStartTour }) => {
  const navigate = useNavigate();
  const handleTabChange = (tab: string) => navigate('/' + tab);
  const auth = useAuth();
  const { setAuth } = auth;
  const { 
    systemConfig, setSystemConfig,
    members, setMembers,
    events, setEvents,
    terreiroEvents, setTerreiroEvents,
    eventTickets, setEventTickets,
    courses, setCourses,
    enrollments, setEnrollments,
    inventoryItems, setInventoryItems,
    inventoryCategories, setInventoryCategories,
    stockLogs, setStockLogs,
    donations, setDonations,
    canteenItems, setCanteenItems,
    canteenOrders, setCanteenOrders,
    systemUsers, setSystemUsers,
    entities, setEntities,
    attendanceRecords, setAttendanceRecords,
    idCardLogs, setIdCardLogs,
    tickets, setTickets,
    plans, setPlans,
    roadmap, setRoadmap,
    broadcasts, setBroadcasts,
    userPermissions,
    currentClient,
    clients, setClients,
    coupons, setCoupons,
    auditLogs, setAuditLogs,
    globalMaintenance, setGlobalMaintenance,
    pontos, setPontos,
    rezas, setRezas,
    ervas, setErvas,
    banhos, setBanhos,
    referrals,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    activeClientId
  } = useData();

  // Helpers for Plan Limits
  const currentPlan = plans.find(p => p.name === (currentClient?.planName || systemConfig.license?.planName));

  const handleAddMember = async (m: Partial<Member>) => {
    const isConsulente = m.status === 'consulente' || m.isConsulente;
    const limits = currentPlan?.limits;
    
    if (!auth.isMasterMode && limits) {
      if (!isConsulente && limits.maxMembers != null) {
        const currentCount = members.filter(mem => mem.status !== 'consulente' && !mem.isConsulente).length;
        if (currentCount >= limits.maxMembers) {
          alert('Limite de cadastros de membros alcançado para o plano atual.');
          return;
        }
      }
      if (isConsulente && limits.maxConsulentes != null) {
        const currentCons = members.filter(mem => mem.status === 'consulente' || mem.isConsulente).length;
        if (currentCons >= limits.maxConsulentes) {
          alert('Limite de cadastros de consulentes alcançado para o plano atual.');
          return;
        }
      }
    }
    
    const newMember = await MemberService.createMember(m, members, false);
    setMembers([newMember, ...members]);
    if (currentClient?.id) await MemberService.saveMember(currentClient.id, newMember).catch(console.error);
  };

  const handleAddConsulente = async (m: Partial<Member>) => {
    // Similar logic but specifically for Consulentes route
    const limits = currentPlan?.limits;
    if (!auth.isMasterMode && limits && limits.maxConsulentes != null) {
        const currentCons = members.filter(mem => mem.status === 'consulente' || mem.isConsulente).length;
        if (currentCons >= limits.maxConsulentes) {
          alert('Limite de cadastros de consulentes alcançado para o plano atual.');
          return;
        }
    }
    
    const newConsulente = await MemberService.createMember(m, members, true);
    setMembers([newConsulente, ...members]);
    if (currentClient?.id) await MemberService.saveMember(currentClient.id, newConsulente).catch(console.error);
  };

  const handleUpdateMember = async (id: string, data: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...data } : m);
    setMembers(updated);
    const member = updated.find(m => m.id === id);
    if (currentClient?.id && member) await MemberService.saveMember(currentClient.id, member).catch(console.error);
  };

  const handleDeleteMember = async (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    if (currentClient?.id) await MemberService.deleteMember(currentClient.id, id).catch(console.error);
  };

  // Course Handlers
  const handleAddCourse = async (c: Partial<Course>) => {
    const newCourse = { ...c, id: generateUUID(), createdAt: new Date().toISOString() } as Course;
    setCourses([newCourse, ...courses]);
    if (currentClient?.id) await CourseService.saveCourse(currentClient.id, newCourse).catch(console.error);
  };
  const handleUpdateCourse = async (id: string, data: Partial<Course>) => {
    const updated = courses.map(c => c.id === id ? { ...c, ...data } : c);
    setCourses(updated);
    const item = updated.find(c => c.id === id);
    if (currentClient?.id && item) await CourseService.saveCourse(currentClient.id, item).catch(console.error);
  };
  const handleDeleteCourse = async (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    if (currentClient?.id) await CourseService.deleteCourse(currentClient.id, id).catch(console.error);
  };
  
  // Enrollment Handlers
  const handleEnroll = async (memberId: string, courseId: string) => {
      const newEnrollment: Enrollment = { 
          id: generateUUID(), 
          memberId, 
          courseId, 
          enrolledAt: new Date().toISOString(), 
          progress: [] 
      };
      setEnrollments([...enrollments, newEnrollment]);
      if (currentClient?.id) await CourseService.saveEnrollment(currentClient.id, newEnrollment).catch(console.error);
  };
  const handleUpdateEnrollment = async (id: string, data: Partial<Enrollment>) => {
      const updated = enrollments.map(e => e.id === id ? { ...e, ...data } : e);
      setEnrollments(updated);
      const item = updated.find(e => e.id === id);
      if (currentClient?.id && item) await CourseService.saveEnrollment(currentClient.id, item).catch(console.error);
  };
  
  const handleUpdateProgress = async (enrollmentId: string, lessonId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;
    
    const newProgress = enrollment.progress.includes(lessonId) 
        ? enrollment.progress.filter(id => id !== lessonId) 
        : [...enrollment.progress, lessonId];
    
    await handleUpdateEnrollment(enrollmentId, { progress: newProgress });
  };

  const handleCompleteCourse = async (enrollmentId: string) => {
      await handleUpdateEnrollment(enrollmentId, { completedAt: new Date().toISOString() });
  };
  
  // User Handlers
  const handleAddUser = async (u: Partial<User>) => {
    const newUser = { ...u, id: generateUUID() } as User;
    setSystemUsers([...systemUsers, newUser]);
    if (currentClient?.id) await UserService.saveUser(currentClient.id, newUser).catch(console.error);
  };
  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    const updated = systemUsers.map(u => u.id === id ? { ...u, ...data } : u);
    setSystemUsers(updated);
    const user = updated.find(u => u.id === id);
    if (currentClient?.id && user) await UserService.saveUser(currentClient.id, user).catch(console.error);
  };
  const handleDeleteUser = async (id: string) => {
    setSystemUsers(systemUsers.filter(u => u.id !== id));
    if (currentClient?.id) await UserService.deleteUser(currentClient.id, id).catch(console.error);
  };

  // Entity Handlers
  const handleAddEntity = async (entity: Partial<SpiritualEntity>) => {
    const newEntity: SpiritualEntity = { 
      id: entity.id || generateUUID(), 
      name: entity.name || '', 
      type: entity.type || 'entidade',
      imageUrl: entity.imageUrl
    };
    setEntities(prev => [...prev, newEntity]);
    if (currentClient?.id) await EntityService.saveEntity(currentClient.id, newEntity).catch(console.error);
  };
  const handleUpdateEntity = async (id: string, data: Partial<SpiritualEntity>) => { 
      const updated = entities.map(e => e.id === id ? { ...e, ...data } : e);
      setEntities(updated);
      const entity = updated.find(e => e.id === id);
      if (currentClient?.id && entity) {
        await EntityService.saveEntity(currentClient.id, entity).catch(err => {
          console.error("Erro ao salvar entidade:", err);
          alert("Erro ao salvar a imagem. Tente novamente ou use uma imagem menor.");
        });
      }
  };
  const handleDeleteEntity = async (id: string) => {
    setEntities(entities.filter(e => e.id !== id));
    if (currentClient?.id) await EntityService.deleteEntity(currentClient.id, id).catch(console.error);
  };

  // Canteen Handlers
  const handleAddCanteenItem = async (item: Partial<CanteenItem>) => {
    const newItem = { ...item, id: generateUUID() } as CanteenItem;
    setCanteenItems([newItem, ...canteenItems]);
    if (currentClient?.id) await CanteenService.saveItem(currentClient.id, newItem).catch(console.error);
  };
  const handleUpdateCanteenItem = async (id: string, data: Partial<CanteenItem>) => {
    const updated = canteenItems.map(i => i.id === id ? { ...i, ...data } : i);
    setCanteenItems(updated);
    const item = updated.find(i => i.id === id);
    if (currentClient?.id && item) await CanteenService.saveItem(currentClient.id, item).catch(console.error);
  };
  const handleDeleteCanteenItem = async (id: string) => {
    setCanteenItems(canteenItems.filter(i => i.id !== id));
    if (currentClient?.id) await CanteenService.deleteItem(currentClient.id, id).catch(console.error);
  };

  const handleAddCanteenOrder = async (order: CanteenOrder) => {
    setCanteenOrders([order, ...canteenOrders]);
    const updatedItems = canteenItems.map(item => {
        const soldItem = order.items.find(si => si.itemId === item.id);
        if(soldItem) return {...item, stock: Math.max(0, item.stock - soldItem.quantity)};
        return item;
    });
    setCanteenItems(updatedItems);
    
    if (currentClient?.id) {
        await CanteenService.saveOrder(currentClient.id, order).catch(console.error);
        const soldItems = updatedItems.filter(item => order.items.some(si => si.itemId === item.id));
        for (const item of soldItems) {
            await CanteenService.saveItem(currentClient.id, item).catch(console.error);
        }
    }
  };

  const handleDeleteCanteenOrder = async (id: string) => {
    const order = canteenOrders.find(o => o.id === id);
    if (!order) return;
    
    // Restore stock
    const updatedItems = canteenItems.map(item => {
        const soldItem = order.items.find(si => si.itemId === item.id);
        if(soldItem) return {...item, stock: item.stock + soldItem.quantity};
        return item;
    });
    setCanteenItems(updatedItems);
    setCanteenOrders(canteenOrders.filter(o => o.id !== id));

    if (currentClient?.id) {
        await CanteenService.deleteOrder(currentClient.id, id).catch(console.error);
        const restoredItems = updatedItems.filter(item => order.items.some(si => si.itemId === item.id));
        for (const item of restoredItems) {
            await CanteenService.saveItem(currentClient.id, item).catch(console.error);
        }
    }
  };

  // Check Module Helper
  const hasModule = (module: string) => {
    // Priority: Client Specific Modules -> Plan Modules -> System Config
    if (currentClient?.enabledModules && currentClient.enabledModules.length > 0) {
      return currentClient.enabledModules.includes(module);
    }
    if (currentPlan?.enabledModules) {
      return currentPlan.enabledModules.includes(module);
    }
    return true; // Fallback if no restriction found
  };

  // Media Handlers
  const handleAddPonto = async (p: Partial<Ponto>) => {
    const newPonto = { ...p, id: generateUUID() } as Ponto;
    setPontos([newPonto, ...pontos]);
    if (currentClient?.id) await MediaService.savePonto(currentClient.id, newPonto).catch(console.error);
  };
  const handleUpdatePonto = async (id: string, data: Partial<Ponto>) => {
    const updated = pontos.map(p => p.id === id ? { ...p, ...data } : p);
    setPontos(updated);
    const item = updated.find(p => p.id === id);
    if (currentClient?.id && item) await MediaService.savePonto(currentClient.id, item).catch(console.error);
  };
  const handleDeletePonto = async (id: string) => {
    setPontos(pontos.filter(p => p.id !== id));
    if (currentClient?.id) await MediaService.deletePonto(currentClient.id, id).catch(console.error);
  };

  const handleAddReza = async (r: Partial<Reza>) => {
    const newReza = { ...r, id: generateUUID() } as Reza;
    setRezas([newReza, ...rezas]);
    if (currentClient?.id) await MediaService.saveReza(currentClient.id, newReza).catch(console.error);
  };
  const handleUpdateReza = async (id: string, data: Partial<Reza>) => {
    const updated = rezas.map(r => r.id === id ? { ...r, ...data } : r);
    setRezas(updated);
    const item = updated.find(r => r.id === id);
    if (currentClient?.id && item) await MediaService.saveReza(currentClient.id, item).catch(console.error);
  };
  const handleDeleteReza = async (id: string) => {
    setRezas(rezas.filter(r => r.id !== id));
    if (currentClient?.id) await MediaService.deleteReza(currentClient.id, id).catch(console.error);
  };

  const handleAddErva = async (e: Partial<Erva>) => {
    const newErva = { ...e, id: generateUUID() } as Erva;
    setErvas([newErva, ...ervas]);
    if (currentClient?.id) await MediaService.saveErva(currentClient.id, newErva).catch(console.error);
  };
  const handleUpdateErva = async (id: string, data: Partial<Erva>) => {
    const updated = ervas.map(e => e.id === id ? { ...e, ...data } : e);
    setErvas(updated);
    const item = updated.find(e => e.id === id);
    if (currentClient?.id && item) await MediaService.saveErva(currentClient.id, item).catch(console.error);
  };
  const handleDeleteErva = async (id: string) => {
    setErvas(ervas.filter(e => e.id !== id));
    if (currentClient?.id) await MediaService.deleteErva(currentClient.id, id).catch(console.error);
  };

  const handleAddBanho = async (b: Partial<Banho>) => {
    const newBanho = { ...b, id: generateUUID() } as Banho;
    setBanhos([newBanho, ...banhos]);
    if (currentClient?.id) await MediaService.saveBanho(currentClient.id, newBanho).catch(console.error);
  };
  const handleUpdateBanho = async (id: string, data: Partial<Banho>) => {
    const updated = banhos.map(b => b.id === id ? { ...b, ...data } : b);
    setBanhos(updated);
    const item = updated.find(b => b.id === id);
    if (currentClient?.id && item) await MediaService.saveBanho(currentClient.id, item).catch(console.error);
  };
  const handleDeleteBanho = async (id: string) => {
    setBanhos(banhos.filter(b => b.id !== id));
    if (currentClient?.id) await MediaService.deleteBanho(currentClient.id, id).catch(console.error);
  };

  const handleAddEvent = async (e: CalendarEvent | Partial<CalendarEvent>) => {
    // Ensure id exists
    const newEvent = { ...e, id: e.id || generateUUID() } as CalendarEvent;
    setEvents(prev => [newEvent, ...prev]);
    if (currentClient?.id) await EventService.saveCalendarEvent(currentClient.id, newEvent).catch(console.error);
  };
  const handleUpdateEvent = async (id: string, data: Partial<CalendarEvent>) => {
    setEvents(prev => {
        const updated = prev.map(e => e.id === id ? { ...e, ...data } : e);
        const event = updated.find(e => e.id === id);
        if (currentClient?.id && event) {
             EventService.saveCalendarEvent(currentClient.id, event).catch(console.error);
        }
        return updated;
    });
  };
  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (currentClient?.id) await EventService.deleteCalendarEvent(currentClient.id, id).catch(console.error);
  };

  // Attendance Handlers
  const handleSaveAttendanceRecord = async (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
        const idx = prev.findIndex(r => r.id === record.id);
        if (idx >= 0) {
            const newArr = [...prev];
            newArr[idx] = record;
            return newArr;
        }
        return [...prev, record];
    });
    
    if (currentClient?.id) {
        await AttendanceService.saveRecord(currentClient.id, record).catch(console.error);
    }
  };

  const handleDeleteAttendanceRecord = async (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    if (currentClient?.id) {
        await AttendanceService.deleteRecord(currentClient.id, recordId).catch(console.error);
    }
  };
  
  const handleBatchSaveAttendance = async (records: AttendanceRecord[]) => {
      setAttendanceRecords(prev => {
          const newPrev = [...prev];
          records.forEach(r => {
             const idx = newPrev.findIndex(ex => ex.id === r.id);
             if (idx >= 0) newPrev[idx] = r;
             else newPrev.push(r);
          });
          return newPrev;
      });

      if (currentClient?.id) {
          await Promise.all(records.map(r => AttendanceService.saveRecord(currentClient!.id, r)));
      }
  };

  // ID Card Handlers
  const handleSaveIDCardLog = async (log: IDCardLog) => {
      setIdCardLogs(prev => [log, ...prev]);
      if (currentClient?.id) {
          await IdCardService.saveLog(currentClient.id, log).catch(console.error);
      }
  };

  const handleBatchSaveIDCardLogs = async (logs: IDCardLog[]) => {
      setIdCardLogs(prev => [...logs, ...prev]);
      if (currentClient?.id) {
          await Promise.all(logs.map(l => IdCardService.saveLog(currentClient!.id, l)));
      }
  };

  // Config Handler
  const handleUpdateSystemConfig = async (newConfig: SystemConfig) => {
      setSystemConfig(newConfig);
      if (currentClient?.id) {
          await SystemConfigService.saveConfig(currentClient.id, newConfig).catch(console.error);
      }
  };

  // Inventory Handlers
  const handleAddInventoryItem = async (partial: Partial<InventoryItem>) => {
    const newItem = InventoryService.createItem(partial);
    setInventoryItems([newItem, ...inventoryItems]);
    if (currentClient?.id) await InventoryService.saveItem(currentClient.id, newItem).catch(console.error);
  };
  const handleDeleteInventoryItem = async (id: string) => {
    setInventoryItems(inventoryItems.filter(i => i.id !== id));
    if (currentClient?.id) await InventoryService.deleteItem(currentClient.id, id).catch(console.error);
  };
  const handleAddInventoryCategory = async (name: string) => {
    const newCategory = InventoryService.createCategory(name);
    setInventoryCategories([...inventoryCategories, newCategory]);
    if (currentClient?.id) await InventoryService.saveCategory(currentClient.id, newCategory).catch(console.error);
  };
  const handleDeleteInventoryCategory = async (id: string) => {
    setInventoryCategories(inventoryCategories.filter(c => c.id !== id));
    if (currentClient?.id) await InventoryService.deleteCategory(currentClient.id, id).catch(console.error);
  };
  const processInventoryEntry = async (updates: StockUpdate[]) => {
    if (!auth.user?.name) return;
    const { updatedItems, newLogs } = InventoryService.processStockUpdates(updates, inventoryItems, auth.user.name);
    
    setInventoryItems(updatedItems);
    setStockLogs([...newLogs, ...stockLogs]);

    if (currentClient?.id) {
        // Save updated items
        for (const item of updatedItems) {
            const original = inventoryItems.find(i => i.id === item.id);
            if (original && original.currentStock !== item.currentStock) {
                await InventoryService.saveItem(currentClient.id, item).catch(console.error);
            }
        }
        // Save logs
        for (const log of newLogs) {
            await InventoryService.saveLog(currentClient.id, log).catch(console.error);
        }
    }
  };

  // Financial Handlers
  const handleUpdatePayment = async (memberId: string, monthKey: string, status: 'paid' | 'pending' | 'partial' | 'late') => {
      setMembers(prev => {
          const updated = prev.map(m => m.id === memberId ? { ...m, monthlyPayments: { ...(m.monthlyPayments || {}), [monthKey]: status } } : m);
          const member = updated.find(m => m.id === memberId);
          if (currentClient?.id && member) {
              MemberService.saveMember(currentClient.id, member).catch(console.error);
          }
          return updated;
      });
  };
  const handleAddTransactionWrapper = async (t: FinancialTransaction) => {
      const newTransaction = { ...t, id: t.id || generateUUID() } as FinancialTransaction;
      // Use context addTransaction to update state if needed, or just setTransactions
      // context addTransaction might be just a state setter wrapper
      if (addTransaction) addTransaction(newTransaction); 
      // Also persist
      if (currentClient?.id) await FinancialService.saveTransaction(currentClient.id, newTransaction).catch(console.error);
  };
  const handleUpdateTransactionWrapper = async (id: string, data: Partial<FinancialTransaction>) => {
      if (updateTransaction) updateTransaction(id, data);
      // Persist
      // We need the full object to save. 
      const existing = transactions.find(t => t.id === id);
      if (existing && currentClient?.id) {
          await FinancialService.saveTransaction(currentClient.id, { ...existing, ...data }).catch(console.error);
      }
  };
  const handleDeleteTransactionWrapper = async (id: string) => {
      if (deleteTransaction) deleteTransaction(id);
      if (currentClient?.id) await FinancialService.deleteTransaction(currentClient.id, id).catch(console.error);
  };

  const handleAddDonation = async (d: Donation) => {
      setDonations([...donations, d]);
      if (currentClient?.id) await FinancialService.saveDonation(currentClient.id, d).catch(console.error);
  };
  const handleDeleteDonation = async (id: string) => {
      setDonations(donations.filter(d => d.id !== id));
      if (currentClient?.id) await FinancialService.deleteDonation(currentClient.id, id).catch(console.error);
  };

  const fullSystemData = {
    members,
    events,
    terreiroEvents,
    courses,
    enrollments,
    inventoryItems,
    inventoryCategories,
    stockLogs,
    donations,
    canteenItems,
    canteenOrders,
    systemUsers,
    entities,
    attendanceRecords,
    idCardLogs,
    tickets,
    pontos,
    rezas,
    ervas,
    banhos,
    referrals,
    transactions,
    systemConfig
  };

  return (
    <Routes>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <Dashboard members={members} config={systemConfig} events={events} terreiroEvents={terreiroEvents} roadmap={roadmap || []} broadcasts={broadcasts} />
        } />

        {/* Agenda */}
        {hasModule('agenda') && (
          <Route path="/agenda" element={
            <AgendaManagement 
              events={events} 
              members={members} 
              config={systemConfig} 
              user={auth.user!} 
              onAddEvent={handleAddEvent} 
              onUpdateEvent={handleUpdateEvent} 
              onDeleteEvent={handleDeleteEvent} 
            />
          } />
        )}

        {/* Gestão de Eventos */}
        {hasModule('gestao_eventos') && (
          <>
            <Route path="/events-list" element={<EventsManager events={terreiroEvents} tickets={eventTickets} config={systemConfig} onUpdateEvents={setTerreiroEvents} onUpdateTickets={setEventTickets} />} />
            <Route path="/events-checkin" element={<EventsManager events={terreiroEvents} tickets={eventTickets} config={systemConfig} onUpdateEvents={setTerreiroEvents} onUpdateTickets={setEventTickets} />} />
          </>
        )}

        {/* Cursos / EAD */}
        {hasModule('cursos') && (
            <>
                {hasModule('cursos_ead') && (
                    <Route path="/ead" element={
                        <EadPlatform 
                            user={auth.user!} 
                            members={members} 
                            courses={courses} 
                            enrollments={enrollments} 
                            config={systemConfig} 
                            onEnroll={handleEnroll} 
                            onUpdateProgress={handleUpdateProgress} 
                            onCompleteCourse={handleCompleteCourse} 
                        />
                    } />
                )}
                {hasModule('cursos_gestao') && (
                    <Route path="/course-mgmt" element={
                        <CourseManagement 
                            courses={courses} 
                            members={members} 
                            enrollments={enrollments} 
                            config={systemConfig} 
                            onAddCourse={handleAddCourse} 
                            onUpdateCourse={handleUpdateCourse} 
                            onDeleteCourse={handleDeleteCourse} 
                            onUpdateConfig={setSystemConfig} 
                        />
                    } />
                )}
            </>
        )}

        {/* Cantina */}
        {hasModule('cantina_pdv') && (
             <Route path="/cantina_pdv" element={
                <CanteenManagement activeTab="cantina_pdv" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={handleAddCanteenItem} onUpdateItem={handleUpdateCanteenItem} onDeleteItem={handleDeleteCanteenItem} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
             } />
        )}
        {hasModule('cantina_gestao') && (
             <Route path="/cantina_gestao" element={
                <CanteenManagement activeTab="cantina_gestao" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={handleAddCanteenItem} onUpdateItem={handleUpdateCanteenItem} onDeleteItem={handleDeleteCanteenItem} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
             } />
        )}
        {hasModule('cantina_historico') && (
             <Route path="/cantina_historico" element={
                <CanteenManagement activeTab="cantina_historico" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={handleAddCanteenItem} onUpdateItem={handleUpdateCanteenItem} onDeleteItem={handleDeleteCanteenItem} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
             } />
        )}


        {/* Membros */}
        <Route path="/members" element={
            <MemberManagement 
                members={members} 
                entities={entities} 
                permissions={userPermissions?.members || { view: true, add: true, edit: true, delete: true }} 
                config={systemConfig} 
                currentUser={auth.user!} 
                onAddMember={handleAddMember} 
                onUpdateMember={handleUpdateMember} 
                onDeleteMember={handleDeleteMember} 
            />
        } />

        <Route path="/consulentes" element={
            <MemberManagement 
                members={members.filter(m => m.status === 'consulente' || m.isConsulente)} 
                entities={entities} 
                permissions={userPermissions?.members || { view: true, add: true, edit: true, delete: true }} 
                config={systemConfig} 
                currentUser={auth.user!} 
                onAddMember={handleAddConsulente} 
                onUpdateMember={(id, data) => handleUpdateMember(id, { ...data, isConsulente: data.isConsulente ?? true })}
                onDeleteMember={handleDeleteMember} 
                mode="consulente" 
            />
        } />

        <Route path="/mediums" element={
            <MediumManagement members={members} entities={entities} config={systemConfig} onUpdateMemberSpiritualInfo={(mid, eids, enms) => setMembers(members.map(m => m.id === mid ? { ...m, assignedEntities: eids, entityNames: enms } : m))} />
        } />

        <Route path="/idcards" element={
          <IDCardManagement 
            members={members} 
            entities={entities} 
            logs={idCardLogs} 
            config={systemConfig} 
            currentUser={auth.user!}
            onSaveLog={handleSaveIDCardLog}
            onBatchSave={handleBatchSaveIDCardLogs}
            onUpdateConfig={handleUpdateSystemConfig}
          />
        } />

        <Route path="/attendance" element={
            <AttendanceManagement members={members} attendanceRecords={attendanceRecords} config={systemConfig} onUpdateAttendance={setAttendanceRecords} />
        } />

        {/* Estoque */}
        {hasModule('estoque') && (
            <>
                {hasModule('estoque_dashboard') && <Route path="/inventory-dashboard" element={<InventoryDashboard items={inventoryItems} categories={inventoryCategories} config={systemConfig} />} />}
                {hasModule('estoque_gestao') && <Route path="/inventory" element={<InventoryManagement items={inventoryItems} categories={inventoryCategories} logs={stockLogs} config={systemConfig} onAddCategory={handleAddInventoryCategory} onDeleteCategory={handleDeleteInventoryCategory} onDeleteItem={handleDeleteInventoryItem} onAddItem={handleAddInventoryItem} />} />}
                {hasModule('estoque_movimentacao') && <Route path="/inventory-entry" element={<InventoryEntry items={inventoryItems} categories={inventoryCategories} onSaveUpdates={processInventoryEntry} />} />}
            </>
        )}

        {/* Financeiro */}
        {hasModule('financeiro') && (
            <>
                {hasModule('financeiro_mensalidades') && <Route path="/mensalidades" element={<FinancialManagement members={members} config={systemConfig} onUpdatePayment={handleUpdatePayment} transactions={transactions} onAddTransaction={handleAddTransactionWrapper} />} />}
                {hasModule('financeiro_fluxo') && <Route path="/cash-flow" element={<FinancialLedger transactions={transactions} onAddTransaction={handleAddTransactionWrapper} onUpdateTransaction={handleUpdateTransactionWrapper} onDeleteTransaction={handleDeleteTransactionWrapper} config={systemConfig} />} />}
                {hasModule('financeiro_doacoes') && <Route path="/donations" element={<DonationManagement donations={donations} inventoryItems={inventoryItems} config={systemConfig} onAddDonation={handleAddDonation} onDeleteDonation={handleDeleteDonation} />} />}
                {hasModule('financeiro_relatorios') && <Route path="/finance-reports" element={<FinancialReports members={members} donations={donations} canteenOrders={canteenOrders} config={systemConfig} transactions={transactions} />} />}
                {hasModule('financeiro_config') && <Route path="/finance-config" element={<FinancialConfigComponent config={systemConfig} onUpdateConfig={setSystemConfig} />} />}
            </>
        )}

        {/* Mídia */}
        {hasModule('midia') && (
          <>
            {hasModule('midia_pontos') && (
              <Route path="/media-pontos" element={
                <MediaPontos 
                  pontos={pontos} 
                  config={systemConfig} 
                  onAddPonto={handleAddPonto} 
                  onUpdatePonto={handleUpdatePonto} 
                  onDeletePonto={handleDeletePonto} 
                  activeTab="media-pontos"
                />
              } />
            )}
            {hasModule('midia_rezas') && (
              <Route path="/media-rezas" element={
                <MediaRezas 
                  rezas={rezas} 
                  config={systemConfig} 
                  onAddReza={handleAddReza} 
                  onUpdateReza={handleUpdateReza} 
                  onDeleteReza={handleDeleteReza} 
                  activeTab="media-rezas"
                />
              } />
            )}
            {hasModule('midia_ervas') && (
              <Route path="/media-ervas" element={
                <MediaErvasBanhos 
                  ervas={ervas} 
                  banhos={banhos} 
                  config={systemConfig} 
                  onAddErva={handleAddErva} 
                  onUpdateErva={handleUpdateErva} 
                  onDeleteErva={handleDeleteErva} 
                  onAddBanho={handleAddBanho} 
                  onUpdateBanho={handleUpdateBanho} 
                  onDeleteBanho={handleDeleteBanho} 
                  activeTab="media-ervas"
                />
              } />
            )}
          </>
        )}

        {/* Afiliados */}
        <Route path="/indicacoes" element={
          <AffiliateSystem 
            config={systemConfig} 
            referrals={referrals} 
            activeTab="indicacoes" 
            planName={currentClient?.planName || systemConfig.license?.planName}
          />
        } />

        {/* Configurações e Admin */}
        <Route path="/layout" element={<SystemConfigManagement config={systemConfig} onUpdateConfig={setSystemConfig} />} />
        <Route path="/users" element={<UserManagement users={systemUsers} config={systemConfig} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onUpdateConfig={setSystemConfig} />} />
        <Route path="/entities" element={<EntityManagement entities={entities} permissions={userPermissions?.entities || { view: true, add: true, edit: true, delete: true }} config={systemConfig} onUpdateConfig={setSystemConfig} onAddEntity={handleAddEntity} onDeleteEntity={handleDeleteEntity} />} />
        <Route path="/entity-images" element={<EntityImageManagement entities={entities} config={systemConfig} onUpdateEntity={handleUpdateEntity} onAddEntity={handleAddEntity} />} />
        <Route path="/permissions" element={<PermissionManagement config={systemConfig} onUpdateConfig={setSystemConfig} />} />
        
        <Route path="/backup" element={
          <BackupSystem 
            user={auth.user!} 
            config={systemConfig} 
            currentData={fullSystemData} 
            onRestoreFromBackup={d => alert("Restauração desativada na versão Nuvem.")} 
            allowAutoBackup={hasModule('mod_backup_auto')} 
            onUpdateConfig={setSystemConfig}
            clientId={activeClientId || systemConfig.license?.clientId}
            planName={currentPlan?.name || systemConfig.license?.planName}
          />
        } />
        <Route path="/restore-system" element={<RestoreSystem user={auth.user!} config={systemConfig} onRestore={() => alert("Reset de fábrica desativado na versão Nuvem.")} />} />
        <Route path="/saas-manager" element={<SaaSManager config={systemConfig} onUpdateConfig={setSystemConfig} isMasterMode={auth.isMasterMode} clientData={currentClient} />} />
        
        {/* Ajuda */}
        <Route path="/help-center" element={<HelpCenter onStartTour={onStartTour || (() => {})} />} />
        
        <Route path="/support-client" element={
          <TicketSystem 
            user={auth.user!} 
            config={systemConfig} 
            tickets={tickets} 
            onUpdateTickets={setTickets} 
          />
        } />

        {/* Central de Avisos e Novidades */}
        <Route path="/news-announcements" element={
          <RoadmapHistory 
            roadmap={roadmap || []} 
            broadcasts={broadcasts} 
            clientId={systemConfig.license?.clientId || 'default'} 
          />
        } />

        {/* Developer Portal Routes */}
        <Route path="/developer-portal" element={
          <DeveloperPortal 
            onLogout={() => {
              auth.logout();
            }}
            onEnterClientSystem={client => {
              setAuth({ ...auth, isMasterMode: false });
              // Logic to switch context to client would go here
            }}
            referrals={referrals}
            onUpdateReferral={(id, status) => { /* Implement update logic */ }}
            clients={clients}
            onUpdateClients={setClients}
            plans={plans}
            onUpdatePlans={setPlans}
            maintConfig={globalMaintenance}
            onUpdateMaintenance={setGlobalMaintenance}
            tickets={tickets}
            onUpdateTickets={setTickets}
            broadcasts={broadcasts}
            onUpdateBroadcasts={setBroadcasts}
            roadmap={roadmap}
            onUpdateRoadmap={setRoadmap}
            coupons={coupons}
            onUpdateCoupons={setCoupons}
            auditLogs={auditLogs}
            onAddAuditLog={log => setAuditLogs([log as any, ...auditLogs])}
              onClearAuditLogs={() => setAuditLogs([])}
              systemConfig={systemConfig}
              onUpdateSystemConfig={setSystemConfig}
              externalTab="clients"
            />
          } />
        {/* Map other master menu items to DeveloperPortal with externalTab */}
        {['master-payments', 'master-affiliates', 'system-maintenance', 'master-backups', 'master-audit', 'tickets', 'master-broadcast', 'master-roadmap', 'master-homepage', 'master-system-config', 'master-coupons', 'master-menu'].map(path => (
          <Route key={path} path={`/${path}`} element={
            <DeveloperPortal 
              onLogout={() => {
                auth.logout();
              }}
              onEnterClientSystem={client => {
                setAuth({ ...auth, isMasterMode: false });
              }}
              referrals={referrals}
              onUpdateReferral={(id, status) => { /* Implement update logic */ }}
              clients={clients}
              onUpdateClients={setClients}
              plans={plans}
              onUpdatePlans={setPlans}
              maintConfig={globalMaintenance}
              onUpdateMaintenance={setGlobalMaintenance}
              tickets={tickets}
              onUpdateTickets={setTickets}
              broadcasts={broadcasts}
              onUpdateBroadcasts={setBroadcasts}
              roadmap={roadmap}
              onUpdateRoadmap={setRoadmap}
              coupons={coupons}
              onUpdateCoupons={setCoupons}
              auditLogs={auditLogs}
              onAddAuditLog={log => setAuditLogs([log as any, ...auditLogs])}
              onClearAuditLogs={() => setAuditLogs([])}
              systemConfig={systemConfig}
              onUpdateSystemConfig={setSystemConfig}
              externalTab={path}
            />
          } />
        ))}
        
        {/* Fallback */}
        <Route path="*" element={
          auth.isMasterMode 
            ? <Navigate to="/developer-portal" replace /> 
            : <Navigate to="/dashboard" replace />
        } />
      </Route>
    </Routes>
  );
};
