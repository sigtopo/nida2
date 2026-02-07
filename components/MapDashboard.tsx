
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

    // تهيئة الخريطة
    const map = L.map(mapContainerRef.current).setView([userLat || 31.7917, userLng || -7.0926], 8);
    mapRef.current = map;

    // الخريطة الأساسية (OpenStreetMap)
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // طبقة صور الأقمار الصناعية
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri'
    });

    // 🔴 طبقة مناطق الفيضانات (الخاصة بالمستخدم)
    const floodLayer = L.tileLayer('https://geotoposig.com/zones_inondables/{z}/{x}/{y}.png', {
      opacity: 0.7,
      maxZoom: 19,
      attribution: 'Flood Zones Data'
    }).addTo(map);

    // التحكم في الطبقات
    L.control.layers({
      "خريطة الشوارع": baseLayer,
      "صور الأقمار الصناعية": satelliteLayer
    }, {
      "مناطق الفيضانات 🌊": floodLayer
    }, { position: 'topleft' }).addTo(map);

    // أيقونة الموقع الحالي
    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-location-ping',
        html: `<div class="relative flex h-5 w-5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white"></span></div>`,
        iconSize: [20, 20]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<b>موقعك الحالي</b>");
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // تحديث النقاط عند تغير البيانات
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

      // اختيار اللون حسب مستوى الخطورة
      let color = "#64748b"; // default
      if (log.urgency.includes('حرج') || log.urgency.includes('٤')) color = "#ef4444"; // rose-500
      else if (log.urgency.includes('مرتفع') || log.urgency.includes('٣')) color = "#f97316"; // orange-500
      else if (log.urgency.includes('متوسط') || log.urgency.includes('٢')) color = "#fbbf24"; // amber-400
      else if (log.urgency.includes('منخفض') || log.urgency.includes('١')) color = "#10b981"; // emerald-500

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-right dir-rtl">
          <div class="font-bold text-slate-800 text-sm mb-1">${log.douar}</div>
          <div class="text-[10px] text-slate-500 mb-2">${log.commune} - ${log.province}</div>
          <div class="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
            <div class="text-[11px] font-bold text-rose-500 mb-1">الأضرار:</div>
            <div class="text-[11px] leading-relaxed text-slate-600">${log.damage}</div>
          </div>
          <div class="text-[11px] font-bold text-emerald-600 mb-1">الاحتياجات:</div>
          <div class="text-[11px] leading-relaxed text-slate-600">${log.needs}</div>
          <hr class="my-2 border-slate-100"/>
          <a href="tel:${log.phone}" class="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">📞 ${log.phone}</a>
        </div>
      `);
    });
  }, [logs]);

  return (
    <div className="relative">
      <div ref={mapContainerRef} id="map" className="shadow-2xl border-4 border-white shadow-slate-200" />
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100 text-[11px] font-bold space-y-2">
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> حرج جداً / كارثي</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f97316]"></div> مرتفع الخطورة</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div> متوسط</div>
         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> مستقر</div>
         <div className="pt-2 border-t border-slate-200 text-blue-600">🔵 موقعك الحالي</div>
      </div>
    </div>
  );
};
