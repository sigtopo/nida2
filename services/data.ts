
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

const ADMIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/1EWdDVYYX7P5TcZElS54N6V49sCTJ5gnVkrgvhN1B9M4/export?format=csv';
const LOG_DATA_URL = 'https://docs.google.com/spreadsheets/d/1Hsk6Ja7yB8ELZG8jj_C5zQQrc7p6s2n2aX-pml89f3k/export?format=csv';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(cell.trim()); cell = ''; }
    else cell += char;
  }
  result.push(cell.trim());
  return result;
}

export const fetchAdminData = async (): Promise<AdminRow[]> => {
  try {
    const response = await fetch(ADMIN_DATA_URL);
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    return lines.slice(1).map(line => {
      const cols = parseCSVLine(line);
      return { region: cols[0], province: cols[1], commune: cols[2], douar: cols[3] };
    });
  } catch (e) { return []; }
};

export const fetchSubmittedLogs = async (): Promise<SubmissionRow[]> => {
  try {
    const response = await fetch(LOG_DATA_URL);
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    // تجاوز السطر الأول (العناوين)
    return lines.slice(1).map(line => {
      const cols = parseCSVLine(line);
      return {
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
      };
    });
  } catch (e) { return []; }
};
