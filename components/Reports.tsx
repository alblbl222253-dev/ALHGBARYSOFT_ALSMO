import React, { useState, useEffect } from 'react';
import { generateFinancialSummary } from '../services/geminiService';
import { Reservation, Expense, Partner, Withdrawal } from '../types';
import { getData, saveData, getSettings } from '../services/storageService';
import Modal from './common/Modal';
import { PlusIcon, TrashIcon, EditIcon, SparklesIcon } from './common/icons';

// Expense Management Component
const ExpenseSection: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    useEffect(() => { setExpenses(getData<Expense>('expenses')); }, []);

    const handleSave = (expense: Expense) => {
        const updated = editingExpense ? expenses.map(e => e.id === expense.id ? expense : e) : [...expenses, expense];
        setExpenses(updated);
        saveData('expenses', updated);
        setModalOpen(false);
        setEditingExpense(null);
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("هل تريد حذف هذا المصروف؟")) return;
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        saveData('expenses', updated);
    };

    return (
        <div className="mt-8 bg-[#1F1C2E]/60 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">المصروفات</h3>
                <button onClick={() => { setEditingExpense(null); setModalOpen(true); }} className="flex items-center text-sm px-3 py-1.5 bg-blue-600/50 text-blue-200 border border-blue-500/30 rounded-lg hover:bg-blue-600/80 transition-colors">
                    <PlusIcon className="h-4 w-4 ml-1" /> إضافة مصروف
                </button>
            </div>
            {/* Expense List */}
            <ul className="space-y-2 max-h-60 overflow-y-auto pl-2">
                {expenses.map(e => (
                    <li key={e.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                        <div>
                            <p className="text-white font-medium">{e.description} ({e.category})</p>
                            <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-red-400 font-semibold ml-4">{e.amount.toFixed(2)}</p>
                            <button onClick={() => { setEditingExpense(e); setModalOpen(true); }} className="text-gray-400 hover:text-white p-1"><EditIcon className="h-4 w-4"/></button>
                            <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-400 p-1"><TrashIcon className="h-4 w-4"/></button>
                        </div>
                    </li>
                ))}
            </ul>
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingExpense ? "تعديل المصروف" : "إضافة مصروف"}>
                <ExpenseForm expense={editingExpense} onSave={handleSave} onClose={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
};

const ExpenseForm: React.FC<{ expense: Expense | null, onSave: (e: Expense) => void, onClose: () => void }> = ({ expense, onSave, onClose }) => {
    const [form, setForm] = useState({ description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'عام', ...expense });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...form, id: expense?.id || Date.now().toString() });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <input name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="الوصف" required className="w-full bg-gray-700 p-2 rounded"/>
            <input name="category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="الفئة" required className="w-full bg-gray-700 p-2 rounded"/>
            <input type="number" name="amount" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} placeholder="المبلغ" required className="w-full bg-gray-700 p-2 rounded"/>
            <input type="date" name="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full bg-gray-700 p-2 rounded"/>
            <div className="flex justify-end space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">إلغاء</button><button type="submit" className="px-4 py-2 bg-purple-600 rounded">حفظ</button></div>
        </form>
    );
};


// Main Reports Component
const Reports: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const settings = getSettings();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    const financialData = {
      reservations: getData<Reservation>('reservations'),
      expenses: getData<Expense>('expenses'),
      partners: getData<Partner>('partners'),
      currency: settings?.currency || 'YER'
    };
    const result = await generateFinancialSummary(financialData);
    setSummary(result);
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">التقارير والمالية</h2>
      
      <div className="bg-[#1F1C2E]/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">الملخص المالي بالذكاء الاصطناعي</h3>
        <p className="text-gray-400 mb-4">
          انقر على الزر أدناه لإنشاء ملخص مدعوم بالذكاء الاصطناعي للأداء المالي لعملك.
          يستخدم هذا واجهة Gemini API لتحليل بيانات الإيرادات والمصروفات والشركاء.
        </p>
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-yellow-500 text-white rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="h-5 w-5 ml-2" />
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء ملخص AI'}
        </button>
        
        {isLoading && <div className="mt-4 text-center text-gray-300">جاري تحليل البيانات، يرجى الانتظار...</div>}
        
        {summary && (
          <div className="mt-6 p-4 bg-black/20 rounded-lg border border-gray-700 text-right">
            <pre className="whitespace-pre-wrap font-sans text-gray-200 text-sm leading-relaxed">{summary}</pre>
          </div>
        )}
      </div>

      <ExpenseSection />
    </div>
  );
};

export default Reports;