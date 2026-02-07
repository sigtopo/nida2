
import React from 'react';
import { X, AlertTriangle, FileText, MapPin, Gauge, Mail, ChevronLeft } from 'lucide-react';

interface WelcomePopupProps {
  onClose: () => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-slide-up">
        
        {/* Header Decor */}
        <div className="h-32 bg-rose-600 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/4 translate-y-1/4"></div>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-xl z-10">
            <AlertTriangle size={40} className="text-rose-600" />
          </div>
        </div>

        <div className="p-8 sm:p-12 text-right dir-rtl">
          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
            منصة التنسيق الميداني للطوارئ
          </h2>
          
          <p className="text-slate-600 leading-relaxed font-medium mb-8 text-center text-sm sm:text-base">
            تم إنشاء هذه المنصة لدعم ضحايا الفيضانات والمتضررين العالقين، وتسهيل وصول فرق الإنقاذ إلى المناطق الأكثر حاجة. من خلال هذه البوابة، يمكنكم:
          </p>

          <div className="grid gap-4 mb-10">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100/50 group transition-all hover:bg-rose-100">
              <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-black text-rose-900 text-sm mb-1">ملء استمارة بسيطة</h4>
                <p className="text-xs text-rose-700 font-bold opacity-80">تسجيل بياناتكم واحتياجاتكم بكل سهولة.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100/50 group transition-all hover:bg-blue-100">
              <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-sm mb-1">تحديد الموقع الجغرافي</h4>
                <p className="text-xs text-blue-700 font-bold opacity-80">رصد إحداثياتكم تلقائياً لضمان الدقة.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 group transition-all hover:bg-emerald-100">
              <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shrink-0">
                <Gauge size={20} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-sm mb-1">تقييم درجة الخطر</h4>
                <p className="text-xs text-emerald-700 font-bold opacity-80">تسريع اتخاذ قرار التدخل العاجل من قبل الفرق.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-bold mb-10 text-center border-t border-slate-100 pt-6">
            تهدف المنصة إلى تحسين التنسيق بين السلطات، فرق الإنقاذ، والمجتمع المدني لضمان وصول المساعدة بشكل سريع وفعّال لكل من يحتاجها.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              بدء الاستخدام
              <ChevronLeft size={18} />
            </button>
            <a 
              href="mailto:jilitsig@gmail.com"
              className="flex-1 bg-white text-slate-700 border border-slate-200 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Mail size={18} />
              تواصل معنا
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};
