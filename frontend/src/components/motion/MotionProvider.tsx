import React from 'react';
import { MotionConfig } from 'motion/react';

interface MotionProviderProps {
  children: React.ReactNode;
}

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
};
