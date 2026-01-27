
export interface EventTicket {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  price: number;
  status: 'pendente' | 'confirmado' | 'cancelado';
  createdAt: string;
  attendance: 'nao_marcado' | 'presente' | 'ausente';
}

export interface TerreiroEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  time: string;
  type: 'gira' | 'festa' | 'curso' | 'outros';
  status: 'agendado' | 'realizado' | 'cancelado' | 'acontecendo' | 'encerrado';
  ticketsTotal: number;
  ticketsIssued: number;
  price?: number;
  location?: string;
  responsible?: string;
  color?: string;
  icon?: string;
}

export interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number | null;
  description?: string;
  maxMembers?: number;
  maxStorage?: number; // MB
  enabledModules?: string[];
  limits?: any;
}

export interface StoredSnapshot {
  id: string;
  date: string;
  type: string;
  data: any;
  size: string;
}

export interface SystemLicense {
  clientId: string;
  planName: string;
  status: 'active' | 'inactive' | 'frozen' | 'blocked';
  expirationDate: string;
  affiliateLink?: string;
}

export interface SystemConfig {
  systemName: string;
  logoUrl?: string;
  license?: SystemLicense;
  menuConfig?: any[];
  autoBackupFrequency?: 'disabled' | '7' | '15' | '30';
  theme?: any;
  userRoles?: any[];
  rolePermissions?: any;
  spiritualSectionColors?: any;
  pontoTypes?: string[];
  pontoCategories?: string[];
  rezaTypes?: string[];
  rezaCategories?: string[];
  ervaCategories?: string[];
  ervaTypes?: string[];
  banhoCategories?: string[];
  banhoTypes?: string[];
  banhoDirections?: string[];
  primaryColor?: string;
  sidebarColor?: string;
  accentColor?: string;
  sidebarTextColor?: string;
  dashboardFontSize?: string;
}

// --- Restored Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  photo?: string;
  linkedEntityId?: string;
  profileType?: 'membro' | 'consulente';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isMasterMode: boolean;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  status: string;
  isConsulente?: boolean;
  createdAt: string;
  birthDate?: string;
  observations?: string;
  address?: string;
  rg?: string;
  cpf?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  profession?: string;
  maritalStatus?: string;
  gender?: string;
  [key: string]: any;
}

export interface Consulente extends Member {}

export interface SpiritualEntity {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  description?: string;
  [key: string]: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  description?: string;
  [key: string]: any;
}

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  type?: string;
  allDay?: boolean;
  color?: string;
  [key: string]: any;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  status?: string;
  modules?: any[];
  [key: string]: any;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: string;
  progress?: number;
  [key: string]: any;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  status: 'presente' | 'ausente' | 'justificado';
  date: string;
  [key: string]: any;
}

export interface SaaSClient {
  id: string;
  name: string;
  adminEmail: string;
  plan: string;
  status: 'active' | 'inactive' | 'frozen' | 'blocked';
  expirationDate: string;
  phone?: string;
  document?: string;
  createdAt?: string;
  payments?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface PaymentStatus {
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  date?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  type: string;
  description?: string;
  [key: string]: any;
}

export interface Referral {
  id: string;
  code: string;
  referrerId: string;
  referredEmail: string;
  status: 'pending' | 'completed' | 'expired';
  date: string;
  [key: string]: any;
}

export interface ReferralStatus {
  totalReferrals: number;
  activeReferrals: number;
  earnings: number;
}

export interface GlobalMaintenanceConfig {
  active: boolean;
  message: string;
  expectedReturn?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  responses?: any[];
  [key: string]: any;
}

export interface IDCardLog {
  id: string;
  memberId: string;
  action: string;
  date: string;
  userId: string;
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
  type: 'entrada' | 'saida';
}

export interface GlobalBroadcast {
  id: string;
  message: string;
  active: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  target?: 'all' | 'admins' | 'staff';
  expiresAt?: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  notes: string[];
  type?: 'major' | 'minor' | 'patch';
}

export interface GlobalCoupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expirationDate?: string;
  maxUses?: number;
  usedCount?: number;
}

export interface MasterAuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip?: string;
  targetId?: string;
}

export interface CanteenItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  description?: string;
}

export interface CanteenOrder {
  id: string;
  items: { itemId: string; quantity: number; price: number; name?: string }[];
  total: number;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  paymentMethod?: string;
  buyerName?: string;
  responsible?: string;
}

export interface Ponto {
  id: string;
  title: string;
  lyrics: string;
  category: string;
  type: string;
  youtubeUrl?: string;
  audioUrl?: string;
  isPublic?: boolean;
}

export interface Reza {
  id: string;
  title: string;
  text: string;
  category: string;
  type: string;
  isPublic?: boolean;
}

export interface Erva {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  properties?: string;
  contraindications?: string;
  image?: string;
}

export interface Banho {
  id: string;
  name: string;
  ingredients: string;
  preparation: string;
  category: string;
  type: string;
  direction?: string;
  purpose?: string;
}

// Additional missing types used in constants
export interface FixedExpense {
  id: string;
  name: string;
  value: number;
  day?: number;
}

export interface StaffPermissions {
  [key: string]: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface RoleDefinition {
  id: string;
  label: string;
  color: string;
  iconName: string;
  isSystem?: boolean;
}

export interface IDCardConfig {
  logoStyle: any;
  photoStyle: any;
  nameStyle: any;
  roleStyle: any;
  idStyle: any;
  cpfStyle: any;
  rgStyle: any;
  issueDateStyle: any;
  qrCodeStyle: any;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  requiredModule?: string;
  subItems?: MenuItemConfig[];
  color?: string;
}
