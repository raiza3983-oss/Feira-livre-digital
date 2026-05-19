import React from 'react';
import logoImg from '../lib/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    '2xl': 'w-64 h-64',
    '3xl': 'w-80 h-80'
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
