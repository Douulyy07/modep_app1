// components/UI/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, onClose, title, size = 'md', children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-${size === 'lg' ? '4xl' : 'xl'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
