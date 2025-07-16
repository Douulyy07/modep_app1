@@ .. @@
 import React from 'react';
-import { Menu, Sun, Moon, Bell } from 'lucide-react';
+import { Sun, Moon, Bell } from 'lucide-react';
 import { motion } from 'framer-motion';
+import { useAuth } from '../contexts/AuthContext';

-export default function Header({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
+export default function Header({ darkMode, setDarkMode }) {
+  const { user } = useAuth();
+
   return (
     <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
       <div className="flex items-center justify-between px-6 py-4">
-        <div className="flex items-center space-x-4">
-          <button
-            onClick={() => setSidebarOpen(!sidebarOpen)}
-            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
-          >
-            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
-          </button>
-          
+        <div className="flex items-center space-x-4 lg:ml-0 ml-16">
           <div>
             <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
               Gestion Mutualiste
@@ .. @@
           </div>
         </div>

         <div className="flex items-center space-x-4">
           <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative">
             <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
           </button>

           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setDarkMode(!darkMode)}
             className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
           >
             {darkMode ? (
               <Sun className="w-5 h-5 text-yellow-500" />
             ) : (
               <Moon className="w-5 h-5 text-gray-600" />
             )}
           </motion.button>

-          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
-            <span className="text-white text-sm font-medium">A</span>
+          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center" title={user?.username}>
+            <span className="text-white text-sm font-medium">
+              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
+            </span>
           </div>
         </div>
       </div>