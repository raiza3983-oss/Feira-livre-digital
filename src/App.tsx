import React, { useState, useEffect, useRef, Component } from 'react';
import { Logo as LogoSVG } from './components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Store, 
  Search, 
  Truck, 
  Heart, 
  Package, 
  TrendingUp, 
  Key, 
  MessageSquare, 
  Mail, 
  Info, 
  Calculator,
  Calendar,
  Settings,
  Briefcase,
  Bell,
  FileUp,
  Download,
  User,
  Users,
  LayoutGrid,
  Camera,
  ChevronRight,
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle,
  Clock,
  LogOut,
  Trash2,
  Check,
  Plus,
  Copy,
  Save,
  ImagePlus,
  Edit2,
  ExternalLink,
  Star,
  Tent,
  ShieldCheck,
  ChevronDown,
  Send,
  BarChart3,
  ShoppingBag,
  ShoppingCart,
  XCircle,
  FileText,
  BellRing,
  Loader2,
  Scale,
  Minus,
  Zap,
  UserPlus,
  Monitor,
  RefreshCw,
  CreditCard,
  Lock,
  Unlock,
  MoreVertical,
  Filter,
  Eye,
  EyeOff,
  History,
  Edit3,
  BarChart,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingDown,
  UserCheck,
  UserMinus,
  Weight,
  Box,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  ClipboardList,
  Tag,
  AlertTriangle,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { cn, compressImage } from './lib/utils';
import { Screen, UserRole, UserProfile, AppConfig, ChatMessage, Shop, Product, Sale, JobOpening, JobApplication } from './types';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  addDoc, 
  orderBy, 
  limit,
  or,
  Timestamp,
  collectionGroup,
  handleFirestoreError,
  OperationType
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { testConnection } from './firebase';

// --- Components ---

const translateStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'Recebido';
    case 'accepted': return 'Pedido Aceito';
    case 'pending_payment': return 'Aguardando Pagamento';
    case 'paid': return 'Pagamento Aceito';
    case 'preparing': return 'Preparando';
    case 'shipped': return 'Entrega';
    case 'ready': return 'Retirada';
    case 'completed': return 'Pedido Concluído';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

const translateRole = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'state_admin': return 'Administrador Estadual';
    case 'vendor': return 'Vendedor';
    case 'client': return 'Cliente';
    case 'wholesale': return 'Atacadista';
    default: return role;
  }
};

const translateUnit = (unit: string) => {
  if (!unit) return '';
  switch (unit) {
    case 'kg': return 'Quilo';
    case 'gram': return 'Grama';
    case 'box': return 'Caixa';
    case 'bag': return 'Saco';
    case 'unit': return 'Unidade';
    default: return unit;
  }
};

const LoginRequiredView = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-24 h-24 bg-brand-50 text-brand-600 rounded-[32px] flex items-center justify-center shadow-xl mb-4"
    >
      <Lock size={48} className="animate-pulse" />
    </motion.div>
    <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Acesso Restrito</h2>
    <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
      Para manter a segurança das nossas lojas e produtores, o catálogo completo está disponível apenas para usuários cadastrados.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <button 
        onClick={() => onNavigate('landing')}
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
      >
        Entrar com Google
      </button>
    </div>
  </div>
);

// Stable Product Card Component (Memoized to prevent unnecessary re-renders)
const ProductCard = React.memo(({ 
  product, 
  user, 
  shop, 
  cart, 
  addToCart, 
  removeFromCart,
  onNavigate, 
  showNotification 
}: { 
  product: Product, 
  user: UserProfile | null, 
  shop: Shop, 
  cart: any, 
  addToCart: (p: Product) => void,
  removeFromCart: (p: Product) => void,
  onNavigate: (s: Screen) => void,
  showNotification: (m: string, t?: 'success' | 'error') => void
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const inCart = cart?.items.find((i: any) => i.product.id === product.id);
  const qtyInCart = inCart ? inCart.quantity : 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white group flex items-center gap-4 p-4 rounded-[32px] border border-slate-100 hover:border-brand-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 h-full"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 relative overflow-hidden rounded-[20px] bg-slate-50 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-700">
        <img 
          src={product.photoURL || 'https://picsum.photos/seed/product/400/400'} 
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" 
          alt={product.name} 
          referrerPolicy="no-referrer"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[4px] flex flex-col items-center justify-center p-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Indisponível</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-2">
        <div className="space-y-1">
          <h4 className="text-2xl md:text-3xl font-serif italic text-slate-900 leading-[1.1] truncate">
            {product.name}
          </h4>
          {product.description && (
            <p className="text-[10px] text-slate-500 font-medium line-clamp-2 italic leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em] font-sans">{product.category}</span>
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-sans">Estoque: {product.stock}</span>
             {product.weightPerUnit > 0 && (
               <>
                 <div className="w-1 h-1 rounded-full bg-slate-200" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-sans">{translateUnit(product.unit)}: {product.weightPerUnit}{product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : ''}</span>
               </>
             )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="space-y-0.5">
            <p className="text-[4xl] font-serif italic text-slate-900 tabular-nums lowercase leading-none">
              <span className="text-sm mr-1 font-sans font-black tracking-widest uppercase opacity-20">R$</span>
              {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">por {(translateUnit(product.unit) || '').toLowerCase()}</p>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[28px] border border-slate-100 shadow-inner">
            <button 
              onClick={() => removeFromCart(product)}
              disabled={qtyInCart === 0}
              className={cn(
                "w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300",
                qtyInCart > 0 
                  ? "bg-white text-slate-900 shadow-lg hover:bg-slate-900 hover:text-white active:scale-95" 
                  : "text-slate-200 cursor-not-allowed"
              )}
            >
              <Minus size={20} />
            </button>
            
            <div className="w-10 flex flex-col items-center">
              <span className={cn(
                "text-xl font-serif italic transition-all",
                qtyInCart > 0 ? "text-slate-900 scale-110" : "text-slate-300"
              )}>
                {qtyInCart}
              </span>
              <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none">Qtd</span>
            </div>

            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= qtyInCart}
              className={cn(
                "w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300",
                product.stock > qtyInCart 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-brand-500 active:scale-95" 
                  : "bg-white/50 text-slate-200 cursor-not-allowed"
              )}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}, (prev, next) => {
  const prevQty = prev.cart?.items?.find((i: any) => i.product.id === prev.product.id)?.quantity || 0;
  const nextQty = next.cart?.items?.find((i: any) => i.product.id === next.product.id)?.quantity || 0;
  
  return prev.product.id === next.product.id && 
         prev.product.stock === next.product.stock &&
         prev.product.price === next.product.price &&
         prevQty === nextQty;
});

const BRAZIL_STATES = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' }
];

const PRODUCT_CATEGORIES = [
  { id: 'frutas', name: 'Frutas', icon: '🍎' },
  { id: 'legumes', name: 'Hortifruti', icon: '🥦' },
  { id: 'carnes', name: 'Carnes', icon: '🥩' },
  { id: 'pastel', name: 'Pastelaria', icon: '🥟' },
  { id: 'artesanato', name: 'Artesanato', icon: '🎨' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'outros', name: 'Outros', icon: '📦' },
];

const Logo = ({ className, size = "md" }: { className?: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  return <LogoComponent className={className} size={size} />;
};

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  badge
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void,
  badge?: number | boolean
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-3 transition-all duration-500 relative group",
      active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {active && (
      <>
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-x-1 inset-y-1.5 bg-brand-50 rounded-2xl z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
        <motion.div
          layoutId="nav-bar-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-600 rounded-full z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      </>
    )}
    <div className="relative z-10 flex flex-col items-center">
      <div className={cn(
        "p-1 rounded-xl transition-all duration-500",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {badge && (
          <motion.span 
            key={typeof badge === 'boolean' ? 'dot' : badge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center border-2 border-white shadow-sm bg-red-500 text-white rounded-full",
              typeof badge === 'boolean' ? "w-2.5 h-2.5 animate-pulse" : "min-w-[16px] h-[16px] px-1 text-[8px] font-black"
            )}
          >
            {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
          </motion.span>
        )}
      </div>
      <span className={cn(
        "text-[8px] mt-0.5 font-black uppercase tracking-[0.15em] transition-all duration-500",
        active ? "opacity-100 translate-y-0" : "opacity-40 group-hover:opacity-70"
      )}>
        {label}
      </span>
    </div>
  </button>
);

// --- Screens ---

const PageContainer = ({ 
  children, 
  screen, 
  config 
}: { 
  children: React.ReactNode, 
  screen: Screen, 
  config: AppConfig | null 
}) => {
  const pageConfig = config?.pages?.[screen];
  
  if (pageConfig && !pageConfig.visible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-300">
        <X size={48} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest">Esta página está temporariamente indisponível</p>
      </div>
    );
  }

  const columns = pageConfig?.columns || 1;
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }[columns as 1 | 2 | 3] || "grid-cols-1";

  return (
    <div className={cn("grid gap-6", gridCols)}>
      {children}
    </div>
  );
};

const PhotoUpload = ({ 
  value, 
  onChange, 
  label = "Foto", 
  className = "" 
}: { 
  value: string, 
  onChange: (base64: string) => void, 
  label?: string,
  className?: string
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Otimiza a imagem para no máximo 800x800 e 70% de qualidade
      const optimizedBase64 = await compressImage(file, 800, 800, 0.7);
      onChange(optimizedBase64);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 flex-shrink-0">
          <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            {value ? (
              <img src={value} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Camera size={24} />
              </div>
            )}
          </div>
          {isCompressing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <RefreshCw size={20} className="animate-spin text-brand-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-all flex items-center gap-2"
            >
              <FileUp size={14} /> {value ? 'Trocar Foto' : 'Escolher Foto'}
            </button>
            {value && (
              <button 
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                Remover
              </button>
            )}
          </div>
          <p className="text-[9px] font-medium text-slate-400">
            {isCompressing ? 'Otimizando imagem...' : 'A foto será otimizada automaticamente para melhor performance.'}
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

const LandingScreen = ({ 
  onSelectRole, 
  onLogin, 
  onNavigate,
  loggingInRole,
  authError,
  config
}: { 
  onSelectRole: (role: string) => void, 
  onLogin: (role: UserRole, loginType?: string) => void,
  onNavigate: (screen: Screen) => void,
  loggingInRole: string | null,
  authError: string | null,
  config: AppConfig | null
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 pb-32">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Logo size="xl" />
    </motion.div>
    
    <AnimatePresence>
      {authError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 w-full max-w-md bg-red-50 border border-red-100 rounded-[24px] p-6 text-center shadow-lg shadow-red-500/5 overflow-hidden"
        >
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h4 className="text-red-900 font-black text-xs uppercase tracking-[0.2em] mb-3">Erro na Autenticação</h4>
          <p className="text-red-700 text-xs mb-6 leading-relaxed font-bold">
            {authError === 'network-error' 
              ? 'Houve uma falha de comunicação. Isso geralmente ocorre quando os cookies de terceiros estão bloqueados no navegador ou o domínio não está autorizado.' 
              : 'Não foi possível completar o login. Por favor, tente novamente usando o link abaixo.'}
          </p>
          <a 
            href={window.location.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-95"
          >
            Abrir em nova aba
          </a>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">Feira Livre Digital 🇧🇷</h2>
      <p className="text-slate-500 text-sm max-w-xs mx-auto text-balance leading-relaxed">
        A plataforma que conecta você aos melhores produtos frescos da sua região.
      </p>
    </motion.div>

    <div className="w-full max-w-6xl">
      <PageContainer screen="landing" config={config}>
        {/* Sou Cliente */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <User size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Sou Cliente</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            Encontre as melhores barracas, produtos frescos e ofertas exclusivas.
          </p>
          <button 
            onClick={() => onLogin('client', 'client')} 
            disabled={!!loggingInRole}
            className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {loggingInRole === 'client' ? 'Autenticando...' : 'Entrar com Google'}
          </button>
        </motion.div>

        {/* Sou Feirante */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-brand-600 rounded-[32px] p-8 shadow-xl shadow-brand-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Store size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Sou Feirante</h3>
          <p className="text-brand-100 text-xs mb-8 leading-relaxed">
            Gerencie sua barraca, cadastre produtos e venda muito mais.
          </p>
          <button 
            onClick={() => onLogin('vendor', 'vendor_feirante')} 
            disabled={!!loggingInRole}
            className="w-full py-3.5 px-6 bg-white text-brand-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-brand-50 transition-all shadow-lg shadow-brand-700/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {loggingInRole === 'vendor_feirante' ? 'Autenticando...' : 'Entrar com Google'}
          </button>
        </motion.div>

        {/* Sou Atacado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Truck size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Sou Atacado</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            Venda em grandes quantidades para comércios e revendedores.
          </p>
          <button 
            onClick={() => onLogin('vendor', 'vendor_atacado')} 
            disabled={!!loggingInRole}
            className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {loggingInRole === 'vendor_atacado' ? 'Autenticando...' : 'Entrar com Google'}
          </button>
        </motion.div>

        {/* Administração */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-slate-900 rounded-[32px] p-8 shadow-soft border border-slate-800 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Administração</h3>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            Gestão de feiras, usuários e configurações globais do sistema.
          </p>
          <button 
            onClick={() => onLogin('state_admin', 'admin')} 
            disabled={!!loggingInRole}
            className="w-full py-3.5 px-6 bg-white text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-100 transition-all shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            {loggingInRole === 'admin' ? 'Autenticando...' : 'Entrar com Google'}
          </button>
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Acesso Restrito</span>
        </motion.div>
      </PageContainer>
    </div>

    <footer className="mt-20 flex flex-col items-center gap-6 opacity-60">
      <div className="flex items-center gap-8 text-slate-400">
        <button onClick={() => onNavigate('privacy')} className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Privacidade</button>
        <button onClick={() => onNavigate('terms')} className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Termos</button>
        <button onClick={() => onNavigate('careers')} className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Trabalhe conosco</button>
        <button onClick={() => onNavigate('contact')} className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Suporte</button>
      </div>
      <p className="text-slate-400 text-[10px] font-medium tracking-wide">
        © 2026 FEIRA LIVRE DIGITAL • TODOS OS DIREITOS RESERVADOS
      </p>
    </footer>
  </div>
);

const SalesScreen = ({ config, user, onNavigate, showNotification, showConfirm }: { config: AppConfig | null, user: UserProfile | null, onNavigate: (screen: Screen) => void, showNotification: (m: string, t?: 'success' | 'error') => void, showConfirm: (t: string, m: string, c: () => void) => void }) => {
  const [sales, setSales] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [buyerProfiles, setBuyerProfiles] = useState<{ [key: string]: UserProfile }>({});

  useEffect(() => {
    if (!user) return;
    if (user.role === 'vendor') {
      const shopQuery = query(collection(db, 'shops'), where('ownerUid', '==', user.uid), limit(1));
      getDocs(shopQuery).then(snapshot => {
        if (!snapshot.empty) {
          const shopData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop;
          setMyShop(shopData);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!myShop) return;
    const q = query(collection(db, 'shops', myShop.id, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [myShop]);

  useEffect(() => {
    if (!user) return;
    let q;
    if (user.role === 'vendor') {
      if (!myShop) return;
      q = query(
        collection(db, 'orders'),
        where('shopOwnerUid', '==', user.uid),
        where('shopId', '==', myShop.id),
        orderBy('createdAt', 'desc')
      );
    } else if (user.role === 'admin' || user.role === 'state_admin') {
      q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'),
        where('buyerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(allOrders);
      setSales(allOrders.filter((o: any) => o.status === 'completed'));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    return () => unsubscribe();
  }, [user, myShop]);

  const totalSalesValue = sales.reduce((acc, sale) => acc + (sale.totalValue || 0), 0);
  const totalProductsSold = sales.reduce((acc, sale) => acc + (sale.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0), 0);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      if (!orderData || !myShop) return;

      const oldStatus = orderData.status;

      // Se estiver aceitando o pedido agora (verificação de produtos), descontar do estoque
      if (newStatus === 'accepted' && oldStatus === 'pending') {
        // Verificar estoque antes de aceitar
        for (const item of orderData.items) {
          const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock || 0;
            if (currentStock < item.quantity) {
              showNotification(`Estoque insuficiente para ${item.name}. Temos apenas ${currentStock} disponíveis.`, 'error');
              return;
            }
          }
        }

        // Descontar do estoque
        for (const item of orderData.items) {
          const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            await updateDoc(productRef, {
              stock: Math.max(0, (productSnap.data().stock || 0) - item.quantity)
            });
          }
        }
      }

      // Se o pedido for cancelado e já tinha saído do estoque (estava aceito em diante), devolver
      const deductedStatuses = ['accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready', 'completed'];
      if (newStatus === 'cancelled' && deductedStatuses.includes(oldStatus)) {
        if (orderData.items) {
          for (const item of orderData.items) {
            const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              await updateDoc(productRef, {
                stock: (productSnap.data().stock || 0) + item.quantity
              });
            }
          }
        }
      }

      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      showNotification(`Pedido ${translateStatus(newStatus).toLowerCase()} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <PageContainer screen="sales" config={config}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2">Vendas</h2>
            <p className="text-slate-500 font-medium">Relatório detalhado de pedidos e performance comercial.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-soft border border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total em Vendas</span>
                <span className="text-xl font-black text-slate-900">R$ {totalSalesValue.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-soft border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Produtos Vendidos</span>
                <span className="text-xl font-black text-slate-900">{totalProductsSold}</span>
              </div>
            </div>
          </div>
        </div>

        {user?.role === 'vendor' && (
          <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'overview', label: 'Visão Geral', icon: LayoutGrid },
              { id: 'products', label: 'Produtos à Venda', icon: Package },
              { id: 'orders', label: 'Pedidos de Clientes', icon: ShoppingBag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105" 
                    : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-6">
                  {sales.length > 0 ? (
                    <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black font-display">Histórico de Vendas Concluídas</h3>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {sales.length} Pedidos
                        </span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {sales.map((sale) => (
                          <div key={sale.id} className="p-8 hover:bg-slate-50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-brand-600 transition-all">
                                  <ShoppingBag size={24} />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900">Pedido #{sale.id.slice(-6)} • {sale.buyerName}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                    <User size={10} /> {sale.buyerName} • <Phone size={10} /> {sale.buyerPhone || 'Sem telefone'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                <span className="text-lg font-black text-slate-900 block">R$ {sale.totalValue?.toFixed(2)}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {sale.createdAt?.toDate().toLocaleDateString()}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showConfirm(
                                        'Excluir Registro de Venda',
                                        'Deseja realmente excluir este registro? Isso afetará os cálculos de lucro e vendas totais.',
                                        async () => {
                                          try {
                                            // Se for um pedido real, deletar da coleção orders
                                            // Se for venda manual, deletar de shops/ID/sales
                                            if (sale.id.length > 20) { // IDs do Firestore costumam ser longos
                                              await deleteDoc(doc(db, 'orders', sale.id));
                                            } else {
                                              await deleteDoc(doc(db, 'shops', myShop!.id, 'sales', sale.id));
                                            }
                                            showNotification('Venda excluída e cálculos atualizados!');
                                          } catch (err) {
                                            handleFirestoreError(err, OperationType.DELETE, `sales/${sale.id}`);
                                          }
                                        }
                                      );
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                    title="Excluir Venda"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sale.items?.map((item: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-500">
                                  {item.quantity}x {item.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-[40px] p-16 shadow-soft flex flex-col items-center justify-center min-h-[400px] text-center">
                      <Package size={40} className="text-slate-200 mb-6" />
                      <h3 className="text-xl font-black text-slate-900 mb-2 font-display">Nenhuma venda concluída</h3>
                      <p className="text-slate-400 text-sm">Seus pedidos finalizados aparecerão aqui.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-xl font-black font-display mb-6">Resumo Contábil</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ticket Médio</span>
                        <span className="text-lg font-black">R$ {(totalSalesValue / (sales.length || 1)).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Crescimento</span>
                        <span className="text-emerald-400 font-black flex items-center gap-1">
                          <ArrowUpRight size={16} /> 12%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigate('vendor-accounting')}
                      className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                      Ver Contabilidade Completa
                    </button>
                  </div>

                  <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-xl font-black font-display mb-6">Pedidos Ativos</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aguardando</span>
                        <span className={cn(
                          "text-lg font-black",
                          orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 ? "text-amber-400" : "text-white"
                        )}>
                          {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length} Pedidos
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="w-full mt-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20"
                    >
                      Gerenciar Pedidos
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                    <h3 className="text-lg font-black font-display mb-6">Dicas de Performance</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          Lojas que respondem o chat em menos de 5 minutos vendem <span className="text-brand-600 font-bold">3x mais</span>.
                        </p>
                      </div>
                      <button 
                        onClick={() => onNavigate('sales-tips')}
                        className="w-full py-4 text-brand-600 text-[10px] font-black uppercase tracking-widest hover:bg-brand-50 rounded-2xl transition-all"
                      >
                        Ver Todas as Dicas
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'products' ? (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 font-display">
                      <Package className="text-brand-500" /> Produtos à Venda
                    </h3>
                    <button 
                      onClick={() => onNavigate('shop-management')}
                      className="px-6 py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
                    >
                      <Plus size={16} /> Gerenciar Catálogo
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                          <img src={product.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">{product.name}</h4>
                        <p className="text-brand-600 font-black text-xl mb-4">R$ {(product.price || 0).toFixed(2)}</p>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{product.category}</span>
                          <span>{product.stock <= 0 ? "Acabou o produto" : `${product.stock} em estoque`}</span>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && (
                      <div className="col-span-full py-20 text-center text-slate-400">
                        Nenhum produto cadastrado.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'orders' ? (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 font-display">
                    <ShoppingBag className="text-emerald-500" /> Pedidos de Clientes
                  </h3>
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm overflow-hidden border border-slate-100">
                              {order.buyerPhotoURL ? (
                                <img src={order.buyerPhotoURL} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <User size={24} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-lg">{order.buyerName}</h4>
                                {(() => {
                                  const orderTime = order.updatedAt?.toMillis ? order.updatedAt.toMillis() : (order.createdAt?.toMillis ? order.createdAt.toMillis() : 0);
                                  const lastSeenTime = user?.lastSeenOrderAt?.toMillis ? user.lastSeenOrderAt.toMillis() : 0;
                                  if (orderTime > lastSeenTime && order.status !== 'completed' && order.status !== 'cancelled') {
                                    return <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />;
                                  }
                                  return null;
                                })()}
                              </div>
                              <p className="text-xs text-slate-400 font-medium">{order.createdAt?.toDate().toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="px-6 py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">Recebido</button>
                            )}
                            {order.status === 'accepted' && (
                              <button onClick={() => updateOrderStatus(order.id, 'pending_payment')} className="px-6 py-3 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">Pedido Aceito</button>
                            )}
                            {order.status === 'pending_payment' && (
                              <button onClick={() => updateOrderStatus(order.id, 'paid')} className="px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">Aguardando Pagamento</button>
                            )}
                            {order.status === 'paid' && (
                              <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">Pagamento Aceito</button>
                            )}
                            {order.status === 'preparing' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, order.deliveryType === 'delivery' ? 'shipped' : 'ready')} 
                                className="px-6 py-3 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                              >
                                {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                              </button>
                            )}
                            {(order.status === 'shipped' || order.status === 'ready') && (
                              <button onClick={() => updateOrderStatus(order.id, 'completed')} className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">Pedido Concluído</button>
                            )}
                            
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <button 
                                onClick={() => {
                                  showConfirm(
                                    'Cancelar Pedido',
                                    'Deseja realmente cancelar este pedido? O estoque será devolvido.',
                                    () => updateOrderStatus(order.id, 'cancelled')
                                  );
                                }} 
                                className="px-4 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-medium">{item.quantity}x {item.name}</span>
                                <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                              <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total a Pagar</span>
                              <span className="text-xl font-black text-brand-600">R$ {order.totalValue?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="bg-white p-8 rounded-[32px] border-2 border-brand-100 space-y-5 shadow-sm">
                            <h5 className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <MapPin size={14} /> Informações de Entrega
                            </h5>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço de Entrega</span>
                              <div className="space-y-1">
                                <p className="text-base font-black text-slate-900 leading-tight">
                                  {order.deliveryAddress || 'Retirada na Loja'}
                                </p>
                                {order.deliveryType === 'delivery' && (order.buyerCity || order.buyerState) && (
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    {order.buyerState && <span>{order.buyerState}. </span>}
                                    {order.buyerCity && <span>{order.buyerCity}. </span>}
                                    <span>Brasil.</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                  <Truck size={14} />
                                  <span className="capitalize">{order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</span>
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                  <CreditCard size={14} />
                                  <span>{order.paymentMethod || 'Não informado'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato do Cliente</span>
                              <div className="flex items-center gap-2 text-slate-900 font-black">
                                <Phone size={14} className="text-brand-500" />
                                <span>{order.buyerPhone || 'Não informado'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-center py-8 text-slate-400 text-xs font-medium italic">Nenhum pedido recebido ainda</p>}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </PageContainer>
    </div>
  );
};

const CreateShopScreen = ({ 
  user, 
  showNotification, 
  config,
  onComplete 
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  config: AppConfig | null,
  onComplete: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Shop>>({
    type: 'feirante',
    paymentMethods: ['Pix'],
    acceptsDelivery: true,
    acceptsPickup: true,
    openingHours: '07:00',
    closingHours: '17:00',
    isOpen: true,
    workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!formData.name || !formData.address) {
      showNotification('Por favor, preencha o nome e o endereço.', 'error');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'shops'), {
        ...formData,
        ownerUid: user.uid,
        createdAt: Timestamp.now(),
        isPromoted: false,
        isApproved: false
      });
      showNotification('Sua loja foi enviada para aprovação da administração!');
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'shops');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pb-32">
      <PageContainer screen="create-shop" config={config}>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[28px] flex items-center justify-center mb-6 shadow-inner">
              <Store size={36} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight mb-3">Criar Minha Loja</h2>
            <p className="text-slate-500 font-medium max-w-sm">Conte-nos um pouco sobre sua barraca ou negócio para começarmos.</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <PhotoUpload 
                value={formData.photoURL || ''} 
                onChange={base64 => setFormData({...formData, photoURL: base64})} 
                label="Identidade Visual da Loja"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome da Loja/Barraca</label>
                <input 
                  type="text" 
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Horta do Zé" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tipo de Negócio</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium text-slate-600"
                  >
                    <option value="feirante">Feira Livre</option>
                    <option value="atacado">Atacado / Distribuidor</option>
                    <option value="restaurante">Restaurante / Cozinha</option>
                    <option value="mercado">Mercado Livre</option>
                    <option value="barraca">Barraca Livre</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Descrição</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Fale um pouco sobre o que você vende..."
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-32 resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Endereço Completo</label>
              <input 
                type="text" 
                value={formData.address || ''}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Rua, Número, Bairro" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ponto de Referência (Loja, Barraca, Feira, etc)</label>
              <input 
                type="text" 
                value={formData.reference || ''}
                onChange={e => setFormData({...formData, reference: e.target.value})}
                placeholder="Ex: Próximo à banca de flores, Stall 45" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cidade</label>
                <input 
                  type="text" 
                  value={formData.city || ''}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: São Paulo" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Estado</label>
                <select 
                  value={formData.state || ''}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold appearance-none"
                >
                  <option value="">Selecione</option>
                  {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Horário Abertura</label>
                <input type="time" value={formData.openingHours} onChange={e => setFormData({...formData, openingHours: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Horário Fechamento</label>
                <input type="time" value={formData.closingHours} onChange={e => setFormData({...formData, closingHours: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Métodos de Pagamento</label>
              <div className="flex flex-wrap gap-3">
                {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(method => (
                  <button 
                    key={method}
                    onClick={() => {
                      const current = formData.paymentMethods || [];
                      const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                      setFormData({...formData, paymentMethods: next});
                    }}
                    className={cn(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      formData.paymentMethods?.includes(method) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-6 bg-brand-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Finalizar e Criar Loja'}
            </button>
          </div>
        </div>
        </div>
      </PageContainer>
    </div>
  );
};

const CalculatorScreen = ({ config, onBack, user, onApply, initialData }: { 
  config: AppConfig | null, 
  onBack?: () => void, 
  user?: UserProfile | null, 
  onApply?: (data: { price: number, unit: string, weightPerUnit: number }) => void,
  initialData?: { price: number, unit: string, weightPerUnit: number }
}) => {
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'kg' | 'gram' | 'box' | 'bag' | 'unit'>(initialData?.unit as any || 'unit');
  const [weightPerUnit, setWeightPerUnit] = useState<number>(initialData?.weightPerUnit || 1);
  const [priceType, setPriceType] = useState<'per_unit' | 'per_kg'>('per_unit');
  const [productName, setProductName] = useState('');
  const [shopType, setShopType] = useState<string>('feira');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  const SHOP_TYPES = [
    { id: 'feira', label: 'Feirante Livre', color: 'bg-emerald-500', icon: Store },
    { id: 'barraca', label: 'Barraca Livre', color: 'bg-amber-500', icon: Tent },
    { id: 'mercado', label: 'Mercado Livre', color: 'bg-blue-500', icon: ShoppingBag },
    { id: 'atacado', label: 'Atacado Livre', color: 'bg-purple-500', icon: Truck }
  ];

  useEffect(() => {
    if (user && user.role === 'vendor') {
      // Try to auto-detect shop type from user profile or shop
      const fetchShopType = async () => {
        const q = query(collection(db, 'shops'), where('ownerUid', '==', user.uid), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const shopData = snap.docs[0].data();
          if (shopData.type) {
            setShopType(shopData.type);
          }
        }
      };
      fetchShopType();
    }
  }, [user]);
  
  const calculateTotal = () => {
    // price per unit/box/bag/kg/g
    const basePrice = Number(price) || 0;
    const qty = Number(quantity) || 0;
    const weight = Number(weightPerUnit) || 1;

    if (priceType === 'per_kg') {
      if (unit === 'gram') {
        return basePrice * (qty / 1000);
      }
      if (unit === 'kg') {
        return basePrice * qty;
      }
      if (unit === 'box' || unit === 'bag' || unit === 'unit') {
        return basePrice * qty * weight;
      }
    }
    
    return basePrice * qty;
  };

  useEffect(() => {
    // Reset weight if it becomes invalid or zero when switching units that require it
    if ((unit === 'box' || unit === 'bag') && (weightPerUnit <= 0 || isNaN(weightPerUnit))) {
      setWeightPerUnit(1);
    }
  }, [unit]);

  const total = calculateTotal();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Calculadora Inteligente</h2>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Precisão por Peso e Unidade</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative shadow-sm">
          <Calculator size={24} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Zap size={10} className="text-white fill-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
            {/* Shop Type Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo de Comércio</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SHOP_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setShopType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        shopType === type.id 
                          ? `border-brand-500 bg-brand-50 text-brand-600` 
                          : "border-gray-50 bg-white text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <Icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-tight leading-tight">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Produto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tomate, Batata, Saco de Milho..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Preço Base (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      placeholder="0,00"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-4 pl-12 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo de Precificação</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-slate-100 rounded-2xl h-[56px]">
                    <button 
                      onClick={() => setPriceType('per_unit')}
                      className={cn(
                        "rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        priceType === 'per_unit' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Por Unidade
                    </button>
                    <button 
                      onClick={() => setPriceType('per_kg')}
                      className={cn(
                        "rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        priceType === 'per_kg' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Por Quilo
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantidade</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unidade de Medida</label>
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900 appearance-none"
                  >
                    <option value="unit">Unidade (un)</option>
                    <option value="kg">Quilo (kg)</option>
                    <option value="gram">Grama (g)</option>
                    <option value="box">Caixa (cx)</option>
                    <option value="bag">Saco (sc)</option>
                  </select>
                </div>
              </div>

              {(unit === 'box' || unit === 'bag' || (unit === 'unit' && priceType === 'per_kg')) && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Peso/Capacidade por {unit === 'box' ? 'Caixa' : unit === 'bag' ? 'Saco' : 'Unidade'} (kg)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={weightPerUnit}
                      onChange={(e) => setWeightPerUnit(Number(e.target.value))}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                      placeholder="Ex: 20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cálculo de Troco */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                <Banknote size={16} />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Cálculo de Troco</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Valor Recebido (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    placeholder="0,00"
                    value={amountReceived || ''}
                    onChange={(e) => setAmountReceived(Number(e.target.value))}
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-brand-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Troco a Devolver</p>
                <p className={cn(
                  "text-2xl font-black",
                  amountReceived - total >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  R$ {Math.max(0, amountReceived - total).toFixed(2)}
                </p>
                {amountReceived > 0 && amountReceived < total && (
                  <p className="text-[8px] font-bold text-red-400 uppercase mt-1">Valor insuficiente</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                {(() => {
                  const currentType = SHOP_TYPES.find(t => t.id === shopType);
                  const Icon = currentType?.icon || Store;
                  return (
                    <>
                      <Icon size={14} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentType?.label}</span>
                    </>
                  );
                })()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Estimado</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold opacity-80">R$</span>
                <span className="text-5xl font-black tracking-tighter">
                  {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-60">Itens / Peso</span>
                  <span className="font-black">
                    {quantity} {translateUnit(unit).toLowerCase()} ({priceType === 'per_unit' ? (quantity * weightPerUnit).toFixed(2) : quantity.toFixed(2)} kg)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Info size={16} />
              </div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Dica Inteligente</h4>
            </div>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              {priceType === 'per_kg' 
                ? "Você está calculando por peso. Certifique-se de que a balança esteja aferida para garantir a precisão do valor final."
                : "Cálculo por unidade é ideal para produtos padronizados. Para caixas e sacos, o peso total ajuda no planejamento do frete."}
            </p>
          </div>

          {onApply && (
            <button
              onClick={() => onApply({ price, unit, weightPerUnit })}
              className="w-full py-5 bg-brand-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <CheckCircle size={20} /> Aplicar ao Produto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PendingApprovalScreen = ({ onLogout }: { onLogout: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
    </div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[40px] p-12 shadow-soft border border-slate-100 max-w-md relative z-10"
    >
      <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mb-8 mx-auto shadow-inner">
        <Clock size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4 font-display tracking-tight">Aguardando Aprovação</h2>
      <p className="text-slate-500 font-medium mb-10 leading-relaxed">
        Seu cadastro como administrador foi recebido e está aguardando a aprovação de um administrador sênior. 
        Você receberá acesso total assim que for aprovado.
      </p>
      <button 
        onClick={onLogout}
        className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3"
      >
        <LogOut size={20} /> Sair da Conta
      </button>
    </motion.div>
    
    <p className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 relative z-10">
      Feira Livre Digital • Segurança & Gestão
    </p>
  </div>
);

const PrivacyScreen = ({ config }: { config: AppConfig | null }) => (
  <div className="p-6 max-w-4xl mx-auto pb-32">
    <PageContainer screen="privacy" config={config}>
      <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12 md:p-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Privacidade</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Política de Proteção de Dados</p>
            </div>
          </div>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">1. Coleta de Informações</h3>
              <p className="mb-4">
                No Aplicativo Feira Livre, coletamos informações essenciais para proporcionar a melhor experiência de conexão entre produtores e consumidores:
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>Dados de Identificação: Nome, e-mail e foto de perfil via Google Login.</li>
                <li>Localização: Para mostrar as feiras e barracas mais próximas de você.</li>
                <li>Dados de Negócio: Informações sobre sua barraca, produtos e vendas (para feirantes).</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">2. Uso dos Dados</h3>
              <p className="mb-4">
                Seus dados são utilizados exclusivamente para as seguintes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>Facilitar a comunicação entre clientes e feirantes.</li>
                <li>Processar pedidos e gerenciar o histórico de vendas.</li>
                <li>Melhorar as funcionalidades do aplicativo com base no uso.</li>
                <li>Garantir a segurança e integridade da plataforma.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">3. Compartilhamento de Informações</h3>
              <p>
                Não vendemos seus dados para terceiros. O compartilhamento ocorre apenas quando necessário para a operação do serviço, como mostrar o nome do feirante para o cliente ou vice-versa durante um pedido.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">4. Segurança</h3>
              <p>
                Implementamos medidas rigorosas de segurança, incluindo criptografia e autenticação segura via Firebase, para proteger suas informações contra acesso não autorizado ou vazamentos.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">5. Seus Direitos</h3>
              <p>
                Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento através das configurações do seu perfil ou entrando em contato com nosso suporte.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última atualização: Abril de 2026</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
);

const TermsScreen = ({ config }: { config: AppConfig | null }) => (
  <div className="p-6 max-w-4xl mx-auto pb-32">
    <PageContainer screen="terms" config={config}>
      <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12 md:p-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center shadow-inner">
              <FileText size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Termos de Uso</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Regras e Condições da Plataforma</p>
            </div>
          </div>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar o Aplicativo Feira Livre, você concorda integralmente com estes termos. Se você não concordar com qualquer parte, não deverá utilizar a plataforma.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">2. Descrição do Serviço</h3>
              <p>
                A Feira Livre Digital é uma plataforma de intermediação que conecta consumidores a feirantes e atacadistas. Não somos proprietários dos produtos vendidos e não garantimos a disponibilidade imediata de todos os itens listados.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">3. Responsabilidades do Usuário</h3>
              <p className="mb-4">Como usuário, você se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>Fornecer informações verídicas em seu cadastro.</li>
                <li>Utilizar a plataforma de forma ética e legal.</li>
                <li>Honrar os compromissos de compra assumidos com os feirantes.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">4. Responsabilidades do Feirante</h3>
              <p className="mb-4">Como feirante, você se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>Manter a qualidade e frescor dos produtos oferecidos.</li>
                <li>Atualizar preços e disponibilidade de forma honesta.</li>
                <li>Cumprir os prazos e locais de entrega/retirada acordados.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">5. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo da plataforma, incluindo logotipos, design e software, é de propriedade exclusiva da Feira Livre Digital ou de seus licenciadores.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 font-display">6. Limitação de Responsabilidade</h3>
              <p>
                Não nos responsabilizamos por danos indiretos, perda de lucros ou problemas decorrentes de negociações diretas entre usuários fora das funcionalidades da plataforma.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última atualização: Abril de 2026</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
);

const SalesTipsScreen = ({ config, onNavigate }: { config: AppConfig | null, onNavigate: (screen: Screen) => void }) => (
  <div className="p-6 max-w-4xl mx-auto pb-32">
    <PageContainer screen="sales-tips" config={config}>
      <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12 md:p-20">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[24px] flex items-center justify-center shadow-inner">
                <Zap size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Dicas de Vendas</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Guia para o Sucesso da sua Loja</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('sales')}
              className="px-6 py-3 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-200 transition-all"
            >
              Voltar para Vendas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
                <Camera size={24} className="text-brand-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Fotos que Vendem</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Use luz natural e fundos limpos. Mostre o frescor dos seus produtos com fotos de alta resolução. Clientes compram com os olhos primeiro!
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
                <MessageSquare size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Atendimento Ágil</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Responda às dúvidas rapidamente. A cordialidade e a rapidez no atendimento aumentam as chances de conversão em até 70%.
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
                <TrendingUp size={24} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Preços e Combos</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Crie "combos da semana" ou kits prontos. Isso facilita a decisão de compra e aumenta o ticket médio da sua banca.
              </p>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-6">
                <ShoppingBag size={24} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 font-display">Embalagem e Carinho</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Uma embalagem limpa e um bilhete de agradecimento fazem toda a diferença. Fidelize seus clientes com pequenos detalhes.
              </p>
            </div>
          </div>

          <div className="mt-12 p-10 bg-brand-600 rounded-[40px] text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 font-display">Dica de Ouro: Logística</h3>
              <p className="text-brand-100 font-medium leading-relaxed max-w-xl">
                Entregas por aplicativo, entregas em outros aplicativos e formas de pagamentos.
              </p>
            </div>
            <Zap size={120} className="absolute -bottom-4 -right-4 text-brand-500 opacity-20 rotate-12" />
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
);

const CareersScreen = ({ config, user, showNotification, showConfirm, onNavigate }: { config: AppConfig | null, user: UserProfile | null, showNotification: (msg: string, type: 'success' | 'error') => void, showConfirm: (t: string, m: string, c: () => void) => void, onNavigate: (screen: Screen) => void }) => {
  const [message, setMessage] = useState('');
  const [age, setAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpening | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    position: '',
    description: '',
    requirements: '',
    salary: '',
    hours: '',
    ageRequirement: '',
    shopType: 'feira' as 'feira' | 'mercado' | 'barraca' | 'atacado'
  });

  useEffect(() => {
    const q = query(collection(db, 'jobOpenings'), where('isApproved', '==', true), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobOpenings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JobOpening[]);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'jobOpenings'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.role === 'vendor') {
      const q = query(collection(db, 'shops'), where('ownerUid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setMyShop({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'shops'));
      return () => unsubscribe();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showNotification('Por favor, escreva seu currículo ou mensagem.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationText = `[CURRÍCULO ${selectedJobForApply ? `PARA VAGA: ${selectedJobForApply.position}` : 'GERAL'}]\nIdade: ${age}\n\n${message}`;
      const receiverUid = selectedJobForApply?.ownerUid || 'admin_system';

      await addDoc(collection(db, 'chatMessages'), {
        senderUid: user?.uid || 'anonymous',
        receiverUid,
        text: applicationText,
        shopName: selectedJobForApply?.shopName || 'Administração',
        createdAt: Timestamp.now()
      });

      showNotification('Candidatura enviada com sucesso via chat!', 'success');
      setMessage('');
      setAge('');
      setShowApplyModal(false);
      setSelectedJobForApply(null);
      setIsSubmitting(false);
      onNavigate('chats');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chatMessages');
      showNotification('Erro ao enviar candidatura.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    showConfirm(
      'Excluir Vaga',
      'Deseja realmente excluir esta vaga?',
      async () => {
        try {
          await deleteDoc(doc(db, 'jobOpenings', id));
          showNotification('Vaga excluída com sucesso.', 'success');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `jobOpenings/${id}`);
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      <PageContainer screen="careers" config={config}>
        <div className="space-y-12">
          {/* Header Section */}
          <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-12 md:p-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center shadow-inner">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Trabalhe Conosco</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Oportunidades no campo e na cidade</p>
                  </div>
                </div>
                {user?.role === 'vendor' && (
                  <button 
                    onClick={() => setShowJobModal(true)}
                    className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                  >
                    <Plus size={18} /> Publicar Vaga
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-black text-slate-900 mb-4 font-display">Por que trabalhar conosco?</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Somos uma plataforma em crescimento que conecta o campo à mesa. Buscamos pessoas apaixonadas por tecnologia, logística e impacto social.
                    </p>
                  </section>

                  <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100">
                    <h4 className="font-black text-emerald-900 uppercase tracking-widest text-[10px] mb-4">Nossos Valores</h4>
                    <ul className="space-y-3">
                      {['Inovação no Campo', 'Transparência', 'Impacto Social', 'Crescimento Ágil'].map((val, i) => (
                        <li key={i} className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                          <CheckCircle size={16} /> {val}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Envio de Currículo Geral</h4>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Idade</label>
                    <input 
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ex: 25"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Currículo / Mensagem</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva aqui suas experiências e qualificações..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-64 resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-5 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Currículo via Chat'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Job Posting Modal (For Vendors) */}
          <AnimatePresence>
            {showJobModal && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowJobModal(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="p-8 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-2xl font-black font-display">Publicar Vaga</h3>
                    <button onClick={() => setShowJobModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo</label>
                      <input type="text" value={jobForm.position} onChange={e => setJobForm({...jobForm, position: e.target.value})} placeholder="Ex: Auxiliar de Vendas" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Estabelecimento</label>
                        <select value={jobForm.shopType} onChange={e => setJobForm({...jobForm, shopType: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold">
                          <option value="feira">Feira Livre</option>
                          <option value="mercado">Mercado Livre</option>
                          <option value="barraca">Barraca Livre</option>
                          <option value="atacado">Atacado Livre</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Idade Mínima</label>
                        <input type="number" value={jobForm.ageRequirement} onChange={e => setJobForm({...jobForm, ageRequirement: e.target.value})} placeholder="Ex: 18" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Salário</label>
                        <input type="text" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="Ex: R$ 1.500,00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Carga Horária</label>
                        <input type="text" value={jobForm.hours} onChange={e => setJobForm({...jobForm, hours: e.target.value})} placeholder="Ex: 44h semanais" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requisitos</label>
                      <textarea value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} placeholder="Liste os requisitos..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-24 resize-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição da Vaga</label>
                      <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Descreva as atividades..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-32 resize-none" />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!jobForm.position || !myShop) return showNotification('Preencha o cargo e certifique-se de ter uma loja.', 'error');
                        try {
                          await addDoc(collection(db, 'jobOpenings'), {
                            ...jobForm,
                            shopId: myShop.id,
                            shopName: myShop.name,
                            ownerUid: user?.uid,
                            state: myShop.state,
                            address: myShop.address,
                            isApproved: false,
                            createdAt: Timestamp.now()
                          });
                          setShowJobModal(false);
                          setJobForm({ position: '', description: '', requirements: '', salary: '', hours: '', ageRequirement: '', shopType: 'feira' });
                          showNotification('Vaga enviada para aprovação da administração!', 'success');
                        } catch (err) {
                          handleFirestoreError(err, OperationType.CREATE, 'jobOpenings');
                        }
                      }}
                      className="w-full py-5 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20"
                    >
                      Solicitar Publicação
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Job Board Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 font-display">Vagas Disponíveis</h3>
              <div className="flex gap-2">
                {['Feira Livre', 'Mercado Livre', 'Barraca Livre', 'Atacado Livre'].map(type => (
                  <span key={type} className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Feirante Column */}
              <div className="space-y-6">
                <h4 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center">
                    <User size={18} />
                  </div>
                  Feirantes & Varejo
                </h4>
                <div className="space-y-4">
                  {jobOpenings.filter(j => j.shopType !== 'atacado').map(job => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-100 flex flex-col group hover:shadow-lg transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                          <Store size={20} />
                        </div>
                        {user?.uid === myShop?.ownerUid && job.shopId === myShop?.id && (
                          <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{job.position}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{job.shopName}</p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <MapPin size={14} className="text-brand-500" /> {job.address}, {job.state}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Clock size={14} className="text-brand-500" /> {job.hours}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <User size={14} className="text-brand-500" /> Idade: {job.ageRequirement}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            if (!user) return showNotification('Faça login para se candidatar.', 'error');
                            setSelectedJobForApply(job);
                            setShowApplyModal(true);
                          }}
                          className="col-span-2 py-3 bg-brand-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} /> Candidatar via Bate-papo
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {jobOpenings.filter(j => j.shopType !== 'atacado').length === 0 && (
                    <p className="text-slate-400 text-xs font-medium text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">Nenhuma vaga para feirantes.</p>
                  )}
                </div>
              </div>

              {/* Atacado Livre Column */}
              <div className="space-y-6">
                <h4 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  Atacado Livre
                </h4>
                <div className="space-y-4">
                  {jobOpenings.filter(j => j.shopType === 'atacado').map(job => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-100 flex flex-col group hover:shadow-lg transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        {user?.uid === myShop?.ownerUid && job.shopId === myShop?.id && (
                          <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{job.position}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{job.shopName}</p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <MapPin size={14} className="text-blue-500" /> {job.address}, {job.state}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Clock size={14} className="text-blue-500" /> {job.hours}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <User size={14} className="text-blue-500" /> Idade: {job.ageRequirement}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={async () => {
                            if (!user) return showNotification('Faça login para se candidatar.', 'error');
                            try {
                              await addDoc(collection(db, 'chatMessages'), {
                                senderUid: user.uid,
                                receiverUid: job.ownerUid,
                                text: `Olá! Tenho interesse na vaga de ${job.position} na loja ${job.shopName}.`,
                                createdAt: Timestamp.now()
                              });
                              showNotification('Mensagem enviada para a loja!', 'success');
                              onNavigate('chats');
                            } catch (err) {
                              showNotification('Erro ao iniciar conversa.', 'error');
                            }
                          }}
                          className="flex-1 py-3 bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-blue-50 transition-all border border-slate-100 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} /> Bate-papo
                        </button>
                        <button 
                          onClick={() => {
                            if (!user) return showNotification('Faça login para se candidatar.', 'error');
                            setSelectedJobForApply(job);
                            setShowApplyModal(true);
                          }}
                          className="flex-1 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                          <FileText size={14} /> Candidatar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {jobOpenings.filter(j => j.shopType === 'atacado').length === 0 && (
                    <p className="text-slate-400 text-xs font-medium text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">Nenhuma vaga para atacado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Modal de Candidatura Específica */}
      <AnimatePresence>
        {showApplyModal && selectedJobForApply && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Candidatar-se</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{selectedJobForApply.position} • {selectedJobForApply.shopName}</p>
                </div>
                <button onClick={() => {
                  setShowApplyModal(false);
                  setSelectedJobForApply(null);
                }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Idade</label>
                  <input 
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Currículo / Mensagem</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva aqui suas experiências e qualificações..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-48 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-5 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Candidatura via Chat'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminNavItem = ({ 
  id, 
  icon: Icon, 
  label, 
  activeTab, 
  setActiveTab 
}: { 
  id: any, 
  icon: any, 
  label: string, 
  activeTab: string, 
  setActiveTab: (id: any) => void 
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={cn(
      "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap",
      activeTab === id 
        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" 
        : "text-slate-500 hover:bg-slate-100"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const AdminDashboard = ({ 
  user, 
  showNotification, 
  showConfirm,
  onNavigate,
  setSelectedShop
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  onNavigate: (screen: Screen) => void,
  setSelectedShop: (shop: Shop | null) => void
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'shops' | 'messages' | 'notifications' | 'admins' | 'job-openings' | 'users'>('overview');
  const [shops, setShops] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<UserProfile[]>([]);
  const [approvedAdmins, setApprovedAdmins] = useState<UserProfile[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<UserProfile | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [quickMessages, setQuickMessages] = useState<any[]>([]);
  const [jobOpenings, setJobOpenings] = useState<any[]>([]);
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean, targetUser: UserProfile | null, text: string }>({ isOpen: false, targetUser: null, text: '' });
  
  // Search and Filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Form states for new features
  const [newNotif, setNewNotif] = useState({ title: '', body: '', type: 'info', scheduledFor: '', target: 'all' });
  const [newQuickMsg, setNewQuickMsg] = useState({ title: '', content: '', target: 'all' });

  useEffect(() => {
    if (!user) return;
    const isAdminUser = (user.role === 'admin' || user.role === 'state_admin') && 
                        (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com'].includes(user.email));
    
    if (!isAdminUser) return;

    const configUnsubscribe = onSnapshot(doc(db, 'appConfig', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setAppConfig(snapshot.data() as AppConfig);
      } else {
        setAppConfig({
          id: 'global',
          splashScreen: {
            logoUrl: '',
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
            message: 'A caminho de você'
          },
          pages: {
            landing: { columns: 1, visible: true, title: 'Início', objective: 'Página inicial com destaques e categorias principais.' },
            search: { columns: 2, visible: true, title: 'Mercado', objective: 'Exploração de produtos e lojas disponíveis.' },
            wholesale: { columns: 2, visible: true, title: 'Atacado', objective: 'Vendas em grandes quantidades para empresas.' },
            calculator: { columns: 1, visible: true, title: 'Calculadora', objective: 'Ferramenta de cálculo de preços e lucros.' },
            contact: { columns: 1, visible: true, title: 'Contato', objective: 'Canal de comunicação direta com o suporte.' },
            profile: { columns: 1, visible: true, title: 'Perfil', objective: 'Gestão de dados do usuário e histórico.' },
            sales: { columns: 1, visible: true, title: 'Vendas', objective: 'Painel de vendas para produtores e lojistas.' },
            createShop: { columns: 1, visible: true, title: 'Criar Loja', objective: 'Processo de abertura de nova banca ou loja.' },
            privacy: { columns: 1, visible: true, title: 'Privacidade', objective: 'Informações sobre proteção de dados.' },
            terms: { columns: 1, visible: true, title: 'Termos', objective: 'Regras e condições de uso da plataforma.' },
            careers: { columns: 1, visible: true, title: 'Trabalhe conosco', objective: 'Oportunidades de trabalho e envio de currículos.' },
            'sales-tips': { columns: 1, visible: false, title: 'Dicas de Vendas', objective: 'Guia de sucesso para novos vendedores.' }
          }
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'appConfig/global'));

    const shopsUnsubscribe = onSnapshot(collection(db, 'shops'), (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));

    const messagesUnsubscribe = onSnapshot(collection(db, 'contactMessages'), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contactMessages'));

    const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setAllOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    const notifUnsubscribe = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));

    const quickMsgUnsubscribe = onSnapshot(collection(db, 'quickMessages'), (snapshot) => {
      setQuickMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'quickMessages'));

    const jobsUnsubscribe = onSnapshot(query(collection(db, 'jobOpenings'), orderBy('createdAt', 'desc')), (snapshot) => {
      setJobOpenings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'jobOpenings'));

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const pendingQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'state_admin']), where('isApprovedAdmin', '==', false));
    const pendingUnsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setPendingAdmins(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const approvedQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'state_admin']), where('isApprovedAdmin', '==', true));
    const approvedUnsubscribe = onSnapshot(approvedQuery, (snapshot) => {
      setApprovedAdmins(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => {
      configUnsubscribe();
      shopsUnsubscribe();
      messagesUnsubscribe();
      ordersUnsubscribe();
      notifUnsubscribe();
      quickMsgUnsubscribe();
      jobsUnsubscribe();
      usersUnsubscribe();
      pendingUnsubscribe();
      approvedUnsubscribe();
    };
  }, [user]);

  const saveConfig = async () => {
    try {
      await setDoc(doc(db, 'appConfig', 'global'), appConfig);
      showNotification('Configurações salvas!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'appConfig/global');
    }
  };

  const approveAdmin = async (adminUid: string) => {
    try {
      await updateDoc(doc(db, 'users', adminUid), { isApprovedAdmin: true });
      showNotification('Administrador aprovado com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${adminUid}`);
    }
  };

  const deleteAdmin = async (adminUid: string) => {
    if (adminUid === user?.uid) return showNotification('Você não pode excluir a si mesmo.', 'error');
    
    showConfirm(
      'Excluir Administrador',
      'Tem certeza que deseja remover este administrador? Esta ação não pode ser desfeita.',
      async () => {
        try {
          await deleteDoc(doc(db, 'users', adminUid));
          showNotification('Administrador excluído.');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${adminUid}`);
        }
      }
    );
  };

  const saveAdminProfile = async () => {
    if (!editingAdmin) return;
    try {
      await updateDoc(doc(db, 'users', editingAdmin.uid), editingAdmin as any);
      setEditingAdmin(null);
      showNotification('Perfil do administrador atualizado!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingAdmin.uid}`);
    }
  };

  const togglePromotion = async (shopId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'shops', shopId), { isPromoted: !currentStatus });
      showNotification(`Loja ${!currentStatus ? 'promovida' : 'despromovida'} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${shopId}`);
    }
  };

  const toggleApproval = async (shopId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'shops', shopId), { isApproved: !currentStatus });
      showNotification(`Loja ${!currentStatus ? 'aprovada' : 'reprovada'} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${shopId}`);
    }
  };

  const deleteShop = async (shopId: string) => {
    showConfirm(
      'Excluir Loja',
      'Deseja realmente excluir esta loja? Todos os dados vinculados serão perdidos.',
      async () => {
        try {
          await deleteDoc(doc(db, 'shops', shopId));
          showNotification('Loja excluída com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `shops/${shopId}`);
        }
      }
    );
  };

  const sendNotification = async () => {
    if (!newNotif.title || !newNotif.body) return showNotification('Preencha todos os campos', 'error');
    
    // Validação de data retroativa para agendamento
    if (newNotif.scheduledFor) {
      const scheduledDate = new Date(newNotif.scheduledFor);
      if (scheduledDate <= new Date()) {
        return showNotification('A data de agendamento deve ser no futuro.', 'error');
      }
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotif,
        createdAt: Timestamp.now(),
        scheduledFor: newNotif.scheduledFor ? Timestamp.fromDate(new Date(newNotif.scheduledFor)) : null,
        authorId: user?.uid,
        status: newNotif.scheduledFor ? 'scheduled' : 'sent'
      });
      setNewNotif({ title: '', body: '', type: 'info', scheduledFor: '', target: 'all' });
      showNotification(newNotif.scheduledFor ? 'Notificação agendada com sucesso!' : 'Notificação enviada com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'notifications');
    }
  };

  const addQuickMessage = async () => {
    if (!newQuickMsg.title || !newQuickMsg.content) return showNotification('Preencha todos os campos', 'error');
    try {
      await addDoc(collection(db, 'quickMessages'), {
        title: newQuickMsg.title,
        content: newQuickMsg.content,
        target: newQuickMsg.target,
        createdAt: Timestamp.now()
      });
      setNewQuickMsg({ title: '', content: '', target: 'all' });
      showNotification('Mensagem rápida adicionada!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'quickMessages');
    }
  };

  const sendBulkMessage = async (msg: any) => {
    const targetRole = msg.target || 'all';
    
    showConfirm(
      'Enviar Mensagem em Massa',
      `Deseja enviar esta mensagem para ${targetRole === 'all' ? 'TODOS os usuários' : `todos os ${translateRole(targetRole)}s`}?`,
      async () => {
        try {
          // Filtrar usuários alvo
          const targets = allUsers.filter(u => targetRole === 'all' || u.role === targetRole);
          
          if (targets.length === 0) {
            return showNotification('Nenhum usuário encontrado para este perfil.', 'error');
          }

          showNotification(`Iniciando envio para ${targets.length} usuários...`);

          // Enviar mensagens (em lotes para não sobrecarregar)
          const batchSize = 10;
          for (let i = 0; i < targets.length; i += batchSize) {
            const batch = targets.slice(i, i + batchSize);
            await Promise.all(batch.map(targetUser => 
              addDoc(collection(db, 'chatMessages'), {
                senderUid: user?.uid,
                receiverUid: targetUser.uid,
                text: `*${msg.title}*\n\n${msg.content}`,
                createdAt: Timestamp.now(),
                isBulk: true,
                bulkTitle: msg.title
              })
            ));
          }

          showNotification('Mensagens enviadas com sucesso para o Bate-papo!');
        } catch (err) {
          console.error("Erro no envio em massa:", err);
          showNotification('Erro ao enviar mensagens em massa.', 'error');
        }
      }
    );
  };

  const deleteQuickMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quickMessages', id));
      showNotification('Mensagem rápida removida');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quickMessages/${id}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.uid) return showNotification('Você não pode excluir a si mesmo.', 'error');
    
    showConfirm(
      'Excluir Usuário',
      'Tem certeza que deseja excluir este usuário? Todos os dados vinculados serão perdidos.',
      async () => {
        try {
          await deleteDoc(doc(db, 'users', userId));
          showNotification('Usuário excluído com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
        }
      }
    );
  };

  const sendMessageToUser = async () => {
    if (!messageModal.targetUser || !messageModal.text.trim()) return;
    
    try {
      await addDoc(collection(db, 'chatMessages'), {
        senderUid: user?.uid,
        receiverUid: messageModal.targetUser.uid,
        text: messageModal.text,
        createdAt: Timestamp.now()
      });
      showNotification(`Mensagem enviada para ${messageModal.targetUser.displayName}!`);
      setMessageModal({ isOpen: false, targetUser: null, text: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chatMessages');
    }
  };

  const toggleJobApproval = async (jobId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'jobOpenings', jobId), { isApproved: !currentStatus });
      showNotification(`Vaga ${!currentStatus ? 'aprovada' : 'reprovada'} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `jobOpenings/${jobId}`);
    }
  };

  const deleteJobOpening = async (jobId: string) => {
    showConfirm(
      'Excluir Vaga',
      'Deseja realmente excluir esta vaga permanentemente?',
      async () => {
        try {
          await deleteDoc(doc(db, 'jobOpenings', jobId));
          showNotification('Vaga excluída com sucesso!');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `jobOpenings/${jobId}`);
        }
      }
    );
  };

  const totalSales = allOrders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.totalValue || 0), 0);

  // Mock data for the chart based on actual orders if possible, or just a nice trend
  const chartData = [
    { name: 'Seg', value: totalSales * 0.1 },
    { name: 'Ter', value: totalSales * 0.15 },
    { name: 'Qua', value: totalSales * 0.12 },
    { name: 'Qui', value: totalSales * 0.2 },
    { name: 'Sex', value: totalSales * 0.18 },
    { name: 'Sáb', value: totalSales * 0.25 },
    { name: 'Dom', value: totalSales * 0.3 },
  ];


  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-brand-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-brand-100">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Painel Admin</h2>
            <p className="text-slate-500 font-medium">Gestão avançada da plataforma</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-soft border border-slate-100 overflow-x-auto">
          <AdminNavItem id="overview" icon={LayoutGrid} label="Geral" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="orders" icon={Package} label="Pedidos" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="shops" icon={Store} label="Lojas" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="users" icon={User} label="Usuários" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="admins" icon={ShieldCheck} label="Admins" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="messages" icon={MessageSquare} label="Mensagens" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="notifications" icon={Bell} label="Notificações" activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminNavItem id="job-openings" icon={Briefcase} label="Vagas" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-3 bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <TrendingUp size={28} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Total</p>
                      <h4 className="text-4xl font-black text-slate-900 font-display">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales)}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="mt-4 min-h-[160px] h-[160px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160} debounce={50}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                        labelStyle={{ fontWeight: '900', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                        itemStyle={{ fontWeight: '900', color: '#0f172a', fontSize: '14px' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between group">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos</p>
                    <h4 className="text-3xl font-black text-slate-900 font-display">{allOrders.length}</h4>
                    <div className="mt-2 flex items-center gap-2 text-emerald-600 text-[10px] font-bold">
                      <span>+12% este mês</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between group">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Store size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lojas</p>
                    <h4 className="text-3xl font-black text-slate-900 font-display">{shops.length}</h4>
                    <div className="mt-2 flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                      <span>Ativas</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between group">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensagens</p>
                    <h4 className="text-3xl font-black text-slate-900 font-display">{messages.length}</h4>
                    <div className="mt-2 flex items-center gap-2 text-purple-600 text-[10px] font-bold">
                      <span>Novos contatos</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between group">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vagas</p>
                    <h4 className="text-3xl font-black text-slate-900 font-display">{jobOpenings.length}</h4>
                    <div className="mt-2 flex items-center gap-2 text-amber-600 text-[10px] font-bold">
                      <span>{jobOpenings.filter(j => !j.isApproved).length} pendentes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 flex flex-col justify-between group">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admins</p>
                    <h4 className="text-3xl font-black text-slate-900 font-display">{approvedAdmins.length}</h4>
                    {pendingAdmins.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-amber-600 text-[10px] font-bold">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <span>{pendingAdmins.length} pendentes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Clock className="text-brand-500" /> Atividade Recente
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Ver todos</button>
                </div>
                <div className="space-y-4">
                  {allOrders.slice(0, 6).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[24px] hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Package size={24} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.shopName} • {translateStatus(order.status)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">R$ {(order.totalValue || order.total || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{order.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {allOrders.length === 0 && <p className="text-center py-12 text-slate-400 font-medium">Nenhum pedido registrado.</p>}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                  <h3 className="text-xl font-black mb-6 relative z-10">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <button onClick={() => setActiveTab('notifications')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex flex-col items-center gap-3 transition-all">
                      <BellRing size={20} className="text-brand-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Notificar</span>
                    </button>
                    <button onClick={() => setActiveTab('admins')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex flex-col items-center gap-3 transition-all">
                      <UserPlus size={20} className="text-brand-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Admins</span>
                    </button>
                    <button onClick={() => setActiveTab('shops')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex flex-col items-center gap-3 transition-all">
                      <Store size={20} className="text-brand-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Lojas</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Mail className="text-purple-500" /> Mensagens Recentes
                  </h3>
                  <div className="space-y-4">
                    {messages.slice(0, 4).map(msg => (
                      <div key={msg.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => setActiveTab('messages')}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm">
                            <User size={14} />
                          </div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest truncate">{msg.firstName} {msg.lastName}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-center py-4 text-slate-400 font-medium">Nenhuma mensagem.</p>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'orders' ? (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Gestão de Pedidos</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Acompanhamento em tempo real</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar pedido..." 
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 w-64"
                  />
                </div>
                <select 
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Todos Status</option>
                  <option value="pending">Pendente</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loja Origem</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allOrders
                    .filter(order => {
                      const matchesSearch = 
                        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.buyerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.shopName?.toLowerCase().includes(orderSearch.toLowerCase());
                      const matchesFilter = orderStatusFilter === 'all' || order.status === orderStatusFilter;
                      return matchesSearch && matchesFilter;
                    })
                    .map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 px-3 py-1 rounded-xl font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.id);
                              showNotification('ID do pedido copiado!');
                            }}
                            className="p-1.5 text-slate-300 hover:text-brand-500 transition-colors"
                            title="Copiar ID completo"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">
                            {order.buyerName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{order.buyerName || 'Usuário'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{order.buyerPhone || 'Sem telefone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-slate-300" />
                          <p className="font-bold text-slate-700 text-sm">{order.shopName}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue || 0)}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border",
                          order.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            order.status === 'completed' ? "bg-emerald-500" :
                            order.status === 'cancelled' ? "bg-red-500" :
                            "bg-amber-500"
                          )} />
                          {order.status === 'pending_payment' ? 'Pagamento Pendente' : 
                           order.status === 'accepted' ? 'Aceito' :
                           order.status === 'completed' ? 'Concluído' :
                           order.status === 'cancelled' ? 'Cancelado' : order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-transparent hover:border-brand-100">
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              showConfirm(
                                'Excluir Pedido',
                                'Tem certeza que deseja excluir este pedido? Esta ação removerá o pedido dos cálculos de faturamento.',
                                async () => {
                                  try {
                                    await deleteDoc(doc(db, 'orders', order.id));
                                    showNotification('Pedido excluído com sucesso!');
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `orders/${order.id}`);
                                  }
                                }
                              );
                            }}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allOrders.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum pedido encontrado no sistema.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'shops' ? (
          <motion.div 
            key="shops"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 ml-2">Gerenciamento de Lojas</h3>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar loja por nome ou categoria..." 
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 w-80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shops
                .filter(shop => 
                  shop.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
                  (shop.category || '').toLowerCase().includes(shopSearch.toLowerCase())
                )
                .map(shop => (
                  <div key={shop.id} className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden group hover:border-brand-200 transition-all flex flex-col">
                    <div className="h-40 bg-slate-100 relative">
                      <img src={shop.photoURL || `https://picsum.photos/seed/${shop.id}/600/400`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md",
                          shop.isApproved ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        )}>
                          {shop.isApproved ? 'Aprovada' : 'Pendente'}
                        </span>
                      </div>
                      <div className="absolute -bottom-8 left-8">
                        <div className="w-20 h-20 rounded-[24px] border-4 border-white shadow-2xl overflow-hidden bg-white">
                          <img src={shop.photoURL || `https://picsum.photos/seed/logo-${shop.id}/200`} className="w-full h-full object-cover" alt={shop.name} referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 pt-12 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none mb-2 flex items-center gap-2">
                            {shop.name}
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(shop.id);
                                showNotification('ID da loja copiado!');
                              }}
                              className="p-1 text-slate-300 hover:text-brand-500 transition-colors"
                              title="Copiar ID da loja"
                            >
                              <Copy size={12} />
                            </button>
                          </h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                            <Tag size={12} className="text-brand-500" /> {shop.type || 'Loja'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <MapPin size={16} className="text-slate-300" />
                          <span className="line-clamp-1">{shop.state}. {shop.city}. Brasil. {shop.address || 'Endereço não informado'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <User size={16} className="text-slate-300" />
                            <span className="line-clamp-1">Proprietário: {allUsers.find(u => u.uid === shop.ownerUid)?.displayName || 'Não identificado'}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const owner = allUsers.find(u => u.uid === shop.ownerUid);
                              if (owner) setMessageModal({ isOpen: true, targetUser: owner, text: '' });
                            }}
                            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                            title="Contatar Proprietário"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-6 border-t border-slate-50">
                        <button 
                          onClick={() => {
                            setSelectedShop(shop);
                            onNavigate('shop-detail');
                          }}
                          className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                          <Eye size={16} /> Ver Loja
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleApproval(shop.id, shop.isApproved || false)}
                            className={cn(
                              "p-3.5 rounded-2xl transition-all border",
                              shop.isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-emerald-50 hover:text-emerald-500"
                            )}
                            title={shop.isApproved ? "Revogar Aprovação" : "Aprovar Loja"}
                          >
                            {shop.isApproved ? <CheckCircle size={18} /> : <Zap size={18} />}
                          </button>
                          <button 
                            onClick={() => togglePromotion(shop.id, shop.isPromoted || false)}
                            className={cn(
                              "p-3.5 rounded-2xl transition-all border",
                              shop.isPromoted ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-amber-50 hover:text-amber-500"
                            )}
                            title={shop.isPromoted ? "Destaque" : "Destacar Loja"}
                          >
                            <Star size={18} fill={shop.isPromoted ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => deleteShop(shop.id)}
                            className="p-3.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white border border-red-100 rounded-2xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
        </motion.div>
        ) : activeTab === 'messages' ? (
          <motion.div 
            key="messages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-black">Mensagens de Contato</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {messages.map(msg => (
                <div key={msg.id} className="p-8 hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-xl">
                        {msg.firstName?.[0]}{msg.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{msg.firstName} {msg.lastName}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{msg.email} • {msg.state}</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await deleteDoc(doc(db, 'contactMessages', msg.id));
                          showNotification('Mensagem removida');
                        } catch (err) {
                          handleFirestoreError(err, OperationType.DELETE, `contactMessages/${msg.id}`);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-slate-600 font-medium leading-relaxed">{msg.text}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{msg.gender === 'M' ? 'Masculino' : msg.gender === 'F' ? 'Feminino' : 'Outro'}</span>
                    <span>•</span>
                    <span>{msg.createdAt?.toDate().toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="p-20 text-center text-slate-400 font-medium">Nenhuma mensagem recebida.</div>}
            </div>
          </motion.div>
        ) : activeTab === 'job-openings' ? (
          <motion.div 
            key="job-openings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Gerenciamento de Vagas</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Aprovação e moderação de anúncios</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {jobOpenings.filter(j => !j.isApproved).length} Pendentes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobOpenings.map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-[32px] shadow-soft border border-slate-100 flex flex-col group hover:border-brand-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 text-brand-600 rounded-xl flex items-center justify-center font-black">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 leading-tight">{job.position}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{job.shopName}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        job.isApproved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      )} />
                    </div>

                    <div className="flex-1 space-y-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{job.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Salário</p>
                          <p className="text-[10px] font-black text-slate-900">{job.salary}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Carga</p>
                          <p className="text-[10px] font-black text-slate-900">{job.hours}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setMessageModal({
                            isOpen: true,
                            targetUser: allUsers.find(u => u.uid === job.ownerUid) || null,
                            text: `Olá! Gostaria de conversar sobre a vaga de ${job.position} que você cadastrou.`
                          });
                        }}
                        className="p-3 bg-slate-50 text-brand-600 rounded-xl hover:bg-brand-50 transition-all"
                        title="Conversar com o lojista"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button 
                        onClick={() => toggleJobApproval(job.id, job.isApproved || false)}
                        className={cn(
                          "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                          job.isApproved 
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        )}
                      >
                        {job.isApproved ? 'Revogar' : 'Aprovar'}
                      </button>
                      <button 
                        onClick={() => deleteJobOpening(job.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {jobOpenings.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-300">
                    <Briefcase size={64} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Nenhuma vaga cadastrada no sistema.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'notifications' ? (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <BellRing className="text-brand-500" /> Nova Notificação Global
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título</label>
                      <input 
                        type="text"
                        value={newNotif.title}
                        onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                        placeholder="Ex: Promoção de Verão!"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Público-Alvo</label>
                      <select 
                        value={newNotif.target}
                        onChange={(e) => setNewNotif({ ...newNotif, target: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium appearance-none"
                      >
                        <option value="all">Todos os Usuários</option>
                        <option value="client">Apenas Clientes</option>
                        <option value="vendor">Apenas Vendedores</option>
                        <option value="wholesale">Apenas Atacadistas</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Alerta</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'info', label: 'Informativo' },
                          { id: 'success', label: 'Sucesso' },
                          { id: 'warning', label: 'Alerta' }
                        ].map(type => (
                          <button
                            key={type.id}
                            onClick={() => setNewNotif({ ...newNotif, type: type.id })}
                            className={cn(
                              "py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all",
                              newNotif.type === type.id 
                                ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-brand-200"
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem</label>
                      <textarea 
                        value={newNotif.body}
                        onChange={(e) => setNewNotif({ ...newNotif, body: e.target.value })}
                        placeholder="Descreva o conteúdo da notificação..."
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agendar para (Opcional)</label>
                      <input 
                        type="datetime-local"
                        value={newNotif.scheduledFor}
                        onChange={(e) => setNewNotif({ ...newNotif, scheduledFor: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      />
                    </div>
                    <button 
                      onClick={sendNotification}
                      className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-3"
                    >
                      <Send size={20} />
                      {newNotif.scheduledFor ? 'Agendar Notificação' : 'Disparar Agora'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <History className="text-slate-400" /> Histórico de Envios
                </h3>
                <div className="space-y-4">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start justify-between group">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                          notif.type === 'warning' ? "bg-amber-100 text-amber-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <Bell size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-900 text-sm">{notif.title}</h4>
                            {notif.status === 'scheduled' && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">Agendado</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-medium">{notif.body}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {notif.createdAt?.toDate().toLocaleString('pt-BR')}
                            </p>
                            {notif.target && (
                              <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest">
                                Para: {notif.target === 'all' ? 'Todos' : notif.target}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            await deleteDoc(doc(db, 'notifications', notif.id));
                            showNotification('Notificação removida');
                          } catch (err) {
                            handleFirestoreError(err, OperationType.DELETE, `notifications/${notif.id}`);
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center py-12 text-slate-400 font-medium">Nenhuma notificação enviada.</p>}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <Zap className="text-amber-500" /> Biblioteca de Respostas
                </h3>
                <div className="space-y-6 mb-8">
                  <div className="space-y-4">
                    <input 
                      type="text"
                      value={newQuickMsg.title}
                      onChange={(e) => setNewQuickMsg({ ...newQuickMsg, title: e.target.value })}
                      placeholder="Título do atalho"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    />
                    <textarea 
                      value={newQuickMsg.content}
                      onChange={(e) => setNewQuickMsg({ ...newQuickMsg, content: e.target.value })}
                      placeholder="Conteúdo da mensagem..."
                      rows={3}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium resize-none"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Alvo Padrão</label>
                      <select 
                        value={newQuickMsg.target}
                        onChange={(e) => setNewQuickMsg({ ...newQuickMsg, target: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
                      >
                        <option value="all">Todos os Perfis</option>
                        <option value="client">Clientes (Feira Livre)</option>
                        <option value="vendor">Vendedores (Barraca Livre)</option>
                        <option value="admin">Administradores (Mercado Livre)</option>
                        <option value="wholesale">Atacadistas (Atacado Livre)</option>
                      </select>
                    </div>
                    <button 
                      onClick={addQuickMessage}
                      className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {quickMessages.map(msg => (
                    <div key={msg.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex justify-between items-start group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                      <div className="flex-1 cursor-pointer" onClick={async () => {
                        try {
                          const fullText = `*${msg.title}*\n\n${msg.content}`;
                          await navigator.clipboard.writeText(fullText);
                          setNewNotif({ ...newNotif, title: msg.title, body: msg.content });
                          showNotification('Título e conteúdo copiados!');
                        } catch (err) {
                          setNewNotif({ ...newNotif, title: msg.title, body: msg.content });
                          showNotification('Texto copiado para o formulário!');
                        }
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap size={16} />
                          </div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            {msg.title}
                            <Copy size={12} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                          </p>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{msg.content}</p>
                        {msg.target && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                              Alvo: {msg.target === 'all' ? 'Todos' : translateRole(msg.target)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            sendBulkMessage(msg);
                          }}
                          className="p-3 bg-brand-600 text-white hover:bg-brand-700 rounded-2xl transition-all shadow-lg shadow-brand-500/20 active:scale-90"
                          title="Enviar para todos deste perfil"
                        >
                          <Send size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuickMessage(msg.id);
                          }}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'users' ? (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">Controle de Usuários</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gerencie perfis e permissões</p>
                </div>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar usuários..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 w-64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers
                  .filter(u => 
                    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map(u => (
                    <div key={u.uid} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <img src={u.photoURL} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                        <div>
                          <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                            {u.displayName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{translateRole(u.role)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setMessageModal({ isOpen: true, targetUser: u, text: '' })}
                          className="p-2 bg-white text-slate-400 hover:text-brand-600 rounded-xl shadow-sm transition-all hover:scale-110"
                          title="Mandar Mensagem"
                        >
                          <Send size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUser(u.uid)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-all hover:scale-110"
                          title="Excluir Usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {allUsers.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={40} />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum usuário encontrado.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'admins' ? (
          <motion.div 
            key="admins"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {pendingAdmins.length > 0 && (
              <div className="bg-amber-50 rounded-[40px] border border-amber-100 p-8 shadow-xl shadow-amber-900/5">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-amber-900 font-display">
                  <UserPlus size={24} /> Solicitações Pendentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingAdmins.map(admin => (
                    <div key={admin.uid} className="bg-white p-6 rounded-[32px] shadow-sm border border-amber-100 flex flex-col items-center text-center">
                      <img src={admin.photoURL} className="w-20 h-20 rounded-full border-4 border-amber-100 mb-4" alt="" />
                      <h4 className="font-black text-slate-900">{admin.displayName}</h4>
                      <p className="text-xs text-slate-400 font-bold mb-6">{admin.email}</p>
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => approveAdmin(admin.uid)}
                          className="flex-1 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-700 transition-all"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => deleteAdmin(admin.uid)}
                          className="flex-1 py-3 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-200 transition-all"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <ShieldCheck className="text-brand-500" /> Administradores Ativos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedAdmins.map(admin => (
                  <div key={admin.uid} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <img src={admin.photoURL} className="w-12 h-12 rounded-full border-2 border-white" alt="" />
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{admin.displayName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{translateRole(admin.role)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingAdmin(admin)}
                        className="p-2 bg-white text-slate-400 hover:text-brand-600 rounded-xl shadow-sm transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteAdmin(admin.uid)}
                        className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Admin Edit Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setEditingAdmin(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xl font-black font-display">Editar Admin</h3>
              <button onClick={() => setEditingAdmin(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Acesso</label>
                <select 
                  value={editingAdmin.role}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as UserRole })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
                >
                  <option value="admin">Administrador Global</option>
                  <option value="state_admin">Administrador Estadual</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Responsável</label>
                <input 
                  type="text"
                  value={editingAdmin.state || ''}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, state: e.target.value })}
                  placeholder="Ex: SP"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
                />
              </div>
              <button 
                onClick={saveAdminProfile}
                className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
              >
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const VendorManagement = ({ 
  user, 
  showNotification,
  showConfirm,
  config,
  onNavigate,
  setSelectedChat
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void,
  setSelectedChat: (uid: string | null) => void
}) => {
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [shopForm, setShopForm] = useState<Partial<Shop>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'schedule' | 'calculator' | 'settings'>('overview');
  const [showProductCalculator, setShowProductCalculator] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Persistence for product editing draft
  useEffect(() => {
    if (editingProduct && isDraftLoaded) {
      localStorage.setItem('product_draft', JSON.stringify(editingProduct));
    } else if (!editingProduct && isDraftLoaded) {
      localStorage.removeItem('product_draft');
    }
  }, [editingProduct, isDraftLoaded]);

  useEffect(() => {
    const draft = localStorage.getItem('product_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setEditingProduct(parsed);
      } catch (e) {
        console.error("Error loading product draft:", e);
      }
    }
    setIsDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const shopQuery = query(collection(db, 'shops'), where('ownerUid', '==', user.uid));
    const unsubscribeShop = onSnapshot(shopQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop;
        setMyShop(data);
        setShopForm(data);
      }
      setIsLoadingShop(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'shops');
      setIsLoadingShop(false);
    });
    return () => unsubscribeShop();
  }, [user]);

  useEffect(() => {
    if (!myShop) return;
    const productsQuery = query(collection(db, 'shops', myShop.id, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/products`));

    const ordersQuery = query(collection(db, 'orders'), where('shopOwnerUid', '==', user.uid), where('shopId', '==', myShop.id), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [myShop]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      if (!orderData || !myShop) return;

      const oldStatus = orderData.status;

      // Se estiver aceitando o pedido agora (verificação de produtos), descontar do estoque
      if (newStatus === 'accepted' && oldStatus === 'pending') {
        // Verificar estoque antes de aceitar
        for (const item of orderData.items) {
          const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock || 0;
            if (currentStock < item.quantity) {
              showNotification(`Estoque insuficiente para ${item.name}. Temos apenas ${currentStock} disponíveis.`, 'error');
              return;
            }
          }
        }

        // Descontar do estoque
        for (const item of orderData.items) {
          const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            await updateDoc(productRef, {
              stock: Math.max(0, (productSnap.data().stock || 0) - item.quantity)
            });
          }
        }
      }

      // Se o pedido for cancelado e já tinha saído do estoque (estava aceito em diante), devolver
      const deductedStatuses = ['accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready', 'completed'];
      if (newStatus === 'cancelled' && deductedStatuses.includes(oldStatus)) {
        if (orderData.items) {
          for (const item of orderData.items) {
            const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              await updateDoc(productRef, {
                stock: (productSnap.data().stock || 0) + item.quantity
              });
            }
          }
        }
      }

      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      // --- AUTO CHAT MESSAGES ---
      if (newStatus === 'ready' || newStatus === 'cancelled') {
        try {
          let msgText = '';
          if (newStatus === 'ready') {
            msgText = `✅ *Seu pedido #${orderId.slice(-4).toUpperCase()} está PRONTO!*\n\nJá pode passar na loja para retirar ou aguardar a entrega, conforme combinado.\n\n*Forma de Pagamento:* ${orderData.paymentMethod || 'A combinar'}\n*Modo de Recebimento:* ${orderData.deliveryType === 'delivery' ? 'Entrega por Aplicativo' : 'Retirada na Loja/Barraca'}\n\nObrigado por comprar conosco! 🍎`;
          } else if (newStatus === 'cancelled') {
            msgText = `❌ *PEDIDO CANCELADO: #${orderId.slice(-4).toUpperCase()}*\n\nInformamos que seu pedido foi cancelado. Este é um ato de esclarecimento para manter a transparência da nossa negociação.\n\nCaso tenha dúvidas, por favor, envie uma mensagem aqui no chat.`;
          }

          if (msgText) {
            await addDoc(collection(db, 'chatMessages'), {
              senderUid: user.uid, // Vendor
              senderName: myShop.name,
              senderPhotoURL: myShop.photoURL || '',
              receiverUid: orderData.buyerUid,
              text: msgText,
              shopName: myShop.name,
              createdAt: Timestamp.now()
            });
          }
        } catch (msgErr) {
          console.error("Erro ao enviar mensagem automática:", msgErr);
        }
      }
      
      // Se o pedido for concluído, registrar na contabilidade de vendas
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        let totalCost = 0;
        // Calcular custo total baseado nos produtos atuais (aproximação)
        if (orderData.items && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              totalCost += (product.cost || 0) * item.quantity;
            }
          }
        }

        await addDoc(collection(db, 'shops', myShop.id, 'sales'), {
          orderId: orderId,
          buyerUid: orderData.buyerUid,
          shopOwnerUid: myShop.ownerUid,
          totalValue: orderData.totalValue || 0,
          totalCost: totalCost,
          items: orderData.items,
          createdAt: Timestamp.now(),
          month: new Date().getMonth(),
          year: new Date().getFullYear()
        });

        // Atualizar contagem de vendas dos produtos
        for (const item of orderData.items) {
          const productRef = doc(db, 'shops', myShop.id, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            await updateDoc(productRef, {
              salesCount: (productSnap.data().salesCount || 0) + item.quantity
            });
          }
        }
      }

      // Enviar mensagem automática de atualização
      let messageText = '';
      if (newStatus === 'ready') {
        messageText = `Seu pedido #${orderId.slice(-4)} está pronto para ${orderData.deliveryType === 'delivery' ? 'entrega' : 'retirada'}!`;
      } else if (newStatus === 'accepted') {
        messageText = `Seu pedido #${orderId.slice(-4)} foi aceito! Por favor, realize o pagamento para que possamos iniciar a preparação.`;
      } else if (newStatus === 'paid') {
        messageText = `Pagamento do pedido #${orderId.slice(-4)} confirmado! Estamos preparando seus produtos.`;
      } else if (newStatus === 'cancelled') {
        messageText = `O pedido #${orderId.slice(-4)} foi cancelado.`;
      } else if (newStatus === 'completed') {
        messageText = `Seu pedido #${orderId.slice(-4)} foi finalizado com sucesso. Obrigado pela preferência!`;
      }

      if (messageText) {
        await addDoc(collection(db, 'chatMessages'), {
          text: messageText,
          senderUid: user?.uid,
          receiverUid: orderData.buyerUid,
          shopName: orderData.shopName,
          metadata: {
            shopId: orderData.shopId,
            shopOwnerUid: orderData.shopOwnerUid || user?.uid // Fallback to current user if it's the vendor
          },
          createdAt: Timestamp.now()
        });
      }

      showNotification(`Pedido ${translateStatus(newStatus).toLowerCase()} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleSaveShop = async () => {
    if (!myShop) return;
    try {
      await updateDoc(doc(db, 'shops', myShop.id), shopForm);
      setIsEditingShop(false);
      showNotification('Loja atualizada com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${myShop.id}`);
    }
  };

  const handleDeleteShop = async () => {
    if (!myShop) return;
    showConfirm(
      'Excluir Loja',
      'Deseja realmente excluir sua loja? Esta ação é irreversível e todos os seus produtos, vagas e dados de vendas serão perdidos.',
      async () => {
        try {
          await deleteDoc(doc(db, 'shops', myShop.id));
          showNotification('Loja excluída com sucesso.');
          onNavigate('landing');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `shops/${myShop.id}`);
        }
      }
    );
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    showConfirm(
      'Excluir Conta',
      'Deseja realmente excluir sua conta? Todos os seus dados, incluindo lojas e histórico, serão removidos permanentemente.',
      async () => {
        try {
          // If they have a shop, delete it first
          if (myShop) {
            await deleteDoc(doc(db, 'shops', myShop.id));
          }
          await deleteDoc(doc(db, 'users', user.uid));
          await logout();
          showNotification('Conta excluída com sucesso.');
          onNavigate('landing');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`);
        }
      }
    );
  };

  const handleSaveProduct = async () => {
    if (!myShop || !editingProduct) return;
    try {
      // Clean undefined/NaN values and extract ID
      const { id, ...dataToSave } = editingProduct;
      const cleanData = Object.fromEntries(
        Object.entries(dataToSave).filter(([_, v]) => v !== undefined && v !== null && !Number.isNaN(v))
      );

      if (id) {
        await updateDoc(doc(db, 'shops', myShop.id, 'products', id), cleanData);
      } else {
        await addDoc(collection(db, 'shops', myShop.id, 'products'), {
          ...cleanData,
          shopId: myShop.id,
          salesCount: 0,
          addedCount: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: Timestamp.now()
        });
      }
      localStorage.removeItem('product_draft');
      setEditingProduct(null);
      showNotification('Produto salvo com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shops/${myShop.id}/products`);
    }
  };

  if (isLoadingShop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando sua loja...</p>
      </div>
    );
  }

  if (!myShop) return <CreateShopScreen user={user} showNotification={showNotification} config={config} onComplete={() => {}} />;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-brand-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-brand-100 overflow-hidden">
            {myShop.photoURL ? (
              <img src={myShop.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <Truck size={40} />
            )}
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">{myShop.name}</h2>
            <div className="flex flex-col mt-1">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest ml-1">
                <MapPin size={10} className="text-brand-500" /> {myShop.address}. {myShop.city}. {myShop.state}. Brasil.
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {(myShop.type === 'feirante' || myShop.type === 'atacado') && (
            <button 
              onClick={() => onNavigate('sales')}
              className="px-6 py-4 bg-blue-50 text-blue-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <TrendingUp size={18} /> Vendas
            </button>
          )}
          <button 
            onClick={() => onNavigate('careers')}
            className="px-6 py-4 bg-brand-50 text-brand-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-100 transition-all flex items-center gap-2"
          >
            <Briefcase size={18} /> Vagas
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className="px-6 py-4 bg-amber-50 text-amber-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-amber-100 transition-all flex items-center gap-2"
          >
            <Calculator size={18} /> Calculadora
          </button>
          <button 
            onClick={() => onNavigate('vendor-accounting')}
            className="px-6 py-4 bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <BarChart size={18} /> Contabilidade
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'overview', label: 'Visão Geral', icon: LayoutGrid },
          { id: 'products', label: 'Produtos', icon: Package },
          { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
          { id: 'schedule', label: 'Horário', icon: Calendar },
          { id: 'calculator', label: 'Calculadora', icon: Calculator },
          { id: 'settings', label: 'Configurações', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105" 
                : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <TrendingUp size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendas Totais</p>
                  <h4 className="text-3xl font-black text-slate-900">R$ {orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + (o.totalValue || 0), 0).toFixed(2)}</h4>
                  <p className="text-[9px] text-emerald-600 font-bold mt-3 flex items-center gap-1.5 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                    <CheckCircle size={12} /> {orders.filter(o => o.status === 'completed').length} concluídos
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Ativos</p>
                  <h4 className="text-3xl font-black text-slate-900">{orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</h4>
                  <p className="text-[9px] text-blue-600 font-bold mt-3 flex items-center gap-1.5 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                    <Clock size={12} /> {orders.filter(o => o.status === 'accepted' || o.status === 'ready').length} em preparo
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <RefreshCw size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque Recuperado</p>
                  <h4 className="text-3xl font-black text-slate-900">{orders.filter(o => o.status === 'cancelled').length}</h4>
                  <p className="text-[9px] text-red-600 font-bold mt-3 flex items-center gap-1.5 bg-red-50 w-fit px-2 py-1 rounded-lg">
                    <XCircle size={12} /> Pedidos não aceitos
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <DollarSign size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                  <h4 className="text-3xl font-black text-slate-900">
                    R$ {orders.filter(o => o.status === 'completed').reduce((acc, o) => {
                      const orderCost = o.items?.reduce((sum: number, item: any) => {
                        const product = products.find(p => p.id === item.productId);
                        return sum + ((product?.cost || 0) * item.quantity);
                      }, 0) || 0;
                      return acc + ((o.totalValue || 0) - orderCost);
                    }, 0).toFixed(2)}
                  </h4>
                  <p className="text-[9px] text-orange-600 font-bold mt-3 bg-orange-50 w-fit px-2 py-1 rounded-lg">Baseado no custo</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 -z-0" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black font-display text-slate-900">Pedidos Recentes</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Últimas movimentações da loja</p>
                    </div>
                    <button onClick={() => setActiveTab('orders')} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Ver Todos</button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 4).map(order => (
                      <div key={order.id} className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between hover:border-brand-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{order.buyerName || 'Cliente'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt?.toDate()).toLocaleDateString()}</span>
                              <span className="text-slate-200">•</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">R$ {order.totalValue?.toFixed(2)}</p>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md",
                            order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                            order.status === 'cancelled' ? "bg-red-50 text-red-600" :
                            "bg-amber-50 text-amber-600"
                          )}>
                            {translateStatus(order.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag size={40} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium italic">Nenhum pedido recebido ainda</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mb-16 blur-2xl" />
                <h4 className="text-xl font-black font-display mb-8 relative z-10">Ações Rápidas</h4>
                <div className="grid grid-cols-1 gap-4 relative z-10">
                  <button onClick={() => { setEditingProduct({ unit: 'unit', stock: 0, price: 0, cost: 0 }); setActiveTab('products'); }} className="w-full p-5 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-4 transition-all group">
                    <div className="w-10 h-10 bg-brand-500/20 text-brand-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Novo Produto</span>
                  </button>
                  <button onClick={() => setActiveTab('calculator')} className="w-full p-5 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-4 transition-all group">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calculator size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Calculadora</span>
                  </button>
                </div>
              </div>

              {/* Shop Status */}
              <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                <h4 className="text-lg font-black font-display mb-6 text-slate-900">Status da Loja</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visibilidade</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      myShop.isApproved ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {myShop.isApproved ? 'Pública' : 'Em Análise'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destaque</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      myShop.isPromoted ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {myShop.isPromoted ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <button onClick={() => setActiveTab('settings')} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                      <Settings size={16} /> Configurar Loja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'calculator' ? (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden"
          >
            <CalculatorScreen config={config} user={user} />
          </motion.div>
        ) : activeTab === 'products' ? (
          <motion.div 
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 font-display">
                  <Package className="text-brand-500" /> Catálogo de Produtos
                </h3>
                <div className="flex items-center gap-4">
                  {/* Category Filter Menu for Vendor */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-sm">
                    <button
                      onClick={() => setSelectedProductCategory('all')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                        selectedProductCategory === 'all' 
                          ? "bg-slate-900 text-white" 
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      Todos
                    </button>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedProductCategory(cat.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          selectedProductCategory === cat.id 
                            ? "bg-brand-600 text-white" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        <span>{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setEditingProduct({ unit: 'unit', stock: 0, price: 0, cost: 0 })}
                    className="px-6 py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
                  >
                    <Plus size={16} /> Adicionar Produto
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products
                  .filter(p => selectedProductCategory === 'all' || p.category === selectedProductCategory)
                  .map(product => (
                  <div key={product.id} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-500">
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                      <img src={product.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setEditingProduct(product)} className="p-2 bg-white/90 backdrop-blur-md text-slate-600 rounded-lg hover:text-brand-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => {
                          showConfirm(
                            'Excluir Produto',
                            'Deseja realmente excluir este produto?',
                            async () => {
                              try {
                                await deleteDoc(doc(db, 'shops', myShop.id, 'products', product.id!));
                                showNotification('Produto excluído.');
                              } catch (err) {
                                handleFirestoreError(err, OperationType.DELETE, `shops/${myShop.id}/products/${product.id}`);
                              }
                            }
                          );
                        }} className="p-2 bg-white/90 backdrop-blur-md text-slate-600 rounded-lg hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{product.name}</h4>
                    <p className="text-brand-600 font-black text-xl mb-4">R$ {(product.price || 0).toFixed(2)}</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>{product.category || 'Sem Categoria'}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{translateUnit(product.unit)}</span>
                        </div>
                        {(product.weightPerUnit || 0) > 0 && (
                          <div className="flex items-center gap-1.5 text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg w-fit">
                            <Scale size={10} />
                            <span>{product.weightPerUnit}{product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : ''}/{product.unit === 'unit' ? 'un' : product.unit === 'box' ? 'cx' : product.unit === 'bag' ? 'sc' : 'medida'}</span>
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        (product.stock || 0) <= 5 ? "text-red-500 flex items-center gap-1" : "text-slate-400"
                      )}>
                        {(product.stock || 0) <= 0 ? "Acabou" : `${product.stock} em estoque`} {(product.stock || 0) <= 5 && <AlertTriangle size={12} />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'orders' ? (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 font-display">
                    <ShoppingBag className="text-emerald-500" /> Gestão de Pedidos
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gerencie e processe suas vendas</p>
                </div>
                
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                  {['all', 'pending_payment', 'accepted', 'paid', 'ready', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        orderStatusFilter === status 
                          ? "bg-white text-brand-600 shadow-sm border border-slate-100" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {status === 'all' ? 'Todos' : translateStatus(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {orders
                  .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                  .map(order => (
                  <div key={order.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-brand-100 transition-all group">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <User size={32} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-slate-900 text-xl">{order.buyerName}</h4>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-sm",
                              order.status === 'completed' ? "bg-emerald-500 text-white" :
                              order.status === 'cancelled' ? "bg-red-500 text-white" :
                              order.status === 'accepted' ? "bg-blue-500 text-white" :
                              "bg-amber-500 text-white"
                            )}>
                              {translateStatus(order.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                              <Clock size={12} /> {order.createdAt?.toDate().toLocaleString()}
                            </p>
                            <span className="text-slate-200">•</span>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'accepted')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} /> Recebido
                            </button>
                          )}
                          {order.status === 'accepted' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'pending_payment')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} /> Pedido Aceito
                            </button>
                          )}
                          {order.status === 'pending_payment' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'paid')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                            >
                              <Clock size={18} /> Aguardando Pagamento
                            </button>
                          )}
                          {order.status === 'paid' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'preparing')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                              <CreditCard size={18} /> Pagamento Aceito
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, order.deliveryType === 'delivery' ? 'shipped' : 'ready')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                            >
                              {order.deliveryType === 'delivery' ? (
                                <><Truck size={18} /> Entrega</>
                              ) : (
                                <><Package size={18} /> Retirada</>
                              )}
                            </button>
                          )}
                          {(order.status === 'ready' || order.status === 'shipped') && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'completed')} 
                              className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                            >
                              <Package size={18} /> Pedido Concluído
                            </button>
                          )}
                        
                        <div className="flex gap-2 w-full lg:w-auto">
                          <button 
                            onClick={() => {
                              setSelectedChat(order.buyerUid);
                              onNavigate('chats');
                            }}
                            className="flex-1 lg:w-14 h-14 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                            title="Conversar no Bate-papo"
                          >
                            <MessageSquare size={20} />
                          </button>
                          
                          {order.buyerPhone && (
                            <a 
                              href={`https://wa.me/55${order.buyerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 lg:w-14 h-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center justify-center shadow-sm"
                              title="WhatsApp"
                            >
                              <Phone size={20} />
                            </a>
                          )}

                          <button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                            className="flex-1 lg:w-14 h-14 bg-white border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                            title="Cancelar Pedido"
                          >
                            <X size={20} />
                          </button>
                          
                          <button 
                            onClick={() => {
                              showConfirm(
                                'Excluir Pedido',
                                'Deseja realmente excluir este pedido permanentemente?',
                                async () => {
                                  try {
                                    await deleteDoc(doc(db, 'orders', order.id));
                                    showNotification('Pedido excluído com sucesso.');
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `orders/${order.id}`);
                                  }
                                }
                              );
                            }}
                            className="flex-1 lg:w-14 h-14 bg-white border border-red-50 text-red-400 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                            title="Excluir do Histórico"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Package size={14} className="text-brand-500" /> Itens do Pedido
                        </h5>
                        <div className="space-y-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-black text-brand-600 border border-slate-100">{item.quantity}x</span>
                                <span className="text-slate-600 font-bold">{item.name}</span>
                              </div>
                              <span className="font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Total do Pedido</span>
                            <span className="text-2xl font-black text-brand-600 font-display">R$ {order.totalValue?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <MapPin size={14} className="text-brand-500" /> Informações de Entrega
                        </h5>
                        <div className="space-y-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {order.deliveryAddress || 'Retirada na Loja'}
                              </p>
                              {order.deliveryType === 'delivery' && (order.buyerCity || order.buyerState) && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                  {order.buyerState}. {order.buyerCity}. Brasil.
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                              <p className="text-sm font-bold text-slate-700">{order.buyerPhone || 'Não informado'}</p>
                            </div>
                          </div>
                          {order.deliveryType && (
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Truck size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo</p>
                                <p className="text-sm font-bold text-slate-700 uppercase">{order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter).length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                      <ShoppingBag size={32} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Nenhum pedido nesta categoria</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'schedule' ? (
          <motion.div 
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 font-display">
                <Calendar className="text-brand-500" /> Horário e Funcionamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Status Atual</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sua loja está aberta para novos pedidos?</p>
                      </div>
                      <button 
                        onClick={() => setShopForm({...shopForm, isOpen: !shopForm.isOpen})}
                        className={cn(
                          "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                          shopForm.isOpen 
                            ? "bg-emerald-600 text-white shadow-emerald-500/20" 
                            : "bg-red-600 text-white shadow-red-500/20"
                        )}
                      >
                        {shopForm.isOpen ? 'Sim, Aberta' : 'Não, Fechada'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Calendário de Funcionamento</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                        <button
                          key={day}
                          onClick={() => {
                            const current = shopForm.workingDays || [];
                            const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                            setShopForm({...shopForm, workingDays: next});
                          }}
                          className={cn(
                            "py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border",
                            shopForm.workingDays?.includes(day) 
                              ? "bg-slate-900 text-white border-slate-900" 
                              : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horário de Abertura</label>
                      <input 
                        type="time" 
                        value={shopForm.openingHours || '08:00'} 
                        onChange={e => setShopForm({...shopForm, openingHours: e.target.value})} 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horário de Fechamento</label>
                      <input 
                        type="time" 
                        value={shopForm.closingHours || '18:00'} 
                        onChange={e => setShopForm({...shopForm, closingHours: e.target.value})} 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" 
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                    <Info size={20} className="text-blue-500 flex-shrink-0" />
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed uppercase tracking-wider">
                      Dica: Manter seu horário atualizado ajuda os clientes a saberem exatamente quando podem fazer pedidos e retirar produtos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSaveShop} 
                  className="px-12 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                >
                  Salvar Horários
                </button>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'settings' ? (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 font-display">
                <Settings className="text-slate-400" /> Configurações da Loja
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome da Loja</label>
                    <input type="text" value={shopForm.name || ''} onChange={e => setShopForm({...shopForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço</label>
                    <input type="text" value={shopForm.address || ''} onChange={e => setShopForm({...shopForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cidade</label>
                      <input type="text" value={shopForm.city || ''} onChange={e => setShopForm({...shopForm, city: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
                      <select value={shopForm.state || ''} onChange={e => setShopForm({...shopForm, state: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold appearance-none">
                        <option value="">Selecione...</option>
                        {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp de Contato</label>
                    <input type="tel" value={shopForm.whatsapp || ''} onChange={e => setShopForm({...shopForm, whatsapp: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</label>
                    <textarea value={shopForm.description || ''} onChange={e => setShopForm({...shopForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-32 resize-none" />
                  </div>
                  
                  <div className="pt-6 border-t border-slate-50 space-y-6">
                    {/* Scheduling moved to Horário tab */}
                    <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center italic">
                        As configurações de horário e funcionamento foram movidas para a aba "Horário".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button onClick={handleDeleteShop} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Excluir Loja Permanentemente</button>
                <button onClick={handleSaveShop} className="px-12 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">Salvar Alterações</button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Modais de Edição */}
      <AnimatePresence>
        {isEditingShop && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditingShop(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-8 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-black font-display">Configurações da Loja</h3>
                <button onClick={() => setIsEditingShop(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome da Loja</label>
                    <input type="text" value={shopForm.name || ''} onChange={e => setShopForm({...shopForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço</label>
                    <input type="text" value={shopForm.address || ''} onChange={e => setShopForm({...shopForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp de Contato</label>
                    <input type="tel" value={shopForm.whatsapp || ''} onChange={e => setShopForm({...shopForm, whatsapp: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <PhotoUpload 
                    value={shopForm.photoURL || ''} 
                    onChange={base64 => setShopForm({...shopForm, photoURL: base64})} 
                    label="Foto da Loja"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</label>
                  <textarea value={shopForm.description || ''} onChange={e => setShopForm({...shopForm, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-32 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horário Abertura</label>
                    <input type="time" value={shopForm.openingHours || ''} onChange={e => setShopForm({...shopForm, openingHours: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horário Fechamento</label>
                    <input type="time" value={shopForm.closingHours || ''} onChange={e => setShopForm({...shopForm, closingHours: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Métodos de Pagamento</label>
                  <div className="flex flex-wrap gap-3">
                    {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Boleto'].map(method => (
                      <button 
                        key={method}
                        onClick={() => {
                          const current = shopForm.paymentMethods || [];
                          const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                          setShopForm({...shopForm, paymentMethods: next});
                        }}
                        className={cn(
                          "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          shopForm.paymentMethods?.includes(method) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                        )}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
                    <input type="checkbox" checked={shopForm.acceptsDelivery} onChange={e => setShopForm({...shopForm, acceptsDelivery: e.target.checked})} className="w-5 h-5 rounded-lg text-brand-600 focus:ring-brand-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Aceita Entrega</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white transition-all">
                    <input type="checkbox" checked={shopForm.acceptsPickup} onChange={e => setShopForm({...shopForm, acceptsPickup: e.target.checked})} className="w-5 h-5 rounded-lg text-brand-600 focus:ring-brand-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Aceita Retirada</span>
                  </label>
                </div>
                <button onClick={handleSaveShop} className="w-full py-5 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20">Salvar Alterações</button>
                
                <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">Zona de Perigo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={handleDeleteShop}
                      className="py-4 bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Excluir Loja
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      className="py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      <UserMinus size={16} /> Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => {
                showConfirm('Descartar Alterações', 'Deseja realmente sair sem salvar? O rascunho será mantido apenas localmente.', () => {
                  setEditingProduct(null);
                  setShowProductCalculator(false);
                });
              }} 
            />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-8 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Package className="text-brand-400" />
                  <h3 className="text-2xl font-black font-display">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                </div>
                <button 
                  onClick={() => {
                    showConfirm('Sair do Editor', 'Deseja realmente fechar o editor? Suas alterações serão salvas automaticamente como rascunho.', () => {
                      setEditingProduct(null);
                      setShowProductCalculator(false);
                    });
                  }} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info size={16} />
                  </div>
                  <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                    Suas alterações estão sendo salvas automaticamente no seu navegador como rascunho.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Produto</label>
                    <input type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                    <select 
                      value={editingProduct.category || ''} 
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold appearance-none"
                    >
                      <option value="">Selecione uma categoria</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {showProductCalculator && (
                  <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 animate-in slide-in-from-top-4 overflow-hidden">
                    <CalculatorScreen 
                      config={config} 
                      onBack={() => setShowProductCalculator(false)} 
                      user={user} 
                      initialData={{
                        price: editingProduct.price || 0,
                        unit: editingProduct.unit || 'unit',
                        weightPerUnit: editingProduct.weightPerUnit || 1
                      }}
                      onApply={(data) => {
                        setEditingProduct({
                          ...editingProduct,
                          price: data.price,
                          unit: data.unit as any,
                          weightPerUnit: data.weightPerUnit
                        });
                        setShowProductCalculator(false);
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unidade de Venda</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'unit', label: 'Unidade', icon: Package },
                        { id: 'kg', label: 'Quilo', icon: Scale },
                        { id: 'gram', label: 'Grama', icon: Scale },
                        { id: 'box', label: 'Caixa', icon: Box },
                        { id: 'bag', label: 'Saco', icon: ShoppingBag },
                      ].map(u => (
                        <button
                          key={u.id}
                          onClick={() => setEditingProduct({...editingProduct, unit: u.id as any})}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                            editingProduct.unit === u.id 
                              ? "border-brand-500 bg-brand-50 text-brand-600" 
                              : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <u.icon size={16} />
                          <span className="text-[8px] font-black uppercase tracking-tight">{u.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Calculadora de Peso/Quantidade</label>
                    <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Balança Digital</span>
                        <Calculator size={14} className="text-blue-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-blue-400 uppercase">Peso/{translateUnit(editingProduct.unit || 'unit')} (Medida)</span>
                          <input 
                            type="number" 
                            step="0.01"
                            value={editingProduct.weightPerUnit || ''} 
                            onChange={e => setEditingProduct({...editingProduct, weightPerUnit: Number(e.target.value)})} 
                            className="w-full p-2 bg-white border border-blue-200 rounded-xl outline-none text-xs font-bold text-blue-700"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="p-3 bg-white/50 rounded-xl border border-blue-100">
                          <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1">Resultado da Divulgação</p>
                          <p className="text-[10px] font-bold text-blue-700">
                            {editingProduct.weightPerUnit ? (
                              `Este produto será divulgado como: ${editingProduct.weightPerUnit}${editingProduct.unit === 'kg' ? 'kg' : editingProduct.unit === 'gram' ? 'g' : ''} por ${(translateUnit(editingProduct.unit || 'unit') || '').toLowerCase()}`
                            ) : (
                              "Insira o peso para ver como será divulgado"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preço Venda</label>
                    <input type="number" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Custo</label>
                    <input type="number" value={editingProduct.cost || ''} onChange={e => setEditingProduct({...editingProduct, cost: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estoque</label>
                    <input type="number" value={editingProduct.stock || ''} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <PhotoUpload 
                    value={editingProduct.photoURL || ''} 
                    onChange={base64 => setEditingProduct({...editingProduct, photoURL: base64})} 
                    label="Foto do Produto"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</label>
                  <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-24 resize-none" />
                </div>
                <button onClick={handleSaveProduct} className="w-full py-5 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20">Salvar Produto</button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

const VendorAccounting = ({ 
  user, 
  showNotification,
  config,
  onNavigate
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void
}) => {
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const shopQuery = query(collection(db, 'shops'), where('ownerUid', '==', user.uid));
    const unsubscribeShop = onSnapshot(shopQuery, (snapshot) => {
      if (!snapshot.empty) {
        setMyShop({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));
    return () => unsubscribeShop();
  }, [user]);

  useEffect(() => {
    if (!myShop) return;
    const salesQuery = query(collection(db, 'shops', myShop.id, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/sales`));

    const ordersQuery = query(collection(db, 'orders'), where('shopOwnerUid', '==', user.uid), where('shopId', '==', myShop.id), where('status', '==', 'completed'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    const productsQuery = query(collection(db, 'shops', myShop.id, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/products`));

    return () => {
      unsubscribeSales();
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [myShop]);

  // Consolidar vendas manuais e pedidos concluídos
  const consolidatedSales = [
    ...sales,
    ...orders.map(o => {
      const totalCost = o.items?.reduce((sum: number, item: any) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.cost || 0) * item.quantity);
      }, 0) || 0;
      
      const createdAt = o.createdAt?.toDate() || new Date();

      return {
        id: o.id,
        shopId: o.shopId,
        totalValue: o.totalValue || 0,
        totalCost: totalCost,
        buyerUid: o.buyerUid,
        createdAt: o.createdAt,
        month: createdAt.getMonth(),
        year: createdAt.getFullYear()
      } as Sale;
    })
  ];

  const totalSales = consolidatedSales.reduce((acc, s) => acc + s.totalValue, 0);
  const totalCost = consolidatedSales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalProfit = totalSales - totalCost;
  const uniqueCustomers = new Set(consolidatedSales.filter(s => s.buyerUid).map(s => s.buyerUid)).size;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthSales = consolidatedSales.filter(s => s.month === i);
    return {
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      vendas: monthSales.reduce((acc, s) => acc + s.totalValue, 0),
      custo: monthSales.reduce((acc, s) => acc + s.totalCost, 0),
      lucro: monthSales.reduce((acc, s) => acc + (s.totalValue - s.totalCost), 0)
    };
  });

  const topProducts = products
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  const mostAdded = products
    .sort((a, b) => b.addedCount - a.addedCount)
    .slice(0, 5);

  const mostRated = products
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('shop-management')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-600 transition-all shadow-soft">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Sistema Contábil</h2>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Gestão de Vendas e Lucratividade</p>
          </div>
        </div>
        <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl">
          <CalendarIcon size={20} className="text-brand-400" />
          <span className="text-xs font-black uppercase tracking-widest">{new Date().getFullYear()}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-emerald-50 transition-all duration-500">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendas Total</p>
          <h4 className="text-3xl font-black text-slate-900 font-display">R$ {totalSales.toFixed(2)}</h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-red-50 transition-all duration-500">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingDown size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total</p>
          <h4 className="text-3xl font-black text-slate-900 font-display text-red-600">R$ {totalCost.toFixed(2)}</h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-brand-50 transition-all duration-500">
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <h4 className="text-3xl font-black text-brand-600 font-display">R$ {totalProfit.toFixed(2)}</h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-blue-50 transition-all duration-500">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clientes</p>
          <h4 className="text-3xl font-black text-slate-900 font-display">{uniqueCustomers}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gráfico de Vendas */}
          <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black flex items-center gap-3 font-display">
                <BarChart size={24} className="text-brand-500" /> Desempenho Mensal
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Vendas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Custos</span>
                </div>
              </div>
            </div>
            <div className="min-h-[300px] h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300} debounce={50}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVendas)" />
                  <Area type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorCusto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 font-display">
              <PieChart size={24} className="text-brand-500" /> Top Produtos (Volume)
            </h3>
            <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{p.salesCount} vendas</p>
                    <p className="text-[10px] font-bold text-emerald-600">R$ {(p.salesCount * p.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Calendário de Vendas */}
          <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
              <CalendarIcon size={16} /> Calendário Anual
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {monthlyData.map(m => (
                <div key={m.name} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{m.name}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    m.lucro > 0 ? "bg-emerald-500" : m.lucro < 0 ? "bg-red-500" : "bg-slate-700"
                  )} />
                  <span className="text-[8px] font-bold mt-2 text-slate-400">R$ {m.vendas.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mais Adicionados / Avaliados */}
          <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Mais Desejados</h3>
            <div className="space-y-6">
              {mostAdded.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-600 border border-slate-100">
                    <Heart size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black text-slate-400">{p.rating.toFixed(1)} ({p.ratingCount})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900">{p.addedCount}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Adições</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ponto de Pedido */}
          <div className="bg-amber-50 rounded-[40px] p-8 border border-amber-100">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={16} /> Reposição Urgente
            </h3>
            <div className="space-y-4">
              {products.filter(p => p.stock < 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Estoque: {p.stock}</p>
                  </div>
                  <button className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200 transition-all">
                    <Truck size={16} />
                  </button>
                </div>
              ))}
              {products.filter(p => p.stock < 10).length === 0 && (
                <p className="text-[10px] text-amber-700 font-medium italic">Estoque em dia!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopManagement = ({ 
  user, 
  showNotification,
  showConfirm,
  config,
  onNavigate,
  setSelectedChat
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void,
  setSelectedChat: (uid: string | null) => void
}) => {
  return <VendorManagement user={user} showNotification={showNotification} showConfirm={showConfirm} config={config} onNavigate={onNavigate} setSelectedChat={setSelectedChat} />;
};

const ProfileScreen = ({ 
  user, 
  onUpdate, 
  showNotification,
  showConfirm,
  config,
  onNavigate
}: { 
  user: UserProfile | null, 
  onUpdate: (u: UserProfile) => void,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(user || {});
  const [salesStats, setSalesStats] = useState({ total: 0, count: 0, profit: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    if (!user) return;
    showConfirm(
      'Excluir Minha Conta',
      'Tem certeza absoluta? Esta ação removerá permanentemente seu perfil e todas as suas informações da nossa base de dados. Esta ação não pode ser desfeita.',
      async () => {
        setIsDeleting(true);
        try {
          await deleteDoc(doc(db, 'users', user.uid));
          showNotification('Sua conta foi excluída com sucesso.', 'success');
          await auth.signOut();
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`);
          setIsDeleting(false);
        }
      }
    );
  };

  useEffect(() => {
    if (!user || user.role !== 'vendor') return;
    
    let unsubShop: () => void;
    let unsubOrders: () => void;
    let unsubProducts: () => void;

    // Buscar o ID da loja do usuário
    const shopQuery = query(collection(db, 'shops'), where('ownerUid', '==', user.uid), limit(1));
    getDocs(shopQuery).then(async (shopSnapshot) => {
      if (!shopSnapshot.empty) {
        const shopId = shopSnapshot.docs[0].id;
        
        // Buscar produtos para calcular lucro (precisa ser real-time para refletir mudanças de custo)
        const productsQuery = collection(db, 'shops', shopId, 'products');
        unsubProducts = onSnapshot(productsQuery, (productsSnapshot) => {
          const products = productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

          // Buscar pedidos concluídos em tempo real
          const ordersQuery = query(collection(db, 'orders'), where('shopOwnerUid', '==', user.uid), where('shopId', '==', shopId), where('status', '==', 'completed'));
          unsubOrders = onSnapshot(ordersQuery, (ordersSnapshot) => {
            let total = 0;
            let profit = 0;
            
            ordersSnapshot.docs.forEach(doc => {
              const order = doc.data();
              total += (order.totalValue || 0);
              
              const orderCost = order.items?.reduce((sum: number, item: any) => {
                const product: any = products.find(p => p.id === item.id);
                return sum + ((product?.cost || 0) * item.quantity);
              }, 0) || 0;
              
              profit += ((order.totalValue || 0) - orderCost);
            });

            setSalesStats({
              total,
              count: ordersSnapshot.size,
              profit
            });
          });
        });
      }
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubProducts) unsubProducts();
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      onUpdate({ ...user, ...formData });
      showNotification('Perfil salvo com sucesso! Suas alterações foram registradas.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      <PageContainer screen="profile" config={config}>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
          <div className="h-48 bg-slate-900 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
          </div>
          
          <div className="px-10 pb-10">
            <div className="flex flex-col items-center -mt-24 mb-12 relative z-10">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-brand-500/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={formData.photoURL || user.photoURL} className="relative w-40 h-40 rounded-[48px] object-cover border-8 border-white shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out" alt={user.displayName} />
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const optimized = await compressImage(file, 400, 400, 0.7);
                        setFormData({ ...formData, photoURL: optimized });
                      }
                    };
                    input.click();
                  }}
                  className="absolute bottom-2 right-2 p-4 bg-brand-600 text-white rounded-3xl shadow-xl hover:bg-brand-700 transition-all hover:scale-110 active:scale-90 z-20"
                >
                  <Camera size={20} />
                </button>
              </div>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-1">{user.displayName}</h2>
              <p className="text-slate-400 font-medium mb-6">{user.email}</p>
              <div className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 mb-4">
                {translateRole(user.role)}
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  <User size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Informações Pessoais</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.displayName || ''}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Idade</label>
                    <input 
                      type="number" 
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Sexo</label>
                    <select 
                      value={formData.gender || ''}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <MapPin size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Localização e Contato</h3>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Telefone de Contato</label>
                  <input 
                    type="tel" 
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">WhatsApp (para clientes)</label>
                  <input 
                    type="tel" 
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Cidade</label>
                    <input 
                      type="text" 
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Estado</label>
                    <input 
                      type="text" 
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Autodescrição de Perfil (Feira Livre como Cliente)</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Conte um pouco sobre você como comprador..."
                    rows={4}
                    className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-medium text-slate-700 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Conta Verificada</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seus dados estão protegidos</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="w-full sm:w-auto px-12 py-5 bg-brand-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <Save size={18} /> Salvar Alterações
            </button>
          </div>

          {user.role === 'vendor' && (
            <div className="mt-12 p-8 bg-white rounded-[32px] border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black font-display text-slate-900">Resumo de Vendas</h3>
                <button 
                  onClick={() => onNavigate('sales')}
                  className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline"
                >
                  Ver Relatório Completo
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Vendido</p>
                  <p className="text-2xl font-black text-slate-900">R$ {salesStats.total.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Concluídos</p>
                  <p className="text-2xl font-black text-slate-900">{salesStats.count}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                  <p className="text-2xl font-black text-emerald-600">R$ {salesStats.profit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full sm:w-auto px-8 py-4 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Excluir Minha Conta
            </button>
            <button 
              onClick={handleSave}
              className="w-full sm:w-auto px-12 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
      </PageContainer>
    </div>
  );
};

const ContactScreen = ({ 
  user, 
  showNotification,
  config
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  config: AppConfig | null
}) => {
  const [text, setText] = useState('');
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.displayName?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [isSending, setIsSending] = useState(false);

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleSend = async () => {
    if (!text.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !gender || !state) {
      showNotification('Por favor, preencha todos os campos.', 'error');
      return;
    }
    setIsSending(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        senderUid: user?.uid || 'anonymous',
        firstName,
        lastName,
        email,
        gender,
        state,
        text,
        createdAt: Timestamp.now()
      });
      setText('');
      showNotification('Mensagem enviada com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contactMessages');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      <PageContainer screen="contact" config={config}>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-slate-900 p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <Mail size={32} className="text-brand-400" />
              </div>
              <h2 className="text-3xl font-black font-display tracking-tight mb-4">Fale Conosco</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Estamos aqui para ouvir você. Dúvidas, sugestões ou apenas um "oi"? Mande sua mensagem!
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <MapPin size={14} />
                </div>
                <span>Feira Livre Digital, Brasil</span>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-12 bg-white">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Seu nome" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sobrenome</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Seu sobrenome" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sexo</label>
                  <div className="relative">
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium text-slate-600"
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                      <option value="N">Prefiro não dizer</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Estado</label>
                <div className="relative">
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium text-slate-600"
                  >
                    <option value="">Selecione seu estado</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sua Mensagem</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Como podemos ajudar você hoje?" 
                  rows={4}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none placeholder:text-slate-300 text-slate-600"
                />
              </div>

              <button 
                onClick={handleSend}
                disabled={isSending || !text.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !gender || !state}
                className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={20} className="rotate-[-10deg]" />
                )}
                {isSending ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
              
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Nossa equipe responde em até 24 horas úteis.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

// --- Chats Screen ---

const ChatsScreen = ({ 
  user, 
  showNotification,
  showConfirm,
  onNavigate,
  selectedChatId: selectedChat,
  setSelectedChatId: setSelectedChat
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  onNavigate: (screen: Screen) => void,
  selectedChatId: string | null,
  setSelectedChatId: (uid: string | null) => void
}) => {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [partnerProfiles, setPartnerProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [shopProfiles, setShopProfiles] = useState<{ [key: string]: Shop }>({});
  const [myShop, setMyShop] = useState<Shop | null>(null);

  if (!user) return <LoginRequiredView onNavigate={onNavigate} />;

  useEffect(() => {
    if (user?.role === 'vendor') {
      const q = query(collection(db, 'shops'), where('ownerUid', '==', user.uid), limit(1));
      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          setMyShop({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop);
        }
      });
    }
  }, [user]);

  const isShopOpen = (opening: string, closing: string) => {
    if (!opening || !closing) return true;
    try {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [openH, openM] = opening.split(':').map(Number);
      const [closeH, closeM] = closing.split(':').map(Number);
      
      const openTime = openH * 60 + openM;
      const closeTime = closeH * 60 + closeM;
      
      if (closeTime < openTime) {
        // Over midnight
        return currentTime >= openTime || currentTime <= closeTime;
      }
      return currentTime >= openTime && currentTime <= closeTime;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    const fetchShopProfiles = async () => {
      const vendorUids = chats
        .filter(c => !shopProfiles[c.partnerUid] && c.partnerUid !== 'admin_system')
        .map(c => c.partnerUid);
      
      if (vendorUids.length === 0) return;

      for (const uid of vendorUids) {
        try {
          const q = query(collection(db, 'shops'), where('ownerUid', '==', uid), limit(1));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setShopProfiles(prev => ({
              ...prev,
              [uid]: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Shop
            }));
          }
        } catch (err) {
          console.error("Error fetching shop profile:", err);
        }
      }
    };

    fetchShopProfiles();
  }, [chats]);

  useEffect(() => {
    if (!selectedChat || !showProfileModal) return;
    
    const fetchPartnerProfile = async () => {
      if (partnerProfiles[selectedChat]) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', selectedChat));
        if (userDoc.exists()) {
          setPartnerProfiles(prev => ({
            ...prev,
            [selectedChat]: { uid: userDoc.id, ...userDoc.data() } as UserProfile
          }));
        }
      } catch (err) {
        console.error("Error fetching partner profile:", err);
      }
    };

    fetchPartnerProfile();
  }, [selectedChat, showProfileModal]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chatMessages'),
      or(
        where('senderUid', '==', user.uid),
        where('receiverUid', '==', user.uid)
      ),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
      
      // Group by chat partner
      const chatGroups: { [key: string]: any } = {};
      const partnerUids = new Set<string>();

      allMsgs.forEach(msg => {
        const partnerUid = msg.senderUid === user.uid ? msg.receiverUid : msg.senderUid;
        partnerUids.add(partnerUid);
        if (!chatGroups[partnerUid]) {
          chatGroups[partnerUid] = {
            partnerUid,
            lastMessage: msg,
            shopName: msg.shopName,
            messages: [],
            partnerName: msg.senderUid !== user.uid ? msg.senderName : null,
            partnerPhotoURL: msg.senderUid !== user.uid ? msg.senderPhotoURL : null
          };
        }
        chatGroups[partnerUid].messages.push(msg);
        chatGroups[partnerUid].lastMessage = msg;
        if (msg.senderUid !== user.uid) {
          if (msg.senderName) chatGroups[partnerUid].partnerName = msg.senderName;
          if (msg.senderPhotoURL) chatGroups[partnerUid].partnerPhotoURL = msg.senderPhotoURL;
        }
        if (msg.shopName) chatGroups[partnerUid].shopName = msg.shopName;
      });

      setChats(Object.values(chatGroups).sort((a, b) => 
        new Date(b.lastMessage.createdAt.toDate()).getTime() - new Date(a.lastMessage.createdAt.toDate()).getTime()
      ));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chatMessages'));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      const chat = chats.find(c => c.partnerUid === selectedChat);
      setMessages(chat?.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat, chats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (image?: string) => {
    if (!user || !selectedChat) return;
    if (!newMessage.trim() && !image) return;

    try {
      const chat = chats.find(c => c.partnerUid === selectedChat);
      const messageData: any = {
        senderUid: user.uid,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        receiverUid: selectedChat,
        text: newMessage,
        shopName: chat?.shopName || null,
        metadata: {
          ...(chat?.lastMessage?.metadata || {}),
          shopOwnerUid: chat?.lastMessage?.metadata?.shopOwnerUid || (user.role === 'vendor' ? user.uid : (chats.find(c => c.partnerUid === selectedChat)?.partnerUid || ""))
        },
        createdAt: Timestamp.now()
      };
      
      
      if (image) {
        messageData.image = image;
      }

      await addDoc(collection(db, 'chatMessages'), messageData);
      setNewMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chatMessages');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await compressImage(file, 800, 800, 0.6);
      await sendMessage(optimized);
    } catch (err) {
      showNotification('Erro ao processar imagem.', 'error');
    }
  };

  const deleteMessage = async (messageId: string) => {
    showConfirm(
      'Excluir Mensagem',
      'Tem certeza que deseja excluir esta mensagem?',
      async () => {
        try {
          await deleteDoc(doc(db, 'chatMessages', messageId));
          showNotification('Mensagem excluída.');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `chatMessages/${messageId}`);
        }
      }
    );
  };

  const renderMessageText = (text: string) => {
    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline decoration-2 underline-offset-4 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 font-black"
          >
            {part} <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };

  if (!user) return <div className="p-20 text-center">Faça login para acessar o bate-papo.</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-12rem)] flex gap-6 relative">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div className={cn(
        "w-full md:w-80 bg-white rounded-[32px] shadow-soft border border-slate-100 flex flex-col overflow-hidden transition-all duration-500",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 font-display">Bate-papo</h2>
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Nenhuma conversa iniciada.</p>
            </div>
          ) : (
            chats.map(chat => {
              return (
                <button
                  key={chat.partnerUid}
                  onClick={() => setSelectedChat(chat.partnerUid)}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group relative",
                    selectedChat === chat.partnerUid ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "hover:bg-slate-50 border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border shadow-sm transition-all",
                    selectedChat === chat.partnerUid ? "border-white/20" : "bg-slate-100 text-slate-400 border-slate-100"
                  )}>
                    {chat.partnerUid === 'admin_system' ? (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                      </div>
                    ) : shopProfiles[chat.partnerUid]?.photoURL ? (
                      <img src={shopProfiles[chat.partnerUid].photoURL} className="w-full h-full object-cover" alt="" />
                    ) : chat.partnerPhotoURL ? (
                      <img src={chat.partnerPhotoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={cn(
                        "font-black truncate text-sm",
                        selectedChat === chat.partnerUid ? "text-white" : "text-slate-900"
                      )}>
                        {chat.shopName || chat.partnerName || `Usuário ${chat.partnerUid.slice(0, 5)}`}
                      </p>
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-widest",
                        selectedChat === chat.partnerUid ? "text-white/60" : "text-slate-400"
                      )}>
                        {chat.lastMessage.createdAt?.toDate ? chat.lastMessage.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[11px] truncate font-medium",
                      selectedChat === chat.partnerUid ? "text-white/80" : "text-slate-500"
                    )}>{chat.lastMessage.text}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area - Fullscreen on mobile when selected */}
      <div className={cn(
        "flex-1 bg-white rounded-[32px] shadow-soft border border-slate-100 flex flex-col overflow-hidden transition-all duration-500",
        selectedChat ? "flex" : "hidden md:flex"
      )}>
        {selectedChat ? (
          <>
            <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="p-2 md:hidden hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center overflow-hidden border border-emerald-100 shadow-sm group-hover:scale-105 transition-transform">
                    {selectedChat === 'admin_system' ? (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                        <ShieldCheck size={20} />
                      </div>
                    ) : shopProfiles[selectedChat]?.photoURL ? (
                      <img src={shopProfiles[selectedChat].photoURL} className="w-full h-full object-cover" alt="" />
                    ) : chats.find(c => c.partnerUid === selectedChat)?.partnerPhotoURL ? (
                      <img src={chats.find(c => c.partnerUid === selectedChat)?.partnerPhotoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-slate-900 text-sm md:text-base font-display group-hover:text-emerald-600 transition-colors">
                      {selectedChat === 'admin_system' ? 'Administração do Sistema' : (chats.find(c => c.partnerUid === selectedChat)?.shopName || chats.find(c => c.partnerUid === selectedChat)?.partnerName || `Usuário ${selectedChat.slice(0, 5)}`)}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {selectedChat !== 'admin_system' && shopProfiles[selectedChat] ? (
                        <>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours) ? "bg-emerald-500" : "bg-red-500"
                          )} />
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours) ? "text-emerald-500" : "text-red-500"
                          )}>
                            {isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours) ? 'Aberto agora' : 'Fechado'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Atendimento Ativo</p>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                  title="Ver Perfil"
                >
                  <User size={20} />
                </button>
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="hidden md:block p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/30 no-scrollbar">
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                return (
                  <div key={msg.id} className={cn(
                    "flex gap-3 max-w-[90%] md:max-w-[80%] group animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.senderUid === user.uid ? "ml-auto flex-row-reverse" : "flex-row"
                  )}>
                    {/* Profile Pic */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white shadow-sm mt-1">
                      {msg.senderUid === user.uid ? (
                        user.role === 'vendor' && myShop?.photoURL ? (
                          <img src={myShop.photoURL} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                        )
                      ) : (
                        msg.senderUid === 'admin_system' ? (
                          <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                            <ShieldCheck size={14} />
                          </div>
                        ) : shopProfiles[msg.senderUid]?.photoURL ? (
                          <img src={shopProfiles[msg.senderUid].photoURL} className="w-full h-full object-cover" alt="" />
                        ) : msg.senderPhotoURL ? (
                          <img src={msg.senderPhotoURL} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                            <User size={14} />
                          </div>
                        )
                      )}
                    </div>

                    <div className={cn(
                      "flex flex-col",
                      msg.senderUid === user.uid ? "items-end" : "items-start"
                    )}>
                      <div className="flex items-center gap-2 max-w-full">
                        {msg.senderUid === user.uid && (
                          <button 
                            onClick={() => deleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <div className={cn(
                          "p-4 rounded-2xl text-sm font-medium shadow-sm overflow-hidden relative",
                          msg.senderUid === user.uid 
                            ? "bg-emerald-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                        )}>
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Shared" 
                              className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => window.open(msg.image, '_blank')}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {msg.text && <div className="leading-relaxed">{renderMessageText(msg.text)}</div>}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1">
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Enviando...'}
                        {msg.senderUid === user.uid && <Check size={10} className="text-emerald-500" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-slate-50">
              <div className="flex gap-3 items-center">
                <label className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer border border-slate-100 shadow-sm active:scale-95">
                  <ImagePlus size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escreva algo legal..."
                    className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/30 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10 text-center bg-slate-50/30">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-soft border border-slate-100 flex items-center justify-center mb-6">
              <MessageSquare size={40} strokeWidth={1.5} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 font-display mb-2">Suas Conversas</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">Selecione um contato ao lado para iniciar uma negociação segura</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedChat && partnerProfiles[selectedChat] && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-[32px] mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg">
                  {partnerProfiles[selectedChat].photoURL ? (
                    <img src={partnerProfiles[selectedChat].photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User size={48} className="mx-auto mt-6 text-slate-300" />
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{partnerProfiles[selectedChat].displayName}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{translateRole(partnerProfiles[selectedChat].role)}</p>
                
                <div className="space-y-4 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  {partnerProfiles[selectedChat].email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail size={16} className="text-brand-500" />
                      <span className="truncate">{partnerProfiles[selectedChat].email}</span>
                    </div>
                  )}
                  {partnerProfiles[selectedChat].whatsapp && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone size={16} className="text-brand-500" />
                      <span>{partnerProfiles[selectedChat].whatsapp}</span>
                    </div>
                  )}
                  {(partnerProfiles[selectedChat].city || partnerProfiles[selectedChat].state) && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin size={16} className="text-brand-500" />
                      <span>{partnerProfiles[selectedChat].state}. {partnerProfiles[selectedChat].city}. Brasil.</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = "Ocorreu um erro inesperado. Por favor, recarregue a página.";
      try {
        const parsed = JSON.parse(this.state.errorInfo.message);
        if (parsed.error && parsed.error.includes('Missing or insufficient permissions')) {
          message = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[40px] shadow-soft border border-slate-100 max-w-md text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 font-display">Ops! Algo deu errado</h2>
            <p className="text-slate-500 font-medium mb-8">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const LogoComponent = ({ className, size = 'sm' }: { className?: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) => (
  <LogoSVG className={className} size={size} />
);

// Notification Service
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: icon || 'https://picsum.photos/seed/logo/200',
  });
};

function MainApp() {
  const [currentScreen, _setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const startTime = useRef(Timestamp.now());
  const notifiedOrders = useRef<Set<string>>(new Set());
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [cart, setCart] = useState<{shopId: string, shopName: string, items: {product: Product, quantity: number}[]} | null>(null);
  const [userShops, setUserShops] = useState<string[]>([]);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newBuyerOrdersCount, setNewBuyerOrdersCount] = useState(0);
  const [wholesaleShopsCount, setWholesaleShopsCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setWholesaleShopsCount(0);
      return;
    }
    const q = query(collection(db, 'shops'), where('isApproved', '==', true), where('type', '==', 'atacado'));
    return onSnapshot(q, (snapshot) => {
      setWholesaleShopsCount(snapshot.size);
    }, (err) => console.error("Error fetching wholesale count:", err));
  }, [user]);
  const [newAdminNotificationsCount, setNewAdminNotificationsCount] = useState(0);
  const [newAdminMessagesCount, setNewAdminMessagesCount] = useState(0);
  const [globalSelectedCategory, setGlobalSelectedCategory] = useState('all');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchView, setSearchView] = useState<'shops' | 'products'>('shops');
  const [wholesaleView, setWholesaleView] = useState<'shops' | 'products'>('shops');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const qMessages = query(
      collection(db, 'chatMessages'),
      where('receiverUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    let initialMessagesLoad = true;
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      if (initialMessagesLoad) {
        initialMessagesLoad = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msg = change.doc.data() as ChatMessage;
          const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : 0;
          if (msgTime > startTime.current.toMillis()) {
            sendBrowserNotification(
              `Nova mensagem de ${msg.senderName}`,
              msg.text || 'Imagem recebida'
            );
          }
        }
      });
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chatMessages'));

    return () => {
      unsubscribeMessages();
    };
  }, [user, userShops]);

  useEffect(() => {
    const hasSeen = localStorage.getItem('feira_livre_permissions_seen');
    if (!hasSeen) {
      setShowPermissionModal(true);
    }
  }, []);

  const handleNavigate = async (screen: Screen) => {
    // Verify permission modal acknowledgment
    const permissionsSeen = localStorage.getItem('feira_livre_permissions_seen');
    if (!permissionsSeen) {
      setShowPermissionModal(true);
      return;
    }

    // Access Control for Sales
    if (screen === 'sales' && user?.role === 'client') {
      showNotification('Acesso restritivo: Apenas vendedores podem acessar o painel de vendas.', 'error');
      return;
    }

    _setCurrentScreen(screen);
    if (!user) return;

    try {
      if (screen === 'chats') {
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeenChatAt: Timestamp.now()
        });
      } else if (screen === 'sales' || screen === 'wholesale-management') {
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeenOrderAt: Timestamp.now()
        });
      } else if (screen === 'orders') {
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeenBuyerOrderAt: Timestamp.now()
        });
      } else if (screen === 'saved') {
        // No specific timestamp for saved yet, but could be added
      } else if (screen === 'notifications' || screen === 'admin-dashboard') {
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeenAdminAt: Timestamp.now()
        });
      }
    } catch (err) {
      console.error("Error updating last seen:", err);
    }
  };

  const setCurrentScreen = (screen: Screen) => handleNavigate(screen);

  // Keep lastSeen timestamps updated if user is on the screen to clear notifications immediately
  useEffect(() => {
    if (!user) return;
    
    const updateLastSeen = async (field: string) => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          [field]: Timestamp.now()
        });
      } catch (err) {
        console.error(`Error updating ${field}:`, err);
      }
    };

    if (currentScreen === 'chats' && unreadChatsCount > 0) {
      updateLastSeen('lastSeenChatAt');
    }
    if ((currentScreen === 'sales' || currentScreen === 'wholesale-management') && newOrdersCount > 0) {
      updateLastSeen('lastSeenOrderAt');
    }
    if (currentScreen === 'orders' && newBuyerOrdersCount > 0) {
      updateLastSeen('lastSeenBuyerOrderAt');
    }
    if ((currentScreen === 'admin-dashboard' || currentScreen === 'notifications') && newAdminNotificationsCount > 0) {
      updateLastSeen('lastSeenAdminAt');
    }
  }, [currentScreen, user, unreadChatsCount, newOrdersCount, newBuyerOrdersCount, newAdminNotificationsCount]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const sharedAddToCart = (product: Product, shopId: string, shopName: string) => {
    if (product.stock <= 0) {
      showNotification(`Desculpe, o produto ${product.name} acabou no momento.`, 'error');
      return;
    }

    const inCart = cart?.items.find((i: any) => i.product.id === product.id);
    const currentQty = inCart ? inCart.quantity : 0;
    
    if (currentQty >= product.stock) {
      showNotification(`Estoque máximo atingido para ${product.name}.`, 'error');
      return;
    }

    if (cart && cart.shopId !== shopId) {
      showConfirm(
        'Limpar Carrinho?',
        'Você já possui itens de outra loja. Deseja limpar o pedido atual?',
        () => {
          setCart({
            shopId,
            shopName,
            items: [{ product, quantity: 1 }]
          });
          showNotification('Pedido iniciado!', 'success');
        }
      );
      return;
    }

    setCart((prev: any) => {
      if (!prev) {
        showNotification('Item adicionado ao seu pedido', 'success');
        return { shopId, shopName, items: [{ product, quantity: 1 }] };
      }
      const existing = prev.items.find((item: any) => item.product.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item: any) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        };
      }
      showNotification('Item adicionado ao seu pedido', 'success');
      return { ...prev, items: [...prev.items, { product, quantity: 1 }] };
    });
  };

    const sharedRemoveFromCart = (product: Product) => {
      setCart((prev: any) => {
        if (!prev) return null;
        const existing = prev.items.find((item: any) => item.product.id === product.id);
        if (existing) {
          if (existing.quantity === 1) {
            const newItems = prev.items.filter((item: any) => item.product.id !== product.id);
            if (newItems.length === 0) {
              showNotification('Carrinho limpo', 'success');
              return null;
            }
            return { ...prev, items: newItems };
          }
          return {
            ...prev,
            items: prev.items.map((item: any) => item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item)
          };
        }
        return prev;
      });
    };

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      setDbStatus(isConnected ? 'connected' : 'error');
    };
    checkConnection();
    
    const initConfig = async (retries = 3) => {
      try {
        const configRef = doc(db, 'appConfig', 'global');
        const configSnap = await getDoc(configRef);
        if (!configSnap.exists()) {
          const defaultConfig: AppConfig = {
            id: 'global',
            splashScreen: {
              logoUrl: '', // Using Logo component instead
              backgroundColor: '#FFFFFF',
              textColor: '#0F172A',
              message: 'A caminho de você'
            },
            pages: {
              landing: { columns: 1, visible: true, title: 'Início' },
              search: { columns: 3, visible: true, title: 'Mercado' },
              wholesale: { columns: 3, visible: true, title: 'Atacado' }
            }
          };
          await setDoc(configRef, defaultConfig);
        }
      } catch (error: any) {
        const errorCode = error.code || 'unknown';
        const isTransient = errorCode === 'unavailable' || error.message?.includes('offline') || error.message?.includes('timeout');
        
        if (retries > 0 && isTransient) {
          console.warn(`Firestore is unreachable [${errorCode}]. Retrying in ${3 - retries + 1}s... (${retries} left)`);
          setTimeout(() => initConfig(retries - 1), 2000);
        } else if (isTransient) {
          console.warn("Firestore is unreachable after retries. App will operate in offline mode.");
          setDbStatus('error');
        } else {
          console.error("Critical error initializing config:", error);
          setDbStatus('error');
        }
      }
    };
    initConfig();
    
    const configUnsubscribe = onSnapshot(doc(db, 'appConfig', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setAppConfig(snapshot.data() as AppConfig);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'appConfig/global'));

    let userUnsubscribe: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }
      
      if (firebaseUser) {
        userUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as UserProfile);
          }
          setIsAuthReady(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setIsAuthReady(true);
        });
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });
    return () => {
      unsubscribe();
      if (userUnsubscribe) userUnsubscribe();
      configUnsubscribe();
    };
  }, []);

  // Fetch user shops for vendor notifications
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      setUserShops([]);
      return;
    }
    const q = query(collection(db, 'shops'), where('ownerUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserShops(snapshot.docs.map(doc => doc.id));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));
    return () => unsubscribe();
  }, [user]);

  // Fix chat unread notification bug: update lastSeenChatAt when on chats screen
  useEffect(() => {
    if (currentScreen === 'chats' && user) {
      const updateLastSeen = async () => {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastSeenChatAt: Timestamp.now()
          });
        } catch (err) {
          console.error("Error updating lastSeenChatAt:", err);
        }
      };
      updateLastSeen();
    }
  }, [currentScreen, user?.uid]);

  // Listen for unread chats
  useEffect(() => {
    if (!user) {
      setUnreadChatsCount(0);
      return;
    }

    const q = query(
      collection(db, 'chatMessages'),
      or(where('senderUid', '==', user.uid), where('receiverUid', '==', user.uid)),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const chatPartners = new Set<string>();
      
      // Group by partner
      messages.forEach(msg => {
        const partnerUid = msg.senderUid === user.uid ? msg.receiverUid : msg.senderUid;
        chatPartners.add(partnerUid);
      });

      // For each partner, check if the last message was from them and not seen
      let unread = 0;
      let adminUnread = 0;
      const adminEmails = ['raiza3983@gmail.com', 'rz7beats@gmail.com'];

      chatPartners.forEach(partnerUid => {
        const partnerMessages = messages.filter(m => m.senderUid === partnerUid || m.receiverUid === partnerUid);
        if (partnerMessages.length > 0 && partnerMessages[0].senderUid === partnerUid) {
          // Check if message is newer than lastSeenChatAt
          const lastMsgTime = partnerMessages[0].createdAt?.toDate?.() || new Date(partnerMessages[0].createdAt);
          const lastSeenTime = user.lastSeenChatAt?.toDate?.() || new Date(user.lastSeenChatAt || 0);
          
          if (lastMsgTime > lastSeenTime) {
            unread++;
            
            // Check if sender is admin (this is a heuristic since we don't have roles here directly)
            // But we can check if they are in the admin metadata if provided, or if specifically designated
            const isAdminMsg = partnerMessages[0].senderName?.toLowerCase().includes('admin') || 
                               partnerMessages[0].shopName?.toLowerCase().includes('admin');
            
            if (isAdminMsg) {
              adminUnread++;
            }
          }
        }
      });
      setUnreadChatsCount(unread);
      setNewAdminMessagesCount(adminUnread);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chatMessages'));

    return () => unsubscribe();
  }, [user]);

  // Listen for new orders (for vendors)
  useEffect(() => {
    if (!user || user.role !== 'vendor' || userShops.length === 0) {
      setNewOrdersCount(0);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('shopOwnerUid', '==', user.uid),
      where('status', 'in', ['pending', 'accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Count orders newer than lastSeenOrderAt
      const lastSeenTime = user.lastSeenOrderAt?.toDate?.() || new Date(user.lastSeenOrderAt || 0);
      const newOrders = orders.filter(o => {
        const orderTime = o.updatedAt?.toDate?.() || o.createdAt?.toDate?.() || new Date(o.updatedAt || o.createdAt);
        return orderTime > lastSeenTime;
      });

      setNewOrdersCount(newOrders.length);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    return () => unsubscribe();
  }, [user, userShops]);

  // Listen for new order updates (for buyers/clients)
  useEffect(() => {
    if (!user) {
      setNewBuyerOrdersCount(0);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('buyerUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const lastSeenTime = user.lastSeenBuyerOrderAt?.toDate?.() || new Date(user.lastSeenBuyerOrderAt || 0);
      const updatedOrders = orders.filter(o => {
        const updateTime = o.updatedAt?.toDate?.() || new Date(o.updatedAt || o.createdAt);
        return updateTime > lastSeenTime;
      });

      setNewBuyerOrdersCount(updatedOrders.length);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    return () => unsubscribe();
  }, [user]);

  // Global Notification System
  useEffect(() => {
    if (!user || !isAuthReady) {
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // 1. Chat Messages Notifications
    const chatQuery = query(
      collection(db, 'chatMessages'),
      where('receiverUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    unsubscribers.push(onSnapshot(chatQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const msg = change.doc.data();
          // Bug Fix: Don't show notification to the sender
          if (msg.senderUid === user.uid) return;
          
          // Use startTime to avoid old notifications
          const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : 0;
          if (msgTime < startTime.current.toMillis()) return;
          
          const isOrder = msg.text.startsWith('[NOVO PEDIDO');
          const notificationText = isOrder 
            ? `Novo pedido recebido! #${msg.text.split(']')[0].split(' ')[2]}`
            : `Nova mensagem: ${msg.text.slice(0, 30)}${msg.text.length > 30 ? '...' : ''}`;
        }
      });
    }, (err) => console.error("Chat notification error:", err)));

    // 2. Order Status Notifications (as Buyer)
    const buyerOrderQuery = query(
      collection(db, 'orders'),
      where('buyerUid', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    unsubscribers.push(onSnapshot(buyerOrderQuery, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const order = change.doc.data();
          
          // Use startTime to avoid old notifications
          const updateTime = order.updatedAt?.toMillis ? order.updatedAt.toMillis() : 0;
          if (updateTime < startTime.current.toMillis()) return;

          // User requested to remove notifications for completed/cancelled orders
          if (order.status === 'completed' || order.status === 'cancelled') return;

          showNotification(`Pedido #${change.doc.id.slice(-4)} atualizado para: ${translateStatus(order.status)}`, 'success');
        }
      });
    }, (err) => console.error("Order notification error:", err)));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, isAuthReady, userShops]);

  useEffect(() => {
    if (isAuthReady && user && currentScreen === 'landing') {
      if (user.role === 'state_admin' || user.role === 'admin') {
        if (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com'].includes(user.email)) {
          setCurrentScreen('admin-dashboard');
        } else {
          setCurrentScreen('pending-approval');
        }
      } else if (user.role === 'vendor') {
        setCurrentScreen('shop-management');
      } else {
        setCurrentScreen('search');
      }
    }
  }, [isAuthReady, user, currentScreen]);

  useEffect(() => {
    const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAdminNotifications(notifications);
      
      if (user) {
        const lastSeenTime = user.lastSeenAdminAt?.toDate?.() || new Date(user.lastSeenAdminAt || 0);
        const newNotifs = notifications.filter(n => {
          const notifTime = n.createdAt?.toDate?.() || new Date(n.createdAt);
          return notifTime > lastSeenTime;
        });
        setNewAdminNotificationsCount(newNotifs.length);
      } else {
        setNewAdminNotificationsCount(0);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (role: UserRole, loginType?: string) => {
    // Se já estiver tentando logar, permite clicar novamente após 15 segundos para "destravar"
    if (loggingInRole) {
      console.warn("Login já está em progresso. Aguarde ou tente novamente em instantes.");
      return;
    }
    
    setLoggingInRole(loginType || role);
    setAuthError(null);
    
    // Safety net: limpa o estado de carregamento após 45 segundos se nada acontecer
    const safetyTimeout = setTimeout(() => {
      setLoggingInRole(null);
    }, 45000);

    try {
      const firebaseUser = await loginWithGoogle();
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoggingInRole(null);
          return;
        }
        
        let profile: UserProfile;
        if (userDoc.exists()) {
          profile = userDoc.data() as UserProfile;
        } else {
          const isSuperAdmin = ['raiza3983@gmail.com', 'rz7beats@gmail.com'].includes(firebaseUser.email || '');
          profile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: role,
            isApprovedAdmin: isSuperAdmin ? true : false
          };
          try {
            await setDoc(userDocRef, profile);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
            setLoggingInRole(null);
            return;
          }
        }
        setUser(profile);
        
        if (profile.role === 'state_admin' || profile.role === 'admin') {
          if (profile.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com'].includes(profile.email)) {
            setCurrentScreen('admin-dashboard');
          } else {
            setCurrentScreen('pending-approval');
          }
        } else if (profile.role === 'vendor') {
          setCurrentScreen('shop-management');
        } else {
          setCurrentScreen('search');
        }
      }
      clearTimeout(safetyTimeout);
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed", error);
      }
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login cancelado pelo usuário ou requisição duplicada.");
      } else if (error.code === 'auth/popup-blocked') {
        setAuthError('popup-blocked');
        showNotification('O navegador bloqueou o popup de login. Por favor, permita popups ou abra o app em uma nova aba.', 'error');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('unauthorized-domain');
        showNotification('Este domínio não está autorizado no Firebase. Por favor, adicione este domínio nas configurações de Autenticação do Console do Firebase.', 'error');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('network-error');
        showNotification('Erro de comunicação. Isso geralmente ocorre devido a bloqueio de cookies de terceiros ou se o domínio não estiver autorizado no Firebase Console. Tente abrir em uma nova aba.', 'error');
        console.error("DICA: Certifique-se de adicionar os domínios .run.app à lista de 'Domínios Autorizados' no Console do Firebase (Autenticação > Configurações).");
      } else if (error.message?.includes('INTERNAL ASSERTION FAILED') || error.code === 'auth/internal-error') {
        setAuthError('internal-error');
        showNotification('Erro interno do Firebase. Por favor, recarregue a página ou abra o aplicativo em uma nova aba para fazer login.', 'error');
      } else {
        setAuthError(error.code || 'unknown');
        showNotification(`Erro ao fazer login (${error.code || 'erro desconhecido'}). Tente novamente ou abra em uma nova aba.`, 'error');
      }
    } finally {
      setLoggingInRole(null);
    }
  };

  const handleLogout = async () => {
    showConfirm(
      'Sair da Conta',
      'Deseja realmente encerrar sua sessão atual?',
      async () => {
        await logout();
        setUser(null);
        setCurrentScreen('landing');
        showNotification('Sessão encerrada com sucesso.');
      }
    );
  };

  const toggleFavorite = async (shopId: string) => {
    if (!user) return showNotification('Faça login para salvar favoritos.', 'error');
    
    const currentFavorites = user.favorites || [];
    const isFavorite = currentFavorites.includes(shopId);
    const newFavorites = isFavorite 
      ? currentFavorites.filter(id => id !== shopId)
      : [...currentFavorites, shopId];
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: newFavorites
      });
      setUser({ ...user, favorites: newFavorites });
      showNotification(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Helper Component for Product Cards was moved out of App context for stability

    const ShopDetailScreen = ({ shop, user, cart, setCart, showNotification, onNavigate, config, sharedAddToCart, sharedRemoveFromCart }: { shop: Shop | null, user: UserProfile | null, cart: any, setCart: any, showNotification: (m: string, t?: 'success' | 'error') => void, onNavigate: (screen: Screen) => void, config: AppConfig | null, sharedAddToCart: (p: Product, sId: string, sName: string) => void, sharedRemoveFromCart: (p: Product) => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCalculator, setShowCalculator] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const [paymentMethod, setPaymentMethod] = useState(cart?.shopId === shop?.id ? (cart?.paymentMethod || '') : '');
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(cart?.shopId === shop?.id ? (cart?.deliveryType || 'pickup') : 'pickup');
    const [deliveryAddress, setDeliveryAddress] = useState(cart?.shopId === shop?.id ? (cart?.deliveryAddress || user?.address || '') : (user?.address || ''));
    const [buyerCity, setBuyerCity] = useState(cart?.shopId === shop?.id ? (cart?.buyerCity || user?.city || '') : (user?.city || ''));
    const [buyerState, setBuyerState] = useState(cart?.shopId === shop?.id ? (cart?.buyerState || user?.state || '') : (user?.state || ''));
    const [buyerPhone, setBuyerPhone] = useState(cart?.shopId === shop?.id ? (cart?.buyerPhone || user?.phone || '') : (user?.phone || ''));
    const [buyerFullName, setBuyerFullName] = useState(cart?.shopId === shop?.id ? (cart?.buyerFullName || user?.displayName || '') : (user?.displayName || ''));
    const [buyerAge, setBuyerAge] = useState(cart?.shopId === shop?.id ? (cart?.buyerAge || '') : '');
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
      if (cart && shop && cart.shopId === shop.id) {
        const hasChanged = 
          cart.paymentMethod !== paymentMethod ||
          cart.deliveryType !== deliveryType ||
          cart.deliveryAddress !== deliveryAddress ||
          cart.buyerCity !== buyerCity ||
          cart.buyerState !== buyerState ||
          cart.buyerPhone !== buyerPhone ||
          cart.buyerFullName !== buyerFullName ||
          cart.buyerAge !== buyerAge;

        if (hasChanged) {
          setCart({
            ...cart,
            paymentMethod,
            deliveryType,
            deliveryAddress,
            buyerCity,
            buyerState,
            buyerPhone,
            buyerFullName,
            buyerAge
          });
        }
      }
    }, [paymentMethod, deliveryType, deliveryAddress, buyerCity, buyerState, buyerPhone, buyerFullName, buyerAge, cart, shop, setCart]);

    useEffect(() => {
      if (!user || !shop) return;
      const q = query(
        collection(db, 'orders'),
        where('buyerUid', '==', user.uid),
        where('shopId', '==', shop.id),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMyOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
      return () => unsubscribe();
    }, [user, shop]);

    useEffect(() => {
      if (!shop) return;
      
      const productsQuery = query(collection(db, 'shops', shop.id, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // ✅ MERGE INTELIGENTE (EVITA PISCAR / RESET)
        // Mantém as alterações de estoque locais feitas pelo usuário
        setProducts(prev => {
          if (!prev || prev.length === 0) return list;

          return list.map(newProduct => {
            const existing = prev.find(p => p.id === newProduct.id);

            // Se o produto já existe na tela, mantemos o estoque local (que pode ter sido decrementado)
            // mas atualizamos outros dados vindos do servidor
            return existing
              ? { ...newProduct, stock: existing.stock }
              : newProduct;
          });
        });

        setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${shop.id}/products`));

      return () => {
        unsubscribeProducts();
      };
    }, [shop]);

    const addToCart = (product: Product) => {
      if (!shop) return;
      
      // Validação de estoque local (para feedback instantâneo)
      if (product.stock <= 0) {
        showNotification(`Desculpe, o produto ${product.name} acabou no momento.`, 'error');
        return;
      }

      // Verifica se já atingiu o máximo baseado no carrinho atual
      const inCart = cart?.items.find((i: any) => i.product.id === product.id);
      const currentQty = inCart ? inCart.quantity : 0;
      if (currentQty >= product.stock) {
        showNotification(`Estoque máximo atingido para ${product.name}.`, 'error');
        return;
      }

      if (cart && cart.shopId !== shop.id) {
        showConfirm(
          'Limpar Carrinho?',
          'Você já possui itens de outra loja. Deseja limpar o pedido atual para adicionar produtos desta loja?',
          () => {
            setTimeout(() => {
              setCart({
                shopId: shop.id,
                shopName: shop.name,
                items: [{ product, quantity: 1 }]
              });
              
              // Atualização otimista do estoque local (instantânea)
              setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, stock: p.stock - 1 } : p
              ));
              
              showNotification('os itens estão na lista de pedidos', 'success');
            }, 300);
          }
        );
        return;
      }

      // 1. Atualiza o Carrinho (Global)
      setCart((prev: any) => {
        if (!prev) {
          showNotification('Item adicionado ao seu pedido', 'success');
          return { shopId: shop.id, shopName: shop.name, items: [{ product, quantity: 1 }] };
        }
        const existing = prev.items.find((item: any) => item.product.id === product.id);
        
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((item: any) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
          };
        }
        showNotification('Item adicionado ao seu pedido', 'success');
        return { ...prev, items: [...prev.items, { product, quantity: 1 }] };
      });

      // 2. ATUALIZAÇÃO OTIMISTA: Decrementa o estoque local imediatamente
      // Sem re-notificação redundante para não interromper o flluxo do usuário
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      ));
    };

    const removeFromCart = (product: Product) => {
      setCart((prev: any) => {
        if (!prev) return null;
        const existing = prev.items.find((item: any) => item.product.id === product.id);
        
        if (existing) {
          if (existing.quantity === 1) {
            const newItems = prev.items.filter((item: any) => item.product.id !== product.id);
            if (newItems.length === 0) return null;
            return { ...prev, items: newItems };
          }
          return {
            ...prev,
            items: prev.items.map((item: any) => item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item)
          };
        }
        return prev;
      });

      // Atualização otimista: Devolve ao estoque local
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, stock: p.stock + 1 } : p
      ));
    };

    const handleCheckout = async () => {
      if (!user) {
        showNotification('Você precisa estar logado para fazer um pedido.', 'error');
        return;
      }
      if (!shop || !cart || cart.items.length === 0) return;

      setIsCheckingOut(true);
      try {
        if (!paymentMethod) {
          showNotification('Selecione um método de pagamento.', 'error');
          setIsCheckingOut(false);
          return;
        }
        if (deliveryType === 'delivery' && (!deliveryAddress || !buyerCity || !buyerState)) {
          showNotification('Informe o endereço completo para entrega.', 'error');
          setIsCheckingOut(false);
          return;
        }
        if (!buyerPhone) {
          showNotification('Informe um telefone para contato.', 'error');
          setIsCheckingOut(false);
          return;
        }

        // Final stock check before checkout
        for (const item of cart.items) {
          const currentProduct = products.find(p => p.id === item.product.id);
          if (currentProduct && item.quantity > currentProduct.stock) {
            showNotification(`O estoque de ${item.product.name} mudou. Temos apenas ${currentProduct.stock} unidades disponíveis.`, 'error');
            setIsCheckingOut(false);
            return;
          }
        }

        if (!buyerFullName || !buyerAge) {
          showNotification('Informe seu nome completo e idade.', 'error');
          setIsCheckingOut(false);
          return;
        }

        const totalValue = cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        
        // Create the order
        const orderRef = await addDoc(collection(db, 'orders'), {
          shopId: shop.id,
          shopName: shop.name,
          shopOwnerUid: shop.ownerUid,
          buyerUid: user.uid,
          buyerName: buyerFullName,
          buyerAge: parseInt(buyerAge),
          buyerPhotoURL: user.photoURL,
          buyerPhone,
          items: cart.items.map((item: any) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          totalValue,
          status: 'pending_payment',
          paymentMethod,
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : 'Retirada na Loja',
          buyerCity: buyerCity,
          buyerState: buyerState,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Update user profile if missing info
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: buyerFullName,
          address: deliveryAddress || user.address || '',
          phone: buyerPhone || user.phone || '',
          city: buyerCity || user.city || '',
          state: buyerState || user.state || '',
          age: buyerAge || user.age || ''
        });

        // Automatic Bot Message
        const orderSummary = cart.items.map((item: any) => `${item.quantity}x ${item.product.name}`).join(', ');
        await addDoc(collection(db, 'chatMessages'), {
          senderUid: user.uid,
          senderName: user.displayName,
          senderPhotoURL: user.photoURL,
          receiverUid: shop.ownerUid,
          text: `[NOVO PEDIDO ${orderRef.id.slice(-6)}]\nOlá! Acabei de fazer um pedido de: ${orderSummary}.\nTotal: R$ ${totalValue.toFixed(2)}\nPagamento: ${paymentMethod}\nEntrega: ${deliveryType === 'delivery' ? `Sim, no endereço: ${deliveryAddress}, ${buyerState}. ${buyerCity}. Brasil.` : 'Retirada na loja'}\nContato: ${buyerPhone}`,
          shopName: shop.name,
          metadata: {
            shopId: shop.id,
            shopName: shop.name,
            shopOwnerUid: shop.ownerUid,
            orderId: orderRef.id
          },
          createdAt: Timestamp.now()
        });

        showNotification('Pedido enviado com sucesso! Redirecionando...', 'success');
        
        // Mensagem de aviso de pagamento pendente em Português
        setTimeout(() => {
          showNotification('Aguardando confirmação de pagamento para processar seu pedido.', 'success');
        }, 3000);
        
        // Modern delay for better UX
        setTimeout(() => {
          setCart(null);
          setIsCheckingOut(false);
          onNavigate('orders');
        }, 1500);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'orders');
        setIsCheckingOut(false);
      }
    };

    if (!shop) return null;

    return (
      <div className="min-h-screen bg-white pb-32 font-sans overflow-x-hidden">
        {/* Modern Shop Detail Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <button 
              onClick={() => onNavigate('search')} 
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Voltar para o Mercado</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              {/* Lateral Large Photo */}
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200"
              >
                {shop.photoURL ? (
                  <img 
                    src={shop.photoURL} 
                    className="w-full h-full object-cover" 
                    alt={shop.name} 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Store size={120} strokeWidth={0.5} />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-8 left-8 px-6 py-2 bg-white/90 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      shop.isOpen ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {shop.isOpen ? 'Aberto Agora' : 'Fechado no Momento'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Shop Info & Actions */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 italic">
                      {shop.type}
                    </span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.address}, ${shop.city} - ${shop.state}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-2 group/map"
                    >
                      <span className="text-slate-300 font-serif italic group-hover/map:underline lowercase">
                        {shop.state}. {shop.city}. Brasil. {shop.address} {shop.reference && ` (${shop.reference})`}
                      </span>
                      <ExternalLink size={12} className="opacity-0 group-hover/map:opacity-100" />
                    </a>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-serif italic text-slate-900 tracking-tighter leading-none lowercase">
                    {shop.name}
                  </h2>
                  <p className="text-xl text-slate-500 font-medium italic leading-relaxed max-w-xl">
                    {shop.description || 'Os melhores produtos da região, selecionados com carinho para a sua mesa.'}
                  </p>
                </div>

                  <div className="flex flex-wrap gap-8 text-slate-400 font-medium italic lowercase">
                    <span className="flex items-center gap-3">
                      <MapPin size={20} className="text-brand-500" />
                      {shop.state}. {shop.city}. Brasil.
                    </span>
                  <span className="flex items-center gap-3">
                    <Clock size={20} className="text-brand-500" />
                    {shop.isOpen ? `Aberto até ${shop.closingHours}` : `Abre às ${shop.openingHours}`}
                  </span>
                  {shop.workingDays && shop.workingDays.length > 0 && (
                    <span className="flex items-center gap-3">
                      <CalendarIcon size={20} className="text-brand-500" />
                      {shop.workingDays.join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setSelectedChat(shop.ownerUid);
                      onNavigate('chats');
                    }}
                    className="flex-1 min-w-[200px] h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center gap-4 hover:bg-brand-600 transition-all duration-500 shadow-xl shadow-slate-900/10 group active:scale-95"
                  >
                    <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Conversar agora</span>
                  </button>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => toggleFavorite(shop.id)}
                      className={cn(
                        "w-20 h-20 flex items-center justify-center rounded-[24px] border-2 transition-all duration-500 active:scale-95",
                        user?.favorites?.includes(shop.id) 
                          ? "bg-red-50 border-red-100 text-red-500" 
                          : "bg-white border-slate-100 text-slate-300 hover:border-red-500 hover:text-red-500"
                      )}
                    >
                      <Heart size={28} fill={user?.favorites?.includes(shop.id) ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => setShowCalculator(true)}
                      className="w-20 h-20 bg-white border-2 border-slate-100 text-slate-300 hover:border-slate-900 hover:text-slate-900 flex items-center justify-center rounded-[24px] transition-all duration-500 active:scale-95"
                    >
                      <Calculator size={28} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
            <div className="lg:col-span-2 space-y-24">
        {/* Catalogue Listing */}
        <div className="space-y-16">

            {showCalculator ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 rounded-sm p-12 md:p-20 border border-slate-100"
              >
                <CalculatorScreen config={config} onBack={() => setShowCalculator(false)} user={user} />
              </motion.div>
            ) : (
              <div className="space-y-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-8">
                  <h3 className="text-4xl font-serif italic text-slate-900">Catálogo de Produtos</h3>
                  
                  {/* Category Filter Menu */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        selectedCategory === 'all' 
                          ? "bg-slate-900 text-white shadow-xl" 
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      Todos
                    </button>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          selectedCategory === cat.id 
                            ? "bg-brand-600 text-white shadow-xl" 
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        <span className="text-sm leading-none">{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                {loading && products.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {products
                      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
                      .map(product => (
                        <ProductCard 
                          key={product.id}
                          product={product}
                          user={user}
                          shop={shop!}
                          cart={cart}
                          addToCart={(p) => sharedAddToCart(p, shop!.id, shop!.name)}
                          removeFromCart={sharedRemoveFromCart}
                          onNavigate={onNavigate}
                          showNotification={showNotification}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

              {/* Immersive Contact Banner */}
              <div className="pt-48">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-900 rounded-[64px] p-20 md:p-32 text-center relative overflow-hidden shadow-2xl shadow-slate-900/40 group"
                >
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={shop.photoURL || 'https://picsum.photos/seed/bg/1200/600'} 
                      className="w-full h-full object-cover opacity-20 filter grayscale scale-110 group-hover:scale-100 transition-transform duration-[10s]" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                  </div>
                  <div className="relative z-10 space-y-12">
                    <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40">
                      <MessageSquare size={40} className="text-white" />
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-6xl md:text-8xl font-serif italic text-white leading-[0.8] tracking-tighter lowercase">"Gostou? Leva logo, tá acabando!"</h4>
                      <p className="text-slate-400 text-lg italic font-serif max-w-xl mx-auto">Chama a gente pra negociar aquele precinho camarada ou montar seu carrinho personalizado.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!user) {
                          showNotification('Faça login para enviar mensagens.', 'error');
                          return;
                        }
                        try {
                          await addDoc(collection(db, 'chatMessages'), {
                            senderUid: user.uid,
                            senderName: user.displayName,
                            senderPhotoURL: user.photoURL,
                            receiverUid: shop.ownerUid,
                            text: `Olá! "Ô de casa", tô na sua banca e quero saber mais sobre os produtos!`,
                            shopName: shop.name,
                            metadata: { shopId: shop.id, shopName: shop.name, shopOwnerUid: shop.ownerUid },
                            createdAt: Timestamp.now()
                          });
                          showNotification('Solicitação enviada! O feirante já responde.', 'success');
                          onNavigate('chats');
                        } catch (err) {
                          showNotification('Erro ao iniciar atendimento.', 'error');
                        }
                      }}
                      className="inline-block px-20 py-8 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl"
                    >
                      Chamar Feirante
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Catalogue Cart Sidebar */}
            <div className="lg:col-span-1 border-l border-slate-100 pl-12 hidden lg:block">
              <div className="sticky top-32 space-y-16">
                <div className="space-y-10">
                  <div className="flex items-end justify-between">
                    <h4 className="text-3xl font-serif italic text-slate-900">Meu Pedido</h4>
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                      {cart?.items.length || 0} ITENS
                    </span>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-8 max-h-[45vh] overflow-y-auto pr-4 scrollbar-hide">
                      {cart?.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-6 group">
                          <div className="w-20 h-24 bg-slate-50 rounded-sm overflow-hidden flex-shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                            <img src={item.product.photoURL || 'https://picsum.photos/seed/p/200'} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 py-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight">{item.product.name}</p>
                                <button 
                                  onClick={() => setCart({ ...cart, items: cart.items.filter((_: any, i: number) => i !== idx) })}
                                  className="text-slate-200 hover:text-red-500 transition-colors ml-2"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{item.quantity}x • R$ {(item.product?.price || 0).toFixed(2)}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-900">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      {(!cart || cart.items.length === 0) && (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShoppingCart size={20} className="text-slate-200" />
                          </div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Catálogo de Compras Vazio</p>
                        </div>
                      )}
                    </div>

                    {cart && cart.items.length > 0 && (
                      <div id="checkout-form" className="space-y-12 pt-12 border-t border-slate-100 animate-in fade-in duration-700">
                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Preferencia de Entrega</p>
                          <div className="flex gap-1 p-1 bg-slate-50 rounded-sm">
                            <button 
                              onClick={() => setDeliveryType('pickup')}
                              className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                deliveryType === 'pickup' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                              )}
                            >
                              Retirada
                            </button>
                            <button 
                              onClick={() => setDeliveryType('delivery')}
                              disabled={!shop.acceptsDelivery}
                              className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30",
                                deliveryType === 'delivery' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                              )}
                            >
                              Entrega
                            </button>
                          </div>
                        </div>

                        {deliveryType === 'delivery' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-6 border-l-2 border-brand-100 pl-6">
                              <input 
                                type="text" 
                                placeholder="Endereço Completo" 
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full py-2 bg-transparent border-b border-slate-100 text-xs font-bold placeholder:text-slate-300 focus:border-brand-500 outline-none transition-all uppercase tracking-wider"
                              />
                              <div className="grid grid-cols-2 gap-6">
                                <input 
                                  type="text" 
                                  placeholder="Cidade" 
                                  value={buyerCity}
                                  onChange={(e) => setBuyerCity(e.target.value)}
                                  className="w-full py-2 bg-transparent border-b border-slate-100 text-xs font-bold placeholder:text-slate-300 focus:border-brand-500 outline-none transition-all uppercase"
                                />
                                <select 
                                  value={buyerState}
                                  onChange={(e) => setBuyerState(e.target.value)}
                                  className="w-full py-2 bg-transparent border-b border-slate-100 text-xs font-bold focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">UF</option>
                                  {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Seus Dados & Pagamento</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              type="text" 
                              placeholder="Nome Completo" 
                              value={buyerFullName}
                              onChange={(e) => setBuyerFullName(e.target.value)}
                              className="w-full py-3 px-4 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-500 transition-all text-center placeholder:text-slate-300"
                            />
                            <input 
                              type="number" 
                              placeholder="Idade" 
                              value={buyerAge}
                              onChange={(e) => setBuyerAge(e.target.value)}
                              className="w-full py-3 px-4 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-500 transition-all text-center placeholder:text-slate-300"
                            />
                          </div>
                          <input 
                            type="tel" 
                            placeholder="WhatsApp / Telefone (00) 00000-0000" 
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            className="w-full py-3 px-4 bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-500 transition-all text-center placeholder:text-slate-300"
                          />
                          
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">Escolha a Forma de Pagamento</p>
                            <div className="grid grid-cols-2 gap-3">
                              {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map(m => (
                                <button
                                  key={m}
                                  onClick={() => setPaymentMethod(m)}
                                  className={cn(
                                    "py-3 px-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    paymentMethod === m 
                                      ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                  )}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-tight">Valor de<br />Investimento</span>
                            <span className="text-4xl font-serif italic text-slate-900 font-bold tracking-tight">
                              R$ {cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                            </span>
                          </div>

                          <button 
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-600 transition-all disabled:opacity-50 shadow-2xl active:scale-[0.98] duration-500"
                          >
                            {isCheckingOut ? 'Finalizando...' : 'Concluir Pedido'}
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
};

const SearchScreen = ({ 
  config, 
  onNavigate, 
  user, 
  onToggleFavorite,
  selectedCategory,
  setSelectedCategory,
  cart,
  setCart,
  activeView,
  setActiveView,
  showNotification,
  showConfirm,
  setSelectedShop,
  setShowPermissionModal,
  sharedAddToCart,
  sharedRemoveFromCart
}: { 
  config: AppConfig | null, 
  onNavigate: (screen: Screen) => void, 
  user: UserProfile | null, 
  onToggleFavorite: (id: string) => void,
  selectedCategory: string,
  setSelectedCategory: (c: string) => void,
  cart: any,
  setCart: any,
  activeView: 'shops' | 'products',
  setActiveView: (v: 'shops' | 'products') => void,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  setSelectedShop: (s: Shop) => void,
  setShowPermissionModal: (v: boolean) => void,
  sharedAddToCart: (p: Product, sId: string, sName: string) => void,
  sharedRemoveFromCart: (p: Product) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const shopsQuery = query(collection(db, 'shops'), where('isApproved', '==', true));
    const unsubscribeShops = onSnapshot(shopsQuery, (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'search-shops'));

    const productsQuery = query(collectionGroup(db, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'search-products'));

    return () => {
      unsubscribeShops();
      unsubscribeProducts();
    };
  }, [user]);

  if (!user) return <LoginRequiredView onNavigate={onNavigate} />;
  const filteredShops = shops.filter(shop => {
    // 🚚 EXCLUSIVA: Não incluir atacado na busca geral (apenas na aba Atacado)
    if (shop.type === 'atacado') return false;

    const shopMatches = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       shop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       shop.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const shopProducts = products.filter(p => p.shopId === shop.id);
    const productMatches = shopProducts.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesSearch = shopMatches || productMatches;
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || 
      products.some(p => p.shopId === shop.id && p.category === selectedCategory);
    return matchesSearch && matchesState && matchesCategory;
  });

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    if (!shop) return false;
    
    // 🚚 EXCLUSIVA: Não incluir produtos de atacado na busca geral
    if (shop.type === 'atacado') return false;

    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <PageContainer screen="search" config={config}>
          <div key="search-header" className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-7xl md:text-9xl font-light text-slate-900 font-serif italic tracking-tighter leading-[0.8] mb-2 uppercase">
                FEIRA LIVRE DIGITAL 🇧🇷
              </h2>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-2 rounded-full flex items-center shadow-lg shadow-slate-200/50">
              <div className="px-6 py-3 border-r border-slate-100 hidden md:block">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-1">Total de</p>
                <p className="text-xl font-serif italic text-slate-900 leading-none">{shops.length} Lojas</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-1">Localização</p>
                <p className="text-xl font-serif italic text-slate-900 leading-none">{selectedState === 'all' ? 'Todo Brasil' : selectedState}</p>
              </div>
            </div>
          </div>

          <div key="sticky-controls" className="sticky top-4 z-40 mb-20">
            <div className="bg-slate-900 p-4 md:p-6 rounded-[32px] shadow-2xl shadow-slate-900/20 border border-slate-800">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Encontre sabores únicos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white text-lg font-medium outline-none focus:border-brand-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex gap-4">
                  <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-8 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 outline-none hover:border-slate-600 transition-all appearance-none cursor-pointer text-center"
                  >
                    <option value="all">Sua Região</option>
                    {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-8 py-4 bg-brand-500 border border-brand-400 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white outline-none hover:bg-brand-600 transition-all appearance-none cursor-pointer text-center shadow-lg shadow-brand-500/20"
                  >
                    <option value="all">Categorias</option>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div key="view-tabs" className="flex gap-4 mb-20 -mt-10">
            <button 
              onClick={() => setActiveView('shops')}
              className={cn(
                "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3",
                activeView === 'shops' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
              )}
            >
              <Store size={18} /> Lojas
            </button>
            <button 
              onClick={() => setActiveView('products')}
              className={cn(
                "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3",
                activeView === 'products' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
              )}
            >
              <Package size={18} /> Produtos
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-48 text-slate-300">
              <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mb-6" />
              <p className="font-black uppercase tracking-[0.4em] text-[10px]">Aguarde um momento...</p>
            </div>
          ) : activeView === 'products' ? (
            <div className="flex flex-col gap-6">
              {filteredProducts.map((product, idx) => {
                const shop = shops.find(s => s.id === product.shopId);
                const itemInCart = cart?.items.find((i: any) => i.product.id === product.id);
                const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                
                return (
                  <motion.div 
                    key={`${product.shopId}-${product.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={cn(
                      "rounded-[24px] border transition-all duration-500 relative flex items-center p-2 gap-3",
                      quantityInCart > 0 
                        ? "bg-brand-50/30 border-brand-100 shadow-sm" 
                        : "bg-white border-slate-100 hover:shadow-md"
                    )}
                  >
                    {/* Compact Photo */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 relative shadow-inner">
                      <img 
                        src={product.photoURL || 'https://picsum.photos/seed/product/400/400'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[6px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Esgotado</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5 py-1">
                      <div className="flex items-center justify-between pr-2">
                        <button 
                          onClick={() => shop && (setSelectedShop(shop), onNavigate('shop-detail'))}
                          className="text-[8px] font-black uppercase tracking-widest text-brand-600 hover:underline block truncate max-w-[120px]"
                        >
                           {shop?.name || 'Localizando...'}
                        </button>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ESTOQUE: {product.stock - quantityInCart}</span>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-900 truncate leading-none">{product.name}</h4>
                      
                      {product.description && (
                        <p className="text-[9px] text-slate-500 font-medium line-clamp-1 italic">
                          {product.description}
                        </p>
                      )}

                      {shop && (
                        <div className="flex items-center gap-1 text-slate-400 py-0.5">
                          <MapPin size={10} className="text-brand-500 flex-shrink-0" />
                          <span className="text-[8px] font-bold uppercase tracking-tight truncate">
                            {shop.address}. {shop.city}. {shop.state}. Brasil.
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 font-display">R$ {(product.price || 0).toFixed(2)}</span>
                        <div className="flex items-center gap-1.5">
                          {product.unit && (
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">/ {translateUnit(product.unit)}</span>
                          )}
                          {product.weightPerUnit > 0 && (
                            <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest bg-brand-50 px-1.5 py-0.5 rounded-md border border-brand-100">
                              {product.weightPerUnit}{product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                      {/* Compact Productivity Controls */}
                    <div className="flex items-center gap-2">
                      {quantityInCart > 0 ? (
                        <div className="flex items-center bg-slate-900 rounded-2xl p-1 shadow-xl">
                          <button 
                            onClick={(e) => { e.stopPropagation(); sharedRemoveFromCart(product); }}
                            className="w-9 h-9 flex items-center justify-center text-white hover:text-red-400 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-black text-white text-xs">{quantityInCart}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); shop && sharedAddToCart(product, shop.id, shop.name); }}
                            disabled={product.stock <= quantityInCart}
                            className="w-9 h-9 flex items-center justify-center text-white hover:text-brand-400 transition-colors disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          disabled={product.stock <= 0}
                          onClick={(e) => { e.stopPropagation(); shop && sharedAddToCart(product, shop.id, shop.name); }}
                          className="w-12 h-12 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 hover:bg-brand-600 hover:border-brand-500 transition-all flex items-center justify-center disabled:opacity-30 active:scale-90"
                          title="Adicionar ao Carrinho"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => shop && (setSelectedShop(shop), onNavigate('shop-detail'))}
                        className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95"
                        title="Ver Catálogo"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div key="empty-products" className="py-32 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-serif italic text-slate-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-slate-400 text-xs italic">Tente mudar sua busca ou filtros.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {filteredShops.map((shop, idx) => (
                <motion.div 
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                  className="group cursor-pointer flex items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                  onClick={() => {
                    setSelectedShop(shop);
                    onNavigate('shop-detail');
                  }}
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-[28px] overflow-hidden relative flex-shrink-0 shadow-lg group-hover:shadow-brand-500/10 group-hover:scale-105 transition-all duration-700">
                    <img 
                      src={shop.photoURL || 'https://picsum.photos/seed/shop/400/400'} 
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand-50 rounded-lg text-brand-600">
                           <Store size={12} />
                        </div>
                        <div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-100">
                          {shop.type}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(shop.id);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border active:scale-95",
                          user?.favorites?.includes(shop.id) 
                            ? "bg-red-500 text-white border-red-400 shadow-md" 
                            : "bg-slate-50 text-slate-300 border-slate-100 hover:text-red-500 hover:bg-red-50"
                        )}
                      >
                        <Heart size={16} fill={user?.favorites?.includes(shop.id) ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-3xl font-serif italic text-slate-900 group-hover:text-brand-600 transition-colors tracking-tight truncate">
                        {shop.name}
                      </h4>
                      <p className="text-slate-400 text-xs font-medium italic truncate">
                         {shop.state}. {shop.city}. Brasil. {shop.address}.
                      </p>
                    </div>
                    
                    {/* Catalog products preview / Found products */}
                    <div className="space-y-2">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Catálogo de Produtos</p>
                       <div className="flex gap-2 overflow-hidden py-1">
                        {products
                          .filter(p => p.shopId === shop.id)
                          .slice(0, 4)
                          .map(p => (
                            <div key={p.id} className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:border-brand-200 transition-colors relative">
                               <img src={p.photoURL || 'https://picsum.photos/seed/prod/100'} className="w-full h-full object-cover" alt="" />
                               {searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                 <div className="absolute inset-0 bg-brand-500/20 ring-2 ring-brand-500 ring-inset" />
                               )}
                            </div>
                          ))}
                        {products.filter(p => p.shopId === shop.id).length > 4 && (
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                            +{products.filter(p => p.shopId === shop.id).length - 4}
                          </div>
                        )}
                      </div>
                      
                      {searchTerm && products
                        .filter(p => p.shopId === shop.id && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .slice(0, 1)
                        .map(p => (
                          <p key={p.id} className="text-[10px] font-medium italic text-brand-600">
                            Encontrado: <span className="font-bold">{p.name}</span>
                          </p>
                        ))
                      }
                    </div>

                    <p className="text-slate-500 text-sm font-medium italic line-clamp-1 leading-relaxed hidden md:block">
                       {shop.description || 'Sabores artesanais e produtos selecionados direto do produtor.'}
                    </p>

                    <div className="flex items-center gap-2 text-brand-500 font-black text-[9px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                      Catálogo de Produtos <ArrowRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredShops.length === 0 && (
                <div key="empty-shops" className="col-span-full py-48 text-center bg-white rounded-[64px] border border-dashed border-slate-200">
                  <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10">
                    <Search size={48} className="text-slate-200" />
                  </div>
                  <h3 className="text-3xl font-serif italic text-slate-900 mb-4">Nenhum tesouro encontrado</h3>
                  <p className="text-slate-400 italic max-w-sm mx-auto">Tente ajustar seus filtros ou explorar outras regiões em busca de descobertas únicas.</p>
                </div>
              )}
            </div>
          )}
        </PageContainer>
      </div>
    </div>
  );
};

const WholesaleScreen = ({ 
  config, 
  onNavigate, 
  user,
  selectedCategory,
  setSelectedCategory,
  cart,
  setCart,
  activeView,
  setActiveView,
  showNotification,
  showConfirm,
  setSelectedShop,
  setShowPermissionModal,
  sharedAddToCart,
  sharedRemoveFromCart
}: { 
  config: AppConfig | null, 
  onNavigate: (screen: Screen) => void, 
  user: UserProfile | null,
  selectedCategory: string,
  setSelectedCategory: (c: string) => void,
  cart: any,
  setCart: any,
  activeView: 'shops' | 'products',
  setActiveView: (v: 'shops' | 'products') => void,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  setSelectedShop: (s: Shop) => void,
  setShowPermissionModal: (v: boolean) => void,
  sharedAddToCart: (p: Product, sId: string, sName: string) => void,
  sharedRemoveFromCart: (p: Product) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches] = useState(['Frutas no Atacado', 'Legumes Frescos', 'Sacos de Arroz', 'Feijão Granel']);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const shopsQuery = query(
      collection(db, 'shops'), 
      where('isApproved', '==', true),
      where('type', '==', 'atacado')
    );
    const unsubscribeShops = onSnapshot(shopsQuery, (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));

    const productsQuery = query(collectionGroup(db, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    return () => {
      unsubscribeShops();
      unsubscribeProducts();
    };
  }, [user]);

  if (!user) return <LoginRequiredView onNavigate={onNavigate} />;
  const filteredShops = shops.filter(shop => {
    const shopMatches = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       shop.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if any product in this shop matches the search term
    const shopProducts = products.filter(p => p.shopId === shop.id);
    const productMatches = shopProducts.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesSearch = shopMatches || productMatches;
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || 
      products.some(p => p.shopId === shop.id && p.category === selectedCategory);
    return matchesSearch && matchesState && matchesCategory;
  });

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    if (!shop || shop.type !== 'atacado') return false;
    
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32 min-h-screen bg-white">
      <PageContainer screen="wholesale" config={config}>
        <div className="mb-12">
          <h2 className="text-5xl font-light text-slate-900 font-serif italic tracking-tight mb-2 uppercase">ATACADO DIGITAL 🇧🇷</h2>
          <p className="text-slate-500 font-medium ml-1">Fornecedores premium para grandes volumes e logística profissional.</p>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Negócios Estratégicos</p>
                <p className="text-sm font-bold text-slate-900">Preços e condições exclusivas direto do campo</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest w-full mb-1">Buscas Recentes</span>
              {recentSearches.map(s => (
                <button 
                  key={s}
                  onClick={() => setSearchTerm(s)}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-brand-300 hover:text-brand-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar fornecedores e produtos no atacado..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
            <div className="relative">
              <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full pl-14 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 outline-none appearance-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Todos os Estados</option>
                {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-20 -mt-10">
          <button 
            onClick={() => setActiveView('shops')}
            className={cn(
              "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3",
              activeView === 'shops' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
            )}
          >
            <Store size={18} /> Lojas
          </button>
          <button 
            onClick={() => setActiveView('products')}
            className={cn(
              "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3",
              activeView === 'products' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
            )}
          >
            <Package size={18} /> Produtos
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Carregando fornecedores...</p>
          </div>
        ) : activeView === 'products' ? (
          <div className="flex flex-col gap-6">
            {filteredProducts.map((product, idx) => {
              const shop = shops.find(s => s.id === product.shopId);
              const itemInCart = cart?.items.find((i: any) => i.product.id === product.id);
              const quantityInCart = itemInCart ? itemInCart.quantity : 0;
              
              return (
                <motion.div 
                  key={`${product.shopId}-${product.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl border border-slate-100 p-1.5 md:p-2 flex items-center gap-2 group hover:shadow-md transition-all duration-500 relative shadow-soft"
                >
                  {/* Tiny Priority Photo */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0 relative shadow-inner">
                    <img 
                      src={product.photoURL || 'https://picsum.photos/seed/product/400/400'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={product.name} 
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[6px] font-black uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap">Sem Estoque</span>
                      </div>
                    )}
                  </div>

                  {/* Information Column */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex flex-col">
                      <button 
                        onClick={() => shop && (setSelectedShop(shop), onNavigate('shop-detail'))}
                        className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-colors w-fit line-clamp-1"
                      >
                         {shop?.name || 'Carregando...'}
                      </button>
                    </div>
                    
                    <h4 className="text-sm md:text-base font-black text-slate-900 line-clamp-1 leading-none">{product.name}</h4>
                    
                    {product.description && (
                      <p className="text-[9px] text-slate-500 font-medium line-clamp-1 italic mt-0.5">
                        {product.description}
                      </p>
                    )}
                    
                    {shop && (
                      <div className="flex items-center gap-1 text-slate-400 mt-1">
                        <MapPin size={10} className="text-blue-500 flex-shrink-0" />
                        <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-tight line-clamp-1">
                         {shop.address}. {shop.city}. {shop.state}. Brasil.
                        </span>
                      </div>
                    )}

                    <div className="pt-4 flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Preço Atacado</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 font-display">R$ {(product.price || 0).toFixed(2)}</span>
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-brand-500 ring-offset-2 rounded-lg transition-all">
                            {product.unit && (
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-md">/ {translateUnit(product.unit)}</span>
                            )}
                            {product.weightPerUnit > 0 && (
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter mb-0.5">Peso/Unidade</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                  {product.weightPerUnit} {product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : (translateUnit(product.unit) || '').toLowerCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estoque disp.</span>
                        <span className="text-sm font-bold text-slate-600">{product.stock - quantityInCart} {(translateUnit(product.unit) || '').toLowerCase()}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col items-end gap-4 pr-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-slate-50 rounded-[24px] p-2 shadow-inner border border-slate-100">
                        <button 
                          onClick={(e) => { e.stopPropagation(); sharedRemoveFromCart(product); }}
                          disabled={quantityInCart === 0}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 border",
                            quantityInCart > 0 
                              ? "bg-white text-slate-900 border-slate-100 hover:text-red-500 shadow-sm" 
                              : "bg-transparent text-slate-200 border-transparent cursor-not-allowed"
                          )}
                        >
                          <Minus size={20} />
                        </button>
                        
                        <div className="w-14 flex flex-col items-center">
                          <span className={cn(
                            "text-xl font-black transition-all",
                            quantityInCart > 0 ? "text-slate-900 scale-110" : "text-slate-300"
                          )}>
                            {quantityInCart}
                          </span>
                          <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none">Qtd</span>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); shop && sharedAddToCart(product, shop.id, shop.name); }}
                          disabled={product.stock <= quantityInCart}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 border",
                            product.stock > quantityInCart
                              ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 hover:bg-brand-600"
                              : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                          )}
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <button 
                        onClick={() => shop && (setSelectedShop(shop), onNavigate('shop-detail'))}
                        className="h-16 w-16 bg-white border border-slate-100 shadow-soft rounded-[24px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                        title="Ver Fornecedor"
                      >
                        <ExternalLink size={24} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[64px] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-serif italic text-slate-900 mb-2">Nenhum produto em atacado encontrado</h3>
                <p className="text-slate-400 text-sm italic">Tente mudar sua busca ou filtros.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map(shop => (
              <motion.div 
                key={shop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden group cursor-pointer"
                onClick={() => {
                  setSelectedShop(shop);
                  onNavigate('shop-detail');
                }}
              >
                <div className="h-48 bg-slate-100 relative">
                  {shop.photoURL ? (
                    <img src={shop.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={shop.name} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <Package size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                    <Package size={12} /> Atacadista
                  </div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl p-1 shadow-xl">
                      {shop.photoURL ? (
                        <img src={shop.photoURL} className="w-full h-full object-cover rounded-xl" alt={shop.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Store size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg font-display leading-none mb-1">{shop.name}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin size={10} /> {shop.state}. {shop.city}. Brasil. {shop.address}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                    {shop.description || 'Fornecedor especializado em vendas no atacado.'}
                  </p>

                  {/* Catalog products preview / Found products */}
                  <div className="space-y-4 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catálogo de Produtos</p>
                    <div className="flex gap-2 overflow-hidden">
                      {products
                        .filter(p => p.shopId === shop.id)
                        .slice(0, 5)
                        .map(p => (
                          <div key={p.id} className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:border-brand-200 transition-colors relative">
                             <img src={p.photoURL || 'https://picsum.photos/seed/prod/100'} className="w-full h-full object-cover" alt="" />
                             {searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                               <div className="absolute inset-0 bg-blue-500/20 ring-2 ring-blue-500 ring-inset" />
                             )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Grandes volumes</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="text-xs font-black">Ver Catálogo</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredShops.length === 0 && (
              <div className="col-span-full py-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                  <Truck size={40} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">Nenhum atacadista encontrado</h3>
                <p className="text-slate-500 font-medium">Tente buscar por outros termos ou estados.</p>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

const OrdersScreen = ({ user, cart, setCart, showNotification, showConfirm, onNavigate, setSelectedChat, setSelectedShop }: { 
  user: UserProfile | null, 
  cart: any,
  setCart: any,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  onNavigate: (screen: Screen) => void,
  setSelectedChat: (uid: string | null) => void,
  setSelectedShop: (shop: Shop | null) => void
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [isFinishingOrder, setIsFinishingOrder] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleFinalizeOrder = async () => {
    if (!user || !cart || cart.items.length === 0) return;
    
    // Validations
    if (!cart.paymentMethod) {
      showNotification('Por favor, escolha uma forma de pagamento.', 'error');
      return;
    }
    if (!cart.deliveryType) {
      showNotification('Por favor, escolha o modo de recebimento.', 'error');
      return;
    }
    if (cart.deliveryType === 'delivery' && !(cart.deliveryAddress || user.address)) {
      showNotification('Por favor, informe seu endereço para entrega.', 'error');
      return;
    }

    setIsFinishingOrder(true);
    try {
      const shop = shops.find(s => s.id === cart.shopId);
      if (!shop) throw new Error("Loja não encontrada");

      const totalValue = cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      const orderSummary = cart.items.map((item: any) => `${item.quantity}x ${item.product.name}`).join(', ');

      const orderData = {
        buyerUid: user.uid,
        buyerName: user.displayName,
        buyerPhotoURL: user.photoURL || '',
        buyerPhone: user.phone || 'Não informado',
        buyerCity: user.city || '',
        buyerState: user.state || '',
        shopId: shop.id,
        shopName: shop.name,
        shopOwnerUid: shop.ownerUid,
        items: cart.items.map((item: any) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit
        })),
        totalValue,
        status: 'pending',
        paymentMethod: cart.paymentMethod,
        deliveryType: cart.deliveryType,
        deliveryAddress: cart.deliveryType === 'delivery' ? (cart.deliveryAddress || user.address) : 'Retirada na Loja',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Automatic Bot Message
      await addDoc(collection(db, 'chatMessages'), {
        senderUid: user.uid,
        senderName: user.displayName,
        senderPhotoURL: user.photoURL,
        receiverUid: shop.ownerUid,
        text: `[NOVO PEDIDO ${orderRef.id.slice(-6)}]\nOlá! Acabei de fazer um pedido pelo Carrinho de: ${orderSummary}.\nTotal: R$ ${totalValue.toFixed(2)}\nPagamento: ${cart.paymentMethod}\nEntrega: ${cart.deliveryType === 'delivery' ? `Sim, no endereço: ${orderData.deliveryAddress}` : 'Retirada na loja'}`,
        shopName: shop.name,
        metadata: {
          shopId: shop.id,
          shopName: shop.name,
          shopOwnerUid: shop.ownerUid,
          orderId: orderRef.id
        },
        createdAt: Timestamp.now()
      });

      showNotification('Pedido finalizado com sucesso!', 'success');
      setCart(null);
      
      // Se for um vendedor testando sua própria loja ou comprando de outra, 
      // pode ser útil ir para a tela de vendas. Caso contrário, permanece em pedidos (histórico).
      if (user.role === 'vendor' && shop.ownerUid === user.uid) {
        onNavigate('sales');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setIsFinishingOrder(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch shops for context
    const shopsQuery = query(collection(db, 'shops'), where('isApproved', '==', true));
    const unsubscribeShops = onSnapshot(shopsQuery, (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));

    const ordersQuery = query(
      collection(db, 'orders'), 
      where('buyerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    return () => {
      unsubscribeShops();
      unsubscribeOrders();
    };
  }, [user]);

  if (!user) return <LoginRequiredView onNavigate={onNavigate} />;

  const handleDeleteOrder = (orderId: string) => {
    showConfirm(
      'Excluir Pedido',
      'Tem certeza que deseja remover este pedido do seu histórico?',
      async () => {
        try {
          await deleteDoc(doc(db, 'orders', orderId));
          showNotification('Pedido removido com sucesso.');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
        }
      }
    );
  };

  const handleCancelOrder = (orderId: string) => {
    showConfirm(
      'Cancelar Pedido',
      'Deseja realmente cancelar este pedido? Esta ação não pode ser desfeita.',
      async () => {
        try {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          const orderData = orderSnap.data();

          await updateDoc(orderRef, {
            status: 'cancelled',
            updatedAt: Timestamp.now()
          });

          // Auto message in chat about cancellation
          if (orderData && user) {
            await addDoc(collection(db, 'chatMessages'), {
              senderUid: user.uid,
              senderName: user.displayName,
              senderPhotoURL: user.photoURL || '',
              receiverUid: orderData.shopOwnerUid,
              text: `❌ *PEDIDO CANCELADO PELO CLIENTE: #${orderId.slice(-4).toUpperCase()}*\n\nInformamos que o cliente cancelou o pedido. Este é um ato de esclarecimento para a gestão da sua loja.`,
              createdAt: Timestamp.now()
            });
          }

          showNotification('Pedido cancelado com sucesso.');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
        }
      }
    );
  };

  const handleReorder = async (order: any) => {
    if (reorderingId) return;
    setReorderingId(order.id);
    try {
      // Simulate modern feel
      await new Promise(r => setTimeout(r, 600));

      const { id, ...orderData } = order;
      const newOrder = {
        ...orderData,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const orderRef = await addDoc(collection(db, 'orders'), newOrder);
      
      // Automatic Bot Message for Reorder
      const orderSummary = order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
      await addDoc(collection(db, 'chatMessages'), {
        senderUid: user.uid,
        receiverUid: order.shopOwnerUid || order.shopId, // Fallback to shopId if shopOwnerUid is missing
        text: `[REPETIÇÃO DE PEDIDO ${orderRef.id.slice(-6)}]\nOlá! Refiz um pedido anterior de: ${orderSummary}.\nTotal: R$ ${order.totalValue.toFixed(2)}`,
        shopName: order.shopName,
        metadata: {
          shopId: order.shopId,
          shopOwnerUid: order.shopOwnerUid
        },
        createdAt: Timestamp.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 bg-white min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2">Meus Pedidos</h2>
          <p className="text-slate-500 font-medium">Acompanhe suas compras e interaja com as lojas.</p>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6 w-fit">
            {['all', 'pending_payment', 'accepted', 'ready', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  statusFilter === status 
                    ? "bg-white text-brand-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {status === 'all' ? 'Todos' : translateStatus(status)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white px-8 py-5 rounded-[32px] border border-slate-100 shadow-soft flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gasto</span>
            <span className="text-2xl font-black text-brand-600 font-display leading-none">
              R$ {orders.reduce((sum, o) => sum + (o.totalValue || 0), 0).toFixed(2)}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos</span>
            <span className="text-2xl font-black text-slate-900 font-display leading-none">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Active Cart Section */}
      {cart && cart.items.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[40px] p-10 shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center text-brand-400 shadow-inner">
                  <ShoppingCart size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-black font-display mb-2">Carrinho Ativo</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-500/20">
                      {cart.shopName}
                    </span>
                    <span className="text-white/40 text-[10px] font-bold">{cart.items.length} produtos selecionados</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Valor Total</p>
                <p className="text-4xl font-black text-emerald-400 font-display tracking-tight">
                  R$ {cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-10 border-t border-b border-white/5 py-12">
              {/* Formas de Pagamento */}
              <div className="space-y-6">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CreditCard size={14} /> Selecione o Pagamento
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map(m => (
                    <button
                      key={m}
                      onClick={() => setCart({ ...cart, paymentMethod: m })}
                      className={cn(
                        "py-4 px-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center text-center leading-tight",
                        cart.paymentMethod === m 
                          ? "bg-brand-500 text-white border-brand-400 shadow-xl shadow-brand-500/20 scale-105" 
                          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="space-y-6">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Truck size={14} /> Modo de Recebimento
                </span>
                <div className="space-y-3">
                  {[
                    { id: 'delivery', label: 'Entrega por Aplicativo', icon: Truck },
                    { id: 'pickup', label: 'Retirada na Loja', icon: Package }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setCart({ ...cart, deliveryType: t.id as any })}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-4",
                        cart.deliveryType === t.id 
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-xl shadow-emerald-500/20 scale-105" 
                          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <t.icon size={18} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endereço do Perfil */}
              <div className="space-y-6">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={14} /> Local de Entrega
                </span>
                <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-500/10 transition-colors" />
                  <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-brand-400">
                      <MapPin size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {cart.deliveryType === 'delivery' ? (
                        <>
                          <p className="text-sm font-bold text-white mb-1 truncate leading-tight">
                            {cart.deliveryAddress || user?.address || 'Endereço não informado'}
                          </p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
                            {cart.buyerState || user?.state || 'UF'}. {cart.buyerCity || user?.city || 'Sua Cidade'}. Brasil.
                          </p>
                          <button 
                            onClick={() => onNavigate('profile')}
                            className="mt-4 flex items-center gap-2 text-[9px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors"
                          >
                            <User size={12} /> Editar no Perfil
                          </button>
                        </>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-white mb-1">Ponto de Retirada</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                            {cart.shopName}<br />
                            Consulte o bate-papo com o feirante para detalhes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => onNavigate('shop-detail')}
                disabled={isFinishingOrder}
                className="py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Plus size={18} /> Adicionar mais Itens
              </button>
              <button 
                onClick={handleFinalizeOrder}
                disabled={isFinishingOrder}
                className="py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-emerald-500/40 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isFinishingOrder ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Finalizar Pedido Agora
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[40px] shadow-soft border border-slate-100 p-10">
              <div className="flex justify-between mb-8">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-[24px]" />
                  <div className="space-y-2">
                    <div className="w-48 h-6 bg-slate-100 rounded-lg" />
                    <div className="w-32 h-4 bg-slate-100 rounded-lg" />
                  </div>
                </div>
                <div className="w-32 h-12 bg-slate-100 rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="h-40 bg-slate-50 rounded-[32px]" />
                <div className="h-40 bg-slate-50 rounded-[32px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {orders
            .filter(o => statusFilter === 'all' || o.status === statusFilter)
            .map(order => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] shadow-soft border border-slate-100 overflow-hidden group hover:border-brand-100 transition-all mb-6"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-[18px] flex items-center justify-center text-brand-500 border border-slate-100 group-hover:scale-105 transition-transform">
                      <Store size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-900 text-lg md:text-xl">{order.shopName || 'Loja Parceira'}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        title="Cancelar Pedido"
                      >
                        <XCircle size={16} />
                        <span className="hidden sm:inline">Cancelar</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {reorderingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      <span className="hidden sm:inline">Repetir</span>
                    </button>
                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        title="Excluir do Histórico"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Status Tracker - Smaller */}
                {order.status !== 'cancelled' && (
                  <div className="flex items-center gap-1 mb-6 max-w-sm overflow-x-auto no-scrollbar pb-2">
                    {[
                      { key: 'pending', icon: ClipboardList, label: 'Recebido' },
                      { key: 'accepted', icon: CheckCircle, label: 'Pedido Aceito' },
                      { key: 'pending_payment', icon: Clock, label: 'Aguardando Pagamento' },
                      { key: 'paid', icon: CreditCard, label: 'Pagamento Aceito' },
                      { key: 'ready_delivery', icon: Truck, label: order.deliveryType === 'pickup' ? 'Retirada' : 'Entrega' },
                      { key: 'completed', icon: Package, label: 'Pedido Concluído' }
                    ].map((step, idx) => {
                      const stepsOrder = ['pending', 'accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready', 'completed'];
                      const currentIdx = stepsOrder.indexOf(order.status);
                      
                      let isPast = false;
                      let isCurrent = false;

                      const greenIndices = [1, 2, 3, 4, 5, 7];
                      isPast = currentIdx >= greenIndices[idx];
                      
                      const activeIndices = [0, 1, 2, 3, 4, 7];
                      isCurrent = !isPast && currentIdx === activeIndices[idx];
                      if (order.status === 'ready' || order.status === 'shipped') {
                         if (idx === 4) isCurrent = false;
                      }

                      return (
                        <React.Fragment key={step.key}>
                          <div className="flex flex-col items-center gap-1 min-w-[50px]" title={step.label}>
                            <div className={cn(
                              "w-6 h-6 md:w-8 md:h-8 rounded-[10px] md:rounded-[12px] flex items-center justify-center transition-all duration-500 shadow-sm",
                              isPast ? "bg-emerald-500 text-white" :
                              isCurrent ? "bg-slate-400 text-white ring-2 ring-slate-200" :
                              "bg-slate-100 text-slate-400"
                            )}>
                              <step.icon size={12} />
                            </div>
                            <span className={cn(
                              "text-[5px] md:text-[6px] font-black uppercase tracking-widest text-center",
                              isPast ? "text-emerald-600" : isCurrent ? "text-slate-900" : "text-slate-300"
                            )}>{step.label}</span>
                          </div>
                          {idx < 5 && (
                            <div className={cn(
                              "flex-1 h-0.5 rounded-full mb-3 md:mb-4 min-w-[8px] mx-0.5",
                              isPast ? "bg-emerald-500" : "bg-slate-100"
                            )} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex items-center gap-3 mt-4">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} /> {order.createdAt?.toDate().toLocaleString()}
                        </p>
                        <span className="text-slate-200 uppercase tracking-widest">•</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 hover:text-brand-600 transition-colors cursor-pointer" onClick={() => {
                          setSelectedChat(order.shopOwnerUid || order.shopId);
                          onNavigate('chats');
                        }}>
                          <MessageSquare size={12} /> Contatar Loja
                        </p>
                      </div>
 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Package size={14} className="text-brand-500" /> Detalhes dos Itens
                    </h5>
                    <div className="space-y-4">
                      {order.items?.map((item: any) => (
                        <div key={item.productId || item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-brand-600 border border-slate-100">{item.quantity}x</span>
                            <span className="text-slate-600 font-bold">{item.name}</span>
                          </div>
                          <span className="font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Valor Total</span>
                        <span className="text-3xl font-black text-brand-600 font-display tracking-tight">R$ {order.totalValue?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin size={14} className="text-brand-500" /> Entrega e Contato
                      </h5>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino</p>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {order.deliveryAddress || 'Retirada na Loja'}
                              </p>
                              {order.deliveryType === 'delivery' && (order.buyerCity || order.buyerState) && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  {order.buyerState}. {order.buyerCity}. Brasil.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Truck size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entrega</p>
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{order.deliveryType === 'delivery' ? 'Domicílio' : 'Retirada'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Phone size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Celular</p>
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{order.buyerPhone || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-brand-600 uppercase tracking-wider">{order.paymentMethod || 'Não definido'}</p>
                              {order.paymentMethod === 'Pix' && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                           {['Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Pix'].map(method => (
                             <span key={method} className={cn(
                               "text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                               order.paymentMethod === method ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50"
                             )}>
                               {method}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                        <Info size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-brand-800 leading-relaxed">
                        Qualquer dúvida sobre seu pedido, entre em contato diretamente com o lojista pelo bate papo ou Número de Contato; disponível acima.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {orders.filter(o => statusFilter === 'all' || o.status === statusFilter).length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <ShoppingBag size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Nenhum pedido nesta categoria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SavedScreen = ({ user, onNavigate, onToggleFavorite, setSelectedShop }: { user: UserProfile | null, onNavigate: (screen: Screen) => void, onToggleFavorite: (id: string) => void, setSelectedShop: (shop: Shop) => void }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.favorites || user.favorites.length === 0) {
      setShops([]);
      setLoading(false);
      return;
    }

    const shopsQuery = query(collection(db, 'shops'), where('__name__', 'in', user.favorites));
    const unsubscribe = onSnapshot(shopsQuery, (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));

    return () => unsubscribe();
  }, [user?.favorites]);

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2">Meus Favoritos</h2>
        <p className="text-slate-500 font-medium">Suas bancas e lojas preferidas em um só lugar.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : shops.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-soft">
          <Heart size={64} className="text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-medium mb-8">Você ainda não salvou nenhuma loja.</p>
          <button 
            onClick={() => onNavigate('search')}
            className="px-8 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
          >
            Explorar Mercado
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map(shop => (
            <motion.div 
              key={shop.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden group cursor-pointer relative"
              onClick={() => {
                setSelectedShop(shop);
                onNavigate('shop-detail');
              }}
            >
              <div className="h-48 bg-slate-100 relative">
                <img src={shop.photoURL || 'https://picsum.photos/seed/shop/400'} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(shop.id);
                  }}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-all"
                >
                  <Heart size={24} fill="currentColor" />
                </button>
              </div>
              <div className="p-8">
                <h4 className="text-xl font-black text-slate-900 mb-2">{shop.name}</h4>
                <p className="text-slate-500 text-xs font-medium line-clamp-2">{shop.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationsScreen = ({ notifications }: { notifications: any[] }) => {
  const renderText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline font-black decoration-2 underline-offset-4 hover:text-brand-700 transition-colors inline-flex items-center gap-1">{part} <ExternalLink size={12} /></a>;
      }
      return part;
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      <div className="mb-12 flex items-center gap-6">
        <div className="w-16 h-16 bg-brand-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-100 ring-8 ring-brand-50">
          <BellRing size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2">Notificações</h2>
          <p className="text-slate-500 font-medium font-sans uppercase text-[10px] tracking-widest">Canal oficial da administração Feira Livre</p>
        </div>
      </div>

      <div className="space-y-6">
        {notifications.map(notif => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500 group-hover:w-3 transition-all duration-500" />
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-brand-600 group-hover:text-white transition-colors duration-500">
                <Info size={28} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-slate-900 font-display leading-tight">{notif.title}</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    {notif.createdAt?.toDate().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-slate-600 leading-[1.8] font-medium text-sm lg:text-base border-l-4 border-slate-50 pl-6">
                  {renderText(notif.body)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-slate-300 bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100">
            <Bell size={80} strokeWidth={1} className="mb-6 opacity-20" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum aviso no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

const renderScreen = () => {
    // Check if screen is visible in config
    if (appConfig?.pages && currentScreen in appConfig.pages) {
      const pageConfig = (appConfig.pages as any)[currentScreen];
      if (pageConfig && !pageConfig.visible && user?.role !== 'admin' && user?.role !== 'state_admin') {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <Lock size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-[10px]">Página temporariamente indisponível</p>
          </div>
        );
      }
    }

    switch (currentScreen) {
      case 'landing': return (
        <LandingScreen 
          onSelectRole={(role) => setCurrentScreen(role === 'vendor' ? 'create-shop' : 'search')} 
          onLogin={handleLogin} 
          onNavigate={setCurrentScreen}
          loggingInRole={loggingInRole}
          authError={authError}
          config={appConfig}
        />
      );
      case 'sales': return <SalesScreen config={appConfig} user={user} onNavigate={setCurrentScreen} showNotification={showNotification} showConfirm={showConfirm} />;
      case 'sales-tips': return <SalesTipsScreen config={appConfig} onNavigate={setCurrentScreen} />;
      case 'search': return <SearchScreen config={appConfig} onNavigate={setCurrentScreen} user={user} onToggleFavorite={toggleFavorite} selectedCategory={globalSelectedCategory} setSelectedCategory={setGlobalSelectedCategory} cart={cart} setCart={setCart} activeView={searchView} setActiveView={setSearchView} showNotification={showNotification} showConfirm={showConfirm} setSelectedShop={setSelectedShop} setShowPermissionModal={setShowPermissionModal} sharedAddToCart={sharedAddToCart} sharedRemoveFromCart={sharedRemoveFromCart} />;
      case 'wholesale': return <WholesaleScreen config={appConfig} onNavigate={setCurrentScreen} user={user} selectedCategory={globalSelectedCategory} setSelectedCategory={setGlobalSelectedCategory} cart={cart} setCart={setCart} activeView={wholesaleView} setActiveView={setWholesaleView} showNotification={showNotification} showConfirm={showConfirm} setSelectedShop={setSelectedShop} setShowPermissionModal={setShowPermissionModal} sharedAddToCart={sharedAddToCart} sharedRemoveFromCart={sharedRemoveFromCart} />;
      case 'orders': return <OrdersScreen user={user} cart={cart} setCart={setCart} showNotification={showNotification} showConfirm={showConfirm} onNavigate={setCurrentScreen} setSelectedChat={setSelectedChat} setSelectedShop={setSelectedShop} />;
      case 'saved': return <SavedScreen user={user} onNavigate={setCurrentScreen} onToggleFavorite={toggleFavorite} setSelectedShop={setSelectedShop} />;
      case 'notifications': return <NotificationsScreen notifications={adminNotifications} />;
      case 'create-shop': return <CreateShopScreen user={user} showNotification={showNotification} config={appConfig} onComplete={() => setCurrentScreen('shop-management')} />;
      case 'wholesale-accounting':
        return <VendorAccounting user={user} showNotification={showNotification} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'vendor-accounting':
        return <VendorAccounting user={user} showNotification={showNotification} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'calculator': return <CalculatorScreen config={appConfig} user={user} />;
      case 'contact': return <ContactScreen user={user} showNotification={showNotification} config={appConfig} />;
      case 'admin-dashboard': return <AdminDashboard user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={handleNavigate} setSelectedShop={setSelectedShop} />;
      case 'shop-detail': return <ShopDetailScreen shop={selectedShop} user={user} cart={cart} setCart={setCart} showNotification={showNotification} onNavigate={setCurrentScreen} config={appConfig} sharedAddToCart={sharedAddToCart} sharedRemoveFromCart={sharedRemoveFromCart} />;
      case 'shop-management': return <ShopManagement user={user} showNotification={showNotification} showConfirm={showConfirm} config={appConfig} onNavigate={setCurrentScreen} setSelectedChat={setSelectedChat} />;
      case 'profile': return <ProfileScreen user={user} onUpdate={setUser} showNotification={showNotification} showConfirm={showConfirm} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'privacy': return <PrivacyScreen config={appConfig} />;
      case 'terms': return <TermsScreen config={appConfig} />;
      case 'careers': return <CareersScreen config={appConfig} user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={setCurrentScreen} />;
      case 'chats': return <ChatsScreen user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={setCurrentScreen} selectedChatId={selectedChat} setSelectedChatId={setSelectedChat} />;
      case 'pending-approval': return <PendingApprovalScreen onLogout={handleLogout} />;
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <LayoutGrid size={48} className="mb-4 opacity-20" />
          <p>Tela em desenvolvimento</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Notificação Global */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm ${
              notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Pedido de Acesso (Permissões) */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-white overflow-hidden"
            >
              <div className="p-2 text-center">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 font-display">Pedido de Acesso</h3>
                <p className="text-slate-500 font-medium mb-8">
                  O aplicativo solicita acesso às seguintes permissões para funcionar corretamente:
                </p>
                
                <div className="space-y-4 mb-10 text-left">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-500 shadow-sm">
                      <Camera size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Câmera</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Para fotos de perfil e produtos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-500 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Localização geográfica</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Para encontrar feiras próximas</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    localStorage.setItem('feira_livre_permissions_seen', 'true');
                    setShowPermissionModal(false);
                  }}
                  className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                >
                  Aplicar
                </button>
                
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação Global (Sim/Não) */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-gray-500 text-sm mb-8">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Não
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  <Check size={18} />
                  Sim, Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Header */}
      {currentScreen !== 'landing' && (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl flex flex-col gap-3 pointer-events-none">
          {/* Main Bar */}
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-6 h-20 flex items-center justify-between gap-8 pointer-events-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavigate('landing')} className="flex items-center hover:scale-105 transition-transform active:scale-95 bg-white rounded-2xl p-1.5 shadow-sm">
                <Logo size="sm" />
              </button>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-black text-white font-display tracking-tight">Feira Livre Digital 🇧🇷</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Conectando o Campo à Mesa</span>
              </div>
            </div>

            <div className="flex-1 max-w-md relative group hidden md:block">
              <div className="absolute inset-0 bg-white/5 rounded-2xl group-focus-within:bg-white/10 group-focus-within:ring-4 group-focus-within:ring-brand-500/20 transition-all duration-500" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors duration-500" size={20} />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                className="relative w-full h-12 pl-12 pr-4 bg-transparent border-none rounded-2xl outline-none text-xs font-medium text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => handleNavigate('calculator')} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-brand-400 hover:bg-white/5 rounded-xl transition-all active:scale-90">
                  <Calculator size={22} />
                </button>
                <button onClick={() => handleNavigate('saved')} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-brand-400 hover:bg-white/5 rounded-xl transition-all relative active:scale-90">
                  <Heart size={22} fill={currentScreen === 'saved' ? "currentColor" : "none"} className={currentScreen === 'saved' ? "text-red-500" : ""} />
                </button>
                <button onClick={() => handleNavigate('notifications')} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-brand-400 hover:bg-white/5 rounded-xl transition-all relative active:scale-90">
                  <Bell size={22} className={currentScreen === 'notifications' ? "text-brand-600" : ""} />
                  {newAdminNotificationsCount > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  )}
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleNavigate('profile')} className="flex items-center gap-3 p-1.5 pr-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all active:scale-95 border border-white/5">
                    <img src={user.photoURL} className="w-9 h-9 rounded-xl object-cover border border-white/10" alt={user.displayName} />
                    <div className="flex flex-col items-start leading-tight hidden lg:flex">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Perfil</span>
                      <span className="text-xs font-bold">{user.displayName.split(' ')[0]}</span>
                    </div>
                  </button>
                  <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all active:scale-90">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleNavigate('landing')} className="px-5 py-2.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                  Entrar
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Links Pill */}
          <div className="self-center bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-full px-6 py-2.5 flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 shadow-xl pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
            <button onClick={() => handleNavigate('wholesale')} className="flex items-center gap-2.5 hover:text-brand-400 transition-all group active:scale-95">
              <Truck size={16} className="group-hover:scale-110 transition-transform" />
              Atacado
            </button>
            <button onClick={() => handleNavigate('search')} className="flex items-center gap-2.5 hover:text-brand-400 transition-all group active:scale-95">
              <User size={16} className="group-hover:scale-110 transition-transform" /> Feirante
            </button>
            <button onClick={() => handleNavigate('orders')} className="flex items-center gap-2.5 hover:text-brand-400 transition-all group relative active:scale-95">
              <Package size={16} className="group-hover:scale-110 transition-transform" /> Pedidos
              {newBuyerOrdersCount > 0 && <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
            </button>
            {user?.role !== 'client' && user?.role !== 'state_admin' && currentScreen !== 'admin-dashboard' && (
              <button onClick={() => handleNavigate('sales')} className="flex items-center gap-2.5 hover:text-brand-400 transition-all group relative active:scale-95">
                <BarChart size={16} className="group-hover:scale-110 transition-transform" /> Vendas
                {newOrdersCount > 0 && <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />}
              </button>
            )}
            {user?.role === 'state_admin' && (
              <button onClick={() => handleNavigate('admin-dashboard')} className="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 transition-all group active:scale-95">
                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" /> Admin
              </button>
            )}
            {user?.role === 'vendor' && (
              <button onClick={() => handleNavigate('shop-management')} className="flex items-center gap-2.5 text-brand-400 hover:text-brand-300 transition-colors group">
                <Store size={16} className="group-hover:scale-110 transition-transform" /> Minha Loja
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10",
        currentScreen === 'landing' ? "" : "pt-44"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg">
        {/* Category Floating Bar */}
        {(currentScreen === 'search' || currentScreen === 'wholesale') && (
          <div className="absolute -top-16 left-0 right-0 px-2 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 flex gap-2 shadow-2xl overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setGlobalSelectedCategory('all')}
                className={cn(
                  "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                  globalSelectedCategory === 'all' 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                Todas
              </button>
              {PRODUCT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGlobalSelectedCategory(cat.id)}
                  className={cn(
                    "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2",
                    globalSelectedCategory === cat.id 
                      ? "bg-brand-600 text-white shadow-xl shadow-brand-500/20" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-4 py-1 flex items-center justify-between relative overflow-hidden">
          {(!appConfig?.pages?.search || appConfig.pages.search.visible) && (
            <NavItem icon={Search} label="BUSCAR" active={currentScreen === 'search'} onClick={() => handleNavigate('search')} />
          )}
          {(!appConfig?.pages?.wholesale || appConfig.pages.wholesale.visible) && (
            <NavItem 
              icon={Truck} 
              label="ATACADO" 
              active={currentScreen === 'wholesale'} 
              onClick={() => handleNavigate('wholesale')} 
            />
          )}
          {(!appConfig?.pages?.orders || appConfig.pages.orders.visible) && (
            <NavItem icon={Package} label="PEDIDOS" active={currentScreen === 'orders'} onClick={() => handleNavigate('orders')} badge={(newBuyerOrdersCount || (cart && cart.items.length > 0)) ? true : undefined} />
          )}
          {(!appConfig?.pages?.chats || appConfig.pages.chats.visible) && (
            <NavItem icon={MessageSquare} label="BATE-PAPO" active={currentScreen === 'chats'} onClick={() => handleNavigate('chats')} badge={unreadChatsCount > 0 ? true : undefined} />
          )}
          <NavItem icon={Heart} label="SALVOS" active={currentScreen === 'saved'} onClick={() => handleNavigate('saved')} />
          {(!appConfig?.pages?.sales || appConfig.pages.sales.visible) && user?.role !== 'state_admin' && currentScreen !== 'admin-dashboard' && (
            <NavItem icon={BarChart} label="VENDAS" active={currentScreen === 'sales'} onClick={() => handleNavigate('sales')} badge={newOrdersCount > 0 ? true : undefined} />
          )}
        </div>
      </nav>

      {/* Global Footer (only on landing) */}
      {currentScreen !== 'landing' && (
        <footer className="py-20 flex flex-col items-center gap-8 bg-white border-t border-slate-100 mb-24">
          <div className="opacity-10 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-40">
            <LogoComponent size="md" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 px-6">
            <button onClick={() => setCurrentScreen('contact')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Suporte</button>
            <button onClick={() => setCurrentScreen('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Privacidade</button>
            <button onClick={() => setCurrentScreen('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Termos de Uso</button>
            <button onClick={() => setCurrentScreen('careers')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors">Trabalhe Conosco</button>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] text-center px-6">
            © 2026 FEIRA LIVRE DIGITAL • CONECTANDO O CAMPO À MESA
          </p>
        </footer>
      )}
      {/* Connection Status Badge */}
      <div className="fixed bottom-4 right-4 z-[100] pointer-events-none">
        <div className={cn(
          "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md border transition-all duration-500",
          dbStatus === 'loading' ? "bg-slate-100 text-slate-400 border-slate-200" :
          dbStatus === 'connected' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
          "bg-red-50 text-red-600 border-red-100"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            dbStatus === 'loading' ? "bg-slate-300 animate-pulse" :
            dbStatus === 'connected' ? "bg-emerald-500" :
            "bg-red-500"
          )} />
          {dbStatus === 'loading' ? 'Conectando...' : 
           dbStatus === 'connected' ? 'Firebase Conectado' : 
           'Erro de Conexão'}
        </div>
      </div>
    </div>
  );
}
