'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, Package, DollarSign, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  {
    href: '/',
    icon: BarChart3,
    label: 'Comparador',
  },
  {
    href: '/fornecedores',
    icon: Building2,
    label: 'Fornecedores',
  },
  {
    href: '/produtos',
    icon: Package,
    label: 'Produtos',
  },
  {
    href: '/precos',
    icon: DollarSign,
    label: 'Preços',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">CompraVis</p>
            <p className="text-[10px] text-slate-400">Compare antes de comprar</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 group',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon
                  size={16}
                  className={cn(
                    'shrink-0 transition-transform duration-150',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Version / User / Mobile Toggle */}
        <div className="flex items-center gap-4 ml-auto">
          <p className="hidden md:block text-[10px] text-slate-500">v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
          
          {/* Mobile toggle button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Alternar menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          <div className="max-w-7xl mx-auto w-full px-4 py-3">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 group',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-transform duration-150',
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          </div>
        </div>
      )}
    </header>
  );
}
