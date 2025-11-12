import { GoogleGenAI } from "@google/genai";
import { Reservation, Expense, Partner } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface FinancialData {
  reservations: Reservation[];
  expenses: Expense[];
  partners: Partner[];
  currency: string;
}

export const generateFinancialSummary = async (data: FinancialData): Promise<string> => {
  if (!process.env.API_KEY) {
    return "خطأ: مفتاح Gemini API غير مهيأ. يرجى تعيين متغير البيئة API_KEY.";
  }
  
  try {
    const model = 'gemini-2.5-flash';

    const totalRevenue = data.reservations.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const prompt = `
      تصرف كمحلل مالي لشركة قاعات أفراح.
      بناءً على البيانات التالية، قدم ملخصًا ماليًا دقيقًا وموجزًا لأداء الشركة باللغة العربية.
      - يجب أن يكون الملخص سهل القراءة لصاحب العمل، وليس للمحاسب.
      - ابدأ بنظرة عامة على الإيرادات والمصروفات وصافي الربح.
      - اذكر عدد الحجوزات وإجمالي عدد المصروفات.
      - تطرق بإيجاز إلى هيكل حصص الشركاء إذا كان هناك شركاء متعددون.
      - اختتم بملاحظة رئيسية أو اقتراح للتحسين.
      - جميع القيم النقدية بعملة ${data.currency}.

      البيانات المالية:
      - إجمالي الإيرادات من ${data.reservations.length} حجزًا: ${totalRevenue.toFixed(2)}
      - إجمالي المصروفات من ${data.expenses.length} بندًا: ${totalExpenses.toFixed(2)}
      - صافي الربح: ${netProfit.toFixed(2)}
      - الشركاء: ${data.partners.length} شركاء بحصص كالتالي: ${data.partners.map(p => `${p.name}: ${p.sharePercentage}%`).join('، ')}.
    `;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      return `حدث خطأ أثناء إنشاء الملخص: ${error.message}`;
    }
    return "حدث خطأ غير معروف أثناء إنشاء الملخص.";
  }
};