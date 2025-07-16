import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const variants = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600'
  },
  error: {
    bg: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200',
    text: 'text-rose-800',
    icon: XCircle,
    iconColor: 'text-rose-600'
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
    text: 'text-amber-800',
    icon: AlertCircle,
    iconColor: 'text-amber-600'
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600'
  }
};

export default function Alert({ type = 'info', title, message, onClose, className = '' }) {
  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className={`
          ${variant.bg} ${variant.text}
          border rounded-2xl p-4 shadow-sm backdrop-blur-sm
          ${className}
        `}
      >
        <div className="flex items-start">
          <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${variant.iconColor}`} />
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold mb-1">{title}</h4>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}