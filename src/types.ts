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
  | 'shop-detail'
  | 'pending-approval';

export type UserRole = 'client' | 'vendor' | 'admin' | 'state_admin';

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
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  buyerUid: string;
  shopId: string;
  shopName: string;
  shopOwnerUid: string;
  buyerName: string;
  buyerPhotoURL?: string;
  items: OrderItem[];
  totalValue: number;
  status: 'pending_payment' | 'accepted' | 'paid' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: string;
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
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
  { id: 'feirante', label: 'Feirante Livre', icon: 'User' },
  { id: 'barraca', label: 'Barraca Livre', icon: 'Store' },
  { id: 'atacado', label: 'Atacado', icon: 'Truck' },
  { id: 'restaurante', label: 'Restaurante', icon: 'UtensilsCrossed' },
  { id: 'mercado', label: 'Mercado Livre', icon: 'ShoppingBag' },
];

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
  paymentMethods: string[];
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
  isApproved?: boolean;
  isPromoted?: boolean;
  city?: string;
  state?: string;
  reference?: string;
  whatsapp?: string;
  isContactRestricted?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  photoURL: string;
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
  productId: string;
  productName: string;
  quantity: number;
  totalValue: number;
  totalCost: number;
  buyerUid?: string;
  createdAt: string;
  month: number; // 0-11
  year: number;
}

export interface JobOpening {
  id: string;
  shopId: string;
  shopName: string;
  shopType: string;
  ownerUid: string;
  position: string;
  state: string;
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
}
