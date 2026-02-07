
import React, { useState, useMemo } from 'react';
import { Search, Phone, ExternalLink, MapPin } from 'lucide-react';
import { SubmissionRow } from '../services/data';

interface DashboardProps {
  logs: SubmissionRow[];
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, loading }) => {
  const [searchTerms, setSearchTerms] = useState({
    region: '', province: '', commune: '', douar: '', urgency: '', damage: '', needs: '', phone: ''
  });

  const prioritizedLogs = useMemo(() => {
    // نقوم بترتيب السجلات: المطابق للبحث يظهر أولاً
    return [...logs].sort((a, b) => {
      const getScore = (log: SubmissionRow) => {
        let score = 0;
        if (searchTerms.region && log.region.includes(searchTerms.region)) score += 10;
        if (searchTerms.province && log.province.includes(searchTerms.province)) score += 10;
        if (searchTerms.commune && log.commune.includes(searchTerms.commune)) score += 10;
        if (searchTerms.douar && log.douar.includes(searchTerms.douar)) score += 100; // أولوية قصوى للدوار
        if (searchTerms.urgency && log.urgency.includes(searchTerms.urgency)) score += 5;
        if (searchTerms.damage && log.damage.includes(searchTerms.damage)) score += 2;
        if (searchTerms.needs && log.needs.includes(searchTerms.needs)) score += 2;
        if (searchTerms.phone && log.phone.includes(searchTerms.phone)) score += 50;
        return score;
      };

      return getScore(b) - getScore(a);
    });
  }, [logs, searchTerms]);

  const handleSearchChange = (field: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [field]: value }));
  };

  const FilterInput = ({ field, placeholder }: { field: string, placeholder: string }) => (
    <div className="relative mt-2">
      <input
        type="text"
        placeholder={placeholder}
        value={(searchTerms as any)[field]}
        onChange={(e) => handleSearchChange(field, e.target.value)}
        className="w-full px-3 py-1.5 text-[10px] bg-white/10 border border-white/20 rounded-lg focus:bg-white focus:text-slate-900 outline-none text-right font-medium placeholder:text-white/40"
      />
      <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#1e293b] text-white">
              <th className="px-4 py-4 text-[11px] font-black min-w-[130px]">
                الجهة / الإقليم
                <FilterInput field="region" placeholder="بحث..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black min-w-[130px]">
                الجماعة / الدوار
                <FilterInput field="douar" placeholder="بحث بالاسم..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black min-w-[100px]">
                الخطورة
                <FilterInput field="urgency" placeholder="فلترة..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black min-w-[150px]">
                الأضرار
                <FilterInput field="damage" placeholder="بحث..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black min-w-[150px]">
                الاحتياجات
                <FilterInput field="needs" placeholder="بحث..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black min-w-[110px]">
                التواصل
                <FilterInput field="phone" placeholder="بحث..." />
              </th>
              <th className="px-4 py-4 text-[11px] font-black w-20">الموقع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && logs.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-20 text-center font-bold text-slate-400 italic">جاري تحميل السجلات...</td></tr>
            ) : (
              prioritizedLogs.map((log, idx) => {
                const isMatched = Object.entries(searchTerms).some(([k, v]) => v && (log as any)[k === 'damage' ? 'damage' : k === 'needs' ? 'needs' : k]?.includes(v));
                
                let urgencyClass = "bg-slate-100 text-slate-600";
                if (log.urgency.includes('حرج') || log.urgency.includes('٤')) urgencyClass = "bg-rose-500 text-white";
                else if (log.urgency.includes('مرتفع') || log.urgency.includes('٣')) urgencyClass = "bg-orange-500 text-white";
                else if (log.urgency.includes('متوسط') || log.urgency.includes('٢')) urgencyClass = "bg-amber-100 text-amber-700";

                return (
                  <tr key={idx} className={`transition-colors animate-fade-in ${isMatched ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-slate-800">{log.region}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{log.province}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-slate-800">{log.commune}</div>
                      <div className="text-[10px] text-rose-500 font-bold mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {log.douar}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${urgencyClass}`}>
                        {log.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[10px] text-slate-600 max-w-[150px] leading-relaxed line-clamp-2">{log.damage}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[10px] text-slate-600 font-medium max-w-[150px] leading-relaxed line-clamp-2">{log.needs}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <a href={`tel:${log.phone}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200">
                        <Phone size={12} className="text-rose-500" />
                        {log.phone}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <a href={log.mapLink} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                        <ExternalLink size={14} />
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
  );
};
