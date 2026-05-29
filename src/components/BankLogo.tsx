import React from 'react';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface BankLogoProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BankLogo({ name, className, size = 'md' }: BankLogoProps) {
  // Normalize bank identification
  const nameLower = name.toLowerCase();
  
  let brand = {
    shortName: '؟',
    gradient: 'from-slate-600 to-slate-800',
    textColor: 'text-white',
    customIcon: null as React.ReactNode | null,
  };

  if (nameLower.includes('الأهلي') || nameLower.includes('nbe')) {
    brand = {
      shortName: 'الأهلي',
      gradient: 'from-[#0d5d26] to-[#15803d]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
          <path d="M12 2L3 7v9c0 5 9 6 9 6s9-1 9-6V7l-9-5z" />
          <path d="M12 22V12" />
          <path d="M17 8l-5 4-5-4" />
        </svg>
      )
    };
  } else if (nameLower.includes('بنك مصر') || nameLower.includes('misr')) {
    brand = {
      shortName: 'مصر',
      gradient: 'from-[#800f2f] to-[#a01a58]',
      textColor: 'text-[#d4af37]',
      customIcon: (
        <span className="font-serif text-lg font-black font-cairo">م</span>
      )
    };
  } else if (nameLower.includes('القاهرة') || nameLower.includes('cairo')) {
    brand = {
      shortName: 'القاهرة',
      gradient: 'from-[#d97706] to-[#ea580c]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    };
  } else if (nameLower.includes('العقاري') || nameLower.includes('eaeb')) {
    brand = {
      shortName: 'العقاري',
      gradient: 'from-[#1e3a8a] to-[#2563eb]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
          <path d="M3 21h18M3 10h18M5 21V10M19 21V10M9 21V10M15 21V10M12 2l9 8H3l9-8z" />
        </svg>
      )
    };
  } else if (nameLower.includes('التجاري الدولي') || nameLower.includes('cib')) {
    brand = {
      shortName: 'CIB',
      gradient: 'from-[#005ba4] to-[#1d4ed8]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs sm:text-sm font-black tracking-tighter">CIB</span>
      )
    };
  } else if (nameLower.includes('qnb')) {
    brand = {
      shortName: 'QNB',
      gradient: 'from-[#4c0519] to-[#881337]',
      textColor: 'text-[#d4af37]',
      customIcon: (
        <span className="font-sans text-xs sm:text-sm font-black italic">QNB</span>
      )
    };
  } else if (nameLower.includes('الافريقي') || nameLower.includes('الأفريقي') || nameLower.includes('aaib')) {
    brand = {
      shortName: 'AAIB',
      gradient: 'from-[#0f766e] to-[#0d9488]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-[10px] font-black leading-none">AAIB</span>
      )
    };
  } else if (nameLower.includes('الاسكندرية') || nameLower.includes('الإسكندرية') || nameLower.includes('alex')) {
    brand = {
      shortName: 'الاسكندرية',
      gradient: 'from-[#ea580c] to-[#f97316]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4-6.3-4.6-6.3 4.6 2.4-7.4-6.3-4.6h7.8z" />
        </svg>
      )
    };
  } else if (nameLower.includes('أبوظبي الإسلامي') || nameLower.includes('adib')) {
    brand = {
      shortName: 'ADIB',
      gradient: 'from-[#0f2c59] to-[#1e40af]',
      textColor: 'text-[#eab308]',
      customIcon: (
        <span className="font-sans text-xs font-black">ADIB</span>
      )
    };
  } else if (nameLower.includes('فيصل') || nameLower.includes('faisal')) {
    brand = {
      shortName: 'فيصل',
      gradient: 'from-[#065f46] to-[#047857]',
      textColor: 'text-[#eab308]',
      customIcon: (
        <span className="font-serif text-lg font-black font-cairo">ف</span>
      )
    };
  } else if (nameLower.includes('البركة') || nameLower.includes('baraka')) {
    brand = {
      shortName: 'البركة',
      gradient: 'from-[#854d0e] to-[#a16207]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-serif text-base font-black">ب</span>
      )
    };
  } else if (nameLower.includes('التعمير') || nameLower.includes('hdb')) {
    brand = {
      shortName: 'HDB',
      gradient: 'from-[#1e40af] to-[#3b82f6]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      )
    };
  } else if (nameLower.includes('الخليجى') || nameLower.includes('خليجي') || nameLower.includes('eg bank')) {
    brand = {
      shortName: 'EG Bank',
      gradient: 'from-[#be123c] to-[#e11d48]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-[10px] font-black">EG</span>
      )
    };
  } else if (nameLower.includes('قناة السويس') || nameLower.includes('suez')) {
    brand = {
      shortName: 'السويس',
      gradient: 'from-[#1d3557] to-[#457b9d]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    };
  } else if (nameLower.includes('saib') || nameLower.includes('العربية الدولية')) {
    brand = {
      shortName: 'SAIB',
      gradient: 'from-[#115e59] to-[#0d9488]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs font-black">SAIB</span>
      )
    };
  } else if (nameLower.includes('المتحد') || nameLower.includes('united')) {
    brand = {
      shortName: 'المتحد',
      gradient: 'from-[#1e3a8a] to-[#3b82f6]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs font-black">UB</span>
      )
    };
  } else if (nameLower.includes('نكست') || nameLower.includes('next')) {
    brand = {
      shortName: 'نكست',
      gradient: 'from-[#4f46e5] to-[#6366f1]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs font-black tracking-tighter">NEXT</span>
      )
    };
  } else if (nameLower.includes('امارات دبي') || nameLower.includes('الإمارات دبي') || nameLower.includes('enbd')) {
    brand = {
      shortName: 'ENBD',
      gradient: 'from-[#0284c7] to-[#0ea5e9]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs font-black">ENBD</span>
      )
    };
  } else if (nameLower.includes('ابوظبي الاول') || nameLower.includes('أبوظبي الأول') || nameLower.includes('fab')) {
    brand = {
      shortName: 'FAB',
      gradient: 'from-[#0f172a] to-[#1e293b]',
      textColor: 'text-[#eab308]',
      customIcon: (
        <span className="font-sans text-xs font-black">FAB</span>
      )
    };
  } else if (nameLower.includes('hsbc') || nameLower.includes('اتش اس بي سي')) {
    brand = {
      shortName: 'HSBC',
      gradient: 'from-[#1f2937] to-[#374151]',
      textColor: 'text-white',
      customIcon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full scale-90">
          <polygon points="10,10 30,10 20,20" fill="#db0011" />
          <polygon points="10,30 30,30 20,20" fill="#db0011" />
          <polygon points="10,10 10,30 20,20" fill="white" />
          <polygon points="30,10 30,30 20,20" fill="white" />
        </svg>
      )
    };
  } else if (nameLower.includes('التجاري وفا') || nameLower.includes('attijari')) {
    brand = {
      shortName: 'وفا',
      gradient: 'from-[#ea580c] to-[#f97316]',
      textColor: 'text-[#facc15]',
      customIcon: (
        <span className="font-sans text-xs font-black">ATW</span>
      )
    };
  } else if (nameLower.includes('كريدي') || nameLower.includes('agricole') || nameLower.includes('أجريكول')) {
    brand = {
      shortName: 'أجريكول',
      gradient: 'from-[#065f46] to-[#0f766e]',
      textColor: 'text-[#f59e0b]',
      customIcon: (
        <span className="font-sans text-[10px] font-black">CA</span>
      )
    };
  } else if (nameLower.includes('سيتي') || nameLower.includes('citibank')) {
    brand = {
      shortName: 'Citi',
      gradient: 'from-[#1d4ed8] to-[#2563eb]',
      textColor: 'text-white',
      customIcon: (
        <span className="font-sans text-xs font-black">citi</span>
      )
    };
  } else if (nameLower.includes('العربي') || nameLower.includes('arab bank')) {
    brand = {
      shortName: 'العربي',
      gradient: 'from-[#7f1d1d] to-[#991b1b]',
      textColor: 'text-[#d4af37]',
      customIcon: (
        <span className="font-serif text-base font-black">ع</span>
      )
    };
  } else if (nameLower.includes('كاش') || nameLower.includes('cash')) {
    brand = {
      shortName: 'كاش',
      gradient: 'from-[#059669] to-[#10b981]',
      textColor: 'text-white',
      customIcon: <Wallet className="w-5 h-5" />,
    };
  }

  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-[10px]',
    md: 'w-10 h-10 rounded-xl text-xs',
    lg: 'w-12 h-12 rounded-2xl text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center font-black select-none shrink-0 border border-white/10 shadow-lg',
        brand.gradient,
        brand.textColor,
        sizeClasses[size],
        className
      )}
    >
      {brand.customIcon ? (
        <div className="w-5 h-5 flex items-center justify-center">{brand.customIcon}</div>
      ) : (
        <span>{brand.shortName}</span>
      )}
    </div>
  );
}
