import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, LogIn, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface LoginRequiredViewProps {
  onGoogleLogin: (role: UserRole, loginType?: string) => Promise<void>;
}

export const LoginRequiredView = ({ onGoogleLogin }: LoginRequiredViewProps) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: UserRole, type: string) => {
    setLoading(true);
    try {
      await onGoogleLogin(role, type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[28px] flex items-center justify-center shadow-xl mb-4"
      >
        <Lock size={40} />
      </motion.div>
      <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Acesso Restrito</h2>
      <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
        Para sua segurança e dos produtores, entre com sua conta Google para continuar.
      </p>
      
      <div className="flex flex-col w-full max-w-xs gap-3 pt-4">
        <button 
          onClick={() => handleLogin('client', 'client')}
          disabled={loading}
          className="h-[48px] bg-brand-600 text-white rounded-[14px] text-[16px] font-semibold hover:bg-brand-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          )}
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>
        
        <button 
          onClick={() => handleLogin('client', 'client')}
          disabled={loading}
          className="h-[48px] bg-white text-slate-700 border border-slate-200 rounded-[14px] text-[16px] font-semibold hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
          Criar Cadastro Novo
        </button>
      </div>
    </div>
  );
};
