import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  hoverEffect = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-md hover:border-outline-variant/70 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-outline-variant/20">
          {title && <h3 className="font-headline font-semibold text-lg text-on-surface">{title}</h3>}
          {subtitle && <p className="font-body text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
