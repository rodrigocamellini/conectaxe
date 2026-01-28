
import { User, SystemConfig, FixedExpense, StaffPermissions, RoleDefinition, SpiritualEntity, IDCardConfig, MenuItemConfig } from './types';

export const DEFAULT_LOGO_URL = "/images/logo.png";
export const MASTER_LOGO_URL = "/images/logo_sistema.png";

// Fix: Export BRAZILIAN_STATES to resolve import error in DeveloperPortal.tsx and ensure consistency across components
export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export const SCHOOLING_LEVELS = [
  "Fundamental Incompleto",
  "Fundamental Completo",
  "Médio Incompleto",
  "Médio Completo",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
  "Mestrado",
  "Doutorado"
];

export const SAAS_PLANS = [
  "Plano Mensal",
  "Plano Trimestral",
  "Plano Semestral",
  "Plano Anual",
  "Plano Vitalício",
  "Período de Teste"
];

export const MENU_ICONS_CATALOG = [
  'LayoutDashboard', 'Users', 'CalendarDays', 'GraduationCap', 'PlayCircle',
  'Music', 'Scroll', 'Sprout', 'UserPlus', 'UserCheck', 'Contact2',
  'UserRoundCheck', 'ShoppingCart', 'Coffee', 'List', 'Database', 'Package',
  'ClipboardCheck', 'Wallet2', 'DollarSign', 'Heart', 'BarChart3', 'Calculator',
  'Settings2', 'Monitor', 'ShieldAlert', 'Layers', 'ImageIcon', 'Key',
  'Archive', 'RefreshCw', 'UserRoundPlus', 'ShieldEllipsis', 'Ticket',
  'Crown', 'Sparkles', 'Star', 'Flame', 'Zap', 'Bell', 'Info', 'Code',
  'MoonStar', 'Church', 'Candles', 'CloudMoon', 'Flower2', 'Waves',
  'Sword', 'Axe', 'Shield', 'Hammer', 'Drumstick', 'Droplets', 'Wind', 'Feather', 'LifeBuoy'
];

export const AVAILABLE_MODULES = [
  { id: 'agenda', label: 'Agenda de Eventos', icon: 'Calendar', description: 'Calendário e gestão de eventos do terreiro' },
  { 
    id: 'gestao_eventos', 
    label: 'Giras e Eventos (Avançado)', 
    icon: 'Calendar', 
    description: 'Gestão completa de eventos, ingressos e portaria',
    subModules: [
      { id: 'eventos_lista', label: 'Gestão de Eventos' },
      { id: 'eventos_portaria', label: 'Check-in e Portaria' }
    ]
  },
  { 
    id: 'cursos', 
    label: 'Cursos e EAD', 
    icon: 'GraduationCap', 
    description: 'Plataforma de ensino a distância e gestão de cursos',
    subModules: [
      { id: 'cursos_ead', label: 'Plataforma EAD (Aluno)' },
      { id: 'cursos_gestao', label: 'Gestão de Cursos' }
    ]
  },
  { 
    id: 'midia', 
    label: 'Mídia e Acervo', 
    icon: 'Music', 
    description: 'Pontos, rezas, ervas e arquivos de mídia',
    subModules: [
      { id: 'midia_pontos', label: 'Pontos Cantados' },
      { id: 'midia_rezas', label: 'Rezas e Orações' },
      { id: 'midia_ervas', label: 'Ervas e Banhos' }
    ]
  },
  { 
    id: 'cantina', 
    label: 'Cantina', 
    icon: 'ShoppingCart', 
    description: 'Gestão de vendas e produtos da cantina',
    subModules: [
      { id: 'cantina_pdv', label: 'Ponto de Venda' },
      { id: 'cantina_gestao', label: 'Gestão de Produtos' },
      { id: 'cantina_historico', label: 'Histórico de Vendas' }
    ]
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: 'DollarSign', 
    description: 'Controle de mensalidades, doações e fluxo de caixa',
    subModules: [
      { id: 'financeiro_mensalidades', label: 'Mensalidades' },
      { id: 'financeiro_doacoes', label: 'Doações' },
      { id: 'financeiro_relatorios', label: 'Relatórios' },
      { id: 'financeiro_config', label: 'Configurações' }
    ]
  },
  { 
    id: 'estoque', 
    label: 'Estoque', 
    icon: 'Package', 
    description: 'Controle de inventário e movimentações',
    subModules: [
      { id: 'estoque_dashboard', label: 'Visão Geral' },
      { id: 'estoque_gestao', label: 'Gestão de Itens' },
      { id: 'estoque_movimentacao', label: 'Entradas e Saídas' }
    ]
  },
  {
    id: 'mod_backup_auto',
    label: 'Backup Automático',
    icon: 'ShieldCheck',
    description: 'Sistema de backup automático (7/15/30 dias) e histórico de versões'
  }
];

export const INITIAL_MENU_CONFIG: MenuItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'agenda', label: 'Agenda', icon: 'CalendarDays', requiredModule: 'agenda' },
  { id: 'events-list', label: 'Giras e Eventos', icon: 'Sparkles', requiredModule: 'gestao_eventos' },
  { 
    id: 'cursos', 
    label: 'Cursos', 
    icon: 'GraduationCap',
    requiredModule: 'cursos',
    subItems: [
      { id: 'ead', label: 'Plataforma EAD (Aluno)', icon: 'PlayCircle', requiredModule: 'cursos_ead' },
      { id: 'course-mgmt', label: 'Cadastrar Cursos', icon: 'GraduationCap', requiredModule: 'cursos_gestao' }
    ]
  },
  { 
    id: 'midia', 
    label: 'Mídia', 
    icon: 'Music',
    requiredModule: 'midia',
    subItems: [
      { id: 'media-pontos', label: 'Pontos', icon: 'Music', requiredModule: 'midia_pontos' },
      { id: 'media-rezas', label: 'Rezas', icon: 'Scroll', requiredModule: 'midia_rezas' },
      { id: 'media-ervas', label: 'Ervas e Banhos', icon: 'Sprout', requiredModule: 'midia_ervas' }
    ]
  },
  { 
    id: 'cadastros', 
    label: 'Cadastros', 
    icon: 'UserPlus', 
    subItems: [
      { id: 'members', label: 'Membros', icon: 'Users' },
      { id: 'mediums', label: 'Médiuns', icon: 'UserCheck' },
      { id: 'consulentes', label: 'Consulentes', icon: 'UserRoundPlus' },
      { id: 'idcards', label: 'Carteirinhas', icon: 'Contact2' },
      { id: 'attendance', label: 'Presença', icon: 'UserRoundCheck' }
    ]
  },
  { 
    id: 'cantina', 
    label: 'Cantina', 
    icon: 'ShoppingCart',
    requiredModule: 'cantina',
    subItems: [
      { id: 'cantina_pdv', label: 'Ponto de Venda (PDV)', icon: 'ShoppingCart', requiredModule: 'cantina_pdv' },
      { id: 'cantina_gestao', label: 'Cardápio e Preços', icon: 'Coffee', requiredModule: 'cantina_gestao' },
      { id: 'cantina_historico', label: 'Vendas Realizadas', icon: 'List', requiredModule: 'cantina_historico' }
    ]
  },
  { 
    id: 'inventory-root', 
    label: 'Estoque', 
    icon: 'Database',
    requiredModule: 'estoque',
    subItems: [
      { id: 'inventory-dashboard', label: 'Itens em Estoque', icon: 'BarChart', requiredModule: 'estoque_dashboard' },
      { id: 'inventory', label: 'Gestão de Estoque', icon: 'Package', requiredModule: 'estoque_gestao' },
      { id: 'inventory-entry', label: 'Entradas/Saídas', icon: 'ClipboardCheck', requiredModule: 'estoque_movimentacao' }
    ]
  },
  { 
    id: 'finance', 
    label: 'Financeiro', 
    icon: 'Wallet2',
    requiredModule: 'financeiro',
    subItems: [
      { id: 'mensalidades', label: 'Mensalidades', icon: 'DollarSign', requiredModule: 'financeiro_mensalidades' },
      { id: 'cash-flow', label: 'Fluxo de Caixa', icon: 'ArrowRightLeft', requiredModule: 'financeiro_fluxo' },
      { id: 'donations', label: 'Doações', icon: 'Heart', requiredModule: 'financeiro_doacoes' },
      { id: 'finance-reports', label: 'Relatórios Financeiros', icon: 'BarChart3', requiredModule: 'financeiro_relatorios' },
      { id: 'finance-config', label: 'Config. Financeira', icon: 'Calculator', requiredModule: 'financeiro_config' }
    ]
  },
  { 
    id: 'maintenance-root', 
    label: 'Manutenção', 
    icon: 'Settings2', 
    subItems: [
      { id: 'layout', label: 'Aparência e Layout', icon: 'Monitor' },
      { id: 'users', label: 'Usuários do Sistema', icon: 'ShieldAlert' },
      { id: 'entities', label: 'Config. Espirituais', icon: 'Layers' },
      { id: 'entity-images', label: 'Imagens', icon: 'ImageIcon' },
      { id: 'permissions', label: 'Permissões', icon: 'Key' },
      { id: 'backup', label: 'Backup de Dados', icon: 'Archive' },
      { id: 'restore-system', label: 'Restaurar Sistema', icon: 'RefreshCw' }
    ]
  },
  { id: 'indicacoes', label: 'Afiliados', icon: 'Crown', color: '#ADFF2F' },
  { id: 'saas-manager', label: 'Assinatura', icon: 'ShieldEllipsis', color: '#00FFFF' },
];

export const INITIAL_MASTER_MENU_CONFIG: MenuItemConfig[] = [
  { id: 'developer-portal', label: 'Terreiros Ativos', icon: 'LayoutGrid', color: '#487ffe' },
  { id: 'tickets', label: 'Tickets Suporte', icon: 'Ticket' },
  { id: 'master-menu', label: 'Config. Menu', icon: 'Menu' },
  { id: 'master-broadcast', label: 'Broadcast', icon: 'Zap' },
  { id: 'master-affiliates', label: 'Afiliados', icon: 'Crown', color: '#ADFF2F' },
  { id: 'master-payments', label: 'Faturamento', icon: 'DollarSign' },
  { id: 'system-maintenance', label: 'Manutenção', icon: 'Wrench' },
  { id: 'master-backups', label: 'Snapshots', icon: 'Database' },
  { id: 'master-audit', label: 'Auditoria', icon: 'History' },
  { id: 'master-coupons', label: 'Cupons', icon: 'Tag' },
  { id: 'master-roadmap', label: 'Roadmap', icon: 'ClipboardList' },
  { id: 'master-system-config', label: 'Configs. do Sistema', icon: 'Settings' }
];

export const INITIAL_USERS: User[] = [
  { id: '1', email: 'admin@gmail.com', name: 'Administrador Principal', role: 'admin', password: 'admin' },
  { id: '2', email: 'staff@gmail.com', name: 'Colaborador Staff', role: 'staff', password: 'staff' }
];

export const INITIAL_ENTITIES: SpiritualEntity[] = [
  { id: 'p1', name: 'Oxalá', type: 'pai_cabeca', imageUrl: '/images/entities/oxala.png' },
  { id: 'p2', name: 'Ogum', type: 'pai_cabeca', imageUrl: '/images/entities/ogum.png' },
  { id: 'p3', name: 'Oxóssi', type: 'pai_cabeca', imageUrl: '/images/entities/oxossi.png' },
  { id: 'p4', name: 'Xangô', type: 'pai_cabeca', imageUrl: '/images/entities/xango.png' },
  { id: 'p5', name: 'Obaluaiê', type: 'pai_cabeca', imageUrl: '/images/entities/obaluaie.png' },
  { id: 'p6', name: 'Omulu', type: 'pai_cabeca', imageUrl: '/images/entities/omulu.png' },
  { id: 'm1', name: 'Iemanjá', type: 'mae_cabeca', imageUrl: '/images/entities/iemanja.png' },
  { id: 'm2', name: 'Iansã', type: 'mae_cabeca', imageUrl: '/images/entities/iansa.png' },
  { id: 'm3', name: 'Oxum', type: 'mae_cabeca', imageUrl: '/images/entities/oxum.png' },
  { id: 'm4', name: 'Nanã Boruque', type: 'mae_cabeca', imageUrl: '/images/entities/nana_boruque.png' },
  { id: 'g1', name: 'Preto Velho(a)', type: 'guia_frente', imageUrl: '/images/entities/preto_velho.png' },
  { id: 'g2', name: 'Caboclo(a)', type: 'guia_frente', imageUrl: '/images/entities/caboclo.png' },
  { id: 'g3', name: 'Baiano(a)', type: 'guia_frente', imageUrl: '/images/entities/baiano.png' },
  { id: 'g4', name: 'Boiadeiro(a)', type: 'guia_frente', imageUrl: '/images/entities/boiadeiro.png' },
  { id: 'g5', name: 'Malandro(a)', type: 'guia_frente', imageUrl: '/images/entities/malandro.png' },
  { id: 'g6', name: 'Cigano(a)', type: 'guia_frente', imageUrl: '/images/entities/cigano.png' },
  { id: 'g7', name: 'Exu', type: 'guia_frente', imageUrl: '/images/entities/exu.png' },
  { id: 'g8', name: 'Pomba gira', type: 'guia_frente', imageUrl: '/images/entities/pomba_gira.png' },
  { id: 'c1', name: 'Pai de Santo', type: 'cargo' },
  { id: 'c2', name: 'Mãe de Santo', type: 'cargo' },
  { id: 'c3', name: 'Pai Pequeno', type: 'cargo' },
  { id: 'c4', name: 'Mãe Pequena', type: 'cargo' },
  { id: 'c5', name: 'Médium de Trabalho', type: 'cargo' },
  { id: 'c6', name: 'Médium em Desenvolvimento', type: 'cargo' },
  { id: 'c7', name: 'Ogan', type: 'cargo' },
  { id: 'c8', name: 'Líder dos Cambones', type: 'cargo' },
  { id: 'c9', name: 'Cambone', type: 'cargo' },
  { id: 'f1', name: 'Médium', type: 'funcao' },
  { id: 'f2', name: 'Cambone', type: 'funcao' },
  { id: 'f3', name: 'Consulente', type: 'funcao' },
];

export const DEFAULT_ENTITY_IMAGES = INITIAL_ENTITIES.reduce<Record<string, string>>((acc, entity) => {
  if (entity.imageUrl) {
    acc[entity.id] = entity.imageUrl;
  }
  return acc;
}, {});

export const MEMBER_STATUS_LABELS = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  desligado: 'Desligado',
  consulente: 'Consulente'
};

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Crect width='1024' height='1024' fill='%23C5D1D8'/%3E%3Cpath d='M512 469.3c101.7 0 184.2-82.5 184.2-184.2S613.7 101 512 101s-184.2 82.5-184.2 184.2 82.5 184.1 184.2 184.1zm0 85.3c-136.2 0-409.6 68.3-409.6 204.8v102.4h819.2V759.4c0-136.5-273.4-204.8-409.6-204.8z' fill='%23647985'/%3E%3C/svg%3E";

const INITIAL_FIXED_EXPENSES: FixedExpense[] = [
  { id: '1', name: 'Aluguel', value: 0 },
  { id: '2', name: 'Água', value: 0 },
  { id: '3', name: 'Luz', value: 0 },
  { id: '4', name: 'Internet', value: 0 },
  { id: '5', name: 'Telefone', value: 0 },
  { id: '6', name: 'Produtos de Limpeza', value: 0 },
  { id: '7', name: 'Velas', value: 0 },
  { id: '8', name: 'Bebidas', value: 0 },
];

const INITIAL_PERMISSIONS: StaffPermissions = {
  dashboard: { view: true, add: false, edit: false, delete: false },
  agenda: { view: true, add: false, edit: false, delete: false },
  'events-list': { view: true, add: false, edit: false, delete: false },
  ead: { view: true, add: false, edit: false, delete: false },
  'course-mgmt': { view: false, add: false, edit: false, delete: false },
  members: { view: true, add: false, edit: false, delete: false },
  mediums: { view: true, add: false, edit: false, delete: false },
  attendance: { view: true, add: false, edit: false, delete: false },
  'inventory-dashboard': { view: true, add: false, edit: false, delete: false },
  inventory: { view: false, add: false, edit: false, delete: false },
  'inventory-entry': { view: false, add: false, edit: false, delete: false },
  mensalidades: { view: false, add: false, edit: false, delete: false },
  donations: { view: false, add: false, edit: false, delete: false },
  'finance-reports': { view: false, add: false, edit: false, delete: false },
  'finance-config': { view: false, add: false, edit: false, delete: false },
  indicacoes: { view: true, add: false, edit: false, delete: false },
  layout: { view: false, add: false, edit: false, delete: false },
  users: { view: false, add: false, edit: false, delete: false },
  entities: { view: false, add: false, edit: false, delete: false },
  'entity-images': { view: false, add: false, edit: false, delete: false },
  permissions: { view: false, add: false, edit: false, delete: false },
  backup: { view: false, add: false, edit: false, delete: false },
  'restore-system': { view: false, add: false, edit: false, delete: false },
  'saas-manager': { view: false, add: false, edit: false, delete: false },
  idcards: { view: true, add: true, edit: true, delete: true },
};

const INITIAL_ROLES: RoleDefinition[] = [
  { id: 'admin', label: 'Admin', color: '#dc2626', iconName: 'crown', isSystem: true },
  { id: 'staff', label: 'Staff', color: '#f97316', iconName: 'shield' },
  { id: 'medium', label: 'Médium', color: '#7e22ce', iconName: 'sparkles' },
  { id: 'cambone', label: 'Cambone', color: '#808000', iconName: 'hand-helping' },
  { id: 'consulente', label: 'Consulente', color: '#06b6d4', iconName: 'user' },
];

export const DEFAULT_IDCARD_CONFIG: IDCardConfig = {
  logoStyle: { x: 15, y: 15, size: 50, visible: true },
  photoStyle: { x: 50, y: 35, size: 80, visible: true },
  nameStyle: { x: 50, y: 65, fontSize: 16, color: '#1f2937', visible: true },
  roleStyle: { x: 50, y: 75, fontSize: 12, color: '#4f46e5', visible: true },
  idStyle: { x: 50, y: 85, fontSize: 10, color: '#9ca3af', visible: true },
  cpfStyle: { x: 30, y: 20, fontSize: 10, color: '#1f2937', visible: true },
  rgStyle: { x: 30, y: 35, fontSize: 10, color: '#1f2937', visible: true },
  issueDateStyle: { x: 30, y: 50, fontSize: 10, color: '#1f2937', visible: true },
  qrCodeStyle: { x: 75, y: 75, size: 40, visible: true }
};

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  systemName: 'Sistema Terreiro 1.0',
  primaryColor: '#4f46e5',
  sidebarColor: '#020617',
  sidebarTextColor: '#4f46e5',
  accentColor: '#FFD700', 
  dashboardFontSize: 'medium',
  logoUrl: DEFAULT_LOGO_URL,
  spiritualSectionColors: {
    pai_cabeca: '#4f46e5',
    mae_cabeca: '#7c3aed',
    guia_frente: '#2563eb',
    cargo: '#16a34a',
    entidade: '#ea580c',
    funcao: '#db2777'
  },
  pontoCategories: [
    'Exu',
    'Pomba Gira',
    'Exu Mirim',
    'Ogum',
    'Oxossi',
    'Xangô',
    'Iansã',
    'Oxum',
    'Iemanjá',
    'Nanã',
    'Obaluaê',
    'Oxalá',
    'Preto Velho',
    'Caboclo',
    'Erê',
    'Boiadeiro',
    'Marinheiro',
    'Baiano',
    'Cigano',
    'Malandro'
  ],
  pontoTypes: [
    'Abertura',
    'Defumação',
    'Bate Cabeça',
    'Hino',
    'Chamada',
    'Sustentação',
    'Subida',
    'Encerramento',
    'Demanda',
    'Louvação'
  ],
  rezaCategories: [
    'Exu',
    'Pomba Gira',
    'Exu Mirim',
    'Ogum',
    'Oxossi',
    'Xangô',
    'Iansã',
    'Oxum',
    'Iemanjá',
    'Nanã',
    'Obaluaê',
    'Oxalá',
    'Preto Velho',
    'Caboclo',
    'Erê',
    'Boiadeiro',
    'Marinheiro',
    'Baiano',
    'Cigano',
    'Malandro'
  ],
  rezaTypes: [
    'Abertura',
    'Proteção',
    'Louvação',
    'Encerramento'
  ],
  financialConfig: {
    mediumValue: 50,
    camboneValue: 30,
    fixedExpenses: INITIAL_FIXED_EXPENSES
  },
  userRoles: INITIAL_ROLES,
  rolePermissions: {
    staff: INITIAL_PERMISSIONS,
    medium: INITIAL_PERMISSIONS,
    cambone: INITIAL_PERMISSIONS,
    consulente: INITIAL_PERMISSIONS,
  },
  idCardConfig: DEFAULT_IDCARD_CONFIG,
  certificateConfig: {
    headerTitle: 'CERTIFICADO',
    introText: 'Certificamos com alegria e honra que',
    conclusionText: 'concluiu com êxito o treinamento teórico e prático de',
    signatureLeftLabel: 'Instituição Emitente',
    signatureRightLabel: 'Data de Conclusão',
    showAuthenticityCode: true,
    logoStyle: { x: 50, y: 15, size: 100 },
    headerStyle: { x: 50, y: 35, fontSize: 60, color: '#312e81' },
    introStyle: { x: 50, y: 45, fontSize: 18, color: '#6b7280' },
    studentStyle: { x: 50, y: 55, fontSize: 40, color: '#1f2937' },
    conclusionStyle: { x: 50, y: 65, fontSize: 18, color: '#6b7280' },
    courseStyle: { x: 50, y: 75, fontSize: 24, color: '#3730a3' },
    sigLeftStyle: { x: 25, y: 88, fontSize: 12, color: '#374151' },
    sigRightStyle: { x: 75, y: 88, fontSize: 12, color: '#374151' }
  },
  menuConfig: INITIAL_MENU_CONFIG,
  masterMenuConfig: INITIAL_MASTER_MENU_CONFIG
};

export const INITIAL_SAAS_PLANS: SaaSPlan[] = [
  { id: 'p_teste', name: 'Plano de Teste', price: 0, durationDays: 10 },
  { id: 'p_mensal', name: 'Plano Mensal', price: 49.90, durationDays: 30 },
  { id: 'p_trimestral', name: 'Plano Trimestral', price: 135.00, durationDays: 90 },
  { id: 'p_semestral', name: 'Plano Semestral', price: 250.00, durationDays: 180 },
  { id: 'p_anual', name: 'Plano Anual', price: 450.00, durationDays: 365 },
  { id: 'p_vitalicio', name: 'Plano Vitalício', price: 1500.00, durationDays: null },
  { id: 'p_cortesia', name: 'Plano Cortesia', price: 0, durationDays: 30 },
];
