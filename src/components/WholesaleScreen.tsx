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
  { id: 'all', name: 'Todos' },
  { id: 'frutas', name: 'Frutas' },
  { id: 'verduras', name: 'Verduras' },
  { id: 'legumes', name: 'Legumes' },
  { id: 'ovos-laticinios', name: 'Ovos & Laticínios' },
  { id: 'graos-cereais', name: 'Grãos' },
  { id: 'artesanais', name: 'Artesanais' },
  { id: 'outros', name: 'Outros' }
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
    <div className="p-6 max-w-7xl mx-auto pb-32 min-h-screen bg-transparent">
      <PageContainer>
        <div className="mb-12">
          <h2 className="text-5xl font-light text-slate-900 font-serif italic tracking-tight mb-2 uppercase">ATACADO LIVRE</h2>
          <p className="text-slate-500 font-medium ml-1 text-sm uppercase tracking-wider">FORNECEDORES, PARA GRANDES VOLUMES E LOGÍSTICA PROFISSIONAL.</p>
          
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
            
            <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2 whitespace-nowrap max-w-full">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest w-full mb-1">Buscas Recentes</span>
              {recentSearches.map(s => (
                <button 
                  key={s}
                  onClick={() => setSearchTerm(s)}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-brand-300 hover:text-brand-600 transition-all whitespace-nowrap"
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
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-medium outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
            <div className="relative">
              <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={selectedState || 'all'}
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
                  <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={shop.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                    {(() => {
                        const typeInfo = getShopTypeInfo(shop.type || 'atacado');
                        const Icon = typeInfo.icon;
                        return (
                          <>
                            <Icon size={12} /> {typeInfo.label}
                          </>
                        );
                    })()}
                  </div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl p-1 shadow-xl">
                      <SafeImage src={shop.photoURL} type="shop" className="w-full h-full object-cover rounded-xl" alt={shop.name} />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg font-display leading-none mb-1">{shop.name}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin size={10} /> {shop.address}, {shop.city}, {getFullStateName(shop.state)}. Brasil.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                    {shop.description || 'Fornecedor especializado em vendas no atacado.'}
                  </p>

                  <div className="space-y-4 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catálogo de Produtos</p>
                    <div className="flex gap-2 overflow-hidden">
                      {products
                        .filter(p => p.shopId === shop.id)
                        .slice(0, 5)
                        .map(p => (
                          <div key={p.id} className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:border-brand-200 transition-colors relative flex items-center justify-center">
                             <SafeImage src={p.photoURL} type="product" className="w-full h-full object-cover" />
                             {searchTerm && (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) && (
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

export default React.memo(WholesaleScreen);
