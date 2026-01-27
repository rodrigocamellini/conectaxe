import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  Member, CalendarEvent, Course, Enrollment, InventoryItem, 
  InventoryCategory, StockLog, Donation, CanteenItem, CanteenOrder, 
  User, StockUpdate 
} from '../types';
import { INITIAL_MASTER_MENU_CONFIG } from '../constants';

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
  const { setAuth } = auth;
  const { 
    systemConfig, setSystemConfig, 
    updateProfile, // Assuming this exists in DataContext based on analysis
    currentClient
  } = useData();
  const [isSimulation, setIsSimulation] = useState(false);
  
  // Dummy props for Layout since it handles routing internally now
  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, isMasterMode: false });
    // Clear persist if any
    localStorage.removeItem('saas_login_persist');
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
      isSimulation={isSimulation}
    >
      <Outlet />
    </Layout>
  );
};

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
    addTransaction
  } = useData();

  // Helpers for Plan Limits
  const currentPlan = plans.find(p => p.name === systemConfig.license?.planName);

  const handleAddMember = (m: Partial<Member>) => {
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
    
    const lastId = members.reduce((max, cur) => Math.max(max, parseInt(cur.id) || 0), 0);
    const newId = (lastId + 1).toString();
    const photo = m.photo && m.photo.trim() !== '' ? m.photo : '/images/membro.png';
    
    setMembers([{ ...m, id: newId, photo, createdAt: new Date().toISOString() } as Member, ...members]);
  };

  const handleAddConsulente = (m: Partial<Member>) => {
    // Similar logic but specifically for Consulentes route
    const limits = currentPlan?.limits;
    if (!auth.isMasterMode && limits && limits.maxConsulentes != null) {
        const currentCons = members.filter(mem => mem.status === 'consulente' || mem.isConsulente).length;
        if (currentCons >= limits.maxConsulentes) {
          alert('Limite de cadastros de consulentes alcançado para o plano atual.');
          return;
        }
    }
    const lastId = members.reduce((max, cur) => Math.max(max, parseInt(cur.id) || 0), 0);
    const newId = (lastId + 1).toString();
    const baseStatus = m.status && m.status.trim() !== '' ? m.status : 'consulente';
    const photo = m.photo && m.photo.trim() !== '' ? m.photo : '/images/membro.png';
    
    setMembers([{ ...m, id: newId, photo, status: baseStatus, isConsulente: true, createdAt: new Date().toISOString() } as Member, ...members]);
  };

  const handleAddCourse = (c: Partial<Course>) => {
    const newId = `CR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setCourses([{ ...c, id: newId, createdAt: new Date().toISOString() } as Course, ...courses]);
  };

  const handleInventoryEntrySave = (up: StockUpdate[]) => {
      const newLogs: StockLog[] = [];
      const updatedItems = inventoryItems.map(i => {
        const u = up.find(x => x.id === i.id);
        if (u && u.currentStock !== i.currentStock) {
          newLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            itemId: i.id,
            itemName: i.name,
            previousStock: i.currentStock,
            newStock: u.currentStock,
            change: u.currentStock - i.currentStock,
            date: new Date().toISOString(),
            responsible: auth.user?.name || 'Sistema',
            type: u.currentStock > i.currentStock ? 'entrada' : 'saida'
          });
          return { ...i, currentStock: u.currentStock };
        }
        return i;
      });
      setInventoryItems(updatedItems);
      setStockLogs([...newLogs, ...stockLogs]);
      if (newLogs.length > 0) alert(`${newLogs.length} movimentações registradas!`);
  };

  const handleAddCanteenOrder = (order: CanteenOrder) => {
    setCanteenOrders([order, ...canteenOrders]);
    const updatedItems = canteenItems.map(item => {
        const soldItem = order.items.find(si => si.itemId === item.id);
        if(soldItem) return {...item, stock: Math.max(0, item.stock - soldItem.quantity)};
        return item;
    });
    setCanteenItems(updatedItems);
  };

  const handleDeleteCanteenOrder = (id: string) => {
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
              onAddEvent={e => setEvents(prev => [e as CalendarEvent, ...prev])} 
              onUpdateEvent={(id, data) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))} 
              onDeleteEvent={id => setEvents(prev => prev.filter(e => e.id !== id))} 
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
                            onEnroll={(mid, cid) => setEnrollments([...enrollments, { id: Math.random().toString(), memberId: mid, courseId: cid, enrolledAt: new Date().toISOString(), progress: [] }])} 
                            onUpdateProgress={(eid, lid) => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, progress: e.progress.includes(lid) ? e.progress.filter(id => id !== lid) : [...e.progress, lid] } : e))} 
                            onCompleteCourse={eid => setEnrollments(enrollments.map(e => e.id === eid ? { ...e, completedAt: new Date().toISOString() } : e))} 
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
                            onUpdateCourse={(id, data) => setCourses(courses.map(c => c.id === id ? { ...c, ...data } : c))} 
                            onDeleteCourse={id => setCourses(courses.filter(c => c.id !== id))} 
                            onUpdateConfig={setSystemConfig} 
                        />
                    } />
                )}
            </>
        )}

        {/* Cantina */}
        {hasModule('cantina_pdv') && (
             <Route path="/cantina_pdv" element={
                <CanteenManagement activeTab="cantina_pdv" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={(item) => setCanteenItems([{...item, id: Math.random().toString(36).substr(2,9)} as CanteenItem, ...canteenItems])} onUpdateItem={(id, data) => setCanteenItems(canteenItems.map(i => i.id === id ? {...i, ...data} : i))} onDeleteItem={(id) => setCanteenItems(canteenItems.filter(i => i.id !== id))} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
             } />
        )}
        {hasModule('cantina_gestao') && (
             <Route path="/cantina_gestao" element={
                <CanteenManagement activeTab="cantina_gestao" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={(item) => setCanteenItems([{...item, id: Math.random().toString(36).substr(2,9)} as CanteenItem, ...canteenItems])} onUpdateItem={(id, data) => setCanteenItems(canteenItems.map(i => i.id === id ? {...i, ...data} : i))} onDeleteItem={(id) => setCanteenItems(canteenItems.filter(i => i.id !== id))} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
             } />
        )}
        {hasModule('cantina_historico') && (
             <Route path="/cantina_historico" element={
                <CanteenManagement activeTab="cantina_historico" setActiveTab={handleTabChange} items={canteenItems} orders={canteenOrders} config={systemConfig} user={auth.user!} onAddItem={(item) => setCanteenItems([{...item, id: Math.random().toString(36).substr(2,9)} as CanteenItem, ...canteenItems])} onUpdateItem={(id, data) => setCanteenItems(canteenItems.map(i => i.id === id ? {...i, ...data} : i))} onDeleteItem={(id) => setCanteenItems(canteenItems.filter(i => i.id !== id))} onAddOrder={handleAddCanteenOrder} onDeleteOrder={handleDeleteCanteenOrder} />
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
                onUpdateMember={(id, data) => setMembers(members.map(m => m.id === id ? { ...m, ...data } : m))} 
                onDeleteMember={id => setMembers(members.filter(m => m.id !== id))} 
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
                onUpdateMember={(id, data) => setMembers(members.map(m => m.id === id ? { ...m, ...data, isConsulente: data.isConsulente ?? m.isConsulente } : m))} 
                onDeleteMember={id => setMembers(members.filter(m => m.id !== id))} 
                mode="consulente" 
            />
        } />

        <Route path="/mediums" element={
            <MediumManagement members={members} entities={entities} config={systemConfig} onUpdateMemberSpiritualInfo={(mid, eids, enms) => setMembers(members.map(m => m.id === mid ? { ...m, assignedEntities: eids, entityNames: enms } : m))} />
        } />

        <Route path="/idcards" element={
            <IDCardManagement members={members} entities={entities} logs={idCardLogs} config={systemConfig} onUpdateLogs={setIdCardLogs} onUpdateConfig={setSystemConfig} currentUser={auth.user!} />
        } />

        <Route path="/attendance" element={
            <AttendanceManagement members={members} attendanceRecords={attendanceRecords} config={systemConfig} onUpdateAttendance={setAttendanceRecords} />
        } />

        {/* Estoque */}
        {hasModule('estoque') && (
            <>
                {hasModule('estoque_dashboard') && <Route path="/inventory-dashboard" element={<InventoryDashboard items={inventoryItems} categories={inventoryCategories} config={systemConfig} />} />}
                {hasModule('estoque_gestao') && <Route path="/inventory" element={<InventoryManagement items={inventoryItems} categories={inventoryCategories} logs={stockLogs} config={systemConfig} onAddCategory={(name) => setInventoryCategories([...inventoryCategories, { id: Math.random().toString(), name }])} onDeleteItem={(id) => setInventoryItems(inventoryItems.filter(i => i.id !== id))} onAddItem={(item) => setInventoryItems([...inventoryItems, { ...item, id: Math.random().toString() } as InventoryItem])} />} />}
                {hasModule('estoque_movimentacao') && <Route path="/inventory-entry" element={<InventoryEntry items={inventoryItems} categories={inventoryCategories} onSaveUpdates={handleInventoryEntrySave} />} />}
            </>
        )}

        {/* Financeiro */}
        {hasModule('financeiro') && (
            <>
                {hasModule('financeiro_mensalidades') && <Route path="/mensalidades" element={<FinancialManagement members={members} config={systemConfig} onUpdatePayment={(mid, mk, st) => setMembers(p => p.map(m => m.id === mid ? { ...m, monthlyPayments: { ...(m.monthlyPayments || {}), [mk]: st } } : m))} transactions={transactions} onAddTransaction={addTransaction} />} />}
                {hasModule('financeiro_doacoes') && <Route path="/donations" element={<DonationManagement donations={donations} inventoryItems={inventoryItems} config={systemConfig} onAddDonation={d => setDonations([...donations, d as Donation])} onDeleteDonation={id => setDonations(donations.filter(d => d.id !== id))} />} />}
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
                  onAddPonto={p => setPontos([...pontos, { ...p, id: Math.random().toString(36).substr(2, 9) }])} 
                  onUpdatePonto={(id, data) => setPontos(pontos.map(p => p.id === id ? { ...p, ...data } : p))} 
                  onDeletePonto={id => setPontos(pontos.filter(p => p.id !== id))} 
                  activeTab="media-pontos"
                />
              } />
            )}
            {hasModule('midia_rezas') && (
              <Route path="/media-rezas" element={
                <MediaRezas 
                  rezas={rezas} 
                  config={systemConfig} 
                  onAddReza={r => setRezas([...rezas, { ...r, id: Math.random().toString(36).substr(2, 9) }])} 
                  onUpdateReza={(id, data) => setRezas(rezas.map(r => r.id === id ? { ...r, ...data } : r))} 
                  onDeleteReza={id => setRezas(rezas.filter(r => r.id !== id))} 
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
                  onAddErva={e => setErvas([...ervas, { ...e, id: Math.random().toString(36).substr(2, 9) }])} 
                  onUpdateErva={(id, data) => setErvas(ervas.map(e => e.id === id ? { ...e, ...data } : e))} 
                  onDeleteErva={id => setErvas(ervas.filter(e => e.id !== id))} 
                  onAddBanho={b => setBanhos([...banhos, { ...b, id: Math.random().toString(36).substr(2, 9) }])} 
                  onUpdateBanho={(id, data) => setBanhos(banhos.map(b => b.id === id ? { ...b, ...data } : b))} 
                  onDeleteBanho={id => setBanhos(banhos.filter(b => b.id !== id))} 
                  activeTab="media-ervas"
                />
              } />
            )}
          </>
        )}

        {/* Afiliados */}
        <Route path="/indicacoes" element={
          <AffiliateSystem config={systemConfig} referrals={referrals} activeTab="indicacoes" />
        } />

        {/* Configurações e Admin */}
        <Route path="/layout" element={<SystemConfigManagement config={systemConfig} onUpdateConfig={setSystemConfig} />} />
        <Route path="/users" element={<UserManagement users={systemUsers} config={systemConfig} onAddUser={u => setSystemUsers([...systemUsers, u as User])} onUpdateUser={(id, data) => setSystemUsers(systemUsers.map(u => u.id === id ? { ...u, ...data } : u))} onDeleteUser={id => setSystemUsers(systemUsers.filter(u => u.id !== id))} onUpdateConfig={setSystemConfig} />} />
        <Route path="/entities" element={<EntityManagement entities={entities} permissions={userPermissions?.entities || { view: true, add: true, edit: true, delete: true }} config={systemConfig} onUpdateConfig={setSystemConfig} onAddEntity={(n, t) => setEntities([...entities, { id: Math.random().toString(), name: n, type: t }])} onDeleteEntity={id => setEntities(entities.filter(e => e.id !== id))} />} />
        <Route path="/entity-images" element={<EntityImageManagement entities={entities} config={systemConfig} onUpdateEntity={(id, data) => setEntities(entities.map(e => e.id === id ? { ...e, ...data } : e))} />} />
        <Route path="/permissions" element={<PermissionManagement config={systemConfig} onUpdateConfig={setSystemConfig} />} />
        
        <Route path="/backup" element={<BackupSystem user={auth.user!} config={systemConfig} onRestoreFromBackup={d => { Object.keys(d).forEach(k => localStorage.setItem(k, JSON.stringify(d[k]))); window.location.reload(); }} allowAutoBackup={hasModule('mod_backup_auto')} onUpdateConfig={setSystemConfig} />} />
        <Route path="/restore-system" element={<RestoreSystem user={auth.user!} config={systemConfig} onRestore={() => { localStorage.clear(); window.location.reload(); }} />} />
        <Route path="/saas-manager" element={<SaaSManager config={systemConfig} onUpdateConfig={setSystemConfig} isMasterMode={auth.isMasterMode} clientData={currentClient} />} />
        
        {/* Ajuda */}
        <Route path="/help-center" element={<HelpCenter onStartTour={onStartTour || (() => {})} />} />

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
              setAuth({ user: null, isAuthenticated: false, isMasterMode: false });
              localStorage.removeItem('saas_login_persist');
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
            externalTab="clients"
          />
        } />
        {/* Map other master menu items to DeveloperPortal with externalTab */}
        {['master-payments', 'master-affiliates', 'system-maintenance', 'master-backups', 'master-audit', 'tickets', 'master-broadcast', 'master-roadmap', 'master-system-config', 'master-coupons', 'master-menu'].map(path => (
          <Route key={path} path={`/${path}`} element={
            <DeveloperPortal 
              onLogout={() => {
                setAuth({ user: null, isAuthenticated: false, isMasterMode: false });
                localStorage.removeItem('saas_login_persist');
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
              externalTab={path}
            />
          } />
        ))}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
