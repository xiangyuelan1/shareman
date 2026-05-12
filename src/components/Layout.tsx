import React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout, isAdmin }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation onLogout={onLogout} isAdmin={isAdmin} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};
