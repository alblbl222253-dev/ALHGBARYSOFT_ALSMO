import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Reservation, ReservationStatus, GenderType, SetupType } from '../types';
import { getData, saveData, getSettings } from '../services/storageService';
import Modal from './common/Modal';
import { EditIcon, TrashIcon, PlusIcon, SearchIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './common/icons';

const statusColors: { [key in ReservationStatus]: string } = {
  'مؤكد': 'bg-green-500/20 text-green-300 border-green-500/30',
  'ملغي': 'bg-red-500/20 text-red-300 border-red-500/30',
  'مبدئي': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

// Moved outside the component to prevent re-creation on every render, which caused focus loss.
const FormSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="text-md font-semibold text-purple-300 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const ReservationForm: React.FC<{
  reservation: Reservation | null;
  onSave: (reservation: Reservation) => void;
  onClose: () => void;
}> = ({ reservation, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Reservation, 'id'>>({
    renterName: '',
    personalId: '',
    phoneNumber: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '23:00',
    eventType: 'زفاف',
    genderType: 'رجال ونساء',
    setupType: 'كراسي وطاولات',
    amount: 0,
    downPayment: 0,
    securityDepositType: 'مبلغ نقدي',
    securityDepositAmount: 0,
    contractNumber: '',
    status: 'مبدئي',
    ...(reservation || {}),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['amount', 'downPayment', 'securityDepositAmount'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: reservation?.id || new Date().toISOString() });
  };
    
  const remainingAmount = useMemo(() => formData.amount - formData.downPayment, [formData.amount, formData.downPayment]);

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
        <FormSection title="معلومات المستأجر">
            <div><label className="text-sm text-gray-400">اسم المستأجر</label><input type="text" name="renterName" value={formData.renterName} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">رقم الهاتف</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div className="md:col-span-2"><label className="text-sm text-gray-400">رقم البطاقة الشخصية</label><input type="text" name="personalId" value={formData.personalId} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
        </FormSection>

        <FormSection title="تفاصيل المناسبة">
            <div><label className="text-sm text-gray-400">التاريخ</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">نوع المناسبة</label><input type="text" name="eventType" value={formData.eventType} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">وقت البدء</label><input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">وقت الانتهاء</label><input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">نوع الفرح</label><select name="genderType" value={formData.genderType} onChange={handleChange} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"><option value="رجال">رجال</option><option value="نساء">نساء</option><option value="رجال ونساء">رجال ونساء</option></select></div>
            <div><label className="text-sm text-gray-400">تجهيز الصالة</label><select name="setupType" value={formData.setupType} onChange={handleChange} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"><option value="كراسي وطاولات">كراسي وطاولات</option><option value="مجلس عربي">مجلس عربي</option></select></div>
        </FormSection>

        <FormSection title="المعلومات المالية">
            <div><label className="text-sm text-gray-400">المبلغ الإجمالي</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">العربون (المقبوض)</label><input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div className="md:col-span-2 p-3 bg-gray-800/50 rounded-md text-center">
                <span className="text-sm text-gray-400">المبلغ المتبقي: </span>
                <span className="font-bold text-lg text-yellow-400">{remainingAmount.toFixed(2)}</span>
            </div>
             <div><label className="text-sm text-gray-400">الحالة</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"><option value="مبدئي">مبدئي</option><option value="مؤكد">مؤكد</option><option value="ملغي">ملغي</option></select></div>
        </FormSection>

        <FormSection title="التأمين والعقد">
            <div><label className="text-sm text-gray-400">نوع التأمين/الرهن</label><input type="text" name="securityDepositType" value={formData.securityDepositType} onChange={handleChange} placeholder="مثال: مبلغ نقدي، ذهب، بطاقة..." className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div><label className="text-sm text-gray-400">قيمة التأمين (إن وجد)</label><input type="number" name="securityDepositAmount" value={formData.securityDepositAmount} onChange={handleChange} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
            <div className="md:col-span-2"><label className="text-sm text-gray-400">رقم العقد</label><input type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} className="mt-1 w-full bg-gray-700 border-gray-600 rounded-md text-white"/></div>
        </FormSection>

        <div className="flex justify-end space-x-3 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">إلغاء</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">حفظ الحجز</button>
        </div>
    </form>
  );
};


const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const settings = getSettings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: settings?.currency || 'YER' }).format(amount);
  };

  useEffect(() => {
    const sortedData = getData<Reservation>('reservations').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReservations(sortedData);
  }, []);

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    reservations.forEach(r => {
        if (r.status !== 'ملغي') {
            dates.add(r.date);
        }
    });
    return dates;
  }, [reservations]);
  
  const handleSave = (reservation: Reservation) => {
    let updated;
    if (editingReservation) {
      updated = reservations.map(r => r.id === reservation.id ? reservation : r);
    } else {
      updated = [...reservations, reservation];
    }
    const sorted = updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReservations(sorted);
    saveData('reservations', sorted);
    setIsModalOpen(false);
    setEditingReservation(null);
  };
  
  const handleDelete = (id: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز؟')) {
        const updated = reservations.filter(r => r.id !== id);
        setReservations(updated);
        saveData('reservations', updated);
    }
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations;
    
    if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        filtered = filtered.filter(r => r.date === dateStr);
    }

    return filtered.filter(r => 
        r.renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phoneNumber.includes(searchTerm) ||
        r.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservations, searchTerm, selectedDate]);
  
  const Calendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({length: firstDay}, (_, i) => <div key={`empty-${i}`} className="p-2"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isBooked = bookedDates.has(dateStr);
        const isSelected = selectedDate?.toDateString() === date.toDateString();

        days.push(
            <div key={day} onClick={() => setSelectedDate(date)} className={`p-2 text-center rounded-lg cursor-pointer transition-colors relative ${isSelected ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>
                {day}
                {isBooked && <div className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${isSelected ? 'bg-white' : 'bg-yellow-400'}`}></div>}
            </div>
        );
    }
    
    return (
        <div className="bg-[#1F1C2E]/60 p-4 rounded-xl border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-gray-700"><ChevronRightIcon className="h-5 w-5"/></button>
                <h3 className="font-bold text-lg text-white">{currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm text-gray-300">
                {['ج', 'خ', 'ر', 'ث', 'ن', 'س', 'ح'].map(d => <div key={d} className="text-center font-semibold text-gray-500">{d}</div>)}
                {days}
            </div>
        </div>
    )
  };


  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">الحجوزات والتقويم</h2>
        <button onClick={() => { setEditingReservation(null); setIsModalOpen(true); }} className="flex-shrink-0 flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة حجز
        </button>
      </div>

      <Calendar />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex-grow">
            {selectedDate ? (
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white">حجوزات يوم: {selectedDate.toLocaleDateString('ar-EG')}</h3>
                    <button onClick={() => setSelectedDate(null)} className="text-sm text-red-400 hover:underline">إلغاء الفلتر</button>
                </div>
            ) : <h3 className="text-xl font-bold text-white">جميع الحجوزات</h3>}
        </div>
        <div className="relative w-full md:w-64">
            <input 
                type="text"
                placeholder="ابحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>


       <div className="bg-[#1F1C2E]/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">المستأجر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">التاريخ والوقت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">المالية</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">الحالة</th>
                <th className="relative px-6 py-3"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredReservations.map(r => {
                const remainingAmount = r.amount - r.downPayment;
                return (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{r.renterName}</div>
                        <div className="text-sm text-gray-400">{r.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{new Date(r.date).toLocaleDateString('ar-EG')}</div>
                        <div className="text-xs text-gray-500">{r.startTime} - {r.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <div><span className="text-gray-400">الإجمالي: </span><span className="font-semibold text-white">{formatCurrency(r.amount)}</span></div>
                         <div><span className="text-gray-400">العربون: </span><span className="text-green-400">{formatCurrency(r.downPayment)}</span></div>
                         <div><span className="text-gray-400">المتبقي: </span><span className="font-bold text-yellow-400">{formatCurrency(remainingAmount)}</span></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button onClick={() => { setEditingReservation(r); setIsModalOpen(true); }} className="text-purple-400 hover:text-purple-300 p-2"><EditIcon className="h-5 w-5"/></button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-400 p-2 mr-2"><TrashIcon className="h-5 w-5"/></button>

                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingReservation ? "تعديل حجز" : "إضافة حجز جديد"}>
        <ReservationForm reservation={editingReservation} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Reservations;