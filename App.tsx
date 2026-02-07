
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Send, RefreshCw, CheckCircle2, ShieldAlert, Loader2, ExternalLink, Phone, AlertCircle, Info, Map as MapIcon, LocateFixed, Search } from 'lucide-react';
import { SectionCard, InputField, SearchableSelect } from './components/Layout';
import { MapDashboard } from './components/MapDashboard';
import { DistributionMap } from './components/DistributionMap';
import { WelcomePopup } from './components/WelcomePopup';
import { FormData, UrgencyLevel } from './types';
import { submitFormData } from './services/api';
import { fetchAdminData, fetchSubmittedLogs, AdminRow, SubmissionRow } from './services/data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'dashboard' | 'map'>('form');
  const [showDistMap, setShowDistMap] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
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
    latitude: '', longitude: '', lien_maps: ''
  });

  // قائمة الجهات المعتمدة حصرياً
  const ALLOWED_REGIONS = [
    'الرباط - سلا - القنيطرة',
    'طنجة - تطوان - الحسيمة',
    'فاس - مكناس',
    'الشرق'
  ];

  // جلب البيانات الأولية عند التشغيل
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
      log.province.toLowerCase().includes(term) ||
      log.region.toLowerCase().includes(term)
    );
  }, [submittedLogs, searchTerm]);

  // --- منطق الفلترة الهرمية الصارم (Cascading Logic) ---
  
  // 1. عرض الجهات الأربعة المطلوبة فقط
  const regions = useMemo(() => {
    // نقوم بفلترة الجهات الموجودة في البيانات لتطابق القائمة المطلوبة فقط
    return ALLOWED_REGIONS.filter(reg => 
      allAdminData.some(r => r.region.trim() === reg)
    );
  }, [allAdminData]);

  // 2. استخراج الأقاليم المتعلقة بالجهة المختارة فقط
  const provinces = useMemo(() => {
    if (!formData.region) return [];
    return Array.from(new Set(
      allAdminData
        .filter(r => r.region.trim() === formData.region.trim())
        .map(r => r.province.trim())
    ))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.region]);

  // 3. استخراج الجماعات المتعلقة بالإقليم المختار فقط
  const communes = useMemo(() => {
    if (!formData.province) return [];
    return Array.from(new Set(
      allAdminData
        .filter(r => r.region.trim() === formData.region.trim() && r.province.trim() === formData.province.trim())
        .map(r => r.commune.trim())
    ))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.region, formData.province]);

  // 4. استخراج الدواوير المتعلقة بالجماعة المختارة فقط
  const douars = useMemo(() => {
    if (!formData.commune) return [];
    return Array.from(new Set(
      allAdminData
        .filter(r => 
          r.region.trim() === formData.region.trim() && 
          r.province.trim() === formData.province.trim() && 
          r.commune.trim() === formData.commune.trim()
        )
        .map(r => r.douar.trim())
    ))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.region, formData.province, formData.commune]);

  /**
   * تحديث الحقول مع ضمان تصفير التبعيات (Dependency Clearing)
   */
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'region') {
        updated.province = '';
        updated.commune = '';
        updated.nom_douar = '';
      } 
      else if (field === 'province') {
        updated.commune = '';
        updated.nom_douar = '';
      } 
      else if (field === 'commune') {
        updated.nom_douar = '';
      }
      
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
    }, (error) => {
      console.warn("Geolocation error:", error);
    }, { enableHighAccuracy: true });
  }, []);

  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.region || !formData.province || !formData.commune || !formData.nom_douar) {
      setError('يرجى اختيار التموقع الإداري بالكامل');
      return;
    }
    
    if (!formData.nature_dommages || !formData.besoins_essentiels || !formData.numero_telephone) {
      setError('يرجى ملء كافة تفاصيل الأضرار والاحتياجات ورقم الهاتف');
      return;
    }

    setLoading(true);
    const result = await submitFormData(formData);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setFormData(prev => ({ 
        ...prev, 
        nature_dommages: '', 
        besoins_essentiels: '', 
        numero_telephone: '' 
      }));
      loadLogs();
    } else { 
      setError(result.message); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased pb-20 relative">
      {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}

      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-[1001] shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('form')}>
              <div className="bg-rose-500 p-1.5 rounded-lg text-white">
                <ShieldAlert size={20} />
              </div>
              <span className="font-black text-slate-800 tracking-tight text-sm sm:text-base">رصد الميدان</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-rose-50 text-rose-600 px-2 sm:px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                 <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">صفحة غير رسمية</span>
              </div>
              
              <button 
                onClick={() => setShowWelcome(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                title="معلومات المنصة"
              >
                <Info size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto justify-center">
             <button onClick={() => setCurrentView('form')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-rose-500'}`}>التبليغ عن دوار</button>
             <button onClick={() => setCurrentView('map')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}>خريطة الفيضانات</button>
             <button onClick={() => setCurrentView('dashboard')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currentView === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>سجل البيانات</button>
          </div>
        </div>
      </nav>

      {currentView === 'form' ? (
        <>
          <header className="bg-rose-600 text-white pt-16 pb-24 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-black mb-3 text-white">التبليغ عن دوار متضرر</h1>
              <p className="text-rose-100 font-medium opacity-90">استمارة الربط الميداني لجمع معطيات الأضرار والاحتياجات</p>
            </div>
          </header>
          <main className="max-w-3xl mx-auto w-full px-6 -mt-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#eefdf5] border border-[#dcfce7] rounded-3xl p-5 flex flex-col gap-5 shadow-sm">
                 <div className="flex items-center justify-between gap-4 text-right">
                    <button 
                      type="button" 
                      onClick={() => formData.lien_maps && window.open(formData.lien_maps, '_blank')} 
                      className="bg-white p-2.5 rounded-xl border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition-all shadow-sm shrink-0 aspect-square w-12 text-blue-400"
                      title="عرض الموقع على الخريطة"
                    >
                      <LocateFixed size={24} />
                    </button>
                    
                    <div className="flex items-center gap-3 text-right overflow-hidden flex-1">
                        <div className="flex flex-col text-right">
                          <span className="text-[13px] font-black text-[#107c41] whitespace-nowrap overflow-hidden text-ellipsis">
                             تحديد الإحداثيات الجغرافية
                          </span>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {formData.latitude ? (
                              <>
                                <span className="text-[9px] font-black text-emerald-500 opacity-80 hidden sm:inline">
                                   تم جلب موقعك الحالي بنجاح
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600/80 dir-ltr">
                                   {formData.latitude}, {formData.longitude}
                                </span>
                              </>
                            ) : (
                              <span className="text-[9px] font-black text-amber-500">جاري جلب الموقع...</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-emerald-500/10 p-2 rounded-xl text-[#107c41] shrink-0">
                          <MapPin size={22} />
                        </div>
                    </div>
                 </div>
              </div>

              <SectionCard title="التموقع الإداري الهرمي" number="1.">
                {dataLoading ? (
                  <div className="md:col-span-2 flex justify-center py-6"><Loader2 className="animate-spin text-rose-500" /></div>
                ) : (
                  <>
                    <SearchableSelect 
                      label="الجهة" 
                      options={regions} 
                      value={formData.region} 
                      onChange={(v) => updateField('region', v)} 
                      placeholder="اختر الجهة..."
                      required 
                      strict
                    />
                    <SearchableSelect 
                      label="الإقليم / العمالة" 
                      options={provinces} 
                      value={formData.province} 
                      onChange={(v) => updateField('province', v)} 
                      placeholder={formData.region ? "اختر الإقليم..." : "يجب اختيار الجهة أولاً"} 
                      disabled={!formData.region}
                      required 
                      strict
                    />
                    <SearchableSelect 
                      label="الجماعة" 
                      options={communes} 
                      value={formData.commune} 
                      onChange={(v) => updateField('commune', v)} 
                      placeholder={formData.province ? "اختر الجماعة..." : "يجب اختيار الإقليم أولاً"} 
                      disabled={!formData.province}
                      required 
                      strict
                    />
                    <SearchableSelect 
                      label="اسم الدوار" 
                      options={douars} 
                      value={formData.nom_douar} 
                      onChange={(v) => updateField('nom_douar', v)} 
                      placeholder={formData.commune ? "اختر الدوار..." : "يجب اختيار الجماعة أولاً"} 
                      disabled={!formData.commune}
                      required 
                      strict={false} 
                    />
                  </>
                )}
              </SectionCard>

              <SectionCard title="تفاصيل الحالة والخطورة" number="2.">
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[13px] font-bold text-slate-500">مستوى الاستعجال</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(UrgencyLevel) as Array<keyof typeof UrgencyLevel>).map((level) => {
                      const isActive = formData.niveau_urgence === UrgencyLevel[level];
                      const labels = { LOW: '1- منخفض', MEDIUM: '2- متوسط', HIGH: '3- مرتفع', CRITICAL: '4- حرج جداً' };
                      return (
                        <button key={level} type="button" onClick={() => updateField('niveau_urgence', UrgencyLevel[level] as any)}
                          className={`py-4 rounded-xl text-[11px] font-bold border transition-all ${isActive ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                        >
                          {labels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <InputField label="طبيعة الأضرار" placeholder="مثال: انهيار جزئي، انقطاع الطريق، فيضان..." value={formData.nature_dommages} onChange={(v) => updateField('nature_dommages', v)} required />
                <InputField label="رقم الهاتف للتواصل" placeholder="06XXXXXXXX" value={formData.numero_telephone} onChange={(v) => updateField('numero_telephone', v)} type="tel" required />
                <InputField label="الاحتياجات المستعجلة" placeholder="حدد نوع المساعدة المطلوبة (أغطية، مواد غذائية، أدوية...)" value={formData.besoins_essentiels} onChange={(v) => updateField('besoins_essentiels', v)} multiline fullWidth required />
              </SectionCard>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-all shadow-xl active:scale-95 ${loading ? "bg-slate-300 text-slate-500" : "bg-[#0f172a] text-white hover:bg-slate-800"}`}>
                {loading ? <RefreshCw className="animate-spin" /> : <Send size={22} className="-rotate-45" />}
                <span>إرسال البلاغ الآن</span>
              </button>
              
              {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-center font-bold flex items-center justify-center gap-2 animate-fade-in"><CheckCircle2 size={20} /> تم إرسال البيانات بنجاح إلى النظام</div>}
              {error && <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 text-center font-bold flex items-center justify-center gap-2 animate-fade-in"><AlertCircle size={20} /> {error}</div>}
            </form>
          </main>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          {currentView === 'map' ? (
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
              <header className="mb-6 text-right">
                 <div className="flex justify-between items-end">
                    <button onClick={loadLogs} disabled={logsLoading} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                      {logsLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      تحديث الخريطة
                    </button>
                    <div className="text-right">
                      <h1 className="text-2xl font-black text-slate-800">تحليل المناطق المغمورة</h1>
                      <p className="text-sm text-slate-500 font-medium">رصد المناطق المتضررة والتدخلات الميدانية</p>
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
                  <div className="order-2 md:order-1 flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <div className="relative flex-1 min-w-[200px] md:w-64">
                      <input 
                        type="text"
                        placeholder="بحث في السجل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-400 outline-none transition-all shadow-sm"
                      />
                      <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button 
                      onClick={loadLogs} 
                      disabled={logsLoading} 
                      className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {logsLoading ? <Loader2 size={16} className="animate-spin text-rose-500" /> : <RefreshCw size={16} className="text-rose-500" />}
                      تحديث المعطيات
                    </button>
                  </div>
                  <div className="order-1 md:order-2 text-right">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">سجل الإغاثة الميداني</h1>
                    <p className="text-slate-500 font-medium">إجمالي البلاغات المسجلة: {filteredLogs.length}</p>
                  </div>
                </div>
              </header>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-900 border-b border-slate-100">
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الجهة / الإقليم</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الجماعة / الدوار</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الخطورة</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الأضرار</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الاحتياجات</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">التواصل</th>
                        <th className="px-6 py-5 text-sm font-black whitespace-nowrap">الموقع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {filteredLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-800">{log.region}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{log.province}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-slate-800">{log.commune}</div>
                            <div className="text-xs text-rose-500 font-bold mt-0.5">{log.douar}</div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-block ${log.urgency.includes('حرج') || log.urgency.includes('4') ? 'bg-rose-500 text-white' : log.urgency.includes('مرتفع') || log.urgency.includes('3') ? 'bg-orange-500 text-white' : log.urgency.includes('متوسط') || log.urgency.includes('2') ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                              {log.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-slate-600 font-medium max-w-[200px]">{log.damage}</td>
                          <td className="px-6 py-5 text-xs text-slate-600 font-medium max-w-[200px]">{log.needs}</td>
                          <td className="px-6 py-5">
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
        </div>
      )}

      {/* أيقونة الخريطة العائمة */}
      <div className="fixed bottom-6 left-6 z-[1002]">
        <button 
          onClick={() => setShowDistMap(true)}
          className="bg-rose-500 text-white p-4 rounded-full shadow-2xl hover:bg-rose-600 active:scale-90 transition-all flex items-center justify-center"
          title="عرض خريطة التوزيع"
        >
          <MapIcon size={24} />
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
