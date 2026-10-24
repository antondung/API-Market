import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverLift = true,
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !hoverLift) {
    return (
      <div
        onClick={onClick}
        className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 transition-colors duration-150 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={`bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-outline-variant/60 transition-colors duration-150 ${className}`}
    >
      {children}
    </motion.div>
  );
};
