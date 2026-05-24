'use client';

import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="sticky top-16 z-30 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col min-w-0">
          <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
          {description && (
            <p className="text-xs text-slate-400 truncate hidden sm:block">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {actions}
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Notificações"
          >
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-screen">
      {children}
    </div>
  );
}

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={`flex-1 w-full ${className || ''}`}>
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}
