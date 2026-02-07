
export interface AdminRow {
  region: string;
  province: string;
  commune: string;
  douar: string;
}

export interface SubmissionRow {
  region: string;
  province: string;
  commune: string;
  douar: string;
  urgency: string;
  damage: string;
  needs: string;
  phone: string;
  locationXY: string;
  mapLink: string;
}

// الروابط الأساسية
const ADMIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/1EWdDVYYX7P5TcZElS54N6V49sCTJ5gnVkrgvhN1B9M4/export?format=csv&gid=1269566974';
const LOG_DATA_URL = 'https://docs.google.com/spreadsheets/d/1Hsk6Ja7yB8ELZG8jj_C5zQQrc7p6s2n2aX-pml89f3k/export?format=csv';

/**
 * دالة متطورة لتحليل ملفات CSV بالكامل
 * تعالج النصوص التي تحتوي على فواصل أو أسطر جديدة داخل الاقتباسات
 */
function parseFullCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // تخطي الاقتباس المزدوج
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      }
      if (char === '\r' && nextChar === '\n') i++; // تخطي أسطر Windows
    } else {
      currentCell += char;
    }
  }
  
  if (currentRow.length > 0 || currentCell !== '') {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * جلب المعطيات مع معالجة محسنة للأخطاء
 */
const fetchData = async (url: string): Promise<string[][]> => {
  try {
    // إضافة طابع زمني لمنع الكاش وتجنب بعض مشاكل CORS
    const timestamp = new Date().getTime();
    const finalUrl = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;

    const response = await fetch(finalUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (text.includes('<!DOCTYPE html>') || text.includes('google-signin')) {
      throw new Error("تنبيه: يبدو أن الجدول غير متاح للعموم. يرجى التأكد من ضبط إعدادات المشاركة على 'Anyone with the link can view'.");
    }

    return parseFullCSV(text);
  } catch (error) {
    console.error("Fetch failure detailed report:", error);
    throw error;
  }
};

export const fetchAdminData = async (): Promise<AdminRow[]> => {
  try {
    const rows = await fetchData(ADMIN_DATA_URL);
    // نقوم بتصفية الصف الأول (Header) ومعالجة البيانات
    return rows.slice(1).map(cols => ({ 
      region: (cols[0] || '').trim(), 
      province: (cols[1] || '').trim(), 
      commune: (cols[2] || '').trim(), 
      douar: (cols[3] || '').trim() 
    })).filter(r => r.region !== '');
  } catch (e) { 
    return []; 
  }
};

export const fetchSubmittedLogs = async (): Promise<SubmissionRow[]> => {
  try {
    const rows = await fetchData(LOG_DATA_URL);
    return rows.slice(1).map(cols => ({
      region: cols[0] || '',
      province: cols[1] || '',
      commune: cols[2] || '',
      douar: cols[3] || '',
      urgency: cols[4] || '',
      damage: cols[5] || '',
      needs: cols[6] || '',
      phone: cols[7] || '',
      locationXY: cols[8] || '',
      mapLink: cols[9] || ''
    })).filter(r => r.region !== '');
  } catch (e) { 
    return []; 
  }
};
