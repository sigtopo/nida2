
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SubmissionRow } from '../services/data';
import { X, Phone, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';

interface DistributionMapProps {
  logs: SubmissionRow[];
  onClose: () => void;
  userLat: number;
  userLng: number;
}

export const DistributionMap: React.FC<DistributionMapProps> = ({ logs, onClose, userLat, userLng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([34.33, -6.13], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    mapRef.current = map;

    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>`,
        iconSize: [16, 16]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("موقعك الحالي");
    }

    logs.forEach(log => {
      if (!log.locationXY) return;
      const parts = log.locationXY.split(',');
      if (parts.length < 2) return;
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lng)) return;

      let color = "#64748b";
      if (log.urgency.includes('حرج') || log.urgency.includes('4')) color = "#ef4444";
      else if (log.urgency.includes('مرتفع') || log.urgency.includes('3')) color = "#f97316";
      else if (log.urgency.includes('متوسط') || log.urgency.includes('2')) color = "#fbbf24";
      else if (log.urgency.includes('منخفض') || log.urgency.includes('1')) color = "#10b981";

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'blinking-marker' // إضافة كلاس الوميض
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-right p-1 min-w-[150px]">
          <div class="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">${log.douar}</div>
          <div class="text-[10px] text-slate-500 mb-2">${log.commune}</div>
          <div class="text-[11px] font-bold text-slate-700 mb-2">${log.damage}</div>
          <a href="tel:${log.phone}" class="text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 bg-blue-50 py-1.5 rounded-lg">📞 ${log.phone}</a>
        </div>
      `);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [logs, userLat, userLng]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 sm:p-10 animate-fade-in">
      <div className="relative w-full h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        
        {/* شريط العنوان مع ملصق no officiel */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2001] flex items-center gap-4 bg-white/95 backdrop-blur-sm px-8 py-3 rounded-2xl shadow-xl border border-slate-100">
           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">No Officiel</span>
           <h3 className="text-sm font-black text-slate-800 whitespace-nowrap">خريطة التوزيع الميداني</h3>
        </div>

        {/* الخريطة */}
        <div ref={mapContainerRef} className="flex-1" />

        {/* زر الإغلاق باللون الأحمر في الوسط بالأسفل */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2001]">
          <button 
            onClick={onClose} 
            className="bg-rose-600 text-white flex items-center gap-2 px-10 py-4 rounded-2xl shadow-2xl hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all font-black text-sm"
          >
            <X size={20} />
            إغلاق الخريطة
          </button>
        </div>
      </div>
    </div>
  );
};
