import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import { Logo } from './components/Logo';
import { motion, AnimatePresence } from 'motion/react';
import OrderCard from './components/orders/OrderCard';
import CheckoutSummary from './components/orders/CheckoutSummary';
import OrdersScreen from './components/OrdersScreen';
import SearchScreen from './components/SearchScreen';
import WholesaleScreen from './components/WholesaleScreen';
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
  UserX,
  Users,
  LayoutGrid,
  Camera,
  Image,
  ChevronRight,
  ChevronLeft,
  Wallet,
  ArrowUpCircle,
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle,
  Clock,
  LogOut,
  LogIn,
  Share2,
  Trash2,
  Check,
  Plus,
  Copy,
  Save,
  ImagePlus,
  Edit2,
  ExternalLink,
  Utensils,
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
  ArrowDownLeft,
  Phone,
  Smartphone,
  ClipboardList,
  Tag,
  AlertTriangle,
  Banknote,
  AlertCircle,
  ShieldAlert,
  Maximize2,
  Quote,
  Home,
  WifiOff
} from 'lucide-react';
import { cn, compressImage, sanitizeForFirestore } from './lib/utils';
import { Screen, UserRole, UserProfile, AppConfig, ChatMessage, Shop, Product, Sale, Disbursement, JobOpening, JobApplication, DaySchedule, SpecialDate, Cart, CartItem } from './types';
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
  OperationType,
  increment,
  serverTimestamp,
  writeBatch
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { testConnection } from './firebase';
import { SafeImage } from './components/SafeImage';
import { ProductCard } from './components/ProductCard';
import { LoginRequiredView } from './components/LoginRequiredView';
import { 
  isShopOpen, 
  translateStatus, 
  translatePaymentMethod, 
  translateRole, 
  translateUnit 
} from './services/formatService';
import { BottomMenu } from './components/BottomMenu';
import { CategoryFilter } from './components/CategoryFilter';

// Performance optimized components and hooks
import CatalogPage from './pages/CatalogPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import SellerPage from './pages/SellerPage';
import PainelFinanceiroContabil from './pages/PainelFinanceiroContabil';
import { FeiraLivreCalculadoraScreen } from './pages/FeiraLivreCalculadoraScreen';

const STEPS_ORDER = ['pending', 'accepted', 'pending_payment', 'paid', 'preparing', 'shipped', 'ready', 'completed'];

const getShopTypeInfo = (type?: string) => {

  switch (type) {
    case 'feirante': 
    case 'feira': 
    case 'feiralivre':
      return { label: 'Feira Livre', icon: Tent };
    case 'mercado': 
    case 'mercadolivre':
      return { label: 'Mercado Livre', icon: ShoppingBag };
    case 'barraca': 
    case 'barracalivre':
      return { label: 'Barraca Livre', icon: Tent };
    case 'atacado': 
    case 'wholesale':
    case 'atacadolivre':
      return { label: 'Atacado Livre', icon: Truck };
    case 'restaurante':
      return { label: 'Restaurante', icon: Utensils };
    default:
      return { label: 'Loja', icon: Store };
  }
};

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

const getFullStateName = (stateId?: string) => {
  if (!stateId) return '';
  const state = BRAZIL_STATES.find(s => s.id === stateId.toUpperCase() || s.name.toUpperCase() === stateId.toUpperCase());
  return state ? state.name : stateId;
};

const PRODUCT_CATEGORIES = [
  { id: 'carne', name: 'Carne', icon: '🥩' },
  { id: 'grao', name: 'Grão', icon: '🫘' },
  { id: 'frutas', name: 'Frutas', icon: '🍎' },
  { id: 'legumes', name: 'Legumes', icon: '🥦' },
  { id: 'verduras', name: 'Verduras', icon: '🥬' },
  { id: 'restaurante', name: 'Restaurante', icon: '🍽️' },
  { id: 'hortalicas', name: 'Hortaliças', icon: '🥗' },
  { id: 'temperos', name: 'Temperos', icon: '🧂' },
  { id: 'outros', name: 'Outros', icon: '📦' },
];



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
  className = "",
  type = 'shop'
}: { 
  value: string, 
  onChange: (base64: string) => void, 
  label?: string,
  className?: string,
  type?: 'user' | 'shop' | 'product'
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
            <SafeImage src={value} type={type} className="w-full h-full object-cover" alt="Preview" />
          </div>
          {isCompressing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <RefreshCw size={20} className="animate-spin text-brand-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button 
              type="button"
              onClick={() => {
                const input = fileInputRef.current;
                if (input) {
                  input.removeAttribute('capture');
                  input.click();
                }
              }}
              disabled={isCompressing}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-all flex items-center gap-2"
            >
              <Image size={14} /> Galeria
            </button>
            <button 
              type="button"
              onClick={() => {
                const input = fileInputRef.current;
                if (input) {
                  input.setAttribute('capture', 'environment');
                  input.click();
                }
              }}
              disabled={isCompressing}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-all flex items-center gap-2"
            >
              <Camera size={14} /> Câmera
            </button>
            {value && (
              <button 
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:border-red-200 hover:bg-red-50 transition-all"
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

const DAYS_OF_WEEK = [
  { id: '1', label: 'Segunda-feira', short: 'Seg' },
  { id: '2', label: 'Terça-feira', short: 'Ter' },
  { id: '3', label: 'Quarta-feira', short: 'Qua' },
  { id: '4', label: 'Quinta-feira', short: 'Qui' },
  { id: '5', label: 'Sexta-feira', short: 'Sex' },
  { id: '6', label: 'Sábado', short: 'Sáb' },
  { id: '0', label: 'Domingo', short: 'Dom' }
];

const ScheduleManager = ({ 
  schedule = {}, 
  onChange,
  specialDates = [],
  onSpecialDatesChange
}: { 
  schedule?: { [key: string]: DaySchedule }, 
  onChange: (s: { [key: string]: DaySchedule }) => void,
  specialDates?: SpecialDate[],
  onSpecialDatesChange: (dates: SpecialDate[]) => void
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'special'>('weekly');

  const updateDay = (dayId: string, updates: Partial<DaySchedule>) => {
    const current = schedule[dayId] || { open: '08:00', close: '18:00', active: false };
    onChange({
      ...schedule,
      [dayId]: { ...current, ...updates }
    });
  };

  const addSpecialDate = () => {
    const today = new Date().toISOString().split('T')[0];
    onSpecialDatesChange([
      ...specialDates,
      { date: today, open: '08:00', close: '18:00', active: true, label: 'Evento Especial' }
    ]);
  };

  const removeSpecialDate = (index: number) => {
    onSpecialDatesChange(specialDates.filter((_, i) => i !== index));
  };

  const updateSpecialDate = (index: number, updates: Partial<SpecialDate>) => {
    const next = [...specialDates];
    next[index] = { ...next[index], ...updates };
    onSpecialDatesChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('weekly')}
          className={cn(
            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'weekly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Semanal
        </button>
        <button 
          onClick={() => setActiveTab('special')}
          className={cn(
            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'special' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Datas Especiais
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'weekly' ? (
          <motion.div 
            key="weekly"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {DAYS_OF_WEEK.map(day => {
              const config = schedule[day.id] || { open: '08:00', close: '18:00', active: false };
              return (
                <div key={day.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-brand-200 transition-all group gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateDay(day.id, { active: !config.active })}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        config.active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                        config.active ? "left-7 shadow-sm" : "left-1"
                      )} />
                    </button>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{day.label}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-tight",
                        config.active ? "text-emerald-500" : "text-slate-400"
                      )}>
                        {config.active ? 'Funcionando' : 'Fechado'}
                      </p>
                    </div>
                  </div>

                  {config.active && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 sm:flex-initial">
                        <Clock size={14} className="text-slate-400" />
                        <input 
                          type="time" 
                          value={config.open || ''} 
                          onChange={e => updateDay(day.id, { open: e.target.value })}
                          className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                        />
                      </div>
                      <span className="text-slate-300 font-bold text-xs">às</span>
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 sm:flex-initial">
                        <Clock size={14} className="text-slate-400" />
                        <input 
                          type="time" 
                          value={config.close || ''} 
                          onChange={e => updateDay(day.id, { close: e.target.value })}
                          className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="special"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {specialDates.map((date, idx) => {
              const [sYear, sMonth, sDay] = (date.date || '2026-01-01').split('-');
              return (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[32px] space-y-6 relative group hover:border-brand-100 transition-all shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                       <div className="flex flex-col items-center justify-center w-14 h-14 bg-brand-50 rounded-2xl border border-brand-100">
                         <span className="text-[10px] font-black text-brand-600 uppercase leading-none mb-1">{sMonth ? new Date(0, parseInt(sMonth)-1).toLocaleString('pt-BR', { month: 'short' }) : '---'}</span>
                         <span className="text-xl font-black text-brand-900 leading-none">{sDay || '--'}</span>
                       </div>
                       <div className="flex flex-col justify-center">
                         <h4 className="text-sm font-black text-slate-900">{date.label || 'Data Especial'}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sYear}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => removeSpecialDate(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mês / Ano</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={sMonth}
                          onChange={e => {
                            const newMonth = e.target.value;
                            updateSpecialDate(idx, { date: `${sYear}-${newMonth}-${sDay}` });
                          }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={String(m).padStart(2, '0')}>
                              {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <select 
                          value={sYear}
                          onChange={e => {
                            const newYear = e.target.value;
                            updateSpecialDate(idx, { date: `${newYear}-${sMonth}-${sDay}` });
                          }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dia</label>
                      <select 
                        value={sDay}
                        onChange={e => {
                          const newDay = e.target.value;
                          updateSpecialDate(idx, { date: `${sYear}-${sMonth}-${newDay}` });
                        }}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identificação</label>
                      <input 
                        type="text" 
                        value={date.label || ''}
                        onChange={e => updateSpecialDate(idx, { label: e.target.value })}
                        placeholder="Ex: Feriado municipal..."
                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateSpecialDate(idx, { active: !date.active })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-300",
                          date.active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                          date.active ? "left-7 shadow-sm" : "left-1"
                        )} />
                      </button>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {date.active ? 'Loja Funcionando' : 'Loja Fechada (Feriado/Folga)'}
                      </span>
                    </div>

                    {date.active && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock size={12} className="text-slate-400" />
                          <input 
                            type="time" 
                            value={date.open || ''} 
                            onChange={e => updateSpecialDate(idx, { open: e.target.value })}
                            className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                          />
                        </div>
                        <span className="text-slate-300 font-bold text-xs">às</span>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock size={12} className="text-slate-400" />
                          <input 
                            type="time" 
                            value={date.close || ''} 
                            onChange={e => updateSpecialDate(idx, { close: e.target.value })}
                            className="bg-transparent border-none outline-none text-[10px] font-black w-16"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={addSpecialDate}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:border-brand-200 hover:text-brand-500 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-500 transition-colors">
                <Plus size={18} />
              </div>
              Adicionar Nova Data Específica
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingScreen = ({ 
  onSelectRole, 
  onGoogleLogin,
  onNavigate,
  loggingInRole,
  authError,
  config,
  handleShare
}: { 
  onSelectRole: (role: string) => void, 
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>,
  onNavigate: (screen: Screen) => void,
  loggingInRole: string | null,
  authError: string | null,
  config: AppConfig | null,
  handleShare: (data: { title: string; text: string; url?: string }) => void
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 pb-32">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Logo size="3xl" />
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
      className="text-center mb-12 space-y-8"
    >
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">Feira Livre 🇧🇷</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto text-balance leading-relaxed">
          A plataforma que conecta você aos melhores produtos frescos da sua região.
        </p>
      </div>
    </motion.div>

    <div className="w-full max-w-lg mx-auto px-6 pb-12">
      <div className="flex flex-col gap-6 items-center">
        {/* Sou Cliente */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <User size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display relative z-10">Sou Cliente</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Encontre as melhores barracas, produtos frescos e ofertas exclusivas.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('client', 'client')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('client', 'client')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Feira Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-brand-600 rounded-[32px] p-8 shadow-xl shadow-brand-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Tent size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display relative z-10">Feira Livre</h3>
          <p className="text-brand-100 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Entre na Feira Livre e destaque seus melhores produtos para mais clientes.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_feirante')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-brand-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-brand-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_feirante')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-brand-500/20 border border-brand-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Barraca Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-emerald-600 rounded-[32px] p-8 shadow-xl shadow-emerald-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Store size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display relative z-10">Barraca Livre</h3>
          <p className="text-emerald-100 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Crie sua conta na Barraca Livre e gerencie seu catálogo de produtos com praticidade.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_barraca')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-emerald-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-emerald-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_barraca')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-emerald-500/20 border border-emerald-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Mercado Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-indigo-600 rounded-[32px] p-8 shadow-xl shadow-indigo-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display relative z-10">Mercado Livre</h3>
          <p className="text-indigo-100 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Mercado Livre: gestão inteligente de produtos, catálogo e vendas em uma única plataforma.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_mercado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-indigo-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_mercado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-indigo-500/20 border border-indigo-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Sou Atacado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Truck size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display relative z-10">Atacado Livre</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Entre no Atacado Livre e potencialize suas vendas em grande escala.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_atacado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_atacado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Administração */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="w-full group bg-slate-900 rounded-[32px] p-8 shadow-soft border border-slate-800 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display relative z-10">Administração</h3>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed max-w-[240px] relative z-10">
            Gerencie usuários, produtos e categorias com total controle em um único painel administrativo.
          </p>
          
          <div className="w-full space-y-3 relative z-10">
            <button 
              onClick={() => onGoogleLogin('state_admin', 'admin')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('state_admin', 'admin')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-slate-800 border-2 border-slate-700 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs uppercase tracking-widest"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-6 relative z-10">Acesso Restrito</span>
        </motion.div>
      </div>
    </div>

    {/* Seção FEIRA LIVRE CALCULADORA */}
    <motion.div 
      id="calc-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-4xl mt-32 mb-16 px-6"
    >
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-full p-10 md:p-14 space-y-8 text-center flex flex-col items-center">
            <div className="space-y-3 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <img 
                  src="/calculadora_app.png.png" 
                  alt="Logo" 
                  className="w-12 h-12 object-contain rounded-xl shadow-sm"
                />
                <span className="text-[11px] font-black text-brand-500 uppercase tracking-[0.3em] bg-brand-50 px-4 py-1.5 rounded-full border border-brand-100">
                  BAIXE AGORA!
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 font-display italic tracking-tight uppercase leading-none text-center">
                FEIRA LIVRE <span className="text-brand-600 block">CALCULADORA</span>
              </h3>
            </div>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Da pra usar sem conexão com Internet, pode usar a vontade pra fazer cálculos e registrar a tela, é a vontade. 
              Coloque o nome do produto, preço e quantidade. Pra da fazer dinheiro e ainda registrar se você puder! 
              Baixe na PlayStore.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-3xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Disponível na</span>
                  <span className="text-xl font-bold">Google Play</span>
                </div>
              </button>

              <button 
                onClick={() => handleShare({
                  title: 'Feira Livre Calculadora',
                  text: 'Baixe agora a Calculadora Feira Livre! Funciona offline e ajuda você a registrar suas vendas e cálculos de produtos frescos. 🇧🇷',
                  url: 'https://ais-pre-hi2uw6gyumtv3zgsf6dwn2-260480316891.us-east1.run.app' // URL do app
                })}
                className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-900 px-8 py-5 rounded-3xl hover:border-brand-500 hover:text-brand-600 transition-all shadow-lg active:scale-95"
              >
                <Share2 size={24} />
                <span className="text-sm font-black uppercase tracking-widest">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const ProductCatalogItem = ({ 
  p, 
  onAdd
}: { 
  p: Product, 
  onAdd: (qty: number) => void
}) => {
  const [localQty, setLocalQty] = useState(p.unit === 'gram' ? 100 : 1);
  const [isAnimating, setIsAnimating] = useState(false);

  const adjustQty = (amount: number) => {
    setIsAnimating(true);
    setLocalQty(prev => {
      const next = prev + amount;
      return next < 0 ? 0 : next;
    });
    setTimeout(() => setIsAnimating(false), 200);
  };
  
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="p-4 bg-white border border-slate-100 rounded-[32px] hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-center group relative overflow-hidden flex flex-col h-full min-h-[180px]"
    >
      <div className="w-12 h-12 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
        <Package size={20} />
      </div>
      <div className="flex flex-col gap-0.5 mb-2">
        <h4 className="text-[10px] font-black text-slate-900 line-clamp-1 uppercase tracking-tighter">{p.name}</h4>
        <div className="flex items-center justify-center gap-1">
          <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
            Catálogo Est.: {p.stock}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5 mb-2">
        <span className="text-xs font-black text-emerald-600">
          R$ {p.price.toFixed(2)}
        </span>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 mb-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              adjustQty(-(p.unit === 'gram' ? 50 : 1));
            }}
            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm active:scale-90"
          >
            <Minus size={12} />
          </button>
          <span className={cn(
            "text-[10px] font-black text-slate-700 transition-transform duration-200",
            isAnimating && "scale-125 text-emerald-600"
          )}>{localQty}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              adjustQty(p.unit === 'gram' ? 50 : 1);
            }}
            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 shadow-sm active:scale-90"
          >
            <Plus size={12} />
          </button>
        </div>

        <button
          onClick={() => {
            if (localQty <= 0) return;
            onAdd(localQty);
          }}
          disabled={p.stock <= 0}
          className="w-full py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {p.stock > 0 ? 'Adicionar' : 'Sem Estoque'}
        </button>
      </div>
    </motion.div>
  );
};

import SellerOrderCard from './components/store/SellerOrderCard';

const SalesScreen = ({ config, user, onNavigate, showNotification, showConfirm }: { config: AppConfig | null, user: UserProfile | null, onNavigate: (screen: Screen) => void, showNotification: (m: string, t?: 'success' | 'error') => void, showConfirm: (t: string, m: string, c: () => void) => void }) => {
  const [sales, setSales] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'commercialization' | 'disbursements' | 'cashflow' | 'payment_methods'>('overview');
  const [orderFilter, setOrderFilter] = useState('all');
  
  // States for Accounts Payable/Receivable Form
  const [cashForm, setCashForm] = useState({
    type: 'receivable' as 'receivable' | 'payable',
    description: '',
    person: '',
    product: '',
    quantity: 1,
    weight: '',
    unit: 'un',
    price: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  const [isSavingCash, setIsSavingCash] = useState(false);

  const [buyerProfiles, setBuyerProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  
  // States for commercialization (Manual POS)
  const [commType, setCommType] = useState<'sale' | 'disbursement'>('sale');
  const [commOperation, setCommOperation] = useState<'feirante' | 'barraca' | 'mercado' | 'atacado'>('feirante');
  const [commSearch, setCommSearch] = useState('');
  const [commBuyerName, setCommBuyerName] = useState('');
  const [commSelectedProduct, setCommSelectedProduct] = useState<Product | null>(null);
  const [commPrice, setCommPrice] = useState(0);
  const [commUnit, setCommUnit] = useState<'unit' | 'kg' | 'gram' | 'box' | 'bag'>('unit');
  const [commQuantity, setCommQuantity] = useState(1);
  const [commWeight, setCommWeight] = useState(1);
  const [commReceived, setCommReceived] = useState(0);
  const [commItems, setCommItems] = useState<any[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isSavingComm, setIsSavingComm] = useState(false);
  const [commTargetSearch, setCommTargetSearch] = useState('');
  const [commTargetShop, setCommTargetShop] = useState<Shop | null>(null);
  const [commTargetProducts, setCommTargetProducts] = useState<Product[]>([]);
  const [showTargetShopSearch, setShowTargetShopSearch] = useState(false);
  const [allShops, setAllShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('buyerUid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBuyerOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'buyer-orders'));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'shops'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!commTargetShop) {
      setCommTargetProducts([]);
      return;
    }
    const q = query(collection(db, 'shops', commTargetShop.id, 'products'));
    getDocs(q).then(snapshot => {
      setCommTargetProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }).catch(err => handleFirestoreError(err, OperationType.LIST, `shops/${commTargetShop.id}/products`));
  }, [commTargetShop]);

  const parseFormattedNumber = (val: string) => {
    if (!val) return 0;
    // Converte vírgula em ponto para parsing robusto em locale brasileiro
    const normalized = val.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const calculateCommTotal = () => {
    if (commItems.length > 0) {
      return commItems.reduce((acc, item) => acc + (item.totalValue || 0), 0);
    }
    // Se a lista estiver vazia, considera o item atual que está sendo editado (mesma lógica do botão Salvar)
    return Number((commPrice * commQuantity * (commWeight || 1)).toFixed(2));
  };

  const commTotal = calculateCommTotal();
  const commChange = commReceived - commTotal;

  const addToCommList = () => {
    if (commPrice <= 0 || commQuantity <= 0) {
      showNotification('Preencha o preço e a quantidade primeiro.', 'error');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productName: commSelectedProduct ? commSelectedProduct.name : (commSearch || 'Item Manual'),
      productId: commSelectedProduct?.id || null,
      targetShopId: commTargetShop?.id || null,
      targetShopName: commTargetShop?.name || null,
      price: commPrice || 0,
      cost: commSelectedProduct?.cost || 0,
      unit: commUnit || 'unit',
      quantity: commQuantity || 0,
      weightPerUnit: commWeight || 1,
      weight: commWeight || 1,
      totalValue: Number((commPrice * commQuantity * (commWeight || 1)).toFixed(2))
    };

    setCommItems([...commItems, newItem]);
    
    // Reset inputs for next item
    setCommSelectedProduct(null);
    setCommSearch('');
    setCommPrice(0);
    setCommQuantity(1);
    setCommWeight(1);
    showNotification('Item adicionado à lista!', 'success');
  };
  
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
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/products`));
    return () => unsubscribe();
  }, [myShop]);

  useEffect(() => {
    if (!myShop) return;
    const q = query(collection(db, 'shops', myShop.id, 'disbursements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDisbursements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/disbursements`));
    return () => unsubscribe();
  }, [myShop]);

  useEffect(() => {
    if (myShop?.type) {
      const type = (myShop.type || '').toLowerCase();
      if (type.includes('atacado')) setCommOperation('atacado');
      else if (type.includes('mercado')) setCommOperation('mercado');
      else if (type.includes('barraca')) setCommOperation('barraca');
      else if (type.includes('feirante')) setCommOperation('feirante');
    }
  }, [myShop]);

  // Listen to orders and manual sales, and update sales summary
  useEffect(() => {
    if (!user || !myShop) return;
    
    // Listen to orders
    let ordersQ;
    if (user.role === 'vendor') {
      ordersQ = query(
        collection(db, 'orders'),
        where('shopOwnerUid', '==', user.uid),
        where('shopId', '==', myShop.id),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else if ((user.role === 'admin' || user.role === 'state_admin') && (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(user.email || ''))) {
      ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
    } else {
      ordersQ = query(collection(db, 'orders'), where('buyerUid', '==', user.uid), orderBy('createdAt', 'desc'), limit(50));
    }

    // Listen to manual sales
    const manualSalesQ = query(collection(db, 'shops', myShop.id, 'sales'), orderBy('createdAt', 'desc'), limit(50));

    let currentOrders: any[] = [];
    let currentManual: any[] = [];

    const updateSales = () => {
      const completedOrders = currentOrders.filter(o => o.status === 'completed');
      const combined = [...completedOrders, ...currentManual].sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setSales(combined);
      setLoading(false);
    };

    const unsubOrders = onSnapshot(ordersQ, (snapshot) => {
      currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(currentOrders);
      updateSales();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    const unsubManual = onSnapshot(manualSalesQ, (snapshot) => {
      currentManual = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'manual' }));
      updateSales();
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/sales`));

    return () => {
      unsubOrders();
      unsubManual();
    };
  }, [user, myShop]);

  const [commPaymentMethod, setCommPaymentMethod] = useState<'money' | 'pix' | 'card'>('money');

  const totalSalesValue = sales.reduce((acc, sale) => acc + (sale.totalValue || 0), 0);
  const totalProductsSold = sales.reduce((acc, sale) => acc + (sale.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0), 0);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data();
      if (!orderData || !myShop) return;

      // Restrição: Apenas o dono da loja pode processar o pedido
      if (orderData.shopOwnerUid !== user?.uid) {
        showNotification('Erro: Apenas o vendedor pode atualizar o status deste pedido.', 'error');
        return;
      }

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

      // SINCRONIZAÇÃO DE ESTOQUE PARA DESEMBOLSO ENTRE PARCEIROS
      if (newStatus === 'completed') {
        const orderSnap = await getDoc(orderRef);
        const order = orderSnap.data();
        
        if (order && order.source === 'partner_disbursement' && order.stockSyncPending) {
          try {
            // 1. Localizar a loja do comprador (quem gerou o desembolso)
            const buyerShopsQuery = query(collection(db, 'shops'), where('ownerUid', '==', order.buyerUid));
            const buyerShopsSnap = await getDocs(buyerShopsQuery);
            
            if (!buyerShopsSnap.empty) {
              const buyerShop = buyerShopsSnap.docs[0];
              const buyerShopId = buyerShop.id;
              
              // 2. Buscar catálogo do comprador para bater nomes
              const buyerProductsQuery = query(collection(db, 'shops', buyerShopId, 'products'));
              const buyerProductsSnap = await getDocs(buyerProductsQuery);
              const buyerProducts = buyerProductsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

              // 3. Atualizar estoque de cada item no comprador
              for (const item of order.items) {
                const matchingProduct = buyerProducts.find((p: any) => p.name === item.name);
                if (matchingProduct) {
                  const buyerProdRef = doc(db, 'shops', buyerShopId, 'products', matchingProduct.id);
                  await updateDoc(buyerProdRef, {
                    stock: increment(item.quantity * (item.weight || 1))
                  });
                }
              }

              // 4. Marcar como sincronizado para não repetir se mudar status de novo
              await updateDoc(orderRef, { stockSyncPending: false });
              showNotification('Estoque do parceiro atualizado com sucesso!', 'success');
            }
          } catch (syncErr) {
            console.error("Erro na sincronização de estoque entre parceiros:", syncErr);
          }
        }
      }
      
      showNotification(`Pedido ${(translateStatus(newStatus) || '').toLowerCase()} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const acceptOrder = (orderId: string) => updateOrderStatus(orderId, 'accepted');
  const waitingPayment = (orderId: string) => updateOrderStatus(orderId, 'pending_payment');
  const paymentAccepted = (orderId: string) => updateOrderStatus(orderId, 'paid');
  const prepareOrder = (orderId: string) => updateOrderStatus(orderId, 'preparing');
  const deliveryOrder = (orderId: string) => updateOrderStatus(orderId, 'shipped');
  const pickupReady = (orderId: string) => updateOrderStatus(orderId, 'ready');
  const completeOrder = (orderId: string) => updateOrderStatus(orderId, 'completed');
  const cancelOrder = (orderId: string) => {
    showConfirm(
      'Cancelar Pedido',
      'Deseja realmente cancelar este pedido? O estoque será devolvido e a ação não pode ser desfeita.',
      () => updateOrderStatus(orderId, 'cancelled')
    );
  };

  const deleteOrderSales = async (orderId: string) => {
    showConfirm(
      'Excluir Pedido', 
      'Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.', 
      async () => {
        try {
          await deleteDoc(doc(db, 'orders', orderId));
          showNotification('Pedido excluído com sucesso.', 'success');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-transparent pb-32">
      <div className="w-full px-4 md:px-8">
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
              { id: 'commercialization', label: 'Comercialização', icon: Banknote },
              { id: 'disbursements', label: 'Desembolso', icon: Wallet },
              { id: 'cashflow', label: 'Fluxo de Caixa', icon: BarChart3 },
              { id: 'payment_methods', label: 'Métodos de Pagamento', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-105" 
                    : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

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
                              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-brand-600 transition-all overflow-hidden shrink-0">
                                <SafeImage src={myShop?.photoURL || sale.shopPhotoURL} type="shop" className="w-full h-full object-cover" />
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
                  <div className="bg-white text-slate-950 p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-xl font-black font-display mb-6 text-slate-900">Resumo Contábil</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Média de Venda</span>
                        <span className="text-lg font-black text-slate-900">R$ {(totalSalesValue / (sales.length || 1)).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Crescimento</span>
                        <span className="text-emerald-500 font-black flex items-center gap-1">
                          <ArrowUpRight size={16} /> 12%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigate('vendor-accounting')}
                      className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 uppercase"
                    >
                      Ver Contabilidade Completa
                    </button>
                  </div>

                  <div className="bg-white text-slate-950 p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-xl font-black font-display mb-6 text-slate-900">Pedidos Ativos</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aguardando</span>
                        <span className={cn(
                          "text-lg font-black",
                          orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 ? "text-amber-500" : "text-slate-900"
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
                          Lojas que respondem o bate papo em menos de 5 minutos vendem <span className="text-brand-600 font-bold">3x mais</span>.
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
            ) : activeTab === 'commercialization' ? (
              <motion.div
                key="commercialization"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-transparent space-y-8"
              >
                {/* Painel de Lançamento */}
                <div className="bg-[#FFFFFF] rounded-[48px] shadow-none border border-slate-100 overflow-hidden opacity-100 backdrop-filter-none filter-none">
                  {/* Header */}
                  <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 font-display flex items-center gap-3">
                        Painel de Lançamento
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1">COMERCIALIZAÇÃO DE VENDAS & ESTOQUE</p>
                    </div>
                    
                <div className="flex bg-white border border-slate-100 p-1 rounded-2xl">
                      <button 
                        onClick={() => setCommType('sale')}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          commType === 'sale' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Venda
                      </button>
                      <button 
                        onClick={() => setCommType('disbursement')}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          commType === 'disbursement' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Desembolso
                      </button>
                    </div>
                  </div>

                  <div className="p-10 space-y-12">
                    {/* BUSCA DE LOJA (Apenas para Desembolso) */}
                    {commType === 'disbursement' && (
                      <div className="space-y-4 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Vendedor Parceiro (Opcional)</label>
                        <div className="relative group">
                          <Store className={cn(
                            "absolute left-6 top-1/2 -translate-y-1/2 transition-colors",
                            showTargetShopSearch ? "text-blue-500" : "text-slate-300"
                          )} size={24} />
                          <input 
                            type="text"
                            value={commTargetSearch || ''}
                            onChange={(e) => {
                              setCommTargetSearch(e.target.value);
                              setShowTargetShopSearch(true);
                              if (commTargetShop && e.target.value !== commTargetShop.name) {
                                setCommTargetShop(null);
                              }
                            }}
                            onFocus={() => setShowTargetShopSearch(true)}
                            placeholder="Pesquisar Loja Criada / Atacado..."
                            className="w-full pl-16 pr-8 py-8 bg-white border border-slate-100 rounded-[32px] outline-none text-2xl font-black text-slate-900 placeholder:text-slate-300 transition-all focus:border-blue-500 shadow-sm"
                          />
                          {commTargetSearch && (
                            <button 
                              onClick={() => {
                                setCommTargetSearch('');
                                setCommTargetShop(null);
                                setShowTargetShopSearch(false);
                              }}
                              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full text-slate-300"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {showTargetShopSearch && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[32px] shadow-2xl z-50 overflow-hidden"
                            >
                              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                                {allShops
                                  .filter(s => s.id !== myShop?.id && (s.name || '').toLowerCase().includes((commTargetSearch || '').toLowerCase()))
                                  .map(s => (
                                    <button
                                      key={s.id}
                                      onClick={() => {
                                        setCommTargetShop(s);
                                        setCommTargetSearch(s.name);
                                        setShowTargetShopSearch(false);
                                      }}
                                      className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-blue-100"
                                    >
                                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                                        <SafeImage src={s.photoURL} type="shop" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="text-left flex-1">
                                        <h4 className="font-black text-slate-900">{s.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.type || s.category} • {s.city}</p>
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* DADOS DO CLIENTE E OPERAÇÃO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Nome do Cliente (Opcional)</label>
                        <div className="relative group">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                          <input 
                            type="text"
                            value={commBuyerName}
                            onChange={(e) => setCommBuyerName(e.target.value)}
                            placeholder="Ex: Maria das Graças"
                            className="w-full pl-16 pr-8 py-8 bg-white border border-slate-100 rounded-[32px] outline-none text-2xl font-black text-slate-900 placeholder:text-slate-300 transition-all focus:border-emerald-500 shadow-sm"
                          />
                        </div>
                      </div>

                      {/* TIPO DE OPERAÇÃO */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">SUA LOJA</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { id: 'feirante', label: 'FEIRA LIVRE', icon: Tent },
                            { id: 'barraca', label: 'Barraca Livre', icon: Store },
                            { id: 'mercado', label: 'Mercado Livre', icon: ShoppingBag },
                            { id: 'atacado', label: 'Atacado Livre', icon: Truck },
                          ].map(op => (
                            <button
                              key={op.id}
                              onClick={() => setCommOperation(op.id as any)}
                              className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all gap-3 group relative overflow-hidden",
                                commOperation === op.id 
                                  ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-md" 
                                  : "border-slate-100 hover:border-emerald-200 text-slate-400"
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                commOperation === op.id ? "bg-emerald-50" : "bg-white group-hover:bg-emerald-50"
                              )}>
                                <op.icon size={24} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-center">{op.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SELEÇÃO RÁPIDA DO CATÁLOGO */}
                    {(commTargetShop ? commTargetProducts : products).length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {commTargetShop ? `Catálogo de ${commTargetShop.name}` : 'Catálogo Rápido'}
                          </label>
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Toque para selecionar</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                          {(commTargetShop ? commTargetProducts : products).slice(0, 8).map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setCommSelectedProduct(p);
                                setCommPrice(p.price);
                                setCommUnit(p.unit as any);
                                setCommSearch(p.name);
                                setShowProductSearch(false);
                              }}
                              className={cn(
                                "flex-shrink-0 w-32 flex flex-col items-center gap-2 p-3 bg-white border rounded-2xl transition-all active:scale-95",
                                commSelectedProduct?.id === p.id 
                                  ? (commTargetShop ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg" : "border-emerald-500 ring-2 ring-emerald-500/10 shadow-lg")
                                  : "border-slate-100 shadow-sm"
                              )}
                            >
                              <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                                <SafeImage src={p.photoURL} type="product" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-black text-slate-900 truncate w-full text-center">{p.name}</span>
                              <span className="text-[9px] font-bold text-emerald-600">R$ {(p.price || 0).toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PRODUTO SELECIONADO */}
                    <div className="space-y-4 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Produto Selecionado</label>
                      <div className="relative group">
                        <Search className={cn(
                          "absolute left-6 top-1/2 -translate-y-1/2 transition-colors",
                          showProductSearch ? "text-emerald-500" : "text-slate-300"
                        )} size={24} />
                        <input 
                          type="text"
                          value={commSearch || ''}
                          onChange={(e) => {
                            setCommSearch(e.target.value);
                            setShowProductSearch(true);
                            if (commSelectedProduct && e.target.value !== commSelectedProduct.name) {
                              setCommSelectedProduct(null);
                            }
                          }}
                          onFocus={() => setShowProductSearch(true)}
                          placeholder="Nome do Produto ou Buscar Catálogo..."
                          className="w-full pl-16 pr-8 py-8 bg-slate-50 border border-slate-100 rounded-[32px] outline-none text-2xl font-black text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white focus:border-emerald-500 shadow-inner"
                        />
                        {commSearch && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommSearch('');
                              setCommSelectedProduct(null);
                              setShowProductSearch(false);
                            }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full text-slate-300"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {showProductSearch && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-[32px] shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                              {(commTargetShop ? commTargetProducts : products).length > 0 && (
                                <div className="px-4 py-2 border-b border-slate-50 mb-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {commTargetShop ? `Resultados de ${commTargetShop.name}` : 'Resultados do Catálogo'}
                                  </span>
                                </div>
                              )}
                              
                              {(commTargetShop ? commTargetProducts : products)
                                .filter(p => (p.name || '').toLowerCase().includes((commSearch || '').toLowerCase()))
                                .map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setCommSelectedProduct(p);
                                      setCommPrice(p.price);
                                      setCommUnit(p.unit as any);
                                      setShowProductSearch(false);
                                      setCommSearch(p.name);
                                    }}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-emerald-100"
                                  >
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                                      <SafeImage src={p.photoURL} type="product" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left flex-1">
                                      <h4 className="font-black text-slate-900">{p.name}</h4>
                                      <p className="text-[10px] font-bold text-emerald-600 uppercase">R$ {(p.price || 0).toFixed(2)} / {translateUnit(p.unit)}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400">
                                      {p.stock} em estoque
                                    </div>
                                  </button>
                                ))}

                              {(commTargetShop ? commTargetProducts : products).filter(p => (p.name || '').toLowerCase().includes((commSearch || '').toLowerCase())).length === 0 && (
                                <div className="p-8 text-center bg-slate-50/50 rounded-3xl m-2 border border-dashed border-slate-200">
                                  <p className="text-slate-400 text-xs font-bold font-display uppercase tracking-widest">Produto Manual</p>
                                  <p className="text-[10px] text-slate-300 mt-1 italic">"{commSearch}" será registrado como item manual</p>
                                  <button 
                                     onClick={() => setShowProductSearch(false)}
                                     className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform hover:bg-emerald-700"
                                  >
                                    Confirmar Nome Manual
                                  </button>
                                </div>
                              )}

                              <button 
                                onClick={() => setShowProductSearch(false)}
                                className="w-full p-3 text-center text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest"
                              >
                                Fechar Sugestões
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* PREÇO VENDA (R$) */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Preço Venda (R$)</label>
                      <div className="relative group">
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300 pointer-events-none transition-colors group-focus-within:text-emerald-500">
                          R$
                        </div>
                        <input 
                          type="number"
                          value={commPrice || ''}
                          onChange={(e) => setCommPrice(parseFormattedNumber(e.target.value))}
                          placeholder="0,00"
                          className="w-full pl-20 pr-8 py-8 bg-slate-50 border border-slate-100 rounded-[32px] outline-none text-6xl font-black text-slate-900 placeholder:text-slate-200 transition-all focus:bg-white focus:border-emerald-500 focus:shadow-xl focus:shadow-emerald-500/10 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* MERCADORIAS DE VENDAS */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">MERCADORIAS DE VENDAS</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                        {[
                          { id: 'unit', label: 'Unidade', icon: Package },
                          { id: 'kg', label: 'Quilo', icon: Scale },
                          { id: 'gram', label: 'Grama', icon: Scale },
                          { id: 'box', label: 'Caixa', icon: Box },
                          { id: 'bag', label: 'Saco', icon: ShoppingBag },
                        ].map(unit => (
                          <button
                            key={unit.id}
                            onClick={() => setCommUnit(unit.id as any)}
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-[24px] border-2 transition-all gap-2 group",
                              commUnit === unit.id 
                                ? "border-emerald-500 bg-emerald-50/30 text-emerald-700" 
                                : "border-slate-50 hover:border-emerald-200 text-slate-400 bg-slate-50/30"
                            )}
                          >
                             <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              commUnit === unit.id ? "bg-emerald-100" : "bg-slate-50 group-hover:bg-emerald-50"
                            )}>
                              <unit.icon size={20} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{unit.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CALCULADORA DE PESO/QUANTIDADE */}
                    <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                      
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Calculator size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Calculadora de Peso/Quantidade</span>
                      </div>

                      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-black">#</div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">Balança Digital</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Quantidade</label>
                            <input 
                              type="number"
                              value={commQuantity || ''}
                              onChange={(e) => setCommQuantity(parseFormattedNumber(e.target.value))}
                              className="w-full p-6 bg-slate-50 rounded-2xl outline-none text-4xl font-black text-slate-900 border border-slate-100 focus:border-emerald-500 transition-all shadow-inner"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                              {commUnit === 'kg' ? 'Peso por Quilo' : commUnit === 'gram' ? 'Peso por Grama' : 'Unidade'}
                            </label>
                            <div className="relative">
                              <input 
                                type="number"
                                value={commWeight || ''}
                                onChange={(e) => setCommWeight(parseFormattedNumber(e.target.value))}
                                className="w-full p-6 bg-slate-50 rounded-2xl outline-none text-4xl font-black text-slate-900 border border-slate-100 focus:border-emerald-500 transition-all shadow-inner"
                               />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {commUnit === 'kg' ? 'KG' : commUnit === 'gram' ? 'G' : commUnit === 'unit' ? 'UN' : commUnit === 'box' ? 'CX' : 'SC'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                          <p className="text-[10px] font-black text-brand-700 uppercase tracking-wide">
                            Resultado da Divulgação: <span className="text-slate-900">Este produto será divulgado como: {commQuantity * commWeight} por {(translateUnit(commUnit) || '').toLowerCase()}</span>
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={addToCommList}
                        className={cn(
                          "w-full py-7 rounded-[32px] font-black uppercase tracking-[0.1em] shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-95",
                          commPrice > 0 && (commSelectedProduct || commSearch)
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Plus size={24} />
                        {commSelectedProduct || commSearch ? `Adicionar ${commSearch || 'Item'} ao Pedido` : 'Preencha os Dados para Adicionar'}
                      </button>

                      {commItems.length > 0 && (
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center justify-between px-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtos no Pedido ({commItems.length})</label>
                             <button 
                               onClick={() => setCommItems([])}
                               className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600"
                             >
                               Limpar Lista
                             </button>
                          </div>
                          <div className="space-y-3 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            {commItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group/row">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 font-black text-xs uppercase">
                                    {item.productName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-900 text-sm">{item.productName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      {item.quantity} x R$ {(item.price || 0).toFixed(2)} / {translateUnit(item.unit)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-black text-slate-900">R$ {(item.totalValue || 0).toFixed(2)}</span>
                                  <button 
                                    onClick={() => setCommItems(commItems.filter(i => i.id !== item.id))}
                                    className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center border-t border-slate-50 mt-2">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</span>
                               <span className="text-2xl font-black text-brand-600">R$ {(commTotal || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MÉTODO DE PAGAMENTO */}
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col gap-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Forma de Pagamento</span>
                      <div className="flex gap-4">
                        {[
                          { id: 'money', label: 'Dinheiro', icon: Banknote },
                          { id: 'pix', label: 'Pix', icon: Zap },
                          { id: 'card', label: 'Cartão', icon: CreditCard },
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setCommPaymentMethod(method.id as any)}
                            className={cn(
                              "flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all",
                              commPaymentMethod === method.id 
                                ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/20" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-brand-200"
                            )}
                          >
                            <method.icon size={20} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* VALOR RECEBIDO / TROCO */}
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mt-16 blur-2xl" />
                       
                       <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                           <Banknote size={32} />
                         </div>
                         <div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Valor Recebido</span>
                           <div className="flex items-center gap-3">
                             <span className="text-xl font-black text-slate-300">R$</span>
                             <input 
                               type="number"
                               value={commReceived || ''}
                               onChange={(e) => setCommReceived(parseFormattedNumber(e.target.value))}
                               placeholder="0,00"
                               className="bg-transparent border-none outline-none text-4xl font-black text-slate-950 placeholder:text-slate-200 w-40"
                             />
                           </div>
                         </div>
                       </div>

                       <div className="text-right">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">
                           {commChange >= 0 ? 'Troco Sugerido' : 'Falta Receber'}
                         </span>
                         <div className={cn(
                           "text-4xl font-black flex items-center gap-3 justify-end",
                           commChange >= 0 ? "text-emerald-600" : "text-amber-600"
                         )}>
                           <span className="text-xl text-slate-300">R$</span>
                           {(Math.abs(commChange) || 0).toFixed(2)}
                         </div>
                       </div>
                    </div>

                    {/* RESUMO DA VENDA */}
                    <div className="bg-brand-600 p-12 rounded-[48px] text-white space-y-10 shadow-2xl shadow-brand-600/30 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-125 duration-1000" />
                      
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                           <CheckCircle size={16} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Resumo da {commType === 'sale' ? 'Venda' : 'Compra'}</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block">Total a {commType === 'sale' ? 'Receber' : 'Pagar'}</span>
                        <div className="flex items-end gap-3 leading-none">
                           <span className="text-2xl font-black opacity-40 mb-2">R$</span>
                           <span className="text-8xl font-black font-display tracking-tighter">{(commTotal || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="grid grid-cols-2 gap-8">
                         <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Quant. Itens</span>
                            <span className="text-xl font-black text-white">{commItems.length || (commQuantity > 0 ? 1 : 0)}</span>
                         </div>
                         <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Peso Total</span>
                            <span className="text-xl font-black text-white">
                              {commItems.reduce((acc, i) => acc + (i.quantity * i.weight), 0) || (commQuantity * (commWeight || 1))}
                            </span>
                         </div>
                      </div>

                      <button 
                        onClick={async () => {
                          if (commItems.length === 0 && (!commPrice || commQuantity <= 0)) {
                            showNotification('Adicione itens ao pedido primeiro.', 'error');
                            return;
                          }
                          
                          setIsSavingComm(true);
                          try {
                            const now = Timestamp.now();
                            const finalItems = commItems.length > 0 ? commItems : [{
                              productName: commSelectedProduct ? commSelectedProduct.name : (commSearch || 'Item Manual'),
                              productId: commSelectedProduct?.id || null,
                              targetShopId: commTargetShop?.id || null,
                              targetShopName: commTargetShop?.name || null,
                              price: commPrice || 0,
                              cost: commSelectedProduct?.cost || 0,
                              unit: commUnit || 'unit',
                              quantity: commQuantity || 0,
                              weightPerUnit: commWeight || 1,
                              weight: commWeight || 1,
                              totalValue: Number((commPrice * (commQuantity || 0) * (commWeight || 1)).toFixed(2))
                            }];

                            const totalCost = finalItems.reduce((acc, item) => acc + ((item.cost || 0) * (item.quantity || 0) * (item.weight || 1)), 0);
                            const totalValue = Number(finalItems.reduce((acc, item) => acc + (item.totalValue || 0), 0).toFixed(2));

                            const saleData = sanitizeForFirestore({
                              type: 'manual',
                              operation: commOperation,
                              items: finalItems.map(item => ({
                                name: item.productName || 'Item',
                                quantity: item.quantity || 0,
                                weightPerUnit: item.weightPerUnit || item.weight || 1,
                                weight: item.weightPerUnit || item.weight || 1,
                                unit: item.unit || 'unit',
                                price: item.price || 0,
                                total: item.totalValue || 0
                              })),
                              totalValue: totalValue,
                              totalCost: totalCost,
                              received: commReceived || 0,
                              change: commChange || 0,
                              paymentMethod: commPaymentMethod,
                              buyerName: commBuyerName || 'Venda Direta',
                              shopId: myShop?.id || null,
                              shopOwnerUid: user?.uid || null,
                              createdAt: now,
                              updatedAt: now
                            });

                            if (commType === 'disbursement') {
                              let orderId = null;
                              
                              // Create an order for the target shop if it exists
                              if (commTargetShop) {
                                try {
                                  const orderData = sanitizeForFirestore({
                                    buyerUid: user?.uid,
                                    buyerName: myShop?.name || user?.displayName || 'Comprador Parceiro',
                                    buyerPhone: myShop?.whatsapp || user?.phone || '',
                                    shopId: commTargetShop.id,
                                    shopName: commTargetShop.name,
                                    shopOwnerUid: commTargetShop.ownerUid || '',
                                    items: finalItems.map(item => ({
                                      productId: item.productId || null,
                                      name: item.productName,
                                      quantity: item.quantity,
                                      price: item.price,
                                      unit: item.unit,
                                      weight: item.weight,
                                      total: item.totalValue
                                    })),
                                    paymentMethod: commPaymentMethod,
                                    totalValue: totalValue,
                                    status: 'pending',
                                    deliveryType: 'pickup',
                                    createdAt: serverTimestamp(),
                                    updatedAt: serverTimestamp(),
                                    source: 'partner_disbursement',
                                    stockSyncPending: true 
                                  });
                                  
                                  const orderRef = await addDoc(collection(db, 'orders'), orderData);
                                  orderId = orderRef.id;
                                  
                                  await addDoc(collection(db, 'chatMessages'), {
                                    text: `📢 *Novo Pedido via Desembolso!* \n\nA loja *${myShop?.name}* solicitou uma compra de R$ ${totalValue.toFixed(2)} do seu catálogo.\n\nNúmero do Pedido: #${orderRef.id.slice(-6).toUpperCase()}\n\nAguardando sua confirmação para prosseguir.`,
                                    senderUid: user?.uid || '',
                                    receiverUid: commTargetShop?.ownerUid || '',
                                    shopName: myShop?.name || '',
                                    createdAt: now
                                  });
                                } catch (orderErr) {
                                  console.error("Erro ao criar pedido para loja parceira:", orderErr);
                                }
                              }

                              const disbursementData = sanitizeForFirestore({
                                ...saleData,
                                type: 'disbursement',
                                targetShopId: commTargetShop?.id || null,
                                targetShopName: commTargetShop?.name || null,
                                orderId: orderId,
                                status: commTargetShop ? 'pending' : 'completed',
                                createdAt: now,
                                updatedAt: now
                              });
                              
                              await addDoc(collection(db, 'shops', myShop!.id, 'disbursements'), disbursementData);

                              if (!commTargetShop) {
                                for (const item of finalItems) {
                                  if (item.productId) {
                                    const productRef = doc(db, 'shops', myShop!.id, 'products', item.productId);
                                    const pSnap = await getDoc(productRef);
                                    if (pSnap.exists()) {
                                      await updateDoc(productRef, {
                                        stock: increment(item.quantity * (item.weight || 1))
                                      });
                                    }
                                  }
                                }
                              }
                              
                              showNotification('Desembolso registrado! ' + (commTargetShop ? 'Pedido enviado ao parceiro.' : 'Estoque local atualizado.'), 'success');
                            } else {
                              await addDoc(collection(db, 'shops', myShop!.id, 'sales'), saleData);

                              // Baixar estoque para itens do catálogo
                              for (const item of finalItems) {
                                if (item.productId) {
                                  const productRef = doc(db, 'shops', myShop!.id, 'products', item.productId);
                                  const pSnap = await getDoc(productRef);
                                  if (pSnap.exists()) {
                                    await updateDoc(productRef, {
                                      stock: increment(-(item.quantity * (item.weight || 1))),
                                      salesCount: increment(item.quantity * (item.weight || 1))
                                    });
                                  }
                                }
                              }
                              showNotification('Venda registrada e estoque atualizado!', 'success');
                            }
                            
                            // Reset
                            setCommItems([]);
                            setCommSelectedProduct(null);
                            setCommSearch('');
                            setCommPrice(0);
                            setCommQuantity(1);
                            setCommWeight(1);
                            setCommReceived(0);
                            setCommTargetShop(null);
                            setCommTargetSearch('');
                            
                          } catch (err) {
                            handleFirestoreError(err, OperationType.CREATE, 'manual-sale');
                          } finally {
                            setIsSavingComm(false);
                          }
                        }}
                        disabled={isSavingComm}
                        className="w-full py-6 bg-white text-brand-600 rounded-[32px] font-black uppercase tracking-[0.1em] shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
                      >
                        {isSavingComm ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Confirmar e Finalizar {commType === 'sale' ? 'Venda' : 'Pedido de Compra'}
                      </button>
                    </div>

                    {/* HISTÓRICO RECENTE DE LANÇAMENTOS */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                               <TrendingUp size={20} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 font-display">Lançamentos Recentes</h4>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos Lançamentos</span>
                      </div>
                      
                      <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                        {sales.filter(s => s.type === 'manual').slice(0, 10).map((sale) => (
                          <div key={sale.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase",
                                    sale.operation === 'feirante' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                  )}>
                                    {sale.operation === 'feirante' ? <Tent size={18} /> : <Store size={18} />}
                                  </div>
                                  <div>
                                    <h5 className="font-black text-slate-900 text-sm">
                                      {sale.buyerName || 'Venda Manual'}
                                    </h5>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                      {sale.createdAt?.toDate().toLocaleDateString()} • {sale.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.operation || 'Geral'} • {translatePaymentMethod(sale.paymentMethod)}
                                    </p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className="text-lg font-black text-slate-900">R$ {sale.totalValue?.toFixed(2)}</span>
                               </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sale.items?.map((item: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-bold text-slate-400">
                                  {item.quantity} {translateUnit(item.unit || 'un')} x {item.name} {(item.weightPerUnit || item.weight) > 0 && `(${(item.weightPerUnit || item.weight)}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''})`} • R$ {item.price.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {sales.filter(s => s.type === 'manual').length === 0 && (
                          <div className="p-12 text-center text-slate-400">
                             <Package size={32} className="mx-auto mb-4 opacity-20" />
                             <p className="text-xs font-bold font-display uppercase tracking-widest">Nenhuma venda manual hoje</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DICA PRÁTICA */}
                    <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex items-start gap-4">
                       <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                         <Info size={20} />
                       </div>
                       <div>
                         <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">Dica Prática</span>
                         <p className="text-xs text-slate-600 font-medium leading-relaxed">
                           Confira sempre a tara da balança. O Peso Real multiplicado pelo Preço Base garante a precisão do lucro diário no mercado livre.
                         </p>
                       </div>
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
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                          <SafeImage src={product.photoURL} type="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
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
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                    <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 font-display">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={20} />
                      </div>
                      Gestão de Pedidos 
                    </h3>
                    
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto max-w-full no-scrollbar">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'pending', label: 'Recebidos' },
                        { id: 'pending_payment', label: 'Pagamento' },
                        { id: 'preparing', label: 'Preparando' },
                        { id: 'delivery', label: 'Entrega' },
                        { id: 'completed', label: 'Concluídos' },
                        { id: 'cancelled', label: 'Cancelados' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setOrderFilter(filter.id)}
                          className={cn(
                            "px-6 py-3 rounded-[14px] font-black uppercase tracking-widest text-[9px] transition-all whitespace-nowrap",
                            orderFilter === filter.id 
                              ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/5 ring-1 ring-slate-100" 
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {orders
                      .filter(o => {
                        if (orderFilter === 'all') return true;
                        if (orderFilter === 'pending') return o.status === 'pending' || o.status === 'accepted';
                        if (orderFilter === 'pending_payment') return o.status === 'pending_payment' || o.status === 'paid';
                        if (orderFilter === 'delivery') return o.status === 'shipped' || o.status === 'ready';
                        return o.status === orderFilter;
                      })
                      .map(order => (
                        <SellerOrderCard 
                          key={order.id} 
                          order={order} 
                          shopPhoto={myShop?.photoURL}
                          onUpdateStatus={updateOrderStatus}
                          onCancel={cancelOrder}
                          onDelete={deleteOrderSales}
                        />
                      ))}
                    {orders.length === 0 && (
                      <div className="py-32 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                           <ShoppingBag size={40} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-2">Nenhum Pedido Encontrado</h4>
                        <p className="text-slate-400 text-sm font-medium max-w-xs">
                          Você ainda não recebeu pedidos nesta categoria. Quando surgirem, eles aparecerão aqui.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'cashflow' ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 font-display tracking-tight">Fluxo de Caixa</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Consolidado de Receitas e Despesas</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Líquido</p>
                      {(() => {
                        const totalCatalog = orders.reduce((acc, o) => acc + (o.totalValue || 0), 0);
                        const totalManual = sales.reduce((acc, s) => acc + (s.totalValue || 0), 0);
                        const totalDisb = disbursements.reduce((acc, d) => acc + (d.totalValue || 0), 0);
                        const balance = (totalCatalog + totalManual) - totalDisb;
                        return (
                          <p className={cn(
                            "text-3xl font-black font-display tracking-tighter",
                            balance >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            R$ {balance.toFixed(2)}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Form de Contas a Receber/Pagar */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                        <Plus size={20} />
                     </div>
                     <h4 className="text-xl font-black text-slate-900 font-display uppercase tracking-widest">Registrar Nova Conta</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Lançamento</label>
                       <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl">
                          <button 
                            onClick={() => setCashForm({...cashForm, type: 'receivable'})}
                            className={cn(
                              "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              cashForm.type === 'receivable' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}>Receber (Venda)</button>
                          <button 
                            onClick={() => setCashForm({...cashForm, type: 'payable'})}
                            className={cn(
                              "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              cashForm.type === 'payable' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}>Pagar (Compra)</button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Cliente/Fornecedor</label>
                       <input 
                         type="text" 
                         value={cashForm.person}
                         onChange={(e) => setCashForm({...cashForm, person: e.target.value})}
                         className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                         placeholder="Ex: João Silva ou Distribuidora X"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Produto/Serviço</label>
                       <input 
                         type="text" 
                         value={cashForm.product}
                         onChange={(e) => setCashForm({...cashForm, product: e.target.value})}
                         className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                         placeholder="Ex: Caixa de Tomate"
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Preço Base (R$)</label>
                         <input 
                           type="number" 
                           value={cashForm.price || ''}
                           onChange={(e) => setCashForm({...cashForm, price: parseFloat(e.target.value) || 0})}
                           className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-brand-500 transition-all"
                           placeholder="0.00"
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Quantidade</label>
                        <input 
                          type="number"
                          value={cashForm.quantity || ''}
                          onChange={(e) => setCashForm({...cashForm, quantity: parseFloat(e.target.value) || 1})}
                          className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-brand-500 transition-all"
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Peso/Medida Unitária</label>
                         <div className="flex gap-2">
                           <input 
                             type="number" 
                             value={cashForm.weight || ''}
                             onChange={(e) => setCashForm({...cashForm, weight: e.target.value})}
                             className="w-24 bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-black focus:ring-2 focus:ring-brand-500 transition-all"
                             placeholder="Ex: 20"
                           />
                           <select 
                             value={cashForm.unit}
                             onChange={(e) => setCashForm({...cashForm, unit: e.target.value})}
                             className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-4 text-[10px] font-black uppercase focus:ring-2 focus:ring-brand-500 transition-all"
                           >
                             <option value="un">UN</option>
                             <option value="kg">KG</option>
                             <option value="gram">G</option>
                             <option value="cx">CX</option>
                             <option value="sac">SAC</option>
                           </select>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data do Registro</label>
                       <input 
                         type="date" 
                         value={cashForm.date}
                         onChange={(e) => setCashForm({...cashForm, date: e.target.value})}
                         className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-500 transition-all"
                       />
                    </div>
                    <div className="flex items-end">
                      <button 
                         disabled={!cashForm.product || !cashForm.price || isSavingCash}
                         onClick={async () => {
                           if (!myShop) return;
                           setIsSavingCash(true);
                           try {
                             const timestamp = Timestamp.fromDate(new Date(cashForm.date + 'T' + new Date().toTimeString().split(' ')[0]));
                             const data = {
                               type: 'manual',
                               operation: 'feirante',
                               items: [{
                                 name: cashForm.product,
                                 quantity: cashForm.quantity,
                                 unit: cashForm.unit,
                                 price: cashForm.price,
                                 total: Number((cashForm.price * (cashForm.quantity || 1) * (parseFloat(String(cashForm.weight)) || 1)).toFixed(2)),
                                 weightPerUnit: parseFloat(String(cashForm.weight)) || 1,
                                 weight: parseFloat(String(cashForm.weight)) || 1
                               }],
                               totalValue: Number((cashForm.price * (cashForm.quantity || 1) * (parseFloat(String(cashForm.weight)) || 1)).toFixed(2)),
                               paymentMethod: 'Dinheiro',
                               buyerName: cashForm.person || 'Manual',
                               shopId: myShop.id,
                               shopOwnerUid: user?.uid,
                               createdAt: timestamp,
                               updatedAt: timestamp
                             };

                             if (cashForm.type === 'receivable') {
                               await addDoc(collection(db, 'shops', myShop.id, 'sales'), data);
                               showNotification('Conta a receber registrada!');
                             } else {
                               await addDoc(collection(db, 'shops', myShop.id, 'disbursements'), {
                                 ...data,
                                 targetShopName: cashForm.person || 'Fornecedor Manual',
                                 status: 'completed'
                               });
                               showNotification('Conta a pagar registrada!');
                             }
                             
                             // Reset form
                             setCashForm({
                               ...cashForm,
                               product: '',
                               person: '',
                               price: 0,
                               quantity: 1
                             });
                           } catch (err) {
                             console.error(err);
                             showNotification('Erro ao salvar registro', 'error');
                           } finally {
                             setIsSavingCash(false);
                           }
                         }}
                         className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {isSavingCash ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                         Concluir e Salvar na Aba
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categorias Consolidadas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* VENDAS DE CATÁLOGO */}
                  <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-brand-50/30 flex items-center justify-between">
                       <h4 className="text-sm font-black text-brand-900 font-display uppercase tracking-widest flex items-center gap-2">
                          <ShoppingBag size={16} /> Vendas de Catálogo
                       </h4>
                       <span className="text-xl font-black text-brand-600">R$ {orders.reduce((acc, o) => acc + (o.totalValue || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                      {orders.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).map((order) => (
                        <div key={order.id} className="p-6 hover:bg-slate-50 transition-all group">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h5 className="font-black text-slate-900 text-xs">{order.buyerName || 'Cliente Direto'}</h5>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {order.createdAt?.toDate().toLocaleDateString()} • {order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                              </div>
                              <span className="text-sm font-black text-slate-900">R$ {order.totalValue?.toFixed(2)}</span>
                           </div>
                           <div className="space-y-1">
                              {order.items?.map((item: any, idx: number) => (
                                <p key={idx} className="text-[9px] text-slate-400 flex justify-between">
                                  <span>{item.quantity} {translateUnit(item.unit || 'un')} x {item.name} {(item.weightPerUnit || item.weight || 0) > 0 ? `(${(item.weightPerUnit || item.weight)}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''})` : ''}</span>
                                  <span className="font-bold text-slate-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </p>
                              ))}
                           </div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma venda de catálogo</p>}
                    </div>
                  </div>

                  {/* VENDAS PAINEL LANÇAMENTO */}
                  <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-emerald-50/30 flex items-center justify-between">
                       <h4 className="text-sm font-black text-emerald-900 font-display uppercase tracking-widest flex items-center gap-2">
                          <Banknote size={16} /> Painel de Lançamento
                       </h4>
                       <span className="text-xl font-black text-emerald-600">R$ {sales.reduce((acc, s) => acc + (s.totalValue || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                      {sales.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).map((sale) => (
                        <div key={sale.id} className="p-6 hover:bg-slate-50 transition-all group">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h5 className="font-black text-slate-900 text-xs">{sale.buyerName || 'Venda Manual'}</h5>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {sale.createdAt?.toDate().toLocaleDateString()} • {sale.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                              </div>
                              <span className="text-sm font-black text-slate-900">R$ {sale.totalValue?.toFixed(2)}</span>
                           </div>
                           <div className="space-y-1">
                              {sale.items?.map((item: any, idx: number) => (
                                <p key={idx} className="text-[9px] text-slate-400 flex justify-between">
                                  <span>{item.quantity} {translateUnit(item.unit || 'un')} x {item.name} {(item.weightPerUnit || item.weight || 0) > 0 ? `(${(item.weightPerUnit || item.weight)}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''})` : ''}</span>
                                  <span className="font-bold text-slate-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </p>
                              ))}
                           </div>
                           <button 
                             onClick={() => showConfirm('Excluir Venda', 'Deseja excluir este registro manual?', () => deleteDoc(doc(db, 'shops', myShop!.id, 'sales', sale.id)))}
                             className="mt-3 text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all"
                           >Excluir Registro</button>
                        </div>
                      ))}
                      {sales.length === 0 && <p className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma venda manual</p>}
                    </div>
                  </div>

                  {/* DESEMBOLSOS / COMPRAS */}
                  <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-rose-50/30 flex items-center justify-between">
                       <h4 className="text-sm font-black text-rose-900 font-display uppercase tracking-widest flex items-center gap-2">
                          <Wallet size={16} /> Desembolsos e Compras
                       </h4>
                       <span className="text-xl font-black text-rose-600">R$ {disbursements.reduce((acc, d) => acc + (d.totalValue || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                      {disbursements.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).map((disb) => (
                        <div key={disb.id} className="p-6 hover:bg-slate-50 transition-all group">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h5 className="font-black text-slate-900 text-xs">{disb.targetShopName || 'Desembolso Geral'}</h5>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {disb.createdAt?.toDate().toLocaleDateString()} • {disb.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                              </div>
                              <span className="text-sm font-black text-slate-900">R$ {disb.totalValue?.toFixed(2)}</span>
                           </div>
                           <div className="space-y-1">
                              {disb.items?.map((item: any, idx: number) => (
                                <p key={idx} className="text-[9px] text-slate-400 flex justify-between">
                                  <span>{item.quantity} {translateUnit(item.unit || 'un')} x {item.name} {(item.weightPerUnit || item.weight || 0) > 0 ? `(${(item.weightPerUnit || item.weight)}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''})` : ''}</span>
                                  <span className="font-bold text-slate-500">R$ {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                </p>
                              ))}
                           </div>
                           <button 
                             onClick={() => showConfirm('Excluir Desembolso', 'Deseja excluir este registro de compra?', () => deleteDoc(doc(db, 'shops', myShop!.id, 'disbursements', disb.id)))}
                             className="mt-3 text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all"
                           >Excluir Registro</button>
                        </div>
                      ))}
                      {disbursements.length === 0 && <p className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum desembolso</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'disbursements' ? (
              <motion.div 
                key="disbursements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 font-display">
                      <Wallet className="text-blue-500" /> Relatório de Desembolsos e Compras
                    </h3>
                    {(() => {
                      const untrackedOrdersCount = buyerOrders.filter(o => !disbursements.some(d => d.orderId === o.id)).length;
                      const totalCount = disbursements.length + untrackedOrdersCount;
                      return (
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {totalCount} Registros
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-6">
                    {(() => {
                      // Get local disbursements
                      const localDisbs = [...disbursements];
                      
                      // Get buyer orders that are not already tracked in localDisbs
                      const untrackedOrders = buyerOrders.filter(o => !disbursements.some(d => d.orderId === o.id));
                      
                      // Map untracked orders to a disbursement-like structure
                      const adaptedOrders = untrackedOrders.map(o => ({
                        id: o.id,
                        orderId: o.id,
                        isOrderOnly: true,
                        totalValue: o.totalValue,
                        createdAt: o.createdAt,
                        targetShopName: o.shopName,
                        items: o.items,
                        status: o.status,
                        received: o.totalValue,
                        change: 0,
                        paymentMethod: o.paymentMethod
                      }));

                      // Combine and sort
                      const allRecords = [...localDisbs, ...adaptedOrders].sort((a, b) => {
                        const timeA = a.createdAt?.toMillis?.() || 0;
                        const timeB = b.createdAt?.toMillis?.() || 0;
                        return timeB - timeA;
                      });

                      return allRecords.map(disb => {
                        const linkedOrder = buyerOrders.find(o => o.id === (disb.orderId || disb.id));
                        const currentStatus = linkedOrder ? linkedOrder.status : disb.status || 'completed';
                        const isFromCatalog = (disb as any).isOrderOnly;

                        return (
                          <div key={disb.id} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100",
                                  currentStatus === 'completed' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                                )}>
                                  {currentStatus === 'completed' ? <CheckCircle size={24} /> : <ArrowUpCircle size={24} />}
                                </div>
                                <div>
                                   <div className="flex items-center gap-3">
                                     <h4 className="font-black text-slate-900 text-lg">
                                       {isFromCatalog ? 'Compra no Catálogo' : `Desembolso #${disb.id.slice(-6)}`}
                                     </h4>
                                     {(disb.targetShopName || (disb as any).shopName) && (
                                       <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                         Para: {disb.targetShopName || (disb as any).shopName}
                                       </span>
                                     )}
                                     {linkedOrder && (
                                       <span className={cn(
                                         "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                         currentStatus === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                       )}>
                                         {translateStatus(currentStatus)}
                                       </span>
                                     )}
                                   </div>
                                   <p className="text-xs text-slate-400 font-medium">
                                     {disb.createdAt?.toDate?.() ? (
                                       <>
                                         {disb.createdAt.toDate().toLocaleDateString()} às {disb.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       </>
                                     ) : 'Data não informada'}
                                   </p>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className={cn(
                                  "text-xl font-black",
                                  isFromCatalog ? "text-brand-600" : "text-blue-600"
                                )}>R$ {disb.totalValue?.toFixed(2)}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {isFromCatalog ? 'Valor da Compra' : 'Valor do Desembolso'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Produtos</label>
                                {disb.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center py-2 border-b border-white last:border-0 border-dashed">
                                    <div className="flex flex-col">
                                      <span className="text-slate-900 font-black text-sm">{item.name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                          {item.quantity} {translateUnit(item.unit || 'un')}
                                          {item.weight && ` (Peso/Medida: ${item.weight}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''})`}
                                        </span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">R$ {item.price.toFixed(2)}/und</span>
                                      </div>
                                    </div>
                                    <span className="font-black text-slate-900">R$ {item.total?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-white p-6 rounded-[24px] border border-slate-100 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</span>
                                    <span className="font-black text-slate-900">
                                      {isFromCatalog ? translatePaymentMethod((disb as any).paymentMethod) : `R$ ${disb.received?.toFixed(2)}`}
                                    </span>
                                 </div>
                                 {!isFromCatalog && (
                                   <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl">
                                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Troco Recebido</span>
                                      <span className="font-black text-blue-700">R$ {disb.change?.toFixed(2)}</span>
                                   </div>
                                 )}
                                 {currentStatus === 'completed' && (
                                   <div className="pt-2 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                     <CheckCircle size={14} /> Salvo e Concluído
                                   </div>
                                 )}
                              </div>
                            </div>
                            
                            {!isFromCatalog && (
                              <div className="mt-6 pt-6 border-t border-white flex justify-end">
                                 <button 
                                    onClick={() => {
                                      showConfirm(
                                        'Excluir Desembolso',
                                        'Deseja realmente excluir este registro de desembolso? Isso não afetará o estoque atualizado anteriormente.',
                                        async () => {
                                          try {
                                            await deleteDoc(doc(db, 'shops', myShop!.id, 'disbursements', disb.id));
                                            showNotification('Desembolso excluído com sucesso!');
                                          } catch (err) {
                                             handleFirestoreError(err, OperationType.DELETE, `disbursements/${disb.id}`);
                                          }
                                        }
                                      );
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                    {disbursements.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center">
                        <Wallet size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium italic">Nenhum desembolso registrado ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'payment_methods' ? (
              <motion.div 
                key="payment_methods"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                      <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 font-display">
                        <CreditCard className="text-brand-600" /> Configuração de Pagamentos
                      </h3>
                      <p className="text-slate-500 font-medium text-sm mt-1">Defina quais métodos você aceita para entregar e retirar.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!myShop) return;
                        try {
                          await updateDoc(doc(db, 'shops', myShop.id), {
                            deliveryPaymentMethods: myShop.deliveryPaymentMethods || ['Pix'],
                            pickupPaymentMethods: myShop.pickupPaymentMethods || ['Dinheiro'],
                            acceptsDelivery: !!myShop.acceptsDelivery,
                            acceptsPickup: !!myShop.acceptsPickup,
                            updatedAt: Timestamp.now()
                          });
                          showNotification('Métodos de pagamento salvos com sucesso!', 'success');
                        } catch (err) {
                          handleFirestoreError(err, OperationType.UPDATE, `shops/${myShop.id}`);
                        }
                      }}
                      className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center gap-2"
                    >
                      <Save size={16} /> Salvar Alterações
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* ENTREGA */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                             <Truck size={20} />
                           </div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Métodos para Entrega</h4>
                         </div>
                         <button 
                           onClick={() => setMyShop(prev => prev ? ({ ...prev, acceptsDelivery: !prev.acceptsDelivery }) : null)}
                           className={cn(
                             "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                             myShop?.acceptsDelivery ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                           )}
                         >
                           {myShop?.acceptsDelivery ? 'Habilitado' : 'Desabilitado'}
                         </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Cartão de crédito virtual', 'Cartão de débito virtual'].map(method => (
                          <button
                            key={method}
                            onClick={() => {
                              if (!myShop) return;
                              const current = myShop.deliveryPaymentMethods || [];
                              const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                              setMyShop({ ...myShop, deliveryPaymentMethods: next });
                            }}
                            className={cn(
                              "flex items-center justify-between p-5 rounded-2xl border-2 transition-all group",
                              myShop?.deliveryPaymentMethods?.includes(method)
                                ? "border-brand-600 bg-brand-50/30 text-brand-900"
                                : "border-slate-50 text-slate-400 hover:border-brand-200"
                            )}
                          >
                            <span className="font-black uppercase tracking-widest text-[10px]">{method}</span>
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                              myShop?.deliveryPaymentMethods?.includes(method) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-300"
                            )}>
                              {myShop?.deliveryPaymentMethods?.includes(method) ? <Check size={14} /> : <Plus size={14} />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RETIRADA */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                             <ShoppingBag size={20} />
                           </div>
                           <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Métodos para Retirada</h4>
                         </div>
                         <button 
                           onClick={() => setMyShop(prev => prev ? ({ ...prev, acceptsPickup: !prev.acceptsPickup }) : null)}
                           className={cn(
                             "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                             myShop?.acceptsPickup ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                           )}
                         >
                           {myShop?.acceptsPickup ? 'Habilitado' : 'Desabilitado'}
                         </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Cartão de crédito virtual', 'Cartão de débito virtual'].map(method => (
                          <button
                            key={method}
                            onClick={() => {
                              if (!myShop) return;
                              const current = myShop.pickupPaymentMethods || [];
                              const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                              setMyShop({ ...myShop, pickupPaymentMethods: next });
                            }}
                            className={cn(
                              "flex items-center justify-between p-5 rounded-2xl border-2 transition-all group",
                              myShop?.pickupPaymentMethods?.includes(method)
                                ? "border-emerald-600 bg-emerald-50/30 text-emerald-900"
                                : "border-slate-50 text-slate-400 hover:border-emerald-200"
                            )}
                          >
                            <span className="font-black uppercase tracking-widest text-[10px]">{method}</span>
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                              myShop?.pickupPaymentMethods?.includes(method) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-300"
                            )}>
                              {myShop?.pickupPaymentMethods?.includes(method) ? <Check size={14} /> : <Plus size={14} />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
      </PageContainer>
      </div>
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
    deliveryPaymentMethods: ['Pix'],
    pickupPaymentMethods: ['Dinheiro'],
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
                    value={formData.type || 'feirante'}
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
                <div className="relative">
                  <select 
                    value={formData.state || ''}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold appearance-none text-slate-600"
                  >
                    <option value="">Selecione</option>
                    {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Calendário e Horário de Funcionamento</label>
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px]">
                  <ScheduleManager 
                    schedule={formData.schedule}
                    onChange={s => setFormData({...formData, schedule: s})}
                    specialDates={formData.specialDates}
                    onSpecialDatesChange={dates => setFormData({...formData, specialDates: dates})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Métodos de Pagamento (Entrega)</label>
                <div className="flex flex-wrap gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Cartão de crédito virtual', 'Cartão de débito virtual'].map(method => (
                    <button 
                      key={method}
                      onClick={() => {
                        const current = formData.deliveryPaymentMethods || [];
                        const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                        setFormData({...formData, deliveryPaymentMethods: next});
                      }}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        formData.deliveryPaymentMethods?.includes(method) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Métodos de Pagamento (Retirada)</label>
                <div className="flex flex-wrap gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Cartão de crédito virtual', 'Cartão de débito virtual'].map(method => (
                    <button 
                      key={method}
                      onClick={() => {
                        const current = formData.pickupPaymentMethods || [];
                        const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                        setFormData({...formData, pickupPaymentMethods: next});
                      }}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        formData.pickupPaymentMethods?.includes(method) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
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
    { id: 'feira', label: 'FEIRA LIVRE', color: 'bg-emerald-500', icon: Store },
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
                  value={productName || ''}
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
                    value={quantity || 0}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unidade de Medida</label>
                  <select 
                    value={unit || 'unit'}
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
                      value={weightPerUnit || 0}
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
                    {quantity} {(translateUnit(unit) || '').toLowerCase()} 
                    {((unit === 'box' || unit === 'bag' || weightPerUnit > 1) && ` (${(priceType === 'per_unit' ? quantity * weightPerUnit : quantity).toFixed(2)} kg)`)}
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
        Seu cadastro como administrador foi recebido e está aguardando a aprovação de um administrador. 
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
      Feira Livre • Segurança & Gestão
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
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Privacidade e Segurança — Feira Livre</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Sua Confiança e Liberdade na Plataforma</p>
            </div>
          </div>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <p className="text-sm font-semibold text-slate-600">
              No aplicativo Feira Livre, queremos que clientes, feirantes, mercados e atacadistas utilizem a plataforma com mais confiança, segurança e liberdade.
            </p>
            <p className="text-sm font-semibold text-slate-600">
              Por isso, algumas informações são utilizadas apenas para o funcionamento do aplicativo e proteção dos usuários.
            </p>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Seu acesso ao aplicativo</h3>
              <p className="text-sm font-semibold text-slate-600">
                Você pode entrar no aplicativo usando sua conta Google. Isso ajuda a deixar o acesso mais rápido e seguro.
              </p>
              <div className="p-6 bg-brand-50/50 rounded-2xl border border-brand-100/30">
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">O Feira Livre poderá visualizar apenas:</p>
                <ul className="list-disc pl-6 space-y-2 text-xs font-black text-slate-700">
                  <li>Seu nome;</li>
                  <li>Seu e-mail;</li>
                  <li>Sua foto de perfil.</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400 font-bold italic mt-2 uppercase tracking-wider">
                O aplicativo não vê sua senha do Google e não pede informações bancárias da sua conta Google.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Cadastro de vendedores</h3>
              <p className="text-sm font-semibold text-slate-600">
                Para ajudar clientes a reconhecer vendedores reais, alguns vendedores poderão adicionar:
              </p>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600 font-bold">
                  <li>Foto da barraca;</li>
                  <li>Foto da loja;</li>
                  <li>Foto do feirante;</li>
                  <li>Nome da loja;</li>
                  <li>Cidade e estado.</li>
                </ul>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Essas informações ajudam clientes a conhecer melhor quem está vendendo os produtos.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Conversas no bate-papo</h3>
              <p className="text-sm font-semibold text-slate-600">
                O bate-papo do aplicativo serve para:
              </p>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600 font-bold">
                  <li>combinar entregas;</li>
                  <li>combinar retiradas;</li>
                  <li>enviar comprovantes;</li>
                  <li>conversar sobre produtos;</li>
                  <li>tirar dúvidas sobre pedidos.</li>
                </ul>
              </div>
              <p className="text-sm font-black text-brand-600 bg-brand-50 p-4 rounded-2xl border border-brand-100/50">
                Pedimos sempre respeito entre clientes e vendedores durante as conversas.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Entregas e retiradas</h3>
              <p className="text-sm font-semibold text-slate-600">
                O cliente pode:
              </p>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600 font-bold">
                  <li>pedir entrega;</li>
                  <li>retirar o pedido no local;</li>
                  <li>combinar diretamente com o vendedor.</li>
                </ul>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Cada vendedor pode trabalhar com formas diferentes de entrega e pagamento.
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Pagamentos</h3>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed font-display">
                Os pagamentos são combinados entre cliente e vendedor.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-brand-50/50 rounded-2xl border border-brand-100/30 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Modalidade Entrega</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Nos pedidos com entrega, os pagamentos poderão ser realizados por:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 font-bold mb-4">
                      <li>Pix;</li>
                      <li>Cartão de débito virtual;</li>
                      <li>Cartão de crédito virtual;</li>
                      <li>Pagamento antecipado combinado entre cliente e vendedor.</li>
                    </ul>
                  </div>
                  <p className="text-[10px] text-brand-600 font-black uppercase tracking-wider bg-white p-2.5 rounded-xl border border-brand-100/50">
                    O envio de comprovantes poderá ser feito pelo bate-papo do aplicativo para facilitar a confirmação do pedido.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Modalidade Retirada</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                      Nos pedidos para retirada no local, os pagamentos poderão ser realizados por:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 font-bold mb-4">
                      <li>Dinheiro;</li>
                      <li>Pix;</li>
                      <li>Cartão de débito;</li>
                      <li>Cartão de crédito.</li>
                    </ul>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white p-2.5 rounded-xl border border-slate-100">
                    Cada vendedor poderá escolher quais formas de pagamento aceitar em sua loja ou barraca.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Meta para vendedores</h3>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                O aplicativo Feira Livre busca ajudar vendedores cadastrados a alcançarem melhores resultados de vendas e crescimento dentro da plataforma.
              </p>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                A plataforma trabalha com meta estimada de até R$ 250,00 por mês para vendedores ativos, dependendo da movimentação, produtos anunciados e participação no aplicativo.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Taxa única</h3>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                Para manutenção da plataforma, divulgação do catálogo e organização do sistema, poderá existir uma taxa única de R$ 20,00 para ativação ou manutenção de anúncios e catálogo de vendedores.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Segurança da plataforma</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                O Feira Livre procura manter um ambiente mais seguro para todos.
              </p>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Verificação Avançada para Vendedores (Foto Física)</h4>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  No intuito de estabelecer total legitimidade perante o catálogo ofertado, a política de privacidade exige que todos os candidatos à categoria de Vendedores (Feira Livre, Ambulantes, Atacado ou Parcerias) forneçam e atualizem:
                </p>
                <div className="space-y-3 pl-4">
                  <p className="text-xs text-slate-600 font-bold">
                    📌 <strong>Foto do Vendedor junto de sua Loja/Barraca Física:</strong> Coletamos e registramos uma fotografia real do vendedor ao lado do seu comércio físico cadastrado. Essa imagem serve como controle biométrico e verificação presencial obrigatória conduzida pelos administradores do aplicativo.
                  </p>
                  <p className="text-xs text-slate-600 font-bold">
                    📌 <strong>Uso da Imagem:</strong> A foto em questão ficará disponível aos clientes reais somente para fins informativos de identificação e segurança de ambas as partes (fidelização da legitimidade comercial).
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Sobre suas informações</h3>
              <p className="text-sm font-semibold text-slate-600">
                As informações utilizadas dentro do aplicativo servem para:
              </p>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600 font-bold">
                  <li>funcionamento da plataforma;</li>
                  <li>identificação dos usuários;</li>
                  <li>organização de pedidos;</li>
                  <li>melhoria da experiência no aplicativo.</li>
                </ul>
              </div>
              <p className="text-sm font-black text-emerald-750 bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
                O Feira Livre não vende informações pessoais dos usuários.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">Atualizações</h3>
              <p className="text-sm font-semibold text-slate-600">
                Esta página pode receber atualizações para melhorar a segurança, o funcionamento e a experiência dos usuários.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feira Livre</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Produtos frescos, feirantes reais e uma plataforma feita para aproximar clientes e vendedores
              </p>
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
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Termos de Usos</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Condições Gerais de Utilização</p>
            </div>
          </div>

          <div className="space-y-12 text-slate-600 leading-relaxed max-w-full">
            <section className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 font-display">1. Elegibilidade de Cadastro</h3>
              <p className="text-xs font-medium leading-relaxed">
                Ao cadastrar-se no aplicativo <strong>Feira Livre</strong>, o usuário aceita plenamente as seguintes regras de acesso integrado:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-xs font-semibold">
                <li>O login é feito exclusivamente via autenticação oficial de provedores seguros (Google Sign-In).</li>
                <li>O usuário compromete-se a ceder dados cadastrais idôneos e responder criminal e civilmente pelas operações efetuadas através do aplicativo.</li>
                <li>A liberação e ativação total da conta fica sujeita aos processos internos de aprovação por parte da administração independente do aplicativo.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 font-display">2. Regra da Taxa Única de Cadastro para Vendedores</h3>
              <p className="text-xs font-medium leading-relaxed">
                O vendedor (seja de Feiras Livres, Ambulante Autônomo, dono de Barraca ou operor de Atacado Livre) que almejar catalogar e promover seus produtos no aplicativo, aceita e adere expressamente às seguintes cláusulas comerciais:
              </p>
              <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs font-semibold text-slate-600 space-y-2">
                <p>✔ <strong>Valor da Taxa Única:</strong> Estabelece-se a cobrança compulsória de uma <strong>taxa de R$ 20,00 (vinte reais) paga uma única vez</strong> (isenção total de anuidade, juros ou faturas mensais de hospedagem).</p>
                <p>✔ <strong>Análise Administrativa:</strong> O catálogo, banners e dados das mercadorias do vendedor somente constarão como ativos e visíveis nas buscas públicas pós-confirmação do pagamento desta taxa de R$ 20,00 e conferência cadastral.</p>
                <p>✔ <strong>Isenção de Extornos:</strong> Diante do processo de hospedagem e provisionamento de infraestrutura em Cloud, a taxa única de ativação não é reembolsável após iniciada a etapa de liberação administrativa.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 font-display">3. Obrigatoriedade de Foto presencial para a Loja</h3>
              <p className="text-xs font-medium leading-relaxed">
                Para fins de evitar desvios éticos ou cadastros de lojas inexistentes (fraudes cibernéticas), o vendedor concorda integralmente em:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-xs font-semibold">
                <li>Fornecer uma <strong>foto real contendo o seu próprio rosto posicionado ao lado de sua respectiva loja física ou barraca na feira</strong>.</li>
                <li>O uso de fotos meramente ilustrativas capturadas de serviços de busca da internet, imagens com marca d'água de bancos públicos ou imagens contendo rostos alheios falsificados implicará na imediata <strong>reprovação cadastral e bloqueio imediato da conta</strong>.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 font-display">4. Regras Operacionais para Aceitação de Pagamentos</h3>
              <p className="text-xs font-medium leading-relaxed">
                Cada pedido concluído é regido de forma estrita de acordo com a logística escolhida na finalização:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Modalidade Entrega
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    O pagamento do pedido deverá ocorrer exclusivamente utilizando <strong>métodos virtuais de transferência</strong> (exemplo: Pix online). O comprovante definitivo de quitação deve ser transmitido pelo chat por foto para fins de conformidade logística e segurança do entregador.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="font-black text-[10px] text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Modalidade Retirada
                  </h5>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Faculta-se ao cliente a liquidação da sua fatura utilizando <strong>todos os demais meios de pagamentos presenciais permitidos pelo vendedor</strong>, como dinheiro em espécie no ato da entrega em mãos ou passagem de cartões físicos direto na maquininha da barraca.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 font-display">5. Isenção de Agenciamento Diretor</h3>
              <p className="text-xs font-medium leading-relaxed">
                O aplicativo <strong>Feira Livre</strong> atua estritamente como um catálogo interativo, facilitando a divulgação de comércio e centralização de pedidos. As transações financeiras, combinados de entrega, contratação autônoma de motoboys adicionais e a qualidade individual de hortifrutigranjeiros entregues de cada barraca são de responsabilidade única e solidária dos respectivos feirantes e compradores envolvidos.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última atualização: Maio de 2026</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feira Livre • Compromisso de Honestidade e Parcerias</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  </div>
);

const AboutScreen = ({ config }: { config: AppConfig | null }) => (
  <div className="p-6 max-w-4xl mx-auto pb-32">
    <PageContainer screen="about" config={config}>
      <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12 md:p-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center shadow-inner">
              <Logo size="md" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">Sobre o Feira Livre</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Nossa História e Funcionamento</p>
            </div>
          </div>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">FEIRA LIVRE</h3>
              <p className="text-sm font-semibold text-slate-600">
                O aplicativo Feira Livre é o mais novo e seguro lugar para procurar feiras livres, barracas livres, mercados livres e atacados livres, próximos ou mais distantes. Você escolhe. Existem opções por todo o país.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">CATÁLOGO DE PRODUTOS</h3>
              <p className="text-sm font-semibold text-slate-600">
                Os produtos são vendidos diretamente pelos vendedores cadastrados, e você escolhe a forma de pagamento. Com o vendedor ativo no bate-papo, é possível enviar comprovantes por foto, combinar retirada dos produtos ou solicitar entrega.
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Selecione os produtos desejados, finalize o pedido e acompanhe sua compra. Caso escolha um entregador, mantenha contato e envie os detalhes da entrega ou retirada para facilitar o atendimento. Boas compras!
              </p>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">Você pode se cadastrar no aplicativo Feira Livre como:</p>
                <ul className="list-disc pl-6 space-y-2 text-xs font-black text-emerald-955">
                  <li>Feirante;</li>
                  <li>Atacadista;</li>
                  <li>Cliente.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">FEIRA LIVRE, O APLICATIVO</h3>
              <p className="text-sm font-semibold text-slate-600">
                O aplicativo é de fácil acesso e possui aprovação rápida de cadastro. Após a aprovação da administração, o usuário poderá acessar os recursos disponíveis da plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">FEIRANTES / ATACADISTAS</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-850 text-sm mb-1 uppercase tracking-wider text-xs text-brand-600">Feirantes Livres</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Barracas livres, mercados livres e feiras livres são os locais onde se encontram diversos feirantes e vendedores parceiros da plataforma. Pequenos feirantes também podem atender clientes em diferentes locais, ampliando as oportunidades de comercialização.
                  </p>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
                    Na Feira Livre, os produtos chegam para comercialização e podem ser revendidos em barracas, lojas ou mercados, por quilo, unidade ou outras medidas.
                  </p>
                </div>
                <div className="pt-4">
                  <h4 className="font-bold text-slate-850 text-sm mb-1 uppercase tracking-wider text-xs text-brand-600">Atacado Livre</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    O Atacado Livre é destinado à venda de produtos em grandes quantidades. É o local onde feirantes, comerciantes e donos de barracas compram mercadorias para iniciar ou abastecer suas vendas de frutas, verduras, legumes, raízes e outros produtos.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mt-3">
                    <p className="text-xs font-black text-slate-700 label-uppercase mb-2">As vendas podem acontecer em:</p>
                    <ul className="list-disc pl-6 space-y-1 text-xs text-slate-600 font-bold">
                      <li>Sacos;</li>
                      <li>Caixas;</li>
                      <li>Quilos;</li>
                      <li>Grandes quantidades;</li>
                      <li>Muitas unidades.</li>
                    </ul>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mt-3">
                    O objetivo é atender lojas e vendedores que comercializam produtos para vários clientes.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">O FEIRANTE NO APLICATIVO FEIRA LIVRE</h3>
              <p className="text-sm font-semibold text-slate-600">
                O feirante ou atacadista possui um space próprio dentro do aplicativo para divulgar e administrar sua loja.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">O vendedor poderá:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc pl-6 text-xs text-slate-600 font-black">
                  <li>Adicionar fotos da barraca ou loja;</li>
                  <li>Inserir foto de perfil;</li>
                  <li>Informar nome, cidade, estado e país;</li>
                  <li>Disponibilizar número de celular;</li>
                  <li>Configurar horário de funcionamento;</li>
                  <li>Visualizar faturamento;</li>
                  <li>Acompanhar pedidos ativos;</li>
                  <li>Atualizar preços e promoções;</li>
                  <li>Conversar com a administração pelo suporte.</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400 font-bold italic mt-2 uppercase tracking-wider">
                O aplicativo é brasileiro e mantém suporte para funcionamento em todo o Brasil.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">CLIENTES</h3>
              <p className="text-sm font-semibold text-slate-600">
                Clientes são consumidores cadastrados no aplicativo Feira Livre. Caso precise visitar uma Feira Livre presencialmente, o endereço estará disponível dentro do aplicativo.
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Você sempre poderá encontrar feiras, mercados e vendedores disponíveis para compra.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-5 bg-brand-50/50 rounded-2xl border border-brand-100/30">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Está em casa?</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    No aplicativo Feira Livre, você pode escolher retirar o pedido ou solicitar uma entrega.
                  </p>
                </div>
                <div className="p-5 bg-brand-50/50 rounded-2xl border border-brand-100/30">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Vai pedir entrega?</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    O entregador irá até a Feira Livre parceira para buscar seus produtos. Sua entrega chegará de forma rápida e prática.
                  </p>
                </div>
                <div className="p-5 bg-brand-50/50 rounded-2xl border border-brand-100/30">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Vai sair?</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Guarde o endereço da Feira Livre mais próxima e retire seu pedido diretamente no local.
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 mt-4 leading-relaxed">
                Compre produtos frescos com preços justos e diferentes formas de pagamento. Abra o aplicativo Feira Livre, adicione produtos ao pedido e finalize sua compra com facilidade.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">ADMINISTRAÇÃO</h3>
              <p className="text-sm font-semibold text-slate-600">
                A administração do aplicativo Feira Livre permite que feiras livres, barracas, mercados e atacados tenham gerenciamento ativo dentro da plataforma.
              </p>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl mt-3">
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Os administradores podem acompanhar:</p>
                <ul className="grid grid-cols-2 gap-2 list-disc pl-6 text-xs text-slate-600 font-bold">
                  <li>Pedidos;</li>
                  <li>Vendas;</li>
                  <li>Funcionamento das lojas;</li>
                  <li>Promoções;</li>
                  <li>Atendimento;</li>
                  <li>Suporte aos usuários.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2 font-display uppercase tracking-wider text-[11px] text-slate-400">ÍNDICE DE VENDAS</h3>
              <p className="text-sm font-semibold text-slate-600 pb-2">
                O índice de vendas acompanha o desempenho dos produtos e das lojas cadastradas. Produtos frescos e de qualidade costumam gerar melhores resultados de vendas.
              </p>
              <p className="text-sm font-black text-brand-600 mt-4 bg-brand-50 p-6 rounded-3xl border border-brand-100 tracking-wide">
                A tradicional Feira Livre representa a força do trabalhador, do comércio local e dos produtos do campo, oferecendo uma experiência otimista e acessível para vendedores e consumidores.
              </p>
            </section>

            <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feira Livre • Informações de Plataforma</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Suporte de ponta a ponta
              </p>
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
                Crie "combos da semana" ou kits prontos. Isso facilita a decisão de compra e aumenta o valor médio de venda da sua banca.
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

      showNotification('Candidatura enviada com sucesso via bate papo!', 'success');
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
                      value={age || ''}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ex: 25"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Currículo / Mensagem</label>
                    <textarea 
                      value={message || ''}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva aqui suas experiências e qualificações..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-64 resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'ENVIAR CURRÍCULO VIA BATE PAPO'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Job Posting Modal (For Vendors) */}
          <AnimatePresence>
            {showJobModal && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60" onClick={() => setShowJobModal(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="p-8 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <Briefcase className="text-brand-500" size={24} />
                      <h3 className="text-2xl font-black font-display">Publicar Vaga</h3>
                    </div>
                    <button onClick={() => setShowJobModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <X size={24} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo</label>
                      <input type="text" value={jobForm.position || ''} onChange={e => setJobForm({...jobForm, position: e.target.value})} placeholder="Ex: Auxiliar de Vendas" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Estabelecimento</label>
                        <select value={jobForm.shopType || 'feira'} onChange={e => setJobForm({...jobForm, shopType: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold">
                          <option value="feira">Feira Livre</option>
                          <option value="mercado">Mercado Livre</option>
                          <option value="barraca">Barraca Livre</option>
                          <option value="atacado">Atacado Livre</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Idade Mínima</label>
                        <input type="number" value={jobForm.ageRequirement || ''} onChange={e => setJobForm({...jobForm, ageRequirement: e.target.value})} placeholder="Ex: 18" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Salário</label>
                        <input type="text" value={jobForm.salary || ''} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="Ex: R$ 1.500,00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Carga Horária</label>
                        <input type="text" value={jobForm.hours || ''} onChange={e => setJobForm({...jobForm, hours: e.target.value})} placeholder="Ex: 44h semanais" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requisitos</label>
                      <textarea value={jobForm.requirements || ''} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} placeholder="Liste os requisitos..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-24 resize-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição da Vaga</label>
                      <textarea value={jobForm.description || ''} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Descreva as atividades..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium h-32 resize-none" />
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
                            city: myShop.city,
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
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['Feira Livre', 'Mercado Livre', 'Barraca Livre', 'Atacado Livre'].map(type => (
                  <span key={type} className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
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
                          <MapPin size={14} className="text-brand-500" /> {job.address}, {job.city || 'Cidade'}, {getFullStateName(job.state)}. Brasil.
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
                          className="col-span-2 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={14} /> ENVIAR CURRÍCULO VIA BATE PAPO
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
                          <MapPin size={14} className="text-blue-500" /> {job.address}, {job.city || 'Cidade'}, {getFullStateName(job.state)}. Brasil.
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
            className="fixed inset-0 bg-slate-900/60 z-[150] flex items-center justify-center p-6"
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
                    value={age || ''}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Currículo / Mensagem</label>
                  <textarea 
                    required
                    value={message || ''}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva aqui suas experiências e qualificações..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-48 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'ENVIAR CURRÍCULO VIA BATE PAPO'}
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
  setActiveTab,
  className
}: { 
  id: any, 
  icon: any, 
  label: string, 
  activeTab: string, 
  setActiveTab: (id: any) => void,
  className?: string
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={cn(
      "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap",
      activeTab === id 
        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" 
        : "text-slate-500 hover:bg-slate-100",
      className
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
  setSelectedShop,
  setSelectedChat
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  onNavigate: (screen: Screen) => void,
  setSelectedShop: (shop: Shop | null) => void,
  setSelectedChat: (uid: string | null) => void
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'finance' | 'accounting' | 'shops' | 'messages' | 'notifications' | 'admins' | 'job-openings' | 'users' | 'deleted-users'>('overview');
  const [financeSubTab, setFinanceSubTab] = useState<'orders' | 'sales' | 'disbursements'>('orders');
  const [shops, setShops] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [allDisbursements, setAllDisbursements] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);
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
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'sale' as 'sale' | 'disbursement',
    shopId: '',
    buyerName: '',
    targetShopName: '',
    totalValue: 0,
    items: '',
    paymentMethod: 'Dinheiro',
    status: 'paid' as 'paid' | 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user) return;
    const isAdminUser = (user.role === 'admin' || user.role === 'state_admin' || user.role === 'municipal_admin') && 
                        (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(user.email));
    
    if (!isAdminUser || !auth.currentUser) return;

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
            landing: { columns: 1, visible: true, title: '', objective: 'Página inicial com destaques e categorias principais.' },
            search: { columns: 2, visible: true, title: 'Mercado', objective: 'Exploração de produtos e lojas disponíveis.' },
            wholesale: { columns: 2, visible: true, title: 'Atacado Livre', objective: 'Vendas em grandes quantidades para empresas.' },
            calculator: { columns: 1, visible: true, title: 'Calculadora', objective: 'Ferramenta de cálculo de preços e lucros.' },
            contact: { columns: 1, visible: true, title: 'Contato', objective: 'Canal de comunicação direta com o suporte.' },
            profile: { columns: 1, visible: true, title: 'Perfil', objective: 'Gestão de dados do usuário e histórico.' },
            sales: { columns: 1, visible: true, title: 'Vendas', objective: 'Painel de vendas para produtores e lojistas.' },
            createShop: { columns: 1, visible: true, title: 'Criar Loja', objective: 'Processo de abertura de nova banca ou loja.' },
            privacy: { columns: 1, visible: true, title: 'Privacidade', objective: 'Informações sobre proteção de dados.' },
            terms: { columns: 1, visible: true, title: 'Termos de Usos', objective: 'Regras e condições de uso da plataforma.' },
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

    const salesUnsubscribe = onSnapshot(query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAllSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'all-sales'));

    const disbursementsUnsubscribe = onSnapshot(query(collectionGroup(db, 'disbursements'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAllDisbursements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'all-disbursements'));

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

    const pendingQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'state_admin', 'municipal_admin']), where('isApprovedAdmin', '==', false));
    const pendingUnsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setPendingAdmins(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const approvedQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'state_admin', 'municipal_admin']), where('isApprovedAdmin', '==', true));
    const approvedUnsubscribe = onSnapshot(approvedQuery, (snapshot) => {
      setApprovedAdmins(snapshot.docs.map(doc => doc.data() as UserProfile));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const deletedUsersUnsubscribe = onSnapshot(query(collection(db, 'deletedUsers'), orderBy('deletedAt', 'desc')), (snapshot) => {
      setDeletedUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'deletedUsers'));

    return () => {
      configUnsubscribe();
      shopsUnsubscribe();
      messagesUnsubscribe();
      ordersUnsubscribe();
      salesUnsubscribe();
      disbursementsUnsubscribe();
      notifUnsubscribe();
      quickMsgUnsubscribe();
      jobsUnsubscribe();
      usersUnsubscribe();
      pendingUnsubscribe();
      approvedUnsubscribe();
      deletedUsersUnsubscribe();
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

  const handleRegisterTransaction = async () => {
    if (!newTransaction.shopId || newTransaction.totalValue <= 0) {
      return showNotification('Preencha os campos obrigatórios (Loja e Valor)', 'error');
    }

    try {
      const shop = shops.find(s => s.id === newTransaction.shopId);
      if (!shop) throw new Error("Loja não encontrada");

      const collectionName = newTransaction.type === 'sale' ? 'sales' : 'disbursements';
      const itemsArray = newTransaction.items ? newTransaction.items.split(',').map(i => ({ name: i.trim(), quantity: 1, price: 0 })) : [];
      
      const transactionData: any = {
        shopId: newTransaction.shopId,
        shopName: shop.name || 'Loja',
        totalValue: Number(newTransaction.totalValue),
        createdAt: Timestamp.fromDate(new Date(newTransaction.date)),
        items: itemsArray,
        paymentMethod: newTransaction.paymentMethod,
        status: newTransaction.status,
        isFromAdmin: true,
        month: new Date(newTransaction.date).getMonth(),
        year: new Date(newTransaction.date).getFullYear()
      };

      if (newTransaction.type === 'sale') {
        transactionData.buyerName = newTransaction.buyerName || 'Lançamento Manual';
        transactionData.totalCost = 0;
      } else {
        transactionData.targetShopName = newTransaction.targetShopName || 'Fornecedor';
      }

      await addDoc(collection(db, 'shops', newTransaction.shopId, collectionName), transactionData);
      
      setIsAddingTransaction(false);
      setNewTransaction({
        type: 'sale',
        shopId: '',
        buyerName: '',
        targetShopName: '',
        totalValue: 0,
        items: '',
        paymentMethod: 'Dinheiro',
        status: 'paid',
        date: new Date().toISOString().split('T')[0]
      });
      showNotification('Lançamento registrado com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
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
      'Tem certeza že deseja excluir este usuário? Todos os dados (lojas, produtos, mensagens, currículos e histórico) serão removidos permanentemente.',
      async () => {
        try {
          await wipeUserData(userId);
          showNotification('Usuário e todos os seus dados foram excluídos!');
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

  const totalOrderSales = allOrders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const totalManualSales = allSales.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const totalDisbursements = allDisbursements.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const netTotal = totalOrderSales + totalManualSales - totalDisbursements;

  // Mock data for the chart based on actual orders if possible, or just a nice trend
  const chartData = [
    { name: 'Seg', value: (totalOrderSales + totalManualSales) * 0.1 },
    { name: 'Ter', value: (totalOrderSales + totalManualSales) * 0.15 },
    { name: 'Qua', value: (totalOrderSales + totalManualSales) * 0.12 },
    { name: 'Qui', value: (totalOrderSales + totalManualSales) * 0.2 },
    { name: 'Sex', value: (totalOrderSales + totalManualSales) * 0.18 },
    { name: 'Sáb', value: (totalOrderSales + totalManualSales) * 0.25 },
    { name: 'Dom', value: (totalOrderSales + totalManualSales) * 0.3 },
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
        
        <div className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] gap-3 overflow-x-auto pb-4 bg-white p-3 rounded-2xl shadow-soft border border-slate-100 w-full font-display">
          <AdminNavItem id="overview" icon={LayoutGrid} label="Geral" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="finance" icon={Wallet} label="Financeiro" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="accounting" icon={Scale} label="Financeiro Contábil" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="shops" icon={Store} label="Lojas" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="users" icon={User} label="Usuários" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="admins" icon={ShieldCheck} label="Admins" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="job-openings" icon={Briefcase} label="Vagas" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="messages" icon={MessageSquare} label="Mensagens" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="notifications" icon={Bell} label="Notificações" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
          <AdminNavItem id="deleted-users" icon={UserX} label="Excluídas" activeTab={activeTab} setActiveTab={setActiveTab} className="w-full justify-center" />
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
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado Líquido Consolido</p>
                      <h4 className="text-4xl font-black text-slate-900 font-display">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netTotal)}
                      </h4>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Catálogo + Painel - Desembolsos</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-[160px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" name="Faturamento" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                      <RechartsTooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
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
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
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
                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <h3 className="text-xl font-black mb-6 relative z-10 text-slate-900 font-display">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <button onClick={() => setActiveTab('notifications')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center gap-3 transition-all border border-slate-100">
                      <BellRing size={20} className="text-brand-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notificar</span>
                    </button>
                    <button onClick={() => setActiveTab('admins')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center gap-3 transition-all border border-slate-100">
                      <UserPlus size={20} className="text-brand-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admins</span>
                    </button>
                    <button onClick={() => setActiveTab('shops')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center gap-3 transition-all border border-slate-100">
                      <Store size={20} className="text-brand-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lojas</span>
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
        ) : activeTab === 'finance' ? (
          <motion.div 
            key="finance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Sub-tabs for Finance */}
            <div className="bg-white p-2 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
              <button 
                onClick={() => setFinanceSubTab('orders')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                  financeSubTab === 'orders' ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Package size={14} /> Pedidos Catálogo
              </button>
              <button 
                onClick={() => setFinanceSubTab('sales')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                  financeSubTab === 'sales' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <BarChart size={14} /> Vendas Painel (Receber)
              </button>
              <button 
                onClick={() => setFinanceSubTab('disbursements')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
                  financeSubTab === 'disbursements' ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Wallet size={14} /> Desembolsos (Pagar)
              </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {financeSubTab === 'orders' ? 'Gestão de Pedidos do Catálogo' : 
                     financeSubTab === 'sales' ? 'Vendas Manuais e Contas a Receber' : 
                     'Desembolsos e Contas a Pagar'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {financeSubTab === 'orders' ? 'Acompanhamento de vendas via marketplace' : 
                     financeSubTab === 'sales' ? 'Registros de lançamento direto dos vendedores' : 
                     'Acompanhamento de custos e fornecedores da rede'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setNewTransaction(prev => ({ ...prev, type: financeSubTab === 'disbursements' ? 'disbursement' : 'sale' }));
                      setIsAddingTransaction(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <Plus size={16} /> Novo Lançamento
                  </button>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome, id ou loja..." 
                      value={orderSearch || ''}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação / Data</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{financeSubTab === 'disbursements' ? 'Fornecedor' : 'Pessoa / Cliente'}</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loja Origem</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhes</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Catalog Orders Rendering */}
                    {financeSubTab === 'orders' && allOrders
                      .filter(order => {
                        const search = orderSearch.toLowerCase();
                        return (order.id||'').toLowerCase().includes(search) || (order.buyerName||'').toLowerCase().includes(search) || (order.shopName||'').toLowerCase().includes(search);
                      })
                      .map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="bg-slate-100 px-3 py-1 rounded-xl font-mono text-[10px] w-fit">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{order.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 text-sm">
                            {allUsers.find(u => u.uid === order.buyerUid)?.displayName || order.buyerName || 'Usuário Marketplace'}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="font-black text-emerald-600 text-[10px] uppercase tracking-widest leading-none">
                                {shops.find(s => s.id === order.shopId)?.name || order.shopName || 'Loja não cadastrada'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                {shops.find(s => s.id === order.shopId)?.category || 'Catálogo'}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{order.paymentMethod}</span>
                            <span className="text-[9px] text-slate-400 italic">{order.items?.length || 0} itens no carrinho</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900 text-sm">
                          R$ {(order.totalValue || 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                            order.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {translateStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => deleteDoc(doc(db, 'orders', order.id))} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}

                    {/* Manual Sales Rendering */}
                    {financeSubTab === 'sales' && allSales
                      .filter(sale => {
                         const search = orderSearch.toLowerCase();
                         return (sale.id||'').toLowerCase().includes(search) || (sale.buyerName||'').toLowerCase().includes(search) || (sale.shopName||'').toLowerCase().includes(search);
                      })
                      .map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl font-mono text-[10px] w-fit">#{sale.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString('pt-BR') : 'Sem data'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 text-sm">
                            {allUsers.find(u => u.uid === sale.buyerUid)?.displayName || sale.buyerName || 'Lançamento Manual'}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="font-black text-emerald-600 text-[10px] uppercase tracking-widest leading-none">
                                {sale.shopName || shops.find(s => s.id === sale.shopId)?.name || 'Loja não cadastrada'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                {shops.find(s => s.id === sale.shopId)?.category || 'Venda Manual'}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="max-w-[200px] truncate text-[10px] font-bold text-slate-500 uppercase">
                             {sale.items?.map((i: any) => i.name).join(', ') || 'Venda Diversa'}
                           </div>
                        </td>
                        <td className="px-8 py-6 font-black text-emerald-600 text-sm">
                          R$ {(sale.totalValue || 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 border rounded-full text-[8px] font-black uppercase tracking-widest",
                            sale.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          )}>
                            {sale.status === 'pending' ? 'Pendente (Receber)' : 'Recebido'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => deleteDoc(doc(db, 'shops', sale.shopId, 'sales', sale.id))} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}

                    {/* Disbursements Rendering */}
                    {financeSubTab === 'disbursements' && allDisbursements
                      .filter(d => {
                        const search = orderSearch.toLowerCase();
                        return (d.id||'').toLowerCase().includes(search) || (d.targetShopName||'').toLowerCase().includes(search) || (d.shopName||'').toLowerCase().includes(search);
                      })
                      .map(disb => (
                      <tr key={disb.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-xl font-mono text-[10px] w-fit">#{disb.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{disb.createdAt?.toDate ? disb.createdAt.toDate().toLocaleDateString('pt-BR') : 'Sem data'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-900 text-sm">{disb.targetShopName || 'Fornecedor'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest leading-none">
                                {disb.shopName || shops.find(s => s.id === disb.shopId)?.name || 'Loja não cadastrada'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                {shops.find(s => s.id === disb.shopId)?.category || 'Dispesa'}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="max-w-[200px] truncate text-[10px] font-bold text-slate-500 uppercase">
                             {disb.items?.map((i: any) => i.name).join(', ') || 'Custo Diversos'}
                           </div>
                        </td>
                        <td className="px-8 py-6 font-black text-rose-600 text-sm">
                          - R$ {(disb.totalValue || 0).toFixed(2)}
                        </td>
                        <td className="px-8 py-6">
                           <span className={cn(
                            "px-3 py-1 border rounded-full text-[8px] font-black uppercase tracking-widest",
                            disb.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-rose-50 text-rose-700 border-rose-100"
                          )}>
                            {disb.status === 'pending' ? 'Pendente (Pagar)' : 'Pago'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => deleteDoc(doc(db, 'shops', disb.shopId, 'disbursements', disb.id))} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {((financeSubTab === 'orders' && allOrders.length === 0) || 
                (financeSubTab === 'sales' && allSales.length === 0) || 
                (financeSubTab === 'disbursements' && allDisbursements.length === 0)) && (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    {financeSubTab === 'orders' ? <Package size={40} /> : financeSubTab === 'sales' ? <BarChart size={40} /> : <Wallet size={40} />}
                  </div>
                  <p className="text-slate-400 font-medium">Nenhum registro encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'accounting' ? (
          <motion.div 
            key="accounting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PainelFinanceiroContabil />
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
                  (shop.name || '').toLowerCase().includes((shopSearch || '').toLowerCase()) ||
                  (shop.category || '').toLowerCase().includes((shopSearch || '').toLowerCase())
                )
                .map(shop => (
                  <div key={shop.id} className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden group hover:border-brand-200 transition-all flex flex-col">
                    <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                      <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={shop.name} />
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
                        <div className="w-20 h-20 rounded-[24px] border-4 border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center">
                          <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover" alt={shop.name} />
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
                          <span className="line-clamp-1">{shop.address || 'Endereço não informado'}, {shop.city}, {getFullStateName(shop.state)}. Brasil.</span>
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
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{msg.email} • {getFullStateName(msg.state)}</p>
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
                        job.isApproved ? "bg-emerald-500" : "bg-amber-500"
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
        ) : activeTab === 'deleted-users' ? (
          <motion.div 
            key="deleted-users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white overflow-hidden rounded-[40px] shadow-soft border border-slate-100">
              <div className="px-8 py-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-display">Contas Excluídas</h3>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Histórico de perfis removidos da plataforma</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <UserX size={18} className="text-slate-400" />
                    <span className="text-xl font-black text-slate-900">{deletedUsers.length}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contas</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário Excluído</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Papel</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Info Adicional</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Criado em</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Excluído em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deletedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                              <SafeImage src={u.photoURL} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm leading-tight">{u.displayName}</p>
                              <p className="text-[10px] text-slate-400 font-bold font-mono">UID: {u.uid?.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-600">{u.email}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={cn(
                             "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                             u.role === 'admin' || u.role === 'state_admin' ? "bg-red-50 text-red-600" :
                             u.role === 'vendor' ? "bg-brand-50 text-brand-600" : "bg-blue-50 text-blue-600"
                           )}>
                             {u.role === 'vendor' ? 'Vendedor' : u.role === 'client' ? 'Cliente' : 'Admin'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-1.5">
                               <LogIn size={12} className="text-slate-400" />
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.loginMethod || 'Celular'}</span>
                             </div>
                             {u.role === 'vendor' && (
                               <div className="flex items-center gap-1.5">
                                 <Store size={12} className="text-brand-500" />
                                 <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                   {u.shopTypeSelected || 'Não informado'}
                                 </span>
                               </div>
                             )}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">
                              {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('pt-BR') : 'Data Indisponível'}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                              {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-red-600">
                              {u.deletedAt?.toDate ? u.deletedAt.toDate().toLocaleDateString('pt-BR') : 'Data Indisponível'}
                            </span>
                            <span className="text-[10px] font-medium text-red-400 tracking-wider">
                              {u.deletedAt?.toDate ? u.deletedAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {deletedUsers.length === 0 && (
                  <div className="py-20 text-center text-slate-400 font-medium">Nenhum histórico de exclusão encontrado.</div>
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
                        value={newNotif.title || ''}
                        onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                        placeholder="Ex: Promoção de Verão!"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Público-Alvo</label>
                      <select 
                        value={newNotif.target || 'all'}
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
                        value={newNotif.body || ''}
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
                        value={newNotif.scheduledFor || ''}
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
                      value={newQuickMsg.title || ''}
                      onChange={(e) => setNewQuickMsg({ ...newQuickMsg, title: e.target.value })}
                      placeholder="Título do atalho"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    />
                    <textarea 
                      value={newQuickMsg.content || ''}
                      onChange={(e) => setNewQuickMsg({ ...newQuickMsg, content: e.target.value })}
                      placeholder="Conteúdo da mensagem..."
                      rows={3}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium resize-none"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Alvo Padrão</label>
                      <select 
                        value={newQuickMsg.target || 'all'}
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
                    value={userSearch || ''}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500 w-64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allUsers
                  .filter(u => 
                    (u.displayName || '').toLowerCase().includes((userSearch || '').toLowerCase()) || 
                    (u.email || '').toLowerCase().includes((userSearch || '').toLowerCase())
                  )
                  .map(u => (
                    <div key={u.uid} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <SafeImage src={u.photoURL} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" alt={u.displayName} />
                        <div>
                          <h4 
                            onClick={() => {
                              setSelectedChat(u.uid);
                              const chatsScreen = document.querySelector('[data-screen="chats"]');
                              if (chatsScreen) onNavigate('chats'); else onNavigate('chats');
                            }}
                            className="font-black text-slate-900 text-sm flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors"
                          >
                            {u.displayName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {translateRole(u.role)}
                            {u.state && ` • ${u.state}`}
                            {u.city && ` • ${u.city}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                           onClick={() => {
                             setSelectedChat(u.uid);
                             onNavigate('chats');
                           }}
                           className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-xl shadow-sm transition-all hover:scale-110"
                           title="Ver Perfil / Chat"
                        >
                          <User size={16} />
                        </button>
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
                      <SafeImage src={admin.photoURL} className="w-20 h-20 rounded-full border-4 border-amber-100 mb-4" alt={admin.displayName} />
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
                      <SafeImage src={admin.photoURL} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm flex-shrink-0" alt={admin.displayName} />
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
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setEditingAdmin(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between">
              <h3 className="text-xl font-black font-display">Editar Admin</h3>
              <button onClick={() => setEditingAdmin(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Acesso</label>
                <select 
                  value={editingAdmin.role || 'admin'}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as UserRole })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-700"
                >
                  <option value="admin">Administrador Global</option>
                  <option value="state_admin">Administrador Estadual</option>
                  <option value="municipal_admin">Administrador Municipal</option>
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

      {/* Manual Transaction Modal */}
      <AnimatePresence>
        {isAddingTransaction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setIsAddingTransaction(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-white border-b border-slate-100 text-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display">Registrar Lançamento</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Financeiro Administrativo</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingTransaction(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Lançamento</label>
                     <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, type: 'sale' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.type === 'sale' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                         )}
                       >Entrada (Receber)</button>
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, type: 'disbursement' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.type === 'disbursement' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                         )}
                       >Saída (Pagar)</button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                     <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, status: 'paid' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.status === 'paid' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400"
                         )}
                       >Concluído</button>
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, status: 'pending' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.status === 'pending' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400"
                         )}
                       >Pendente</button>
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loja de Origem *</label>
                  <select 
                    value={newTransaction.shopId}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, shopId: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                  >
                    <option value="">Selecione uma loja...</option>
                    {shops.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {newTransaction.type === 'sale' ? 'Pessoa / Cliente' : 'Fornecedor / Destino'}
                    </label>
                    <input 
                      type="text"
                      placeholder="Ex: João da Silva ou Atacado Rural"
                      value={newTransaction.type === 'sale' ? newTransaction.buyerName : newTransaction.targetShopName}
                      onChange={(e) => setNewTransaction(prev => ({ 
                        ...prev, 
                        [newTransaction.type === 'sale' ? 'buyerName' : 'targetShopName']: e.target.value 
                      }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.totalValue || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, totalValue: Number(e.target.value) }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Lançamento</label>
                    <input 
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pagamento</label>
                    <select 
                      value={newTransaction.paymentMethod}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Pix">Pix</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Boleto">Boleto (Contas)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Itens (Opcional)</label>
                  <textarea 
                    placeholder="Ex: Alface, Tomate, Fertilizante..."
                    value={newTransaction.items}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, items: e.target.value }))}
                    rows={2}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                  />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1 text-right">Separe os itens por vírgula</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button 
                   onClick={() => setIsAddingTransaction(false)}
                   className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all border border-slate-200"
                 >Cancelar</button>
                 <button 
                   onClick={handleRegisterTransaction}
                   className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-3"
                 >
                   Confirmar Lançamento
                   <ArrowRight size={18} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VendorManagement = ({ 
  user, 
  showNotification,
  showConfirm,
  config,
  onNavigate,
  setSelectedChat,
  setSelectedShop
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void,
  setSelectedChat: (uid: string | null) => void,
  setSelectedShop: (s: Shop | null) => void
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

    const ordersQuery = query(collection(db, 'orders'), where('shopOwnerUid', '==', user.uid), where('shopId', '==', myShop.id), orderBy('createdAt', 'desc'), limit(50));
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

      // Segurança: Apenas o dono da loja processa o pedido
      if (orderData.shopOwnerUid !== user?.uid) {
        showNotification('Apenas o vendedor tem permissão para esta ação.', 'error');
        return;
      }

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
            msgText = `✅ *Seu pedido #${orderId.slice(-4).toUpperCase()} está PRONTO!*\n\nJá pode passar na loja para retirar ou aguardar a entrega, conforme combinado.\n\n*Forma de Pagamento:* ${translatePaymentMethod(orderData.paymentMethod)}\n*Modo de Recebimento:* ${orderData.deliveryType === 'delivery' ? 'Entrega por Aplicativo' : 'Retirada na Loja/Barraca'}\n\nObrigado por comprar conosco! 🍎`;
          } else if (newStatus === 'cancelled') {
            msgText = `❌ *PEDIDO CANCELADO: #${orderId.slice(-4).toUpperCase()}*\n\nInformamos que seu pedido foi cancelado. Este é um ato de esclarecimento para manter a transparência da nossa negociação.\n\nCaso tenha dúvidas, por favor, envie uma mensagem aqui no bate-papo.`;
          }

          if (msgText) {
            await addDoc(collection(db, 'chatMessages'), {
              senderUid: user.uid, // Vendor
              senderName: myShop.name,
              senderPhotoURL: myShop.photoURL || '',
              receiverUid: orderData.buyerUid || '',
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
          receiverUid: orderData.buyerUid || '',
          shopName: orderData.shopName,
          metadata: {
            shopId: orderData.shopId,
            shopOwnerUid: orderData.shopOwnerUid || user?.uid || '' // Fallback to current user if it's the vendor
          },
          createdAt: Timestamp.now()
        });
      }

      showNotification(`Pedido ${(translateStatus(newStatus) || '').toLowerCase()} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleSaveShop = async () => {
    if (!myShop) return;
    try {
      // 1. Atualizar documento da Loja
      await updateDoc(doc(db, 'shops', myShop.id), shopForm);
      
      // 2. Sincronizar foto no perfil do usuário vendedor
      if (shopForm.photoURL && user) {
        await updateDoc(doc(db, 'users', user.uid), { photoURL: shopForm.photoURL });
      }

      // 3. Atualizar dados denormalizados (Pedidos e Mensagens raras/recentes)
      // Nota: Para grandes volumes, o ideal seria um Cloud Function, mas aqui faremos via Batch para manter a "mágica"
      const batch = writeBatch(db);
      
      // Pedidos pendentes e recentes da loja
      const ordersQuery = query(collection(db, 'orders'), where('shopId', '==', myShop.id), limit(50));
      const ordersSnap = await getDocs(ordersQuery);
      ordersSnap.docs.forEach(d => {
        batch.update(d.ref, { 
          shopPhotoURL: shopForm.photoURL,
          shopName: shopForm.name 
        });
      });

      // Mensagens enviadas pelo vendedor (para atualizar avatar nos chats existentes)
      if (user) {
        const msgQuery = query(collection(db, 'chatMessages'), where('senderUid', '==', user.uid), limit(50));
        const msgSnap = await getDocs(msgQuery);
        msgSnap.docs.forEach(d => {
          batch.update(d.ref, { 
            senderPhotoURL: shopForm.photoURL,
            shopName: shopForm.name 
          });
        });
      }

      await batch.commit();

      setIsEditingShop(false);
      showNotification('Loja e dados relacionados atualizados com sucesso!', 'success');
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
      'Deseja realmente excluir sua conta? Todos os seus dados, incluindo lojas, produtos, mensagens e histórico, serão removidos permanentemente. Esta ação é irreversível.',
      async () => {
        try {
          await wipeUserData(user.uid);
          await logout();
          showNotification('Sua conta e todos os seus dados foram excluídos com sucesso.');
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
        <div className="p-8 bg-white rounded-3xl shadow-soft border border-slate-100 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando sua loja...</p>
        </div>
      </div>
    );
  }

  if (!myShop) return <CreateShopScreen user={user} showNotification={showNotification} config={config} onComplete={() => {}} />;

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="w-full px-4 md:px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-brand-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-brand-100 overflow-hidden">
            <SafeImage src={myShop.photoURL} type="shop" className="w-full h-full object-cover" alt={myShop.name} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight">{myShop.name}</h2>
            <div className="flex flex-col mt-1">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest ml-1">
                <MapPin size={10} className="text-brand-500" /> {myShop.address}, {myShop.city}, {getFullStateName(myShop.state)}. Brasil.
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-flow-col auto-cols-[minmax(160px,1fr)] gap-3 overflow-x-auto pb-4 w-full">
          <button 
            onClick={() => {
              if (myShop) {
                setSelectedShop(myShop);
                onNavigate('shop-detail');
              }
            }}
            className="px-6 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 whitespace-nowrap"
          >
            <LayoutGrid size={18} /> Catálogo
          </button>
          <button 
            onClick={() => onNavigate('sales')}
            className="px-6 py-4 bg-blue-50 text-blue-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <TrendingUp size={18} /> Vendas
          </button>
          <button 
            onClick={() => onNavigate('careers')}
            className="px-6 py-4 bg-brand-50 text-brand-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Briefcase size={18} /> Vagas
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className="px-6 py-4 bg-amber-50 text-amber-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-amber-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Calculator size={18} /> Calc.
          </button>
          <button 
            onClick={() => onNavigate('vendor-accounting')}
            className="px-6 py-4 bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <BarChart size={18} /> Contab.
          </button>
        </div>
      </header>

        <div className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] gap-4 mb-12 overflow-x-auto pb-4">
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
              "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap",
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
                        const product = products.find(p => p.id === (item.productId || item.id));
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
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all overflow-hidden border border-slate-100">
                            <SafeImage src={order.buyerPhotoURL || ''} type="user" className="w-full h-full object-cover" />
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
              <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mb-16 blur-2xl" />
                <h4 className="text-xl font-black font-display mb-8 relative z-10 text-slate-900">Ações Rápidas</h4>
                <div className="grid grid-cols-1 gap-4 relative z-10">
                  <button onClick={() => { 
                    if (myShop) {
                      setSelectedShop(myShop);
                      onNavigate('shop-detail');
                    }
                  }} className="w-full p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center gap-4 transition-all group border border-slate-100">
                    <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LayoutGrid size={24} />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-black uppercase tracking-widest text-slate-900">Catálogo da Loja</span>
                    </div>
                  </button>
                  <button onClick={() => { setEditingProduct({ unit: 'unit', stock: 0, price: 0, cost: 0 }); setActiveTab('products'); }} className="w-full p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center gap-4 transition-all group border border-slate-100">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Novo Produto</span>
                  </button>
                  <button onClick={() => setActiveTab('calculator')} className="w-full p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center gap-4 transition-all group border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calculator size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Simulador de Lucro</span>
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
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
                      <SafeImage src={product.photoURL} type="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
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
            
            {/* Botão Flutuante Central para Adicionar Produto */}
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[40]">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingProduct({ unit: 'unit', stock: 0, price: 0, cost: 0 })}
                className="flex items-center gap-3 px-8 py-5 bg-brand-600 text-white rounded-full shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:bg-brand-700 transition-all font-black uppercase tracking-widest text-xs border-4 border-white"
              >
                <Plus size={24} />
                <span>Novo Produto</span>
              </motion.button>
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
                    {myShop?.photoURL && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                        <SafeImage src={myShop.photoURL} type="shop" className="w-full h-full object-cover" />
                      </div>
                    )}
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
                        <div className="relative">
                          <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden font-black">
                            <SafeImage src={order.buyerPhotoURL || ''} type="user" className="w-full h-full object-cover" />
                          </div>
                          {myShop?.photoURL && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg p-0.5 shadow-sm border border-slate-100 overflow-hidden">
                              <SafeImage src={myShop.photoURL} type="shop" className="w-full h-full object-cover" />
                            </div>
                          )}
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
                        {user?.uid === order.shopOwnerUid ? (
                          <>
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
                          </>
                        ) : (
                          <div className="flex-1 lg:flex-none px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Status: {translateStatus(order.status)}
                            </span>
                          </div>
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
                          <Package size={14} className="text-brand-500" /> Resumos dos Produtos
                        </h5>
                        <div className="space-y-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm group/item">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                                  <SafeImage src={item.photoURL} type="product" className="w-full h-full object-cover" />
                                  <div className="absolute top-0 left-0 bg-brand-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-br-lg">
                                    {item.quantity}x
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-slate-600 font-bold">{item.name}</span>
                                  <span className="text-[10px] text-brand-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Scale size={10} />
                                    {item.weightPerUnit > 0 ? `${item.weightPerUnit}${item.unit === 'kg' ? 'kg' : 'g'}` : translateUnit(item.unit)} • Qtd: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-black text-slate-900">R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
                            <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Total do Pedido</span>
                            <span className="text-2xl font-black text-brand-600 font-display">R$ {(order.totalValue || 0).toFixed(2)}</span>
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
                                  {order.buyerCity}, {getFullStateName(order.buyerState)}. Brasil.
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
              
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Status Atual</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sua loja está aberta para novos pedidos agora?</p>
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

                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px]">
                   <ScheduleManager 
                    schedule={shopForm.schedule}
                    onChange={s => setShopForm({...shopForm, schedule: s})}
                    specialDates={shopForm.specialDates}
                    onSpecialDatesChange={dates => setShopForm({...shopForm, specialDates: dates})}
                  />
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
                    <PhotoUpload 
                      value={shopForm.photoURL || ''} 
                      onChange={base64 => setShopForm({...shopForm, photoURL: base64})} 
                      label="Foto da Loja"
                      type="shop"
                    />
                  </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60" onClick={() => setIsEditingShop(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="relative w-full max-w-7xl h-[95vh] bg-white rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto"
            >
              <div className="p-8 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-2xl font-black font-display text-slate-900">Configurações da Loja</h3>
                <button onClick={() => setIsEditingShop(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"><X size={24} /></button>
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
                    type="shop"
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
              className="absolute inset-0 bg-slate-900/60" 
              onClick={() => {
                showConfirm('Descartar Alterações', 'Deseja realmente sair sem salvar? O rascunho será mantido apenas localmente.', () => {
                  setEditingProduct(null);
                  setShowProductCalculator(false);
                });
              }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto"
            >
              <div className="p-8 bg-white border-b border-slate-100 text-slate-900 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Package className="text-brand-500" />
                  <h3 className="text-2xl font-black font-display text-slate-900">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      showConfirm('Ir para Pedidos', 'Deseja sair do editor de produtos para ver seus pedidos?', () => {
                        setEditingProduct(null);
                        setActiveTab('orders');
                      });
                    }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-brand-600 transition-all font-black uppercase tracking-widest text-[10px]"
                  >
                    <ShoppingBag size={14} /> Voltar para Pedidos
                  </button>
                  <button 
                    onClick={() => {
                      showConfirm('Sair do Editor', 'Deseja realmente fechar o editor? Suas alterações serão salvas automaticamente como rascunho.', () => {
                        setEditingProduct(null);
                        setShowProductCalculator(false);
                      });
                    }} 
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                  >
                    <X size={24} />
                  </button>
                </div>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">MERCADORIAS DE VENDAS</label>
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
                    type="product"
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
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'sale' as 'sale' | 'disbursement',
    buyerName: '',
    targetShopName: '',
    totalValue: 0,
    items: '',
    paymentMethod: 'Dinheiro',
    status: 'paid' as 'paid' | 'pending',
    date: new Date().toISOString().split('T')[0]
  });

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
      setSales(snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate() || new Date();
        return { 
          id: doc.id, 
          ...data,
          totalValue: Number(data.totalValue) || 0,
          totalCost: Number(data.totalCost) || 0,
          month: data.month ?? createdAt.getMonth(),
          year: data.year ?? createdAt.getFullYear()
        } as Sale;
      }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/sales`));

    const ordersQuery = query(collection(db, 'orders'), where('shopOwnerUid', '==', user.uid), where('shopId', '==', myShop.id), where('status', '==', 'completed'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    const productsQuery = query(collection(db, 'shops', myShop.id, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/products`));

    const disbursementsQuery = query(collection(db, 'shops', myShop.id, 'disbursements'), orderBy('createdAt', 'desc'));
    const unsubscribeDisbursements = onSnapshot(disbursementsQuery, (snapshot) => {
      setDisbursements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Disbursement)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${myShop.id}/disbursements`));

    return () => {
      unsubscribeSales();
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeDisbursements();
    };
  }, [myShop]);

  const handleRegisterTransaction = async () => {
    if (!myShop) return;
    if (newTransaction.totalValue <= 0) {
      return showNotification('Preencha o valor do lançamento', 'error');
    }

    try {
      const collectionName = newTransaction.type === 'sale' ? 'sales' : 'disbursements';
      const itemsArray = newTransaction.items ? newTransaction.items.split(',').map(i => ({ name: i.trim(), quantity: 1, price: 0 })) : [];
      
      const transactionData: any = {
        shopId: myShop.id,
        shopName: myShop.name || 'Minha Loja',
        totalValue: Number(newTransaction.totalValue),
        createdAt: Timestamp.fromDate(new Date(newTransaction.date)),
        items: itemsArray,
        paymentMethod: newTransaction.paymentMethod,
        status: newTransaction.status,
        isFromVendor: true,
        month: new Date(newTransaction.date).getMonth(),
        year: new Date(newTransaction.date).getFullYear()
      };

      if (newTransaction.type === 'sale') {
        transactionData.buyerName = newTransaction.buyerName || 'Venda Local';
        transactionData.totalCost = 0;
      } else {
        transactionData.targetShopName = newTransaction.targetShopName || 'Fornecedor/Custo';
      }

      await addDoc(collection(db, 'shops', myShop.id, collectionName), transactionData);
      
      setIsAddingTransaction(false);
      setNewTransaction({
        type: 'sale',
        buyerName: '',
        targetShopName: '',
        totalValue: 0,
        items: '',
        paymentMethod: 'Dinheiro',
        status: 'paid',
        date: new Date().toISOString().split('T')[0]
      });
      showNotification('Lançamento registrado com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
    }
  };

  // Consolidar vendas manuais e pedidos concluídos
  const consolidatedSales = [
    ...sales,
    ...orders.map(o => {
      const orderTotalCost = o.items?.reduce((sum: number, item: any) => {
        const product = products.find(p => p.id === (item.productId || item.id));
        const itemCost = Number(product?.cost) || 0;
        const itemQty = Number(item.quantity) || 0;
        return sum + (itemCost * itemQty);
      }, 0) || 0;
      
      const createdAt = o.createdAt?.toDate() || new Date();

      return {
        id: o.id,
        shopId: o.shopId,
        totalValue: Number(o.totalValue) || 0,
        totalCost: orderTotalCost,
        buyerUid: o.buyerUid,
        createdAt: o.createdAt,
        month: createdAt.getMonth(),
        year: createdAt.getFullYear()
      } as Sale;
    })
  ];

  const totalSalesValue = consolidatedSales.reduce((acc, s) => acc + (Number(s.totalValue) || 0), 0);
  const totalCostValue = consolidatedSales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
  const totalProfitValue = totalSalesValue - totalCostValue;
  const uniqueCustomers = new Set(consolidatedSales.filter(s => s.buyerUid).map(s => s.buyerUid)).size;

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthSales = consolidatedSales.filter(s => s.month === i);
    return {
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      vendas: monthSales.reduce((acc, s) => acc + (Number(s.totalValue) || 0), 0),
      custo: monthSales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0),
      lucro: monthSales.reduce((acc, s) => acc + ((Number(s.totalValue) || 0) - (Number(s.totalCost) || 0)), 0)
    };
  });

  // Top Products: Apenas de pedidos do aplicativo (cadastrados)
  // Excluir produtos que contenham "Saco" e "Tomate" da lista de volume se solicitado
  const orderProductSalesMap: Record<string, number> = {};
  orders.forEach(o => {
    if (o.status === 'completed') {
      o.items.forEach((item: any) => {
        const pId = item.productId || item.id;
        orderProductSalesMap[pId] = (orderProductSalesMap[pId] || 0) + (Number(item.quantity) || 0);
      });
    }
  });

  const topProducts = products
    .filter(p => !(((p.name || '').toLowerCase().includes('tomate') && (p.name || '').toLowerCase().includes('saco'))))
    .map(p => ({ ...p, officialSalesCount: orderProductSalesMap[p.id] || 0 }))
    .sort((a, b) => b.officialSalesCount - a.officialSalesCount)
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
        <div className="flex items-center gap-3">
          <div className="px-6 py-3 bg-white border border-slate-100 text-slate-900 rounded-2xl flex items-center gap-3 shadow-soft">
            <CalendarIcon size={20} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-widest">{new Date().getFullYear()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-emerald-50 transition-all duration-500">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendas Total</p>
          <h4 className="text-3xl font-black text-slate-900 font-display">R$ {totalSalesValue.toFixed(2)}</h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-red-50 transition-all duration-500">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <TrendingDown size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Total</p>
          <h4 className="text-3xl font-black text-slate-900 font-display text-red-600">R$ {totalCostValue.toFixed(2)}</h4>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group hover:bg-brand-50 transition-all duration-500">
          <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <h4 className="text-3xl font-black text-brand-600 font-display">R$ {totalProfitValue.toFixed(2)}</h4>
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
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
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
                    formatter={(value: number, name: string) => [`R$ ${Number(value).toFixed(2)}`, name === 'vendas' ? 'Vendas' : 'Custo']}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVendas)" />
                  <Area type="monotone" dataKey="custo" name="Custo" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorCusto)" />
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
                    <p className="text-sm font-black text-slate-900">{(p as any).officialSalesCount || 0} pedidos</p>
                    <p className="text-[10px] font-bold text-emerald-600">R$ {(((p as any).officialSalesCount || 0) * p.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Calendário de Vendas */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-soft">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <CalendarIcon size={16} /> Calendário Anual
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {monthlyData.map(m => (
                <div key={m.name} className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-emerald-100 transition-all cursor-default">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{m.name}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    m.lucro > 0 ? "bg-emerald-500" : m.lucro < 0 ? "bg-red-500" : "bg-slate-300"
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

      <AnimatePresence>
        {isAddingTransaction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setIsAddingTransaction(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-slate-50 border-b border-slate-100 text-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display text-slate-900">Registrar Lançamento</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Painel do Vendedor</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingTransaction(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Lançamento</label>
                     <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, type: 'sale' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.type === 'sale' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                         )}
                       >Entrada (Receber)</button>
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, type: 'disbursement' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.type === 'disbursement' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                         )}
                       >Saída (Pagar)</button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                     <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, status: 'paid' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.status === 'paid' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400"
                         )}
                       >Concluído</button>
                       <button 
                         onClick={() => setNewTransaction(prev => ({ ...prev, status: 'pending' }))}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           newTransaction.status === 'pending' ? "bg-amber-500 text-white shadow-sm" : "text-slate-400"
                         )}
                       >Pendente</button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      {newTransaction.type === 'sale' ? 'Pessoa / Cliente' : 'Fornecedor / Destino'}
                    </label>
                    <input 
                      type="text"
                      placeholder="Ex: Venda Direta ou Insumos"
                      value={newTransaction.type === 'sale' ? newTransaction.buyerName : newTransaction.targetShopName}
                      onChange={(e) => setNewTransaction(prev => ({ 
                        ...prev, 
                        [newTransaction.type === 'sale' ? 'buyerName' : 'targetShopName']: e.target.value 
                      }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.totalValue || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, totalValue: Number(e.target.value) }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Lançamento</label>
                    <input 
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px) font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pagamento</label>
                    <select 
                      value={newTransaction.paymentMethod}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Pix">Pix</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Boleto">Boleto (Contas)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Itens (Opcional)</label>
                  <textarea 
                    placeholder="O que está sendo lançado?"
                    value={newTransaction.items}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, items: e.target.value }))}
                    rows={2}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button 
                   onClick={() => setIsAddingTransaction(false)}
                   className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all border border-slate-200"
                 >Cancelar</button>
                 <button 
                   onClick={handleRegisterTransaction}
                   className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                 >
                   Confirmar Lançamento
                   <ArrowRight size={18} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShopManagement = ({ 
  user, 
  showNotification,
  showConfirm,
  config,
  onNavigate,
  setSelectedChat,
  setSelectedShop
}: { 
  user: UserProfile | null,
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  config: AppConfig | null,
  onNavigate: (screen: Screen) => void,
  setSelectedChat: (uid: string | null) => void,
  setSelectedShop: (s: Shop | null) => void
}) => {
  return <VendorManagement user={user} showNotification={showNotification} showConfirm={showConfirm} config={config} onNavigate={onNavigate} setSelectedChat={setSelectedChat} setSelectedShop={setSelectedShop} />;
};

const ProfileScreen = ({ 
  user, 
  myShop,
  onUpdate, 
  showNotification,
  showConfirm,
  config,
  onNavigate
}: { 
  user: UserProfile | null, 
  myShop: Shop | null,
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
      'Tem certeza absoluta? Esta ação removerá permanentemente seu perfil, lojas, produtos, mensagens e todas as suas informações da nossa base de dados. Esta ação não pode ser desfeita.',
      async () => {
        setIsDeleting(true);
        try {
          await wipeUserData(user.uid);
          showNotification('Sua conta e todos os seus dados foram excluídos com sucesso.', 'success');
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
                const product: any = products.find(p => p.id === item.productId);
                return sum + ((product?.cost || 0) * item.quantity);
              }, 0) || 0;
              
              profit += ((order.totalValue || 0) - orderCost);
            });

            setSalesStats({
              total,
              count: ordersSnapshot.size,
              profit
            });
          }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `shops/${shopId}/products`));
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

  const displayRole = translateRole(user.role, undefined, myShop?.type || myShop?.category);

  return (
    <div className="p-6 max-w-4xl mx-auto pb-32">
      <PageContainer screen="profile" config={config}>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
          <div className="h-48 bg-slate-100 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
          </div>
          
          <div className="px-10 pb-10">
            <div className="flex flex-col items-center -mt-24 mb-12 relative z-10">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-brand-500/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <SafeImage 
                  src={formData.photoURL || user.photoURL} 
                  className="relative w-40 h-40 rounded-[48px] object-cover border-8 border-white shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out" 
                  alt={user.displayName} 
                />
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
                {displayRole}
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
                    <div className="relative">
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
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {(user.role === 'admin' || user.role === 'state_admin' || user.role === 'municipal_admin') && (
                  <div className="flex flex-col gap-2 group p-6 bg-slate-50 rounded-[32px] border border-slate-100 mt-8">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-brand-500 transition-colors">Abrangência Administrativa</label>
                    <div className="relative">
                      <select 
                        value={formData.role || ''}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                      >
                        <option value="admin">Administrador Global</option>
                        <option value="state_admin">Administrador Estadual</option>
                        <option value="municipal_admin">Administrador Municipal</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">* Alterar sua abrangência afetará seu menu de acesso.</p>
                  </div>
                )}
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
                    <select 
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-5 bg-white border border-slate-100 rounded-3xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Selecione</option>
                      {BRAZIL_STATES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
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
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Conta Verificada</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seus dados estão totalmente protegidos</p>
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
          <div className="md:w-1/3 bg-white p-12 text-slate-900 border-r border-slate-100 relative overflow-hidden flex flex-col justify-between">
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
                <span>Feira Livre, Brasil.</span>
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
                    value={firstName || ''}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Seu nome" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sobrenome</label>
                  <input 
                    type="text" 
                    value={lastName || ''}
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
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sexo</label>
                  <div className="relative">
                    <select 
                      value={gender || ''}
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
                    value={state || ''}
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
                  value={text || ''}
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
  onGoogleLogin,
  selectedChatId: selectedChat,
  setSelectedChatId: setSelectedChat,
  setSelectedShop
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  showConfirm: (t: string, m: string, c: () => void) => void,
  onNavigate: (screen: Screen) => void,
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>,
  selectedChatId: string | null,
  setSelectedChatId: (uid: string | null) => void,
  setSelectedShop: (shop: Shop | null) => void
}) => {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [partnerProfiles, setPartnerProfiles] = useState<{ [key: string]: UserProfile }>({});
  const [shopProfiles, setShopProfiles] = useState<{ [key: string]: Shop }>({});
  const [myShop, setMyShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!selectedChat || selectedChat === 'admin_system') return;

    // Use onSnapshot for the current selected partner to ensure "estado atualizado"
    const partnerRef = doc(db, 'users', selectedChat);
    const unsubPartner = onSnapshot(partnerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPartnerProfiles(prev => ({
          ...prev,
          [selectedChat]: { uid: docSnap.id, ...data } as UserProfile
        }));
      }
    }, (err) => console.error("Error listening to partner profile:", err));

    return () => unsubPartner();
  }, [selectedChat]);

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

  useEffect(() => {
    const fetchAllPartnerProfiles = async () => {
      const uidsToFetch = chats
        .map(c => c.partnerUid)
        .filter(uid => uid !== 'admin_system' && !partnerProfiles[uid]);
      
      if (uidsToFetch.length === 0) return;

      const newProfiles = { ...partnerProfiles };
      let changed = false;

      for (const uid of uidsToFetch) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            newProfiles[uid] = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
            changed = true;
          }
        } catch (err) {
          console.error("Error fetching partner profile:", err);
        }
      }

      if (changed) {
        setPartnerProfiles(newProfiles);
      }
    };

    fetchAllPartnerProfiles();
  }, [chats]);

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
    if (!user || chats.length === 0) return;

    // Listen to profiles for all unique partners in the chat list
    const partnerUids = [...new Set(chats.map(c => c.partnerUid))].filter(uid => uid !== 'admin_system');
    const unsubs: (() => void)[] = [];

      partnerUids.forEach(uid => {
      // 1. Listen to user profile
      const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) {
          const userData = { uid: snap.id, ...snap.data() } as UserProfile;
          setPartnerProfiles(prev => ({ ...prev, [uid]: userData }));
          
          // 2. If vendor, also listen to their shop profile
          if (userData.role === 'vendor') {
            const shopQuery = query(collection(db, 'shops'), where('ownerUid', '==', uid), limit(1));
            const unsubShop = onSnapshot(shopQuery, (sSnap) => {
              if (!sSnap.empty) {
                setShopProfiles(prev => ({ 
                  ...prev, 
                  [uid]: { id: sSnap.docs[0].id, ...sSnap.docs[0].data() } as Shop 
                }));
              } else {
                setShopProfiles(prev => {
                  const next = { ...prev };
                  delete next[uid];
                  return next;
                });
              }
            }, (err) => console.error("Error watching shop:", err));
            unsubs.push(unsubShop);
          }
        } else {
          // Profile deleted
          setPartnerProfiles(prev => {
            const next = { ...prev };
            delete next[uid];
            return next;
          });
          setShopProfiles(prev => {
            const next = { ...prev };
            delete next[uid];
            return next;
          });
        }
      }, (err) => console.error("Error watching user profile:", err));
      unsubs.push(unsubUser);
    });

    return () => unsubs.forEach(u => u());
  }, [chats.length, user?.uid]);

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
        
        // Partner info from message - strictly a fallback
        if (msg.senderUid !== user.uid) {
          chatGroups[partnerUid].partnerName = msg.senderName;
          chatGroups[partnerUid].partnerPhotoURL = msg.senderPhotoURL;
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

  if (!user) return <LoginRequiredView onGoogleLogin={onGoogleLogin} />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-12rem)] flex gap-6 relative">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div className={cn(
        "w-full md:w-80 bg-white rounded-[32px] shadow-soft border border-slate-100 flex flex-col overflow-hidden transition-all duration-500",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 font-display uppercase tracking-widest">Finalizar Pedido</h2>
          <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
            <ArrowRight size={18} />
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
                    ) : (
                      <SafeImage 
                        src={shopProfiles[chat.partnerUid]?.photoURL || partnerProfiles[chat.partnerUid]?.photoURL || chat.partnerPhotoURL} 
                        type={shopProfiles[chat.partnerUid] ? 'shop' : 'user'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Shop Badge Overlay for Vendors */}
                  {partnerProfiles[chat.partnerUid]?.role === 'vendor' && shopProfiles[chat.partnerUid]?.photoURL && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-white shadow-md overflow-hidden bg-white z-10 hidden group-hover:block transition-all flex items-center justify-center">
                      <SafeImage src={shopProfiles[chat.partnerUid].photoURL} type="shop" className="w-full h-full object-cover" />
                    </div>
                  )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <div className="flex flex-col min-w-0">
                          <p className={cn(
                            "font-black truncate text-sm leading-tight",
                            selectedChat === chat.partnerUid ? "text-white" : "text-slate-900"
                          )}>
                            {partnerProfiles[chat.partnerUid]?.displayName || chat.partnerName || `Usuário ${chat.partnerUid.slice(0, 5)}`}
                          </p>
                          {shopProfiles[chat.partnerUid]?.name && (
                            <p className={cn(
                              "text-[9px] font-black uppercase tracking-widest truncate mt-0.5",
                              selectedChat === chat.partnerUid ? "text-white/60" : "text-emerald-600"
                            )}>
                              {shopProfiles[chat.partnerUid].name}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest flex-shrink-0 pt-0.5",
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
            <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 overflow-hidden">
              <div className="flex items-center gap-2 w-10 md:w-auto">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="p-2 md:hidden hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="flex flex-col items-center gap-1 group transition-all"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-[16px] md:rounded-[20px] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                    {selectedChat === 'admin_system' ? (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                        <ShieldCheck size={20} />
                      </div>
                    ) : (
                      <SafeImage 
                        src={shopProfiles[selectedChat]?.photoURL || partnerProfiles[selectedChat]?.photoURL || chats.find(c => c.partnerUid === selectedChat)?.partnerPhotoURL} 
                        type={shopProfiles[selectedChat] ? 'shop' : 'user'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-center min-w-0">
                    <h3 className="font-black text-slate-900 text-[13px] md:text-sm font-display group-hover:text-emerald-600 transition-colors truncate max-w-[200px] md:max-w-xs leading-none">
                      {selectedChat === 'admin_system' ? 'Administração do Sistema' : (partnerProfiles[selectedChat]?.displayName || shopProfiles[selectedChat]?.name || chats.find(c => c.partnerUid === selectedChat)?.partnerName || `Usuário ${selectedChat.slice(0, 5)}`)}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        {selectedChat !== 'admin_system' && shopProfiles[selectedChat] ? (
                          <>
                            <div className={cn(
                              "w-1 h-1 rounded-full",
                              isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours, shopProfiles[selectedChat] as any) ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            <p className={cn(
                              "text-[8px] font-black uppercase tracking-[0.2em]",
                              isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours, shopProfiles[selectedChat] as any) ? "text-emerald-500" : "text-red-500"
                            )}>
                              {isShopOpen(shopProfiles[selectedChat].openingHours, shopProfiles[selectedChat].closingHours, shopProfiles[selectedChat] as any) ? 'Aberto' : 'Fechado'}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                            <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em]">Ativo</p>
                          </>
                        )}
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2 w-10 md:w-auto justify-end">
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
                    <div 
                      className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white shadow-sm mt-1 bg-white cursor-pointer hover:scale-110 transition-transform active:scale-95 flex items-center justify-center"
                      onClick={() => {
                        const img = msg.senderUid === user.uid ? user.photoURL : (shopProfiles[msg.senderUid]?.photoURL || partnerProfiles[msg.senderUid]?.photoURL || msg.senderPhotoURL);
                        if (img) setFullScreenImage(img);
                      }}
                    >
                      {msg.senderUid === 'admin_system' ? (
                        <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white">
                          <ShieldCheck size={14} />
                        </div>
                      ) : (
                        <SafeImage 
                          src={msg.senderUid === user.uid ? user.photoURL : (shopProfiles[msg.senderUid]?.photoURL || partnerProfiles[msg.senderUid]?.photoURL || msg.senderPhotoURL)} 
                          type={msg.senderUid === user.uid ? 'user' : (shopProfiles[msg.senderUid] ? 'shop' : 'user')}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className={cn(
                      "flex flex-col",
                      msg.senderUid === user.uid ? "items-end" : "items-start"
                    )}>
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">
                          {msg.senderUid === user.uid 
                            ? user.displayName 
                            : (partnerProfiles[msg.senderUid]?.displayName || shopProfiles[msg.senderUid]?.name || msg.senderName || 'Usuário')}
                       </span>
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
                            <SafeImage 
                              src={msg.image} 
                              type="product"
                              className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => setFullScreenImage(msg.image || null)} 
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
                    value={newMessage || ''}
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
        {showProfileModal && selectedChat && (partnerProfiles[selectedChat] || shopProfiles[selectedChat]) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/10 backdrop-blur-md"
              onClick={() => setShowProfileModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-auto max-h-[85vh] mx-auto z-10 border border-slate-100"
            >
              {/* Header for back to chat */}
              <div className="bg-white border-b border-slate-50 p-6 flex items-center justify-between sticky top-0 z-[40]">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all flex items-center gap-2 group"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-black text-[10px] uppercase tracking-[0.2em]">Voltar ao Pedido</span>
                </button>
                <div className="w-10 h-1 md:hidden bg-slate-200 rounded-full" /> {/* Touch indicator for visual comfort */}
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-0 pb-10" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform', contain: 'layout style paint' }}>
                {/* Modern Header Banner */}
                <div className="relative h-48 w-full bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  
                  {/* Top Actions Desktop */}
                  <div className="absolute top-0 left-0 right-0 p-6 hidden md:flex items-center justify-between z-30">
                    <button 
                      onClick={() => setShowProfileModal(false)}
                      className="p-2.5 bg-black/20 backdrop-blur-3xl text-white rounded-2xl border border-white/20 hover:bg-black/40 transition-all shadow-xl flex items-center gap-2 group"
                    >
                      <ArrowLeft size={16} />
                      <span className="font-black uppercase tracking-widest text-[9px]">Voltar ao Pedido</span>
                    </button>
                  </div>
   
                  {/* Profile Picture Overlay */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-white p-1.5 rounded-[32px] shadow-2xl">
                        <div 
                          className="w-full h-full rounded-[24px] overflow-hidden bg-slate-50 border-2 border-slate-50 relative"
                        >
                          <SafeImage 
                            src={partnerProfiles[selectedChat]?.photoURL || shopProfiles[selectedChat]?.photoURL} 
                            type={shopProfiles[selectedChat] ? "shop" : "user"}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
   
                {/* Profile Details Section */}
                <div className="pt-16 pb-10 px-8 w-full text-center">
                  <div className="space-y-4 mb-8">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                        {partnerProfiles[selectedChat]?.displayName || shopProfiles[selectedChat]?.name || chats.find(c => c.partnerUid === selectedChat)?.partnerName || 'Membro Feira'}
                      </h1>
                      
                      {partnerProfiles[selectedChat]?.age && (
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest -mt-1">
                          {partnerProfiles[selectedChat].age} anos
                        </p>
                      )}

                      <div className="flex justify-center">
                        <div className="px-5 py-2 bg-brand-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          {translateRole(partnerProfiles[selectedChat]?.role || 'customer', undefined, shopProfiles[selectedChat]?.type || shopProfiles[selectedChat]?.category)}
                        </div>
                      </div>
                    </div>
   
                    {shopProfiles[selectedChat] && (
                      <button 
                        onClick={() => {
                          onNavigate('shop-detail');
                          setSelectedShop(shopProfiles[selectedChat]);
                          setShowProfileModal(false);
                        }}
                        className="w-full px-6 py-4 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] hover:bg-brand-600 transition-all shadow-xl flex items-center justify-center gap-3 group"
                      >
                        <ShoppingBag size={18} />
                        Visitar Loja
                      </button>
                    )}
                  </div>
   
                  {/* Info Section */}
                  <div className="space-y-5">
                    <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 underline decoration-brand-500/30 decoration-2 underline-offset-4">Informações</h4>
                      
                      <div className="space-y-6 text-left">
                        {(partnerProfiles[selectedChat]?.whatsapp || shopProfiles[selectedChat]?.whatsapp) && (
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-emerald-600 shadow-sm transition-all shrink-0">
                              <Phone size={18} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">WhatsApp</p>
                               <p className="text-sm font-black text-slate-900 truncate">{(shopProfiles[selectedChat]?.whatsapp || partnerProfiles[selectedChat]?.whatsapp)}</p>
                            </div>
                          </div>
                        )}
   
                         {(shopProfiles[selectedChat]?.address || partnerProfiles[selectedChat]?.address || partnerProfiles[selectedChat]?.city) && (
                          <div className="flex items-start gap-4 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-blue-600 shadow-sm transition-all shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Endereço Completo</p>
                               <p className="text-[13px] font-bold text-slate-900 leading-relaxed">
                                 {shopProfiles[selectedChat]?.address || partnerProfiles[selectedChat]?.address || 'Zona Rural'}, {shopProfiles[selectedChat]?.city || partnerProfiles[selectedChat]?.city || 'Cidade'}, {getFullStateName(shopProfiles[selectedChat]?.state || partnerProfiles[selectedChat]?.state || '')}. Brasil.
                               </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-brand-600 shadow-sm transition-all shrink-0">
                            <Mail size={18} />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">E-mail</p>
                             <p className="text-sm font-black text-slate-900 truncate">{partnerProfiles[selectedChat]?.email || 'Não informado'}</p>
                          </div>
                        </div>

                        {partnerProfiles[selectedChat]?.gender && (
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-purple-600 shadow-sm transition-all shrink-0">
                              <User size={18} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gênero</p>
                               <p className="text-sm font-black text-slate-900">
                                 {partnerProfiles[selectedChat].gender === 'M' ? 'Masculino' : 
                                  partnerProfiles[selectedChat].gender === 'F' ? 'Feminino' : 'Outro'}
                               </p>
                            </div>
                          </div>
                        )}

                        {partnerProfiles[selectedChat]?.phone && partnerProfiles[selectedChat]?.phone !== (shopProfiles[selectedChat]?.whatsapp || partnerProfiles[selectedChat]?.whatsapp) && (
                          <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-brand-500 shadow-sm transition-all shrink-0">
                              <Phone size={18} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Telefone</p>
                               <p className="text-sm font-black text-slate-900 truncate">{partnerProfiles[selectedChat].phone}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm transition-all shrink-0">
                            <Calendar size={18} />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Membro desde</p>
                             <p className="text-sm font-black text-slate-900">
                                {partnerProfiles[selectedChat]?.createdAt?.toDate 
                                  ? partnerProfiles[selectedChat].createdAt.toDate().toLocaleDateString('pt-BR')
                                  : 'Janeiro de 2026'}
                             </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm transition-all shrink-0">
                            <Clock size={18} />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Visto por último</p>
                             <p className="text-[11px] font-bold text-slate-500 italic">
                                {partnerProfiles[selectedChat]?.lastSeenChatAt 
                                 ? `${new Date(partnerProfiles[selectedChat].lastSeenChatAt.toMillis()).toLocaleString('pt-BR')}`
                                 : 'Recentemente'}
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
   
                  <div className="mt-8 text-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    © 2026 FEIRA LIVRE
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Viewer */}
      <AnimatePresence>
        {fullScreenImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 cursor-zoom-out" 
              onClick={() => setFullScreenImage(null)} 
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setFullScreenImage(null)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-900 text-white rounded-2xl transition-all z-10 flex items-center justify-center shadow-2xl active:scale-90"
            >
              <X size={24} />
            </motion.button>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }} 
              className="relative max-w-[95vw] max-h-[90vh] md:max-w-3xl overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-white p-2"
            >
              <SafeImage 
                src={fullScreenImage} 
                className="w-full h-auto max-h-[85vh] object-contain rounded-[32px]" 
                alt="Full profile view" 
              />
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
              onClick={() => this.setState({ hasError: false, errorInfo: null })}
              className="w-full py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---

const wipeUserData = async (targetUid: string) => {
  try {
    // 0. Save User Profile to deletedUsers collection
    const userDocRef = doc(db, 'users', targetUid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      let shopType = null;
      
      // If vendor, get their shop type
      if (userData.role === 'vendor') {
        const shopsSnap = await getDocs(query(collection(db, 'shops'), where('ownerUid', '==', targetUid)));
        if (!shopsSnap.empty) {
          shopType = shopsSnap.docs[0].data().type;
        }
      }

      await addDoc(collection(db, 'deletedUsers'), {
        ...userData,
        shopTypeSelected: shopType,
        deletedAt: serverTimestamp(),
        loginMethod: 'Phone' // Default for this app
      });
    }

    // 1. Delete Shop and its subcollections (products, sales, disbursements)
    const shopsSnap = await getDocs(query(collection(db, 'shops'), where('ownerUid', '==', targetUid)));
    for (const shopDoc of shopsSnap.docs) {
      // Products subcollection
      const productsSnap = await getDocs(collection(db, 'shops', shopDoc.id, 'products'));
      const productDeletes = productsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(productDeletes);
      
      // Sales subcollection
      const salesSnap = await getDocs(collection(db, 'shops', shopDoc.id, 'sales'));
      const saleDeletes = salesSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(saleDeletes);

      // Disbursements subcollection
      const disbursementsSnap = await getDocs(collection(db, 'shops', shopDoc.id, 'disbursements'));
      const disbursementDeletes = disbursementsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(disbursementDeletes);

      await deleteDoc(shopDoc.ref);
    }

    // 2. Delete Chat Messages (sent or received)
    const sentQuery = query(collection(db, 'chatMessages'), where('senderUid', '==', targetUid));
    const recQuery = query(collection(db, 'chatMessages'), where('receiverUid', '==', targetUid));
    const [sentSnap, recSnap] = await Promise.all([getDocs(sentQuery), getDocs(recQuery)]);
    
    const msgDeletes = [...sentSnap.docs, ...recSnap.docs].map(d => deleteDoc(d.ref));
    await Promise.all(msgDeletes);

    // 3. Delete Contact Messages
    const contactSnap = await getDocs(query(collection(db, 'contactMessages'), where('senderUid', '==', targetUid)));
    for (const contact of contactSnap.docs) await deleteDoc(contact.ref);

    // 4. Delete Notifications created by user
    const notifSnap = await getDocs(query(collection(db, 'notifications'), where('authorId', '==', targetUid)));
    for (const notif of notifSnap.docs) await deleteDoc(notif.ref);

    // 5. Delete Job Openings
    const jobsSnap = await getDocs(query(collection(db, 'jobOpenings'), where('ownerUid', '==', targetUid)));
    for (const job of jobsSnap.docs) await deleteDoc(job.ref);

    // 6. Delete Job Applications
    const appsSnap = await getDocs(query(collection(db, 'jobApplications'), where('applicantUid', '==', targetUid)));
    for (const app of appsSnap.docs) await deleteDoc(app.ref);

    // 7. Delete Orders (as buyer or shop owner)
    const buyerOrders = await getDocs(query(collection(db, 'orders'), where('buyerUid', '==', targetUid)));
    const shopOrders = await getDocs(query(collection(db, 'orders'), where('shopOwnerUid', '==', targetUid)));
    const orderDeletes = [...buyerOrders.docs, ...shopOrders.docs].map(d => deleteDoc(d.ref));
    await Promise.all(orderDeletes);

    // 8. Delete User Profile
    await deleteDoc(doc(db, 'users', targetUid));
  } catch (error) {
    console.error("Error wiping user data:", error);
    throw error;
  }
};


const CartSummaryBar = ({ cart, onNavigate, user }: { cart: any, onNavigate: (s: any) => void, user: any }) => {
  if (!cart || cart.items.length === 0) return null;
  const total = cart.items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-white/90 backdrop-blur-2xl border border-slate-200/50 p-5 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col gap-4 mb-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
          <ShoppingCart size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{cart.shopName}</h4>
            <span className="text-xs font-black text-emerald-600 tabular-nums">R$ {total.toFixed(2)}</span>
          </div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none">
            {cart.shopCity}, {cart.shopState} • {cart.items.length} itens
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => onNavigate('orders')}
        className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
      >
        <span>PEDIDOS</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}



// Notification Service
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    // Attempt standard notification first
    new Notification(title, {
      body,
      icon: icon || 'https://picsum.photos/seed/logo/200',
    });
  } catch (e) {
    // Fallback for environments where constructor is not allowed (like some mobile browsers or service worker contexts)
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: icon || 'https://picsum.photos/seed/logo/200',
        });
      }).catch(err => {
        console.error("Delayed browser notification failed:", err);
      });
    } else {
      console.error("Browser notification failed:", e);
    }
  }
};

const CompleteRegistrationView = ({ 
  regName, 
  setRegName, 
  regPhone, 
  setRegPhone, 
  onSave, 
  onCancel,
  isSaving
}: { 
  regName: string, 
  setRegName: (v: string) => void,
  regPhone: string, 
  setRegPhone: (v: string) => void,
  onSave: () => void,
  onCancel: () => void,
  isSaving: boolean
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
          <UserPlus size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight mb-2">Completar Cadastro</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Para sua segurança e melhor experiência, precisamos confirmar seus dados básicos antes de continuar.
        </p>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Seu nome"
              className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone Celular</label>
            <input 
              type="tel"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={onSave}
              disabled={isSaving || !regName || !regPhone}
              className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Salvar Cadastro
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// Re-integrated hooks to solve runtime issues
function useCart() {
  const [cart, setCartState] = useState<Cart | null>(null);
  const cartRef = useRef<Cart | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        cartRef.current = parsed;
        setCartState(parsed);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const updateCart = useCallback((val: Cart | null | ((prev: Cart | null) => Cart | null)) => {
    const nextVal = typeof val === 'function' ? val(cartRef.current) : val;
    cartRef.current = nextVal;
    setCartState(nextVal);
    if (nextVal) {
      localStorage.setItem('cart', JSON.stringify(nextVal));
    } else {
      localStorage.removeItem('cart');
    }
  }, []);

  const addToCart = useCallback((product: Product, shop: any) => {
    updateCart(prev => {
      if (!prev || prev.shopId !== shop.id) {
        return {
          shopId: shop.id,
          shopName: shop.name,
          shopOwnerUid: shop.ownerUid || '',
          shopPhotoURL: shop.photoURL,
          shopAddress: shop.address,
          shopCity: shop.city,
          shopState: shop.state,
          shopWhatsapp: shop.whatsapp,
          items: [{ product, quantity: 1 }]
        };
      }

      const existingItem = prev.items.find(item => item.product.id === product.id);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...prev,
        items: [...prev.items, { product, quantity: 1 }]
      };
    });
  }, [updateCart]);

  const removeFromCart = useCallback((product: Product) => {
    updateCart(prev => {
      if (!prev) return null;
      const existingItem = prev.items.find(item => item.product.id === product.id);
      if (!existingItem) return prev;

      if (existingItem.quantity <= 1) {
        const remainingItems = prev.items.filter(item => item.product.id !== product.id);
        if (remainingItems.length === 0) return null;
        return { ...prev, items: remainingItems };
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      };
    });
  }, [updateCart]);

  const updateQuantity = useCallback((product: Product, quantity: number, shop?: any) => {
    updateCart(prev => {
      if (quantity <= 0) {
        if (!prev) return null;
        const newItems = prev.items.filter(i => i.product.id !== product.id);
        if (newItems.length === 0) return null;
        return { ...prev, items: newItems };
      }

      if (!prev) {
        if (!shop) return null;
        return {
          shopId: shop.id,
          shopName: shop.name,
          shopOwnerUid: shop.ownerUid || '',
          shopPhotoURL: shop.photoURL,
          shopAddress: shop.address,
          shopCity: shop.city,
          shopState: shop.state,
          shopWhatsapp: shop.whatsapp,
          items: [{ product, quantity }]
        };
      }

      const existing = prev.items.find(i => i.product.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.product.id === product.id ? { ...i, quantity } : i)
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { product, quantity }]
        };
      }
    });
  }, [updateCart]);

  return {
    cart,
    setCart: updateCart,
    addToCart,
    removeFromCart,
    updateQuantity
  };
}

function useProducts(shopId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, `shops/${shopId}/products`),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  return { products, loading };
}

function MainApp() {
  const [currentScreen, _setCurrentScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const screen = searchParams.get('screen');
      
      if (path === '/privacy' || path === '/privacidade' || screen === 'privacy' || screen === 'privacidade') return 'privacy';
      if (path === '/tos' || path === '/terms' || path === '/termos-of-service' || path === '/termosdeusos' || screen === 'terms' || screen === 'termosdeusos') return 'terms';
      if (path === '/sobre' || path === '/about' || screen === 'about' || screen === 'sobre') return 'about';
      if (path === '/careers' || path === '/trabalhe-conosco' || screen === 'careers' || screen === 'trabalhe-conosco') return 'careers';
      if (path === '/contact' || path === '/contato' || path === '/suporte' || screen === 'contact' || screen === 'contato' || screen === 'suporte') return 'contact';
      if (path === '/calculadora' || screen === 'feira-livre-calculadora' || screen === 'calculadora') return 'feira-livre-calculadora';
      
      // Internal Auth / App Pages mapped to Portuguese friendly paths
      if (path === '/varejo' || path === '/comprar' || path === '/busca' || screen === 'varejo' || screen === 'search') return 'search';
      if (path === '/atacado' || screen === 'atacado' || screen === 'wholesale') return 'wholesale';
      if (path === '/perfil' || path === '/cadastro' || screen === 'perfil' || screen === 'cadastro' || screen === 'profile') return 'profile';
      if (path === '/pedidos' || path === '/meus-pedidos' || screen === 'pedidos' || screen === 'meus-pedidos' || screen === 'orders') return 'orders';
      if (path === '/conversas' || path === '/mensagens' || screen === 'conversas' || screen === 'mensagens' || screen === 'chats') return 'chats';
      if (path === '/salvos' || path === '/favoritos' || screen === 'salvos' || screen === 'favoritos' || screen === 'saved') return 'saved';
      if (path === '/minha-loja' || path === '/gerenciar-loja' || screen === 'minha-loja' || screen === 'gerenciar-loja' || screen === 'shop-management') return 'shop-management';
      if (path === '/criar-loja' || screen === 'criar-loja' || screen === 'create-shop') return 'create-shop';
      if (path === '/vendas' || path === '/painel-de-vendas' || screen === 'vendas' || screen === 'painel-de-vendas' || screen === 'sales') return 'sales';
      if (path === '/caixa' || path === '/contabilidade' || screen === 'caixa' || screen === 'contabilidade' || screen === 'vendor-accounting') return 'vendor-accounting';
      if (path === '/painel-admin' || path === '/admin' || screen === 'painel-admin' || screen === 'admin' || screen === 'admin-dashboard') return 'admin-dashboard';
    }
    return 'landing';
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const startTime = useRef(Timestamp.now());
  const notifiedOrders = useRef<Set<string>>(new Set());
  const [loggingInRole, _setLoggingInRole] = useState<string | null>(null);
  const loggingInRoleRef = useRef<string | null>(null);
  const setLoggingInRole = (role: string | null) => {
    loggingInRoleRef.current = role;
    _setLoggingInRole(role);
  };
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: () => void,
    icon?: any,
    confirmText?: string,
    cancelText?: string,
    type?: 'danger' | 'info' | 'warning'
  } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Optimized cart management using centralized hook
  const { cart, setCart, addToCart, removeFromCart, updateQuantity } = useCart();
  // Optimized product management
  const { products, loading: isLoadingProducts } = useProducts(selectedShop?.id);
  const [userShops, setUserShops] = useState<string[]>([]);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newBuyerOrdersCount, setNewBuyerOrdersCount] = useState(0);
  const [wholesaleShopsCount, setWholesaleShopsCount] = useState(0);
  const [myShop, setMyShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!user) {
      setWholesaleShopsCount(0);
      return;
    }
    const q = query(collection(db, 'shops'), where('isApproved', '==', true), where('type', '==', 'atacado'));
    return onSnapshot(q, (snapshot) => {
      setWholesaleShopsCount(snapshot.size);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'shops'));
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

  const [showCompleteRegistration, setShowCompleteRegistration] = useState(false);
  const [regData, setRegData] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: UserRole;
    loginType?: string;
  } | null>(null);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [isVerifyingRegOTP, setIsVerifyingRegOTP] = useState(false);
  const [isSendingRegOTP, setIsSendingRegOTP] = useState(false);
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);

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
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const screenParam = searchParams.get('screen');
    
    // Check if it's a public path or parameter
    const isPublicPath = path === '/' || path === '/privacy' || path === '/privacidade' || path === '/tos' || path === '/terms' || path === '/termos-of-service' || path === '/termosdeusos' || path === '/sobre' || path === '/about' || path === '/careers' || path === '/trabalhe-conosco' || path === '/contact' || path === '/contato' || path === '/suporte' || path === '/calculadora' || path === '/feira-livre-calculadora' || path === '/varejo' || path === '/comprar' || path === '/busca' || path === '/atacado' || path === '/perfil' || path === '/cadastro' || path === '/pedidos' || path === '/meus-pedidos' || path === '/conversas' || path === '/mensagens' || path === '/salvos' || path === '/favoritos' || path === '/minha-loja' || path === '/gerenciar-loja' || path === '/criar-loja' || path === '/vendas' || path === '/caixa' || path === '/contabilidade' || path === '/painel-admin' || path === '/admin';
    const isPublicParam = screenParam === 'privacy' || screenParam === 'terms' || screenParam === 'landing' || screenParam === 'privacidade' || screenParam === 'termosdeusos' || screenParam === 'about' || screenParam === 'sobre' || screenParam === 'careers' || screenParam === 'trabalhe-conosco' || screenParam === 'contact' || screenParam === 'contato' || screenParam === 'suporte' || screenParam === 'feira-livre-calculadora' || screenParam === 'varejo' || screenParam === 'comprar' || screenParam === 'busca' || screenParam === 'search' || screenParam === 'atacado' || screenParam === 'wholesale' || screenParam === 'perfil' || screenParam === 'cadastro' || screenParam === 'profile' || screenParam === 'pedidos' || screenParam === 'meus-pedidos' || screenParam === 'orders' || screenParam === 'conversas' || screenParam === 'mensagens' || screenParam === 'chats' || screenParam === 'salvos' || screenParam === 'favoritos' || screenParam === 'saved' || screenParam === 'minha-loja' || screenParam === 'gerenciar-loja' || screenParam === 'shop-management' || screenParam === 'criar-loja' || screenParam === 'create-shop' || screenParam === 'vendas' || screenParam === 'sales' || screenParam === 'caixa' || screenParam === 'contabilidade' || screenParam === 'vendor-accounting' || screenParam === 'painel-admin' || screenParam === 'admin' || screenParam === 'admin-dashboard';
    const isPublicMode = isPublicPath || isPublicParam;

    if (!hasSeen && !isPublicMode) {
      setShowPermissionModal(true);
    }

    // URL path or param detection on startup
    if (path === '/privacy' || path === '/privacidade' || screenParam === 'privacy' || screenParam === 'privacidade') {
      _setCurrentScreen('privacy');
      setShowPermissionModal(false);
    } else if (path === '/tos' || path === '/terms' || path === '/terms-of-service' || path === '/termosdeusos' || screenParam === 'terms' || screenParam === 'termosdeusos') {
      _setCurrentScreen('terms');
      setShowPermissionModal(false);
    } else if (path === '/sobre' || path === '/about' || screenParam === 'about' || screenParam === 'sobre') {
      _setCurrentScreen('about');
      setShowPermissionModal(false);
    } else if (path === '/careers' || path === '/trabalhe-conosco' || screenParam === 'careers' || screenParam === 'trabalhe-conosco') {
      _setCurrentScreen('careers');
      setShowPermissionModal(false);
    } else if (path === '/contact' || path === '/contato' || path === '/suporte' || screenParam === 'contact' || screenParam === 'contato' || screenParam === 'suporte') {
      _setCurrentScreen('contact');
      setShowPermissionModal(false);
    } else if (path === '/calculadora' || path === '/feira-livre-calculadora' || screenParam === 'feira-livre-calculadora' || screenParam === 'calculadora') {
      _setCurrentScreen('feira-livre-calculadora');
      setShowPermissionModal(false);
    } else if (path === '/varejo' || path === '/comprar' || path === '/busca' || screenParam === 'varejo' || screenParam === 'search') {
      _setCurrentScreen('search');
      setShowPermissionModal(false);
    } else if (path === '/atacado' || screenParam === 'atacado' || screenParam === 'wholesale') {
      _setCurrentScreen('wholesale');
      setShowPermissionModal(false);
    } else if (path === '/perfil' || path === '/cadastro' || screenParam === 'perfil' || screenParam === 'cadastro' || screenParam === 'profile') {
      _setCurrentScreen('profile');
      setShowPermissionModal(false);
    } else if (path === '/pedidos' || path === '/meus-pedidos' || screenParam === 'pedidos' || screenParam === 'meus-pedidos' || screenParam === 'orders') {
      _setCurrentScreen('orders');
      setShowPermissionModal(false);
    } else if (path === '/conversas' || path === '/mensagens' || screenParam === 'conversas' || screenParam === 'mensagens' || screenParam === 'chats') {
      _setCurrentScreen('chats');
      setShowPermissionModal(false);
    } else if (path === '/salvos' || path === '/favoritos' || screenParam === 'salvos' || screenParam === 'favoritos' || screenParam === 'saved') {
      _setCurrentScreen('saved');
      setShowPermissionModal(false);
    } else if (path === '/minha-loja' || path === '/gerenciar-loja' || screenParam === 'minha-loja' || screenParam === 'gerenciar-loja' || screenParam === 'shop-management') {
      _setCurrentScreen('shop-management');
      setShowPermissionModal(false);
    } else if (path === '/criar-loja' || screenParam === 'criar-loja' || screenParam === 'create-shop') {
      _setCurrentScreen('create-shop');
      setShowPermissionModal(false);
    } else if (path === '/vendas' || path === '/painel-de-vendas' || screenParam === 'vendas' || screenParam === 'painel-de-vendas' || screenParam === 'sales') {
      _setCurrentScreen('sales');
      setShowPermissionModal(false);
    } else if (path === '/caixa' || path === '/contabilidade' || screenParam === 'caixa' || screenParam === 'contabilidade' || screenParam === 'vendor-accounting') {
      _setCurrentScreen('vendor-accounting');
      setShowPermissionModal(false);
    } else if (path === '/painel-admin' || path === '/admin' || screenParam === 'painel-admin' || screenParam === 'admin' || screenParam === 'admin-dashboard') {
      _setCurrentScreen('admin-dashboard');
      setShowPermissionModal(false);
    }

    // Add popstate listener for browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        _setCurrentScreen(event.state.screen);
      } else {
        const currPath = window.location.pathname;
        if (currPath === '/privacy' || currPath === '/privacidade') _setCurrentScreen('privacy');
        else if (currPath === '/tos' || currPath === '/terms' || currPath === '/termosdeusos') _setCurrentScreen('terms');
        else if (currPath === '/sobre' || currPath === '/about') _setCurrentScreen('about');
        else if (currPath === '/careers' || currPath === '/trabalhe-conosco') _setCurrentScreen('careers');
        else if (currPath === '/contact' || currPath === '/contato' || currPath === '/suporte') _setCurrentScreen('contact');
        else if (currPath === '/calculadora') _setCurrentScreen('feira-livre-calculadora');
        else if (currPath === '/varejo' || currPath === '/comprar' || currPath === '/busca') _setCurrentScreen('search');
        else if (currPath === '/atacado') _setCurrentScreen('wholesale');
        else if (currPath === '/perfil' || currPath === '/cadastro') _setCurrentScreen('profile');
        else if (currPath === '/pedidos' || currPath === '/meus-pedidos') _setCurrentScreen('orders');
        else if (currPath === '/conversas' || currPath === '/mensagens') _setCurrentScreen('chats');
        else if (currPath === '/salvos' || currPath === '/favoritos') _setCurrentScreen('saved');
        else if (currPath === '/minha-loja' || currPath === '/gerenciar-loja') _setCurrentScreen('shop-management');
        else if (currPath === '/criar-loja') _setCurrentScreen('create-shop');
        else if (currPath === '/vendas' || currPath === '/painel-de-vendas') _setCurrentScreen('sales');
        else if (currPath === '/caixa' || currPath === '/contabilidade') _setCurrentScreen('vendor-accounting');
        else if (currPath === '/painel-admin' || currPath === '/admin') _setCurrentScreen('admin-dashboard');
        else _setCurrentScreen('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Synchronize active screen back to browser address bar URL pathname
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let expectedPath = '/';
      if (currentScreen === 'privacy') {
        expectedPath = '/privacidade';
      } else if (currentScreen === 'terms') {
        expectedPath = '/termosdeusos';
      } else if (currentScreen === 'about') {
        expectedPath = '/sobre';
      } else if (currentScreen === 'careers') {
        expectedPath = '/trabalhe-conosco';
      } else if (currentScreen === 'contact') {
        expectedPath = '/suporte';
      } else if (currentScreen === 'feira-livre-calculadora') {
        expectedPath = '/calculadora';
      } else if (currentScreen === 'search') {
        expectedPath = '/varejo';
      } else if (currentScreen === 'wholesale') {
        expectedPath = '/atacado';
      } else if (currentScreen === 'profile') {
        expectedPath = '/perfil';
      } else if (currentScreen === 'orders') {
        expectedPath = '/meus-pedidos';
      } else if (currentScreen === 'chats') {
        expectedPath = '/conversas';
      } else if (currentScreen === 'saved') {
        expectedPath = '/salvos';
      } else if (currentScreen === 'shop-management') {
        expectedPath = '/minha-loja';
      } else if (currentScreen === 'create-shop') {
        expectedPath = '/criar-loja';
      } else if (currentScreen === 'sales') {
        expectedPath = '/vendas';
      } else if (currentScreen === 'vendor-accounting') {
        expectedPath = '/caixa';
      } else if (currentScreen === 'admin-dashboard') {
        expectedPath = '/painel-admin';
      }

      if (window.location.pathname !== expectedPath) {
        window.history.pushState({ screen: currentScreen }, '', expectedPath);
      }
    }
  }, [currentScreen]);

  const handleNavigate = async (screen: Screen) => {
    // Verify permission modal acknowledgment
    const permissionsSeen = localStorage.getItem('feira_livre_permissions_seen');
    const isPublicScreen = screen === 'landing' || screen === 'privacy' || screen === 'terms' || screen === 'about' || screen === 'careers' || screen === 'contact' || screen === 'search' || screen === 'wholesale' || screen === 'feira-livre-calculadora';

    if (!permissionsSeen && !isPublicScreen) {
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

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    options?: { 
      type?: 'danger' | 'info' | 'warning', 
      icon?: any, 
      confirmText?: string, 
      cancelText?: string 
    }
  ) => {
    setConfirmModal({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm, 
      ...options 
    });
  };

  const sharedAddToCart = React.useCallback((product: Product, shop: Shop) => {
    if (product.stock <= 0) {
      showNotification(`Desculpe, o produto ${product.name} acabou no momento.`, 'error');
      return;
    }

    if (cart && cart.shopId !== shop.id) {
      showConfirm(
        'Limpar Carrinho?',
        'Você já possui itens de outra loja. Deseja limpar o pedido atual?',
        () => {
          addToCart(product, shop);
          showNotification('Pedido iniciado!', 'success');
        }
      );
      return;
    }

    addToCart(product, shop);
    showNotification('Adicionado', 'success');
  }, [addToCart, cart, showNotification, showConfirm]);

  const sharedRemoveFromCart = React.useCallback((product: Product) => {
    removeFromCart(product);
  }, [removeFromCart]);

  const handleCheckout = async () => {
    if (!user) {
      setCurrentScreen('landing');
      showNotification('Por favor, entre com sua conta Google para realizar o pedido.', 'error');
      return;
    }

    if (!cart || cart.items.length === 0) {
      showNotification('Seu carrinho está vazio', 'error');
      return;
    }

    const orderData = sanitizeForFirestore({
      buyerUid: user.uid,
      buyerName: user.displayName,
      buyerPhotoURL: user.photoURL,
      shopId: cart.shopId,
      shopName: cart.shopName,
      shopOwnerUid: cart.shopOwnerUid || '',
      items: cart.items.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        unit: item.product.unit,
        weightPerUnit: item.product.weightPerUnit || 0,
        photoURL: item.product.photoURL || ''
      })),
      totalValue: cart.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0),
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      deliveryType: cart.deliveryType || 'pickup',
      paymentMethod: cart.paymentMethod || 'Pix',
      orderType: 'order'
    });

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setCart(null);
      showNotification('Pedido enviado com sucesso! Aguarde a confirmação do lojista.');
      setCurrentScreen('orders');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testConnection();
        setDbStatus(isConnected ? 'connected' : 'error');
        if (!isConnected) {
          // If Firestore is unreachable, it's likely a global network issue with Google services
          // We don't set authError here to avoid blocking valid offline usage if possible,
          // but we notify the console.
          console.warn("Firestore connectivity test failed. App may be in offline mode.");
        }
      } catch (e) {
        setDbStatus('error');
      }
    };
    checkConnection();
    
    const initConfig = async (retries = 3) => {
      try {
        const configRef = doc(db, 'appConfig', 'global');
        const configSnap = await getDoc(configRef);
        if (!configSnap.exists()) {
          // Verify if user is admin before trying to create config
          const isAdminUser = user && ((user.role === 'admin' || user.role === 'state_admin') && 
                              (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(user.email)));
          
          if (isAdminUser) {
            const defaultConfig: AppConfig = {
              id: 'global',
              splashScreen: {
                logoUrl: '', // Using Logo component instead
                backgroundColor: '#FFFFFF',
                textColor: '#0F172A',
                message: 'A caminho de você'
              },
              pages: {
                landing: { columns: 1, visible: true, title: '' },
                search: { columns: 3, visible: true, title: 'Mercado' },
                wholesale: { columns: 3, visible: true, title: 'Atacado Livre' }
              }
            };
            await setDoc(configRef, defaultConfig);
          }
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
        // Se estivermos no processo de handleLogin, deixamos o handleLogin cuidar do usuário
        // Isso evita conflitos e redirecionamentos precoces
        userUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            const updatedUser = { ...data, isEmailVerified: firebaseUser.emailVerified };
            
            // Só atualizamos o estado global se não estivermos no meio de um processo de login específico
            // ou se já estivermos logados e for apenas uma atualização de snapshot
            if (!loggingInRoleRef.current) {
              setUser(updatedUser);
            }
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
      if (!snapshot.empty) {
        setMyShop(snapshot.docs[0].data() as Shop);
      } else {
        setMyShop(null);
      }
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
            const isAdminMsg = (partnerMessages[0].senderName || '').toLowerCase().includes('admin') || 
                               (partnerMessages[0].shopName || '').toLowerCase().includes('admin');
            
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
    if (!user || user.role !== 'vendor' || userShops.length === 0 || !auth.currentUser) {
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
    if (!user || !auth.currentUser) {
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
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chatMessages')));

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
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders')));

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, isAuthReady, userShops]);

  useEffect(() => {
    // IMPORTANTE: Não redireciona automaticamente se estiver em processo de login (handleLogin)
    // Isso evita que a tela pisque antes da validação de papel ser concluída
    if (isAuthReady && user && currentScreen === 'landing' && !loggingInRole) {
      if (user.role === 'state_admin' || user.role === 'admin' || user.role === 'municipal_admin') {
        if (user.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(user.email)) {
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
  }, [isAuthReady, user, currentScreen, loggingInRole]);

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

  // 📢 SISTEMA DE COMPARTILHAMENTO
  const handleShare = async (data: { title: string; text: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url || window.location.href,
        });
        showNotification('Pronto para compartilhar!', 'success');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          showNotification('Não foi possível abrir o compartilhamento.', 'error');
        }
      }
    } else {
      // Fallback para cópia de link se não houver suporte à Web Share API
      try {
        await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url || window.location.href}`);
        showNotification('Link copiado para a área de transferência!', 'success');
      } catch (err) {
        showNotification('Erro ao copiar link.', 'error');
      }
    }
  };

  const handleGoogleLogin = async (role: UserRole, loginType?: string) => {
    setLoggingInRole(loginType || role);
    try {
      const result = await loginWithGoogle();
      if (result.user) {
        await handleLogin(role, loginType, result.user);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoggingInRole(null);
        return;
      }
      console.error("Error logging in with Google:", err);
      if (err.code === 'auth/network-request-failed') {
        setAuthError('network-error');
      } else {
        showNotification('Erro ao entrar com Google: ' + (err.message || 'Tente novamente.'), 'error');
      }
      setLoggingInRole(null);
    }
  };

  const cancelRegistration = async () => {
    await logout();
    setShowCompleteRegistration(false);
    setRegData(null);
    setCurrentScreen('landing');
  };

  const finishRegistration = async () => {
    if (!regData) return;
    setIsSavingRegistration(true);
    
    const userDocRef = doc(db, 'users', regData.uid);
    const isSuperAdmin = ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(regData.email);
    
    let cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
      cleanPhone = '55' + cleanPhone;
    }
    const formattedPhone = cleanPhone ? '+' + cleanPhone : '';

    const profile: UserProfile = {
      uid: regData.uid,
      displayName: regName || regData.displayName || 'Novo Membro',
      email: regData.email,
      photoURL: regData.photoURL,
      role: regData.role,
      phone: formattedPhone,
      phoneVerified: false,
      isApprovedAdmin: isSuperAdmin ? true : false,
      createdAt: serverTimestamp() as any,
      lastLoginAt: Timestamp.now(),
      favorites: []
    };

    try {
      await setDoc(userDocRef, profile);
      setUser(profile);
      setShowCompleteRegistration(false);
      setRegData(null);
      
      showNotification('Cadastro realizado com sucesso!', 'success');
      
      // Navigate to appropriate screen
      if (profile.role === 'state_admin' || profile.role === 'admin') {
        if (profile.isApprovedAdmin) {
          setCurrentScreen('admin-dashboard');
        } else {
          setCurrentScreen('pending-approval');
        }
      } else if (profile.role === 'vendor') {
        setCurrentScreen('shop-management');
      } else {
        setCurrentScreen('search');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${regData.uid}`);
    } finally {
      setIsSavingRegistration(false);
    }
  };

  const handleLogin = async (role: UserRole, loginType?: string, existingFirebaseUser?: any) => {
    // Se já estiver tentando logar, permite clicar novamente após 15 segundos para "destravar"
    if (loggingInRole && !existingFirebaseUser) {
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
      const firebaseUser = existingFirebaseUser;
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
          const storedData = userDoc.data() as UserProfile;
          
          // Se o documento existe, atualizamos apenas o que for necessário para manter a sincronia
          const updates: any = {
            lastLoginAt: Timestamp.now()
          };
          
          if (firebaseUser.displayName && !storedData.displayName) {
            updates.displayName = firebaseUser.displayName;
          }
          if (firebaseUser.photoURL && !storedData.photoURL) {
            updates.photoURL = firebaseUser.photoURL;
          }
          if (firebaseUser.email && !storedData.email) {
             updates.email = firebaseUser.email;
          }

          if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);
          }
          
          profile = { ...storedData, ...updates };
          
          // Helper to get descriptive role for alert
          const getDescriptiveRole = async (u: UserProfile) => {
            if (u.role === 'client') return 'Cliente';
            if (u.role === 'vendor') {
              const q = query(collection(db, 'shops'), where('ownerUid', '==', u.uid));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const shopData = snap.docs[0].data();
                return translateRole('vendor', undefined, shopData.type || shopData.category);
              }
              return 'Vendedor';
            }
            if (u.role === 'admin' || u.role === 'state_admin') return 'Administração';
            return translateRole(u.role);
          };

          const actualDescriptiveRole = await getDescriptiveRole(profile);
          const requestedDescriptiveRole = loginType === 'vendor_feirante' ? 'Feira Livre' : 
                                         loginType === 'vendor_barraca' ? 'Barraca Livre' :
                                         loginType === 'vendor_mercado' ? 'Mercado Livre' :
                                         loginType === 'vendor_atacado' ? 'Atacado Livre' : 
                                         loginType === 'client' ? 'Cliente' : translateRole(role);

          // Validação rigorosa: Cliente não entra como Vendedor e vice-versa
          // E Vendedor Feirante não entra como Vendedor Atacado e vice-versa
          if (profile.role !== role || (profile.role === 'vendor' && actualDescriptiveRole !== requestedDescriptiveRole && actualDescriptiveRole !== 'Vendedor' && actualDescriptiveRole !== 'Feirante' && actualDescriptiveRole !== 'Atacado')) {
            setConfirmModal({
              isOpen: true,
              title: 'Perfil Já Cadastrado',
              message: `Olá! Identificamos que este e-mail já está vinculado a um cadastro de "${actualDescriptiveRole}". Se você deseja mudar seu tipo de perfil, seria necessário excluir o registro atual nas configurações de sua conta antes. Por favor, acesse como "${actualDescriptiveRole.toUpperCase()}" agora.`,
              onConfirm: () => {
                setCurrentScreen('landing');
              },
              icon: AlertTriangle,
              confirmText: `Ir para o botão de ${actualDescriptiveRole}`,
              type: 'warning'
            });
            await logout();
            setUser(null);
            setLoggingInRole(null);
            clearTimeout(safetyTimeout);
            setCurrentScreen('landing');
            return;
          }
        } else {
          // CONTA NOVA OU TOTALMENTE APAGADA: Iniciamos um fluxo de completar cadastro
          setRegData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: role as UserRole,
            loginType: loginType
          });
          setRegName(firebaseUser.displayName || '');
          setShowCompleteRegistration(true);
          setLoggingInRole(null);
          clearTimeout(safetyTimeout);
          return;
        }
        setUser(profile);
        
        if (profile.role === 'state_admin' || profile.role === 'admin') {
          if (profile.isApprovedAdmin || ['raiza3983@gmail.com', 'rz7beats@gmail.com', 'raizapauladossantos@gmail.com', 'raizapaulapaula83@gmail.com'].includes(profile.email)) {
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
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError('unauthorized-domain');
        showNotification('Este domínio não está autorizado no Firebase. Por favor, adicione este domínio nas configurações de Autenticação do Console do Firebase.', 'error');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('network-error');
        showNotification('Erro de comunicação. Isso geralmente ocorre devido a bloqueio de cookies de terceiros ou se o domínio não estiver autorizado no Firebase Console. Tente abrir em uma nova aba.', 'error');
        console.error("DICA: Certifique-se de adicionar os domínios .run.app à lista de 'Domínios Autorizados' no Console do Firebase (Autenticação > Configurações).");
      } else if (error.message?.includes('INTERNAL ASSERTION FAILED') || error.code === 'auth/internal-error') {
        setAuthError('internal-error');
        showNotification('Erro interno do Firebase. Por favor, recarregue a página ou abra o aplicativo em uma nova aba para fazer login.', 'error');
      } else if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.code || 'unknown');
        console.error("Login failed", error);
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
      },
      { type: 'danger', confirmText: 'Sim, Sair agora', icon: LogOut }
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

      {shops.length === 0 || shops.filter(s => s.isApproved).length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-soft">
          <Heart size={64} className="text-slate-200 mx-auto mb-6" />
          <p className="text-slate-400 font-medium mb-8">Você ainda não salvou nenhuma loja ativa.</p>
          <button 
            onClick={() => onNavigate('search')}
            className="px-8 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
          >
            Explorar Mercado
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.filter(s => s.isApproved).map(shop => (
            <motion.div 
              key={shop.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden group cursor-pointer relative flex flex-col h-full"
              onClick={() => {
                setSelectedShop(shop);
                onNavigate('shop-detail');
              }}
            >
              <div className="h-56 bg-slate-100 relative group overflow-hidden">
                <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(shop.id);
                  }}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-red-500 shadow-xl hover:scale-110 active:scale-95 transition-all z-10"
                >
                  <Heart size={24} fill="currentColor" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{translateRole('', '', shop.type)}</span>
                  <h4 className="text-xl font-black text-white font-display mb-2">{shop.name}</h4>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="px-3 py-1 bg-brand-50 border border-brand-100 rounded-lg">
                      <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{translateRole('', '', shop.type)}</span>
                   </div>
                   <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black">4.9</span>
                   </div>
                </div>

                <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                  {shop.description || 'Nenhuma descrição disponível para esta loja no momento.'}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={16} />
                      <span className="text-xs font-bold truncate max-w-[150px]">{shop.city}, {shop.state}</span>
                   </div>
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                      <ChevronRight size={20} />
                   </div>
                </div>
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
    // Show registration flow if needed
    if (showCompleteRegistration) {
      return (
        <CompleteRegistrationView 
          regName={regName}
          setRegName={setRegName}
          regPhone={regPhone}
          setRegPhone={setRegPhone}
          onSave={finishRegistration}
          onCancel={cancelRegistration}
          isSaving={isSavingRegistration}
        />
      );
    }

    // Check if a guest is attempting to access an authenticated inner screen link directly
    const isGuest = !user;
    const isInnerScreen = [
      'profile',
      'orders',
      'chats',
      'saved',
      'shop-management',
      'create-shop',
      'sales',
      'vendor-accounting',
      'wholesale-accounting',
      'admin-dashboard'
    ].includes(currentScreen);

    if (isGuest && isInnerScreen) {
      const isCheckout = currentScreen === 'orders' && cart && cart.items?.length > 0;
      if (!isCheckout) {
        let PortugueseTitle = 'Acesso Restrito';
        let PortugueseDescription = 'Esta seção é exclusiva para usuários cadastrados.';
        let screenType: 'vendor' | 'client' | 'admin' = 'client';

        if (currentScreen === 'profile') {
          PortugueseTitle = 'Meu Perfil & Cadastro';
          PortugueseDescription = 'Faça login ou cadastre-se para gerenciar seus dados pessoais e endereços de entrega.';
        } else if (currentScreen === 'orders') {
          PortugueseTitle = 'Meus Pedidos';
          PortugueseDescription = 'Faça login para acompanhar o status de suas compras e histórico de pedidos.';
        } else if (currentScreen === 'chats') {
          PortugueseTitle = 'Minhas Conversas';
          PortugueseDescription = 'Faça login para trocar mensagens com feirantes e clientes em tempo real.';
        } else if (currentScreen === 'saved') {
          PortugueseTitle = 'Meus Favoritos';
          PortugueseDescription = 'Faça login para salvar suas bancas, feirantes e produtos preferidos.';
        } else if (currentScreen === 'shop-management' || currentScreen === 'create-shop') {
          PortugueseTitle = 'Área do Feirante';
          PortugueseDescription = 'Acesse ou crie sua barraca digital para gerenciar produtos, estoque e receber pedidos.';
          screenType = 'vendor';
        } else if (currentScreen === 'sales' || currentScreen === 'vendor-accounting' || currentScreen === 'wholesale-accounting') {
          PortugueseTitle = 'Painel de Vendas';
          PortugueseDescription = 'Painel exclusivo para feirantes autorizados gerenciarem vendas, fluxo de caixa e contabilidade.';
          screenType = 'vendor';
        } else if (currentScreen === 'admin-dashboard') {
          PortugueseTitle = 'Painel Administrativo';
          PortugueseDescription = 'Acesso restrito para administradores municipais ou estaduais.';
          screenType = 'admin';
        }

        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 px-6 text-center max-w-xl mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 md:p-14 rounded-[48px] border border-slate-100 shadow-soft w-full flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-brand-50 rounded-[32px] flex items-center justify-center mb-8 shadow-inner text-brand-600">
                {currentScreen === 'profile' && <User size={48} />}
                {currentScreen === 'orders' && <ShoppingBag size={48} />}
                {currentScreen === 'chats' && <MessageSquare size={48} />}
                {currentScreen === 'saved' && <Heart size={48} />}
                {(currentScreen === 'shop-management' || currentScreen === 'create-shop') && <Store size={48} />}
                {(currentScreen === 'sales' || currentScreen === 'vendor-accounting' || currentScreen === 'wholesale-accounting') && <TrendingUp size={48} />}
                {currentScreen === 'admin-dashboard' && <ShieldAlert size={48} />}
              </div>
              
              <p className="font-black uppercase tracking-widest text-[10px] text-brand-600 mb-3">Identificação Necessária</p>
              <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight leading-none mb-4">{PortugueseTitle}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 max-w-[340px]">
                {PortugueseDescription}
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                {screenType === 'admin' ? (
                  <button 
                    onClick={() => handleGoogleLogin('admin')}
                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10"
                  >
                    <ShieldCheck size={18} />
                    Acesso Administrativo
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleGoogleLogin(screenType)}
                      className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-600/20"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4 brightness-0 invert" alt="" />
                      Entrar com o Google
                    </button>
                    <button 
                      onClick={() => handleGoogleLogin(screenType)}
                      className="w-full py-5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[24px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Criar Nova Conta
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setCurrentScreen('landing')}
                  className="w-full py-5 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center mt-2"
                >
                  Voltar ao Início
                </button>
              </div>
            </motion.div>
          </div>
        );
      }
    }

    // Check if it's a public utility screen first
    if (currentScreen === 'privacy') return <PrivacyScreen config={appConfig} />;
    if (currentScreen === 'terms') return <TermsScreen config={appConfig} />;
    if (currentScreen === 'about') return <AboutScreen config={appConfig} />;

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
          onGoogleLogin={handleGoogleLogin}
          onNavigate={handleNavigate}
          loggingInRole={loggingInRole}
          authError={authError}
          config={appConfig}
          handleShare={handleShare}
        />
      );
      case 'sales': 
        if (user?.role !== 'vendor' && user?.role !== 'admin' && user?.role !== 'state_admin') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 px-6 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert size={40} className="text-slate-300" />
              </div>
              <p className="font-black uppercase tracking-widest text-[11px] text-slate-500">Acesso Restrito</p>
              <h2 className="text-xl font-bold text-slate-800 mt-2">Área para Vendedores</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-[280px]">
                Esta seção é exclusiva para parceiros cadastrados. Se você é um vendedor, faça login com sua conta autorizada.
              </p>
              
              <div className="flex flex-col gap-3 mt-8 w-full max-w-[240px]">
                {!user ? (
                  <>
                    <button 
                      onClick={() => handleGoogleLogin('vendor', 'vendor_feirante')}
                      className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                      Entrar com Google
                    </button>
                    <button 
                      onClick={() => handleGoogleLogin('vendor', 'vendor_feirante')}
                      className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                      Criar Cadastro Novo
                    </button>
                  </>
                ) : null}
                
                <button 
                  onClick={() => setCurrentScreen('landing')}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center"
                >
                  Voltar
                </button>
              </div>
            </div>
          );
        }
        return <SalesScreen config={appConfig} user={user} onNavigate={setCurrentScreen} showNotification={showNotification} showConfirm={showConfirm} />;
      case 'sales-tips': return <SalesTipsScreen config={appConfig} onNavigate={setCurrentScreen} />;
      case 'search': return <SearchScreen config={appConfig} onNavigate={setCurrentScreen} onGoogleLogin={handleGoogleLogin} user={user} onToggleFavorite={toggleFavorite} selectedCategory={globalSelectedCategory} setSelectedCategory={setGlobalSelectedCategory} cart={cart} setCart={setCart} activeView={searchView} setActiveView={setSearchView} showNotification={showNotification} showConfirm={showConfirm} setSelectedShop={setSelectedShop} setShowPermissionModal={setShowPermissionModal} sharedAddToCart={sharedAddToCart} sharedRemoveFromCart={sharedRemoveFromCart} handleShare={(shop: Shop) => handleShare({ title: `Feira Livre - ${shop.name}`, text: `Confira a loja ${shop.name} no Feira Livre!`, url: window.location.href })} />;
      case 'wholesale': return <WholesaleScreen config={appConfig} onNavigate={setCurrentScreen} onGoogleLogin={handleGoogleLogin} user={user} selectedCategory={globalSelectedCategory} setSelectedCategory={setGlobalSelectedCategory} cart={cart} setCart={setCart} activeView={wholesaleView} setActiveView={setWholesaleView} showNotification={showNotification} showConfirm={showConfirm} setSelectedShop={setSelectedShop} setShowPermissionModal={setShowPermissionModal} sharedAddToCart={sharedAddToCart} sharedRemoveFromCart={sharedRemoveFromCart} handleShare={(shop: Shop) => handleShare({ title: `Feira Livre - ${shop.name}`, text: `Confira a loja ${shop.name} no Feira Livre!`, url: window.location.href })} />;
      case 'orders': 
        return (
          <OrdersScreen 
            user={user} 
            myShop={myShop} 
            cart={cart} 
            setCart={setCart} 
            showNotification={showNotification} 
            showConfirm={showConfirm} 
            onNavigate={setCurrentScreen} 
            onGoogleLogin={handleGoogleLogin} 
            setSelectedShop={setSelectedShop} 
          />
        );
      case 'saved': return <SavedScreen user={user} onNavigate={setCurrentScreen} onToggleFavorite={toggleFavorite} setSelectedShop={setSelectedShop} />;
      case 'notifications': return <NotificationsScreen notifications={adminNotifications} />;
      case 'create-shop': return <CreateShopScreen user={user} showNotification={showNotification} config={appConfig} onComplete={() => setCurrentScreen('shop-management')} />;
      case 'wholesale-accounting':
        return <VendorAccounting user={user} showNotification={showNotification} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'vendor-accounting':
        return <VendorAccounting user={user} showNotification={showNotification} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'calculator':
      case 'feira-livre-calculadora':
        return (
          <FeiraLivreCalculadoraScreen 
            config={appConfig} 
            user={user} 
            onNavigate={setCurrentScreen} 
            handleShare={handleShare} 
          />
        );
      case 'contact': return <ContactScreen user={user} showNotification={showNotification} config={appConfig} />;
      case 'admin-dashboard': return <AdminDashboard user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={handleNavigate} setSelectedShop={setSelectedShop} setSelectedChat={setSelectedChat} />;
      case 'shop-detail': 
        return (
          <CatalogPage 
            shop={selectedShop} 
            products={products} 
            cart={cart}
            onUpdateQuantity={(p, q) => {
              if (selectedShop) {
                updateQuantity(p, q, selectedShop);
              }
            }}
            onCheckout={handleCheckout}
            isLoading={isLoadingProducts} 
            onBack={() => setCurrentScreen('search')}
          />
        );
      case 'inventory':
        return (
          <InventoryPage 
            products={products}
            onEdit={(product) => {
              // Implementation for stock update directly if we want to follow user's "just numbers change"
              const newStock = prompt('Novo estoque:', String(product.stock));
              if (newStock !== null) {
                const stockVal = parseInt(newStock);
                if (!isNaN(stockVal) && myShop) {
                  updateDoc(doc(db, 'shops', myShop.id, 'products', product.id), {
                    stock: stockVal,
                    updatedAt: new Date()
                  }).then(() => {
                    showNotification('Estoque atualizado!', 'success');
                  });
                }
              }
            }}
            onAdd={() => setCurrentScreen('shop-management')} // Redirect to full management for adding
          />
        );
      case 'seller':
        return (
          <SellerPage 
            shop={myShop}
            user={user}
            onSave={async (data) => {
              if (myShop) {
                try {
                  await updateDoc(doc(db, 'shops', myShop.id), data);
                  showNotification('Perfil do vendedor salvo com sucesso!', 'success');
                } catch (err) {
                  console.error(err);
                  showNotification('Erro ao salvar perfil.', 'error');
                }
              }
            }}
          />
        );
      case 'shop-management': return <ShopManagement user={user} showNotification={showNotification} showConfirm={showConfirm} config={appConfig} onNavigate={setCurrentScreen} setSelectedChat={setSelectedChat} setSelectedShop={setSelectedShop} />;
      case 'profile': return <ProfileScreen user={user} myShop={myShop} onUpdate={setUser} showNotification={showNotification} showConfirm={showConfirm} config={appConfig} onNavigate={setCurrentScreen} />;
      case 'careers': return <CareersScreen config={appConfig} user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={setCurrentScreen} />;
      case 'chats': return <ChatsScreen user={user} showNotification={showNotification} showConfirm={showConfirm} onNavigate={setCurrentScreen} onGoogleLogin={handleGoogleLogin} selectedChatId={selectedChat} setSelectedChatId={setSelectedChat} setSelectedShop={setSelectedShop} />;
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
    <div className="min-h-screen bg-transparent font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* App Content */}
      <AnimatePresence>
        {authError === 'network-error' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
                <WifiOff size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Erro de Conexão</h2>
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest leading-none">Google Services Unreachable</p>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed bg-slate-50 p-4 rounded-3xl">
                O Firebase não conseguiu autenticar. Isso geralmente é causado por bloqueadores de anúncios ou restrições de rede temporárias.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-brand-600/20 active:scale-95 transition-all text-[10px]"
                >
                  Recarregar Aplicativo
                </button>
                <button 
                  onClick={() => setAuthError(null)}
                  className="w-full py-5 bg-slate-50 text-slate-500 rounded-[24px] font-black uppercase tracking-widest active:scale-95 transition-all text-[10px]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

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

      {/* Required for Firebase Phone Auth - REMOVED */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-[150] flex items-center justify-center p-6"
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

      {/* Modal de Confirmação e Alerta Global (Full Page Overlay) */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[250] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="w-full max-w-md relative z-10"
            >
              <div className={cn(
                "w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl relative",
                confirmModal.type === 'danger' ? "bg-red-600 text-white shadow-red-500/30" : 
                confirmModal.type === 'warning' ? "bg-amber-500 text-white shadow-amber-500/30" : 
                "bg-brand-600 text-white shadow-brand-500/30"
              )}>
                {confirmModal.icon ? <confirmModal.icon size={48} /> : (confirmModal.type === 'danger' ? <LogOut size={48} /> : <Info size={48} />)}
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                {confirmModal.title}
              </h3>
              
              <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed px-4">
                {confirmModal.message}
              </p>

              <div className={cn(
                "flex flex-col gap-4",
                confirmModal.type === 'info' || confirmModal.type === 'warning' ? "flex-col-reverse" : ""
              )}>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className={cn(
                    "w-full py-6 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3",
                    confirmModal.type === 'danger' ? "bg-red-600 hover:bg-red-700" : 
                    confirmModal.type === 'warning' ? "bg-amber-600 hover:bg-amber-700" : 
                    "bg-brand-600 hover:bg-brand-700"
                  )}
                >
                  <Check size={24} />
                  {confirmModal.confirmText || 'Sim, Confirmar'}
                </button>

                {confirmModal.cancelText !== null && confirmModal.type !== 'info' && (
                  <button 
                    onClick={() => setConfirmModal(null)}
                    className="w-full py-6 bg-slate-50 text-slate-400 font-black uppercase tracking-widest rounded-3xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                  >
                    <X size={24} />
                    {confirmModal.cancelText || 'Não, Cancelar'}
                  </button>
                )}
              </div>
            </motion.div>

            <div className="absolute top-12 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                   <div className="w-2 h-2 bg-brand-500 rounded-full" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerta de Sistema</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Checkout Bar Removed - Integrated into CartSummaryBar */}

      {/* Top Pages List Navigation (Superior List of Pages) */}
      {(currentScreen === 'landing' || currentScreen === 'feira-livre-calculadora' || currentScreen === 'about' || currentScreen === 'privacy' || currentScreen === 'terms' || currentScreen === 'careers' || currentScreen === 'contact') && (
        <div className="w-full bg-white border-b border-slate-100 py-4 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('landing')}>
            <Logo size="sm" className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 font-display tracking-tight leading-none">Feira Livre 🇧🇷</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Conectando o Campo à Mesa</span>
            </div>
          </div>
          <nav className="flex items-center justify-center gap-x-4 md:gap-x-8 gap-y-2 flex-wrap text-slate-500 font-bold uppercase tracking-widest text-[9px]">
            <button 
              onClick={() => handleNavigate('landing')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'landing' ? "text-brand-600 font-black" : "")}
            >
              Início
            </button>
            <button 
              onClick={() => handleNavigate('feira-livre-calculadora')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'feira-livre-calculadora' ? "text-brand-600 font-black" : "")}
            >
              Calculadora
            </button>
            <button 
              onClick={() => handleNavigate('about')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'about' ? "text-brand-600 font-black" : "")}
            >
              Sobre
            </button>
            <button 
              onClick={() => handleNavigate('privacy')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'privacy' ? "text-brand-600 font-black" : "")}
            >
              Privacidade
            </button>
            <button 
              onClick={() => handleNavigate('terms')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'terms' ? "text-brand-600 font-black" : "")}
            >
              Termos de Usos
            </button>
            <button 
              onClick={() => handleNavigate('careers')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'careers' ? "text-brand-600 font-black" : "")}
            >
              Trabalhe Conosco
            </button>
            <button 
              onClick={() => handleNavigate('contact')} 
              className={cn("hover:text-brand-600 transition-colors cursor-pointer", currentScreen === 'contact' ? "text-brand-600 font-black" : "")}
            >
              Suporte
            </button>
          </nav>
        </div>
      )}

      {/* Top Floating Header */}
      {currentScreen !== 'landing' && 
       currentScreen !== 'feira-livre-calculadora' && 
       currentScreen !== 'about' && 
       currentScreen !== 'privacy' && 
       currentScreen !== 'terms' && 
       currentScreen !== 'careers' && 
       currentScreen !== 'contact' && (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[430px] px-4 flex flex-col gap-3 pointer-events-none">
          {/* Main Bar */}
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-6 h-16 flex items-center justify-between gap-4 pointer-events-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavigate('landing')} className="flex items-center hover:scale-105 transition-transform active:scale-95 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 text-white">
                <Logo size="xl" className="h-[50px] w-[50px]" />
              </button>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-black text-slate-900 font-display tracking-tight">Feira Livre 🇧🇷</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Conectando o Campo à Mesa</span>
              </div>
            </div>

            <div className="flex-1 max-w-md relative group hidden md:block">
              <div className="absolute inset-0 bg-slate-100 rounded-2xl group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-brand-500/20 transition-all duration-500 border border-slate-200" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors duration-500" size={20} />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                className="relative w-full h-12 pl-12 pr-4 bg-transparent border-none rounded-2xl outline-none text-xs font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button onClick={() => handleNavigate('feira-livre-calculadora')} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-white rounded-xl transition-all active:scale-90">
                  <Calculator size={22} />
                </button>
                <button onClick={() => handleNavigate('saved')} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-white rounded-xl transition-all relative active:scale-90">
                  <Heart size={22} fill={currentScreen === 'saved' ? "currentColor" : "none"} className={currentScreen === 'saved' ? "text-red-500" : ""} />
                </button>
                <button onClick={() => handleNavigate('notifications')} className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-white rounded-xl transition-all relative active:scale-90">
                  <Bell size={22} className={currentScreen === 'notifications' ? "text-brand-600" : ""} />
                  {newAdminNotificationsCount > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleNavigate('profile')} className="flex items-center gap-3 p-1.5 pr-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 border border-slate-200">
                    <SafeImage src={user.photoURL} className="w-9 h-9 rounded-xl object-cover border border-slate-200" alt={user.displayName} />
                    <div className="flex flex-col items-start leading-tight hidden lg:flex">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Perfil</span>
                      <span className="text-xs font-bold">{user.displayName.split(' ')[0]}</span>
                    </div>
                  </button>
                  <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
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
          <div className="self-center bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-full px-6 py-2.5 flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-lg pointer-events-auto overflow-x-auto max-w-full no-scrollbar">
            <button onClick={() => handleNavigate('wholesale')} className="flex items-center gap-2.5 hover:text-brand-600 transition-all group active:scale-95 text-slate-600">
              <Truck size={16} className="group-hover:scale-110 transition-transform" />
              Atacado Livre
            </button>
            <button onClick={() => handleNavigate('search')} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 transition-all group active:scale-95">
              <User size={16} className="group-hover:scale-110 transition-transform" /> Feirante
            </button>
            <button onClick={() => handleNavigate('orders')} className="flex items-center gap-2.5 text-slate-600 hover:text-brand-600 transition-all group relative active:scale-95">
              <Package size={16} className="group-hover:scale-110 transition-transform" /> Pedidos
            </button>
            {user && user.role !== 'client' && currentScreen !== 'admin-dashboard' && (
              <button 
                onClick={() => handleNavigate('sales')} 
                className={cn(
                  "flex items-center gap-2.5 transition-all group relative active:scale-95",
                  currentScreen === 'sales' ? "text-brand-600" : "text-slate-600 hover:text-brand-600"
                )}
              >
                <BarChart size={16} className={cn("transition-transform", currentScreen === 'sales' ? "scale-110" : "group-hover:scale-110")} /> VENDAS
              </button>
            )}
            {user?.role === 'state_admin' && (
              <button 
                onClick={() => handleNavigate('admin-dashboard')} 
                className={cn(
                  "flex items-center gap-2.5 transition-all group active:scale-95",
                  currentScreen === 'admin-dashboard' ? "text-amber-600" : "text-slate-600 hover:text-amber-600"
                )}
              >
                <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" /> Admin
              </button>
            )}
            {user?.role === 'vendor' && (
              <button 
                onClick={() => handleNavigate('shop-management')} 
                className={cn(
                  "flex items-center gap-2.5 transition-colors group",
                  currentScreen === 'shop-management' ? "text-brand-600" : "text-slate-600 hover:text-brand-600"
                )}
              >
                <Store size={16} className={cn("transition-transform", currentScreen === 'shop-management' ? "scale-110" : "group-hover:scale-110")} /> Minha Loja
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "relative z-10 bg-white min-h-screen pb-40",
        (currentScreen === 'landing' || currentScreen === 'feira-livre-calculadora' || currentScreen === 'about' || currentScreen === 'privacy' || currentScreen === 'terms' || currentScreen === 'careers' || currentScreen === 'contact') ? "pt-28 md:pt-24" : "pt-44"
      )}>
        <AnimatePresence>
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {user && currentScreen !== 'landing' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[430px] px-4 flex flex-col items-center">
          {/* Category Floating Bar */}
          {(currentScreen === 'search' || currentScreen === 'wholesale') && (
            <div className="w-full mb-4">
              <CategoryFilter 
                categories={PRODUCT_CATEGORIES} 
                selectedCategory={globalSelectedCategory} 
                onSelect={setGlobalSelectedCategory} 
              />
            </div>
          )}
          {currentScreen !== 'orders' && <CartSummaryBar cart={cart} onNavigate={handleNavigate} user={user} />}
          <BottomMenu 
            activeScreen={currentScreen} 
            onNavigate={handleNavigate}
            screens={[
              { id: 'search', label: 'BUSCAR', icon: Search },
              { id: 'wholesale', label: 'ATACADO', icon: Truck },
              { id: 'feira-livre-calculadora', label: 'CALCULADORA', icon: Calculator },
              { id: 'orders', label: 'PEDIDOS', icon: Package, badge: newBuyerOrdersCount > 0 },
              { id: 'chats', label: 'BATE PAPO', icon: MessageSquare, badge: unreadChatsCount > 0 },
              { id: 'saved', label: 'SALVOS', icon: Heart },
              { id: 'sales', label: 'VENDAS', icon: BarChart, badge: newOrdersCount > 0 }
            ]}
          />
        </div>
      )}

      {/* Global Footer (Visible on all screens in the exact same place for identical alignment) */}
      <footer className="py-20 flex flex-col items-center gap-8 bg-white border-t border-slate-100 mb-24 w-full">
        <div className="opacity-10 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-40">
          <Logo size="md" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 max-w-full w-full pb-4">
          <a href="/privacidade" onClick={(e) => { e.preventDefault(); handleNavigate('privacy'); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors whitespace-nowrap">Privacidade</a>
          <a href="/termosdeusos" onClick={(e) => { e.preventDefault(); handleNavigate('terms'); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors whitespace-nowrap">Termos de Usos</a>
          <a href="/trabalhe-conosco" onClick={(e) => { e.preventDefault(); handleNavigate('careers'); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors whitespace-nowrap">Trabalhe conosco</a>
          <a href="/suporte" onClick={(e) => { e.preventDefault(); handleNavigate('contact'); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors whitespace-nowrap">Suporte</a>
        </div>
        
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] text-center px-6">
          © 2026 FEIRA LIVRE • CONECTANDO O CAMPO À MESA
        </p>
      </footer>
    </div>
  );
}
