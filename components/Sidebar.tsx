
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Box, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  isCompact: boolean;
  toggleCompact: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, isCompact, toggleCompact }) => {
  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto ${isCompact ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 h-16 border-b dark:border-gray-700">
        <div className={`flex items-center gap-2 ${isCompact ? 'justify-center w-full' : ''}`}>
          <Box className="text-primary-500 h-8 w-8" />
          <span className={`font-bold text-xl ${isCompact ? 'hidden' : 'block'}`}>POS System</span>
        </div>
        <button onClick={toggleCompact} className={`hidden lg:block p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform duration-300 ${isCompact ? 'rotate-180' : ''}`}>
          <ChevronLeft size={20} />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            end
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-primary-100 dark:hover:bg-primary-900/50 ${isCompact ? 'justify-center' : ''} ${isActive ? 'bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600' : ''}`
            }
            title={isCompact ? link.label : undefined}
          >
            <link.icon size={20} />
            <span className={`ml-4 ${isCompact ? 'hidden' : 'block'}`}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
