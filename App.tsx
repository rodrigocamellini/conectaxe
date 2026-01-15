
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, Member, User, SpiritualEntity, InventoryItem, InventoryCategory, SystemConfig, CalendarEvent, Course, Enrollment, AttendanceRecord, SaaSClient, PaymentStatus, Donation, Referral, ReferralStatus, SaaSPlan, GlobalMaintenanceConfig, SupportTicket, IDCardLog, StockLog, GlobalBroadcast, ReleaseNote, GlobalCoupon, MasterAuditLog, CanteenItem, CanteenOrder } from './types';
import { INITIAL_USERS, DEFAULT_AVATAR, DEFAULT_SYSTEM_CONFIG, DEFAULT_LOGO_URL, INITIAL_ENTITIES, DEFAULT_ENTITY_IMAGES } from './constants';
import { storage, STORAGE_KEYS } from './services/storage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MemberManagement } from './components/MemberManagement';
import { EntityManagement } from './components/EntityManagement';
import { MediumManagement } from './components/MediumManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { InventoryEntry } from './components/InventoryEntry';
import { InventoryDashboard } from './components/InventoryDashboard';
import { SystemConfigManagement } from './components/SystemConfigManagement';
import { UserManagement } from './components/UserManagement';
import { FinancialManagement } from './components/FinancialManagement';
import { FinancialConfigComponent } from './components/FinancialConfig';
import { FinancialReports } from './components/FinancialReports';
import { PermissionManagement } from './components/PermissionManagement';
import { EntityImageManagement } from './components/EntityImageManagement';
import { AgendaManagement } from './components/AgendaManagement';
import { CourseManagement } from './components/CourseManagement';
import { EadPlatform } from './components/EadPlatform';
import { SaaSManager } from './components/SaaSManager'; 
import { DeveloperPortal } from './components/DeveloperPortal'; 
import { RestoreSystem } from './components/RestoreSystem';
import { BackupSystem } from './components/BackupSystem';
import { DonationManagement } from './components/DonationManagement';
import { AffiliateSystem } from './components/AffiliateSystem';
import { TicketSystem } from './components/TicketSystem';
import { EcosystemPreview } from './components/EcosystemPreview';
import { IDCardManagement } from './components/IDCardManagement';
import { RoadmapHistory } from './components/RoadmapHistory';
import { CanteenManagement } from './components/CanteenManagement';
import { MenuManager } from './components/MenuManager';
import { LogIn, ShieldAlert, Snowflake, Layers, Wrench, Clock, AlertCircle } from 'lucide-react';
import { isAfter, format, isValid } from 'date-fns';

const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  { id: 'p_teste', name: 'Plano de Teste', price: 0, durationDays: 10 },
  { id: 'p_mensal', name: 'Plano Mensal', price: 49.90, durationDays: 30 },
  { id: 'p_trimestral', name: 'Plano Trimestral', price: 135.00, durationDays: 90 },
  { id: 'p_semestral', name: 'Plano Semestral', price: 250.00, durationDays: 180 },
  { id: 'p_anual', name: 'Plano Anual', price: 450.00, durationDays: 365 },
  { id: 'p_vitalicio', name: 'Plano Vitalício', price: 1500.00, durationDays: null },
  { id: 'p_cortesia', name: 'Plano Cortesia', price: 0, durationDays: 30 },
];

const App: React.FC = () => {
  const [systemUsers, setSystemUsers] = useState<User[]>(() => storage.get<User[]>('terreiro_system_users') || INITIAL_USERS);
  const [auth, setAuth] = useState<AuthState>(() => storage.get<AuthState>(STORAGE_KEYS.AUTH) || { user: null, isAuthenticated: false, isMasterMode: false });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEcosystemConcept, setShowEcosystemConcept] = useState(false);
  
  const [members, setMembers] = useState<Member[]>(() => storage.get<Member[]>(STORAGE_KEYS.MEMBERS) || []);
  const [entities, setEntities] = useState<SpiritualEntity[]>(() => {
    const saved = storage.get<SpiritualEntity[]>(STORAGE_KEYS.ENTITIES);
    const base = saved && saved.length > 0 ? saved : INITIAL_ENTITIES;
    return base.map(entity => {
      if (entity.imageUrl) {
        return entity;
      }
      const defaultImage = DEFAULT_ENTITY_IMAGES[entity.id];
      if (defaultImage) {
        return { ...entity, imageUrl: defaultImage };
      }
      return entity;
    });
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => storage.get<CalendarEvent[]>('terreiro_events') || []);
  const [courses, setCourses] = useState<Course[]>(() => storage.get<Course[]>('terreiro_courses') || []);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => storage.get<Enrollment[]>('terreiro_enrollments') || []);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => storage.get<AttendanceRecord[]>('terreiro_attendance') || []);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => storage.get<InventoryItem[]>('terreiro_inventory_items') || []);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>(() => storage.get<InventoryCategory[]>('terreiro_inventory_cats') || []);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => storage.get<StockLog[]>('terreiro_stock_logs') || []);
  const [donations, setDonations] = useState<Donation[]>(() => storage.get<Donation[]>('terreiro_donations') || []);
  const [referrals, setReferrals] = useState<Referral[]>(() => storage.get<Referral[]>('terreiro_referrals') || []);
  const [tickets, setTickets] = useState<SupportTicket[]>(() => storage.get<SupportTicket[]>('terreiro_tickets') || []);
  const [idCardLogs, setIdCardLogs] = useState<IDCardLog[]>(() => storage.get<IDCardLog[]>('terreiro_idcard_logs') || []);
  const [plans, setPlans] = useState<SaaSPlan[]>(() => storage.get<SaaSPlan[]>('saas_master_plans') || INITIAL_SAAS_PLANS);
  const [clients, setClients] = useState<SaaSClient[]>(() => storage.get<SaaSClient[]>('saas_master_clients') || []);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => storage.get<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG) || DEFAULT_SYSTEM_CONFIG);

  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>(() => storage.get<CanteenItem[]>('terreiro_canteen_items') || []);
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>(() => storage.get<CanteenOrder[]>('terreiro_canteen_orders') || []);

  const [broadcasts, setBroadcasts] = useState<GlobalBroadcast[]>(() => storage.get<GlobalBroadcast[]>('saas_global_broadcasts') || []);
  const [roadmap, setRoadmap] = useState<ReleaseNote[]>(() => storage.get<ReleaseNote[]>('saas_global_roadmap') || []);
  const [coupons, setCoupons] = useState<GlobalCoupon[]>(() => storage.get<GlobalCoupon[]>('saas_global_coupons') || []);
  const [auditLogs, setAuditLogs] = useState<MasterAuditLog[]>(() => storage.get<MasterAuditLog[]>('saas_master_audit_logs') || []);

  const [globalMaintenance, setGlobalMaintenance] = useState<GlobalMaintenanceConfig>(() => {
    const saved = localStorage.getItem('saas_global_maintenance');
    return saved ? JSON.parse(saved) : { active: false, message: 'Estamos em manutenção para melhorias técnicas. Voltaremos em breve!' };
  });

  const licenseState = useMemo(() => {
    if (!auth.isAuthenticated || auth.isMasterMode) return { valid: true, status: 'active' as const };
    const client = clients.find(c => c.adminEmail.toLowerCase() === auth.user?.email.toLowerCase());
    if (client) {
      if (client.status === 'blocked') return { valid: false, status: 'blocked' as const };
      if (client.status === 'frozen') return { valid: false, status: 'frozen' as const };
      const expiry = new Date(client.expirationDate + 'T23:59:59');
      const isValidLicense = isAfter(expiry, new Date()); 
      return { valid: isValidLicense, status: isValidLicense ? 'active' : 'expired' } as const;
    }
    return { valid: true, status: 'active' } as const;
  }, [clients, auth]);

  const currentClient = useMemo(() => {
    if (!auth.isAuthenticated || auth.isMasterMode) return null;
    return clients.find(c => c.adminEmail.toLowerCase() === auth.user?.email.toLowerCase());
  }, [clients, auth]);

  const userPermissions = useMemo(() => {
    if (!auth.user) return null;
    if (auth.user.role === 'admin' || auth.isMasterMode) return { view: true, add: true, edit: true, delete: true };
    return systemConfig.rolePermissions?.[auth.user.role]?.[activeTab] || { view: false, add: false, edit: false, delete: false };
  }, [auth.user, activeTab, systemConfig.rolePermissions, auth.isMasterMode]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.MEMBERS, members);
    storage.set(STORAGE_KEYS.ENTITIES, entities);
    storage.set('terreiro_events', events);
    storage.set('terreiro_courses', courses);
    storage.set('terreiro_enrollments', enrollments);
    storage.set('terreiro_attendance', attendanceRecords);
    storage.set('terreiro_inventory_items', inventoryItems);
    storage.set('terreiro_inventory_cats', inventoryCategories);
    storage.set('terreiro_stock_logs', stockLogs);
    storage.set('terreiro_donations', donations);
    storage.set('terreiro_system_users', systemUsers);
    storage.set('terreiro_referrals', referrals);
    storage.set('terreiro_tickets', tickets);
    storage.set('terreiro_idcard_logs', idCardLogs);
    storage.set('saas_master_clients', clients);
    storage.set('saas_master_plans', plans);
    storage.set('saas_global_broadcasts', broadcasts);
    storage.set('saas_global_roadmap', roadmap);
    storage.set('saas_global_coupons', coupons);
    storage.set('saas_master_audit_logs', auditLogs);
    storage.set('terreiro_canteen_items', canteenItems);
    storage.set('terreiro_canteen_orders', canteenOrders);
    storage.set(STORAGE_KEYS.AUTH, auth);
    storage.set(STORAGE_KEYS.SYSTEM_CONFIG, systemConfig);
  }, [members, entities, events, courses, enrollments, attendanceRecords, inventoryItems, inventoryCategories, stockLogs, donations, systemUsers, referrals, tickets, idCardLogs, clients, plans, auth, systemConfig, broadcasts, roadmap, coupons, auditLogs, canteenItems, canteenOrders]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', systemConfig.primaryColor);
    root.style.setProperty('--sidebar-color', systemConfig.sidebarColor);
    root.style.setProperty('--accent-color', systemConfig.accentColor);
  }, [systemConfig]);

  const handleEnterClientSystem = (client: SaaSClient) => {
    if (auth.isMasterMode) {
      const newAudit: MasterAuditLog = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString(),
        masterEmail: auth.user?.email || 'rodrigo@dev.com',
        clientId: client.id,
        clientName: client.name,
        action: 'Acesso Técnico Master à Instância'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }

    setSystemConfig(prev => ({
      ...prev, systemName: client.name,
      license: { 
        status: client.status, 
        expirationDate: client.expirationDate, 
        planName: client.plan, 
        supportContact: 'rodrigo@dev.com', 
        paymentLink: '#', 
        affiliateLink: client.affiliateLink, 
        affiliateBlocked: client.affiliateBlocked,
        clientId: client.id
      }
    }));
    setActiveTab('dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedMaster = localStorage.getItem('saas_master_credentials');
    const master = savedMaster ? JSON.parse(savedMaster) : { email: 'rodrigo@dev.com', password: 'master' };
    
    if (loginEmail.toLowerCase() === master.email.toLowerCase() && loginPassword === master.password) {
      setAuth({ user: { id: 'master', name: 'Rodrigo Master', email: master.email, role: 'admin', password: master.password }, isAuthenticated: true, isMasterMode: true });
      setActiveTab('developer-portal');
      return;
    }

    if (globalMaintenance.active) {
      setLoginError('SISTEMA EM MANUTENÇÃO GERAL. ACESSO SUSPENSO TEMPORARIAMENTE.');
      return;
    }
    
    const clientAdmin = clients.find(c => c.adminEmail.toLowerCase() === loginEmail.toLowerCase() && c.adminPassword === loginPassword);
    if (clientAdmin) {
      const updatedClients = clients.map(c => 
        c.id === clientAdmin.id ? { ...c, lastActivity: new Date().toISOString() } : c
      );
      setClients(updatedClients);
      const user: User = { id: clientAdmin.id, email: clientAdmin.adminEmail, name: clientAdmin.adminName, role: 'admin', password: clientAdmin.adminPassword };
      setAuth({ user, isAuthenticated: true, isMasterMode: false });
      handleEnterClientSystem(clientAdmin);
      return;
    }

    const user = systemUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (user) {
      setAuth({ user, isAuthenticated: true, isMasterMode: false });
      setActiveTab('dashboard');
    } else { 
      setLoginError('Acesso Negado. Verifique e-mail e senha.'); 
    }
  };

  if (showEcosystemConcept) {
    return <EcosystemPreview onBack={() => setShowEcosystemConcept(false)} />;
  }

  if (!licenseState.valid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-12 text-center">
          {licenseState.status === 'frozen' ? (
            <><Snowflake size={64} className="text-blue-400 mx-auto mb-6 animate-pulse" /><h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acesso Congelado</h1><p className="text-slate-500 mb-8 font-medium">Seu acesso foi temporariamente suspenso a pedido da administração.</p></>
          ) : (
            <><ShieldAlert size={64} className="text-red-600 mx-auto mb-6" /><h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acesso Bloqueado</h1><p className="text-slate-500 mb-8 font-medium">Sua licença expirou ou foi suspensa.</p></>
          )}
          <button onClick={() => setAuth({ user: null, isAuthenticated: false })} className="text-indigo-600 font-bold uppercase text-xs hover:underline">Sair do Sistema</button>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <Layout user={auth.user!} config={systemConfig} onLogout={() => setAuth({ user: null, isAuthenticated: false })} activeTab={activeTab} setActiveTab={setActiveTab} isMasterMode={auth.isMasterMode}>
        {activeTab === 'dashboard' && <Dashboard members={members} config={systemConfig} events={events} roadmap={roadmap} broadcasts={broadcasts} />}
        {activeTab === 'agenda' && <AgendaManagement events={events} members={members} config={systemConfig} user={auth.user!} onAddEvent={e => setEvents(prev => [e as CalendarEvent, ...prev])} onUpdateEvent={(id, data) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))} onDeleteEvent={id => setEvents(prev => prev.filter(e => e.id !== id))} />}
        {activeTab === 'ead' && <EadPlatform user={auth.user!} members={members} courses={courses} enrollments={enrollments} config={systemConfig} onEnroll={(mid, cid) => setEnrollments([...enrollments, { id: Math.random().toString(), memberId: mid, courseId: cid, enrolledAt: new Date().toISOString(), progress: [] }])} onUpdateProgress={(eid, lid) => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, progress: e.progress.includes(lid) ? e.progress.filter(id => id !== lid) : [...e.progress, lid] } : e))} onCompleteCourse={eid => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, completedAt: new Date().toISOString() } : e))} />}
        {activeTab === 'course-mgmt' && <CourseManagement courses={courses} members={members} enrollments={enrollments} config={systemConfig} onAddCourse={c => { const newId = `CR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; setCourses([{ ...c, id: newId, createdAt: new Date().toISOString() } as Course, ...courses]); }} onUpdateCourse={(id, data) => setCourses(courses.map(c => c.id === id ? { ...c, ...data } : c))} onDeleteCourse={id => setCourses(courses.filter(c => c.id !== id))} onUpdateConfig={setSystemConfig} />}
        
        {(activeTab === 'canteen-pdv' || activeTab === 'canteen-mgmt' || activeTab === 'canteen-history') && (
           <CanteenManagement activeTab={activeTab} setActiveTab={setActiveTab} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={(item) => setCanteenItems([{...item, id: Math.random().toString(36).substr(2,9)} as CanteenItem, ...canteenItems])} onUpdateItem={(id, data) => setCanteenItems(canteenItems.map(i => i.id === id ? {...i, ...data} : i))} onDeleteItem={(id) => setCanteenItems(canteenItems.filter(i => i.id !== id))} onAddOrder={(order) => { setCanteenOrders([order, ...canteenOrders]); const updatedItems = canteenItems.map(item => { const soldItem = order.items.find(si => si.itemId === item.id); if(soldItem) return {...item, stock: Math.max(0, item.stock - soldItem.quantity)}; return item; }); setCanteenItems(updatedItems); }} />
        )}

        {activeTab === 'members' && <MemberManagement members={members} entities={entities} permissions={userPermissions!} config={systemConfig} onAddMember={m => { const lastId = members.reduce((max, cur) => Math.max(max, parseInt(cur.id) || 0), 0); const newId = (lastId + 1).toString(); setMembers([{ ...m, id: newId, createdAt: new Date().toISOString() } as Member, ...members]); }} onUpdateMember={(id, data) => setMembers(members.map(m => m.id === id ? { ...m, ...data } : m))} onDeleteMember={id => setMembers(members.filter(m => m.id !== id))} />}
        {activeTab === 'mediums' && <MediumManagement members={members} entities={entities} config={systemConfig} onUpdateMemberSpiritualInfo={(mid, eids, enms) => setMembers(members.map(m => m.id === mid ? { ...m, assignedEntities: eids, entityNames: enms } : m))} />}
        {activeTab === 'idcards' && <IDCardManagement members={members} entities={entities} logs={idCardLogs} config={systemConfig} onUpdateLogs={setIdCardLogs} onUpdateConfig={setSystemConfig} currentUser={auth.user!} />}
        {activeTab === 'attendance' && <AttendanceManagement members={members} attendanceRecords={attendanceRecords} config={systemConfig} onUpdateAttendance={setAttendanceRecords} />}
        {activeTab === 'inventory-dashboard' && <InventoryDashboard items={inventoryItems} categories={inventoryCategories} config={systemConfig} />}
        {activeTab === 'inventory' && <InventoryManagement items={inventoryItems} categories={inventoryCategories} logs={stockLogs} config={systemConfig} onAddCategory={(name) => setInventoryCategories([...inventoryCategories, { id: Math.random().toString(), name }])} onDeleteItem={(id) => setInventoryItems(inventoryItems.filter(i => i.id !== id))} onAddItem={(item) => setInventoryItems([...inventoryItems, { ...item, id: Math.random().toString() } as InventoryItem])} />}
        {activeTab === 'inventory-entry' && <InventoryEntry items={inventoryItems} categories={inventoryCategories} onSaveUpdates={(up) => { const newLogs: StockLog[] = []; const updatedItems = inventoryItems.map(i => { const u = up.find(x => x.id === i.id); if (u && u.currentStock !== i.currentStock) { newLogs.push({ id: Math.random().toString(36).substr(2, 9), itemId: i.id, itemName: i.name, previousStock: i.currentStock, newStock: u.currentStock, change: u.currentStock - i.currentStock, date: new Date().toISOString(), responsible: auth.user?.name || 'Sistema', type: u.currentStock > i.currentStock ? 'entrada' : 'saida' }); return { ...i, currentStock: u.currentStock }; } return i; }); setInventoryItems(updatedItems); setStockLogs([...newLogs, ...stockLogs]); if (newLogs.length > 0) alert(`${newLogs.length} movimentações registradas!`); }} />}
        {activeTab === 'mensalidades' && <FinancialManagement members={members} config={systemConfig} onUpdatePayment={(mid, mk, st) => setMembers(p => p.map(m => m.id === mid ? { ...m, monthlyPayments: { ...(m.monthlyPayments || {}), [mk]: st } } : m))} />}
        {activeTab === 'donations' && <DonationManagement donations={donations} inventoryItems={inventoryItems} config={systemConfig} onAddDonation={d => setDonations([...donations, d as Donation])} onDeleteDonation={id => setDonations(donations.filter(d => d.id !== id))} />}
        {activeTab === 'finance-reports' && <FinancialReports members={members} donations={donations} config={systemConfig} />}
        {activeTab === 'finance-config' && <FinancialConfigComponent config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'layout' && <SystemConfigManagement config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'users' && <UserManagement users={systemUsers} config={systemConfig} onAddUser={u => setSystemUsers([...systemUsers, u as User])} onUpdateUser={(id, data) => setSystemUsers(systemUsers.map(u => u.id === id ? { ...u, ...data } : u))} onDeleteUser={id => setSystemUsers(systemUsers.filter(u => u.id !== id))} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'entities' && <EntityManagement entities={entities} permissions={userPermissions!} onAddEntity={(n, t) => setEntities([...entities, { id: Math.random().toString(), name: n, type: t }])} onDeleteEntity={id => setEntities(entities.filter(e => e.id !== id))} />}
        {activeTab === 'entity-images' && <EntityImageManagement entities={entities} config={systemConfig} onUpdateEntity={(id, data) => setEntities(entities.map(e => e.id === id ? { ...e, ...data } : e))} />}
        {activeTab === 'permissions' && <PermissionManagement config={systemConfig} onUpdateConfig={setSystemConfig} />}
        {activeTab === 'backup' && <BackupSystem user={auth.user!} config={systemConfig} onRestoreFromBackup={d => { Object.keys(d).forEach(k => localStorage.setItem(k, JSON.stringify(d[k]))); window.location.reload(); }} />}
        {activeTab === 'restore-system' && <RestoreSystem user={auth.user!} config={systemConfig} onRestore={() => { localStorage.clear(); window.location.reload(); }} />}
        {activeTab === 'saas-manager' && <SaaSManager config={systemConfig} onUpdateConfig={setSystemConfig} isMasterMode={auth.isMasterMode} clientData={currentClient} />}
        {activeTab === 'indicacoes' && <AffiliateSystem config={systemConfig} referrals={referrals.filter(r => r.referrerId === (systemConfig.license?.affiliateLink?.split('ref=')[1] || ''))} />}
        {activeTab === 'support-client' && <TicketSystem user={auth.user!} config={systemConfig} tickets={tickets} onUpdateTickets={setTickets} />}
        {activeTab === 'news-announcements' && <RoadmapHistory roadmap={roadmap} broadcasts={broadcasts} clientId={currentClient?.id || auth.user?.id || 'default'} />}
        {activeTab === 'master-menu' && <MenuManager config={systemConfig} onUpdateConfig={setSystemConfig} />}
        
        {auth.isMasterMode && ['developer-portal', 'master-payments', 'system-maintenance', 'master-backups', 'tickets', 'master-broadcast', 'master-roadmap', 'master-coupons', 'master-audit'].includes(activeTab) && (
          <DeveloperPortal onLogout={() => setAuth({ user: null, isAuthenticated: false })} onEnterClientSystem={handleEnterClientSystem} referrals={referrals} onUpdateReferral={(id, st) => setReferrals(referrals.map(r => r.id === id ? { ...r, status: st } : r))} clients={clients} onUpdateClients={setClients} plans={plans} onUpdatePlans={setPlans} externalTab={activeTab} onTabChange={setActiveTab} maintConfig={globalMaintenance} onUpdateMaintenance={setGlobalMaintenance} tickets={tickets} onUpdateTickets={setTickets} broadcasts={broadcasts} onUpdateBroadcasts={setBroadcasts} roadmap={roadmap} onUpdateRoadmap={setRoadmap} coupons={coupons} onUpdateCoupons={setCoupons} auditLogs={auditLogs} />
        )}
      </Layout>
    );
  }

  if (globalMaintenance.active) {
    const savedMaster = localStorage.getItem('saas_master_credentials');
    const masterEmail = savedMaster ? JSON.parse(savedMaster).email : 'rodrigo@dev.com';
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
          <div className="p-12 bg-orange-600 text-white text-center"><Wrench size={48} className="mx-auto mb-6" /><h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Manutenção</h1></div>
          <div className="p-12 text-center space-y-6"><p className="text-xl font-bold text-slate-700 leading-relaxed italic">"{globalMaintenance.message}"</p><div className="pt-4"><form onSubmit={handleLogin} className="flex gap-3 max-w-sm mx-auto"><input type="password" placeholder="Chave de Mestre" className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm" value={loginPassword} onChange={e => {setLoginPassword(e.target.value); setLoginEmail(masterEmail);}} /><button className="px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Entrar</button></form></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-10 text-white text-center bg-indigo-900" style={{ backgroundColor: systemConfig.primaryColor }}>
            <img src={systemConfig.logoUrl || DEFAULT_LOGO_URL} className="w-20 h-20 mx-auto mb-4 object-contain p-2 bg-white/10 rounded-2xl" />
            <h1 className="text-2xl font-black uppercase tracking-widest">{systemConfig.systemName}</h1>
        </div>
        <form onSubmit={handleLogin} className="p-10 space-y-4">
            <input type="email" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input type="password" required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button type="submit" className="w-full py-5 bg-indigo-900 text-white font-black rounded-2xl shadow-lg uppercase text-xs tracking-widest" style={{ backgroundColor: systemConfig.primaryColor }}>Entrar no Painel</button>
            <button type="button" onClick={() => setShowEcosystemConcept(true)} className="w-full py-3 mt-4 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl font-black text-[9px] uppercase hover:bg-slate-100 transition-all flex items-center justify-center gap-2"><Layers size={14} /> Ver Conceito SaaS</button>
        </form>
      </div>
    </div>
  );
};

export default App;
