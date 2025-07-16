import React from 'react';
import { motion } from 'framer-motion';

export default function Input({ 
  label, 
  error, 
  className = '', 
  required = false,
  icon = null,
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 
            bg-white/80 backdrop-blur-sm border border-slate-200 
            rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            text-slate-900 placeholder-slate-500
            transition-all duration-200 shadow-sm hover:shadow-md
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
            ${error ? 'border-rose-500 focus:ring-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-rose-600 dark:text-rose-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}