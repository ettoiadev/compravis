'use client';

import { cn } from '@/lib/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'md', className }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-700 border-green-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusDotProps {
  active: boolean;
  label?: boolean;
}

export function StatusDot({ active, label = true }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-green-500' : 'bg-slate-300'
        )}
      />
      {label && (
        <span className={cn('text-xs font-medium', active ? 'text-green-600' : 'text-slate-400')}>
          {active ? 'Ativo' : 'Inativo'}
        </span>
      )}
    </span>
  );
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600', className)}
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}) {
  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-fade-in',
        styles[type]
      )}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">
        ×
      </button>
    </div>
  );
}
