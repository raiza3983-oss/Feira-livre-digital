import React, { useState, useEffect } from 'react';
import { SafeImage } from './SafeImage';
import { 
  ShoppingBag, 
  Store, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCw, 
  Loader2,
  Info,
  ClipboardList,
  Package,
  Truck,
  CreditCard,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, sanitizeForFirestore } from '../lib/utils';
import NewOrderView from './orders/NewOrderView';
import OrderDetailView from './orders/OrderDetailView';
import { UserProfile, Shop, Screen, UserRole, Order } from '../types';
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc, 
  addDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { translateStatus, translateUnit } from '../services/formatService';

interface Props {
  user: UserProfile | null;
  myShop: Shop | null;
  cart: any;
  setCart: any;
  showNotification: (m: string, t?: 'success' | 'error') => void;
  showConfirm: (t: string, m: string, c: () => void) => void;
  onNavigate: (screen: Screen) => void;
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>;
  setSelectedShop: (shop: Shop | null) => void;
}

const formatDate = (date: any) => {
  if (!date) return '';
  try {
    if (typeof date.toDate === 'function') return date.toDate().toLocaleDateString();
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    if (typeof date === 'string') return new Date(date).toLocaleDateString();
  } catch (e) {
    return String(date);
  }
  return String(date);
};

const OrdersScreen = ({ 
  user, 
  cart, 
  setCart, 
  onNavigate, 
  showNotification,
  showConfirm,
  onGoogleLogin,
  setSelectedShop 
}: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFinishingOrder, setIsFinishingOrder] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [view, setView] = useState<'list' | 'checkout' | 'detail'>('list');
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (cart && cart.items?.length > 0 && view !== 'detail') {
      setView('checkout');
    } else if (!cart && view === 'checkout') {
      setView('list');
    }
  }, [cart]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'orders'),
      where('buyerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCancelOrder = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;
    
    showConfirm(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.',
      async () => {
        setProcessingOrders(prev => new Set(prev).add(orderId));
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, {
            status: 'cancelled',
            updatedAt: Timestamp.now()
          });
          showNotification('Pedido cancelado com sucesso.', 'success');
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, 'orders');
        } finally {
          setProcessingOrders(prev => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }
      }
    );
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;

    showConfirm(
      'Excluir Pedido',
      'Tem certeza que deseja excluir permanentemente este pedido do seu histórico? Esta ação não pode ser desfeita.',
      async () => {
        setProcessingOrders(prev => new Set(prev).add(orderId));
        try {
          const orderRef = doc(db, 'orders', orderId);
          await deleteDoc(orderRef);
          showNotification('Pedido excluído com sucesso.', 'success');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, 'orders');
        } finally {
          setProcessingOrders(prev => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }
      }
    );
  };

  const handleReorder = async (order: any) => {
    setReorderingId(order.id);
    try {
      const shopRef = doc(db, 'shops', order.shopId);
      const shopSnap = await getDoc(shopRef);
      
      if (!shopSnap.exists()) {
        showNotification('Esta loja não está mais disponível.', 'error');
        return;
      }

      const shopData = shopSnap.data() as Shop;
      
      const newCartItems = order.items.map((item: any) => ({
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          unit: item.unit,
          weightPerUnit: item.weightPerUnit
        },
        quantity: item.quantity
      }));

      setCart({
        shopId: order.shopId,
        shopName: order.shopName,
        shopOwnerUid: order.shopOwnerUid,
        shopWhatsapp: shopData.whatsapp || '',
        shopAddress: shopData.address || '',
        shopCity: shopData.city || '',
        shopState: shopData.state || '',
        items: newCartItems,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress
      });

      showNotification('Itens adicionados ao seu carrinho!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao repetir pedido.', 'error');
    } finally {
      setReorderingId(null);
    }
  };

  const handleFinalizeOrder = async (orderOptions: any) => {
    if (!cart || isFinishingOrder) return;
    
    if (!user) {
      showNotification('Por favor, faça login para enviar seu pedido.', 'success');
      onGoogleLogin('client');
      return;
    }
    
    if (orderOptions.deliveryType === 'delivery' && !user.address && !cart.deliveryAddress) {
      showNotification('Por favor, informe seu endereço de entrega no perfil.', 'error');
      onNavigate('profile');
      return;
    }

    setIsFinishingOrder(true);
    try {
      const orderData = {
        buyerUid: user.uid,
        buyerName: user.displayName,
        buyerPhotoURL: user.photoURL,
        buyerPhone: user.phone || '',
        buyerEmail: user.email || '',
        buyerCity: user.city || '',
        buyerState: user.state || '',
        shopId: cart.shopId,
        shopName: cart.shopName,
        shopOwnerUid: cart.shopOwnerUid || '',
        shopPhotoURL: cart.shopPhotoURL,
        items: cart.items.map((item: any) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit,
          weightPerUnit: item.product.weightPerUnit || 0,
          photoURL: item.product.photoURL || ''
        })),
        totalValue: orderOptions.total,
        status: 'pending',
        paymentMethod: orderOptions.paymentMethod,
        deliveryType: orderOptions.deliveryType,
        deliveryAddress: orderOptions.deliveryType === 'delivery' ? (cart.deliveryAddress || user.address || '') : '',
        notes: orderOptions.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        orderType: 'order'
      };

      const orderRef = await addDoc(collection(db, 'orders'), sanitizeForFirestore(orderData));
      
      const chatMessageBase = {
        senderUid: user.uid,
        senderName: user.displayName || 'Usuário',
        senderPhotoURL: user.photoURL || '',
        receiverUid: cart.shopOwnerUid || '',
        shopName: cart.shopName,
        metadata: {
          shopId: cart.shopId,
          shopName: cart.shopName,
          shopOwnerUid: cart.shopOwnerUid || '',
          orderId: orderRef.id
        },
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'chatMessages'), {
        ...chatMessageBase,
        text: `🛍️ Novo pedido realizado! #${orderRef.id.slice(-6).toUpperCase()}\nValor: R$ ${orderData.totalValue.toFixed(2)}\nStatus: Aguardando confirmação da loja.`,
      });

      if (orderOptions.notes) {
        await addDoc(collection(db, 'chatMessages'), {
          ...chatMessageBase,
          text: `📝 Mensagem do cliente:\n${orderOptions.notes}`,
        });
      }

      setCart(null);
      setView('list');
      showNotification('Pedido finalizado com sucesso!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setIsFinishingOrder(false);
    }
  };

  if (view === 'checkout' && cart) {
    return (
      <NewOrderView 
        cart={cart}
        user={user}
        onCancel={() => {
           setCart(null);
           setView('list');
        }}
        onSend={handleFinalizeOrder}
        onNavigateToProfile={() => onNavigate('profile')}
        isLoading={isFinishingOrder}
      />
    );
  }

  if (view === 'detail' && selectedOrder) {
    return (
      <OrderDetailView 
        order={selectedOrder}
        user={user}
        onBack={() => setView('list')}
      />
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-32 bg-white min-h-screen relative">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight mb-2 uppercase">Meus Pedidos</h2>
          <p className="text-slate-500 font-medium">Acompanhe suas compras e interaja com as lojas.</p>
          
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6 w-fit overflow-x-auto max-w-full no-scrollbar">
            {['all', 'pending', 'accepted', 'pending_payment', 'paid', 'preparing', 'ready', 'shipped', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-white text-brand-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {status === 'all' ? 'Todos' : translateStatus(status)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white px-8 py-5 rounded-[32px] border border-slate-100 shadow-soft flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Geral Gasto</span>
            <span className="text-2xl font-black text-brand-600 font-display leading-none">
              R$ {orders.reduce((sum, o) => sum + (o.totalValue || 0), 0).toFixed(2)}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos</span>
            <span className="text-2xl font-black text-slate-900 font-display leading-none">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          {orders
            .filter(o => statusFilter === 'all' || o.status === statusFilter)
            .map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] shadow-soft border border-slate-100 overflow-hidden group hover:border-brand-100 transition-all mb-6 cursor-pointer"
                onClick={() => {
                   setSelectedOrder(order);
                   setView('detail');
                }}
              >
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Simplified Metadata Column (Unified Info) */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6 flex flex-col h-full">
                        {/* Acceptance Card / Próximo Passo */}
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Próximo Passo</p>
                          <div className="flex items-center gap-3 px-1">
                            {order.status === 'completed' ? (
                              <CheckCircle size={18} className="text-emerald-500" />
                            ) : order.status === 'cancelled' ? (
                              <XCircle size={18} className="text-red-500" />
                            ) : (
                              <Clock size={18} className="text-amber-500 animate-pulse" />
                            )}
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                              {order.status === 'pending' ? 'Aguardando aceitação da loja' : 
                               order.status === 'accepted' ? 'Loja aceitou seu pedido!' :
                               order.status === 'pending_payment' ? 'Aguardando pagamento' :
                               order.status === 'paid' ? 'Pagamento confirmado' :
                               order.status === 'preparing' ? 'Preparando seu pedido' :
                               order.status === 'ready' ? 'Pedido pronto!' :
                               order.status === 'shipped' ? 'Pedido enviado!' :
                               order.status === 'completed' ? 'Pedido entregue' :
                               'Pedido cancelado'}
                            </span>
                          </div>
                        </div>

                        {/* Unified Information (Purchase, Client, Shop) */}
                        <div className="space-y-6 flex-1">
                          <div className="flex items-start gap-4">
                             <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center shadow-sm relative">
                                <SafeImage src={order.items && order.items[0]?.photoURL} type="product" className="w-full h-full object-cover" />
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center shadow-md">
                                   <SafeImage src={order.shopPhotoURL} type="shop" className="w-full h-full object-cover" />
                                </div>
                             </div>
                             <div className="flex-1 min-w-0 pt-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Resumo da Compra</p>
                                <h4 className="text-xs font-black text-slate-900 uppercase truncate">#{order.id.slice(-6).toUpperCase()} • R$ {order.totalValue?.toFixed(2)}</h4>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{order.paymentMethod} • {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                             </div>
                          </div>

                          {/* Client Info */}
                            <div className="flex items-start gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                                  <SafeImage src={order.buyerPhotoURL} type="user" className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cliente</p>
                                  <h4 className="text-xs font-black text-slate-900 uppercase truncate">{order.buyerName}</h4>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 truncate">{order.deliveryAddress || 'Retirada na loja'}</p>
                               </div>
                            </div>

                            {/* Shop Info */}
                            <div className="flex items-start gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                                  <SafeImage src={order.shopPhotoURL} type="shop" className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Loja</p>
                                  <h4 className="text-xs font-black text-slate-900 uppercase truncate">{order.shopName}</h4>
                               </div>
                            </div>
                        </div>

                         <div className="flex gap-2 pt-4 border-t border-slate-200">
                           {order.status === 'pending' && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleCancelOrder(order.id);
                               }}
                               disabled={processingOrders.has(order.id)}
                               className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-[9px] font-black uppercase tracking-widest border border-red-100 disabled:opacity-50"
                             >
                               {processingOrders.has(order.id) ? 'Processando...' : 'Cancelar'}
                             </button>
                           )}
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleReorder(order);
                             }}
                             disabled={reorderingId === order.id || processingOrders.has(order.id)}
                             className="flex-1 py-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-brand-100 disabled:opacity-50"
                           >
                             {reorderingId === order.id ? <Loader2 size={12} className="animate-spin inline mr-1" /> : <RefreshCw size={12} className="inline mr-1" />}
                             Repetir
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteOrder(order.id);
                             }}
                             disabled={processingOrders.has(order.id)}
                             className="w-12 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100 disabled:opacity-50"
                             title="Excluir Pedido"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    </div>

                    {/* Products Column */}
                    <div className="lg:col-span-7 flex flex-col">
                      <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 flex flex-col h-full">
                         <div className="flex items-center justify-between mb-8">
                           <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Resumos dos Produtos</h5>
                           <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full border border-brand-100 uppercase">
                             {(order.items?.length || 0)} PRODUTOS
                           </span>
                         </div>

                         <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] no-scrollbar pr-2 mb-8">
                           {order.items?.map((item: any, idx: number) => (
                             <div key={idx} className="flex justify-between items-center group/item p-4 bg-white rounded-2xl border border-slate-100 transition-all hover:border-brand-200">
                               <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative shrink-0">
                                   <SafeImage src={item.photoURL} type="product" className="w-full h-full object-cover" />
                                   <div className="absolute top-0 left-0 bg-brand-600 text-white text-[8px] font-black px-2 py-1 rounded-br-lg shadow-lg">
                                     {item.quantity}x
                                   </div>
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-black text-slate-900 text-sm uppercase leading-none mb-1">{item.name}</span>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                     {translateUnit(item.unit || 'un').toLowerCase()} {item.weightPerUnit > 0 && `• ${item.weightPerUnit}${item.unit === 'kg' ? 'kg' : item.unit === 'gram' ? 'g' : ''}`}
                                   </span>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <span className="text-[9px] font-black text-slate-300 block uppercase mb-0.5">R$ {item.price.toFixed(2)} un.</span>
                                 <span className="font-black text-slate-900 text-lg tabular-nums tracking-tighter">R$ {(item.price * item.quantity).toFixed(2)}</span>
                               </div>
                             </div>
                           ))}
                         </div>

                         <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                           <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Valor Total Geral</p>
                             <div className="flex items-center gap-2">
                               <TrendingUp size={14} className="text-emerald-500" />
                               <p className="text-[10px] font-bold text-slate-400 uppercase italic">Realizado em {formatDate(order.createdAt)} às {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''} </p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-4xl font-black text-emerald-600 font-display tracking-tighter leading-none">
                               R$ {order.totalValue?.toFixed(2)}
                             </p>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          {orders.filter(o => statusFilter === 'all' || o.status === statusFilter).length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <ShoppingBag size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Nenhum pedido nesta categoria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrdersScreen);
