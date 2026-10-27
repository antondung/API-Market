import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  onClick?: () => void;
  testId?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverLift = true,
  onClick,
  testId,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleKeyDown = onClick
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;

  if (shouldReduceMotion || !hoverLift) {
    return (
      <div
        data-testid={testId || 'animated-card'}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={handleKeyDown}
        className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 transition-colors duration-150 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-testid={testId || 'animated-card'}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-outline-variant/60 transition-colors duration-150 ${className}`}
    >
      {children}
    </motion.div>
  );
};
