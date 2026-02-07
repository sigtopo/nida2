
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SubmissionRow } from '../services/data';

interface MapDashboardProps {
  logs: SubmissionRow[];
  userLat: number;
  userLng: number;
}

export const MapDashboard: React.FC<MapDashboardProps> = ({ logs, userLat, userLng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // تهيئة الخريطة حسب الإعدادات المطلوبة
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      minZoom: 12,
      maxZoom: 12,
      dragging: true
    }).setView([34.5, -6.0], 12);
    
    mapRef.current = map;

    // طبقة أساسية خفيفة
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 🌊 طبقة الفيضانات كخلفية (تظهر بسرعة لأن الزووم ثابت)
    L.tileLayer('https://geotoposig.com/zones_inondables/12/{x}/{y}.png', {
      opacity: 1,
      attribution: 'Flood Zones Data'
    }).addTo(map);

    // أيقونة الموقع الحالي
    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-location-ping',
        html: `<div class="relative flex h-5 w-5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span></div>`,
        iconSize: [20, 20]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<b>موقعك الحالي</b>");
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // إضافة النقاط المسجلة
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    logs.forEach(log => {
      if (!log.locationXY) return;
      
      const parts = log.locationXY.split(',');
      if (parts.length < 2) return;
      
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      
      if (isNaN(lat) || isNaN(lng)) return;

      let color = "#64748b";
      if (log.urgency.includes('حرج') || log.urgency.includes('٤')) color = "#ef4444";
      else if (log.urgency.includes('مرتفع') || log.urgency.includes('٣')) color = "#f97316";
      else if (log.urgency.includes('متوسط') || log.urgency.includes('٢')) color = "#fbbf24";
      else if (log.urgency.includes('منخفض') || log.urgency.includes('١')) color = "#10b981";

      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-right dir-rtl p-1">
          <div class="font-black text-slate-800 text-sm mb-1">${log.douar}</div>
          <div class="text-[10px] text-slate-500 mb-2 font-bold">${log.commune}</div>
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
            <div class="text-[10px] font-black text-rose-500 mb-0.5">الأضرار:</div>
            <div class="text-[10px] leading-tight text-slate-600 font-bold">${log.damage}</div>
          </div>
          <hr class="my-2 border-slate-100"/>
          <a href="tel:${log.phone}" class="text-xs font-black text-blue-600 flex items-center justify-center gap-1">📞 ${log.phone}</a>
        </div>
      `);
    });
  }, [logs]);

  return (
    <div className="relative h-full w-full bg-slate-100">
      <div ref={mapContainerRef} id="map" className="h-full w-full" />
      
      {/* مفتاح الخريطة المحدث - شفافية 50% */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 max-w-[240px]">
        <h3 className="text-[11px] font-black text-blue-900 mb-3 flex items-center gap-2 text-right">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          مفتاح الخريطة
        </h3>
        
        <div className="flex flex-col gap-2.5 text-right">
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-800">
              مناطق مغمورة بالمياه <div className="w-3 h-3 rounded bg-[#3b82f6] shadow-sm"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-800">
              حدود الجماعات <div className="w-3 h-3 rounded bg-[#32E02D] shadow-sm"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-800">
              الشبكة المائية <div className="w-3 h-3 rounded bg-[#134CDD] shadow-sm"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-800">
              مسافة 1 كلم عن الواد <div className="w-3 h-3 rounded bg-[#B74840] shadow-sm"></div>
           </div>
           
           <div className="pt-2 mt-1 border-t border-slate-900/10">
              <div className="flex items-center justify-end gap-2 text-[10px] font-black text-rose-600">
                 نقطة تدخل حرج <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
