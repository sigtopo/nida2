
import React from 'react';
import { X, FileText, MapPin, Gauge, Mail } from 'lucide-react';

interface WelcomePopupProps {
  onClose: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-slide-up cursor-default max-h-[95vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Section */}
        <div className="h-20 bg-rose-600 relative flex items-center justify-center shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/4 translate-y-1/4"></div>
          </div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="bg-white p-2.5 rounded-2xl shadow-xl z-10 group hover:scale-105 transition-all active:scale-95 flex items-center gap-2 px-6"
          >
            <X size={20} className="text-rose-600" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">إغلاق النافذة</span>
          </button>
        </div>

        <div className="p-5 sm:p-8 text-right dir-rtl">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-4 text-center">
            منصة التنسيق الميداني للطوارئ
          </h2>
          
          <p className="text-slate-600 leading-relaxed font-medium mb-5 text-center text-[11px] sm:text-xs">
            تم إنشاء هذه المنصة لرصد ضحايا الفيضانات والمتضررين العالقين، وتسهيل وصول فرق الإنقاذ إلى المناطق الأكثر حاجة.
          </p>

          <div className="grid gap-2 sm:gap-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-100/30">
              <div className="bg-rose-500 p-1.5 rounded-lg text-white shrink-0">
                <FileText size={14} />
              </div>
              <div>
                <h4 className="font-black text-rose-900 text-[11px]">ملء استمارة بسيطة</h4>
                <p className="text-[9px] text-rose-700 font-bold opacity-70">تسجيل البيانات والاحتياجات.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100/30">
              <div className="bg-blue-500 p-1.5 rounded-lg text-white shrink-0">
                <MapPin size={14} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-[11px]">تحديد الموقع الجغرافي</h4>
                <p className="text-[9px] text-blue-700 font-bold opacity-70">رصد الإحداثيات تلقائياً.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100/30">
              <div className="bg-emerald-500 p-1.5 rounded-lg text-white shrink-0">
                <Gauge size={14} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-[11px]">تقييم درجة الخطر</h4>
                <p className="text-[9px] text-emerald-700 font-bold opacity-70">تسريع قرار التدخل العاجل.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-50">
            {/* Developed By Section */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تم تطوير المنصة من طرف</span>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/212668090285" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group transition-all"
                  title="تواصل عبر واتساب"
                >
                  <div className="p-1.5 rounded-full bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                      alt="WhatsApp" 
                      className="w-5 h-5" 
                    />
                  </div>
                  <span className="text-emerald-700 font-black text-xs group-hover:scale-105 transition-transform">واتساب</span>
                </a>

                <div className="w-1 h-1 rounded-full bg-slate-200"></div>

                <a 
                  href="mailto:jilitsig@gmail.com"
                  className="text-slate-500 font-bold text-[11px] hover:text-rose-500 transition-colors flex items-center gap-1.5"
                >
                  <Mail size={12} />
                  jilitsig@gmail.com
                </a>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="mt-2 pt-4 border-t border-slate-50 w-full text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] select-none">
                copyright 2026 geojilit v1.02
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};
