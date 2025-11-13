
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { NAV_LINKS } from '../constants';
import { Button } from './ui/Button';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useAppContext();
  const location = useLocation();
  const currentLink = NAV_LINKS.find(link => link.href === location.pathname);
  const pageTitle = currentLink ? currentLink.label : "Tổng quan";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600 dark:text-gray-300">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
      </div>
      <Button onClick={toggleTheme} variant="secondary" size="sm">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </Button>
    </header>
  );
};
