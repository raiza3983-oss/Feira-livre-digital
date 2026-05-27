import React from 'react';
import { motion } from 'motion/react';
import { Share2, ArrowLeft, Download, Info } from 'lucide-react';
import { AppConfig, UserProfile } from '../types';
import { CalculatorScreen } from './CalculatorScreen';

interface FeiraLivreCalculadoraScreenProps {
  config: AppConfig | null;
  user: UserProfile | null;
  onNavigate?: (screen: string) => void;
  handleShare: (data: { title: string; text: string; url: string }) => void;
}

export const FeiraLivreCalculadoraScreen = ({
  config,
  user,
  onNavigate,
  handleShare
}: FeiraLivreCalculadoraScreenProps) => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onNavigate && (
            <button 
              onClick={() => onNavigate('landing')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Feira Livre Calculadora</h2>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mt-1">Multiplique suas vendas no campo e na cidade</p>
          </div>
        </div>
      </div>

      {/* Hero promo area / "Coluna completa" as requested */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-white rounded-[40px] p-8 md:p-12 shadow-xl border border-brand-100 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-shrink-0 relative group">
          <div className="absolute inset-0 bg-brand-500/10 rounded-3xl blur-xl group-hover:scale-110 transition-transform duration-500" />
          <img 
            src="/calculadora_app.png.png" 
            alt="Ícone Feira Livre Calculadora" 
            className="w-32 h-32 md:w-36 md:h-36 object-contain rounded-3xl shadow-md relative z-10 hover:rotate-3 transition-transform cursor-pointer"
          />
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] bg-brand-100/50 px-4 py-1.5 rounded-full border border-brand-200">
              CÁLCULO SEGURO & OFFLINE
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 font-display italic tracking-tight uppercase leading-none">
              FEIRA LIVRE <span className="text-brand-600 block sm:inline">CALCULADORA</span>
            </h3>
          </div>

          <p className="text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Da pra usar sem conexão com Internet, pode usar a vontade pra fazer cálculos e registrar a tela, é a vontade. 
            Coloque o nome do produto, preço e quantidade. Pra da fazer dinheiro e ainda registrar se você puder! 
            <span className="block font-bold text-slate-800 mt-2">Baixe na PlayStore.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            {/* PlayStore Link Button */}
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4.5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 group"
            >
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform text-brand-400" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Baixe na</span>
                <span className="text-base font-bold">PlayStore</span>
              </div>
            </a>

            {/* Share Button */}
            <button 
              onClick={() => handleShare({
                title: 'Feira Livre Calculadora',
                text: 'Baixe agora a Calculadora Feira Livre! Funciona offline e ajuda você a registrar suas vendas e cálculos de produtos frescos. 🇧🇷',
                url: window.location.href
              })}
              className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-900 px-8 py-4.5 rounded-2xl hover:border-brand-500 hover:text-brand-600 transition-all shadow-md active:scale-95"
            >
              <Share2 size={20} className="text-slate-500" />
              <span className="text-sm font-black uppercase tracking-widest text-slate-700">Compartilhar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Live Calculator Tool */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl w-fit border border-slate-200">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulador Interativo Ativo</span>
        </div>
        <div className="bg-white rounded-[40px] shadow-soft border border-slate-100 overflow-hidden">
          <CalculatorScreen config={config} user={user} />
        </div>
      </div>
    </div>
  );
};
