import React from 'react';
import { Package, MapPin, Phone, User, Store, Truck, ShoppingBag, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  measure: string;
}

interface Order {
  id: string;
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  ownerName: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  deliveryType: string;
  items: OrderItem[];
  total: number;
  status: 'aguardando confirmação' | 'confirmado' | 'preparando' | 'saiu para entrega' | 'concluído' | 'cancelado';
  createdAt: any;
  storePhone?: string;
}

interface Props {
  order: Order;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  isVendor?: boolean;
}

const statusColors = {
  'aguardando confirmação': 'bg-amber-100 text-amber-700 border-amber-200',
  'confirmado': 'bg-blue-100 text-blue-700 border-blue-200',
  'preparando': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'saiu para entrega': 'bg-purple-100 text-purple-700 border-purple-200',
  'concluído': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'cancelado': 'bg-red-100 text-red-700 border-red-200',
};

function OrderCard({ order, onCancel, onComplete, onDelete, isVendor }: Props) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Header - ID & Status */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</span>
            <span className="text-sm font-black text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
          </div>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            statusColors[order.status] || 'bg-slate-100 text-slate-600'
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
              order.status === 'concluído' ? 'bg-emerald-500' : 
              order.status === 'cancelado' ? 'bg-red-500' : 'bg-current'
            )} />
            {order.status}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm"
              title="Excluir Pedido"
            >
              <Trash2 size={16} />
            </button>
          )}
          <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Geral</p>
                <div className="flex items-center gap-1.5 justify-end mt-1 text-slate-400">
                  <Clock size={10} />
                  <span className="text-[10px] font-bold uppercase">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-600 mt-0.5">R$ {order.total.toFixed(2)}</p>
            </div>
        </div>
      </div>

      {/* Info Sections Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Store & Owner */}
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estabelecimento</h4>
              <p className="font-bold text-slate-900 leading-tight">{order.storeName}</p>
              <p className="text-xs text-slate-500 font-medium">Proprietário: {order.ownerName}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                <MapPin size={12} />
                <span>{order.storeAddress}, {order.storeCity}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <User size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</h4>
              <p className="font-bold text-slate-900 leading-tight">{order.customerName}</p>
              <p className="text-xs text-slate-500 font-medium">{order.customerPhone}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                <Truck size={12} />
                <span>{order.deliveryType === 'delivery' ? order.customerAddress : 'Retirada na Loja'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-slate-50/50 rounded-[28px] p-5 border border-slate-100 flex flex-col">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumo da Compra</h4>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-2 no-scrollbar">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3">
                <div className="min-w-0">
                   <p className="text-xs font-bold text-slate-700 truncate">{item.quantity}x {item.name}</p>
                   <p className="text-[10px] text-slate-400 font-medium">{item.measure} • R$ {item.price.toFixed(2)}/un</p>
                </div>
                <p className="text-xs font-black text-slate-900 whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
            <span className="text-sm font-black text-slate-900">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
            <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                order.deliveryType === 'delivery' ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600"
            )}>
                {order.deliveryType === 'delivery' ? <Truck size={16} /> : <ShoppingBag size={16} />}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {order.deliveryType === 'delivery' ? 'Entrega em Domicílio' : 'Retirada Agendada'}
            </p>
        </div>

        <div className="flex items-center gap-2">
          {order.status !== 'cancelado' && order.status !== 'concluído' && (
            <button 
              onClick={() => onCancel?.(order.id)}
              className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <XCircle size={14} />
              Cancelar
            </button>
          )}

          {isVendor && order.status !== 'concluído' && order.status !== 'cancelado' && (
            <button 
              onClick={() => onComplete?.(order.id)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={14} />
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(OrderCard);
