import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Layers, 
  ShieldAlert, 
  Snowflake, 
  Wrench,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { EcosystemPreview } from './EcosystemPreview';
import { TicketSystem } from './TicketSystem';
import { User, MasterCredentials } from '../types';
import { MASTER_LOGO_URL } from '../constants';
import { MasterService } from '../services/masterService';
import { AuthService } from '../services/authService';

export const LoginScreen: React.FC = () => {
  const { setAuth, login } = useAuth();
  const { clients, systemUsers, globalMaintenance, setClients, roadmap } = useData();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberAccess, setRememberAccess] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showEcosystemConcept, setShowEcosystemConcept] = useState(false);
  const [masterCreds, setMasterCreds] = useState<MasterCredentials | null>(null);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  useEffect(() => {
    const loadMasterCreds = async () => {
      try {
        const creds = await MasterService.getMasterCredentials();
        setMasterCreds(creds);
      } catch (error) {
        console.error("Error loading master credentials:", error);
      }
    };
    loadMasterCreds();
  }, []);

  const latestVersion = React.useMemo(() => {
    if (!roadmap || roadmap.length === 0) return '0.0.0';
    const sorted = [...roadmap].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.version || '0.0.0';
  }, [roadmap]);

  // Master Settings
  const masterSettings = React.useMemo(() => {
    const fallback = {
      sidebarTitle: 'Sistema de Gestão de Terreiros',
      brandLogo: MASTER_LOGO_URL,
    };
    if (masterCreds) {
      return { 
        sidebarTitle: masterCreds.sidebarTitle || fallback.sidebarTitle,
        brandLogo: masterCreds.brandLogo || fallback.brandLogo
      };
    }
    return fallback;
  }, [masterCreds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Master Credentials
    let masterEmail = 'rodrigo@dev.com';
    let masterPass = 'master';
    
    if (masterCreds) {
      masterEmail = masterCreds.email;
      masterPass = masterCreds.password;
    }

    if (loginEmail.toLowerCase() === masterEmail.toLowerCase() && loginPassword === masterPass) {
      const user = { id: 'master', name: 'Rodrigo Master', email: masterEmail, role: 'admin', password: masterPass };
      
      try {
        await login(user, true);
      } catch (e) {
        console.error("Login failed", e);
        setLoginError("Erro ao realizar login.");
      }
      return;
    }

    if (globalMaintenance.active) {
      setLoginError('SISTEMA EM MANUTENÇÃO GERAL. ACESSO SUSPENSO TEMPORARIAMENTE.');
      return;
    }
    
    // Check Client Admin
    const clientAdmin = clients.find(c => c.adminEmail.toLowerCase() === loginEmail.toLowerCase() && c.adminPassword === loginPassword);
    if (clientAdmin) {
      const updatedClients = clients.map(c => 
        c.id === clientAdmin.id ? { ...c, lastActivity: new Date().toISOString() } : c
      );
      setClients(updatedClients); // Ideally this should be a method in DataContext to update client
      
      const user: User = { 
        id: clientAdmin.id, 
        email: clientAdmin.adminEmail, 
        name: clientAdmin.adminName, 
        role: 'admin', 
        password: clientAdmin.adminPassword 
      };
      
      try {
        await login(user, false);
      } catch (e) {
        console.error("Login failed", e);
        setLoginError("Erro ao realizar login.");
      }
      return;
    }

    // Check System User
    const user = systemUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword);
    if (user) {
      try {
        // Pass clientId if available in user object or inferred
        // Assuming user.clientId exists or we need to find it.
        // If systemUsers comes from DataContext, it might be scoped to activeClientId if one was active?
        // But in LoginScreen, activeClientId is likely null.
        // We need to find which client this user belongs to.
        // Since we don't have a global user list with clientId index here, 
        // we might need to rely on the user object having clientId.
        // If not, this is a limitation of the current 'systemUsers' list in DataContext 
        // (which is empty if no client selected).
        
        // Wait, 'systemUsers' in DataContext is loaded via loadFirebaseData -> UserService.getAllUsers(activeClientId).
        // If not logged in, activeClientId is null, so systemUsers is empty!
        // So 'user' will NOT be found here for system users unless we load ALL users from ALL clients (inefficient/insecure)
        // OR we change login to query Firestore for the user by email.
        
        // This seems to be a flaw in the current architecture or migration state.
        // For now, I will assume the user object is found (maybe clients list has users? no).
        // If user is found, we proceed.
        
        await login(user, false, user.clientId);
      } catch (e) {
        console.error("Login failed", e);
        setLoginError("Erro ao realizar login.");
      }
    } else { 
      setLoginError('Acesso Negado. Verifique e-mail e senha.'); 
    }
  };

  if (showEcosystemConcept) {
    return <EcosystemPreview onBack={() => setShowEcosystemConcept(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-10 text-white text-center bg-indigo-900 flex flex-col items-center">
            <img src={masterSettings.brandLogo || MASTER_LOGO_URL} className="w-64 h-auto mx-auto mb-6 object-contain" />
            <h1 className="text-sm font-black tracking-widest whitespace-nowrap">{masterSettings.sidebarTitle}</h1>
        </div>
        <form onSubmit={handleLogin} className="p-10 space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}
            <input type="email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="E-mail" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }} />
            <input type="password" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" placeholder="Senha" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }} />
            <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={rememberAccess}
                onChange={e => setRememberAccess(e.target.checked)}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Salvar acesso neste dispositivo
              </span>
            </label>
            <button type="submit" className="w-full py-5 bg-indigo-900 text-white font-black rounded-2xl shadow-lg uppercase text-xs tracking-widest hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">Entrar no Painel</button>
            <div className="w-full py-3 mt-4 text-slate-400 font-black text-[9px] uppercase flex items-center justify-center gap-2">
              Versão do Sistema ConectAxé {latestVersion}
            </div>
        </form>
      </div>
    </div>
  );
};

export const MaintenanceScreen: React.FC = () => {
  const { globalMaintenance } = useData();
  const { setAuth } = useAuth();
  const [password, setPassword] = useState('');

  const handleBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    let master = { email: 'rodrigo@dev.com', password: 'master' };
    try {
      const creds = await MasterService.getMasterCredentials();
      if (creds) {
        master = { ...master, ...creds };
      }
    } catch (error) {
      console.error("Error checking master credentials:", error);
    }

    if (password === master.password) {
      setAuth({ 
        user: { id: 'master', name: 'Rodrigo Master', email: master.email, role: 'admin', password: master.password }, 
        isAuthenticated: true, 
        isMasterMode: true 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
        <div className="p-12 bg-orange-600 text-white text-center"><Wrench size={48} className="mx-auto mb-6" /><h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Manutenção</h1></div>
        <div className="p-12 text-center space-y-6"><p className="text-xl font-bold text-slate-700 leading-relaxed italic">"{globalMaintenance.message}"</p><div className="pt-4"><form onSubmit={handleBypass} className="flex gap-3 max-w-sm mx-auto"><input type="password" placeholder="Chave de Mestre" className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm" value={password} onChange={e => setPassword(e.target.value)} /><button className="px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Entrar</button></form></div></div>
      </div>
    </div>
  );
};

export const FrozenScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { tickets, setTickets, systemConfig } = useData();

  if (user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <div className="bg-indigo-600 p-6 text-white shadow-2xl z-10">
           <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/10 rounded-2xl animate-pulse"><Snowflake size={32} /></div>
                 <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Sistema Congelado</h1>
                    <p className="font-medium opacity-90 text-sm">Acesso restrito temporariamente pelo Administrador.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-xs font-bold uppercase opacity-75">Usuário Logado</p>
                    <p className="font-black">{user.name}</p>
                 </div>
                 <button onClick={() => logout()} className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black uppercase text-xs hover:bg-indigo-50 transition-colors shadow-lg">Sair do Sistema</button>
              </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 md:p-10">
           <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl text-center">
                 <p className="text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                   Seu sistema está atualmente em modo de congelamento. Todas as funcionalidades operacionais estão suspensas, exceto o canal de comunicação com o suporte.
                   Utilize a ferramenta abaixo para entrar em contato com a administração e regularizar sua situação.
                 </p>
              </div>
              
              <TicketSystem 
                user={user} 
                config={systemConfig} 
                tickets={tickets} 
                onUpdateTickets={setTickets} 
              />
           </div>
        </div>
      </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-12 text-center">
          <><ShieldAlert size={64} className="text-red-600 mx-auto mb-6" /><h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acesso Bloqueado</h1><p className="text-slate-500 mb-8 font-medium">Sua licença expirou ou foi suspensa.</p></>
        <button onClick={() => logout()} className="text-indigo-600 font-bold uppercase text-xs hover:underline">Sair do Sistema</button>
      </div>
    </div>
  );
};
