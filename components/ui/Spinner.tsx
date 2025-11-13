
import React from 'react';

export const Spinner: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }
  return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>;
};
