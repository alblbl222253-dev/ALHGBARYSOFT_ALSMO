import React from 'react';
import { LogoutIcon, MenuIcon } from './common/icons';

interface HeaderProps {
  hallName: string;
  onLogout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hallName, onLogout, isSidebarOpen, toggleSidebar }) => {
  return (
    <header className="bg-[#100E17]/50 backdrop-blur-sm text-white shadow-lg p-4 flex items-center justify-between z-40">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white transition-colors duration-200 ml-4 p-2 rounded-full hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400">
          {hallName}
        </h1>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/40 hover:text-white transition-all duration-300"
        aria-label="Logout"
      >
        <LogoutIcon className="h-5 w-5 ml-2" />
        <span className="font-semibold">تسجيل الخروج</span>
      </button>
    </header>
  );
};