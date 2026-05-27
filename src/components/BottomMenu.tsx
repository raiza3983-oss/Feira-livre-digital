import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number | boolean;
}

const NavItem = React.memo(({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  badge
}: NavItemProps) => (
    <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center w-full h-full min-w-0 transition-all duration-300 relative group px-0.5",
      active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
    )}
  >
    <div className="relative flex flex-col items-center w-full min-w-0">
      <div className={cn(
        "p-1.5 rounded-xl transition-all duration-300",
        active ? "scale-110 text-brand-600" : "group-hover:scale-110"
      )}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {badge && (
          <motion.span 
            key={typeof badge === 'boolean' ? 'dot' : badge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center border-2 border-white shadow-sm bg-red-500 text-white rounded-full",
              typeof badge === 'boolean' ? "w-2.5 h-2.5" : "min-w-[14px] h-[14px] px-0.5 text-[7px] font-black"
            )}
          >
            {typeof badge === 'number' ? (badge > 9 ? '9+' : badge) : null}
          </motion.span>
        )}
      </div>
      <span className={cn(
        "text-[7px] min-[360px]:text-[8px] sm:text-[9px] mt-0.5 font-bold uppercase tracking-tight text-center leading-none truncate w-full px-0.5 transition-all duration-300",
        active ? "opacity-100" : "opacity-40"
      )}>
        {label}
      </span>
    </div>
    {active && (
      <motion.div 
        layoutId="active-nav-indicator"
        className="absolute bottom-1 w-1 h-1 bg-brand-600 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]"
      />
    )}
  </button>
));

interface BottomMenuProps {
  activeScreen: string;
  onNavigate: (screen: any) => void;
  screens: { id: any; label: string; icon: any; badge?: number | boolean }[];
}

export const BottomMenu = React.memo(({ activeScreen, onNavigate, screens }: BottomMenuProps) => {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[430px] h-[72px] bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] grid grid-cols-7 items-center justify-items-center px-1">
        {screens.map(screen => (
          <NavItem
            key={screen.id}
            icon={screen.icon}
            label={screen.label}
            active={activeScreen === screen.id}
            onClick={() => onNavigate(screen.id)}
            badge={screen.badge}
          />
        ))}
      </div>
    </div>
  );
});
