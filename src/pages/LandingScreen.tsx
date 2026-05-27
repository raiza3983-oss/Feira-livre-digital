import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Truck, 
  Package, 
  MessageSquare, 
  Heart, 
  BarChart, 
  X, 
  User, 
  Tent, 
  Store, 
  ShoppingBag, 
  ShieldCheck, 
  Share2, 
  Plus, 
  Minus 
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { PageContainer } from '../components/PageContainer';
import { UserRole, Screen, AppConfig } from '../types';

interface LandingScreenProps {
  onSelectRole: (role: string) => void;
  onGoogleLogin: (role: UserRole, loginType?: string) => void;
  onNavigate: (screen: Screen) => void;
  loggingInRole: string | null;
  authError: string | null;
  config: AppConfig | null;
  handleShare: (data: { title: string; text: string; url?: string }) => void;
}

export const LandingScreen = ({ 
  onSelectRole, 
  onGoogleLogin,
  onNavigate,
  loggingInRole,
  authError,
  config,
  handleShare
}: LandingScreenProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6 pb-32">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Logo size="3xl" />
    </motion.div>
    
    <AnimatePresence>
      {authError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 w-full max-w-md bg-red-50 border border-red-100 rounded-[24px] p-6 text-center shadow-lg shadow-red-500/5 overflow-hidden"
        >
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h4 className="text-red-900 font-black text-xs uppercase tracking-[0.2em] mb-3">Erro na Autenticação</h4>
          <p className="text-red-700 text-xs mb-6 leading-relaxed font-bold">
            {authError === 'network-error' 
              ? 'Houve uma falha de comunicação. Isso geralmente ocorre quando os cookies de terceiros estão bloqueados no navegador ou o domínio não está autorizado.' 
              : 'Não foi possível completar o login. Por favor, tente novamente usando o link abaixo.'}
          </p>
          <a 
            href={window.location.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-95"
          >
            Abrir em nova aba
          </a>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center mb-12"
    >
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 font-display tracking-tight">Feira Livre 🇧🇷</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto text-balance leading-relaxed">
          A plataforma que conecta você aos melhores produtos frescos da sua região.
        </p>
      </div>
    </motion.div>

    <div className="w-full max-w-6xl">
      <PageContainer screen="landing" config={config}>
        {/* Sou Cliente */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <User size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Sou Cliente</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            Encontre as melhores barracas, produtos frescos e ofertas exclusivas.
          </p>
          
          <div className="w-full grid grid-cols-1 gap-3 relative z-10">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrar ou Criar conta</h4>
              <button 
                onClick={() => onGoogleLogin('client', 'client')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Entrar com Google
              </button>
              <button 
                onClick={() => onGoogleLogin('client', 'client')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Criar Cadastro Novo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feira Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-brand-600 rounded-[32px] p-8 shadow-xl shadow-brand-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Tent size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Feira Livre</h3>
          <p className="text-brand-100 text-xs mb-8 leading-relaxed">
            Entre na Feira Livre e destaque seus melhores produtos para mais clientes.
          </p>
          
          <div className="w-full space-y-3 relative z-10 text-slate-900">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_feirante')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-brand-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-brand-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_feirante')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-brand-500/20 border border-brand-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Barraca Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-emerald-600 rounded-[32px] p-8 shadow-xl shadow-emerald-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Store size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Barraca Livre</h3>
          <p className="text-emerald-100 text-xs mb-8 leading-relaxed">
            Crie sua cuenta na Barraca Livre e gerencie seu catálogo de produtos com praticidade.
          </p>
          
          <div className="w-full space-y-3 relative z-10 text-slate-900">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_barraca')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-emerald-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-emerald-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_barraca')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-emerald-500/20 border border-emerald-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Mercado Livre */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-indigo-600 rounded-[32px] p-8 shadow-xl shadow-indigo-100 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Mercado Livre</h3>
          <p className="text-indigo-100 text-xs mb-8 leading-relaxed">
            Mercado Livre: gestão inteligente de produtos, catálogo e vendas em uma única plataforma.
          </p>
          
          <div className="w-full space-y-3 relative z-10 text-slate-900">
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_mercado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-white text-indigo-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Entrar com Google
            </button>
            <button 
              onClick={() => onGoogleLogin('vendor', 'vendor_mercado')} 
              disabled={!!loggingInRole}
              className="w-full py-3.5 px-6 bg-indigo-500/20 border border-indigo-400/30 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
              Criar Cadastro Novo
            </button>
          </div>
        </motion.div>

        {/* Sou Atacado */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <Truck size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Atacado Livre</h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            Entre no Atacado Livre e potencialize suas vendas em grande escala.
          </p>
          
          <div className="w-full grid grid-cols-1 gap-3 relative z-10">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entrar ou Criar conta</h4>
              <button 
                onClick={() => onGoogleLogin('vendor', 'vendor_atacado')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Entrar com Google
              </button>
              <button 
                onClick={() => onGoogleLogin('vendor', 'vendor_atacado')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Criar Cadastro Novo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Administração */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="group bg-slate-900 rounded-[32px] p-8 shadow-soft border border-slate-800 flex flex-col items-center text-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">Administração</h3>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            Gerencie usuários, produtos e categorias com total controle em um único painel administrativo.
          </p>
          
          <div className="w-full grid grid-cols-1 gap-3 relative z-10">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Entrar ou Criar conta</h4>
              <button 
                onClick={() => onGoogleLogin('state_admin', 'admin')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-white text-slate-900 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Entrar com Google
              </button>
              <button 
                onClick={() => onGoogleLogin('state_admin', 'admin')} 
                disabled={!!loggingInRole}
                className="w-full py-3.5 px-6 bg-slate-800 border-2 border-slate-700 text-white rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Criar Cadastro Novo
              </button>
            </div>
          </div>
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-6">Acesso Restrito</span>
        </motion.div>
      </PageContainer>
    </div>

    {/* Seção FEIRA LIVRE CALCULADORA */}
    <motion.div 
      id="calc-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-4xl mt-32 mb-16 px-6"
    >
      <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="w-full p-10 md:p-14 space-y-8 text-center flex flex-col items-center">
            <div className="space-y-3 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <img 
                  src="/calculadora_app.png.png" 
                  alt="Logo" 
                  className="w-12 h-12 object-contain rounded-xl shadow-sm"
                />
                <span className="text-[11px] font-black text-brand-500 uppercase tracking-[0.3em] bg-brand-50 px-4 py-1.5 rounded-full border border-brand-100">
                  BAIXE AGORA!
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 font-display italic tracking-tight uppercase leading-none text-center">
                FEIRA LIVRE <span className="text-brand-600 block">CALCULADORA</span>
              </h3>
            </div>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Da pra usar sem conexão com Internet, pode usar a vontade pra fazer cálculos e registrar a tela, é a vontade. 
              Coloque o nome do produto, preço e quantidade. Pra da fazer dinheiro e ainda registrar se você puder! 
              Baixe na PlayStore.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-3xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Disponível na</span>
                  <span className="text-xl font-bold">Google Play</span>
                </div>
              </button>

              <button 
                onClick={() => handleShare({
                  title: 'Feira Livre Calculadora',
                  text: 'Baixe agora a Calculadora Feira Livre! Funciona offline e ajuda você a registrar suas vendas e cálculos de produtos frescos. 🇧🇷',
                  url: 'https://ais-pre-hi2uw6gyumtv3zgsf6dwn2-260480316891.us-east1.run.app' // URL do app
                })}
                className="flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-900 px-8 py-5 rounded-3xl hover:border-brand-500 hover:text-brand-600 transition-all shadow-lg active:scale-95"
              >
                <Share2 size={24} />
                <span className="text-sm font-black uppercase tracking-widest">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <footer className="mt-20 flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 opacity-60">
        <button onClick={() => {
          const el = document.getElementById('calc-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} className="text-[10px] font-bold uppercase tracking-widest hover:text-brand-600 transition-colors cursor-pointer">Feira Livre Calculadora</button>
        <span className="text-slate-300">•</span>
        <button onClick={() => {
          handleShare({
            title: 'Aplicativo Feira Livre',
            text: 'Conecte-se com produtores, feirantes e atacadistas de todo o Brasil no Aplicativo Feira Livre! 🇧🇷🥦🍎',
            url: window.location.href
          });
        }} className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-1.5 hover:scale-110 transition-all cursor-pointer">
          <Share2 size={12} /> Compartilhar App
        </button>
      </div>
      <p className="text-slate-400 text-[10px] font-medium tracking-wide uppercase tracking-[0.2em]">
        © 2026 FEIRA LIVRE • TODOS OS DIREITOS RESERVADOS
      </p>
    </footer>
  </div>
);
