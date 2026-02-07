
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Info, AlertTriangle, Send, RefreshCw, CheckCircle2, ShieldAlert, PhoneForwarded, Loader2 } from 'lucide-react';
import { SectionCard, InputField, SearchableSelect } from './components/Layout';
import { FormData, UrgencyLevel, URGENCY_LABELS } from './types';
import { submitFormData } from './services/api';
import { fetchAdminData, AdminRow } from './services/data';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allAdminData, setAllAdminData] = useState<AdminRow[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    region: '',
    province: '',
    commune: '',
    nom_douar: '',
    niveau_urgence: UrgencyLevel.MEDIUM,
    nature_dommages: '',
    besoins_essentiels: '',
    numero_telephone: '',
    latitude: '0.000000',
    longitude: '0.000000',
    lien_maps: ''
  });

  // Load Admin Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      const data = await fetchAdminData();
      setAllAdminData(data);
      setDataLoading(false);
    };
    loadData();
  }, []);

  // Cascading Filter Logic with Locale-aware Alphabetical Sorting
  const regions = useMemo(() => 
    Array.from(new Set(allAdminData.map(r => r.region)))
      .sort((a, b) => a.localeCompare(b, 'ar')), 
    [allAdminData]
  );
  
  const provinces = useMemo(() => {
    if (!formData.region) return [];
    return Array.from(new Set(allAdminData.filter(r => r.region === formData.region).map(r => r.province)))
      .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.region]);

  const communes = useMemo(() => {
    if (!formData.province) return [];
    return Array.from(new Set(allAdminData.filter(r => r.province === formData.province).map(r => r.commune)))
      .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.province]);

  const douars = useMemo(() => {
    if (!formData.commune) return [];
    return Array.from(new Set(allAdminData.filter(r => r.commune === formData.commune).map(r => r.douar)))
      .sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allAdminData, formData.commune]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Cascading Resets (Only reset downstream if the selection actually changes)
      if (field === 'region' && value !== prev.region) {
        updated.province = '';
        updated.commune = '';
        updated.nom_douar = '';
      } else if (field === 'province' && value !== prev.province) {
        updated.commune = '';
        updated.nom_douar = '';
      } else if (field === 'commune' && value !== prev.commune) {
        updated.nom_douar = '';
      }

      if (field === 'latitude' || field === 'longitude') {
        const lat = field === 'latitude' ? value : prev.latitude;
        const lng = field === 'longitude' ? value : prev.longitude;
        updated.lien_maps = `https://www.google.com/maps?q=${lat},${lng}`;
      }
      return updated;
    });
  };

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خاصية الموقع الجغرافي");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          lien_maps: `https://www.google.com/maps?q=${latitude},${longitude}`
        }));
      },
      (err) => {
        console.error(err);
        alert("تعذر جلب الموقع الجغرافي. يرجى التأكد من تفعيل الخاصية وإعطاء الصلاحية.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitFormData(formData);
    
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      setFormData(prev => ({
        ...prev,
        region: '',
        province: '',
        commune: '',
        nom_douar: '',
        nature_dommages: '',
        besoins_essentiels: '',
        numero_telephone: ''
      }));
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col antialiased">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <header className="bg-slate-900 text-white relative overflow-hidden z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-rose-500 via-orange-400 to-rose-500 animate-gradient-x"></div>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <ShieldAlert className="text-rose-500 animate-pulse" size={32} />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  منصة جمع المعطيات الميدانية
                </h1>
              </div>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
                توثيق الأضرار والاحتياجات المستعجلة لإدارة التدخلات الإنسانية بكفاءة
              </p>
            </div>
            <div className="hidden lg:block bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/30">
                  <RefreshCw className={loading ? 'animate-spin' : ''} size={32} />
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">حالة الاتصال</div>
                  <div className="text-emerald-400 font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    متصل بالنظام المركزى
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 -mt-10 relative z-20 pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-5 items-center">
                <div className="bg-emerald-500 p-4 rounded-3xl text-white shadow-lg shadow-emerald-200">
                  <MapPin size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">نظام تحديد المواقع (GPS)</h2>
                  <p className="text-slate-500 font-medium">دقة التموقع الحالية: <span className="text-emerald-600 font-bold">عالية جداً</span></p>
                </div>
              </div>
              <button 
                type="button"
                onClick={fetchLocation}
                className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95 group"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                تحديث الموقع الميداني
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:border-emerald-200">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600">خط العرض Latitude</label>
                <div className="text-3xl font-mono font-bold text-slate-800">{formData.latitude}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:border-emerald-200">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600">خط الطول Longitude</label>
                <div className="text-3xl font-mono font-bold text-slate-800">{formData.longitude}</div>
              </div>
              <div className="md:col-span-2 lg:col-span-1 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-center">
                <a 
                  href={formData.lien_maps} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-emerald-700 font-bold flex items-center gap-2 hover:underline text-lg"
                >
                  <MapPin size={24} />
                  معاينة الموقع على الخريطة
                </a>
              </div>
            </div>
          </div>

          <SectionCard title="بيانات التموقع الإداري" icon={<Info size={28} />}>
            {dataLoading ? (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-10 gap-4 text-slate-400">
                <Loader2 size={40} className="animate-spin" />
                <p className="font-bold">جاري تحميل البيانات الإدارية من النظام...</p>
              </div>
            ) : (
              <>
                <SearchableSelect 
                  label="الجهة الإدارية" 
                  placeholder="اختر أو ابدأ الكتابة..."
                  options={regions}
                  value={formData.region}
                  onChange={(v) => updateField('region', v)}
                  required
                />
                <SearchableSelect 
                  label="الإقليم / العمالة" 
                  placeholder="اختر أو ابدأ الكتابة..."
                  options={provinces}
                  value={formData.province}
                  onChange={(v) => updateField('province', v)}
                  required
                />
                <SearchableSelect 
                  label="الجماعة الترابية" 
                  placeholder="اختر أو ابدأ الكتابة..."
                  options={communes}
                  value={formData.commune}
                  onChange={(v) => updateField('commune', v)}
                  required
                />
                <SearchableSelect 
                  label="اسم الدوار / التجمع السكاني" 
                  placeholder="اختر أو ابدأ الكتابة..."
                  options={douars}
                  value={formData.nom_douar}
                  onChange={(v) => updateField('nom_douar', v)}
                  required
                />
              </>
            )}
          </SectionCard>

          <SectionCard title="رصد الحالة الميدانية والأضرار" icon={<AlertTriangle size={28} />}>
            <div className="md:col-span-2 space-y-4">
              <label className="text-base font-black text-slate-700 flex items-center gap-2">
                مستوى خطورة الحالة الراهنة <span className="text-rose-500 font-black text-xl leading-none">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(UrgencyLevel) as Array<keyof typeof UrgencyLevel>).map((level) => {
                  const isActive = formData.niveau_urgence === UrgencyLevel[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateField('niveau_urgence', UrgencyLevel[level])}
                      className={`relative overflow-hidden py-5 px-4 rounded-[1.5rem] text-sm font-black transition-all border-2 text-center flex flex-col items-center gap-2 ${
                        isActive 
                        ? `bg-[#e11d48] border-[#e11d48] text-white shadow-xl shadow-rose-200 ring-4 ring-rose-500/20` 
                        : `bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50`
                      }`}
                    >
                      <span className="relative z-10">{URGENCY_LABELS[UrgencyLevel[level]]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <InputField 
              label="طبيعة الأضرار والوضع الراهن" 
              placeholder="انهيار مباني، انقطاع طريق، تضرر شبكة الماء..." 
              value={formData.nature_dommages}
              onChange={(v) => updateField('nature_dommages', v)}
              required
            />
            <InputField 
              label="رقم هاتف مسؤول التواصل بالميدان" 
              placeholder="06XXXXXXXX" 
              value={formData.numero_telephone}
              onChange={(v) => updateField('numero_telephone', v)}
              type="tel"
              required
            />
            <InputField 
              label="قائمة الاحتياجات الأساسية والمستعجلة" 
              placeholder="مثال: 50 خيمة، أغطية لـ 100 فرد، أدوية الأمراض المزمنة، حليب أطفال..." 
              value={formData.besoins_essentiels}
              onChange={(v) => updateField('besoins_essentiels', v)}
              multiline
              fullWidth
              required
            />
          </SectionCard>

          <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border border-slate-200 sticky bottom-6 z-40">
            <button
              type="submit"
              disabled={loading || dataLoading}
              className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 text-2xl font-black transition-all shadow-2xl active:scale-95 ${
                (loading || dataLoading) 
                ? "bg-slate-300 cursor-not-allowed text-slate-500" 
                : success 
                  ? "bg-emerald-500 text-white shadow-emerald-200" 
                  : "bg-slate-900 text-white hover:bg-[#e11d48] hover:shadow-rose-200"
              }`}
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={32} />
              ) : success ? (
                <CheckCircle2 size={32} />
              ) : (
                <Send size={32} />
              )}
              <span className="mt-1">
                {loading ? "جاري مزامنة المعطيات..." : success ? "تم الإرسال والتوثيق بنجاح" : "اعتماد وإرسال التقرير الميداني"}
              </span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl border-2 border-red-100 text-center font-black text-xl animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <ShieldAlert size={28} />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-8 rounded-[2rem] border-2 border-emerald-100 text-center shadow-lg shadow-emerald-100/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2">تم استلام التقرير بنجاح</h3>
                  <p className="font-bold text-emerald-600 opacity-80">شكراً لمساهمتك في التغطية الميدانية. تم تحديث قاعدة البيانات المركزية.</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      <footer className="py-12 bg-slate-900 text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right">
            <div className="text-white font-black text-xl mb-1 flex items-center justify-center md:justify-start gap-2">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
              النظام الوطني لتدبير الطوارئ
            </div>
            <p className="text-sm font-medium">وحدة الرصد واليقظة المعلوماتية &copy; {new Date().getFullYear()}</p>
          </div>
          <div className="flex gap-8 text-sm font-bold">
            <span className="flex items-center gap-2">
              <PhoneForwarded size={18} className="text-rose-500" />
              الرقم الأخضر: 112
            </span>
            <span className="opacity-50">v2.6.0 Smart-Entry Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
