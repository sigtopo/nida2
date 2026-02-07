
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

export const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 transition-all hover:shadow-md">
    <div className="flex items-center gap-3 mb-8 border-r-8 border-[#e11d48] pr-5">
      {icon && <div className="p-2 bg-rose-50 rounded-lg text-[#e11d48]">{icon}</div>}
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
  <div className={`flex flex-col gap-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
      {label} {required && <span className="text-rose-500 font-black">*</span>}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-rose-500/10 focus:border-[#e11d48] outline-none transition-all min-h-[120px] bg-slate-50/30 text-slate-800 placeholder:text-slate-400 font-medium disabled:opacity-50"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-rose-500/10 focus:border-[#e11d48] outline-none transition-all bg-slate-50/30 text-slate-800 placeholder:text-slate-400 font-medium disabled:opacity-50"
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
}> = ({ label, options, value, onChange, placeholder, disabled, required }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  const exactMatch = options.find(opt => opt === value);

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
        {label} {required && <span className="text-rose-500 font-black">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'ابحث أو اكتب اسماً جديداً...'}
          disabled={disabled}
          className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-rose-500/10 focus:border-[#e11d48] outline-none transition-all bg-slate-50/30 text-slate-800 font-medium disabled:opacity-50"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
           {isOpen ? <Search size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full bg-white border-2 border-slate-100 rounded-2xl mt-2 shadow-2xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-4 py-3 hover:bg-rose-50 transition-colors flex items-center justify-between group ${
                  value === opt ? 'bg-rose-50 text-[#e11d48] font-bold' : 'text-slate-700'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <Plus size={14} className="opacity-0 group-hover:opacity-100" />}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-slate-400 italic flex items-center gap-2">
              <Plus size={16} />
              <span>إضافة كمعطى جديد: "{value}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
