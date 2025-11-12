import React, { useState } from 'react';
import { Settings } from '../types';
import { saveSettings, setIsAuthenticated } from '../services/storageService';

interface InitialSetupProps {
  onSetupComplete: (settings: Settings) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState<Settings>({
    hallName: '',
    currency: 'YER',
    fiscalYear: new Date().getFullYear(),
    adminUser: 'admin',
    adminPass: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminPass.length < 4) {
      alert('يجب أن تكون كلمة المرور 4 أحرف على الأقل.');
      return;
    }
    saveSettings(formData);
    setIsAuthenticated(true);
    onSetupComplete(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans" style={{backgroundImage: "url('https://i.imgur.com/kQJd24A.png')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain'}}>
      <div className="max-w-md w-full bg-[#100E17]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
            <img src="https://i.imgur.com/kQJd24A.png" alt="GR-SOFT Logo" className="w-24 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-white">مرحباً بك في GR-SOFT</h1>
            <p className="text-gray-400">الإعداد الأولي للتطبيق</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
            <label htmlFor="hallName" className="block text-sm font-medium text-gray-300">اسم قاعة الأفراح</label>
            <input type="text" name="hallName" value={formData.hallName} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-300">العملة الافتراضية (مثال: YER)</label>
            <input type="text" name="currency" value={formData.currency} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
          </div>
          <div>
            <label htmlFor="adminUser" className="block text-sm font-medium text-gray-300">اسم مستخدم المسؤول</label>
            <input type="text" name="adminUser" value={formData.adminUser} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
          </div>
          <div>
            <label htmlFor="adminPass" className="block text-sm font-medium text-gray-300">كلمة مرور المسؤول</label>
            <input type="password" name="adminPass" value={formData.adminPass} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
          </div>
          <div>
            <button type="submit" className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-opacity">
              إكمال الإعداد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialSetup;