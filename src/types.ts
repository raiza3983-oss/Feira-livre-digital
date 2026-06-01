export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  shopId: string;
  shopName: string;
  shopOwnerUid: string;
  shopPhotoURL?: string;
  shopAddress?: string;
  shopCity?: string;
  shopState?: string;
  shopWhatsapp?: string;
  items: CartItem[];
  paymentMethod?: string;
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: string;
  buyerCity?: string;
  buyerState?: string;
  buyerPhone?: string;
  buyerFullName?: string;
  buyerAge?: string;
}

export type Screen = 
  | 'landing' 
  | 'sales' 
  | 'create-shop' 
  | 'calculator' 
  | 'contact' 
  | 'search' 
  | 'wholesale' 
  | 'saved' 
  | 'orders' 
  | 'access' 
  | 'chats' 
  | 'about' 
  | 'management'
  | 'profile'
  | 'admin-dashboard'
  | 'shop-management'
  | 'notifications'
  | 'privacy'
  | 'terms'
  | 'careers'
  | 'sales-tips'
  | 'wholesale-management'
  | 'wholesale-accounting'
  | 'vendor-accounting'
  | 'inventory'
  | 'seller'
  | 'shop-detail'
  | 'feira-livre-calculadora'
  | 'pending-approval';

export type UserRole = 'client' | 'vendor' | 'admin' | 'state_admin' | 'municipal_admin';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  age?: number;
  gender?: 'M' | 'F' | 'O';
  description?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  isApprovedAdmin?: boolean;
  lastSeenOrderAt?: any;
  lastSeenChatAt?: any;
  lastSeenAdminAt?: any;
  lastSeenBuyerOrderAt?: any;
  favorites?: string[];
  whatsapp?: string;
  isContactRestricted?: boolean;
  isEmailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: any;
  lastLoginAt?: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  weightPerUnit?: number;
  photoURL?: string;
}

export interface Order {
  id: string;
  buyerUid: string;
  shopId: string;
  shopName: string;
  shopOwnerUid: string;
  shopPhotoURL?: string;
  buyerName: string;
  buyerPhotoURL?: string;
  items: OrderItem[];
  totalValue: number;
  status: 'pending' | 'pending_payment' | 'accepted' | 'paid' | 'preparing' | 'ready' | 'shipped' | 'completed' | 'cancelled';
  paymentMethod?: string;
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName?: string;
  senderPhotoURL?: string;
  receiverUid: string;
  text: string;
  image?: string;
  shopName?: string;
  type?: 'text' | 'contact_request' | 'contact_approved' | 'contact_denied';
  metadata?: any;
  createdAt: any;
  orderId?: string;
}

export interface BusinessType {
  id: string;
  label: string;
  icon: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: 'feirante', label: 'Feira Livre', icon: 'User' },
  { id: 'barraca', label: 'Barraca Livre', icon: 'Store' },
  { id: 'atacado', label: 'Atacado', icon: 'Truck' },
  { id: 'restaurante', label: 'Restaurante', icon: 'UtensilsCrossed' },
  { id: 'mercado', label: 'Mercado Livre', icon: 'ShoppingBag' },
];

export interface DaySchedule {
  open: string;
  close: string;
  active: boolean;
}

export interface SpecialDate {
  date: string; // YYYY-MM-DD
  open: string;
  close: string;
  active: boolean;
  label?: string;
}

export interface Shop {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  address: string;
  photoURL: string;
  type: 'feirante' | 'barraca' | 'atacado' | 'restaurante' | 'mercado';
  category?: string;
  openingHours: string;
  closingHours: string;
  isOpen: boolean;
  workingDays: string[];
  schedule?: { [key: string]: DaySchedule }; // Key is '0' to '6' or day name
  specialDates?: SpecialDate[];
  deliveryPaymentMethods: string[];
  pickupPaymentMethods: string[];
  paymentMethods?: string[]; // Legacy
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  isApproved?: boolean;
  isPromoted?: boolean;
  city?: string;
  state?: string;
  reference?: string;
  whatsapp?: string;
  isContactRestricted?: boolean;
  autoReplyEnabled?: boolean;
  autoReplyText?: string;
  createdAt: string;
  metaMilestones?: {
    firstSaleSent?: boolean;
    halfTargetSent?: boolean;
    fullTargetSent?: boolean;
    notCompletedSent?: boolean;
  };
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  photoURL: string;
  image?: string; // Aliases photoURL for legacy components
  stock: number;
  weightPerUnit: number;
  unit: 'kg' | 'box' | 'bag' | 'gram' | 'unit';
  category?: string;
  salesCount: number;
  addedCount: number;
  rating: number;
  ratingCount: number;
  cost: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  shopId: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  totalValue: number;
  totalCost?: number;
  buyerUid?: string;
  buyerName?: string;
  weightPerUnit?: number;
  unit?: string;
  paymentMethod?: string;
  items?: any[];
  status?: 'paid' | 'pending';
  shopName?: string;
  createdAt: any;
  month?: number; // 0-11
  year?: number;
}

export interface Disbursement {
  id: string;
  shopId: string;
  shopName?: string;
  targetShopId?: string;
  targetShopName?: string;
  totalValue: number;
  items?: any[];
  paymentMethod?: string;
  createdAt: any;
  status?: 'paid' | 'pending';
}

export interface JobOpening {
  id: string;
  shopId: string;
  shopName: string;
  shopType: string;
  ownerUid: string;
  position: string;
  state: string;
  city?: string;
  address: string;
  ageRequirement: string;
  hours: string;
  isApproved?: boolean;
  createdAt: any; // Timestamp
}

export interface JobApplication {
  id: string;
  applicantUid: string;
  applicantName: string;
  applicantEmail: string;
  applicantAge?: string;
  shopId?: string;
  jobId?: string;
  message: string;
  fileName: string;
  fileType: string;
  fileData: string;
  createdAt: string;
  status: 'unread' | 'read' | 'contacted';
}

export interface AppConfig {
  id: string;
  splashScreen: {
    logoUrl: string;
    backgroundColor: string;
    textColor: string;
    message: string;
  };
  pages: {
    [key: string]: {
      columns: number;
      visible: boolean;
      title: string;
      objective?: string;
    };
  };
  metaMessages?: {
    firstSale: string;
    halfTarget: string;
    fullTarget: string;
    notCompleted: string;
  };
}
