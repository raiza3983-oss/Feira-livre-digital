import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SafeImage } from '../SafeImage';

interface Props {
  storeData: {
    shopType?: string;
    category: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    description: string;
    image: string;
    openingHours?: string;
    closingHours?: string;
    deliveryMethods?: string[];
    pickupMethods?: string[];
  };
  ownerData: {
    name: string;
    phone: string;
    age: string | number;
    city: string;
    state: string;
    gender: string;
    description: string;
    image: string;
  };
}

function CatalogHero({
  storeData,
  ownerData
}: Props) {
  const [fullScreenImage, setFullScreenImage] = useState<{ src: string, type: 'user' | 'shop' | 'product' } | null>(null);

  const ownerLabel = ownerData.gender === 'Feminino' ? 'PROPRIETÁRIA' : 
                     (ownerData.gender === 'Masculino' ? 'PROPRIETÁRIO' : 'PROPRIETÁRIO (A)');

  const getShopTypeLabel = (type?: string) => {
    switch (type) {
      case 'feirante': return 'Feira Livre';
      case 'atacado': return 'Atacado Livre';
      case 'barraca': return 'Barraca Livre';
      case 'mercado': return 'Mercado Livre';
      default: return 'Feira Livre';
    }
  };

  return (
    <div className="w-full mb-5 px-4 pt-6 bg-slate-50">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {/* BLOCO LOJA */}
        <div className="flex gap-3 items-stretch">
          {/* LOJA INFO */}
          <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                Informações da Loja
              </h2>
              <div className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-brand-100">
                {getShopTypeLabel(storeData.shopType)}
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600">
              <p>
                <span className="font-bold text-slate-900 uppercase">Endereço:</span>{' '}
                {storeData.address}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <p>
                  <span className="font-bold text-slate-900 uppercase">Cidade:</span>{' '}
                  {storeData.city}
                </p>
                <p>
                  <span className="font-bold text-slate-900 uppercase">Estado:</span>{' '}
                  {storeData.state}
                </p>
                <p>
                  <span className="font-bold text-slate-900 uppercase">País:</span> Brasil
                </p>
              </div>
              <p>
                <span className="font-bold text-slate-900 uppercase">Contato:</span>{' '}
                {storeData.phone}
              </p>

              {(storeData.openingHours || storeData.closingHours) && (
                <p>
                  <span className="font-bold text-slate-900 uppercase">Horário:</span>{' '}
                  {storeData.openingHours || '--:--'} às {storeData.closingHours || '--:--'}
                </p>
              )}

              {((storeData.deliveryMethods && storeData.deliveryMethods.length > 0) || (storeData.pickupMethods && storeData.pickupMethods.length > 0)) && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 uppercase block">Pagamento:</span>
                  <div className="flex flex-col gap-1">
                    {storeData.deliveryMethods && storeData.deliveryMethods.length > 0 && (
                      <p className="text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Entrega:</span> {storeData.deliveryMethods.join(', ')}
                      </p>
                    )}
                    {storeData.pickupMethods && storeData.pickupMethods.length > 0 && (
                      <p className="text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Retirada:</span> {storeData.pickupMethods.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="leading-relaxed italic text-slate-500 text-[10px]">
                  {storeData.description}
                </p>
              </div>
            </div>
          </div>

          {/* FOTO LOJA */}
          <div 
            className="w-28 bg-white border border-slate-100 rounded-2xl shadow-sm p-2 shrink-0 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setFullScreenImage({ src: storeData.image, type: 'shop' })}
          >
            <SafeImage
              src={storeData.image}
              type="shop"
              className="w-full h-full min-h-[140px] rounded-xl object-cover shadow-inner bg-slate-50"
            />
          </div>
        </div>

        {/* BLOCO PROPRIETÁRIO */}
        <div className="flex gap-3 items-stretch">
          {/* PROPRIETÁRIO INFO */}
          <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                {ownerLabel}
              </h2>
              <div className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                Perfil
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600">
              <p>
                <span className="font-bold text-slate-900 uppercase">Nome:</span>{' '}
                {ownerData.name}
              </p>
              <p>
                <span className="font-bold text-slate-900 uppercase">WhatsApp:</span>{' '}
                {ownerData.phone}
              </p>
              <p>
                <span className="font-bold text-slate-900 uppercase">Idade:</span>{' '}
                {ownerData.age}
              </p>
              <div className="flex gap-3">
                <p>
                  <span className="font-bold text-slate-900 uppercase">Cidade:</span>{' '}
                  {ownerData.city}
                </p>
                <p>
                  <span className="font-bold text-slate-900 uppercase">Estado:</span>{' '}
                  {ownerData.state}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="leading-relaxed italic text-slate-500 text-[10px]">
                  {ownerData.description}
                </p>
              </div>
            </div>
          </div>

          {/* FOTO USUÁRIO */}
          <div 
            className="w-28 bg-white border border-slate-100 rounded-2xl shadow-sm p-2 shrink-0 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setFullScreenImage({ src: ownerData.image, type: 'user' })}
          >
            <SafeImage
              src={ownerData.image}
              type="user"
              className="w-full h-full min-h-[140px] rounded-xl object-cover shadow-inner bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setFullScreenImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setFullScreenImage(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
              >
                <X size={24} />
              </button>
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-w-[95vw] max-h-[80vh]">
                <SafeImage
                  src={fullScreenImage.src}
                  type={fullScreenImage.type}
                  className="w-full h-full object-contain bg-slate-900"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(CatalogHero);
