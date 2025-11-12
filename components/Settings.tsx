import React, { useState, useEffect } from 'react';
import { Settings as AppSettings } from '../types';
import { getSettings, saveSettings, saveData } from '../services/storageService';
import { SaveIcon, AlertTriangleIcon } from './common/icons';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: name === 'fiscalYear' ? parseInt(value, 10) : value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      saveSettings(settings);
      setFeedback('تم حفظ الإعدادات بنجاح!');
      setTimeout(() => setFeedback(''), 3000);
    }
  };
  
  const handleFinancialClose = () => {
      if (window.confirm("هل أنت متأكد؟ سيؤدي هذا إلى إنشاء نسخة احتياطية وأرشفة جميع البيانات المالية الحالية (الحجوزات، المصروفات). لا يمكن التراجع عن هذا الإجراء.")) {
        const backupData = {
            reservations: localStorage.getItem('gr-soft-db-reservations'),
            expenses: localStorage.getItem('gr-soft-db-expenses'),
            partners: localStorage.getItem('gr-soft-db-partners'),
            employees: localStorage.getItem('gr-soft-db-employees'),
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gr-soft-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        // Clear data for new year
        saveData('reservations', []);
        saveData('expenses', []);

        alert("تم إغلاق السنة المالية. تم نسخ البيانات احتياطيًا ومسحها للسنة الجديدة.");
      }
  };

  if (!settings) {
    return <div>جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">الإعدادات</h2>
      
      <div className="bg-[#1F1C2E]/60 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hallName" className="block text-sm font-medium text-gray-300">اسم القاعة</label>
              <input type="text" name="hallName" value={settings.hallName} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-300">العملة (مثال: YER)</label>
              <input type="text" name="currency" value={settings.currency} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
            </div>
            <div>
              <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-300">السنة المالية الحالية</label>
              <input type="number" name="fiscalYear" value={settings.fiscalYear} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white">بيانات اعتماد المسؤول</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div>
                <label htmlFor="adminUser" className="block text-sm font-medium text-gray-300">اسم مستخدم المسؤول</label>
                <input type="text" name="adminUser" value={settings.adminUser} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
               </div>
               <div>
                <label htmlFor="adminPass" className="block text-sm font-medium text-gray-300">كلمة مرور المسؤول</label>
                <input type="password" name="adminPass" value={settings.adminPass} onChange={handleChange} placeholder="أدخل كلمة مرور جديدة للتغيير" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
               </div>
            </div>
          </div>
          <div className="flex justify-end items-center">
            {feedback && <p className="text-green-400 ml-4">{feedback}</p>}
            <button type="submit" className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
              <SaveIcon className="h-5 w-5 ml-2" />
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-red-900/20 border border-red-500/30 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-red-300">منطقة الخطر</h3>
        <p className="text-red-400 mt-2">هذه الإجراءات مدمرة ولا يمكن التراجع عنها.</p>
        <div className="mt-4">
            <button 
              onClick={handleFinancialClose}
              className="flex items-center px-4 py-2 bg-red-600/50 text-red-200 border border-red-500/30 rounded-lg hover:bg-red-600/80 hover:text-white transition-colors"
            >
              <AlertTriangleIcon className="h-5 w-5 ml-2" />
              إغلاق السنة المالية ونسخ البيانات احتياطيًا
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;