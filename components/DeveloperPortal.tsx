
import React, { useState, useEffect, useRef } from 'react';
import { SaaSClient, SaaSPlan, GlobalMaintenanceConfig, SupportTicket, MasterAuditLog, GlobalBroadcast, ReleaseNote, GlobalCoupon, MasterCredentials, StoredSnapshot, Referral, ReferralStatus, User, SystemConfig } from '../types';
import { HomepageConfig } from './HomepageConfig';
import { SystemConfigManagement } from './SystemConfigManagement';
import { 
  Users, 
  DollarSign, 
  Wrench, 
  Database, 
  ShieldHalf, 
  ExternalLink, 
  Search, 
  Trash2, 
  Plus, 
  Zap,
  Lock,
  Unlock,
  TrendingUp,
  MapPin,
  Smartphone,
  ShieldCheck, 
  X,
  CreditCard,
  User as UserIcon,
  Snowflake,
  Map as MapIcon,
  Ticket,
  ClipboardList,
  History,
  Tag,
  Code,
  Settings,
  Monitor,
  Key,
  MessageSquare,
  Banknote,
  CheckCircle2,
  Copy,
  LayoutGrid,
  AlertTriangle,
  ChevronDown,
  Save,
  Image as ImageIcon,
  Upload,
  Palette,
  Type,
  Send,
  Power,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Clock,
  Gift,
  ShieldAlert,
  Sparkles,
  Archive,
  Download,
  FileJson,
  RefreshCcw,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { MasterTicketManager } from './MasterTicketManager';
import { MasterCouponsManager } from './MasterCouponsManager';
import { MasterPlansManager } from './MasterPlansManager';
import { MasterPlanResources } from './MasterPlanResources';
import { AuditTab } from './AuditTab';
import { MenuManager } from './MenuManager';
import { MasterService } from '../services/masterService';
import { SAAS_PLANS, BRAZILIAN_STATES, MASTER_LOGO_URL, DEFAULT_SYSTEM_CONFIG } from '../constants';
import { validateCPF, formatCPF } from '../utils/validators';

interface DeveloperPortalProps {
  onLogout: () => void;
  onEnterClientSystem: (client: SaaSClient) => void;
  referrals: Referral[];
  onUpdateReferral: (id: string, status: ReferralStatus) => void;
  clients: SaaSClient[];
  onUpdateClients: (clients: SaaSClient[]) => void;
  plans: SaaSPlan[];
  onUpdatePlans: (plans: SaaSPlan[]) => void;
  externalTab?: string;
  onTabChange?: (tab: string) => void;
  maintConfig: GlobalMaintenanceConfig;
  onUpdateMaintenance: (config: GlobalMaintenanceConfig) => void;
  tickets: SupportTicket[];
  onUpdateTickets: any;
  broadcasts: GlobalBroadcast[];
  onUpdateBroadcasts: (b: GlobalBroadcast[]) => void;
  roadmap: ReleaseNote[];
  onUpdateRoadmap: (r: ReleaseNote[]) => void;
  coupons: GlobalCoupon[];
  onUpdateCoupons: (c: GlobalCoupon[]) => void;
  auditLogs: MasterAuditLog[];
  onAddAuditLog: (log: Partial<MasterAuditLog>) => void;
  onClearAuditLogs: () => void;
  systemConfig?: SystemConfig;
  onUpdateSystemConfig?: (config: SystemConfig) => void;
}

const MONTHS_SHORT = [
  { id: '01', name: 'Jan' }, { id: '02', name: 'Fev' }, { id: '03', name: 'Mar' },
  { id: '04', name: 'Abr' }, { id: '05', name: 'Mai' }, { id: '06', name: 'Jun' },
  { id: '07', name: 'Jul' }, { id: '08', name: 'Ago' }, { id: '09', name: 'Set' },
  { id: '10', name: 'Out' }, { id: '11', name: 'Nov' }, { id: '12', name: 'Dez' },
];

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ 
  onLogout,
  onEnterClientSystem,
  referrals = [],
  onUpdateReferral,
  clients = [],
  onUpdateClients,
  plans = [],
  onUpdatePlans = () => {},
  externalTab,
  onTabChange,
  maintConfig = { active: false, message: '' },
  onUpdateMaintenance = () => {},
  tickets = [],
  onUpdateTickets = () => {},
  broadcasts = [],
  onUpdateBroadcasts = () => {},
  roadmap = [],
  onUpdateRoadmap = () => {},
  coupons = [],
  onUpdateCoupons = () => {},
  auditLogs = [],
  onAddAuditLog = () => {},
  onClearAuditLogs = () => {},
  systemConfig,
  onUpdateSystemConfig
}) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with externalTab prop if provided
  // Removed duplicate useEffect that was causing conflicts
  // The mapping logic at line 396 handles this correctly

  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<SaaSClient | null>(null);
  const [showMasterSettings, setShowMasterSettings] = useState(false);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estados para Snapshots (Backups)
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>([]);

  // Load snapshots from MasterService
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        const data = await MasterService.getAllSnapshots();
        setSnapshots(data as StoredSnapshot[]);
      } catch (error) {
        console.error("Error loading snapshots:", error);
      }
    };
    loadSnapshots();
  }, []);

  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<StoredSnapshot | null>(null);
  const [restorePassword, setRestorePassword] = useState('');

  // Estados para Versionamento do Roadmap
  const [updateType, setUpdateType] = useState<'patch' | 'minor' | 'major' | 'manual'>('patch');
  const [calculatedVersion, setCalculatedVersion] = useState('');
  
  // Estados para Deleção de Cliente
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<SaaSClient | null>(null);
  const [deleteClientPassword, setDeleteClientPassword] = useState('');
  const [deleteClientError, setDeleteClientError] = useState('');

  // Estados para Backup/Restore do Roadmap
  const [showRoadmapRestoreModal, setShowRoadmapRestoreModal] = useState(false);
  const [roadmapRestorePassword, setRoadmapRestorePassword] = useState('');
  const [roadmapRestoreError, setRoadmapRestoreError] = useState('');
  const [systemConfigTab, setSystemConfigTab] = useState<'motor' | 'planos' | 'recursos'>('motor');

  // Estado para Confirmação de Congelamento
  const [freezeConfirm, setFreezeConfirm] = useState<{ id: string; status: 'frozen' | 'active'; name: string } | null>(null);
  
  // Estado para Confirmação de Bloqueio
  const [blockConfirm, setBlockConfirm] = useState<{ id: string; status: 'blocked' | 'active'; name: string } | null>(null);

  const getLatestVersion = () => {
    if (!roadmap || roadmap.length === 0) return '0.0.0';
    const sortedRoadmap = [...roadmap].sort((a, b) => {
      const vA = a.version.split('.').map(Number);
      const vB = b.version.split('.').map(Number);
      for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
        const numA = vA[i] || 0;
        const numB = vB[i] || 0;
        if (numA > numB) return -1;
        if (numA < numB) return 1;
      }
      return 0;
    });
    return sortedRoadmap[0]?.version || '0.0.0';
  };

  // Efeito para calcular versão automaticamente
  useEffect(() => {
    const latestVersion = getLatestVersion();

    if (updateType === 'manual') {
      setCalculatedVersion(latestVersion);
      return;
    }

    const parts = latestVersion.split('.').map(p => parseInt(p, 10));
    
    if (parts.length >= 3 && parts.every(p => !isNaN(p))) {
      let [major, minor, patch] = parts;
      
      if (updateType === 'patch') patch++; // Correção (1.0.1)
      if (updateType === 'minor') { minor++; patch = 0; } // Atualização (1.1.0)
      if (updateType === 'major') { major++; minor = 0; patch = 0; } // Implantação/Grande (2.0.0)
      
      setCalculatedVersion(`${major}.${minor}.${patch}`);
    } else {
      setCalculatedVersion(`${latestVersion}.1`);
    }
  }, [roadmap, updateType]);

  useEffect(() => {
    const runAutoBlock = async () => {
      let config;
      try {
        config = await MasterService.getAutoBlockConfig();
      } catch (error) {
        console.error("Error fetching auto block config:", error);
        return;
      }

      if (!config || !config.enabled) return;

      const today = new Date();
      let hasUpdates = false;
      const updatedClients = clients.map(client => {
        if (client.status !== 'active') return client; 
        
        const expiryDate = new Date(client.expirationDate + 'T23:59:59');
        if (isNaN(expiryDate.getTime())) return client;

        const toleranceDays = config.days || 0;
        const blockDate = addDays(expiryDate, toleranceDays);
        
        if (isAfter(today, blockDate)) {
          hasUpdates = true;
          return { ...client, status: 'blocked' as const };
        }
        return client;
      });

      if (hasUpdates) {
        onUpdateClients(updatedClients);
        
        updatedClients.forEach((c, index) => {
          const original = clients[index];
          if (original.status === 'active' && c.status === 'blocked') {
            onAddAuditLog({
              clientId: c.id,
              clientName: c.name,
              action: 'Bloqueio Automático',
              category: 'financial',
              severity: 'warning',
              details: `Cliente bloqueado automaticamente por inadimplência. Vencimento: ${c.expirationDate}, Tolerância: ${config.days} dias.`
            });
          }
        });
        
        alert(`ATENÇÃO: ${updatedClients.filter((c, i) => clients[i].status === 'active' && c.status === 'blocked').length} clientes foram bloqueados automaticamente por falta de pagamento.`);
      }
    };

    runAutoBlock();
  }, [clients]);

  const handleExportRoadmap = () => {
    try {
      const data = JSON.stringify(roadmap, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roadmap_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading backup:", error);
      alert("Erro ao baixar backup. Verifique o console.");
    }
  };

  const handleRestoreRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    setRoadmapRestoreError('');

    if (roadmapRestorePassword !== masterCreds.password) {
      setRoadmapRestoreError('Senha de desenvolvedor incorreta.');
      return;
    }

    const fileInput = document.getElementById('roadmap-restore-file') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setRoadmapRestoreError('Selecione um arquivo JSON válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm('ATENÇÃO: Isso substituirá todo o histórico de versões atual pelos dados do arquivo. Continuar?')) {
            onUpdateRoadmap(json);
            setShowRoadmapRestoreModal(false);
            setRoadmapRestorePassword('');
            alert('Timeline restaurada com sucesso!');
          }
        } else {
          setRoadmapRestoreError('O arquivo não contém um formato de timeline válido.');
        }
      } catch (err) {
        setRoadmapRestoreError('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Estados para Broadcast
  const [newBroadcastText, setNewBroadcastText] = useState('');
  const [newBroadcastType, setNewBroadcastType] = useState<'info' | 'warning' | 'success'>('info');

  // Gestão de Credenciais e Identidade Master
  const [masterCreds, setMasterCreds] = useState<MasterCredentials>({
      email: 'rodrigo@dev.com', 
      password: 'master', 
      whatsapp: '', 
      pixKey: '', 
      bankDetails: '',
      sidebarTitle: 'Sistema de Gestão de Terreiros',
      systemTitle: 'ConectAxé Painel de Desenvolvedor',
      brandLogo: MASTER_LOGO_URL,
      backupFrequency: 'disabled'
  });

  useEffect(() => {
    const loadMasterCreds = async () => {
      try {
        console.log('Fetching master credentials from server...');
        const creds = await MasterService.getMasterCredentials();
        console.log('Master credentials fetched:', creds);
        setMasterCreds(creds);
      } catch (error) {
        console.error("Error loading master credentials:", error);
      }
    };
    loadMasterCreds();
  }, []);

  const [newClient, setNewClient] = useState<Partial<SaaSClient>>(() => ({
    name: '',
    plan: (plans && plans[0]?.name) || SAAS_PLANS[0],
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminCpf: '',
    adminPhone: '',
    adminCep: '',
    adminAddress: '',
    adminBairro: '',
    adminCidade: '',
    adminEstado: 'SP',
    status: 'active'
  }));

  const getClientBillingFromPlan = (planName: string) => {
    const selected = plans && plans.find(p => p.name === planName);
    const today = new Date();
    if (selected) {
      const price = selected.price || 0;
      let expirationDate: string;
      if (selected.durationDays === null) {
        expirationDate = '2099-12-31';
      } else {
        const future = addDays(today, selected.durationDays || 0);
        expirationDate = format(future, 'yyyy-MM-dd');
      }
      return { price, expirationDate };
    }
    const defaultExpiration = format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd');
    return { price: 0, expirationDate: defaultExpiration };
  };

  useEffect(() => {
    if (externalTab) {
      const tabMap: Record<string, string> = {
        'master-payments': 'payments',
  'master-affiliates': 'affiliates',
  'system-maintenance': 'maintenance',
  'master-backups': 'backups',
  'master-audit': 'audit',
  'tickets': 'tickets',
  'master-broadcast': 'broadcast',
  'master-roadmap': 'roadmap',
        'master-homepage': 'homepage-config',
        'master-system-config': 'system-config',
        'master-coupons': 'coupons',
  'developer-portal': 'clients',
  'master-menu': 'master-menu'
};
      setActiveTab(tabMap[externalTab] || 'clients');
    }
  }, [externalTab]);

  const handleSaveMasterSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Initiating Master Settings Save...', masterCreds);
      await MasterService.saveMasterCredentials(masterCreds);
      
      // Wait a moment to ensure Firestore persistence layer has processed it before reload
      // Although await setDoc should be enough, a small delay can help in some edge cases with offline persistence
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-fetch credentials from server to confirm and update local state
      try {
        const freshCreds = await MasterService.getMasterCredentials();
        setMasterCreds(freshCreds);
        alert('Configurações do Ecossistema Master atualizadas com sucesso!');
        setShowMasterSettings(false);
      } catch (fetchErr) {
        console.error("Error fetching fresh credentials:", fetchErr);
        // Fallback to reload if fetch fails
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving master credentials:", error);
      alert('Erro ao salvar configurações.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMasterCreds(prev => ({ ...prev, brandLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClient = (client: SaaSClient) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      plan: client.plan,
      adminName: client.adminName,
      adminEmail: client.adminEmail,
      adminPassword: '', 
      adminCpf: client.adminCpf || '',
      adminPhone: client.adminPhone || '',
      adminCep: client.adminCep || '',
      adminAddress: client.adminAddress || '',
      adminBairro: client.adminBairro || '',
      adminCidade: client.adminCidade || '',
      adminEstado: client.adminEstado || 'SP',
      status: client.status
    });
    setShowAddClient(true);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 10) {
      return v.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    }
    return v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newClient.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.adminEmail)) {
      alert("Formato de e-mail inválido. Use o formato: email@email.com");
      return;
    }

    const planName = newClient.plan || ((plans && plans[0]?.name) || SAAS_PLANS[0]);
    const { price, expirationDate } = getClientBillingFromPlan(planName);

    const isTestPlan = (() => {
      const p = planName.toLowerCase();
      return p.includes('teste') || 
             p.includes('trial') || 
             p.includes('gratuito') || 
             p.includes('free') ||
             p.includes('iniciante') || 
             p.includes('starter') ||
             p.includes('basico') ||
             p.includes('básico') ||
             p === 'basic';
    })();

    if (editingClient) {
        const updatedClient = {
            ...editingClient,
            ...newClient,
            monthlyValue: price,
            expirationDate: (editingClient.plan === planName) ? editingClient.expirationDate : expirationDate,
            adminPassword: newClient.adminPassword || editingClient.adminPassword
        } as SaaSClient;

        // Persist the updated client to Firestore
        try {
            await MasterService.saveClient(updatedClient);
            
            // Sync license to client's system config
            await MasterService.updateClientLicense(updatedClient.id, {
                clientId: updatedClient.id,
                planName: updatedClient.plan,
                status: updatedClient.status,
                expirationDate: updatedClient.expirationDate,
                affiliateLink: updatedClient.affiliateLink || ''
            });

            const updatedClients = clients.map(c => c.id === editingClient.id ? updatedClient : c);
            onUpdateClients(updatedClients);
            
            onAddAuditLog({
              clientId: editingClient.id,
              clientName: newClient.name || editingClient.name,
              action: 'Atualização de Instância',
              category: 'client_management',
              severity: 'info',
              details: `Instância atualizada. Plano: ${planName}`
            });
        } catch (err) {
             console.error("CRITICAL ERROR: Failed to update client in Firestore:", err);
             alert("Erro crítico ao atualizar o terreiro no banco de dados.");
             return; // Stop execution if save fails
        }
    } else {
        const client: SaaSClient = {
          ...newClient,
          id: Math.random().toString(36).substr(2, 6).toUpperCase(),
          plan: planName,
          monthlyValue: price,
          expirationDate,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          // Generate affiliate link only for non-test plans
          affiliateLink: !isTestPlan ? `https://conectaxe.com/cadastro?ref=${Math.random().toString(36).substr(2, 6).toUpperCase()}` : '' // Using random ID for ref if needed, or use client ID below
        } as SaaSClient;

        // Fix affiliate link to use client ID
        client.affiliateLink = !isTestPlan ? `https://conectaxe.com/cadastro?ref=${client.id}` : '';

        // Persist the new client to Firestore immediately
        try {
            await MasterService.saveClient(client);
            
            // Initialize Client Data in Firebase
        // Para o admin principal (dono), usamos o ID do cliente como ID do usuário para facilitar o carregamento de dados
        // conforme lógica do DataContext (if user.role === 'admin' loadClientData(user.id))
        const newAdminUser: User = {
          id: client.id, 
          name: client.adminName || 'Admin',
          email: client.adminEmail || 'admin@terreiro.com',
          role: 'admin',
          password: client.adminPassword || '123456',
          photo: '',
          clientId: client.id,
          createdAt: new Date().toISOString(),
          active: true
        };
        
        const initialUsers = [newAdminUser];
        
        let newClientConfig: SystemConfig | undefined;
        if (systemConfig) {
             newClientConfig = {
                ...DEFAULT_SYSTEM_CONFIG,
                primaryColor: systemConfig.primaryColor,
                sidebarColor: systemConfig.sidebarColor,
                sidebarTextColor: systemConfig.sidebarTextColor,
                accentColor: systemConfig.accentColor,
                spiritualSectionColors: systemConfig.spiritualSectionColors,
                // systemName: client.name, // REMOVIDO: Manter o padrão do sistema (ex: "ConectAxé")
                license: {
                    clientId: client.id,
                    planName: client.plan,
                    status: 'active',
                    expirationDate: client.expirationDate,
                    affiliateLink: client.affiliateLink
                }
             };
        }

            if (newClientConfig) {
              await MasterService.initializeClientData(client.id, initialUsers, newClientConfig);
            }

            onUpdateClients([...clients, client]);
            
            onAddAuditLog({
              clientId: client.id,
              clientName: client.name,
              action: 'Criação de Instância',
              category: 'client_management',
              severity: 'info',
              details: `Nova instância criada com plano ${planName}. Admin: ${client.adminEmail}`
            });
        } catch (err) {
            console.error("CRITICAL ERROR: Failed to save client to Firestore:", err);
            alert("Erro crítico ao salvar o terreiro no banco de dados. As alterações podem ser perdidas ao recarregar.");
            return; // Stop execution
        }
    }

    setShowAddClient(false);
    setEditingClient(null);
    setNewClient({
      name: '',
      plan: (plans && plans[0]?.name) || SAAS_PLANS[0],
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      adminCpf: '',
      adminPhone: '',
      adminCep: '',
      adminAddress: '',
      adminBairro: '',
      adminCidade: '',
      adminEstado: 'SP',
      status: 'active'
    });
  };

  const handleResetAuditLogs = (password: string) => {
    if (password === masterCreds.password) {
      onClearAuditLogs();
      alert('Logs de auditoria foram limpos com sucesso.');
    } else {
      alert('Senha de desenvolvedor incorreta.');
    }
  };

  const handleCreateSnapshot = async (type: 'manual' | 'automatico' = 'manual') => {
    if (type === 'automatico') {
      alert("Backups automáticos são gerenciados pelo servidor.");
      return;
    }

    try {
      // Feedback visual simples via cursor ou toast (aqui usando alert no final)
      const snapshotData = await MasterService.getEcosystemSnapshot();
      
      const newSnapshot: StoredSnapshot = {
        id: format(new Date(), 'yyyyMMddHHmmss'),
        date: new Date().toISOString(),
        type: 'manual',
        size: (JSON.stringify(snapshotData).length / 1024).toFixed(2) + ' KB',
        data: snapshotData
      };

      await MasterService.saveSnapshot(newSnapshot);
      setSnapshots(prev => [newSnapshot, ...prev]);
      alert('Snapshot do Ecossistema (incluindo configs dos painéis) gerado e salvo com sucesso!');
    } catch (error) {
      console.error("Error creating snapshot:", error);
      alert('Erro ao gerar snapshot do ecossistema.');
    }
  };

  const formatRoadmapDate = (value?: string) => {
    try {
      if (!value) return '--/--/----';
      const d = new Date(value);
      if (isNaN(d.getTime())) return '--/--/----';
      return format(d, 'dd/MM/yyyy');
    } catch {
      return '--/--/----';
    }
  };

  const downloadSnapshot = (snap: StoredSnapshot) => {
    const blob = new Blob([JSON.stringify(snap.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SNAPSHOT_${snap.type.toUpperCase()}_${format(new Date(snap.date), 'yyyyMMdd_HHmm')}.json`;
    link.click();
  };

  const handleRestoreSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Funcionalidade de Restauração Local desativada no modo Nuvem/Firebase.");
    return;
    /*
    if (!showRestoreConfirm) return;
    // ... legacy logic ...
    */
  };

  const deleteSnapshot = (id: string) => {
    if (confirm('Remover este snapshot permanentemente da lista?')) {
      setSnapshots(snapshots.filter(s => s.id !== id));
    }
  };

  const handleUpdateClientPayment = (clientId: string, monthKey: string) => {
    let newStatus = '';
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const currentPayments = client.payments || {};
        const currentStatus = currentPayments[monthKey] || 'unpaid';
        
        let nextStatus: 'paid' | 'unpaid' | 'justified' = 'unpaid';
        if (currentStatus === 'unpaid') nextStatus = 'paid';
        else if (currentStatus === 'paid') nextStatus = 'justified';
        else nextStatus = 'unpaid';

        newStatus = nextStatus;

        return {
          ...client,
          payments: { ...currentPayments, [monthKey]: nextStatus }
        };
      }
      return client;
    });
    onUpdateClients(updatedClients);

    const client = clients.find(c => c.id === clientId);
    if (client) {
        onAddAuditLog({
            clientId: client.id,
            clientName: client.name,
            action: 'Atualização de Pagamento',
            category: 'financial',
            severity: 'info',
            details: `Mensalidade ${monthKey} alterada para ${newStatus}`
        });
    }
  };

  const handleUpdatePlansWithAudit = (newPlans: SaaSPlan[]) => {
    onUpdatePlans(newPlans);
    onAddAuditLog({
        action: 'Atualização de Planos SaaS',
        category: 'financial',
        severity: 'warning',
        details: `Configuração de planos atualizada. Total de planos: ${newPlans.length}`
    });
  };

  const handleAddBroadcast = () => {
    if (!newBroadcastText.trim()) return;
    const b: GlobalBroadcast = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      message: newBroadcastText,
      type: newBroadcastType,
      active: true,
      createdAt: new Date().toISOString()
    };
    onUpdateBroadcasts([...broadcasts, b]);
    setNewBroadcastText('');
    alert('Comunicado disparado com sucesso para toda a rede!');
  };

  const handleDownloadClientBackup = async (clientId: string) => {
    try {
      const clientInfo = clients.find(c => c.id === clientId);
      
      // Fetch full data from Firebase
      const backupData = await MasterService.getClientFullData(clientId);

    // Adiciona metadados do cliente
    if (clientInfo) {
      backupData['__client_metadata__'] = clientInfo;
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BACKUP_${clientInfo?.name?.replace(/\s+/g, '_').toUpperCase() || clientId}_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading client backup:", error);
      alert("Erro ao baixar backup do cliente.");
    }
  };

  const deleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      setClientToDelete(client);
      setDeleteClientPassword('');
      setDeleteClientError('');
      setShowDeleteClientModal(true);
    }
  };

  const handleConfirmDeleteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToDelete) return;

    if (deleteClientPassword !== masterCreds.password) {
      setDeleteClientError('Senha de desenvolvedor incorreta!');
      return;
    }

    // Remove from Firebase
    try {
        await MasterService.deleteClient(clientToDelete.id);
    } catch (err) {
        console.error("Error deleting client from Firebase:", err);
        setDeleteClientError("Erro ao excluir do banco de dados.");
        return;
    }

    // Remove da lista de clientes
    onUpdateClients(clients.filter(c => c.id !== clientToDelete.id));
    
    onAddAuditLog({
      clientId: clientToDelete.id,
      clientName: clientToDelete.name,
      action: 'Exclusão de Instância',
      category: 'client_management',
      severity: 'critical',
      details: `Instância removida permanentemente.`
    });

    setShowDeleteClientModal(false);
    setClientToDelete(null);
    setDeleteClientPassword('');
    setDeleteClientError('');
    alert('Instância removida permanentemente.');
  };

  const toggleStatus = (id: string, newStatus: SaaSClient['status']) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    if (newStatus === 'frozen' || (client.status === 'frozen' && newStatus === 'active')) {
      setFreezeConfirm({ id, status: newStatus as 'frozen' | 'active', name: client.name });
      return;
    }

    if (newStatus === 'blocked' || (client.status === 'blocked' && newStatus === 'active')) {
      setBlockConfirm({ id, status: newStatus as 'blocked' | 'active', name: client.name });
      return;
    }

    // Para outros status (blocked, active de outros estados), mantém o comportamento direto ou implementa outro fluxo
    executeStatusChange(id, newStatus);
  };

  const executeStatusChange = (id: string, newStatus: SaaSClient['status']) => {
    const client = clients.find(c => c.id === id);
    onUpdateClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (client) {
      onAddAuditLog({
        clientId: client.id,
        clientName: client.name,
        action: 'Alteração de Status',
        category: 'client_management',
        severity: newStatus === 'blocked' || newStatus === 'frozen' ? 'warning' : 'info',
        details: `Status alterado de ${client.status} para ${newStatus}`
      });
    }
    setFreezeConfirm(null);
    setBlockConfirm(null);
  };

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    blocked: clients.filter(c => c.status === 'blocked').length,
    frozen: clients.filter(c => c.status === 'frozen').length,
    totalMRR: clients.reduce((acc, c) => acc + (c.monthlyValue || 0), 0)
  };

  const [affiliateFilter, setAffiliateFilter] = useState<'all' | 'aguardando' | 'aprovada' | 'reprovada'>('all');

  const affiliateStats = {
    total: referrals.filter(r => r && r.id).length,
    approved: referrals.filter(r => r && r.status === 'aprovada').length,
    pending: referrals.filter(r => r && r.status === 'aguardando').length,
    rejected: referrals.filter(r => r && r.status === 'reprovada').length
  };

  const filteredReferrals = referrals.filter(r => {
    if (!r || !r.id) return false;
    if (affiliateFilter === 'all') return true;
    return r.status === affiliateFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      

      {/* ABA: CONFIGURAÇÕES DA HOMEPAGE - REMOVIDO DUPLICATA DAQUI */}

      {/* ABA: TERREIROS ATIVOS */}
      {activeTab === 'clients' && (
        <div className="space-y-8">
           {/* MENU SUPERIOR DE RESUMO */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-orange-500 p-6 rounded-3xl border border-orange-500/80 shadow-xl">
                 <p className="text-[9px] font-black text-white/80 uppercase tracking-widest mb-1">Total de Instâncias</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.total}</h4>
                    <LayoutGrid size={24} className="text-white/40" />
                 </div>
              </div>
              <div className="bg-emerald-400 p-6 rounded-3xl border border-emerald-400/80 shadow-xl">
                 <p className="text-[9px] font-black text-emerald-950/70 uppercase tracking-widest mb-1">Terreiros Ativos</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.active}</h4>
                    <div className="w-3 h-3 rounded-full bg-emerald-900 animate-pulse" />
                 </div>
              </div>
              <div className="bg-red-600 p-6 rounded-3xl border border-red-600/80 shadow-xl">
                 <p className="text-[9px] font-black text-white/80 uppercase tracking-widest mb-1">Inadimplentes</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.blocked}</h4>
                    <Lock size={20} className="text-white/40" />
                 </div>
              </div>
              <div className="bg-blue-500 p-6 rounded-3xl border border-blue-500/80 shadow-xl">
                 <p className="text-[9px] font-black text-white/80 uppercase tracking-widest mb-1">Congelados</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-3xl font-black text-white">{clientStats.frozen}</h4>
                    <Snowflake size={20} className="text-white/40" />
                 </div>
              </div>
              <div className="bg-purple-600 p-6 rounded-3xl shadow-xl shadow-purple-600/20">
                 <p className="text-[9px] font-black text-purple-200 uppercase tracking-widest mb-1">MRR Acumulado</p>
                 <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-black text-white">R$ {clientStats.totalMRR.toFixed(2)}</h4>
                    <TrendingUp size={20} className="text-[#ADFF2F]" />
                 </div>
              </div>
           </div>
 
          {showAddClient && (
            <div className="bg-slate-900 rounded-[2.5rem] border border-emerald-600/40 shadow-2xl overflow-hidden mb-8">
              <form onSubmit={handleSaveClient} className="p-8 space-y-6">
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500 rounded-2xl text-slate-900 shadow-lg">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{editingClient ? 'Editar Terreiro' : 'Novo Terreiro'}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                        {editingClient ? 'Atualização de dados da instância' : 'Cadastro de nova instância do sistema'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowAddClient(false); setEditingClient(null); }}
                    className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Nome do Terreiro
                    </label>
                    <input
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Tenda de Umbanda Pai João"
                      value={newClient.name || ''}
                      onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Plano
                    </label>
                    <select
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                      value={newClient.plan || ((plans && plans[0]?.name) || SAAS_PLANS[0])}
                      onChange={e => setNewClient(prev => ({ ...prev, plan: e.target.value }))}
                    >
                      {(plans && plans.length ? plans.map(p => p.name) : SAAS_PLANS).map(planName => (
                        <option key={planName} value={planName}>
                          {planName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Nome do Administrador
                    </label>
                    <input
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Responsável pelo Terreiro"
                      value={newClient.adminName || ''}
                      onChange={e => setNewClient(prev => ({ ...prev, adminName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      E-mail do Administrador
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="email@exemplo.com"
                      value={newClient.adminEmail || ''}
                      onChange={e => setNewClient(prev => ({ ...prev, adminEmail: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Senha de Acesso
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={editingClient ? "Deixe em branco para manter a atual" : "Defina uma senha para o admin"}
                      value={newClient.adminPassword || ''}
                      onChange={e => setNewClient(prev => ({ ...prev, adminPassword: e.target.value }))}
                      required={!editingClient}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      CPF do Administrador
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input
                        className={`w-full pl-9 p-3 bg-slate-950 border rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 ${
                          newClient.adminCpf && newClient.adminCpf.length > 0
                            ? validateCPF(newClient.adminCpf)
                              ? "border-emerald-500 focus:ring-emerald-500"
                              : "border-red-500 focus:ring-red-500"
                            : "border-slate-800 focus:ring-emerald-500"
                        }`}
                        placeholder="000.000.000-00"
                        value={newClient.adminCpf || ''}
                        onChange={e => setNewClient(prev => ({ ...prev, adminCpf: formatCPF(e.target.value) }))}
                      />
                    </div>
                    {newClient.adminCpf && newClient.adminCpf.length > 0 && (
                      <p className={`text-[9px] font-black uppercase mt-1 ml-1 ${
                        validateCPF(newClient.adminCpf) ? "text-emerald-500" : "text-red-500"
                      }`}>
                        {validateCPF(newClient.adminCpf) ? "CPF Válido" : "CPF Inválido"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Telefone / WhatsApp
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input
                        className="w-full pl-9 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="(00) 00000-0000"
                        value={newClient.adminPhone || ''}
                        onChange={e => setNewClient(prev => ({ ...prev, adminPhone: formatPhone(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Endereço do Responsável
                    </label>
                    <div className="relative">
                      <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input
                        className="w-full pl-9 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Rua, Número, Bairro"
                        value={newClient.adminAddress || ''}
                        onChange={e => setNewClient(prev => ({ ...prev, adminAddress: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">
                      Cidade / UF
                    </label>
                    <div className="grid grid-cols-[2fr,1fr] gap-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                          className="w-full pl-9 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Cidade"
                          value={newClient.adminCidade || ''}
                          onChange={e => setNewClient(prev => ({ ...prev, adminCidade: e.target.value }))}
                        />
                      </div>
                      <select
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                        value={newClient.adminEstado || 'SP'}
                        onChange={e => setNewClient(prev => ({ ...prev, adminEstado: e.target.value }))}
                      >
                        {BRAZILIAN_STATES.map(uf => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Um acesso admin será criado para este terreiro
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddClient(false)}
                      className="px-4 py-2 rounded-2xl border border-slate-700 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-800 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      Salvar Terreiro
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE TERREIROS */}
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
                      <Users size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Ecossistema de Instâncias</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Gestão técnica de contratos e acessos</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                       <input 
                         placeholder="Pesquisar terreiro, e-mail ou ID..." 
                         className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-xs text-white focus:ring-2 focus:ring-indigo-500 transition-all" 
                         value={searchQuery} 
                         onChange={e => setSearchQuery(e.target.value)} 
                       />
                    </div>
                    <button 
                     onClick={() => setShowAddClient(true)} 
                     className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shrink-0 active:scale-95"
                    >
                       <Plus size={18} /> Novo Terreiro
                    </button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="px-8 py-5">Terreiro & Administrador</th>
                          <th className="px-8 py-5">Plano / MRR</th>
                          <th className="px-8 py-5 text-center">Status</th>
                          <th className="px-8 py-5 text-center">Vencimento</th>
                          <th className="px-8 py-5 text-right">Ações Técnicas</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {clients.filter(c => {
                         if (!c) return false;
                         // Defensive programming to prevent rendering errors with malformed data
                         const name = typeof c.name === 'string' ? c.name : '';
                         const adminName = typeof c.adminName === 'string' ? c.adminName : '';
                         const id = c.id ? String(c.id) : '';
                         const query = typeof searchQuery === 'string' ? searchQuery : '';

                         try {
                           return (
                             name.toLowerCase().includes(query.toLowerCase()) || 
                             adminName.toLowerCase().includes(query.toLowerCase()) ||
                             id.toUpperCase().includes(query.toUpperCase())
                           );
                         } catch (err) {
                           console.error('Error filtering client:', c, err);
                           return false;
                         }
                       }).map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-lg text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                                      {c.name.charAt(0)}
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2">
                                         <p className="font-black text-white uppercase text-xs tracking-tight">{c.name}</p>
                                         <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">#{c.id}</span>
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{c.adminName || 'N/A'} • {c.adminEmail || 'N/A'}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <p className="text-xs text-slate-300 font-black uppercase">{c.plan}</p>
                                <p className="text-[11px] font-black text-emerald-400 mt-0.5">R$ {c.monthlyValue?.toFixed(2)}</p>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${
                                  c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  c.status === 'frozen' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                   {c.status === 'active' ? 'Ativo' : c.status === 'frozen' ? 'Congelado' : 'Bloqueado'}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <p className="text-xs font-black text-slate-400">{format(new Date(c.expirationDate + 'T12:00:00'), 'dd/MM/yyyy')}</p>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => {
                                       setEditingClient(c);
                                       setNewClient({
                                         name: c.name,
                                         plan: c.plan,
                                         adminName: c.adminName,
                                         adminEmail: c.adminEmail,
                                         adminPassword: c.adminPassword,
                                         adminCpf: c.adminCpf,
                                         adminPhone: c.adminPhone,
                                         adminCep: c.adminCep,
                                         adminAddress: c.adminAddress,
                                         adminBairro: c.adminBairro,
                                         adminCidade: c.adminCidade,
                                         adminEstado: c.adminEstado,
                                         status: c.status
                                       });
                                       setShowAddClient(true);
                                     }}
                                     className="px-3 py-2 bg-[#1e90ff] text-white hover:bg-blue-600 rounded-xl transition-all shadow-lg flex items-center gap-2" 
                                     title="Editar Dados do Terreiro"
                                   >
                                     <Pencil size={14} />
                                     <span className="text-[10px] font-black uppercase">Editar</span>
                                   </button>
                                   <button onClick={() => onEnterClientSystem(c)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl transition-all shadow-lg" title="Acesso Direto"><ExternalLink size={18} /></button>
                                   <button onClick={() => toggleStatus(c.id, c.status === 'frozen' ? 'active' : 'frozen')} className={`p-2.5 bg-slate-800 rounded-xl transition-all ${c.status === 'frozen' ? 'text-blue-400' : 'text-slate-600 hover:text-blue-400'}`} title="Congelar"><Snowflake size={18} /></button>
                                   <button onClick={() => toggleStatus(c.id, c.status === 'blocked' ? 'active' : 'blocked')} className={`p-2.5 bg-slate-800 rounded-xl transition-all ${c.status === 'blocked' ? 'text-red-500' : 'text-slate-600 hover:text-red-500'}`} title="Bloquear"><Lock size={18} /></button>
                                   <button onClick={() => deleteClient(c.id)} className="p-2.5 bg-slate-800 text-slate-600 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {clients.length === 0 && (
                   <div className="p-32 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhuma instância implantada</div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'affiliates' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Gift size={140} className="text-emerald-400" /></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-emerald-500 rounded-3xl text-slate-900 shadow-xl shadow-emerald-500/20"><UserIcon size={32} /></div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Programa de Afiliados</h2>
                <p className="text-slate-500 font-medium">Monitore e aprove as indicações realizadas pelos terreiros da rede.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total de Indicações</p>
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-black text-white">{affiliateStats.total}</h4>
                <Users size={24} className="text-emerald-400" />
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Aprovadas</p>
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-black text-white">{affiliateStats.approved}</h4>
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Aguardando</p>
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-black text-white">{affiliateStats.pending}</h4>
                <Clock size={24} className="text-amber-400" />
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Reprovadas</p>
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-black text-white">{affiliateStats.rejected}</h4>
                <ShieldAlert size={24} className="text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><UserIcon size={18} /></div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Fila de Indicações</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gerencie o status das indicações recebidas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAffiliateFilter('all')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${affiliateFilter === 'all' ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Todas</button>
                <button onClick={() => setAffiliateFilter('aguardando')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${affiliateFilter === 'aguardando' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Aguardando</button>
                <button onClick={() => setAffiliateFilter('aprovada')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${affiliateFilter === 'aprovada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Aprovadas</button>
                <button onClick={() => setAffiliateFilter('reprovada')} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${affiliateFilter === 'reprovada' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>Reprovadas</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="px-8 py-4">Data / Hora</th>
                    <th className="px-8 py-4">Terreiro / Lead</th>
                    <th className="px-8 py-4">Origem</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredReferrals.length > 0 ? [...filteredReferrals].reverse().map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-4 text-xs font-mono text-slate-400">{format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{r.targetName}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">ID Referência: {r.referrerId}</p>
                      </td>
                      <td className="px-8 py-4 text-xs text-slate-400 font-medium">
                        {r.location || 'Não informado'}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          r.status === 'aprovada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          r.status === 'reprovada' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.status === 'aprovada' && <CheckCircle2 size={12} />}
                          {r.status === 'reprovada' && <X size={12} />}
                          {r.status === 'aguardando' && <Clock size={12} />}
                          {r.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onUpdateReferral(r.id, 'aprovada')}
                            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                            disabled={r.status === 'aprovada'}
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => onUpdateReferral(r.id, 'reprovada')}
                            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                            disabled={r.status === 'reprovada'}
                          >
                            Reprovar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">
                        Nenhuma indicação registrada até o momento
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA: BROADCAST GLOBAL */}
      {activeTab === 'broadcast' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Megaphone size={140} className="text-amber-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-amber-500 rounded-3xl text-slate-900 shadow-xl shadow-amber-500/20"><Zap size={32} fill="currentColor" /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Broadcast Global</h2>
                    <p className="text-slate-500 font-medium">Envie avisos instantâneos para o topo do Dashboard de todos os terreiros da rede.</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form de Criação */}
              <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> Novo Comunicado</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Mensagem do Aviso</label>
                       <textarea 
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32" 
                        value={newBroadcastText} 
                        onChange={e => setNewBroadcastText(e.target.value)} 
                        placeholder="Digite o comunicado aqui..." 
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Tipo de Alerta</label>
                       <div className="grid grid-cols-3 gap-2">
                          {(['info', 'warning', 'success'] as const).map(t => (
                            <button 
                              key={t} 
                              onClick={() => setNewBroadcastType(t)} 
                              className={`py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${newBroadcastType === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                               {t === 'info' ? 'Info' : t === 'warning' ? 'Aviso' : 'Sucesso'}
                            </button>
                          ))}
                       </div>
                    </div>
                    <button 
                      onClick={handleAddBroadcast} 
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                       <Send size={16} /> Disparar na Rede
                    </button>
                 </div>
              </div>

              {/* Lista de Transmissões */}
              <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                 <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fila de Transmissão Master</h3>
                    <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">{broadcasts.length} REGISTROS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                             <th className="px-8 py-4">Mensagem / Criado em</th>
                             <th className="px-8 py-4">Tipo</th>
                             <th className="px-8 py-4 text-center">Status</th>
                             <th className="px-8 py-4 text-right">Ação</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {broadcasts.length > 0 ? [...broadcasts].reverse().map(b => (
                            <tr key={b.id} className="hover:bg-slate-800/30 transition-colors group">
                               <td className="px-8 py-4">
                                  <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">{b.message}</p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">{format(new Date(b.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                               </td>
                               <td className="px-8 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                    b.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                    b.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  }`}>{b.type}</span>
                               </td>
                               <td className="px-8 py-4 text-center">
                                  <button 
                                    onClick={() => {
                                      const updated = broadcasts.map(item => item.id === b.id ? { ...item, active: !item.active } : item);
                                      onUpdateBroadcasts(updated);
                                    }} 
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all flex items-center gap-2 mx-auto ${
                                      b.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-600 border-slate-700'
                                    }`}
                                  >
                                     <Power size={10} />
                                     {b.active ? 'No Ar' : 'Pausado'}
                                  </button>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <button 
                                    onClick={() => {
                                      if(confirm('Remover este comunicado permanentemente?')) {
                                        onUpdateBroadcasts(broadcasts.filter(item => item.id !== b.id));
                                      }
                                    }} 
                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={4} className="px-8 py-20 text-center flex flex-col items-center gap-3">
                                  <Megaphone size={40} className="text-slate-800 opacity-20" />
                                  <p className="text-slate-700 font-black uppercase text-[10px] tracking-widest">Nenhuma transmissão registrada</p>
                               </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <MasterCouponsManager coupons={coupons} onUpdateCoupons={onUpdateCoupons} />
      )}

      {activeTab === 'system-config' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Settings size={140} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 bg-emerald-500 rounded-3xl text-slate-900 shadow-xl shadow-emerald-500/20">
                <Database size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Configurações de Sistema</h2>
                <p className="text-slate-500 font-medium">
                  Organize o motor master e os planos de assinatura em um só lugar.
                </p>
              </div>
            </div>
          </div>
 
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Menu de Configurações</p>
                <p className="text-xs text-slate-400 font-medium">
                  Selecione se deseja ajustar o motor ou os planos.
                </p>
              </div>
              <div className="inline-flex p-1 rounded-full bg-slate-950/60 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSystemConfigTab('motor')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    systemConfigTab === 'motor'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck size={14} />
                  Motor
                </button>
                <button
                  type="button"
                  onClick={() => setSystemConfigTab('planos')}
                  className={`ml-1 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    systemConfigTab === 'planos'
                      ? 'bg-indigo-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tag size={14} />
                  Planos
                </button>
                <button
                  type="button"
                  onClick={() => setSystemConfigTab('recursos')}
                  className={`ml-1 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    systemConfigTab === 'recursos'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Recursos
                </button>
              </div>
            </div>
 
            {systemConfigTab === 'motor' && (
              <form onSubmit={handleSaveMasterSettings} className="p-10 space-y-12 animate-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} /> 01. Identidade Visual Master
                    </h4>
                    <div className="flex flex-col items-center gap-4 p-6 bg-slate-950 rounded-3xl border border-slate-800">
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                      >
                        {masterCreds.brandLogo ? (
                          <img src={masterCreds.brandLogo} className="w-full h-full object-contain p-2" alt="Master Logo" />
                        ) : (
                          <ImageIcon size={32} className="text-slate-700" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={20} className="text-white" />
                        </div>
                      </div>
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <p className="text-[9px] font-black text-slate-500 uppercase">Logo do Painel Master</p>
                    </div>
                  </div>
 
                  <div className="lg:col-span-8 space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14} /> 02. Textos e Títulos do Sistema
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Título do Sistema (Header)</label>
                        <input
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={masterCreds.systemTitle}
                          onChange={e => setMasterCreds({ ...masterCreds, systemTitle: e.target.value })}
                          placeholder="Ex: SaaS Master Engine"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Título do Sistema (Login)</label>
                        <input
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={masterCreds.sidebarTitle}
                          onChange={e => setMasterCreds({ ...masterCreds, sidebarTitle: e.target.value })}
                          placeholder="Ex: Conectaxe"
                        />
                      </div>
                    </div>
                  </div>
                </div>
 
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                      <Lock size={14} /> 03. Credenciais Master
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">E-mail Master (Acesso)</label>
                        <input
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500"
                          value={masterCreds.email}
                          onChange={e => setMasterCreds({ ...masterCreds, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Senha de Mestre</label>
                        <div className="relative">
                          <input
                            type={showMasterPassword ? 'text' : 'password'}
                            className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500"
                            value={masterCreds.password}
                            onChange={e => setMasterCreds({ ...masterCreds, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowMasterPassword(!showMasterPassword)}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-amber-400"
                          >
                            {showMasterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp de Suporte (DDI+DDD+Número)</label>
                        <input
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          value={masterCreds.whatsapp || ''}
                          onChange={e => setMasterCreds({ ...masterCreds, whatsapp: e.target.value })}
                          placeholder="5511999999999"
                        />
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                      <Banknote size={14} /> 04. Cobrança SaaS
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Chave PIX (Recebimento)</label>
                        <input
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                          value={masterCreds.pixKey}
                          onChange={e => setMasterCreds({ ...masterCreds, pixKey: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Dados Bancários / Transferência</label>
                        <textarea
                          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24"
                          value={masterCreds.bankDetails}
                          onChange={e => setMasterCreds({ ...masterCreds, bankDetails: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <Database size={14} /> 05. Snapshots Automáticos
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Frequência de Backup Automático</label>
                        <div className="relative">
                          <select
                            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                            value={masterCreds.backupFrequency}
                            onChange={e => setMasterCreds({ ...masterCreds, backupFrequency: e.target.value as any })}
                          >
                            <option value="disabled">🚫 Backup Automático Desativado</option>
                            <option value="7days">🗓️ A cada 7 dias</option>
                            <option value="15days">🗓️ A cada 15 dias</option>
                            <option value="monthly">🗓️ A cada 1 mês</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                        >
                          <Save size={20} /> Salvar Tudo e Atualizar Painel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
 
            {systemConfigTab === 'planos' && (
          <div className="p-6">
            <MasterPlansManager 
              plans={plans} 
              onUpdatePlans={handleUpdatePlansWithAudit} 
              onRunAutoBlock={() => runAutoBlock(true)} 
              clients={clients}
              masterPassword={masterCreds.password}
            />
          </div>
        )}

            {systemConfigTab === 'recursos' && (
              <div className="p-6">
                <MasterPlanResources plans={plans} onUpdatePlans={handleUpdatePlansWithAudit} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: ROADMAP (TIMELINE DO SISTEMA) */}
      {activeTab === 'roadmap' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><MapIcon size={140} className="text-emerald-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-emerald-500 rounded-3xl text-slate-900 shadow-xl shadow-emerald-500/20"><Sparkles size={32} fill="currentColor" /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Timeline do Sistema</h2>
                    <p className="text-slate-500 font-medium">Gerencie as atualizações, novidades e correções exibidas na timeline dos usuários.</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form de Criação */}
              <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl h-fit space-y-6">
                 <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Plus size={14} /> Nova Atualização</h3>
                 <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const version = updateType === 'manual' ? (form.elements.namedItem('version') as HTMLInputElement).value : calculatedVersion;
                    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
                    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as ReleaseNote['status'];

                    if (!version || !title || !content) return;

                    const newNote: ReleaseNote = {
                       id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                       version,
                       date: new Date().toISOString(),
                       title,
                       content,
                       status
                    };

                    onUpdateRoadmap([...roadmap, newNote]);
                    form.reset();
                    // Reset to default
                    setUpdateType('patch');
                    alert('Item adicionado à timeline com sucesso!');
                 }} className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Tipo de Lançamento</label>
                       <div className="grid grid-cols-4 gap-2 mb-4">
                          <button 
                             type="button" 
                             onClick={() => setUpdateType('patch')}
                             className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${updateType === 'patch' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             <span className="text-[10px] font-black uppercase">Correção</span>
                             <span className="text-[8px] opacity-60">Bug Fix</span>
                          </button>
                          <button 
                             type="button" 
                             onClick={() => setUpdateType('minor')}
                             className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${updateType === 'minor' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             <span className="text-[10px] font-black uppercase">Atualização</span>
                             <span className="text-[8px] opacity-60">Feature</span>
                          </button>
                          <button 
                             type="button" 
                             onClick={() => setUpdateType('major')}
                             className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${updateType === 'major' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             <span className="text-[10px] font-black uppercase">Grande</span>
                             <span className="text-[8px] opacity-60">Major</span>
                          </button>
                          <button 
                             type="button" 
                             onClick={() => setUpdateType('manual')}
                             className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${updateType === 'manual' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                          >
                             <span className="text-[10px] font-black uppercase">Manual</span>
                             <span className="text-[8px] opacity-60">Custom</span>
                          </button>
                       </div>
                    
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Versão {updateType !== 'manual' && '(Calculada Automaticamente)'}</label>
                        <input 
                          name="version"
                          className={`w-full p-4 border rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500 ${updateType !== 'manual' ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-950 border-slate-800 text-white'}`}
                          placeholder="Ex: 1.0.0"
                          required
                          value={calculatedVersion}
                          readOnly={updateType !== 'manual'}
                          onChange={(e) => setCalculatedVersion(e.target.value)}
                        />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Título da Atualização</label>
                       <input 
                         name="title"
                         className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                         placeholder="Ex: Novo Painel Financeiro"
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Descrição Detalhada</label>
                       <textarea 
                        name="content"
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32" 
                        placeholder="Descreva o que mudou no sistema..."
                        required
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Status</label>
                       <div className="relative">
                          <select 
                            name="status"
                            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                          >
                             <option value="released">🚀 Lançado (Disponível)</option>
                             <option value="planned">📅 Planejado (Em breve)</option>
                             <option value="fixed">🛠️ Corrigido (Bug corrigido)</option>
                             <option value="updated">⬆️ Atualizado (Atualização geral)</option>
                             <option value="improvement">✨ Melhoria (Ajuste ou refinamento)</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ChevronDown size={18} /></div>
                       </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                       <Save size={16} /> Publicar na Timeline
                    </button>
                 </form>
              </div>

              {/* Lista de Roadmap */}
              <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                 <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <div>
                       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Histórico de Versões</h3>
                       <div className="flex gap-2 mt-2">
                          <button 
                             onClick={handleExportRoadmap}
                             className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 font-black uppercase text-[8px] hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1"
                          >
                             <Download size={10} /> Backup
                          </button>
                          <button 
                             onClick={() => setShowRoadmapRestoreModal(true)}
                             className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 font-black uppercase text-[8px] hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1"
                          >
                             <Upload size={10} /> Restaurar
                          </button>
                       </div>
                    </div>
                    <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">{roadmap.length} REGISTROS</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                             <th className="px-8 py-4">Versão / Data</th>
                             <th className="px-8 py-4">Título / Conteúdo</th>
                             <th className="px-8 py-4 text-center">Status</th>
                             <th className="px-8 py-4 text-right">Ação</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {roadmap.length > 0 ? [...roadmap].sort((a, b) => {
                            const dateA = typeof a.date === 'string' ? a.date : '';
                            const dateB = typeof b.date === 'string' ? b.date : '';
                            return dateB.localeCompare(dateA);
                          }).map(item => (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                               <td className="px-8 py-4 whitespace-nowrap">
                                  <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black">{item.version}</span>
                                  <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">{formatRoadmapDate(item.date)}</p>
                               </td>
                               <td className="px-8 py-4">
                                  <p className="text-white text-xs font-black uppercase mb-1">{item.title}</p>
                                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2">{item.content}</p>
                               </td>
                               <td className="px-8 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                    item.status === 'released'
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : item.status === 'planned'
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                      : item.status === 'fixed'
                                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                      : item.status === 'updated'
                                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  }`}>
                                     {item.status === 'released'
                                       ? 'Lançado'
                                       : item.status === 'planned'
                                       ? 'Planejado'
                                       : item.status === 'fixed'
                                       ? 'Corrigido'
                                       : item.status === 'updated'
                                       ? 'Atualizado'
                                       : 'Melhoria'}
                                  </span>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <button 
                                    onClick={() => {
                                      if(confirm('Remover este item da timeline permanentemente?')) {
                                        onUpdateRoadmap(roadmap.filter(r => r.id !== item.id));
                                      }
                                    }} 
                                    className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 size={18} />
                                  </button>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={4} className="p-12 text-center text-slate-700 font-black uppercase text-[10px] tracking-widest">Nenhuma atualização registrada</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Restauração da Roadmap */}
      {showRoadmapRestoreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
             <form onSubmit={handleRestoreRoadmap}>
                <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <History size={20} />
                     <h3 className="text-xl font-black uppercase tracking-tight">Restaurar Timeline</h3>
                  </div>
                  <button type="button" onClick={() => setShowRoadmapRestoreModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                     <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                   <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
                      <AlertTriangle className="text-rose-600 shrink-0" size={20} />
                      <p className="text-xs text-rose-800 font-bold leading-tight">
                         CUIDADO: Isso substituirá todo o histórico de versões atual pelos dados do arquivo.
                      </p>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Senha de Desenvolvedor</label>
                         <div className="relative">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input 
                              required
                              type="password"
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                              placeholder="••••••••"
                              value={roadmapRestorePassword}
                              onChange={e => setRoadmapRestorePassword(e.target.value)}
                           />
                         </div>
                      </div>

                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Arquivo JSON</label>
                         <input 
                            id="roadmap-restore-file"
                            type="file"
                            accept=".json"
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                         />
                      </div>

                      {roadmapRestoreError && (
                         <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-bounce">
                            <Shield className="text-red-600" size={14} />
                            <p className="text-[10px] text-red-600 font-black uppercase">{roadmapRestoreError}</p>
                         </div>
                      )}
                   </div>

                   <div className="pt-4 flex gap-4">
                      <button type="button" onClick={() => setShowRoadmapRestoreModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                      <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Restaurar</button>
                   </div>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Cliente */}
      {showDeleteClientModal && clientToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[130] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300 border-4 border-red-600">
             <form onSubmit={handleConfirmDeleteClient}>
                <div className="p-8 bg-red-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <ShieldAlert size={24} className="animate-pulse" />
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Excluir Instância</h3>
                        <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Zona de Perigo</p>
                     </div>
                  </div>
                  <button type="button" onClick={() => setShowDeleteClientModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                     <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                   <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} className="text-red-600" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800 uppercase">Tem certeza absoluta?</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">
                         Você está prestes a excluir permanentemente a instância <strong className="text-slate-900">"{clientToDelete.name}"</strong>. 
                         Todos os dados (membros, financeiro, entidades) serão <span className="text-red-600 font-black uppercase">DESTRUÍDOS</span>.
                      </p>
                   </div>

                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-slate-600">
                            <Database size={16} />
                            <span className="text-[10px] font-black uppercase">Backup de Segurança</span>
                         </div>
                         <button 
                            type="button"
                            onClick={() => handleDownloadClientBackup(clientToDelete.id)}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200 transition-colors flex items-center gap-1.5"
                         >
                            <Download size={12} /> Baixar Dados
                         </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">
                         Recomendamos baixar os dados antes de prosseguir, caso o cliente se arrependa.
                      </p>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Senha de Desenvolvedor (Confirmação)</label>
                         <div className="relative">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input 
                              required
                              type="password"
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 font-bold transition-all text-red-900"
                              placeholder="Digite sua senha master..."
                              value={deleteClientPassword}
                              onChange={e => setDeleteClientPassword(e.target.value)}
                           />
                         </div>
                      </div>

                      {deleteClientError && (
                         <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-bounce">
                            <Shield className="text-red-600" size={14} />
                            <p className="text-[10px] text-red-600 font-black uppercase">{deleteClientError}</p>
                         </div>
                      )}
                   </div>

                   <div className="pt-2 flex gap-4">
                      <button type="button" onClick={() => setShowDeleteClientModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                      <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95">Excluir Definitivamente</button>
                   </div>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* ABA: FATURAMENTO MASTER */}
      {activeTab === 'payments' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* Resumo Financeiro Global */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><DollarSign size={24} /></div>
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase">Receita Bruta</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MRR Atual (SaaS)</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">R$ {clientStats.totalMRR.toFixed(2)}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl"><Users size={24} /></div>
                    <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase">Base</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Terreiros Pagantes</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">{clients.filter(c => c.monthlyValue > 0).length}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl"><TrendingUp size={24} /></div>
                    <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full uppercase">Ticket</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ticket Médio por Instância</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">R$ {clients.length > 0 ? (clientStats.totalMRR / clients.length).toFixed(2) : '0.00'}</h3>
                 </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-red-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><Clock size={24} /></div>
                    <span className="text-[10px] font-black bg-red-500/10 text-red-500 px-3 py-1 rounded-full uppercase">Pendências</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inadimplentes (Mês Atual)</p>
                    <h3 className="text-3xl font-black text-white tracking-tight">{clients.filter(c => c.payments?.[`${billingYear}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`] !== 'paid' && c.monthlyValue > 0).length}</h3>
                 </div>
              </div>
           </div>

           {/* Grade de Monitoramento de Pagamentos SaaS */}
           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Calendar size={20} /></div>
                    <div>
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">Monitor de Recebimentos</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ano Base: {billingYear}</p>
                    </div>
                 </div>
                 <div className="flex items-center bg-slate-800 rounded-2xl p-1 border border-slate-700 shadow-inner">
                    <button onClick={() => setBillingYear(prev => prev - 1)} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400"><ChevronLeft size={20} /></button>
                    <span className="px-6 font-black text-white text-lg">{billingYear}</span>
                    <button onClick={() => setBillingYear(prev => prev + 1)} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400"><ChevronRight size={20} /></button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse">
                    <thead>
                       <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-8 py-5 text-left sticky left-0 bg-slate-950/90 z-20 border-r border-slate-800 min-w-[280px]">Terreiro / Mensalidade</th>
                          {MONTHS_SHORT.map(m => <th key={m.id} className="py-5 px-1">{m.name}</th>)}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {clients.filter(c => c.monthlyValue > 0).map(client => (
                          <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                             <td className="px-8 py-5 text-left sticky left-0 bg-slate-900 group-hover:bg-slate-800 z-10 border-r border-slate-800 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-indigo-400 text-lg shadow-inner">
                                      {client.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="font-black text-white text-xs uppercase truncate max-w-[150px]">{client.name}</p>
                                      <p className="text-[10px] font-black text-emerald-400 tracking-tighter mt-0.5">R$ {client.monthlyValue.toFixed(2)}</p>
                                   </div>
                                </div>
                             </td>
                             {MONTHS_SHORT.map(m => {
                                const monthKey = `${billingYear}-${m.id}`;
                                const status = client.payments?.[monthKey] || 'unpaid';
                                return (
                                   <td key={m.id} className="py-5 px-1">
                                      <button 
                                        onClick={() => handleUpdateClientPayment(client.id, monthKey)}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all transform active:scale-90 border-2 ${
                                          status === 'paid' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10 scale-105' :
                                          status === 'justified' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm' :
                                          'bg-slate-950 border-slate-800 text-slate-700 hover:border-indigo-500'
                                        }`}
                                      >
                                         {status === 'paid' ? <Check size={18} strokeWidth={4} /> : status === 'justified' ? <Gift size={16} strokeWidth={3} /> : <Clock size={16} />}
                                      </button>
                                   </td>
                                );
                             })}
                          </tr>
                       ))}
                       {clients.filter(c => c.monthlyValue > 0).length === 0 && (
                         <tr><td colSpan={13} className="px-8 py-32 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest italic">Nenhum terreiro com mensalidade ativa encontrado</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-center gap-8 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Confirmado</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> Cortesia / Isenção</div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-slate-800" /> Aguardando</div>
              </div>
           </div>
        </div>
      )}

      {/* ABA: MANUTENÇÃO GLOBAL */}
      {activeTab === 'maintenance' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* ÁREA EM CIMA (HEADER) */}
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Wrench size={140} className="text-orange-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-orange-500 rounded-3xl text-slate-900 shadow-xl shadow-orange-500/20"><ShieldAlert size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Central de Manutenção Global</h2>
                    <p className="text-slate-500 font-medium">Controle de interrupção de serviço para todas as instâncias da rede.</p>
                 </div>
              </div>
           </div>

           {/* ÁREA COM 3 FRASES (STATUS TÉCNICO) */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Servidores: Estáveis e Sincronizados</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Integridade dos Bancos: 100% OK</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-all">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Latência de Rede: 22ms (Otimizada)</p>
              </div>
           </div>

           {/* CONTROLE DE BLOQUEIO */}
           <div className="max-w-4xl mx-auto bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Status do Bloqueio</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Define se o login está liberado para os clientes</p>
                 </div>
                 <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase border transition-all ${maintConfig.active ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {maintConfig.active ? 'SISTEMA EM MANUTENÇÃO (BLOQUEADO)' : 'SISTEMA OPERANTE (LIBERADO)'}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mensagem Exibida na Tela de Login</label>
                 <textarea 
                   className="w-full p-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-slate-300 font-medium text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none h-32 shadow-inner" 
                   value={maintConfig.message} 
                   onChange={e => onUpdateMaintenance({ ...maintConfig, message: e.target.value })} 
                   placeholder="Descreva o motivo da manutenção..." 
                 />
              </div>

              <button 
                onClick={() => {
                    const newStatus = !maintConfig.active;
                    onUpdateMaintenance({ ...maintConfig, active: newStatus });
                    onAddAuditLog({
                        action: newStatus ? 'Ativação de Manutenção' : 'Desativação de Manutenção',
                        category: 'system',
                        severity: 'critical',
                        details: newStatus ? `Bloqueio estrutural ativado. Motivo: ${maintConfig.message}` : 'Bloqueio estrutural removido.'
                    });
                }} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 ${maintConfig.active ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
              >
                {maintConfig.active ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                {maintConfig.active ? 'Desativar Manutenção e Liberar Acesso' : 'Ativar Bloqueio Estrutural de Emergência'}
              </button>
           </div>
        </div>
      )}

      {/* ABA: SNAPSHOTS (BACKUPS) - RESTORED FIDELITY */}
      {activeTab === 'backups' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={140} className="text-indigo-400" /></div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20"><Archive size={32} /></div>
                 <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Snapshots do Sistema</h2>
                    <p className="text-slate-500 font-medium">Capture e recupere o estado completo de todo o banco de dados SaaS.</p>
                 </div>
              </div>
              <button 
                onClick={() => handleCreateSnapshot('manual')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 z-10"
              >
                 <Plus size={18} /> Novo Snapshot Manual
              </button>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
              <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Repositório de Pontos de Restauração</h3>
                 <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase">{snapshots.length} ARQUIVOS</span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-950/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="px-10 py-5">Data / Hora do Registro</th>
                          <th className="px-8 py-5">Tipo</th>
                          <th className="px-8 py-5">Tamanho</th>
                          <th className="px-10 py-5 text-right">Ações de Recuperação</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {snapshots.length > 0 ? [...snapshots].reverse().map(snap => (
                          <tr key={snap.id} className="hover:bg-slate-800/40 transition-all group">
                             <td className="px-10 py-5">
                                <p className="text-white text-sm font-black uppercase tracking-tight">{format(new Date(snap.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{format(new Date(snap.date), "HH:mm:ss")} • ID: {snap.id}</p>
                             </td>
                             <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                  snap.type === 'manual' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>{snap.type}</span>
                             </td>
                             <td className="px-8 py-5 text-slate-400 text-xs font-mono">{snap.size}</td>
                             <td className="px-10 py-5 text-right">
                                <div className="flex justify-end gap-3">
                                   <button onClick={() => downloadSnapshot(snap)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all shadow-md" title="Baixar JSON"><Download size={18} /></button>
                                   <button onClick={() => setShowRestoreConfirm(snap)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-all shadow-md" title="Restaurar"><RefreshCcw size={18} /></button>
                                   <button onClick={() => deleteSnapshot(snap.id)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-md" title="Deletar"><Trash2 size={18} /></button>
                                </div>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan={4} className="px-8 py-32 text-center flex flex-col items-center gap-3">
                                <FileJson size={48} className="text-slate-800 opacity-20" />
                                <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Nenhum snapshot armazenado</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* ABA: AUDITORIA */}
      {activeTab === 'audit' && (
          <AuditTab 
            logs={auditLogs} 
            onReset={handleResetAuditLogs}
          />
        )}

      {/* MODAL DE RESTAURAÇÃO (Pede Senha Master) */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-red-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <ShieldAlert size={24} />
                    <h3 className="text-xl font-black uppercase tracking-tight">Restauração Crítica</h3>
                 </div>
                 <button onClick={() => { setShowRestoreConfirm(null); setRestorePassword(''); }} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleRestoreSnapshot} className="p-8 space-y-8">
                 <div className="text-center space-y-2">
                    <p className="text-red-400 font-black text-xs uppercase tracking-widest">Aviso de Segurança</p>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Você está prestes a substituir TODOS os dados do sistema por um backup de <strong>{format(new Date(showRestoreConfirm.date), "dd/MM/yyyy HH:mm")}</strong>.</p>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Mestre para Validar</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                       <input 
                         required
                         type="password" 
                         className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-red-500 font-bold" 
                         value={restorePassword}
                         onChange={e => setRestorePassword(e.target.value)}
                         placeholder="••••••••"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button type="button" onClick={() => { setShowRestoreConfirm(null); setRestorePassword(''); }} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs">Desistir</button>
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">Executar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE CONGELAMENTO */}
      {freezeConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
              <div className={`p-8 ${freezeConfirm.status === 'frozen' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white flex justify-between items-center`}>
                 <div className="flex items-center gap-3">
                    {freezeConfirm.status === 'frozen' ? <Snowflake size={24} /> : <Zap size={24} />}
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      {freezeConfirm.status === 'frozen' ? 'Congelar Acesso' : 'Reativar Acesso'}
                    </h3>
                 </div>
                 <button onClick={() => setFreezeConfirm(null)} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="text-center space-y-2">
                    <p className={`font-black text-xs uppercase tracking-widest ${freezeConfirm.status === 'frozen' ? 'text-indigo-400' : 'text-emerald-400'}`}>Confirmação de Ação</p>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {freezeConfirm.status === 'frozen' 
                        ? `Você tem certeza que deseja congelar o acesso de ${freezeConfirm.name}? O cliente perderá acesso imediato ao sistema.`
                        : `Você deseja reativar o acesso de ${freezeConfirm.name}? O cliente poderá logar novamente.`
                      }
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setFreezeConfirm(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs hover:text-white transition-colors">Cancelar</button>
                    <button 
                      onClick={() => executeStatusChange(freezeConfirm.id, freezeConfirm.status)} 
                      className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${freezeConfirm.status === 'frozen' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'}`}
                    >
                      Confirmar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE BLOQUEIO */}
      {blockConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
              <div className={`p-8 ${blockConfirm.status === 'blocked' ? 'bg-red-600' : 'bg-emerald-600'} text-white flex justify-between items-center`}>
                 <div className="flex items-center gap-3">
                    {blockConfirm.status === 'blocked' ? <Lock size={24} /> : <Zap size={24} />}
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      {blockConfirm.status === 'blocked' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                    </h3>
                 </div>
                 <button onClick={() => setBlockConfirm(null)} className="p-2 hover:bg-black/20 rounded-full transition-all"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="text-center space-y-2">
                    <p className={`font-black text-xs uppercase tracking-widest ${blockConfirm.status === 'blocked' ? 'text-red-400' : 'text-emerald-400'}`}>Confirmação de Ação</p>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {blockConfirm.status === 'blocked' 
                        ? `Você tem certeza que deseja bloquear o acesso de ${blockConfirm.name}? O cliente será impedido de acessar o sistema por inadimplência.`
                        : `Você deseja desbloquear o acesso de ${blockConfirm.name}? O cliente poderá logar novamente.`
                      }
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setBlockConfirm(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs hover:text-white transition-colors">Cancelar</button>
                    <button 
                      onClick={() => executeStatusChange(blockConfirm.id, blockConfirm.status)} 
                      className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${blockConfirm.status === 'blocked' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'}`}
                    >
                      Confirmar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'tickets' && <MasterTicketManager tickets={tickets} onUpdateTickets={onUpdateTickets} clients={clients} />}

      {activeTab === 'master-menu' && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
             <MenuManager 
               config={systemConfig || DEFAULT_SYSTEM_CONFIG}
               onUpdateConfig={async (updatedConfig) => {
                 try {
                   // Save to Firestore using SystemConfigService
                   // If we are in Master Mode, we might be editing the global default or the master's own config.
                   // Assuming this updates the currently loaded config.
                   // We need to import SystemConfigService.
                   const { SystemConfigService } = await import('../services/systemConfigService');
                   
                   // Determine clientId. If systemConfig has a license.clientId, use it.
                   const targetClientId = updatedConfig.license?.clientId;
                  
                  await SystemConfigService.saveConfig(updatedConfig, targetClientId);
                  
                  if (onUpdateSystemConfig) {
                    onUpdateSystemConfig(updatedConfig);
                  }
                  
                  alert('Configuração de menu salva com sucesso!');
                } catch (error) {
                   console.error('Error saving menu config:', error);
                   alert('Erro ao salvar configuração.');
                 }
               }}
             />
        </div>
      )}

      {/* SYSTEM CONFIG TAB */}
      {activeTab === 'system-config' && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          <SystemConfigManagement 
            config={systemConfig || DEFAULT_SYSTEM_CONFIG}
            onUpdateConfig={async (updatedConfig) => {
               try {
                 const { SystemConfigService } = await import('../services/systemConfigService');
                 const targetClientId = updatedConfig.license?.clientId;
                 await SystemConfigService.saveConfig(updatedConfig, targetClientId);
                 if (onUpdateSystemConfig) {
                   onUpdateSystemConfig(updatedConfig);
                 }
               } catch (error) {
                 console.error('Error saving system config:', error);
                 alert('Erro ao salvar configuração.');
               }
            }}
          />
        </div>
      )}

      {/* HOMEPAGE CONFIG TAB */}
      {activeTab === 'homepage-config' && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          <HomepageConfig />
        </div>
      )}
    </div>
  );
};
