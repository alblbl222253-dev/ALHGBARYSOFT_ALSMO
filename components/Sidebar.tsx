import React from 'react';
import { View } from '../types';
import { DashboardIcon, ReservationsIcon, PartnersIcon, EmployeesIcon, ReportsIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon } from './common/icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { view: 'DASHBOARD' as View, label: 'لوحة التحكم', icon: DashboardIcon },
  { view: 'RESERVATIONS' as View, label: 'الحجوزات', icon: ReservationsIcon },
  { view: 'PARTNERS' as View, label: 'الشركاء', icon: PartnersIcon },
  { view: 'EMPLOYEES' as View, label: 'الموظفين', icon: EmployeesIcon },
  { view: 'REPORTS' as View, label: 'التقارير', icon: ReportsIcon },
  { view: 'SETTINGS' as View, label: 'الإعدادات', icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const isActive = currentView === item.view;
    return (
      <li className="mb-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView(item.view);
          }}
          className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out group ${
            isActive
              ? 'bg-gradient-to-r from-purple-600/30 to-yellow-600/20 text-white shadow-inner'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          aria-current={isActive ? 'page' : undefined}
        >
          <item.icon className={`h-6 w-6 transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
          <span className={`mr-4 font-medium overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>{item.label}</span>
        </a>
      </li>
    );
  };

  return (
    <aside className={`fixed top-0 right-0 h-full bg-[#100E17] text-white flex flex-col z-50 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center justify-center h-20 border-b border-gray-800 relative ${isOpen ? 'px-4' : ''}`}>
        <img src="https://i.imgur.com/kQJd24A.png" alt="GR-SOFT Logo" className={`transition-all duration-300 ${isOpen ? 'h-12' : 'h-10'}`} />
        <button onClick={() => setIsOpen(!isOpen)} className="absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-1 rounded-full border-2 border-gray-700 hover:bg-purple-600 transition-colors">
          {isOpen ? <ChevronRightIcon className="h-5 w-5"/> : <ChevronLeftIcon className="h-5 w-5"/>}
        </button>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul>
          {navItems.map((item) => <NavLink key={item.view} item={item} />)}
        </ul>
      </nav>
      <div className="px-3 py-4 border-t border-gray-800">
        <p className={`text-xs text-center text-gray-500 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>© {new Date().getFullYear()} GR-SOFT</p>
      </div>
    </aside>
  );
};

export default Sidebar;