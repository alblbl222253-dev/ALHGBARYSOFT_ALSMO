import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reservations from './components/Reservations';
import Partners from './components/Partners';
import Employees from './components/Employees';
import Reports from './components/Reports';
import Settings from './components/Settings';
import InitialSetup from './components/InitialSetup';
import Login from './components/Login';
import { getSettings, getIsAuthenticated, setIsAuthenticated } from './services/storageService';
import { Settings as AppSettings, View } from './types';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const savedSettings = getSettings();
    const authStatus = getIsAuthenticated();
    setSettings(savedSettings);
    setAuthenticated(authStatus && !!savedSettings);
  }, []);

  const handleSetupComplete = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setAuthenticated(true);
    // After setup, directly go to the main app
  };

  const handleLogin = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticated(false);
    setCurrentView('DASHBOARD');
  };
  
  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'RESERVATIONS':
        return <Reservations />;
      case 'PARTNERS':
        return <Partners />;
      case 'EMPLOYEES':
        return <Employees />;
      case 'REPORTS':
        return <Reports />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!settings) {
    return <InitialSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} hallName={settings.hallName} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:mr-64' : 'md:mr-20'}`}>
        <Header 
          hallName={settings.hallName} 
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8 relative"
        >
          <div 
            className="absolute inset-0 bg-no-repeat bg-center opacity-5 pointer-events-none"
            style={{backgroundImage: "url('https://i.imgur.com/kQJd24A.png')"}}
          ></div>
          <div className="relative z-10">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;