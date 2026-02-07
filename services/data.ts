
export interface AdminRow {
  region: string;
  province: string;
  commune: string;
  douar: string;
}

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1EWdDVYYX7P5TcZElS54N6V49sCTJ5gnVkrgvhN1B9M4/export?format=csv';

/**
 * دالة متطورة لتحليل سطر CSV
 * تتعامل مع النصوص التي تحتوي على فواصل بين علامات الاقتباس
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  result.push(cell.trim());
  return result;
}

export const fetchAdminData = async (): Promise<AdminRow[]> => {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const text = await response.text();
    // التعامل مع مختلف أنواع نهايات السطور
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    const rows: AdminRow[] = [];
    
    // تجاوز السطر الأول (العناوين)
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length >= 4) {
        rows.push({
          region: cols[0],
          province: cols[1],
          commune: cols[2],
          douar: cols[3]
        });
      }
    }
    
    return rows;
  } catch (error) {
    console.error('Error fetching administrative data:', error);
    return [];
  }
};
