import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface PageRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const PageReveal: React.FC<PageRevealProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
