
import { FormData } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzP4-CfvneO1xKcScwpnVTpqpU0cESy9WCiQAtef4g0bwesy3t67wvkbTUaQc2-mfc/exec';

export const submitFormData = async (data: FormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Note: Google Apps Script Web Apps often require 'no-cors' mode 
    // to avoid CORS errors if they don't explicitly handle OPTIONS requests.
    // However, with 'no-cors' we can't read the response body.
    // We try with default fetch first, if it fails, fallback.
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Common pattern for Google Apps Script triggers
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Since 'no-cors' always returns type 'opaque', we assume success if no error is thrown
    return { 
      success: true, 
      message: 'تم إرسال البيانات بنجاح' 
    };
  } catch (error) {
    console.error('Submission error:', error);
    return { 
      success: false, 
      message: 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.' 
    };
  }
};
