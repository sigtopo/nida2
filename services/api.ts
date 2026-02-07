
import { FormData } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzP4-CfvneO1xKcScwpnVTpqpU0cESy9WCiQAtef4g0bwesy3t67wvkbTUaQc2-mfc/exec';

export const submitFormData = async (data: FormData): Promise<{ success: boolean; message: string }> => {
  try {
    // نستخدم 'no-cors' لأن Google Apps Script يقوم بعمل تحويل (Redirect)
    // لا يدعم متصفحات الويب بشكل افتراضي في طلبات POST المباشرة
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // في وضع 'no-cors'، إذا لم يحدث خطأ (Exception)، نعتبر العملية ناجحة
    return { 
      success: true, 
      message: 'تم إرسال البيانات بنجاح' 
    };
  } catch (error) {
    console.error('Submission error:', error);
    return { 
      success: false, 
      message: 'حدث خطأ أثناء إرسال البيانات. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.' 
    };
  }
};
