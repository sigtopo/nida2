
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const FloodMap: React.FC<{ userLat: number; userLng: number }> = ({ userLat, userLng }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // تهيئة الخريطة حسب الإحداثيات المطلوبة (سهل الغرب/سبو) وزوم ثابت 12
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      minZoom: 12,
      maxZoom: 12,
      dragging: true
    }).setView([34.5, -6.0], 12);
    
    mapRef.current = map;

    // طبقة الخريطة الأساسية
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // طبقة بلاطات الفيضانات المطلوبة حصرياً (زوم 12 متبث)
    L.tileLayer('https://geotoposig.com/zones_inondables/12/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 12,
      opacity: 1,
      attribution: 'GeoTopo SIG - Flood Zones'
    }).addTo(map);

    // الموقع الحالي
    if (userLat && userLng) {
      const userIcon = L.divIcon({
        className: 'user-ping',
        html: `<div class="relative flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-lg"></span></div>`,
        iconSize: [16, 16]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map).bindPopup("<b>موقعك الحالي</b>");
    }

    // إضافة وظيفة النقر لإضافة نقطة
    map.on('click', (e) => {
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 flex flex-col gap-2 min-w-[200px] text-right';
      popupContent.innerHTML = `
        <label class="text-xs font-bold text-slate-700">اسم الدوار أو النقطة :</label>
        <input type="text" id="tempDouarName" placeholder="مثال: دوار السهب" class="border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-rose-500" />
        <button id="addMarkerBtn" class="bg-rose-600 text-white text-xs font-bold py-2 rounded hover:bg-rose-700 transition-colors">إضافة علامة</button>
      `;

      const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);

      // التعامل مع الزر داخل النافذة المنبثقة
      setTimeout(() => {
        const btn = document.getElementById('addMarkerBtn');
        const input = document.getElementById('tempDouarName') as HTMLInputElement;
        btn?.addEventListener('click', () => {
          const name = input.value;
          if (name) {
            L.marker(e.latlng, {
              icon: L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              })
            })
            .addTo(map)
            .bindPopup(`<b class="text-rose-600">${name}</b>`)
            .openPopup();
            map.closePopup();
          }
        });
      }, 100);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-screen sm:h-[750px] w-full bg-white overflow-hidden shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* سهم الشمال */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/North_arrow.svg/120px-North_arrow.svg.png" 
        className="absolute top-4 left-4 z-[1000] w-12 drop-shadow-lg opacity-80" 
        alt="North Arrow" 
      />

      {/* لوحة التحكم الجانبية */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-blue-50 max-w-[280px]">
        <h3 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          خريطة حوض سبو - المناطق المغمورة
        </h3>
        <p className="text-[10px] text-blue-600 font-bold opacity-80 mb-3 leading-relaxed">
          نظام المراقبة الهيدرولوجية الرقمي (Sentinel-1 SAR). <br/>
          يمكنك الضغط على الخريطة لتحديد أسماء الدواوير.
        </p>
        <div className="flex flex-col gap-2 border-t border-blue-50 pt-3">
           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
              <div className="w-3 h-3 rounded bg-blue-500 opacity-80"></div> مناطق مغمورة بالمياه
           </div>
           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
              <img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" className="w-4" /> نقاط ميدانية مضافة
           </div>
        </div>
      </div>

      {/* فوتر الخريطة */}
      <footer className="absolute bottom-0 w-full text-center py-2 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-slate-500 border-t border-slate-200 z-[1000]">
        Sources des données : Sentinel-1 SAR (Copernicus, GEE), HCP, OSM / QGIS, Geotoposig
      </footer>
    </div>
  );
};
