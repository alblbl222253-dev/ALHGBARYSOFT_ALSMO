import React, { useState, useEffect } from 'react';
import { Reservation, Partner, Expense } from '../types';
import { getData, getSettings } from '../services/storageService';
import { DollarSignIcon, CalendarIcon, UsersIcon, TrendingDownIcon, InfoIcon } from './common/icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string; note?: string }> = ({ icon, title, value, color, note }) => (
  <div className="bg-[#1F1C2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
      </div>
      <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const settings = getSettings();

  useEffect(() => {
    setReservations(getData<Reservation>('reservations'));
    setPartners(getData<Partner>('partners'));
    setExpenses(getData<Expense>('expenses'));
  }, []);

  const totalRevenue = reservations.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const upcomingReservations = reservations.filter(r => new Date(r.date) >= new Date() && r.status === 'مؤكد').length;
  const netProfit = totalRevenue - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: settings?.currency || 'YER' }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">لوحة التحكم</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          icon={<DollarSignIcon className="h-6 w-6 text-white"/>}
          title="إجمالي الإيرادات"
          value={formatCurrency(totalRevenue)}
          color="from-green-500 to-emerald-400"
          note={`من ${reservations.length} حجز`}
        />
        <StatCard 
          icon={<TrendingDownIcon className="h-6 w-6 text-white"/>}
          title="إجمالي المصروفات"
          value={formatCurrency(totalExpenses)}
          color="from-red-500 to-orange-400"
          note={`من ${expenses.length} بند`}
        />
        <StatCard 
          icon={<CalendarIcon className="h-6 w-6 text-white"/>}
          title="المناسبات القادمة"
          value={String(upcomingReservations)}
          color="from-blue-500 to-cyan-400"
          note="الحجوزات المؤكدة"
        />
        <StatCard 
          icon={<UsersIcon className="h-6 w-6 text-white"/>}
          title="الشركاء"
          value={String(partners.length)}
          color="from-purple-500 to-indigo-400"
          note="إجمالي شركاء العمل"
        />
      </div>
      <div className="mt-8 bg-[#1F1C2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">نظرة عامة على صافي الربح</h3>
        <div className="flex items-center text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400">
          {formatCurrency(netProfit)}
        </div>
        <p className="text-gray-400 mt-2">هذا هو صافي ربحك الحالي (إجمالي الإيرادات - إجمالي المصروفات).</p>
      </div>

       <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-300">مرحباً بك في GR-SOFT!</h4>
            <p className="text-sm text-blue-400">
              توفر لوحة التحكم هذه ملخصًا سريعًا لأعمالك. استخدم الشريط الجانبي للتنقل إلى الأقسام الأخرى لإدارة الحجوزات والشؤون المالية والموظفين بالتفصيل.
            </p>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;