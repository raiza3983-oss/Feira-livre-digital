import React, { useState } from 'react';
import { Store, ChevronDown } from 'lucide-react';
import { Shop, UserProfile, AppConfig } from '../types';
import { db, Timestamp, collection, addDoc, handleFirestoreError, OperationType } from '../firebase';
import { PageContainer } from '../components/PageContainer';
import { PhotoUpload } from '../components/PhotoUpload';
import { ScheduleManager } from '../components/ScheduleManager';
import { BRAZIL_STATES } from '../constants';
import { cn } from '../lib/utils';

export const CreateShopScreen = ({ 
  user, 
  showNotification, 
  config,
  onComplete 
}: { 
  user: UserProfile | null, 
  showNotification: (m: string, t?: 'success' | 'error') => void,
  config: AppConfig | null,
  onComplete: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Shop>>({
    type: 'feirante',
    deliveryPaymentMethods: ['Pix'],
    pickupPaymentMethods: ['Dinheiro'],
    acceptsDelivery: true,
    acceptsPickup: true,
    openingHours: '07:00',
    closingHours: '17:00',
    isOpen: true,
    workingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!formData.name || !formData.address) {
      showNotification('Por favor, preencha o nome e o endereço.', 'error');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'shops'), {
        ...formData,
        ownerUid: user.uid,
        createdAt: Timestamp.now(),
        isPromoted: false,
        isApproved: false
      });
      showNotification('Sua loja foi enviada para aprovação da administração!');
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'shops');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pb-32">
      <PageContainer screen="create-shop" config={config}>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-12">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[28px] flex items-center justify-center mb-6 shadow-inner">
              <Store size={36} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight mb-3">Criar Minha Loja</h2>
            <p className="text-slate-500 font-medium max-w-sm">Conte-nos um pouco sobre sua barraca ou negócio para começarmos.</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <PhotoUpload 
                value={formData.photoURL || ''} 
                onChange={base64 => setFormData({...formData, photoURL: base64})} 
                label="Identidade Visual da Loja"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome da Loja/Barraca</label>
                <input 
                  type="text" 
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Horta do Zé" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tipo de Negócio</label>
                <div className="relative">
                  <select 
                    value={formData.type || 'feirante'}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium text-slate-600"
                  >
                    <option value="feirante">Feira Livre</option>
                    <option value="atacado">Atacado / Distribuidor</option>
                    <option value="restaurante">Restaurante / Cozinha</option>
                    <option value="mercado">Mercado Livre</option>
                    <option value="barraca">Barraca Livre</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Descrição</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Fale um pouco sobre o que você vende..."
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600 h-32 resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Endereço Completo</label>
              <input 
                type="text" 
                value={formData.address || ''}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Rua, Número, Bairro" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ponto de Referência (Loja, Barraca, Feira, etc)</label>
              <input 
                type="text" 
                value={formData.reference || ''}
                onChange={e => setFormData({...formData, reference: e.target.value})}
                placeholder="Ex: Próximo à banca de flores, Stall 45" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cidade</label>
                <input 
                  type="text" 
                  value={formData.city || ''}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Ex: São Paulo" 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Estado</label>
                <div className="relative">
                  <select 
                    value={formData.state || ''}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold appearance-none text-slate-600"
                  >
                    <option value="">Selecione</option>
                    {BRAZIL_STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Calendário e Horário de Funcionamento</label>
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px]">
                  <ScheduleManager 
                    schedule={formData.schedule}
                    onChange={s => setFormData({...formData, schedule: s})}
                    specialDates={formData.specialDates}
                    onSpecialDatesChange={dates => setFormData({...formData, specialDates: dates})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Métodos de Pagamento (Entrega)</label>
                <div className="flex flex-wrap gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(method => (
                    <button 
                      key={method}
                      onClick={() => {
                        const current = formData.deliveryPaymentMethods || [];
                        const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                        setFormData({...formData, deliveryPaymentMethods: next});
                      }}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        formData.deliveryPaymentMethods?.includes(method) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-400 border-slate-100 hover:border-brand-200"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Métodos de Pagamento (Retirada)</label>
                <div className="flex flex-wrap gap-3">
                  {['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(method => (
                    <button 
                      key={method}
                      onClick={() => {
                        const current = formData.pickupPaymentMethods || [];
                        const next = current.includes(method) ? current.filter(m => m !== method) : [...current, method];
                        setFormData({...formData, pickupPaymentMethods: next});
                      }}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        formData.pickupPaymentMethods?.includes(method) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-6 bg-brand-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Finalizar e Criar Loja'}
            </button>
          </div>
        </div>
        </div>
      </PageContainer>
    </div>
  );
};
