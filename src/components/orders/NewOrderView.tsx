import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Store, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ArrowRight, 
  X,
  ShoppingBag,
  Weight,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Send,
  Phone,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Cart, UserProfile, Shop, Product } from '../../types';
import { SafeImage } from '../SafeImage';
import { db, doc, getDoc } from '../../firebase';

interface Props {
  cart: Cart;
  user: UserProfile | null;
  onCancel: () => void;
  onSend: (data: any) => void;
  onNavigateToProfile: () => void;
  isLoading?: boolean;
}

const NewOrderView = ({ cart, user, onCancel, onSend, onNavigateToProfile, isLoading }: Props) => {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(cart.deliveryType || 'delivery');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    async function fetchDetails() {
      if (!cart.shopOwnerUid && !cart.shopId) return;

      const fetchOwner = async () => {
        if (!cart.shopOwnerUid) return;
        try {
          const ownerDoc = await getDoc(doc(db, 'users', cart.shopOwnerUid));
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data() as UserProfile);
          }
        } catch (err: any) {
          // Suppress offline error as it's handled by generic UI if needed
          if (err?.message?.includes('offline')) {
            console.warn("Owner profile: client is offline, using cache/defaults");
          } else {
            console.error("Error fetching owner profile:", err);
          }
        }
      };

      const fetchShop = async () => {
        if (!cart.shopId) return;
        try {
          const shopDoc = await getDoc(doc(db, 'shops', cart.shopId));
          if (shopDoc.exists()) {
            setShop(shopDoc.data() as Shop);
          }
        } catch (err: any) {
          // Suppress offline error as it's handled by generic UI if needed
          if (err?.message?.includes('offline')) {
            console.warn("Shop profile: client is offline, using cache/defaults");
          } else {
            console.error("Error fetching shop profile:", err);
          }
        }
      };

      await Promise.allSettled([fetchOwner(), fetchShop()]);
    }
    fetchDetails();
  }, [cart.shopOwnerUid, cart.shopId]);
  
  // Payment methods based on delivery type
  const getPaymentOptions = () => {
    const shopMethods = deliveryType === 'delivery' 
       ? shop?.deliveryPaymentMethods 
       : shop?.pickupPaymentMethods;

    if (shopMethods && shopMethods.length > 0) {
      return shopMethods.map(m => {
        let Icon = CreditCard;
        if (m.toLowerCase().includes('pix')) Icon = Smartphone;
        if (m.toLowerCase().includes('dinheiro')) Icon = Banknote;
        return { id: m.toLowerCase().replace(/\s+/g, '_'), label: m, icon: Icon };
      });
    }

    // Default Fallbacks
    return deliveryType === 'delivery' ? [
      { id: 'virtual_debit', label: 'Cartão Virtual Débito', icon: CreditCard },
      { id: 'virtual_credit', label: 'Cartão Virtual Crédito', icon: CreditCard },
      { id: 'pix', label: 'Pix', icon: Smartphone },
    ] : [
      { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
      { id: 'debit', label: 'Cartão de Débito', icon: CreditCard },
      { id: 'cash', label: 'Dinheiro', icon: Banknote },
      { id: 'pix', label: 'Pix', icon: Smartphone },
    ];
  };

  const paymentOptions = getPaymentOptions();

  useEffect(() => {
     // Reset payment method if it doesn't belong to current delivery type
     const validIds = paymentOptions.map(o => o.label);
     if (!validIds.includes(paymentMethod)) {
       setPaymentMethod('');
     }
  }, [deliveryType]);

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalWeight = cart.items.reduce((sum, item) => {
    const weight = item.product.weightPerUnit || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const deliveryFee = 0;
  const total = subtotal;

  const handleSend = () => {
    if (!paymentMethod || isLoading || submitted) return;
    setSubmitted(true);
    onSend({ deliveryType, paymentMethod, notes, total });
  };

  const handleCancel = () => {
    if (isLoading || submitted) return;
    onCancel();
  };

  return (
    <div className="min-h-screen bg-[#006400] text-white font-sans">
      {/* HEADER */}
      <div className="p-6 flex items-center gap-4">
        <button 
          onClick={handleCancel} 
          disabled={isLoading || submitted}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Novo Pedido</h1>
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Revise seu pedido antes de enviar para a loja</p>
        </div>
      </div>

      {/* CONTENT CONTAINER */}
      <div className="bg-[#f0f2f5] min-h-screen rounded-t-[40px] p-6 lg:p-8 space-y-8 text-slate-900 pb-40">
        
        {/* TOP CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. ENTREGA OU RETIRADA */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col h-full border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">1. ENTREGA OU RETIRADA</h3>
            <div className="space-y-4 flex-1">
              <button 
                onClick={() => !isLoading && !submitted && setDeliveryType('delivery')}
                disabled={isLoading || submitted}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left disabled:opacity-80",
                  deliveryType === 'delivery' ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/10" : "bg-white border-slate-100"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", deliveryType === 'delivery' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}>
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">Entrega</p>
                  <p className="text-[10px] font-bold text-slate-400">Receber no endereço</p>
                </div>
              </button>

              <button 
                onClick={() => !isLoading && !submitted && setDeliveryType('pickup')}
                disabled={isLoading || submitted}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left disabled:opacity-80",
                  deliveryType === 'pickup' ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/10" : "bg-white border-slate-100"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", deliveryType === 'pickup' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}>
                  <Store size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">Retirada</p>
                  <p className="text-[10px] font-bold text-slate-400">Buscar na loja</p>
                </div>
              </button>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-600">
              <MapPin size={16} />
              <span className="text-[11px] font-black uppercase tracking-tight">{user?.city || 'Brasil'} - {user?.state || ''}</span>
            </div>
          </div>

          {/* 2. FORMA DE PAGAMENTO */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col h-full border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">2. FORMA DE PAGAMENTO</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Opções para <span className="text-emerald-600">{deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</span></p>
            
            <div className="space-y-3 flex-1">
              {paymentOptions.map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => !isLoading && !submitted && setPaymentMethod(opt.label)}
                  disabled={isLoading || submitted}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left disabled:opacity-80",
                    paymentMethod === opt.label ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <opt.icon size={20} className="text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-tight">{opt.label}</span>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-all", paymentMethod === opt.label ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300")}>
                    {paymentMethod === opt.label && <CheckCircle2 size={12} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
               <ShieldCheck size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% seguro</span>
            </div>
          </div>

          {/* RESUMO DO PEDIDO */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col h-full border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">RESUMO DO PEDIDO</h3>
            
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-slate-400" />
                <span className="text-sm font-black text-slate-700">{cart.items.length} itens</span>
              </div>
              <div className="flex items-center gap-3">
                <Weight size={18} className="text-slate-400" />
                <span className="text-sm font-black text-slate-700">{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-bold">R$</span>
                <span className="text-sm font-black text-slate-700">R$ {subtotal.toFixed(2)}</span>
              </div>

            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL GERAL</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <span className="text-3xl font-black text-emerald-600 tabular-nums leading-none tracking-tight">R$ {total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleSend}
                disabled={!paymentMethod || isLoading || submitted}
                className="w-full py-4 bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] shadow-none active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {isLoading || submitted ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isLoading || submitted ? 'ENVIANDO...' : 'ENVIAR PEDIDO À LOJA'}
              </button>

              <button 
                onClick={handleCancel}
                disabled={isLoading || submitted}
                className="w-full py-4 border-2 border-slate-100 text-red-500 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <X size={18} />
                CANCELAR PEDIDO
              </button>
            </div>
          </div>
        </div>

        {/* LOJA CARD */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">LOJA</p>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-40 h-40 bg-white rounded-[40px] overflow-hidden flex-shrink-0 border border-slate-100 relative shadow-sm">
               <SafeImage src={shop?.photoURL || cart.shopPhotoURL || ''} type="shop" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 space-y-6">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{cart.shopName}</h2>
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {owner?.gender === 'F' ? 'Proprietária' : 'Proprietário'}: <span className="text-emerald-600">{owner?.displayName || (cart.shopOwnerUid || '').slice(0, 8)}</span>
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={16} />
                      <span className="text-sm font-bold">{cart.shopWhatsapp || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin size={16} className="shrink-0" />
                      <p className="text-sm font-bold leading-tight">{cart.shopAddress || 'Endereço não informado'}, {cart.shopCity || ''} - {cart.shopState || ''}, Brasil</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <Truck size={16} />
                      <span className="text-sm font-black uppercase tracking-tight">Entrega disponível</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                       <Clock size={16} />
                       <span className="text-sm font-bold">Horário: 07:00 às 18:00</span>
                    </div>
                  </div>
               </div>
            </div>


          </div>
        </div>

        {/* CLIENTE CARD */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">CLIENTE</p>
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100 shrink-0">
                   <SafeImage src={user?.photoURL || ''} type="user" className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left">
                   <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">{user?.displayName}</h3>
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                       <Phone size={14} />
                       {user?.phone || 'Telefone não cadastrado'}
                     </div>
                     <div className="flex items-start gap-2 text-slate-500 text-sm font-bold">
                       <MapPin size={14} className="mt-0.5 shrink-0" />
                       <p className="leading-tight">
                         {user?.address || 'Endereço não cadastrado'}<br />
                         {user?.city || ''} {user?.state ? `- ${user.state}` : ''}, Brasil
                       </p>
                     </div>
                   </div>
                </div>
              </div>


           </div>
        </div>

        {/* RESUMOS DOS PRODUTOS */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-8">RESUMOS DOS PRODUTOS</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 group">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                      <SafeImage src={item.product.photoURL || item.product.image || ''} type="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 uppercase truncate mb-1">{item.product.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Peso/Medida: {item.product.weightPerUnit || 0} {item.product.unit || ''}
                        {' • '}
                        Quantidade: {item.quantity} {item.product.unit || 'un.'}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-900">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="bg-emerald-50/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-emerald-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-emerald-700 font-black uppercase text-[10px] tracking-widest">
                  <ShoppingBag size={14} />
                  {cart.items.length} itens
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-black uppercase text-[10px] tracking-widest">
                  <Weight size={14} />
                  {totalWeight.toFixed(2)} kg
                </div>
              </div>
              <div className="text-right text-emerald-700 font-black uppercase tracking-tight">
                 Subtotal: R$ {subtotal.toFixed(2)}
              </div>
           </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">OBSERVAÇÕES PARA A LOJA <span className="text-slate-300 ml-1 font-bold">(opcional)</span></p>
           <div className="relative">
             <textarea 
               value={notes}
               onChange={e => setNotes(e.target.value.slice(0, 200))}
               placeholder="Por favor, enviar as frutas mais maduras. Obrigada!"
               className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-medium resize-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
             />
             <span className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
               {notes.length}/200
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderView;
