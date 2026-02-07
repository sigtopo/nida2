
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const FloodMap: React.FC<{ userLat: number; userLng: number }> = ({ userLat, userLng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      minZoom: 12,
      maxZoom: 12,
      dragging: true
    }).setView([34.5, -6.0], 12);
    
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.tileLayer('https://geotoposig.com/zones_inondables/12/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 12,
      opacity: 1,
      attribution: 'GeoTopo SIG - Flood Zones'
    }).addTo(map);

    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-ping',
        html: `<div class="relative flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span></div>`,
        iconSize: [16, 16]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<b>موقعك الحالي</b>");
    }

    // تم إزالة مستمع النقر (map.on click) لمنع إضافة النقاط

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng]);

  return (
    <div className="relative h-screen sm:h-[750px] w-full bg-white overflow-hidden shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      <div className="absolute top-4 right-4 z-[1000] bg-white/50 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-blue-50 max-w-[280px]">
        <h3 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2 text-right">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          خريطة حوض سبو - المناطق المغمورة
        </h3>
        
        <div className="flex flex-col gap-2 border-t border-blue-50/50 pt-3 text-right">
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
              مناطق مغمورة بالمياه <div className="w-3.5 h-3.5 rounded bg-blue-500 opacity-80"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
              حدود الجماعات <div className="w-3.5 h-3.5 rounded bg-[#32E02D]"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
              الشبكة المائية <div className="w-3.5 h-3.5 rounded bg-[#134CDD]"></div>
           </div>
           <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-600">
              مسافة 1 كلم عن الواد <div className="w-3.5 h-3.5 rounded bg-[#B74840]"></div>
           </div>
        </div>
      </div>
      
      <footer className="absolute bottom-0 w-full text-center py-2 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-slate-500 border-t border-slate-200 z-[1000]">
        Sources des données : Sentinel-1 SAR (Copernicus, GEE), HCP, OSM / QGIS, Geotoposig
      </footer>
    </div>
  );
};
