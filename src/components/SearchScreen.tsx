import React, { useState, useEffect } from 'react';
import { 
  Search, Tent, ShoppingBag, MapPin, ChevronDown, Package, Store, ArrowRight, Heart
} from 'lucide-react';
import { motion } from 'motion/react';
import { query, collection, onSnapshot, where, collectionGroup } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AppConfig, Screen, UserRole, UserProfile, Shop, Product, OperationType 
} from '../types';
import { cn } from '../lib/utils';
import PageContainer from './ui/PageContainer';
import { ProductCard } from './ProductCard';
import { SafeImage } from './SafeImage';
import { LoginRequiredView } from './LoginRequiredView';

// Helper functions (should ideally go to a utils file)
const getFullStateName = (id: string) => {
  const states: {[key: string]: string} = {
    'all': 'Todo Brasil',
    'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais', 'ES': 'Espírito Santo',
    'PR': 'Paraná', 'SC': 'Santa Catarina', 'RS': 'Rio Grande do Sul',
    'DF': 'Distrito Federal', 'GO': 'Goiás', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'BA': 'Bahia', 'CE': 'Ceará', 'PE': 'Pernambuco', 'RN': 'Rio Grande do Norte', 'PB': 'Paraíba', 'AL': 'Alagoas', 'SE': 'Sergipe', 'MA': 'Maranhão', 'PI': 'Piauí',
    'AM': 'Amazonas', 'PA': 'Pará', 'AC': 'Acre', 'RO': 'Rondônia', 'RR': 'Roraima', 'TO': 'Tocantins', 'AP': 'Amapá'
  };
  return states[id] || id;
};

const getShopTypeInfo = (type: string = '') => {
  switch (type.toLowerCase()) {
    case 'feirante': return { label: 'Feira Livre', icon: Tent };
    case 'barraca': return { label: 'Barraca', icon: Tent };
    case 'mercado': return { label: 'Mercado', icon: ShoppingBag };
    default: return { label: 'Estabelecimento', icon: Store };
  }
};

const BRAZIL_STATES = [
  { id: 'SP', name: 'São Paulo' }, { id: 'RJ', name: 'Rio de Janeiro' }, { id: 'MG', name: 'Minas Gerais' }, { id: 'BA', name: 'Bahia' },
  { id: 'PR', name: 'Paraná' }, { id: 'RS', name: 'Rio Grande do Sul' }, { id: 'PE', name: 'Pernambuco' }, { id: 'CE', name: 'Ceará' },
  { id: 'SC', name: 'Santa Catarina' }, { id: 'GO', name: 'Goiás' }, { id: 'MA', name: 'Maranhão' }, { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' }, { id: 'AM', name: 'Amazonas' }, { id: 'MT', name: 'Mato Grosso' }, { id: 'MS', name: 'Mato Grosso do Sul' }
];

const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🔍' },
  { id: 'Alimentação Pronta e Lanches', name: 'Alimentação Pronta e Lanches', icon: '🍔' },
  { id: 'Antiguidades, Culture e Lazer.', name: 'Antiguidades, Cultura e Lazer.', icon: '🏺' },
  { id: 'Aquarismo e Pequenos Animais', name: 'Aquarismo e Pequenos Animais', icon: '🐠' },
  { id: 'Armarinhos, Tecidos e Artesanato.', name: 'Armarinhos, Tecidos e Artesanato.', icon: '🧵' },
  { id: 'Carnes, Peixes e Embutidos.', name: 'Carnes, Peixes e Embutidos.', icon: '🥩' },
  { id: 'Conservas, Licores.', name: 'Conservas, Licores.', icon: '🍯' },
  { id: 'Combustíveis e Acendimento Tradicional', name: 'Combustíveis e Acendimento Tradicional', icon: '🔥' },
  { id: 'Cordoaria e Amarração Profissional', name: 'Cordoaria e Amarração Profissional', icon: '🪢' },
  { id: 'Cosméticos, Perfumaria e Bem-Estar.', name: 'Cosméticos, Perfumaria e Bem-Estar.', icon: '🧴' },
  { id: 'Economia Circular e Sucata', name: 'Economia Circular e Sucata', icon: '♻️' },
  { id: 'Eletrônicos, Mídias, Objetos Eletrônicos.', name: 'Eletrônicos, Mídias, Objetos Eletrônicos.', icon: '📱' },
  { id: 'Embalagens e Descartáveis', name: 'Embalagens e Descartáveis', icon: '📦' },
  { id: 'Entretenimento de Rua e Arte Urbana', name: 'Entretenimento de Rua e Arte Urbana', icon: '🎸' },
  { id: 'Frutas Frescas', name: 'Frutas Frescas', icon: '🍎' },
  { id: 'Laticínios e Ovos', name: 'Laticínios e Ovos', icon: '🧀' },
  { id: 'Legumes, Verduras, Ervas e Raízes.', name: 'Legumes, Verduras, Ervas e Raízes.', icon: '🥬' },
  { id: 'Mercearia, Grãos e Temperos.', name: 'Mercearia, Grãos e Temperos.', icon: '🫘' },
  { id: 'Misticismo, Religiosidade e Artigos de Fé.', name: 'Misticismo, Religiosidade e Artigos de Fé.', icon: '🕯️' },
  { id: 'Mobilidade Urbana', name: 'Mobilidade Urbana', icon: '🚲' },
  { id: 'Plantas e Jardinagem', name: 'Plantas e Jardinagem', icon: '🪴' },
  { id: 'Produtos Artesanais', name: 'Produtos Artesanais', icon: '🎨' },
  { id: 'Produtos Químicos de Limpeza', name: 'Produtos Químicos de Limpeza', icon: '🧼' },
  { id: 'Produtos Sazonais e Festivos', name: 'Produtos Sazonais e Festivos', icon: '🎉' },
  { id: 'Produtos para Pets e Agropecuária', name: 'Produtos para Pets e Agropecuária', icon: '🐶' },
  { id: 'Saúde Popular e Ortopedia Básica', name: 'Saúde Popular e Ortopedia Básica', icon: '💊' },
  { id: 'Selaria e Artigos de Couro', name: 'Selaria e Artigos de Couro', icon: '👢' },
  { id: 'Serviços Rápidos e Logística de Apoio', name: 'Serviços Rápidos e Logística de Apoio', icon: '🛠️' },
  { id: 'Utensílios de Cozinha', name: 'Utensílios de Cozinha', icon: '🍳' },
  { id: 'Utilidades para Construção e Pequenos Reparos', name: 'Utilidades para Construção e Pequenos Reparos', icon: '🔨' },
  { id: 'Vestuário, Acessórios e Conveniência.', name: 'Vestuário, Acessórios e Conveniência.', icon: '👕' }
];

// Simplified internal handleFirestoreError if not imported
const handleFirestoreError = (error: any, op: OperationType, path: string) => {
  console.error(`Firestore Error [${op}] at ${path}:`, error);
};

// Simplified isShopOpen if not imported
const isShopOpen = (opening: any, closing: any, shop: any) => {
  return true; // Simplified for now
};

interface Props {
  config: AppConfig | null;
  onNavigate: (screen: Screen) => void;
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>;
  user: UserProfile | null;
  onToggleFavorite: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  cart: any;
  setCart: any;
  activeView: 'shops' | 'products';
  setActiveView: (v: 'shops' | 'products') => void;
  showNotification: (m: string, t?: 'success' | 'error') => void;
  showConfirm: (t: string, m: string, c: () => void) => void;
  setSelectedShop: (s: Shop) => void;
  setShowPermissionModal: (v: boolean) => void;
  sharedAddToCart: (p: Product, shop: Shop) => void;
  sharedRemoveFromCart: (p: Product) => void;
  handleShare: (shop: Shop) => void;
}

const SearchScreen = ({ 
  config, 
  onNavigate, 
  onGoogleLogin,
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
  sharedRemoveFromCart,
  handleShare
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedShopType, setSelectedShopType] = useState('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
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

  const shopTypes = [
    { id: 'all', label: 'Todos', icon: Search },
    { id: 'feirante', label: 'Feira Livre', icon: Tent },
    { id: 'barraca', label: 'Barraca Livre', icon: Tent },
    { id: 'mercado', label: 'Mercado Livre', icon: ShoppingBag },
  ];

  const selectedShopTypeLabel = shopTypes.find(t => t.id === selectedShopType)?.label || 'Todos';

  if (!user) return <LoginRequiredView onGoogleLogin={onGoogleLogin} />;
  
  const filteredShops = shops.filter(shop => {
    // 🚚 EXCLUSIVA: Não incluir atacado na busca geral (apenas na aba Atacado)
    if (shop.type === 'atacado') return false;
    
    // 🛡️ SEGURANÇA: Apenas lojas aprovadas aparecem no catálogo
    if (!shop.isApproved) return false;

    const shopMatches = (shop.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                       (shop.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                       (shop.type || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const shopProducts = products.filter(p => p.shopId === shop.id);
    const productMatches = shopProducts.some(p => 
      (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.description || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const matchesSearch = shopMatches || productMatches;
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || 
      products.some(p => p.shopId === shop.id && p.category === selectedCategory);
    const matchesShopType = selectedShopType === 'all' || (shop.type || '').toLowerCase() === selectedShopType.toLowerCase();
    return matchesSearch && matchesState && matchesCategory && matchesShopType;
  });

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    if (!shop) return false;
    
    // 🛡️ SEGURANÇA: Apenas lojas aprovadas aparecem no catálogo
    if (!shop.isApproved) return false;
    
    // 🚚 EXCLUSIVA: Não incluir produtos de atacado na busca geral
    if (shop.type === 'atacado') return false;

    const matchesSearch = (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (p.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (shop.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesShopType = selectedShopType === 'all' || (shop.type || '').toLowerCase() === selectedShopType.toLowerCase();
    
    return matchesSearch && matchesState && matchesCategory && matchesShopType;
  });

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <PageContainer>
          <div key="search-header" className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-light text-slate-900 font-serif italic tracking-tighter leading-none mb-1 uppercase">
                {selectedShopTypeLabel === 'Todos' ? 'FEIRA LIVRE' : selectedShopTypeLabel} 🇧🇷
              </h2>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-1.5 rounded-2xl flex items-center shadow-md shadow-slate-200/30">
              <div className="px-4 py-2 border-r border-slate-100 hidden md:block">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-0.5">Total de</p>
                <p className="text-base font-serif italic text-slate-900 leading-none">{shops.length} Lojas</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-0.5">Localização</p>
                <p className="text-base font-serif italic text-slate-900 leading-none">{selectedState === 'all' ? 'Todo Brasil' : getFullStateName(selectedState)}</p>
              </div>
            </div>
          </div>

          <div key="sticky-controls" className="sticky top-4 z-40 mb-10">
            <div className="bg-slate-900 p-3 md:p-4 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-800">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Search size={18} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    {selectedShopType !== 'all' && (
                      <span className="hidden md:inline-flex px-1.5 py-0.5 bg-brand-500/10 text-brand-400 text-[8px] font-black uppercase tracking-wider rounded border border-brand-500/16">
                        {selectedShopTypeLabel}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder={`Buscar em ${selectedShopTypeLabel}...`} 
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm font-medium outline-none focus:border-brand-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-wrap lg:flex-nowrap gap-3">
                  <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 overflow-x-auto">
                    {shopTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedShopType(type.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                          selectedShopType === type.id 
                            ? "bg-brand-500 text-white" 
                            : "text-slate-400 hover:text-slate-200"
                        )}
                        title={type.label}
                      >
                        <type.icon size={12} />
                        <span className="hidden sm:inline">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 flex-1">
                    <select 
                      value={selectedState || 'all'}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-300 outline-none hover:border-slate-600 transition-all appearance-none cursor-pointer text-center"
                    >
                      <option value="all">Sua Região</option>
                      {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="relative flex-1 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="w-full flex items-center justify-between gap-1.5 px-4 py-2.5 bg-brand-500 border border-brand-400 rounded-xl font-black text-[9px] uppercase tracking-widest text-white outline-none hover:bg-brand-600 transition-all cursor-pointer shadow-md shadow-brand-500/10"
                      >
                        <span className="truncate">
                          {selectedCategory === 'all' 
                            ? 'Categorias' 
                            : (PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Categorias')}
                        </span>
                        <ChevronDown size={12} className={cn("transition-transform flex-shrink-0", isCategoryDropdownOpen && "rotate-180")} />
                      </button>

                      {isCategoryDropdownOpen && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div className="fixed inset-0 z-40" onClick={() => { setIsCategoryDropdownOpen(false); setDropdownSearch(''); }} />
                          
                          <div className="absolute right-0 mt-2 w-72 max-h-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            {/* Category Search Input ("Menu pesquisar") */}
                            <div className="p-3 border-b border-slate-800/80 relative">
                              <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Pesquisar categoria..."
                                value={dropdownSearch}
                                onChange={(e) => setDropdownSearch(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs font-bold text-white outline-none focus:border-brand-500 focus:bg-slate-800 transition-all placeholder:text-slate-600 font-sans"
                                autoFocus
                              />
                              {dropdownSearch && (
                                <button
                                  type="button"
                                  onClick={() => setDropdownSearch('')}
                                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {/* Dropdown Items */}
                            <div className="overflow-y-auto max-h-[250px] p-2 flex flex-col gap-1 no-scrollbar">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory('all');
                                  setIsCategoryDropdownOpen(false);
                                  setDropdownSearch('');
                                }}
                                className={cn(
                                  "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                                  selectedCategory === 'all' 
                                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/20" 
                                    : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
                                )}
                              >
                                <span>🔍</span>
                                <span className="truncate">Todas as Categorias</span>
                              </button>

                              {PRODUCT_CATEGORIES.filter(c => 
                                c.id !== 'all' && 
                                c.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                              ).map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCategory(cat.id);
                                      setIsCategoryDropdownOpen(false);
                                      setDropdownSearch('');
                                    }}
                                    className={cn(
                                      "w-full text-left p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                                      isSelected 
                                        ? "bg-brand-500/20 text-brand-400 border border-brand-500/20" 
                                        : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
                                    )}
                                  >
                                    <span className="text-sm">{cat.icon}</span>
                                    <span className="truncate">{cat.name}</span>
                                  </button>
                                );
                              })}

                              {PRODUCT_CATEGORIES.filter(c => 
                                c.id !== 'all' && 
                                c.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="p-4 text-center text-slate-500 text-[9px] font-bold uppercase tracking-wider italic">
                                  Nenhuma categoria encontrada
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:hidden mb-10 -mt-6">
            <div className="flex items-center justify-between gap-4 mb-2 px-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Categorias</p>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none border",
                  selectedCategory === 'all' 
                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10" 
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                )}
              >
                <span>🔍</span>
                <span>Todos</span>
              </button>
              {PRODUCT_CATEGORIES.filter(c => c.id !== 'all' && c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none border",
                      isSelected 
                        ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10" 
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gráfico Layout Columnas (Desk: Sidebar Coluna + Main Content Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            
            {/* Coluna Categoria (Desktop Sidebar) */}
            <div className="hidden lg:block lg:col-span-3 bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm self-start h-fit max-h-[82vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <Store size={15} />
                </div>
                <h3 className="font-black text-[9px] uppercase tracking-wider text-slate-800">Categorias</h3>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "w-full text-left p-3 rounded-2xl text-[10.5px] font-bold tracking-tight transition-all flex items-center justify-between select-none border group",
                    selectedCategory === 'all' 
                      ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10 pr-4" 
                      : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base flex-shrink-0">🔍</span>
                    <span className="truncate">Todos</span>
                  </div>
                  {selectedCategory === 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-pulse" />
                  )}
                </button>
                
                {PRODUCT_CATEGORIES.filter(c => c.id !== 'all' && c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-2xl text-[10.5px] font-bold tracking-tight transition-all flex items-center justify-between select-none border group",
                        isSelected 
                          ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10 pr-4" 
                          : "bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base flex-shrink-0">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna Main Content (9 spans) */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              
              <div key="view-tabs" className="flex flex-col md:flex-row gap-6 -mt-2">
                <div className="flex-1 space-y-2 overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 font-sans">Resultado do Catálogo: {selectedShopTypeLabel}</p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    <button 
                      onClick={() => setActiveView('shops')}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] font-sans",
                        activeView === 'shops' ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                      )}
                    >
                      <Store size={14} /> Lojas
                    </button>
                    <button 
                      onClick={() => setActiveView('products')}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2 whitespace-nowrap min-w-[120px] font-sans",
                        activeView === 'products' ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                      )}
                    >
                      <Package size={14} /> Produtos
                    </button>
                  </div>
                </div>
              </div>

              {activeView === 'products' ? (
                <div className="flex flex-col gap-4" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform', contain: 'layout style paint' }}>
                  {React.useMemo(() => filteredProducts.map((product, idx) => {
                    const shop = shops.find(s => s.id === product.shopId);
                    const itemInCart = cart?.items.find((i: any) => i.product.id === product.id);
                    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                    
                    return (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        user={user}
                        shop={shop!}
                        initialQuantity={quantityInCart}
                        addToCart={(p) => sharedAddToCart(p, shop!)}
                        removeFromCart={sharedRemoveFromCart}
                        onNavigate={onNavigate}
                        showNotification={showNotification}
                        handleShare={() => handleShare(shop!)}
                      />
                    );
                  }), [filteredProducts, shops, sharedAddToCart, sharedRemoveFromCart, onNavigate, showNotification, handleShare])}
                  {filteredProducts.length === 0 && (
                    <div key="empty-products" className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={20} className="text-slate-200" />
                      </div>
                      <h3 className="text-base font-serif italic text-slate-900 mb-1">Nenhum produto encontrado</h3>
                      <p className="text-slate-400 text-[11px] italic">Tente mudar sua busca ou filtros.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                  {filteredShops.map((shop, idx) => (
                    <motion.div 
                       key={shop.id}
                       initial={{ opacity: 0, y: 15 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.05, duration: 0.5 }}
                       className="group cursor-pointer flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-400"
                       onClick={() => {
                         setSelectedShop(shop);
                         onNavigate('shop-detail');
                       }}
                    >
                      <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-50 rounded-xl overflow-hidden relative flex-shrink-0 shadow-sm group-hover:scale-103 transition-all duration-500">
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-white/20 flex items-center gap-1 z-10">
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            isShopOpen(shop.openingHours, shop.closingHours, shop) ? "bg-emerald-500" : "bg-red-500"
                          )} />
                          <span className="text-[5px] font-black uppercase tracking-widest text-slate-900">
                            {isShopOpen(shop.openingHours, shop.closingHours, shop) ? 'Aberto' : 'Fechado'}
                          </span>
                        </div>
                        <SafeImage 
                          src={shop.photoURL} 
                          type="shop"
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                          alt={shop.name} 
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                               const typeInfo = getShopTypeInfo(shop.type);
                               const Icon = typeInfo.icon;
                               return (
                                 <>
                                   <div className="p-1 bg-brand-50 rounded text-brand-600">
                                     <Icon size={10} />
                                   </div>
                                   <div className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full text-[7px] font-black uppercase tracking-widest border border-brand-100">
                                     {typeInfo.label}
                                   </div>
                                 </>
                               );
                            })()}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(shop.id);
                            }}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border active:scale-95",
                              user?.favorites?.includes(shop.id) 
                                ? "bg-red-500 text-white border-red-400 shadow-sm" 
                                : "bg-slate-50 text-slate-300 border-slate-100 hover:text-red-500 hover:bg-red-50"
                            )}
                          >
                            <Heart size={13} fill={user?.favorites?.includes(shop.id) ? "currentColor" : "none"} />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-lg md:text-xl font-serif italic text-slate-900 group-hover:text-brand-600 transition-colors tracking-tight truncate leading-snug">
                            {shop.name}
                          </h4>
                          <p className="text-slate-400 text-[10px] font-medium italic truncate">
                             {shop.address}, {shop.city}, {getFullStateName(shop.state)}. Brasil.
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
                                <div key={p.id} className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:border-brand-200 transition-colors relative flex items-center justify-center">
                                   <SafeImage src={p.photoURL} type="product" className="w-full h-full object-cover" />
                                   {searchTerm && (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) && (
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
                            .filter(p => p.shopId === shop.id && (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
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
                    <div key="empty-shops" className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 font-sans">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={22} className="text-slate-200" />
                      </div>
                      <h3 className="text-base font-serif italic text-slate-900 mb-1">Nenhum tesouro encontrado</h3>
                      <p className="text-slate-400 italic text-xs max-w-sm mx-auto">Tente ajustar seus filtros ou explorar outras regiões em busca de descobertas únicas.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
};

export default React.memo(SearchScreen);
