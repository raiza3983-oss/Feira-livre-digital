import React, { useState } from 'react';
import { 
  Menu, X, Home, Calculator, Info, ShieldCheck, 
  FileText, Briefcase, MessageSquare, User, LogOut,
  ChevronRight, ChevronDown, Truck, Heart, Bell, Package, BarChart, Store, Smartphone, Check, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { SafeImage } from './SafeImage';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface AndroidTopAppBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  user: any;
  onLogout: () => void;
  newAdminNotificationsCount?: number;
  newOrdersCount?: number;
  onGoogleLogin?: (role: any, loginType?: string) => Promise<void>;
}

export const AndroidTopAppBar: React.FC<AndroidTopAppBarProps> = ({
  currentScreen,
  onNavigate,
  user,
  onLogout,
  newAdminNotificationsCount = 0,
  newOrdersCount = 0,
  onGoogleLogin
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Opções de tipos de cadastro (Material Design 3 - Com coerência visual e ícones limpos)
  const registerOptions = [
    { id: 'cliente', label: 'Cliente', icon: User, role: 'client', loginType: 'client', color: 'bg-blue-50 border-blue-100 hover:border-blue-300', textCol: 'text-blue-700', activeBg: 'bg-blue-600 text-white border-blue-600', description: 'Consumidor final e compras' },
    { id: 'feira-livre', label: 'Feira Livre', icon: Store, role: 'vendor', loginType: 'vendor_feirante', color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300', textCol: 'text-emerald-700', activeBg: 'bg-emerald-600 text-white border-emerald-600', description: 'Feirantes e produtores locais' },
    { id: 'barraca-livre', label: 'Barraca Livre', icon: Store, role: 'vendor', loginType: 'vendor_barraca', color: 'bg-amber-50 border-amber-100 hover:border-amber-300', textCol: 'text-amber-700', activeBg: 'bg-amber-600 text-white border-amber-600', description: 'Barracas físicas e hortifrútis' },
    { id: 'mercado-livre', label: 'Mercado Livre', icon: Store, role: 'vendor', loginType: 'vendor_mercado', color: 'bg-cyan-50 border-cyan-100 hover:border-cyan-300', textCol: 'text-cyan-700', activeBg: 'bg-cyan-600 text-white border-cyan-600', description: 'Comércio, quitandas e mercearias' },
    { id: 'atacado-livre', label: 'Atacado Livre', icon: Truck, role: 'vendor', loginType: 'vendor_atacado', color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300', textCol: 'text-indigo-700', activeBg: 'bg-indigo-600 text-white border-indigo-600', description: 'Grandes fardos e distribuidores' },
    { id: 'administracao', label: 'Administração', icon: ShieldCheck, role: 'state_admin', loginType: 'admin', color: 'bg-rose-50 border-rose-100 hover:border-rose-300', textCol: 'text-rose-700', activeBg: 'bg-rose-600 text-white border-rose-600', description: 'Gestão geral e moderação' }
  ];

  // Links principais obrigatórios para todos os usuários
  const mainLinks = [
    { id: 'landing' as Screen, label: 'Início', icon: Home, path: '/inicio' },
    { id: 'feira-livre-calculadora' as Screen, label: 'Calculadora', icon: Calculator, path: '/calculadora' },
    { id: 'about' as Screen, label: 'Sobre', icon: Info, path: '/sobre' },
    { id: 'privacy' as Screen, label: 'Política de Privacidade', icon: ShieldCheck, path: '/privacidade' },
    { id: 'terms' as Screen, label: 'Termos de Uso', icon: FileText, path: '/termos-de-uso' },
    { id: 'careers' as Screen, label: 'Trabalhe Conosco', icon: Briefcase, path: '/trabalhe-conosco' },
    { id: 'contact' as Screen, label: 'Suporte', icon: MessageSquare, path: '/suporte' }
  ];

  // Links adicionais da conta (para usuários cadastrados)
  const accountLinks = [
    { id: 'search' as Screen, label: 'Buscar Feirantes', icon: User, path: '/busca' },
    { id: 'wholesale' as Screen, label: 'Atacado Livre', icon: Truck, path: '/atacado' },
    { id: 'orders' as Screen, label: 'Meus Pedidos', icon: Package, path: '/pedidos' },
    { id: 'chats' as Screen, label: 'Conversas', icon: MessageSquare, path: '/conversas' },
    { id: 'saved' as Screen, label: 'Favoritos', icon: Heart, path: '/salvos' }
  ];

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleLinkClick = (e: React.MouseEvent, screenId: Screen) => {
    e.preventDefault();
    setIsDrawerOpen(false);
    onNavigate(screenId);
  };

  const handleOptionSelect = (id: string) => {
    setSelectedOption(id === selectedOption ? null : id);
  };

  const handleProceedAccess = async () => {
    if (!selectedOption) return;
    
    const option = registerOptions.find(o => o.id === selectedOption);
    if (!option) return;

    setIsProfileMenuOpen(false);

    // Save pending role variables in localStorage for auth redirects
    localStorage.setItem('pending_google_login_role', option.role);
    localStorage.setItem('pending_login_type', option.loginType);

    if (user) {
      if (option.role === 'state_admin' || option.role === 'admin' || user.role === 'state_admin') {
        onNavigate('admin-dashboard');
      } else if (option.loginType === 'vendor_atacado') {
        onNavigate('wholesale');
      } else if (option.role === 'vendor') {
        onNavigate('shop-management');
      } else {
        onNavigate('profile');
      }
    } else {
      if (onGoogleLogin) {
        try {
          await onGoogleLogin(option.role as any, option.loginType);
        } catch (err) {
          console.error('Google login error with role selection:', err);
        }
      } else {
        onNavigate('profile');
      }
    }
  };

  return (
    <>
      {/* Top Bar Bar Layout (64px, White, 16px Rounded, Soft Shadow, Material Design 3) */}
      <div className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto pointer-events-none font-sans">
        <div className="w-full bg-white/95 backdrop-blur-md h-16 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center justify-between px-4 pointer-events-auto transition-all duration-300">
          
          {/* Esquerda: Hambúrguer + Logo + Informações */}
          <div className="flex items-center gap-3">
            <button 
              id="android_menu_toggle_btn"
              onClick={toggleDrawer}
              className="w-11 h-11 flex items-center justify-center text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
              aria-label="Abrir menu lateral"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => handleLinkClick(e, 'landing')}>
              <Logo size="sm" className="w-8 h-8 object-contain" />
              <div className="flex flex-col leading-tight select-none">
                <span className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
                  Feira Livre
                  <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 sm:scale-100">
                    BR
                  </span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-medium text-slate-500 tracking-wide font-sans mt-0.5 hidden sm:inline">
                  Conectando o Campo à Mesa
                </span>
              </div>
            </div>
          </div>

          {/* Direita: Avatar do Usuário */}
          <div className="flex items-center gap-2 relative">
            {/* Quick action buttons for registered users in header on larger devices */}
            {user && (
              <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100/50 mr-2">
                <button 
                  onClick={() => onNavigate('feira-livre-calculadora')} 
                  className={cn("p-2 text-slate-500 hover:text-brand-600 hover:bg-white rounded-lg transition-all", currentScreen === 'feira-livre-calculadora' && "text-brand-600 bg-white shadow-sm")} 
                  title="Calculadora"
                >
                  <Calculator size={18} />
                </button>
                <button 
                  onClick={() => onNavigate('saved')} 
                  className={cn("p-2 text-slate-500 hover:text-brand-600 hover:bg-white rounded-lg transition-all", currentScreen === 'saved' && "text-red-500 bg-white shadow-sm")} 
                  title="Salvos"
                >
                  <Heart size={18} fill={currentScreen === 'saved' ? "currentColor" : "none"} />
                </button>
              </div>
            )}

            {user ? (
              <button 
                id="header_avatar_btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                className="flex items-center gap-2.5 p-1 pr-3 hover:bg-slate-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-slate-100"
              >
                <SafeImage 
                  src={user.photoURL} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm" 
                  alt={user.displayName || 'Usuário'} 
                />
                <div className="hidden lg:flex flex-col items-start leading-tight text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 font-sans">Conectado</span>
                  <span className="text-xs font-black text-slate-700 font-sans">{user.displayName?.split(' ')[0] || 'Perfil'}</span>
                </div>
              </button>
            ) : (
              <button 
                id="header_guest_login_btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 h-10 px-3 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-brand-600 border border-slate-100 font-bold text-xs font-sans transition-all"
              >
                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <User size={14} />
                </div>
                <span>Entrar</span>
              </button>
            )}

            {/* Menu Dropdown de Seleção de Cadastro (Acoplado à Barra de Navegação) */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop invisível para fechar o menu ao clicar fora */}
                  <div 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="fixed inset-0 z-[9950] bg-transparent"
                  />

                  {/* Dropdown Card Flutuante */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 210 }}
                    className="absolute right-0 top-14 z-[9960] w-[320px] sm:w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden font-sans flex flex-col"
                  >
                    {user ? (
                      /* MENU DE PERFIL PARA USUÁRIO CADASTRADO */
                      <>
                        {/* Header com a foto do usuário */}
                        <div className="p-6 bg-gradient-to-b from-slate-50 to-white flex flex-col items-center text-center gap-4 relative">
                          <button 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                            aria-label="Fechar"
                          >
                            <X size={14} />
                          </button>

                          {/* Foto de Perfil com botão/ícone no canto inferior direito */}
                          <div className="relative group cursor-pointer" onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigate('profile');
                          }}>
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md relative">
                              <SafeImage 
                                src={user.photoURL} 
                                className="w-full h-full object-cover" 
                                alt={user.displayName || 'Usuário'} 
                              />
                              {/* Efeito hover de visualização */}
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] text-white font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md">Ver</span>
                              </div>
                            </div>
                            
                            {/* Botão de Perfil na Foto */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsProfileMenuOpen(false);
                                onNavigate('profile');
                              }}
                              className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all hover:scale-115 active:scale-95"
                              title="Ver Perfil"
                            >
                              <User size={12} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="mt-1">
                            <h4 className="font-black text-slate-800 text-base leading-tight">{user.displayName}</h4>
                            <p className="text-xs text-slate-450 font-medium">{user.email}</p>
                            
                            {/* Crachá de tipo de conta */}
                            <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                              {user.role === 'state_admin' ? 'Administrador' : user.role === 'vendor' ? 'Feirante / Parceiro' : 'Cliente'}
                            </span>
                          </div>
                        </div>

                        {/* Corpo do Dropdown com a opção "Ver Perfil" */}
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onNavigate('profile');
                            }}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 active:scale-98 cursor-pointer font-sans"
                          >
                            <User size={14} />
                            <span>Visualizar Meu Perfil</span>
                          </button>

                          {user.role === 'vendor' && (
                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                onNavigate('shop-management');
                              }}
                              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer font-sans"
                            >
                              <Store size={14} className="text-slate-500" />
                              <span>Gerenciar Minha Loja</span>
                            </button>
                          )}

                          {user.role === 'state_admin' && (
                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                onNavigate('admin-dashboard');
                              }}
                              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 cursor-pointer font-sans"
                            >
                              <ShieldCheck size={14} className="text-slate-500" />
                              <span>Painel Administrativo</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full py-2 px-4 hover:bg-red-50 text-slate-400 hover:text-red-750 transition-all text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 mt-2 cursor-pointer font-sans"
                          >
                            <LogOut size={13} />
                            <span>Sair da Conta</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* MENU DE OPÇÕES DE CADASTRO PARA VISITANTE */
                      <>
                        {/* Header do Menu */}
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Smartphone size={16} />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-xs tracking-tight font-sans">Tipo de Cadastro</h3>
                              <p className="text-[9px] text-slate-400 font-medium">Selecione para prosseguir ou logar</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                            aria-label="Fechar"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Opções de Cadastro */}
                        <div className="p-3 overflow-y-auto max-h-[320px] flex flex-col gap-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {registerOptions.map((option) => {
                              const IconComponent = option.icon;
                              const isSelected = selectedOption === option.id;
                              
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleOptionSelect(option.id)}
                                  className={cn(
                                    "p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 relative overflow-hidden active:scale-98 select-none group",
                                    isSelected 
                                      ? option.activeBg + " shadow-sm ring-1 ring-offset-1 ring-emerald-500/10" 
                                      : option.color + " border-slate-100 text-slate-700 hover:bg-slate-50"
                                  )}
                                >
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center">
                                      <Check size={10} strokeWidth={3} />
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                      "w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                                      isSelected ? "bg-white/20 text-white" : option.textCol + " bg-white border border-slate-100"
                                    )}>
                                      <IconComponent size={12} />
                                    </span>
                                    <span className={cn("font-black text-[11px] tracking-tight", isSelected ? "text-white" : "text-slate-800")}>
                                      {option.label}
                                    </span>
                                  </div>
                                  <p className={cn("text-[8.5px] font-medium leading-tight", isSelected ? "text-white/85" : "text-slate-400")}>
                                    {option.description}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer / Botão de Ação */}
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-2">
                          <button
                            onClick={handleProceedAccess}
                            disabled={!selectedOption}
                            className={cn(
                              "w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs",
                              selectedOption 
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer" 
                                : "bg-slate-100 text-slate-455 border border-slate-200 cursor-not-allowed"
                            )}
                          >
                            {selectedOption ? (
                              <>
                                <span>Acessar</span>
                                <ChevronRight size={14} />
                              </>
                            ) : (
                              <>
                                <Lock size={12} className="opacity-60" />
                                <span>Selecione uma Opção</span>
                              </>
                            )}
                          </button>
                          <p className="text-[8px] text-center font-bold text-slate-450 tracking-wide uppercase">
                            {selectedOption 
                              ? `Selecionado: ${registerOptions.find(o => o.id === selectedOption)?.label}`
                              : "Escolha uma categoria acima para prosseguir"
                            }
                          </p>
                        </div>
                      </>
                    )}

                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Drawer Menu Lateral (Material Design 3 - Com Gestos e Backdrops com Motion) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop escuro com desfoque */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleDrawer}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[9900]"
            />

            {/* Menu Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 max-w-[320px] w-4/5 bg-white z-[9999] shadow-2xl flex flex-col rounded-r-3xl border-r border-slate-100 overflow-hidden font-sans"
            >
              {/* Topo do Drawer: Logo, Fechar e Status da Conta */}
              <div className="p-6 bg-gradient-to-br from-slate-55 to-slate-100 border-b border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Logo size="sm" className="w-8 h-8" />
                    <span className="text-lg font-black text-slate-950 font-sans tracking-tight">Feira Livre</span>
                  </div>
                  <button 
                    onClick={toggleDrawer}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 hover:text-slate-850 hover:bg-slate-200/50 transition-all active:scale-90"
                    aria-label="Fechar menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Card de Usuário / Login */}
                {user ? (
                  <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
                    <SafeImage 
                      src={user.photoURL} 
                      className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-400" 
                      alt={user.displayName} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Usuário Ativo</p>
                      <h4 className="font-bold text-slate-800 text-xs truncate leading-tight">{user.displayName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate leading-none mt-0.5">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-2.5">
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed leading-snug">
                      Selecione um tipo de cadastro e faça login para acessar todos os recursos!
                    </p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDrawerOpen(false);
                        setIsProfileMenuOpen(true);
                      }}
                      className="w-full h-9 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <User size={13} />
                      Iniciar Sessão
                    </button>
                  </div>
                )}
              </div>

              {/* Corpo do Drawer: Links com Scroll */}
              <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 no-scrollbar">
                
                {/* Seção 1: Navegação Principal (Para TODOS os Usuários) */}
                <div className="flex flex-col gap-2">
                  <h3 className="px-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 font-sans">
                    Menu Principal
                  </h3>
                  
                  {mainLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentScreen === link.id;
                    return (
                      <a
                        key={link.id}
                        href={link.path}
                        onClick={(e) => handleLinkClick(e, link.id)}
                        className={cn(
                          "h-11 px-3.5 rounded-2xl flex items-center justify-between text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-all font-bold text-xs select-none",
                          isActive && "bg-brand-50 text-brand-600 font-extrabold"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={cn("opacity-75", isActive && "opacity-100 text-brand-600")} />
                          <span className="font-sans">{link.label}</span>
                        </div>
                        <ChevronRight size={14} className="opacity-40" />
                      </a>
                    );
                  })}
                </div>

                {/* Seção 2: Recursos Autenticados (Apenas usuários ativos / cadastrados, mas mostramos de forma inteligente) */}
                <div className="flex flex-col gap-2">
                  <h3 className="px-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 font-sans">
                    Serviços & Recursos
                  </h3>

                  {accountLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = currentScreen === link.id;
                    return (
                      <a
                        key={link.id}
                        href={link.path}
                        onClick={(e) => handleLinkClick(e, link.id)}
                        className={cn(
                          "h-11 px-3.5 rounded-2xl flex items-center justify-between transition-all font-bold text-xs select-none",
                          isActive ? "bg-emerald-50 text-emerald-700 font-extrabold" : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={cn("opacity-75", isActive && "opacity-100 text-emerald-600")} />
                          <span className="font-sans">{link.label}</span>
                        </div>
                        <ChevronRight size={14} className="opacity-40" />
                      </a>
                    );
                  })}

                  {/* Vendedor / Admin / Loja links se cadastrado e com função */}
                  {user && (
                    <>
                      {user.role !== 'client' && (
                        <a
                          href="/vendas"
                          onClick={(e) => handleLinkClick(e, 'sales')}
                          className={cn(
                            "h-11 px-3.5 rounded-2xl flex items-center justify-between transition-all font-bold text-xs select-none",
                            currentScreen === 'sales' ? "bg-amber-50 text-amber-700 font-extrabold" : "text-slate-600 hover:text-amber-600 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <BarChart size={18} className="text-amber-500" />
                            <span className="font-sans">Painel de Vendas</span>
                          </div>
                          <ChevronRight size={14} className="opacity-50" />
                        </a>
                      )}

                      {user.role === 'vendor' && (
                        <a
                          href="/minha-loja"
                          onClick={(e) => handleLinkClick(e, 'shop-management')}
                          className={cn(
                            "h-11 px-3.5 rounded-2xl flex items-center justify-between transition-all font-bold text-xs select-none",
                            currentScreen === 'shop-management' ? "bg-brand-50 text-brand-700 font-extrabold" : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Store size={18} className="text-brand-500" />
                            <span className="font-sans">Minha Loja</span>
                          </div>
                          <ChevronRight size={14} className="opacity-50" />
                        </a>
                      )}

                      {user.role === 'state_admin' && (
                        <a
                          href="/painel-admin"
                          onClick={(e) => handleLinkClick(e, 'admin-dashboard')}
                          className={cn(
                            "h-11 px-3.5 rounded-2xl flex items-center justify-between transition-all font-bold text-xs select-none",
                            currentScreen === 'admin-dashboard' ? "bg-purple-50 text-purple-700 font-extrabold" : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck size={18} className="text-purple-500" />
                            <span className="font-sans">Admin Central</span>
                          </div>
                          <ChevronRight size={14} className="opacity-50" />
                        </a>
                      )}
                    </>
                  )}
                </div>

              </div>

              {/* Rodapé do Drawer: Versão e Logout se aplicável */}
              <div className="p-6 border-t border-slate-100 flex flex-col gap-3.5">
                {user && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full h-11 bg-slate-55 hover:bg-red-50 hover:text-red-650 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-100"
                  >
                    <LogOut size={14} />
                    Sair da Conta
                  </button>
                )}

                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 tracking-wider font-sans">
                    <Smartphone size={10} />
                    <span>ANDROID MD3 DESIGN v1.2</span>
                  </div>
                  <p className="text-[7.5px] font-medium text-slate-400 uppercase tracking-widest font-sans">
                    Feira Livre Digital © 2026
                  </p>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>


    </>
  );
};

export default AndroidTopAppBar;
