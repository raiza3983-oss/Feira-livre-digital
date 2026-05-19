import React from 'react';
import { Package, ChevronLeft } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import CheckoutSummary from '../components/orders/CheckoutSummary';
import { Cart } from '../types';

interface Props {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  onNavigate: (s: any) => void;
  onFinalize: () => void;
}

function OrdersPage({ cart, setCart, onNavigate, onFinalize }: Props) {
  if (!cart || cart.items.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 font-black uppercase tracking-tighter text-3xl">
            ?
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-display">Seu Carrinho está Vazio</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-[240px] font-medium">
            Que tal escolher alguns produtos frescos agora mesmo?
          </p>
          <button 
            onClick={() => onNavigate('search')}
            className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
          >
            Começar a Comprar
          </button>
        </div>
      </PageContainer>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const formattedCart = cart.items.map(item => ({
    id: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    measure: item.product.unit
  }));

  const storeData = {
    name: cart.shopName,
    address: cart.shopAddress || '',
    city: cart.shopCity || '',
    state: cart.shopState || ''
  };

  return (
    <PageContainer>
      <div className="p-4 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate('search')}
            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest leading-none">Checkout</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Resumo do Pedido</p>
             </div>
             <div className="p-3 bg-amber-700 text-white rounded-2xl shadow-lg shadow-amber-700/20">
                <Package size={24} />
             </div>
          </div>
        </div>

        <CheckoutSummary 
          cart={formattedCart}
          total={subtotal}
          storeData={storeData}
          deliveryType={cart.deliveryType || 'pickup'}
          paymentMethod={cart.paymentMethod || 'Pix'}
          onUpdateDeliveryType={(type) => setCart({ ...cart, deliveryType: type })}
          onUpdatePaymentMethod={(method) => setCart({ ...cart, paymentMethod: method })}
          onFinish={onFinalize}
        />

        <div className="mt-8 flex justify-center">
            <button 
                onClick={() => onNavigate('search')}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-4 px-8 border-2 border-slate-100 rounded-2xl hover:border-red-100 hover:text-red-500 transition-all"
            >
                Cancelar Operação
            </button>
        </div>
      </div>
    </PageContainer>
  );
}


export default React.memo(OrdersPage);
