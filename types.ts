
export type UserRole = string;

export interface RoleDefinition {
  id: string;
  label: string;
  color?: string;
  iconName?: string;
  isSystem?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  photo?: string;
}

// Novos tipos para o Menu Dinâmico
export interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  color?: string; // Cor fixa opcional (Hex)
  subItems?: MenuItemConfig[];
  isSystem?: boolean; // Se for sistema, certas ações podem ser restritas
  requiredModule?: string; // Módulo necessário para exibir este item
}

export interface CanteenItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface CanteenOrder {
  id: string;
  items: { itemId: string; name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: 'money' | 'pix' | 'card';
  date: string;
  responsible: string;
}

export interface StockLog {
  id: string;
  itemId: string;
  itemName: string;
  previousStock: number;
  newStock: number;
  change: number;
  date: string;
  responsible: string;
  type: 'entrada' | 'saida' | 'ajuste';
}

export interface StoredSnapshot {
  id: string;
  date: string;
  type: 'manual' | 'automatico';
  data: any;
  size: string;
}

export interface MasterCredentials {
  email: string;
  password?: string;
  whatsapp?: string;
  pixKey?: string;
  bankDetails?: string;
  photo?: string;
  systemTitle?: string;
  sidebarTitle?: string;
  brandLogo?: string;
  backupFrequency?: 'disabled' | '7days' | '15days' | 'monthly';
  lastAutoBackup?: string;
}

export interface MasterAuditLog {
  id: string;
  timestamp: string;
  masterEmail: string;
  clientId: string;
  clientName: string;
  action: string;
}

export interface GlobalCoupon {
  id: string;
  code: string;
  discountPercent: number;
  expiryDate: string;
  usageCount: number;
  active: boolean;
}

export interface GlobalBroadcast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  active: boolean;
  createdAt: string;
}

export interface ReleaseNote {
  id: string;
  version: string;
  date: string;
  title: string;
  content: string;
  status: 'planned' | 'released' | 'fixed' | 'updated' | 'improvement';
}

export interface PredefinedResponse {
  id: string;
  title: string;
  content: string;
}

export interface SupportTicketAttachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
}

export interface SupportTicketReply {
  id: string;
  senderName: string;
  senderRole: 'admin' | 'master';
  message: string;
  timestamp: string;
  attachments?: SupportTicketAttachment[];
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  category: 'tecnico' | 'financeiro' | 'duvida' | 'sugestao';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_analise' | 'concluido' | 'aguardando_usuario';
  description: string;
  createdAt: string;
  updatedAt: string;
  replies: SupportTicketReply[];
  initialAttachments?: SupportTicketAttachment[];
}

export interface GlobalBackupLog {
  id: string;
  date: string;
  type: 'backup' | 'restore';
  operator: string;
  status: 'success' | 'failed';
  details: string;
  fileSize?: string;
}

export interface GlobalMaintenanceConfig {
  active: boolean;
  message: string;
  startedAt?: string;
}

export interface ModulePermission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export type StaffPermissions = Record<string, ModulePermission>;

export interface PlanLimits {
  maxMembers?: number | null;
  maxConsulentes?: number | null;
}

export interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number | null;
  limits?: PlanLimits;
  enabledModules?: string[];
}

export interface SaaSClient {
  id: string;
  name: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string; 
  adminCpf?: string;
  adminBirthDate?: string;
  adminPhone?: string;
  adminCep?: string;
  adminAddress?: string;
  adminBairro?: string;
  adminCidade?: string;
  adminEstado?: string;
  
  status: 'active' | 'expired' | 'blocked' | 'trial' | 'frozen';
  plan: string; 
  monthlyValue: number;
  expirationDate: string;
  createdAt: string;
  lastActivity?: string; 
  lastPaymentDate?: string;
  affiliateLink?: string; 
  affiliateBlocked?: boolean;
  remainingDaysAtFreeze?: number;
  payments?: Record<string, 'paid' | 'unpaid' | 'justified'>;
}

export type ReferralStatus = 'aguardando' | 'aprovada' | 'reprovada';

export interface Referral {
  id: string;
  referrerId: string; 
  targetName: string; 
  status: ReferralStatus;
  createdAt: string;
  rewardApplied: boolean;
  location?: string;
}

export interface SystemLicense {
  status: 'active' | 'expired' | 'trial' | 'blocked' | 'frozen';
  expirationDate: string;
  planName: string;
  supportContact: string;
  paymentLink: string;
  lastPaymentDate?: string;
  affiliateLink?: string; 
  affiliateBlocked?: boolean;
  clientId?: string; 
}

export interface ElementStyle {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  visible?: boolean;
}

export interface CertificateConfig {
  headerTitle: string;
  introText: string;
  conclusionText: string;
  signatureLeftLabel: string;
  signatureRightLabel: string;
  showAuthenticityCode: boolean;
  logoStyle: { x: number; y: number; size: number };
  headerStyle: ElementStyle;
  introStyle: ElementStyle;
  studentStyle: ElementStyle;
  conclusionStyle: ElementStyle;
  courseStyle: ElementStyle;
  sigLeftStyle: ElementStyle;
  sigRightStyle: ElementStyle;
}

export interface IDCardConfig {
  frontBg?: string;
  backBg?: string;
  logoStyle: { x: number; y: number; size: number; visible: boolean };
  photoStyle: { x: number; y: number; size: number; visible: boolean };
  nameStyle: ElementStyle;
  roleStyle: ElementStyle;
  idStyle: ElementStyle;
  cpfStyle: ElementStyle;
  rgStyle: ElementStyle;
  issueDateStyle: ElementStyle;
  qrCodeStyle: { x: number; y: number; size: number; visible: boolean };
}

export interface IDCardLog {
  id: string;
  memberId: string;
  memberName: string;
  issueDate: string;
  version: number;
  issuedBy: string;
}

export interface SpiritualSectionColors {
  pai_cabeca: string;
  mae_cabeca: string;
  guia_frente: string;
  cargo: string;
  entidade: string;
  funcao: string;
}

export interface SystemConfig {
  systemName: string;
  logoUrl?: string;
  primaryColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  accentColor: string;
  dashboardFontSize: 'small' | 'medium' | 'large';
  financialConfig: FinancialConfig;
  userRoles: RoleDefinition[];
  rolePermissions: Record<string, StaffPermissions>;
  license?: SystemLicense;
  defaultCertificateTemplate?: string;
  certificateConfig?: CertificateConfig;
  idCardConfig?: IDCardConfig;
  menuConfig?: MenuItemConfig[];
  masterMenuConfig?: MenuItemConfig[];
  spiritualSectionColors?: SpiritualSectionColors;
  pontoCategories?: string[];
  pontoTypes?: string[];
  rezaCategories?: string[];
  rezaTypes?: string[];
  ervaCategories?: string[];
  ervaTypes?: string[];
  banhoCategories?: string[];
  banhoTypes?: string[];
  banhoDirections?: string[];
}

export interface SpiritualEntity {
  id: string;
  name: string;
  type: 'pai_cabeca' | 'mae_cabeca' | 'guia_frente' | 'cargo' | 'entidade' | 'funcao';
  imageUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date?: string; 
  time?: string;
  color: string;
  icon?: string;
  createdBy: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf';
  content: string; 
  duration?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  rating: number; 
  audience: {
    medium: boolean;
    cambone: boolean;
    consulente: boolean;
  };
  lessons: Lesson[];
  createdAt: string;
  certificateTemplate?: string;
}

export interface Enrollment {
  id: string;
  memberId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string; 
  memberId: string;
  status: 'presente' | 'ausente' | 'justificado';
}

export type PaymentStatus = 'paid' | 'unpaid' | 'justified';

export interface Member {
  id: string;
  name: string;
  photo?: string;
  email: string;
  rg?: string;
  cpf?: string;
  phone?: string;
  emergencyPhone?: string;
  address: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  birthDate: string;
  nationality?: string;
  birthPlace?: string;
  maritalStatus?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  spouseName?: string;
  education?: string;
  profession?: string;
  isWorking?: boolean;
  hasChildren?: boolean;
  childrenNames?: string[];
  isBaptized?: boolean;
  baptismDate?: string;
  baptismLocation?: string;
  cep?: string;
  observations?: string;
  houseRoles?: string[];
  paiCabecaId?: string;
  maeCabecaId?: string;
  guiaFrenteId?: string;
  cargoId?: string;
  assignedEntities?: string[]; 
  entityNames?: Record<string, string>; 
  status: 'ativo' | 'inativo' | 'desligado' | 'consulente';
  isMedium?: boolean;
  isCambone?: boolean;
  isConsulente?: boolean;
  monthlyPayments?: Record<string, PaymentStatus>; 
  createdAt: string;
}

export interface Consulente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cidade?: string;
  estado?: string;
  observations?: string;
  createdAt: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  expiryDate: string;
  categoryId: string;
  responsible: string;
  imageUrl?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  type: 'money' | 'item';
  value?: number;
  itemId?: string;
  quantity?: number;
  date: string;
  description: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  value: number;
}

export interface FinancialConfig {
  mediumValue: number;
  camboneValue: number;
  fixedExpenses: FixedExpense[];
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isMasterMode?: boolean; 
}

export interface Ponto {
  id: string;
  title: string;
  type: string;
  category: string;
  lyrics: string;
  audioUrl?: string;
  youtubeUrl?: string;
  createdAt: string;
}

export interface Reza {
  id: string;
  title: string;
  type: string;
  category: string;
  lyrics: string;
  audioUrl?: string;
  youtubeUrl?: string;
  createdAt: string;
}

export interface Erva {
  id: string;
  name: string;
  description: string;
  photo?: string;
  classification?: string;
  areas: string[];
  lines: string[];
  createdAt: string;
}

export interface Banho {
  id: string;
  name: string;
  description?: string;
  ervaIds: string[];
  area: string;
  target: string;
  purpose: string;
  direction: string;
  createdAt: string;
}

export interface TerreiroEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  time: string;
  type: 'gira' | 'festa' | 'curso' | 'outros';
  status: 'agendado' | 'acontecendo' | 'encerrado' | 'cancelado';
  location?: string;
  
  // Capacity & Tickets
  capacity: number;
  ticketsIssued: number;
  
  // Lists
  waitingListEnabled: boolean;
  
  // Cost
  isPaid: boolean;
  price?: number;
  pixKey?: string;
  
  // Advanced
  allowGuestRegistration: boolean; // Public link allowed?
}

export interface EventTicket {
  id: string;
  eventId: string;
  userId?: string; // If system user
  consulenteId?: string; // If consulente
  guestName?: string; // If external/guest
  guestPhone?: string;
  
  ticketNumber: number;
  type: 'normal' | 'preferencial';
  
  status: 'pendente' | 'confirmado' | 'cancelado' | 'lista_espera';
  paymentStatus: 'pago' | 'pendente' | 'gratuito';
  attendance: 'presente' | 'faltou' | 'justificado' | 'nao_marcado';
  
  createdAt: string;
}
