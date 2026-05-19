import React from 'react';
import { cn } from '../lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const CategoryFilter = React.memo(({ categories, selectedCategory, onSelect, className }: CategoryFilterProps) => {
  return (
    <div className={cn("bg-white/90 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 flex gap-2 shadow-2xl overflow-x-auto pb-1", className)}>
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
          selectedCategory === 'all' 
            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
        )}
      >
        Todas
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2",
            selectedCategory === cat.id 
              ? "bg-brand-600 text-white shadow-xl shadow-brand-500/20" 
              : "bg-slate-50 text-slate-400 hover:bg-slate-100"
          )}
        >
          <span className="text-sm leading-none">{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
});
