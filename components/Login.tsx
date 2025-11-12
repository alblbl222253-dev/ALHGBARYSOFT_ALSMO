import React, { useState } from 'react';
import { getSettings, setIsAuthenticated } from '../services/storageService';

interface LoginProps {
  onLogin: () => void;
  hallName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, hallName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = getSettings();
    if (settings && settings.adminUser === username && settings.adminPass === password) {
      setError('');
      setIsAuthenticated(true);
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صالحة.');
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans" style={{backgroundImage: "url('https://i.imgur.com/kQJd24A.png')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain'}}>
      <div className="max-w-sm w-full bg-[#100E17]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
           <img src="https://i.imgur.com/kQJd24A.png" alt="GR-SOFT Logo" className="w-20 mx-auto mb-4"/>
           <h1 className="text-2xl font-bold text-white">{hallName}</h1>
           <p className="text-gray-400">تسجيل دخول المسؤول</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">اسم المستخدم</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">كلمة المرور</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </div>
          
          {error && <p className="text-sm text-red-400">{error}</p>}
          
          <div>
            <button type="submit" className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-opacity">
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;