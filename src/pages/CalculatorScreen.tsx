import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ArrowLeft, 
  Store, 
  Tent, 
  ShoppingBag, 
  Truck, 
  Zap, 
  Banknote,
  CheckCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { AppConfig, UserProfile, Product } from '../types';
import { db, collection, query, where, getDocs, limit } from '../firebase';
import { cn } from '../lib/utils';
import { translateUnit } from '../services/formatService';

export const CalculatorScreen = ({ config, onBack, user, onApply, initialData }: { 
  config: AppConfig | null, 
  onBack?: () => void, 
  user?: UserProfile | null, 
  onApply?: (data: { price: number, unit: string, weightPerUnit: number }) => void,
  initialData?: { price: number, unit: string, weightPerUnit: number }
}) => {
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<'kg' | 'gram' | 'box' | 'bag' | 'unit'>(initialData?.unit as any || 'unit');
  const [weightPerUnit, setWeightPerUnit] = useState<number>(initialData?.weightPerUnit || 1);
  const [priceType, setPriceType] = useState<'per_unit' | 'per_kg'>('per_unit');
  const [productName, setProductName] = useState('');
  const [shopType, setShopType] = useState<string>('feira');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  const SHOP_TYPES = [
    { id: 'feira', label: 'FEIRA LIVRE', color: 'bg-emerald-500', icon: Store },
    { id: 'barraca', label: 'Barraca Livre', color: 'bg-amber-500', icon: Tent },
    { id: 'mercado', label: 'Mercado Livre', color: 'bg-blue-500', icon: ShoppingBag },
    { id: 'atacado', label: 'Atacado Livre', color: 'bg-purple-500', icon: Truck }
  ];

  useEffect(() => {
    if (user && user.role === 'vendor') {
      const fetchShopType = async () => {
        const q = query(collection(db, 'shops'), where('ownerUid', '==', user.uid), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const shopData = snap.docs[0].data();
          if (shopData.type) {
            setShopType(shopData.type);
          }
        }
      };
      fetchShopType();
    }
  }, [user]);
  
  const calculateTotal = () => {
    const basePrice = Number(price) || 0;
    const qty = Number(quantity) || 0;
    const weight = Number(weightPerUnit) || 1;

    if (priceType === 'per_kg') {
      if (unit === 'gram') {
        return basePrice * (qty / 1000);
      }
      if (unit === 'kg') {
        return basePrice * qty;
      }
      if (unit === 'box' || unit === 'bag' || unit === 'unit') {
        return basePrice * qty * weight;
      }
    }
    
    return basePrice * qty;
  };

  useEffect(() => {
    if ((unit === 'box' || unit === 'bag') && (weightPerUnit <= 0 || isNaN(weightPerUnit))) {
      setWeightPerUnit(1);
    }
  }, [unit]);

  const total = calculateTotal();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Calculadora Inteligente</h2>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Precisão por Peso e Unidade</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative shadow-sm">
          <Calculator size={24} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Zap size={10} className="text-white fill-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo de Comércio</label>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
                {SHOP_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setShopType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 min-w-[90px] rounded-2xl border-2 transition-all flex-shrink-0",
                        shopType === type.id 
                          ? `border-brand-500 bg-brand-50 text-brand-600` 
                          : "border-gray-50 bg-white text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <Icon size={18} />
                      <span className="text-[8px] font-black uppercase tracking-tight leading-none whitespace-nowrap">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Produto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Tomate, Batata, Saco de Milho..."
                  value={productName || ''}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Preço Base (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      placeholder="0,00"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-4 pl-12 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tipo de Precificação</label>
              <div className="flex gap-2 p-1.5 bg-gray-50 border border-slate-200 rounded-2xl h-[48px] w-full max-w-md">
                <button 
                  onClick={() => setPriceType('per_unit')}
                  className={cn(
                    "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    priceType === 'per_unit' ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Unidade
                </button>
                <button 
                  onClick={() => setPriceType('per_kg')}
                  className={cn(
                    "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    priceType === 'per_kg' ? "bg-white text-emerald-600 shadow-sm border border-slate-100" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Quilo
                </button>
              </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantidade</label>
                  <input 
                    type="number" 
                    value={quantity || 0}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unidade de Medida</label>
                  <select 
                    value={unit || 'unit'}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900 appearance-none"
                  >
                    <option value="unit">Unidade (un)</option>
                    <option value="kg">Quilo (kg)</option>
                    <option value="gram">Grama (g)</option>
                    <option value="box">Caixa (cx)</option>
                    <option value="bag">Saco (sc)</option>
                  </select>
                </div>
              </div>

              {(unit === 'box' || unit === 'bag' || (unit === 'unit' && priceType === 'per_kg')) && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Peso/Capacidade por {unit === 'box' ? 'Caixa' : unit === 'bag' ? 'Saco' : 'Unidade'} (kg)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={weightPerUnit || 0}
                      onChange={(e) => setWeightPerUnit(Number(e.target.value))}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                      placeholder="Ex: 20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                <Banknote size={16} />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Cálculo de Troco</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Valor Recebido (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    placeholder="0,00"
                    value={amountReceived || ''}
                    onChange={(e) => setAmountReceived(Number(e.target.value))}
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-brand-500 rounded-2xl outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Troco a Devolver</p>
                <p className={cn(
                  "text-2xl font-black",
                  amountReceived - total >= 0 ? "text-emerald-600" : "text-red-500"
                )}>
                  R$ {Math.max(0, amountReceived - total).toFixed(2)}
                </p>
                {amountReceived > 0 && amountReceived < total && (
                  <p className="text-[8px] font-bold text-red-400 uppercase mt-1">Valor insuficiente</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                {(() => {
                  const currentType = SHOP_TYPES.find(t => t.id === shopType);
                  const Icon = currentType?.icon || Store;
                  return (
                    <>
                      <Icon size={14} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{currentType?.label}</span>
                    </>
                  );
                })()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Estimado</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold opacity-80">R$</span>
                <span className="text-5xl font-black tracking-tighter">
                  {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-60">Itens / Peso</span>
                  <span className="font-black">
                    {quantity} {(translateUnit(unit) || '').toLowerCase()} 
                    {((unit === 'box' || unit === 'bag' || weightPerUnit > 1) && ` (${(priceType === 'per_unit' ? quantity * weightPerUnit : quantity).toFixed(2)} kg)`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[32px] p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Info size={16} />
              </div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Dica Inteligente</h4>
            </div>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              {priceType === 'per_kg' 
                ? "Você está calculando por peso. Certifique-se de que a balança esteja aferida para garantir a precisão do valor final."
                : "Cálculo por unidade é ideal para produtos padronizados. Para caixas e sacos, o peso total ajuda no planejamento do frete."}
            </p>
          </div>

          {onApply && (
            <button
              onClick={() => onApply({ price, unit, weightPerUnit })}
              className="w-full py-5 bg-brand-600 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <CheckCircle size={20} /> Aplicar ao Produto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
