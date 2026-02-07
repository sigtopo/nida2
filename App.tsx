
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Send, RefreshCw, CheckCircle2, ShieldAlert, Loader2, ExternalLink, Phone, AlertCircle, Search, Map as MapIcon } from 'lucide-react';
import { SectionCard, InputField, SearchableSelect } from './components/Layout';
import { MapDashboard } from './components/MapDashboard';
import { DistributionMap } from './components/DistributionMap';
import { FormData, UrgencyLevel, URGENCY_LABELS } from './types';
import { submitFormData } from './services/api';
import { fetchAdminData, fetchSubmittedLogs, AdminRow, SubmissionRow } from './services/data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'dashboard' | 'map'>('form');
  const [showDistMap, setShowDistMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allAdminData, setAllAdminData] = useState<AdminRow[]>([]);
  const [submittedLogs, setSubmittedLogs] = useState<SubmissionRow[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    region: '', province: '', commune: '', nom_douar: '',
    niveau_urgence: UrgencyLevel.MEDIUM, nature_dommages: '',
    besoins_essentiels: '', numero_telephone: '',
    latitude: '34.333333', longitude: '-6.111111', lien_maps: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setDataLoading(true);
      const data = await fetchAdminData();
      setAllAdminData(data);
      setDataLoading(false);
    };
    loadInitialData();
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    const logs = await fetchSubmittedLogs();
    setSubmittedLogs(logs);
    setLogsLoading(false);
  }, []);

  useEffect(() => {
    if (currentView === 'dashboard' || currentView === 'map' || showDistMap) loadLogs();
  }, [currentView, showDistMap, loadLogs]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return submittedLogs;
    const term = searchTerm.toLowerCase();
    return submittedLogs.filter(log => 
      log.douar.toLowerCase().includes(term) || 
      log.commune.toLowerCase().includes(term) || 
      log.phone.includes(term) ||
      log.damage.toLowerCase().includes(term)
    );
  }, [submittedLogs, searchTerm]);

  const regions = useMemo(() => 
    Array.from(new Set(allAdminData.map(r => r.region))).sort((a, b) => a.localeCompare(b, 'ar')), 
  [allAdminData]);

  const provinces = useMemo(() => 
    !formData.region ? [] : 
    Array.from(new Set(allAdminData.filter(r => r.region === formData.region).map(r => r.province)))
    .sort((a, b) => a.localeCompare(b, 'ar')), 
  [allAdminData, formData.region]);

  const communes = useMemo(() => 
    !formData.province ? [] : 
    Array.from(new Set(allAdminData.filter(r => r.region === formData.region && r.province === formData.province).map(r => r.commune)))
    .sort((a, b) => a.localeCompare(b, 'ar')), 
  [allAdminData, formData.region, formData.province]);

  const douars = useMemo(() => 
    !formData.commune ? [] : 
    Array.from(new Set(allAdminData.filter(r => r.region === formData.region && r.province === formData.province && r.commune === formData.commune).map(r => r.douar)))
    .sort((a, b) => a.localeCompare(b, 'ar')), 
  [allAdminData, formData.region, formData.province, formData.commune]);

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
    if (!navigator.geolocation) return;
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
      loadLogs();
    } else { setError(result.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased pb-20 relative">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-[1001] shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('form')}>
            <div className="bg-rose-500 p-1.5 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <span className="font-black text-slate-800 tracking-tight hidden sm:inline">رصد الميدان</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
             <button onClick={() => setCurrentView('form')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-rose-500'}`}>التبليغ عن دوار</button>
             <button onClick={() => setCurrentView('map')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}>خريطة الفيضانات</button>
             <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>سجل البيانات</button>
          </div>
        </div>
      </nav>

      {currentView === 'form' ? (
        <>
          <header className="bg-rose-600 text-white pt-16 pb-24 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6 mx-auto">
                <div className="w-2 h-2 rounded-full bg-rose-300 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">صفحة غير رسمية</span>
              </div>
              <h1 className="text-4xl font-black mb-3">التبليغ عن دوار متضرر</h1>
              <p className="text-rose-100 font-medium opacity-90">نظام الربط الجغرافي والإحصائي الموحد لجمع المعطيات</p>
            </div>
          </header>
          <main className="max-w-3xl mx-auto w-full px-6 -mt-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#eefdf5] border border-[#dcfce7] rounded-3xl p-5 flex flex-col gap-5 shadow-sm">
                 <div className="flex items-center justify-between gap-4">
                    <button 
                      type="button" 
                      onClick={() => window.open(formData.lien_maps, '_blank')} 
                      className="bg-white p-2 rounded-xl border border-[#107c41]/20 flex items-center justify-center hover:bg-emerald-50 transition-all shadow-sm shrink-0 aspect-square w-11"
                      title="عرض على خرائط جوجل"
                    >
                      <img src="https://www.google.com/images/branding/product/ico/maps15_24dp.ico" alt="Maps" className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-right overflow-hidden">
                        <span className="text-[13px] font-bold text-[#107c41] whitespace-nowrap overflow-hidden text-ellipsis">
                           تم تحديد موقعك: ({formData.latitude}, {formData.longitude})
                        </span>
                        <div className="text-[#107c41] shrink-0"><MapPin size={22} /></div>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-2 bg-white/50 px-4 py-3 rounded-2xl border border-emerald-100/50">
                    <AlertCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-700 font-black leading-relaxed">
                      الرجاء إدخال المعطيات بدقة لمساعدة فرق الطوارئ والمجتمع المدني
                    </p>
                 </div>
              </div>
              <SectionCard title="التموقع الإداري" number="1.">
                {dataLoading ? (
                  <div className="md:col-span-2 flex justify-center py-6"><Loader2 className="animate-spin text-rose-500" /></div>
                ) : (
                  <>
                    <SearchableSelect label="الجهة" options={regions} value={formData.region} onChange={(v) => updateField('region', v)} required />
                    <SearchableSelect label="الإقليم / العمالة" options={provinces} value={formData.province} onChange={(v) => updateField('province', v)} placeholder="اختر الجهة أولاً" required />
                    <SearchableSelect label="الجماعة" options={communes} value={formData.commune} onChange={(v) => updateField('commune', v)} placeholder="اختر الإقليم أولاً" required />
                    <SearchableSelect label="اسم الدوار" options={douars} value={formData.nom_douar} onChange={(v) => updateField('nom_douar', v)} placeholder="اختر الجماعة أولاً" required />
                  </>
                )}
              </SectionCard>
              <SectionCard title="تفاصيل الحالة" number="2.">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[13px] font-bold text-slate-500">مستوى الاستعجال</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(UrgencyLevel) as Array<keyof typeof UrgencyLevel>).map((level) => {
                      const isActive = formData.niveau_urgence === UrgencyLevel[level];
                      const labels = { LOW: '1- مستقر', MEDIUM: '2- متوسط', HIGH: '3- حاد', CRITICAL: '4- كارثي' };
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
                <InputField label="رقم الهاتف" placeholder="06XXXXXXXX" value={formData.numero_telephone} onChange={(v) => updateField('numero_telephone', v)} type="tel" required />
                <InputField label="الاحتياجات" placeholder="حدد بوضوح ما يحتاجه السكان..." value={formData.besoins_essentiels} onChange={(v) => updateField('besoins_essentiels', v)} multiline fullWidth required />
              </SectionCard>
              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-all shadow-xl active:scale-95 ${loading ? "bg-slate-300 text-slate-500" : "bg-[#0f172a] text-white hover:bg-slate-800"}`}>
                {loading ? <RefreshCw className="animate-spin" /> : <Send size={22} className="-rotate-45" />}
                <span>التبليغ بدوار مهدد</span>
              </button>
              {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-center font-bold flex items-center justify-center gap-2 animate-fade-in"><CheckCircle2 size={20} /> تم إرسال البلاغ بنجاح</div>}
              {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 text-center font-bold flex items-center justify-center gap-2 animate-fade-in"><AlertCircle size={20} /> {error}</div>}
            </form>
          </main>
        </>
      ) : currentView === 'map' ? (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
          <header className="mb-6 text-right">
             <div className="flex justify-between items-end">
                <button onClick={loadLogs} disabled={logsLoading} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                  {logsLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  تحديث
                </button>
                <div className="text-right">
                  <h1 className="text-2xl font-black text-slate-800">تحليل المناطق المغمورة</h1>
                  <p className="text-sm text-slate-500 font-medium"> Sources des données : Sentinel-1 SAR (VV & VH, Copernicus, GEE), HCP, OSM / geojilit , Geotoposig </p>
                </div>
             </div>
          </header>
          <div className="flex-1 min-h-[600px] bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
            <MapDashboard logs={submittedLogs} userLat={parseFloat(formData.latitude)} userLng={parseFloat(formData.longitude)} />
          </div>
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-10 text-right">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="order-2 md:order-1 flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input 
                    type="text"
                    placeholder="ابحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-400 outline-none transition-all shadow-sm"
                  />
                  <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button 
                  onClick={loadLogs}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Search size={16} /> بحث
                </button>
              </div>
              <div className="order-1 md:order-2 text-right">
                <h1 className="text-3xl font-black text-slate-800 mb-2">سجل الإغاثة الميداني</h1>
                <p className="text-slate-500 font-medium">إجمالي البلاغات: {filteredLogs.length}</p>
              </div>
            </div>
          </header>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-yellow-400/20 text-slate-900 border-b border-yellow-400/30">
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">الجهة / الإقليم</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">الجماعة / الدوار</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">الخطورة</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">الأضرار</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">الاحتياجات</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap border-l border-slate-100/30">التواصل</th>
                    <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 border-l border-slate-100/30">
                        <div className="text-sm font-bold text-slate-800">{log.region}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{log.province}</div>
                      </td>
                      <td className="px-6 py-5 border-l border-slate-100/30">
                        <div className="text-sm font-bold text-slate-800">{log.commune}</div>
                        <div className="text-xs text-rose-500 font-bold mt-0.5">{log.douar}</div>
                      </td>
                      <td className="px-6 py-5 border-l border-slate-100/30 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-block ${log.urgency.includes('حرج') || log.urgency.includes('4') ? 'bg-rose-500 text-white' : log.urgency.includes('مرتفع') || log.urgency.includes('3') ? 'bg-orange-500 text-white' : log.urgency.includes('متوسط') || log.urgency.includes('2') ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                          {log.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-600 font-medium max-w-[200px] border-l border-slate-100/30">{log.damage}</td>
                      <td className="px-6 py-5 text-xs text-slate-600 font-medium max-w-[200px] border-l border-slate-100/30">{log.needs}</td>
                      <td className="px-6 py-5 border-l border-slate-100/30">
                        <a href={`tel:${log.phone}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
                          <Phone size={14} /> {log.phone}
                        </a>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <a href={log.mapLink} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-[#0f172a] hover:text-white transition-all"><ExternalLink size={18} /></a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* أيقونة عائمة لفتح خريطة التوزيع التفاعلية */}
      <div className="fixed bottom-8 left-8 z-[1002]">
        <button 
          onClick={() => setShowDistMap(true)}
          className="bg-[#0f172a] text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center gap-3"
        >
          <MapIcon size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-black text-xs">خريطة التوزيع</span>
        </button>
      </div>

      {showDistMap && (
        <DistributionMap 
          logs={submittedLogs} 
          onClose={() => setShowDistMap(false)} 
          userLat={parseFloat(formData.latitude)}
          userLng={parseFloat(formData.longitude)}
        />
      )}
    </div>
  );
};

export default App;
