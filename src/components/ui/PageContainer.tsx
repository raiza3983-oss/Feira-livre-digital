import React from 'react';

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden" style={{ contain: 'layout' }}>
      {children}
    </div>
  );
}
