
export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface FormData {
  region: string;
  province: string;
  commune: string;
  nom_douar: string;
  niveau_urgence: UrgencyLevel;
  nature_dommages: string;
  besoins_essentiels: string;
  numero_telephone: string;
  latitude: string;
  longitude: string;
  lien_maps: string;
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  [UrgencyLevel.LOW]: '١- منخفض',
  [UrgencyLevel.MEDIUM]: '٢- متوسط',
  [UrgencyLevel.HIGH]: '٣- مرتفع',
  [UrgencyLevel.CRITICAL]: '٤- حرج جداً'
};
