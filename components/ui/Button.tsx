'use client';

import { cn } from '@/lib/utils/helpers';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg border cursor-pointer select-none whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus-visible:ring-blue-500 shadow-sm',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 focus-visible:ring-slate-400 shadow-sm',
    danger:
      'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus-visible:ring-red-500 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent focus-visible:ring-slate-400',
    success:
      'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 focus-visible:ring-green-500 shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
