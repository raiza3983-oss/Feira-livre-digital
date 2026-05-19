import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/catalog/ProductCard';
import CatalogHero from '../components/catalog/CatalogHero';
import PageContainer from '../components/ui/PageContainer';
import { Product, Shop, Cart, UserProfile } from '../types';
import { db, doc, getDoc } from '../firebase';

interface Props {
  shop: Shop | null;
  products: Product[];
  cart: Cart | null;
  onUpdateQuantity: (p: Product, q: number) => void;
  onCheckout: () => void;
  isLoading: boolean;
  onBack?: () => void;
}

function CatalogPage({ shop, products, cart, onUpdateQuantity, onCheckout, isLoading, onBack }: Props) {
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinalCheckout = async () => {
    setIsFinishing(true);
    await onCheckout();
    setIsFinishing(false);
  };

  useEffect(() => {
    async function fetchOwner() {
      if (shop?.ownerUid) {
        try {
          const ownerDoc = await getDoc(doc(db, 'users', shop.ownerUid));
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data() as UserProfile);
          }
        } catch (err) {
          console.error("Error fetching owner profile:", err);
        }
      }
    }
    fetchOwner();
  }, [shop?.ownerUid]);

  const getProductQuantity = useCallback((productId: string) => {
    return cart?.items.find(i => i.product.id === productId)?.quantity || 0;
  }, [cart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/20"
        />
      </div>
    );
  }

  if (!shop) return null;

  const storeSettings = {
    shopType: shop.type,
    category: shop.category || shop.type,
    address: shop.address,
    city: shop.city || '',
    state: shop.state || '',
    phone: shop.whatsapp || '',
    description: shop.description,
    image: shop.photoURL,
    openingHours: shop.openingHours,
    closingHours: shop.closingHours,
    deliveryMethods: shop.deliveryPaymentMethods,
    pickupMethods: shop.pickupPaymentMethods
  };

  const sellerProfile = {
    name: owner?.displayName || 'Feirante Parceiro',
    phone: owner?.phone || shop.whatsapp || '',
    age: owner?.age || '-',
    city: owner?.city || '',
    state: owner?.state || '',
    gender: owner?.gender === 'M' ? 'Masculino' : (owner?.gender === 'F' ? 'Feminino' : 'Outro'),
    description: owner?.description || 'Dedicação total em levar o melhor do campo diretamente para sua mesa.',
    image: owner?.photoURL || ''
  };

  return (
    <PageContainer>
      <div className="pb-40 max-w-2xl mx-auto bg-slate-50 min-h-screen">
        {/* Modern Nav */}
        <div className="px-4 pt-6 flex items-center justify-between">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">{shop.name}</h1>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        {/* Novo Cabeçalho Catalogo */}
        <CatalogHero 
          storeData={storeSettings}
          ownerData={sellerProfile}
        />

        {/* Content Section */}
        <div className="px-6 space-y-8 mt-4">
          
          {/* Products Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShoppingBag size={12} /> Catálogo de Produtos
                </h2>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-sm">
                <Search size={20} />
              </div>
            </div>

            <div 
              className="grid grid-cols-2 gap-4"
              style={{ contain: 'layout' }}
            >
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  quantityInCart={getProductQuantity(product.id)}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4 stroke-1" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Loja em manutenção ou sem produtos
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

export default React.memo(CatalogPage);
