import React from 'react';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Truck, 
  Store as StoreIcon, 
  Clock, 
  CheckCircle, 
  Package, 
  CreditCard, 
  XCircle,
  Trash2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { SafeImage } from '../SafeImage';
import { cn } from '../../lib/utils';
import { translateStatus, translatePaymentMethod, translateUnit } from '../../services/formatService';

interface SellerOrderCardProps {
  order: any;
  shopPhoto?: string;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onCancel: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
}

const SellerOrderCard = ({ order, shopPhoto, onUpdateStatus, onCancel, onDelete }: SellerOrderCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-700', 
          label: 'RECEBIDO',
          action: { label: 'Aceitar Pedido', nextStatus: 'accepted' }
        };
      case 'accepted':
        return { 
          bg: 'bg-emerald-100', 
          text: 'text-emerald-700', 
          label: 'ACEITO',
          action: { label: 'Aguardando Pagamento', nextStatus: 'pending_payment' }
        };
      case 'pending_payment':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-700', 
          label: 'AGUARDANDO PAGAMENTO',
          action: { label: 'Pagamento Confirmado', nextStatus: 'paid' }
        };
      case 'paid':
        return { 
          bg: 'bg-emerald-100', 
          text: 'text-emerald-700', 
          label: 'PAGAMENTO ACEITO',
          action: { label: 'Preparar Pedido', nextStatus: 'preparing' }
        };
      case 'preparing':
        return { 
          bg: 'bg-orange-100', 
          text: 'text-orange-700', 
          label: 'PREPARANDO',
          action: { 
            label: order.deliveryType === 'delivery' ? 'Saiu para Entrega' : 'Pronto para Retirada', 
            nextStatus: order.deliveryType === 'delivery' ? 'shipped' : 'ready' 
          }
        };
      case 'shipped':
      case 'ready':
        return { 
          bg: 'bg-purple-100', 
          text: 'text-purple-700', 
          label: status === 'shipped' ? 'EM ENTREGA' : 'PRONTO PARA RETIRADA',
          action: { label: 'Concluir Pedido', nextStatus: 'completed' }
        };
      case 'completed':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-700', 
          label: 'CONCLUÍDO',
          action: null
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-700', 
          label: 'CANCELADO',
          action: null
        };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: status, action: null };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      {/* Header Status */}
      <div className="flex items-center justify-between p-6 border-b border-slate-50">
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
          statusConfig.bg,
          statusConfig.text
        )}>
          <Clock size={12} />
          {statusConfig.label}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          #{order.id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Metadata Column (Unified Info) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-6">
              {/* Acceptance Info / Action Card */}
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Ação Sugerida</p>
                {statusConfig.action ? (
                  <button
                    onClick={() => onUpdateStatus(order.id, statusConfig.action!.nextStatus)}
                    className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group"
                  >
                    {statusConfig.action.label}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-1">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pedido Concluído</span>
                  </div>
                )}
              </div>

              {/* Purchase Info (Order ID) */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Informações da Compra</p>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-sm font-black text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 italic block">{createdAt.toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 italic block">{createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Shop Info */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Loja Parceira</p>
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shrink-0 relative">
                    <SafeImage src={order.items && order.items[0]?.photoURL} type="product" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm overflow-hidden">
                       <SafeImage src={shopPhoto || order.shopPhotoURL} type="shop" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 truncate leading-none mb-1 uppercase">{order.shopName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vendedor Parceiro</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Informações do Cliente</p>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <SafeImage src={order.buyerPhotoURL || ''} type="user" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-black text-slate-900 text-sm truncate uppercase">{order.buyerName}</h5>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-600 truncate uppercase">
                        {order.deliveryAddress || 'Retirada na Loja'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "px-3 py-3 rounded-2xl flex flex-col gap-1 items-center justify-center border",
                  order.deliveryType === 'delivery' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                )}>
                  {order.deliveryType === 'delivery' ? <Truck size={16} /> : <StoreIcon size={16} />}
                  <span className="text-[8px] font-black uppercase tracking-widest">{order.deliveryType === 'delivery' ? 'Logística' : 'Retirada'}</span>
                </div>
                <div className="px-3 py-3 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col gap-1 items-center justify-center text-slate-600">
                  <CreditCard size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <button
                  onClick={() => onCancel(order.id)}
                  className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all"
                >
                  Cancelar Pedido
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(order.id)}
                  className="w-12 py-4 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-2xl font-black transition-all flex items-center justify-center border border-slate-100"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Products Column */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Resumos dos Produtos</h5>
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full border border-brand-100 uppercase">
                  {order.items?.length || 0} Itens
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
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Peso/Medida: {item.weightPerUnit || item.weight || 0} {item.unit || ''} • Quantidade: {item.quantity} {item.unit || 'un.'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-300 block uppercase mb-0.5">Subtotal</span>
                      <span className="font-black text-slate-900 text-lg tabular-nums tracking-tighter self-end">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Geral</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Confirmado em {createdAt.toLocaleDateString()} às {createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
    </div>
  );
};

export default React.memo(SellerOrderCard);
