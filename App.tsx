
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Send, RefreshCw, CheckCircle2, ShieldAlert, Loader2, ExternalLink, Phone, AlertCircle, Database, FileText, Map as MapIcon } from 'lucide-react';
import { SectionCard, InputField, SearchableSelect } from './components/Layout';
import { MapDashboard } from './components/MapDashboard';
import { FormData, UrgencyLevel, URGENCY_LABELS } from './types';
import { submitFormData } from './services/api';
import { fetchAdminData, fetchSubmittedLogs, AdminRow, SubmissionRow } from './services/data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'dashboard' | 'map'>('form');
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
    latitude: '0.000000', longitude: '0.000000', lien_maps: ''
  });

  // Load Admin Data
  useEffect(() => {
    const loadInitialData = async () => {
      setDataLoading(true);
      const data = await fetchAdminData();
      setAllAdminData(data);
      setDataLoading(false);
    };
    loadInitialData();
  }, []);

  // Fetch Logs when Dashboard or Map is active
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    const logs = await fetchSubmittedLogs();
    setSubmittedLogs(logs);
    setLogsLoading(false);
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard' || currentView === 'map') loadLogs();
  }, [currentView, loadLogs]);

  // Form Cascading Filter Logic
  const regions = useMemo(() => Array.from(new Set(allAdminData.map(r => r.region))).sort((a, b) => a.localeCompare(b, 'ar')), [allAdminData]);
  const provinces = useMemo(() => !formData.region ? [] : Array.from(new Set(allAdminData.filter(r => r.region === formData.region).map(r => r.province))).sort((a, b) => a.localeCompare(b, 'ar')), [allAdminData, formData.region]);
  const communes = useMemo(() => !formData.province ? [] : Array.from(new Set(allAdminData.filter(r => r.province === formData.province).map(r => r.commune))).sort((a, b) => a.localeCompare(b, 'ar')), [allAdminData, formData.province]);
  const douars = useMemo(() => !formData.commune ? [] : Array.from(new Set(allAdminData.filter(r => r.commune === formData.commune).map(r => r.douar))).sort((a, b) => a.localeCompare(b, 'ar')), [allAdminData, formData.commune]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'region' && value !== prev.region) { updated.province = ''; updated.commune = ''; updated.nom_douar = ''; }
      else if (field === 'province' && value !== prev.province) { updated.commune = ''; updated.nom_douar = ''; }
      else if (field === 'commune' && value !== prev.commune) { updated.nom_douar = ''; }
      return updated;
    });
  };

  const fetchLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setFormData(prev => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        lien_maps: `https://www.google.com/maps?q=${latitude},${longitude}`
      }));
    }, null, { enableHighAccuracy: true });
  }, []);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitFormData(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData(prev => ({ ...prev, nature_dommages: '', besoins_essentiels: '', numero_telephone: '' }));
    } else { setError(result.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased pb-12">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-[1001]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('form')}>
            <div className="bg-rose-500 p-1.5 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight hidden sm:inline">رصد الميدان</span>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setCurrentView('form')}
                className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all ${currentView === 'form' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-rose-500'}`}
             >
                <div className="flex items-center gap-2">
                   <FileText size={14} /> <span className="hidden xs:inline">إرسال بلاغ</span>
                </div>
             </button>
             <button 
                onClick={() => setCurrentView('map')}
                className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all ${currentView === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-blue-600'}`}
             >
                <div className="flex items-center gap-2">
                   <MapIcon size={14} /> <span className="hidden xs:inline">الخريطة الميدانية</span>
                </div>
             </button>
             <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
             >
                <div className="flex items-center gap-2">
                   <Database size={14} /> <span className="hidden xs:inline">لوحة المعطيات</span>
                </div>
             </button>
          </div>
        </div>
      </nav>

      {currentView === 'form' ? (
        <>
          <header className="bg-rose-600 text-white pt-16 pb-24 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-black mb-3">إرسال بلاغ ميداني</h1>
              <p className="text-rose-100 font-medium opacity-90">نظام الربط الجغرافي والإحصائي الموحد لجمع المعطيات</p>
            </div>
          </header>

          <main className="max-w-3xl mx-auto w-full px-6 -mt-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GPS Status Box */}
              <div className="bg-[#eefdf5] border border-[#dcfce7] rounded-3xl p-6 flex items-center justify-between shadow-sm">
                 <button type="button" onClick={() => window.open(formData.lien_maps, '_blank')} className="bg-white px-5 py-2 rounded-xl text-xs font-bold text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                    عرض الخريطة
                 </button>
                 <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                       <h3 className="text-sm font-bold text-emerald-800">الموقع الجغرافي التلقائي</h3>
                       <p className="text-[11px] text-emerald-600 font-medium">تم تحديد الإحداثيات بدقة: {formData.latitude}, {formData.longitude}</p>
                    </div>
                    <div className="bg-emerald-500 p-2.5 rounded-full text-white"><MapPin size={20} /></div>
                 </div>
              </div>

              <SectionCard title="التموقع الإداري" number="١.">
                {dataLoading ? (
                  <div className="md:col-span-2 flex justify-center py-6"><Loader2 className="animate-spin text-rose-500" /></div>
                ) : (
                  <>
                    <SearchableSelect label="الجهة" options={regions} value={formData.region} onChange={(v) => updateField('region', v)} required />
                    <SearchableSelect label="الإقليم / العمالة" options={provinces} value={formData.province} onChange={(v) => updateField('province', v)} placeholder="يجب اختيار الجهة أولاً" required />
                    <SearchableSelect label="الجماعة" options={communes} value={formData.commune} onChange={(v) => updateField('commune', v)} placeholder="يجب اختيار الإقليم أولاً" required />
                    <SearchableSelect label="اسم الدوار" options={douars} value={formData.nom_douar} onChange={(v) => updateField('nom_douar', v)} placeholder="يجب اختيار الجماعة أولاً" required />
                  </>
                )}
              </SectionCard>

              <SectionCard title="تفاصيل الحالة" number="٢.">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[13px] font-bold text-slate-500">مستوى الاستعجال والخطورة</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(UrgencyLevel) as Array<keyof typeof UrgencyLevel>).map((level) => {
                      const isActive = formData.niveau_urgence === UrgencyLevel[level];
                      const labels = { LOW: '١- مستقر', MEDIUM: '٢- متوسط', HIGH: '٣- حاد', CRITICAL: '٤- كارثي' };
                      return (
                        <button key={level} type="button" onClick={() => updateField('niveau_urgence', UrgencyLevel[level])}
                          className={`py-4 rounded-xl text-[11px] font-bold border transition-all ${isActive ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                        >
                          {labels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <InputField label="طبيعة الأضرار" placeholder="مثال: انهيار مباني، انقطاع مياه..." value={formData.nature_dommages} onChange={(v) => updateField('nature_dommages', v)} required />
                <InputField label="رقم الهاتف للتواصل" placeholder="06XXXXXXXX" value={formData.numero_telephone} onChange={(v) => updateField('numero_telephone', v)} type="tel" required />
                <InputField label="الاحتياجات ذات الأولوية" placeholder="حدد بوضوح ما يحتاجه السكان الآن (أغطية، أدوية، خيام...)" value={formData.besoins_essentiels} onChange={(v) => updateField('besoins_essentiels', v)} multiline fullWidth required />
              </SectionCard>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-all shadow-xl active:scale-95 ${loading ? "bg-slate-300 text-slate-500" : "bg-[#0f172a] text-white hover:bg-slate-800"}`}>
                {loading ? <RefreshCw className="animate-spin" /> : <Send size={22} className="-rotate-45" />}
                <span>تأكيد وإرسال البلاغ</span>
              </button>

              {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-center font-bold flex items-center justify-center gap-2 animate-fade-in"><CheckCircle2 size={20} /> تم إرسال البلاغ بنجاح</div>
              )}
            </form>
          </main>
        </>
      ) : currentView === 'map' ? (
        /* Map View */
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
          <header className="mb-6 text-right">
             <div className="flex justify-between items-end">
                <button 
                  onClick={loadLogs}
                  disabled={logsLoading}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  {logsLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  تحديث الخريطة
                </button>
                <div className="text-right">
                  <h1 className="text-2xl font-black text-slate-800">التوزيع الجغرافي والمناطق المهددة</h1>
                  <p className="text-sm text-slate-500 font-medium">Sources des données : Sentinel-1 SAR (VV & VH, Copernicus, GEE), HCP, OSM / QGIS, Geotoposig </p>
                </div>
             </div>
          </header>
          <div className="flex-1 min-h-[600px] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            {logsLoading && submittedLogs.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 size={48} className="animate-spin text-blue-500" />
                  <span className="font-bold">جاري تحميل المعطيات الجغرافية...</span>
               </div>
            ) : (
               <MapDashboard logs={submittedLogs} userLat={parseFloat(formData.latitude)} userLng={parseFloat(formData.longitude)} />
            )}
          </div>
        </main>
      ) : (
        /* Dashboard View */
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-10 text-right">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div className="order-2 md:order-1 flex gap-2">
                <button 
                  onClick={loadLogs}
                  disabled={logsLoading}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  {logsLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  تحديث المعطيات
                </button>
              </div>
              <div className="order-1 md:order-2 text-right">
                <h1 className="text-3xl font-black text-slate-800 mb-2">سجل الإغاثة الميداني</h1>
                <p className="text-slate-500 font-medium">مراقبة حية للوضعية في الدواوير المتضررة والاحتياجات المسجلة</p>
              </div>
            </div>
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الجهة / الإقليم</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الجماعة / الدوار</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">مستوى الخطورة</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">طبيعة الأضرار</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الاحتياجات المستعجلة</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">التواصل</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logsLoading && submittedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                           <Loader2 size={40} className="animate-spin text-rose-500" />
                           <span className="font-bold">جاري مزامنة السجلات من قاعدة البيانات...</span>
                        </div>
                      </td>
                    </tr>
                  ) : submittedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold">
                        لا توجد بلاغات مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    submittedLogs.map((log, idx) => {
                      // Get urgency styles
                      let urgencyClass = "bg-slate-100 text-slate-600";
                      if (log.urgency.includes('حرج') || log.urgency.includes('٤')) urgencyClass = "bg-rose-500 text-white";
                      else if (log.urgency.includes('مرتفع') || log.urgency.includes('٣')) urgencyClass = "bg-orange-500 text-white";
                      else if (log.urgency.includes('متوسط') || log.urgency.includes('٢')) urgencyClass = "bg-amber-100 text-amber-700";
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-800">{log.region}</div>
                            <div className="text-xs text-slate-500 mt-1">{log.province}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-800">{log.commune}</div>
                            <div className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                               <MapPin size={12} /> {log.douar}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${urgencyClass}`}>
                              {log.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed line-clamp-2" title={log.damage}>
                              {log.damage}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs text-slate-600 font-medium max-w-[200px] leading-relaxed line-clamp-2" title={log.needs}>
                              {log.needs}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <a href={`tel:${log.phone}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                              <Phone size={14} className="text-rose-500" />
                              {log.phone}
                            </a>
                          </td>
                          <td className="px-6 py-5">
                            <a 
                              href={log.mapLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                              title="فتح في خرائط جوجل"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500"></div> حرج</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500"></div> مرتفع</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400"></div> متوسط</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200"></div> مستقر</span>
             </div>
             <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <AlertCircle size={14} /> يتم تحديث البيانات مباشرة من السجلات الميدانية المعتمدة
             </p>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
