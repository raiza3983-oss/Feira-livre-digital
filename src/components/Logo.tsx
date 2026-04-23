import React from 'react';
import logoImg from '../logo-feiralivredigital.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-80 h-80'
  };

  return (
    <div className={`${sizes[size]} ${className} relative flex items-center justify-center`}>
      <img 
        src={logoImg} 
        alt="Feira Livre Digital" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
