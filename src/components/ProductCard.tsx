import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Minus, Plus, Scale } from 'lucide-react';
import { Product, UserProfile, Shop, Screen } from '../types';
import { cn } from '../lib/utils';
import { translateUnit } from '../services/formatService';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  user: UserProfile | null;
  shop: Shop;
  initialQuantity: number;
  addToCart: (p: Product) => void;
  removeFromCart: (p: Product) => void;
  onNavigate: (s: Screen) => void;
  showNotification: (m: string, t?: 'success' | 'error') => void;
  handleShare: (data: { title: string; text: string; url?: string }) => void;
}

export const ProductCard = React.memo(({ 
  product, 
  user, 
  shop, 
  initialQuantity, 
  addToCart, 
  removeFromCart,
  onNavigate, 
  showNotification,
  handleShare
}: ProductCardProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Sync with initialQuantity only if it changes externally (e.g. cart cleared)
  React.useEffect(() => {
    if (initialQuantity !== quantity) {
      setQuantity(initialQuantity);
    }
  }, [initialQuantity]);

  const increment = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > quantity) {
      setQuantity(prev => prev + 1);
      // Sync with global cart
      addToCart(product);
    } else {
      showNotification(`Estoque máximo atingido para ${product.name}.`, 'error');
    }
  }, [product, quantity, addToCart, showNotification]);

  const decrement = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
      // Sync with global cart
      removeFromCart(product);
    }
  }, [product, quantity, removeFromCart]);

  const itemSubtotal = (product.price * quantity).toFixed(2);
  return (
    <motion.div 
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform' }}
      className="bg-white group flex flex-col gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-brand-100 hover:shadow-md transition-all duration-200 ease-out mb-2.5 font-sans"
    >
      <div className="relative h-24 w-full overflow-hidden rounded-lg bg-slate-50 flex-shrink-0 transition-transform duration-500 flex items-center justify-center">
        <SafeImage 
          src={product.photoURL} 
          type="product"
          className="w-full h-full object-cover" 
          alt={product.name} 
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Esgotado</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-0.5">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate flex-1">
              {product.name}
            </h4>
            <div className="flex items-center gap-1.5">
              {quantity > 0 && (
                <div className="px-1.5 py-0.5 bg-brand-50 rounded border border-brand-100">
                  <span className="text-[8px] font-black text-brand-700">Subtotal: R$ {itemSubtotal}</span>
                </div>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const shareText = `Confira esse produto no Aplicativo Feira Livre:\n\n🍎 *${product.name}*\n💰 R$ ${product.price.toFixed(2)} por ${product.unit}\n\nLoja: ${shop.name}`;
                  handleShare({ title: product.name, text: shareText, url: window.location.href });
                }}
                className="p-1 text-slate-300 hover:text-brand-600 transition-colors"
                title="Compartilhar"
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
             <span className="text-[9px] font-bold text-brand-600 uppercase">{product.category}</span>
             <div className="w-0.5 h-0.5 rounded-full bg-slate-200" />
             <span className="text-[9px] font-medium text-slate-400">Estoque: {product.stock - quantity}</span>
             {(product.weightPerUnit || 0) > 0 && (
               <>
                 <div className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                 <div className="flex items-center gap-0.5 text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                   <Scale size={8} />
                   <span>{product.weightPerUnit}{product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : ''}</span>
                 </div>
               </>
             )}
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-sm md:text-base font-black text-slate-900 tabular-nums">
              <span className="text-[10px] mr-0.5 opacity-50">R$</span>
              {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[8px] font-bold uppercase text-slate-400">por {translateUnit(product.unit).toLowerCase()}</p>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-full">
            <button 
              onClick={decrement}
              disabled={quantity === 0}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95",
                quantity > 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-300 pointer-events-none"
              )}
            >
              <Minus size={11} />
            </button>
            
            <span className={cn(
              "text-xs font-bold w-5 text-center",
              quantity > 0 ? "text-slate-900" : "text-slate-300"
            )}>
              {quantity}
            </span>

            <button 
              onClick={increment}
              disabled={product.stock <= quantity}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95",
                product.stock > quantity ? "bg-brand-600 text-white shadow-md" : "bg-white text-slate-200"
              )}
            >
              <Plus size={11} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}, (prev, next) => {
  return prev.product.id === next.product.id && 
         prev.product.stock === next.product.stock &&
         prev.product.price === next.product.price &&
         prev.initialQuantity === next.initialQuantity;
});
