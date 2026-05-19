import React from 'react';
import { User, Store, Package } from 'lucide-react';
import { cn } from '../lib/utils';

export const SafeImage = ({ 
  src, 
  alt, 
  className, 
  type = 'user',
  referrerPolicy = "no-referrer",
  onClick
}: { 
  src?: string | null, 
  alt?: string, 
  className?: string,
  type?: 'user' | 'shop' | 'product',
  referrerPolicy?: React.HTMLAttributeReferrerPolicy,
  onClick?: () => void
}) => {
  if (src && src.trim() !== '') {
    return <img src={src} alt={alt} className={className} referrerPolicy={referrerPolicy} onClick={onClick} />;
  }

  const Icon = type === 'shop' ? Store : type === 'product' ? Package : User;
  
  return (
    <div 
      className={cn("flex items-center justify-center bg-slate-100 text-slate-300", className)}
      onClick={onClick}
    >
      <Icon size="40%" className="opacity-50" />
    </div>
  );
};
