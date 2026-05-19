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
  { id: 'all', name: 'Todos' },
  { id: 'frutas', name: 'Frutas' },
  { id: 'verduras', name: 'Verduras' },
  { id: 'legumes', name: 'Legumes' },
  { id: 'ovos-laticinios', name: 'Ovos & Laticínios' },
  { id: 'graos-cereais', name: 'Grãos' },
  { id: 'artesanais', name: 'Artesanais' },
  { id: 'outros', name: 'Outros' }
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
          <div key="search-header" className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-7xl md:text-9xl font-light text-slate-900 font-serif italic tracking-tighter leading-[0.8] mb-2 uppercase">
                {selectedShopTypeLabel === 'Todos' ? 'FEIRA LIVRE' : selectedShopTypeLabel} 🇧🇷
              </h2>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-2 rounded-full flex items-center shadow-lg shadow-slate-200/50">
              <div className="px-6 py-3 border-r border-slate-100 hidden md:block">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-1">Total de</p>
                <p className="text-xl font-serif italic text-slate-900 leading-none">{shops.length} Lojas</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-500 mb-1">Localização</p>
                <p className="text-xl font-serif italic text-slate-900 leading-none">{selectedState === 'all' ? 'Todo Brasil' : getFullStateName(selectedState)}</p>
              </div>
            </div>
          </div>

          <div key="sticky-controls" className="sticky top-4 z-40 mb-20">
            <div className="bg-slate-900 p-4 md:p-6 rounded-[32px] shadow-2xl shadow-slate-900/20 border border-slate-800">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Search size={22} className="text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    {selectedShopType !== 'all' && (
                      <span className="hidden md:inline-flex px-2 py-0.5 bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-wider rounded border border-brand-500/20">
                        {selectedShopTypeLabel}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder={`Buscar em ${selectedShopTypeLabel}...`} 
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-white text-lg font-medium outline-none focus:border-brand-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-wrap lg:flex-nowrap gap-4">
                  <div className="flex bg-slate-800/50 rounded-2xl p-1 border border-slate-700/50 overflow-x-auto">
                    {shopTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedShopType(type.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                          selectedShopType === type.id 
                            ? "bg-brand-500 text-white" 
                            : "text-slate-400 hover:text-slate-200"
                        )}
                        title={type.label}
                      >
                        <type.icon size={14} />
                        <span className="hidden sm:inline">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 flex-1">
                    <select 
                      value={selectedState || 'all'}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="flex-1 px-8 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-300 outline-none hover:border-slate-600 transition-all appearance-none cursor-pointer text-center"
                    >
                      <option value="all">Sua Região</option>
                      {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select 
                      value={selectedCategory || 'all'}
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
          </div>

          <div key="view-tabs" className="flex flex-col md:flex-row gap-6 mb-20 -mt-10">
            <div className="flex-1 space-y-2 overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Resultado do Catálogo: {selectedShopTypeLabel}</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <button 
                  onClick={() => setActiveView('shops')}
                  className={cn(
                    "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3 whitespace-nowrap min-w-[140px]",
                    activeView === 'shops' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                  )}
                >
                  <Store size={18} /> Lojas
                </button>
                <button 
                  onClick={() => setActiveView('products')}
                  className={cn(
                    "flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3 whitespace-nowrap min-w-[140px]",
                    activeView === 'products' ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                  )}
                >
                  <Package size={18} /> Produtos
                </button>
              </div>
            </div>
          </div>

          {activeView === 'products' ? (
            <div className="flex flex-col gap-6" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform', contain: 'layout style paint' }}>
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
                    <div className="absolute top-2 left-2 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 z-10">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isShopOpen(shop.openingHours, shop.closingHours, shop) ? "bg-emerald-500" : "bg-red-500"
                      )} />
                      <span className="text-[6px] font-black uppercase tracking-widest text-slate-900">
                        {isShopOpen(shop.openingHours, shop.closingHours, shop) ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    <SafeImage 
                      src={shop.photoURL} 
                      type="shop"
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" 
                      alt={shop.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => {
                           const typeInfo = getShopTypeInfo(shop.type);
                           const Icon = typeInfo.icon;
                           return (
                             <>
                               <div className="p-1.5 bg-brand-50 rounded-lg text-brand-600">
                                 <Icon size={12} />
                               </div>
                               <div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-100">
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

export default React.memo(SearchScreen);
