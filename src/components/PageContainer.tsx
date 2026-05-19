import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen, AppConfig } from '../types';

interface PageContainerProps {
  children: React.ReactNode;
  screen: Screen;
  config: AppConfig | null;
}

export const PageContainer = ({ children, screen, config }: PageContainerProps) => {
  const pageConfig = (config?.pages as any)?.[screen];
  
  if (pageConfig && !pageConfig.visible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-300">
        <X size={48} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest">Esta página está temporariamente indisponível</p>
      </div>
    );
  }

  const columns = pageConfig?.columns || 1;
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }[columns as 1 | 2 | 3] || "grid-cols-1";

  return (
    <div className={cn("grid gap-8", gridCols)}>
      {children}
    </div>
  );
};
