// InnerOrb.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface InnerOrbProps {
  primaryColor: string;
  secondaryColor: string;
  scale: number
}

export const InnerOrb: React.FC<InnerOrbProps> = ({ primaryColor, secondaryColor, scale }) => {
  return (
    <motion.div
      className="w-[50px] h-[50px] rounded-full z-20 transition-all duration-300 ease-in-out"
      style={{
        background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor})`,
        boxShadow: `0 0 15px 5px ${primaryColor}`,
      }}
      animate={{
        scale: scale,
        boxShadow: `0 0 ${15 + scale * 5}px ${5 + scale * 2}px ${primaryColor}`,
      }}
    />
  );
};