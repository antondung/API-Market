import React from 'react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import { useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  thousandSeparator?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
  thousandSeparator = ',',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{value.toLocaleString()}</span>;
  }

  return (
    <SlidingNumber
      number={value}
      thousandSeparator={thousandSeparator}
      className={className}
      transition={{ stiffness: 320, damping: 30 }}
    />
  );
};
