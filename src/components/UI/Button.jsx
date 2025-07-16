import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl',
  danger: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl',
  outline: 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 bg-white/80 backdrop-blur-sm'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-lg'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  startIcon = null,
  endIcon = null,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        rounded-2xl font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {startIcon && <span className="mr-1">{startIcon}</span>}
          <span>{children}</span>
          {endIcon && <span className="ml-1">{endIcon}</span>}
        </>
      )}
    </motion.button>
  );
}