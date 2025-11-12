import React, { useState, useEffect, useMemo } from 'react';
import { Partner, Withdrawal, Reservation, Expense } from '../types';
import { getData, saveData } from '../services/storageService';
import Modal from './common/Modal';
import { EditIcon, TrashIcon, PlusIcon, UsersIcon, CashIcon, InfoIcon } from './common/icons';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper to get a partner's total investment value regardless of method
const getPartnerInvestment = (partner: Partner): number => {
    if (partner.shareMethod === 'shares') {
        return (partner.numberOfShares || 0) * (partner.shareValue || 0);
    }
    return partner.totalInvested || 0;
};


// Withdrawal Management Component
const WithdrawalManager: React.FC<{
    partner: Partner;
    allPartners: Partner[];
    allWithdrawals: Withdrawal[];
    reservations: Reservation[];
    expenses: Expense[];
    onUpdate: (updatedWithdrawals: Withdrawal[]) => void;
}> = ({ partner, allPartners, allWithdrawals, reservations, expenses, onUpdate }) => {
    
    const [newWithdrawal, setNewWithdrawal] = useState<Omit<Withdrawal, 'id' | 'partnerId' | 'partnerName'>>({
        amount: 0,
        receiptNumber: '',
        date: new Date().toISOString().split('T')[0],
        recipientName: '',
        receiptImage: undefined,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const partnerWithdrawals = allWithdrawals.filter(w => w.partnerId === partner.id);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setNewWithdrawal(prev => ({ ...prev, receiptImage: base64 }));
            setImagePreview(base64);
        }
    };
    
    const handleSave = () => {
        // Advanced Profit Calculation
        const totalRevenue = reservations.reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;

        const totalCompanyInvestment = allPartners.reduce((sum, p) => sum + getPartnerInvestment(p), 0);
        const partnerInvestment = getPartnerInvestment(partner);
        const partnerEffectivePercentage = totalCompanyInvestment > 0 ? (partnerInvestment / totalCompanyInvestment) * 100 : 0;
        
        const partnerShare = netProfit * (partnerEffectivePercentage / 100);

        const partnerTotalWithdrawals = partnerWithdrawals.reduce((sum, w) => sum + w.amount, 0);
        const newTotalWithdrawals = partnerTotalWithdrawals + newWithdrawal.amount;

        // Warning logic
        if (newTotalWithdrawals > partnerShare) {
            const confirmation = window.confirm(
                `تحذير: هذا السحب يتجاوز حصة الشريك من الأرباح الحالية البالغة ${partnerShare.toFixed(2)} (بناءً على نسبة فعالة ${partnerEffectivePercentage.toFixed(2)}%). \nإجمالي المسحوبات سيصبح ${newTotalWithdrawals.toFixed(2)}. \nهل تريد المتابعة؟`
            );
            if (!confirmation) {
                return;
            }
        }

        const withdrawalToAdd: Withdrawal = {
            ...newWithdrawal,
            id: Date.now().toString(),
            partnerId: partner.id,
            partnerName: partner.name,
        };

        const updated = [...allWithdrawals, withdrawalToAdd];
        onUpdate(updated);
        
        // Reset form
        setNewWithdrawal({ amount: 0, receiptNumber: '', date: new Date().toISOString().split('T')[0], recipientName: '', receiptImage: undefined });
        setImagePreview(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm("هل أنت متأكد من حذف هذا السحب؟")) {
            const updated = allWithdrawals.filter(w => w.id !== id);
            onUpdate(updated);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add new withdrawal form */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-bold text-lg mb-3 text-white">إضافة سحب جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="المبلغ" value={newWithdrawal.amount} onChange={e => setNewWithdrawal(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="bg-gray-700 p-2 rounded text-white"/>
                    <input type="text" placeholder="رقم السند" value={newWithdrawal.receiptNumber} onChange={e => setNewWithdrawal(p => ({ ...p, receiptNumber: e.target.value }))} className="bg-gray-700 p-2 rounded text-white"/>
                    <input type="text" placeholder="اسم المستلم" value={newWithdrawal.recipientName} onChange={e => setNewWithdrawal(p => ({ ...p, recipientName: e.target.value }))} className="bg-gray-700 p-2 rounded text-white"/>
                    <input type="date" value={newWithdrawal.date} onChange={e => setNewWithdrawal(p => ({ ...p, date: e.target.value }))} className="bg-gray-700 p-2 rounded text-white"/>
                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-300 mb-1">صورة السند (اختياري)</label>
                         <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/40"/>
                    </div>
                     {imagePreview && <img src={imagePreview} alt="Preview" className="md:col-span-2 rounded-md max-h-40 object-contain"/>}
                </div>
                <button onClick={handleSave} className="mt-4 px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors w-full">حفظ السحب</button>
            </div>

            {/* List of existing withdrawals */}
            <div>
                 <h4 className="font-bold text-lg mb-3 text-white">سجل المسحوبات</h4>
                 <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {partnerWithdrawals.length > 0 ? partnerWithdrawals.map(w => (
                        <li key={w.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                            <div>
                                <p className="font-semibold text-white">{w.recipientName} - <span className="text-purple-300">{w.amount.toFixed(2)}</span></p>
                                <p className="text-xs text-gray-400">سند #{w.receiptNumber} | {new Date(w.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {w.receiptImage && <a href={w.receiptImage} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">عرض السند</a>}
                                <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:text-red-400 p-1"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        </li>
                    )) : <p className="text-gray-500 text-center py-4">لا توجد مسحوبات لهذا الشريك.</p>}
                 </ul>
            </div>
        </div>
    );
};


const PartnerForm: React.FC<{
  partner: Partner | null;
  onSave: (partner: Partner) => void;
  onClose: () => void;
}> = ({ partner, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Partner, 'id'>>({
    name: '',
    position: '',
    shareMethod: 'percentage',
    sharePercentage: 0,
    totalInvested: 0,
    numberOfShares: 0,
    shareValue: 0,
    ...partner,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['sharePercentage', 'totalInvested', 'numberOfShares', 'shareValue'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: partner?.id || new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">اسم الشريك</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">الوظيفة في الصالة</label>
        <input type="text" name="position" value={formData.position} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">طريقة تحديد الحصة</label>
        <select name="shareMethod" value={formData.shareMethod} onChange={handleChange} className="w-full bg-gray-700 p-2 rounded text-white">
            <option value="percentage">نسبة مئوية</option>
            <option value="shares">عدد أسهم</option>
        </select>
      </div>

      {formData.shareMethod === 'percentage' ? (
        <div className="space-y-4 p-4 bg-gray-800/50 rounded-md animate-fade-in-fast">
            <div>
                <label className="block text-sm font-medium text-gray-300">نسبة الحصة (%)</label>
                <input type="number" name="sharePercentage" value={formData.sharePercentage} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">إجمالي الاستثمار</label>
                <input type="number" name="totalInvested" value={formData.totalInvested} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
            </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 bg-gray-800/50 rounded-md animate-fade-in-fast">
            <div>
                <label className="block text-sm font-medium text-gray-300">عدد الأسهم</label>
                <input type="number" name="numberOfShares" value={formData.numberOfShares} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">قيمة السهم الواحد</label>
                <input type="number" name="shareValue" value={formData.shareValue} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
            </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">حفظ الشريك</button>
      </div>
    </form>
  );
};

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  
  // State for withdrawal management
  const [managingWithdrawalsFor, setManagingWithdrawalsFor] = useState<Partner | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);


  useEffect(() => {
    setPartners(getData<Partner>('partners'));
    setWithdrawals(getData<Withdrawal>('withdrawals'));
    setReservations(getData<Reservation>('reservations'));
    setExpenses(getData<Expense>('expenses'));
  }, []);

  const handleSavePartner = (partner: Partner) => {
    let updatedPartners;
    if (editingPartner) {
      updatedPartners = partners.map(p => p.id === partner.id ? partner : p);
    } else {
      updatedPartners = [...partners, partner];
    }
    setPartners(updatedPartners);
    saveData('partners', updatedPartners);
    setIsModalOpen(false);
    setEditingPartner(null);
  };
  
  const handleDeletePartner = (id: string) => {
     if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا الشريك؟')) {
        const updatedPartners = partners.filter(p => p.id !== id);
        setPartners(updatedPartners);
        saveData('partners', updatedPartners);
    }
  };

  const handleWithdrawalsUpdate = (updatedWithdrawals: Withdrawal[]) => {
      setWithdrawals(updatedWithdrawals);
      saveData('withdrawals', updatedWithdrawals);
  };
  
  const totalEffectivePercentage = useMemo(() => {
    const totalInvestment = partners.reduce((sum, p) => sum + getPartnerInvestment(p), 0);
    if (totalInvestment === 0) return 0;
    
    // Check if any partner uses percentage method. If so, sum up their percentages directly.
    const percentageBasedPartners = partners.filter(p => p.shareMethod === 'percentage');
    if (percentageBasedPartners.length > 0 && percentageBasedPartners.length === partners.length) {
        return partners.reduce((sum, p) => sum + (p.sharePercentage || 0), 0);
    }
    
    // If mixed or all shares, calculate effective percentage for all.
    return 100; // Assuming total investment represents 100%
  }, [partners]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">الشركاء</h2>
        <button onClick={() => { setEditingPartner(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة شريك
        </button>
      </div>
       
      {Math.round(totalEffectivePercentage) !== 100 && partners.length > 0 && partners.every(p => p.shareMethod === 'percentage') && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-300">تنبيه الحصص</h4>
            <p className="text-sm text-yellow-400">
              مجموع نسب الحصص حالياً هو {totalEffectivePercentage}%. يرجى التأكد من أن المجموع يساوي 100% لتوزيع الأرباح بدقة.
            </p>
          </div>
        </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map(p => {
           const investment = getPartnerInvestment(p);
           return (
            <div key={p.id} className="bg-[#1F1C2E]/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{p.name}</h3>
                        <p className="text-sm text-gray-400">{p.position}</p>
                      </div>
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 text-left">
                        {p.shareMethod === 'shares' ? `${p.numberOfShares} سهم` : `${p.sharePercentage}%`}
                      </div>
                  </div>
                  <p className="text-gray-400 mt-2">قيمة الاستثمار: <span className="text-white font-semibold">{investment.toFixed(2)}</span></p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end items-center gap-2">
                  <button onClick={() => setManagingWithdrawalsFor(p)} className="flex items-center text-sm px-3 py-1.5 bg-green-600/50 text-green-200 border border-green-500/30 rounded-lg hover:bg-green-600/80 transition-colors">
                      <CashIcon className="h-4 w-4 ml-1"/> المسحوبات
                  </button>
                  <button onClick={() => { setEditingPartner(p); setIsModalOpen(true); }} className="text-purple-400 hover:text-purple-300 p-2"><EditIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleDeletePartner(p.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon className="h-5 w-5"/></button>
                </div>
            </div>
            );
        })}
      </div>
      
      {/* Modal for adding/editing partners */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPartner ? "تعديل شريك" : "إضافة شريك جديد"}>
        <PartnerForm partner={editingPartner} onSave={handleSavePartner} onClose={() => setIsModalOpen(false)} />
      </Modal>

      {/* Modal for managing withdrawals */}
      {managingWithdrawalsFor && (
          <Modal isOpen={true} onClose={() => setManagingWithdrawalsFor(null)} title={`مسحوبات الشريك: ${managingWithdrawalsFor.name}`}>
              <WithdrawalManager 
                partner={managingWithdrawalsFor}
                allPartners={partners}
                allWithdrawals={withdrawals}
                reservations={reservations}
                expenses={expenses}
                onUpdate={handleWithdrawalsUpdate}
              />
          </Modal>
      )}
    </div>
  );
};

export default Partners;