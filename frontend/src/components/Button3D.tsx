import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface Button3DProps extends HTMLMotionProps<"button"> {
  variant?: 'green' | 'blue' | 'yellow';
  label: string;
}

const Button3D: React.FC<Button3DProps> = ({ variant = 'green', label, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ y: 6, boxShadow: '0 0 0 transparent' }}
      className={clsx(
        "relative w-full py-4 rounded-full border-4 border-white font-titan text-2xl text-white uppercase tracking-wider cursor-pointer mb-4 transition-all select-none",
        "bg-gradient-to-b shadow-lg active:shadow-none",
        variant === 'green' && "from-btn-green-top to-btn-green-bottom shadow-btn-green-shadow",
        variant === 'blue' && "from-btn-blue-top to-btn-blue-bottom shadow-btn-blue-shadow",
        className
      )}
      style={{
           boxShadow: variant === 'green' ? '0 6px 0 #1e8449, 0 10px 10px rgba(0,0,0,0.2)' : 
                      variant === 'blue' ? '0 6px 0 #1c5980, 0 10px 10px rgba(0,0,0,0.2)' : undefined
      }}
      {...props}
    >
      {label}
    </motion.button>
  );
};

export default Button3D;
