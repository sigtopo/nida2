
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Send, RefreshCw, CheckCircle2, ShieldAlert, Loader2, Database, FileText, Waves, X, Map as MapIcon, Layers } from 'lucide-react';
import { SectionCard, InputField, SearchableSelect } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FloodMap } from './components/FloodMap';
import { MapDashboard } from './components/MapDashboard';
import { FormData, UrgencyLevel } from './types';
import { submitFormData } from './services/api';
import { fetchAdminData, fetchSubmittedLogs, AdminRow, SubmissionRow } from './services/data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'dashboard' | 'floodMap'>('form');
  const [showDistributionOverlay, setShowDistributionOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allAdminData, setAllAdminData] = useState<AdminRow[]>([]);
  const [submittedLogs, setSubmittedLogs] = useState<SubmissionRow[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    region: '', province: '', commune: '', nom_douar: '',
    niveau_urgence: UrgencyLevel.MEDIUM, nature_dommages: '',
    besoins_essentiels: '', numero_telephone: '',
    latitude: '31.7917', longitude: '-7.0926', lien_maps: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [admin, logs] = await Promise.all([fetchAdminData(), fetchSubmittedLogs()]);
        setAllAdminData(admin || []);
        setSubmittedLogs(logs || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const refreshLogs = async () => {
    setLogsLoading(true);
    const logs = await fetchSubmittedLogs();
    setSubmittedLogs(logs || []);
    setLogsLoading(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          lien_maps: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
        }));
      }, null, { enableHighAccuracy: true });
    }
  }, []);

  // Memoized lists for the searchable selects with extra safety filtering
  const regions = useMemo(() => 
    Array.from(new Set(allAdminData.map(r => r.region).filter(Boolean))).sort() as string[], 
    [allAdminData]
  );
  
  const provinces = useMemo(() => 
    !formData.region ? [] : Array.from(new Set(allAdminData.filter(r => r.region === formData.region).map(r => r.province).filter(Boolean))).sort() as string[], 
    [allAdminData, formData.region]
  );
  
  const communes = useMemo(() => 
    !formData.province ? [] : Array.from(new Set(allAdminData.filter(r => r.province === formData.province).map(r => r.commune).filter(Boolean))).sort() as string[], 
    [allAdminData, formData.province]
  );
  
  const douars = useMemo(() => 
    !formData.commune ? [] : Array.from(new Set(allAdminData.filter(r => r.commune === formData.commune).map(r => r.douar).filter(Boolean))).sort() as string[], 
    [allAdminData, formData.commune]
  );

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'region' && value !== prev.region) { updated.province = ''; updated.commune = ''; updated.nom_douar = ''; }
      else if (field === 'province' && value !== prev.province) { updated.commune = ''; updated.nom_douar = ''; }
      else if (field === 'commune' && value !== prev.commune) { updated.nom_douar = ''; }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await submitFormData(formData);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      refreshLogs();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-[1001] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setCurrentView('form')}>
            <div className="bg-rose-600 p-1.5 sm:p-2 rounded-xl text-white shadow-lg shadow-rose-100">
              <ShieldAlert size={18} />
            </div>
            <div className="flex flex-col text-right">
               <span className="font-black text-slate-800 tracking-tight leading-none text-xs sm:text-sm">رصد الميدان</span>
               <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">التدخل السريع</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
             <button onClick={() => setCurrentView('form')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all ${currentView === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1 sm:gap-2"><FileText size={12}/> إرسال بلاغ</div>
             </button>
             <button onClick={() => setCurrentView('floodMap')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all ${currentView === 'floodMap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1 sm:gap-2"><Waves size={12}/> خريطة الفيضانات</div>
             </button>
             <button onClick={() => setCurrentView('dashboard')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all ${currentView === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1 sm:gap-2"><Database size={12}/> سجل الإغاثة</div>
             </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {currentView === 'form' ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <div className="mb-8 text-right">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1 sm:mb-2">إرسال بلاغ ميداني</h1>
                <p className="text-slate-400 font-bold text-xs sm:text-sm">قم بتوثيق الحالة بدقة لضمان سرعة الاستجابة</p>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <SectionCard title="الموقع الإداري" number="٠١">
                   <SearchableSelect label="الجهة" options={regions} value={formData.region} onChange={(v) => updateField('region', v)} required />
                   <SearchableSelect label="الإقليم" options={provinces} value={formData.province} onChange={(v) => updateField('province', v)} required />
                   <SearchableSelect label="الجماعة" options={communes} value={formData.commune} onChange={(v) => updateField('commune', v)} required />
                   <SearchableSelect label="اسم الدوار" options={douars} value={formData.nom_douar} onChange={(v) => updateField('nom_douar', v)} required />
                </SectionCard>
                <SectionCard title="تفاصيل الحالة" number="٠٢">
                   <InputField label="طبيعة الأضرار" value={formData.nature_dommages} onChange={(v) => updateField('nature_dommages', v)} fullWidth required />
                   <InputField label="الاحتياجات" value={formData.besoins_essentiels} onChange={(v) => updateField('besoins_essentiels', v)} multiline fullWidth required />
                   <InputField label="رقم الهاتف" value={formData.numero_telephone} onChange={(v) => updateField('numero_telephone', v)} type="tel" required />
                </SectionCard>
                <button type="submit" disabled={loading} className="w-full py-4 sm:py-5 rounded-2xl bg-rose-600 text-white font-black text-base sm:text-lg shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
                   {loading ? <RefreshCw className="animate-spin" /> : <Send size={22} />}
                   تأكيد الإرسال
                </button>
             </form>
          </div>
        ) : currentView === 'floodMap' ? (
          <div className="animate-fade-in -mx-4 -mt-8 sm:mx-0 sm:mt-0">
            <FloodMap userLat={parseFloat(formData.latitude || '0')} userLng={parseFloat(formData.longitude || '0')} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end text-right gap-4">
               <button onClick={refreshLogs} className="bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-[10px] sm:text-xs flex items-center gap-2 hover:bg-slate-50 shadow-sm w-full sm:w-auto justify-center order-2 sm:order-1">
                  {logsLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  تحديث السجل
               </button>
               <div className="order-1 sm:order-2 w-full">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-800">سجل الإغاثة الميداني</h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1">مراقبة حية للدواوير المتضررة (البحث يعطي أولوية في الترتيب)</p>
               </div>
            </div>
            <Dashboard logs={submittedLogs} loading={logsLoading} />
          </div>
        )}
      </div>

      {/* Floating Action Button (Professional Blue) */}
      <button 
        onClick={() => setShowDistributionOverlay(true)}
        className="fixed bottom-6 left-6 z-[1002] bg-[#2563eb] text-white p-4 sm:p-5 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all group border-4 border-white"
      >
        <div className="relative">
           <MapIcon size={24} />
           <span className="hidden sm:block absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold pointer-events-none shadow-xl">توزيع البلاغات</span>
        </div>
      </button>

      {/* Overlay Map View (Distribution Map) */}
      {showDistributionOverlay && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/70 backdrop-blur-md p-2 sm:p-8 flex items-center justify-center animate-fade-in overflow-hidden">
           <div className="bg-white w-full max-w-6xl h-[95vh] sm:h-full rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col">
              
              {/* Close Button Red (Center Top) */}
              <button 
                onClick={() => setShowDistributionOverlay(false)} 
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[2001] bg-red-600 text-white px-8 py-2 rounded-full font-black text-xs shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 border-2 border-white"
              >
                <X size={16} /> إغلاق الخريطة
              </button>

              <div className="bg-slate-900 p-4 sm:p-6 pt-16 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                 <div className="text-center sm:text-right w-full">
                    <h2 className="text-sm sm:text-lg font-black text-white">خريطة التوزيع الجغرافي والخطورة</h2>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold">عرض حي لمواقع البلاغات ومستويات التدخل الميداني</p>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <MapDashboard logs={submittedLogs} userLat={parseFloat(formData.latitude || '0')} userLng={parseFloat(formData.longitude || '0')} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
