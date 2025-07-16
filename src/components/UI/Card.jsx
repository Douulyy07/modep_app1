import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  glassmorphism = false,
  ...props 
}) {
  const baseClasses = `
    ${glassmorphism 
      ? 'bg-white/80 backdrop-blur-sm border border-white/50' 
      : 'bg-white border border-gray-200 dark:border-gray-700'
    }
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
    rounded-3xl shadow-sm transition-all duration-300
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
    dark:bg-gray-800
  `;

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}