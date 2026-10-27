import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'info' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  icon?: string;
  method?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
  method
}) => {
  if (method) {
    return <MethodBadge method={method} />;
  }

  const normalizedVariant = variant === 'info' ? 'primary' : variant === 'error' ? 'danger' : variant;

  const variantStyles = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary-container text-on-secondary-container',
    success: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-semibold',
    warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-semibold',
    danger: 'bg-error-container text-on-error-container border border-error/20',
    neutral: 'bg-surface-container-high text-on-surface-variant',
    outline: 'border border-outline-variant text-on-surface-variant bg-transparent'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-label-md px-2.5 py-1 rounded-full font-label-md'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 transition-colors ${variantStyles[normalizedVariant]} ${sizeStyles[size]} ${className}`}>
      {icon && <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
};

export const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const styles: Record<string, string> = {
    GET: 'bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/30',
    POST: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30',
    PUT: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30',
    PATCH: 'bg-purple-500/15 text-purple-800 dark:text-purple-200 border-purple-500/30',
    DELETE: 'bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/30'
  };

  return (
    <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${styles[method.toUpperCase()] || 'bg-gray-100 text-gray-700'}`}>
      {method}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Published':
    case 'Active':
    case 'Approved':
      return <Badge variant="success" icon="check_circle">{status}</Badge>;
    case 'UnderReview':
    case 'Pending':
      return <Badge variant="warning" icon="schedule">{status}</Badge>;
    case 'Draft':
      return <Badge variant="neutral" icon="edit_note">{status}</Badge>;
    case 'Deprecated':
    case 'Suspended':
    case 'Rejected':
      return <Badge variant="danger" icon="block">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
