import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface Props {
  initialValue: number;
  max: number;
  onChange: (newValue: number) => void;
}

export function QuantityControl({ initialValue, max, onChange }: Props) {
  const [value, setValue] = useState(initialValue);

  // Sync with prop changes (e.g. if cart is cleared)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max) {
      const next = value + 1;
      setValue(next);
      onChange(next);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > 0) {
      const next = value - 1;
      setValue(next);
      onChange(next);
    }
  };

  return (
    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1" style={{ contain: 'layout' }}>
      <button 
        onClick={handleDecrement}
        disabled={value <= 0}
        className="p-1 text-slate-500 hover:text-red-500 disabled:opacity-30 transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-xs font-black text-slate-900 tabular-nums">
        {value}
      </span>
      <button 
        onClick={handleIncrement}
        disabled={value >= max}
        className="p-1 text-slate-500 hover:text-emerald-500 disabled:opacity-30 transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default React.memo(QuantityControl);
