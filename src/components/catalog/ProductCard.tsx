import React from 'react';

import { Product } from '../../types';
import { SafeImage } from '../SafeImage';
import QuantityControl from './QuantityControl';

interface Props {
  product: Product;
  quantityInCart: number;
  onUpdateQuantity: (product: Product, quantity: number) => void;
}

function ProductCard({ product, quantityInCart, onUpdateQuantity }: Props) {
  return (
    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-50 relative group transition-all hover:shadow-xl hover:shadow-slate-200/50" style={{ contain: 'layout' }}>
      <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
        <SafeImage
          src={product.photoURL || product.image || ''}
          alt={product.name}
          type="product"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-lg">
            Apenas {product.stock}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-emerald-600 font-black text-sm">
            R$ {product.price.toFixed(2)}
          </p>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">
            {product.weightPerUnit > 0 ? (
              `${product.weightPerUnit}${product.unit === 'kg' ? 'kg' : product.unit === 'gram' ? 'g' : product.unit === 'unit' ? 'un' : product.unit === 'box' ? 'cx' : product.unit === 'bag' ? 'sc' : ' ' + product.unit}`
            ) : product.unit}
          </span>
        </div>
        {product.description && (
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight pt-1 italic">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <QuantityControl 
          initialValue={quantityInCart} 
          max={product.stock}
          onChange={(val) => onUpdateQuantity(product, val)}
        />
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right leading-none">
          Estoque<br/><span className="text-slate-900">{product.stock}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
