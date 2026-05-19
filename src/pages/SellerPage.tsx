import React from 'react';
import { motion } from 'motion/react';
import { Store, User, Smartphone, MapPin, Save, CreditCard } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import { Shop, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface Props {
  shop: Shop | null;
  user: UserProfile | null;
  onSave: (data: Partial<Shop>) => void;
}

function SellerPage({ shop, user, onSave }: Props) {
  const [formData, setFormData] = React.useState<Partial<Shop>>(shop || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <PageContainer>
      <div className="p-4 pb-32 max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/20">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Perfil Profissional</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua vitrine para o mundo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Briefcase size={12} /> Nome da Minha Loja
                </label>
                <input 
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-bold focus:border-brand-300 outline-none transition-all"
                  placeholder="Ex: Frutas do João"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Smartphone size={12} /> WhatsApp para Vendas
                </label>
                <input 
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                  className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-bold focus:border-brand-300 outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={12} /> Endereço Principal / Ponto de Venda
                </label>
                <textarea 
                  value={formData.address || ''}
                  onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-bold focus:border-brand-300 outline-none transition-all min-h-[100px] resize-none"
                  placeholder="Rua, Número, Bairro..."
                />
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CreditCard size={12} /> Métodos de Pagamento (Entrega)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Pix'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        const current = formData.deliveryPaymentMethods || [];
                        const next = current.includes(method) 
                          ? current.filter(m => m !== method)
                          : [...current, method];
                        setFormData(p => ({ ...p, deliveryPaymentMethods: next }));
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all",
                        (formData.deliveryPaymentMethods || []).includes(method)
                          ? "bg-brand-50 border-brand-200 text-brand-600 shadow-sm"
                          : "bg-white border-slate-100 text-slate-400"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Store size={12} /> Métodos de Pagamento (Retirada)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        const current = formData.pickupPaymentMethods || [];
                        const next = current.includes(method) 
                          ? current.filter(m => m !== method)
                          : [...current, method];
                        setFormData(p => ({ ...p, pickupPaymentMethods: next }));
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all",
                        (formData.pickupPaymentMethods || []).includes(method)
                          ? "bg-brand-50 border-brand-200 text-brand-600 shadow-sm"
                          : "bg-white border-slate-100 text-slate-400"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>Salvar Alterações do Perfil</span>
          </button>
        </form>
      </div>
    </PageContainer>
  );
}

import { Briefcase } from 'lucide-react';

export default React.memo(SellerPage);
