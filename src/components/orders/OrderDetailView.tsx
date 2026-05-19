import React from 'react';
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare,
  Package,
  Weight,
  ShoppingBag,
  Info,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Order, UserProfile, Shop } from '../../types';
import { SafeImage } from '../SafeImage';
import { translateStatus } from '../../services/formatService';

interface Props {
  order: Order;
  onBack: () => void;
  user: UserProfile | null;
}

const OrderDetailView = ({ order, onBack, user }: Props) => {
  const steps = [
    { id: 'pending', label: 'Pedido enviado', description: 'Seu pedido foi enviado e a loja foi notificada.' },
    { id: 'accepted', label: 'Pedido aceito pela loja', description: 'Seu pedido foi aceito e estamos aguardando o pagamento.' },
    { id: 'pending_payment', label: 'Aguardando pagamento', description: 'Aguardando a confirmação do pagamento para iniciar o preparo.' },
    { id: 'paid', label: 'Pagamento aceito', description: 'Pagamento confirmado! Em breve iniciaremos o preparo.' },
    { id: 'preparing', label: 'Preparando seu pedido', description: 'Estamos separando os produtos com muito cuidado.' },
    { id: 'ready', label: 'Entrega ou retirada', description: 'Seu pedido saiu para entrega ou está pronto para retirada.' },
    { id: 'completed', label: 'Pedido concluído', description: 'Pedido finalizado com sucesso. Obrigado pela preferência!' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#006400] text-white font-sans">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight uppercase leading-none mb-1">Informação da loja sobre o pedido e os produtos</h1>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Acompanhe aqui todas as informações atualizadas pela loja</p>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="bg-[#f0f2f5] min-h-screen rounded-t-[40px] p-6 lg:p-8 space-y-8 text-slate-900 pb-40">
        
        {/* LOJA RESPONSÁVEL BAR */}
        <div className="bg-white rounded-[32px] p-4 md:px-8 md:py-6 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 relative border border-slate-100">
                 <SafeImage src={order.items && order.items[0]?.photoURL} type="product" className="w-full h-full object-cover" />
                 <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center shadow-md">
                    <SafeImage src={order.shopPhotoURL || ''} type="shop" className="w-full h-full object-cover" />
                 </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">LOJA RESPONSÁVEL</p>
                 <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{order.shopName}</h2>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                 </div>
                 <p className="text-xs font-bold text-slate-400 mt-1">{order.id.slice(-6).toUpperCase()}</p>
              </div>
           </div>
           
           <button className="px-6 py-3 border-2 border-slate-100 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition-all">
              <Store size={18} />
              Ver loja
           </button>
        </div>

        {/* STATUS TIMELINE */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
           <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-10">STATUS ATUAL DO PEDIDO</h3>
           
           <div className="space-y-12 ml-1 relative">
              {/* Vertical line background */}
               <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />

               {isCancelled ? (
                 <div className="relative flex items-start gap-8 group">
                    <div className="w-10 h-10 rounded-full bg-red-100 border-4 border-white shadow-md flex items-center justify-center text-red-600 z-10 shrink-0">
                       <ArrowLeft size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-red-600 uppercase">PEDIDO CANCELADO</h4>
                       <p className="text-xs font-bold text-slate-400 mt-1 max-w-lg">Este pedido foi cancelado e não prosseguirá mais no fluxo.</p>
                    </div>
                 </div>
               ) : (
                 steps.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    
                    return (
                      <div key={idx} className={cn("relative flex items-start gap-8 group transition-opacity", !isDone && "opacity-30")}>
                         <div className={cn(
                           "w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 shrink-0 transition-all duration-500",
                           isCurrent ? "bg-emerald-600 text-white scale-110" : isDone ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-300"
                         )}>
                           {idx === 0 ? <CheckCircle2 size={18} /> : 
                            idx === 1 ? <CheckCircle2 size={18} /> :
                            idx === 2 ? <CreditCard size={18} /> :
                            idx === 3 ? <CheckCircle2 size={18} /> :
                            idx === 4 ? <Package size={18} /> :
                            idx === 5 ? <Truck size={18} /> : <CheckCircle2 size={18} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <h4 className={cn("text-sm font-black uppercase transition-colors", isCurrent ? "text-emerald-700" : isDone ? "text-slate-900" : "text-slate-400")}>
                                 {step.label}
                               </h4>
                               {isCurrent && (
                                 <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">ATUAL</span>
                               )}
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-1 max-w-lg leading-relaxed">
                               {step.description}
                            </p>
                            {isCurrent && (
                              <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                                Atualizado hoje às 10:30
                              </p>
                            )}
                         </div>
                      </div>
                    )
                 })
               )}
           </div>
        </div>

        {/* FEEDBACK BANNER */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="flex items-start gap-6 relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                 <Info size={24} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-sm font-black text-emerald-800 uppercase tracking-tight">Informações enviadas pela loja</h4>
                 <p className="text-xs font-bold text-emerald-700 leading-relaxed max-w-md">As informações acima são atualizadas em tempo real pela loja. Fique atento às mudanças de status do seu pedido.</p>
              </div>
           </div>
           <div className="relative shrink-0 hidden md:block">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200" alt="Groceries" className="w-32 h-24 object-cover rounded-2xl grayscale opacity-40 mix-blend-multiply" />
           </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { 
               label: 'Data do pedido', 
               value: order.createdAt?.toDate 
                 ? `${order.createdAt.toDate().toLocaleDateString()} às ${order.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                 : 'N/A', 
               icon: Calendar 
             },
             { label: 'Forma de pagamento', value: order.paymentMethod || 'Não informado', icon: CreditCard },
             { label: 'Tipo de entrega', value: order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada', icon: Truck },
             { label: 'Previsão informada', value: 'Hoje até 17:00', icon: Clock }
           ].map((det, idx) => (
             <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                   <det.icon size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{det.label}</p>
                   <p className="text-sm font-black text-slate-900 tracking-tight">{det.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* ITEMS & SUMMARY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Items List */}
           <div className="lg:col-span-12">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                 <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-8">RESUMOS DOS PRODUTOS</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                   <div className="space-y-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                                 <SafeImage src={item.photoURL || ''} type="product" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 uppercase truncate mb-1">{item.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.quantity} {item.unit} • R$ {item.price.toFixed(2)}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="flex flex-col h-full">
                      <div className="bg-emerald-50/50 rounded-[32px] p-8 border border-emerald-100 space-y-6 flex-1">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <ShoppingBag size={20} className="text-emerald-600" />
                               <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.items.length} itens</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <Weight size={20} className="text-emerald-600" />
                               <span className="text-sm font-black text-slate-900 uppercase tracking-tight">8,45 kg</span>
                            </div>
                         </div>

                         <div className="pt-6 border-t border-emerald-100 space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                               <span>Taxa de entrega</span>
                               <span className="text-slate-900">R$ 6,00</span>
                            </div>
                            <div className="pt-2 flex justify-between items-end">
                               <span className="text-lg font-black text-slate-900 uppercase tracking-tight">TOTAL GERAL</span>
                               <span className="text-4xl font-black text-emerald-600 font-display tracking-tighter">R$ {order.totalValue.toFixed(2)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailView;
