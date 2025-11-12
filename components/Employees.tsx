import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { getData, saveData } from '../services/storageService';
import Modal from './common/Modal';
import { EditIcon, TrashIcon, PlusIcon } from './common/icons';

const EmployeeForm: React.FC<{
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  onClose: () => void;
}> = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    position: '',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    ...employee,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'salary' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: employee?.id || new Date().toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">اسم الموظف</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
      </div>
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-300">المنصب</label>
        <input type="text" name="position" value={formData.position} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
      </div>
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-300">الراتب</label>
        <input type="number" name="salary" value={formData.salary} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
      </div>
      <div>
        <label htmlFor="hireDate" className="block text-sm font-medium text-gray-300">تاريخ التعيين</label>
        <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white"/>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">إلغاء</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">حفظ الموظف</button>
      </div>
    </form>
  );
};

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setEmployees(getData<Employee>('employees'));
  }, []);

  const handleSave = (employee: Employee) => {
    let updatedEmployees;
    if (editingEmployee) {
      updatedEmployees = employees.map(e => e.id === employee.id ? employee : e);
    } else {
      updatedEmployees = [...employees, employee];
    }
    setEmployees(updatedEmployees);
    saveData('employees', updatedEmployees);
    setIsModalOpen(false);
    setEditingEmployee(null);
  };
  
  const handleDelete = (id: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف سجل هذا الموظف؟')) {
        const updatedEmployees = employees.filter(e => e.id !== id);
        setEmployees(updatedEmployees);
        saveData('employees', updatedEmployees);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">الموظفين</h2>
        <button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة موظف
        </button>
      </div>

       <div className="bg-[#1F1C2E]/60 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الاسم</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">المنصب</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الراتب</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاريخ التعيين</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {employees.map(e => (
                <tr key={e.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{e.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{e.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{e.salary.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(e.hireDate).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button onClick={() => { setEditingEmployee(e); setIsModalOpen(true); }} className="text-purple-400 hover:text-purple-300 p-2"><EditIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-400 p-2 mr-2"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? "تعديل موظف" : "إضافة موظف جديد"}>
        <EmployeeForm employee={editingEmployee} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Employees;