import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Heart,
  X,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/adherents', icon: Users, label: 'Adhérents' },
  { path: '/cotisations', icon: CreditCard, label: 'Cotisations' },
  { path: '/soins', icon: Heart, label: 'Soins' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.3 }}
        className="fixed lg:relative z-30 flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <h1 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                MutuCare
              </h1>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${!isOpen && 'hidden'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            MODEP - Mutuelle des Employés Portuaires
          </div>
        </div>

        {/* Collapse button for desktop */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:block absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <ChevronLeft className={`w-4 h-4 text-gray-500 mx-auto transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.div>
    </>
  );
}
