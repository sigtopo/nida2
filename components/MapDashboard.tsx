
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SubmissionRow } from '../services/data';
import { ExternalLink, Layers, Navigation } from 'lucide-react';

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

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      minZoom: 12,
      maxZoom: 12,
      dragging: true
    }).setView([34.33, -6.13], 12);
    
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.tileLayer('https://geotoposig.com/zones_inondables/12/{x}/{y}.png', {
      opacity: 0.9,
      attribution: 'Flood Zones Data - GeoTopoSIG'
    }).addTo(map);

    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-location-ping',
        html: `<div class="relative flex h-6 w-6"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-4 border-white shadow-lg"></span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<b>موقعك الحالي</b>");
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng]);

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
      if (log.urgency.includes('حرج') || log.urgency.includes('4')) color = "#ef4444";
      else if (log.urgency.includes('مرتفع') || log.urgency.includes('3')) color = "#f97316";
      else if (log.urgency.includes('متوسط') || log.urgency.includes('2')) color = "#fbbf24";
      else if (log.urgency.includes('منخفض') || log.urgency.includes('1')) color = "#10b981";

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
      
      {/* التحكم والأدوات على الخريطة */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3 max-w-[260px]">
        {/* مفتاح الخريطة */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/20">
          <h3 className="text-[11px] font-black text-slate-800 mb-3 text-right flex items-center justify-end gap-2">
            مفتاح الخريطة <Layers size={14} className="text-blue-500" />
          </h3>
          <div className="flex flex-col gap-2.5 text-right">
             <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
                مناطق مهددة بالفيضان <div className="w-3 h-3 rounded bg-blue-500/60 shadow-sm border border-blue-400"></div>
             </div>
             <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
                بلاغات مستعجلة <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm border border-white"></div>
             </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-400 font-bold text-center italic">الزووم مثبت عند 12 لبيانات الفيضان</div>
        </div>

        {/* زر الخريطة الخارجية (رابط النافذة الجديدة) */}
        <a 
          href="https://geotoposig.com/zones_inondables/12/zones_inondables.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 group border border-slate-700"
        >
          <div className="bg-blue-500 p-1.5 rounded-lg text-white">
            <Navigation size={14} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-tight">فتح الخريطة الكاملة</span>
            <span className="text-[8px] opacity-60 font-bold">نافذة تفاعلية مستقلة</span>
          </div>
          <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ml-auto" />
        </a>
      </div>
    </div>
  );
};
