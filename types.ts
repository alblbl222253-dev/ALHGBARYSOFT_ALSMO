// types.ts

export type View = 'DASHBOARD' | 'RESERVATIONS' | 'PARTNERS' | 'EMPLOYEES' | 'REPORTS' | 'SETTINGS';

export interface Settings {
  hallName: string;
  currency: string;
  fiscalYear: number;
  adminUser: string;
  adminPass: string;
}

export type ReservationStatus = 'مؤكد' | 'ملغي' | 'مبدئي';
export type GenderType = 'رجال' | 'نساء' | 'رجال ونساء';
export type SetupType = 'كراسي وطاولات' | 'مجلس عربي';


export interface Reservation {
  id: string;
  renterName: string;         // اسم المستأجر
  personalId: string;         // رقم البطاقة الشخصية
  phoneNumber: string;        // رقم الهاتف
  date: string;               // تاريخ المناسبة (YYYY-MM-DD)
  startTime: string;          // وقت البدء
  endTime: string;            // وقت الانتهاء
  eventType: string;          // نوع المناسبة (زفاف، خطوبة، ..)
  genderType: GenderType;     // نوع الفرح (رجال، نساء)
  setupType: SetupType;       // تجهيز الصالة (كراسي، مجلس)
  amount: number;             // المبلغ الإجمالي
  downPayment: number;        // العربون / المبلغ المقبوض
  securityDepositType: string;// نوع التأمين (نقدي، ذهب، بطاقة...)
  securityDepositAmount: number; // مبلغ التأمين (إذا كان نقدياً)
  contractNumber: string;     // رقم العقد
  status: ReservationStatus;
}


export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
}

export interface Partner {
  id: string;
  name: string;
  position: string;                      // وظيفته في الصالة
  shareMethod: 'percentage' | 'shares';  // طريقة تحديد الحصة
  sharePercentage?: number;              // نسبة الحصة (اختياري)
  totalInvested?: number;                // إجمالي الاستثمار (اختياري)
  numberOfShares?: number;               // عدد الأسهم (اختياري)
  shareValue?: number;                   // قيمة السهم (اختياري)
}

export interface Withdrawal {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  receiptNumber: string;
  date: string; // YYYY-MM-DD
  recipientName: string;
  receiptImage?: string; // base64
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  hireDate: string; // YYYY-MM-DD
}