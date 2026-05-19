import React from 'react';
import { motion } from 'motion/react';
import { Package, Search, Plus, Edit2 } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import { SafeImage } from '../components/SafeImage';
import { Product } from '../types';

interface Props {
  products: Product[];
  onEdit: (p: Product) => void;
  onAdd: () => void;
}

function InventoryPage({ products, onEdit, onAdd }: Props) {
  return (
    <PageContainer>
      <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gerenciar Estoque</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle total dos seus produtos</p>
          </div>
          <button 
            onClick={onAdd}
            className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar nos seus produtos..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-emerald-300 transition-colors"
          />
        </div>

        <div className="grid gap-3" style={{ contain: 'layout' }}>
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group transition-opacity opacity-95 hover:opacity-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                  <SafeImage src={product.image} type="product" className="w-full h-full object-cover" alt={product.name} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{product.name}</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Estoque: {product.stock}</p>
                </div>
              </div>
              <button 
                onClick={() => onEdit(product)}
                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-500 hover:bg-brand-50 transition-all"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Nenhum produto cadastrado no seu catálogo
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default React.memo(InventoryPage);
