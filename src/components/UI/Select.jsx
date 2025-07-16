import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Select({ 
  label, 
  error, 
  options = [], 
  className = '', 
  required = false,
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
        <motion.select
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-4 py-3 pr-10
            bg-white/80 backdrop-blur-sm border border-slate-200 
            rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            text-slate-900 appearance-none cursor-pointer
            transition-all duration-200 shadow-sm hover:shadow-md
            dark:bg-gray-700 dark:border-gray-600 dark:text-white
            ${error ? 'border-rose-500 focus:ring-rose-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
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