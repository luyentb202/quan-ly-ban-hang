
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Spinner } from './ui/Spinner';
import { useAppContext } from '../hooks/useAppContext';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setCompact] = useState(localStorage.getItem('sidebar_compact') === 'true');
  const { loading } = useAppContext();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCompact = () => {
      const newCompactState = !isCompact;
      setCompact(newCompactState);
      localStorage.setItem('sidebar_compact', String(newCompactState));
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {loading && <Spinner fullPage />}
      <Sidebar isSidebarOpen={isSidebarOpen} isCompact={isCompact} toggleCompact={toggleCompact} />
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
