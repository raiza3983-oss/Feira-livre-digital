import React, { useState, useEffect } from 'react';
import { 
  Search, Truck, MapPin, ChevronDown, Package, Store, ArrowRight, TrendingUp
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
    case 'atacado': return { label: 'Atacadista Livre', icon: Truck };
    default: return { label: 'Atacadista', icon: Truck };
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

const handleFirestoreError = (error: any, op: OperationType, path: string) => {
  console.error(`Firestore Error [${op}] at ${path}:`, error);
};

interface Props {
  config: AppConfig | null;
  onNavigate: (screen: Screen) => void;
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>;
  user: UserProfile | null;
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

const WholesaleScreen = ({ 
  config, 
  onNavigate, 
  onGoogleLogin,
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
  sharedRemoveFromCart,
  handleShare
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
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

  if (!user) return <LoginRequiredView onGoogleLogin={onGoogleLogin} />;
  
  const filteredShops = shops.filter(shop => {
    if (!shop.isApproved) return false;

    const shopMatches = (shop.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                       (shop.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const shopProducts = products.filter(p => p.shopId === shop.id);
    const productMatches = shopProducts.some(p => 
      (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.description || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const matchesSearch = shopMatches || productMatches;
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || 
      products.some(p => p.shopId === shop.id && p.category === selectedCategory);
    return matchesSearch && matchesState && matchesCategory;
  });

  const filteredProducts = products.filter(p => {
    const shop = shops.find(s => s.id === p.shopId);
    if (!shop || shop.type !== 'atacado' || !shop.isApproved) return false;
    
    const matchesSearch = (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (p.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         (shop.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesState = selectedState === 'all' || shop.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto pb-24 min-h-screen bg-transparent">
      <PageContainer>
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-light text-slate-900 font-serif italic tracking-tight mb-1 uppercase">ATACADO LIVRE</h2>
          <p className="text-slate-500 font-medium ml-1 text-xs uppercase tracking-wider">FORNECEDORES, PARA GRANDES VOLUMES E LOGÍSTICA PROFISSIONAL.</p>
          
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1 font-sans">Negócios Estratégicos</p>
                <p className="text-xs font-bold text-slate-900">Preços e condições exclusivas direto do campo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 mb-6 font-sans">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar fornecedores e produtos no atacado..." 
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
              <div className="relative flex-1 min-w-[120px]">
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  value={selectedState || 'all'}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-700 outline-none appearance-none focus:ring-1 focus:ring-brand-500 cursor-pointer h-full"
                >
                  <option value="all">Sua Região</option>
                  {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Categorias Search Combobox Dropdown */}
              <div className="relative flex-1 min-w-[140px]">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full flex items-center justify-between gap-1.5 px-4 py-2.5 bg-brand-500 border border-brand-400 rounded-xl font-black text-[9px] uppercase tracking-widest text-white outline-none hover:bg-brand-600 transition-all cursor-pointer shadow-md shadow-brand-500/10 h-full"
                >
                  <span className="truncate">
                    {selectedCategory === 'all' 
                      ? 'Categorias' 
                      : (PRODUCT_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Categorias')}
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform flex-shrink-0", isCategoryDropdownOpen && "rotate-180")} />
                </button>

                {isCategoryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setIsCategoryDropdownOpen(false); setDropdownSearch(''); }} />
                    
                    <div className="absolute right-0 mt-2 w-72 max-h-96 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-slate-50 relative">
                        <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Pesquisar categoria..."
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400 font-sans"
                          autoFocus
                        />
                        {dropdownSearch && (
                          <button
                            type="button"
                            onClick={() => setDropdownSearch('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto max-h-[250px] p-2 flex flex-col gap-1 no-scrollbar">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setIsCategoryDropdownOpen(false);
                            setDropdownSearch('');
                          }}
                          className={cn(
                            "w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border",
                            selectedCategory === 'all' 
                              ? "bg-brand-50 border-brand-100 text-brand-600" 
                              : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <span>🔍</span>
                          <span className="truncate font-sans font-black uppercase text-[10px] tracking-wider">Todas</span>
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
                                "w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border",
                                isSelected 
                                  ? "bg-brand-50 border-brand-100 text-brand-600" 
                                  : "bg-white border-transparent text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <span className="text-sm">{cat.icon}</span>
                              <span className="truncate font-sans font-black uppercase text-[10px] tracking-wider">{cat.name}</span>
                            </button>
                          );
                        })}

                        {PRODUCT_CATEGORIES.filter(c => 
                          c.id !== 'all' && 
                          c.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="p-4 text-center text-slate-400 text-xs italic font-sans">
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

        {/* Menu Topbar Nav (Touch scrolling horizontal list for mobile/tablet) */}
        <div className="lg:hidden mb-10 -mt-6">
          <div className="flex items-center justify-between gap-4 mb-2 px-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Categorias de Atacado</p>
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

            <div className="flex gap-3 -mt-2 font-sans">
              <button 
                onClick={() => setActiveView('shops')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2",
                  activeView === 'shops' ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                )}
              >
                <Store size={14} /> Lojas
              </button>
              <button 
                onClick={() => setActiveView('products')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-2",
                  activeView === 'products' ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                )}
              >
                <Package size={14} /> Produtos
              </button>
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
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 font-sans">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package size={20} className="text-slate-200" />
                    </div>
                    <h3 className="text-base font-serif italic text-slate-900 mb-1">Nenhum produto em atacado encontrado</h3>
                    <p className="text-slate-400 text-[11px] italic">Tente mudar sua busca ou filtros.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                {filteredShops.map(shop => (
                  <motion.div 
                    key={shop.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden group cursor-pointer transition-all hover:border-brand-200"
                    onClick={() => {
                      setSelectedShop(shop);
                      onNavigate('shop-detail');
                    }}
                  >
                    <div className="h-32 bg-slate-100 relative">
                      <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={shop.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-sm">
                        {(() => {
                            const typeInfo = getShopTypeInfo(shop.type || 'atacado');
                            const Icon = typeInfo.icon;
                            return (
                              <>
                                <Icon size={10} /> {typeInfo.label}
                              </>
                            );
                        })()}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white rounded-lg p-0.5 shadow-md flex-shrink-0">
                          <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover rounded-md" alt={shop.name} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-sm tracking-tight leading-none mb-0.5 truncate">{shop.name}</h3>
                          <div className="flex items-center gap-1 text-white/80 text-[8px] font-bold uppercase tracking-wider truncate">
                            <MapPin size={8} /> {shop.address}, {shop.city}, {getFullStateName(shop.state)}.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4 leading-relaxed font-sans">
                        {shop.description || 'Fornecedor especializado em vendas no atacado.'}
                      </p>

                      <div className="space-y-2 mb-4">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Catálogo de Produtos</p>
                        <div className="flex gap-1.5 overflow-hidden">
                          {products
                            .filter(p => p.shopId === shop.id)
                            .slice(0, 5)
                            .map(p => (
                              <div key={p.id} className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:border-brand-200 transition-colors relative flex items-center justify-center">
                                 <SafeImage src={p.photoURL} type="product" className="w-full h-full object-cover" />
                                 {searchTerm && (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) && (
                                   <div className="absolute inset-0 bg-blue-500/20 ring-2 ring-blue-500 ring-inset" />
                                 )}
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400 font-sans">
                          <TrendingUp size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Grandes volumes</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-sans">
                          <span className="text-[10px] font-black uppercase tracking-wider">Ver Catálogo</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredShops.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 font-sans">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Truck size={20} className="text-slate-200" />
                    </div>
                    <h3 className="text-base font-serif italic text-slate-900 mb-1">Nenhum atacadista encontrado</h3>
                    <p className="text-slate-400 text-xs font-medium font-sans">Tente buscar por outros termos ou estados.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default React.memo(WholesaleScreen);
