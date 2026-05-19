import React from 'react';

interface Props {
  cart: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    measure: string;
  }[];
  total: number;
  storeData: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  deliveryType: string;
  paymentMethod: string;
  onUpdateDeliveryType: (type: 'delivery' | 'pickup') => void;
  onUpdatePaymentMethod: (method: string) => void;
  onFinish: () => void;
}

function CheckoutSummary({
  cart,
  total,
  storeData,
  deliveryType,
  paymentMethod,
  onUpdateDeliveryType,
  onUpdatePaymentMethod,
  onFinish
}: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div className="p-8 md:p-12">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-inner ring-4 ring-brand-50/50">
            <StoreIcon size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight mb-2 uppercase">
            {storeData.name}
          </h2>
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin size={14} className="text-brand-500" />
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {storeData.address}, {storeData.city} • {storeData.state} • Brasil
            </p>
          </div>
        </div>

        {/* LOGISTICS SELECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Opção de Recebimento</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onUpdateDeliveryType('pickup')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                  deliveryType === 'pickup' ? "bg-brand-50 border-brand-200 text-brand-600 ring-2 ring-brand-200/20" : "bg-white border-slate-100 text-slate-400"
                )}
              >
                <StoreIcon size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Retirada</span>
              </button>
              <button 
                onClick={() => onUpdateDeliveryType('delivery')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                  deliveryType === 'delivery' ? "bg-brand-50 border-brand-200 text-brand-600 ring-2 ring-brand-200/20" : "bg-white border-slate-100 text-slate-400"
                )}
              >
                <Truck size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Entrega</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Forma de Pagamento</p>
            <div className="grid grid-cols-2 gap-3">
              {['Pix', 'Dinheiro'].map(method => (
                <button 
                  key={method}
                  onClick={() => onUpdatePaymentMethod(method)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    paymentMethod === method ? "bg-emerald-50 border-emerald-200 text-emerald-600 ring-2 ring-emerald-200/20" : "bg-white border-slate-100 text-slate-400"
                  )}
                >
                  <CreditCard size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{method}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-8 mb-12">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Itens do Pedido</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="group p-6 bg-slate-50/50 rounded-[32px] border border-slate-100/50 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-[18px] shadow-sm flex items-center justify-center text-brand-600 font-black text-xs border border-slate-100">
                    {item.quantity}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1 uppercase">
                      {item.name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      R$ {item.price.toFixed(2)} / {item.measure}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 tracking-tighter">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="p-8 bg-brand-600 rounded-[32px] text-white flex flex-col justify-center items-center text-center gap-1 shadow-xl shadow-brand-600/20 mb-12">
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Valor Total a Pagar</span>
          <span className="text-4xl font-black font-display tracking-tight leading-none">
            R$ {total.toFixed(2)}
          </span>
        </div>

        {/* FINALIZE BUTTON */}
        <button
          onClick={onFinish}
          className="group relative w-full bg-[#5D4037] hover:bg-[#4E342E] text-white rounded-[24px] py-8 px-8 font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-amber-900/20 active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            PEDIDOS
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </span>
        </button>
        
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          Checkout Seguro • {deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada na Banca'}
        </p>
      </div>
    </motion.div>
  );
}

import { Store as StoreIcon, MapPin, Map, Globe, Truck, ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default React.memo(CheckoutSummary);
