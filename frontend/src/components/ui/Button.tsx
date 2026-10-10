import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm active:scale-[0.98]',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-[0.98]',
    outline: 'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low active:scale-[0.98]',
    danger: 'bg-error text-on-error hover:bg-error/90 active:scale-[0.98]',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-body-sm rounded-lg font-medium gap-1.5',
    md: 'px-4 py-2 text-body-md rounded-xl font-medium gap-2',
    lg: 'px-6 py-3 text-body-lg rounded-xl font-medium gap-2.5'
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-label-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : typeof icon === 'string' ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : (
        icon || null
      )}
      {children}
    </button>
  );
};
