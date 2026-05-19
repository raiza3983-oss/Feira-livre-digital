import React, { useState, useRef } from 'react';
import { FileUp, RefreshCw } from 'lucide-react';
import { cn, compressImage } from '../lib/utils';
import { SafeImage } from './SafeImage';

interface PhotoUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  className?: string;
  type?: 'user' | 'shop' | 'product';
}

export const PhotoUpload = ({ 
  value, 
  onChange, 
  label = "Foto", 
  className = "",
  type = 'shop'
}: PhotoUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Otimiza a imagem para no máximo 800x800 e 70% de qualidade
      const optimizedBase64 = await compressImage(file, 800, 800, 0.7);
      onChange(optimizedBase64);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 flex-shrink-0">
          <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            <SafeImage src={value} type={type} className="w-full h-full object-cover" alt="Preview" />
          </div>
          {isCompressing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <RefreshCw size={20} className="animate-spin text-brand-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressing}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-all flex items-center gap-2"
            >
              <FileUp size={14} /> {value ? 'Trocar Foto' : 'Escolher Foto'}
            </button>
            {value && (
              <button 
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                Remover
              </button>
            )}
          </div>
          <p className="text-[9px] font-medium text-slate-400">
            {isCompressing ? 'Otimizando imagem...' : 'A foto será otimizada automaticamente para melhor performance.'}
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
