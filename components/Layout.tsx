
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, AlertCircle } from 'lucide-react';

export const SectionCard: React.FC<{ title: string; children: React.ReactNode; number?: string }> = ({ title, children, number }) => (
  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-6">
    <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
      <h2 className="text-lg font-bold text-rose-500 flex items-center gap-2">
        <span className="text-sm opacity-60">{number}</span>
        {title}
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
      {children}
    </div>
  </div>
);

export const InputField: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}> = ({ label, placeholder, value, onChange, required, type = "text", multiline, fullWidth, disabled }) => (
  <div className={`flex flex-col gap-1.5 ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="text-[13px] font-bold text-slate-500 mr-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {multiline ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-4 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/5 outline-none transition-all min-h-[100px] bg-white text-slate-700 placeholder:text-slate-300 text-sm disabled:bg-slate-50 text-right"
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-4 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/5 outline-none transition-all bg-white text-slate-700 placeholder:text-slate-300 text-sm disabled:bg-slate-50 text-right"
      />
    )}
  </div>
);

export const SearchableSelect: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  strict?: boolean;
}> = ({ label, options, value, onChange, placeholder, disabled, required, strict = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تحديث نص البحث عندما تتغير القيمة المختارة
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const safeOptions = options || [];
  const filteredOptions = safeOptions.filter(opt => 
    opt && opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-[13px] font-bold text-slate-500 mr-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!strict) onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'ابحث أو اختر...'}
          disabled={disabled}
          className="w-full p-4 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/5 outline-none transition-all bg-white text-slate-700 placeholder:text-slate-300 text-sm disabled:bg-slate-50 text-right pr-4 pl-10"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
           <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-xl mt-1 shadow-xl z-[100] max-h-56 overflow-y-auto custom-scrollbar text-right ring-1 ring-slate-900/5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setSearchTerm(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-4 py-3 hover:bg-rose-50 text-sm transition-colors border-b border-slate-50 last:border-none ${
                  value === opt ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-600'
                }`}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-slate-400 italic text-xs flex items-center justify-center gap-2">
              {searchTerm && !strict ? (
                <>
                  <span>إضافة جديد: "{searchTerm}"</span>
                  <Plus size={14} className="text-rose-500" />
                </>
              ) : searchTerm ? (
                <>
                  <AlertCircle size={14} className="text-slate-300" />
                  <span>لا توجد نتائج مطابقة</span>
                </>
              ) : (
                <span>يرجى كتابة اسم للبحث...</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
