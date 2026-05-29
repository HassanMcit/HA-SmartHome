import React from 'react';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export interface BankWalletInfo {
  key: string;
  matchKeywords: string[];
  ar: string;
  en: string;
  gradient: string;
  textColor: string;
  shortName: string;
  customIcon?: React.ReactNode;
}

export const BANK_WALLET_CATALOG: BankWalletInfo[] = [
  {
    key: 'nbe',
    matchKeywords: ['الأهلي', 'nbe', 'national bank of egypt'],
    ar: 'البنك الأهلي المصري',
    en: 'National Bank of Egypt (NBE)',
    gradient: 'from-[#0d5d26] to-[#15803d]',
    textColor: 'text-white',
    shortName: 'الأهلي',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
        <path d="M12 2L3 7v9c0 5 9 6 9 6s9-1 9-6V7l-9-5z" />
        <path d="M12 22V12" />
        <path d="M17 8l-5 4-5-4" />
      </svg>
    )
  },
  {
    key: 'misr',
    matchKeywords: ['بنك مصر', 'misr'],
    ar: 'بنك مصر',
    en: 'Banque Misr',
    gradient: 'from-[#800f2f] to-[#a01a58]',
    textColor: 'text-[#d4af37]',
    shortName: 'مصر',
    customIcon: (
      <span className="font-serif text-lg font-black">م</span>
    )
  },
  {
    key: 'cairo',
    matchKeywords: ['القاهرة', 'cairo'],
    ar: 'بنك القاهرة',
    en: 'Banque du Caire',
    gradient: 'from-[#d97706] to-[#ea580c]',
    textColor: 'text-white',
    shortName: 'القاهرة',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  {
    key: 'eaeb',
    matchKeywords: ['العقاري', 'eaeb', 'land bank'],
    ar: 'البنك العقاري المصري العربي',
    en: 'Egyptian Arab Land Bank',
    gradient: 'from-[#1e3a8a] to-[#2563eb]',
    textColor: 'text-white',
    shortName: 'العقاري',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
        <path d="M3 21h18M3 10h18M5 21V10M19 21V10M9 21V10M15 21V10M12 2l9 8H3l9-8z" />
      </svg>
    )
  },
  {
    key: 'cib',
    matchKeywords: ['التجاري الدولي', 'cib', 'commercial international'],
    ar: 'البنك التجاري الدولي (CIB)',
    en: 'Commercial International Bank (CIB)',
    gradient: 'from-[#005ba4] to-[#1d4ed8]',
    textColor: 'text-white',
    shortName: 'CIB',
    customIcon: (
      <span className="font-sans text-xs sm:text-sm font-black tracking-tighter">CIB</span>
    )
  },
  {
    key: 'qnb',
    matchKeywords: ['qnb', 'كيو إن بي'],
    ar: 'بنك QNB',
    en: 'QNB Bank',
    gradient: 'from-[#4c0519] to-[#881337]',
    textColor: 'text-[#d4af37]',
    shortName: 'QNB',
    customIcon: (
      <span className="font-sans text-xs sm:text-sm font-black italic">QNB</span>
    )
  },
  {
    key: 'aaib',
    matchKeywords: ['الافريقي', 'الأفريقي', 'aaib', 'arab african'],
    ar: 'البنك العربي الأفريقي الدولي (AAIB)',
    en: 'Arab African International Bank (AAIB)',
    gradient: 'from-[#0f766e] to-[#0d9488]',
    textColor: 'text-white',
    shortName: 'AAIB',
    customIcon: (
      <span className="font-sans text-[10px] font-black leading-none">AAIB</span>
    )
  },
  {
    key: 'alex',
    matchKeywords: ['الاسكندرية', 'الإسكندرية', 'alexandria', 'alex'],
    ar: 'بنك الإسكندرية',
    en: 'Bank of Alexandria',
    gradient: 'from-[#ea580c] to-[#f97316]',
    textColor: 'text-white',
    shortName: 'الاسكندرية',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4-6.3-4.6-6.3 4.6 2.4-7.4-6.3-4.6h7.8z" />
      </svg>
    )
  },
  {
    key: 'adib',
    matchKeywords: ['أبوظبي الإسلامي', 'ابوظبي الاسلامي', 'adib', 'abu dhabi islamic'],
    ar: 'مصرف أبوظبي الإسلامي (ADIB)',
    en: 'Abu Dhabi Islamic Bank (ADIB)',
    gradient: 'from-[#0f2c59] to-[#1e40af]',
    textColor: 'text-[#eab308]',
    shortName: 'ADIB',
    customIcon: (
      <span className="font-sans text-xs font-black">ADIB</span>
    )
  },
  {
    key: 'faisal',
    matchKeywords: ['فيصل', 'faisal'],
    ar: 'بنك فيصل الإسلامي المصري',
    en: 'Faisal Islamic Bank',
    gradient: 'from-[#065f46] to-[#047857]',
    textColor: 'text-[#eab308]',
    shortName: 'فيصل',
    customIcon: (
      <span className="font-serif text-lg font-black">ف</span>
    )
  },
  {
    key: 'baraka',
    matchKeywords: ['البركة', 'baraka'],
    ar: 'بنك البركة مصر',
    en: 'Al Baraka Bank Egypt',
    gradient: 'from-[#854d0e] to-[#a16207]',
    textColor: 'text-white',
    shortName: 'البركة',
    customIcon: (
      <span className="font-serif text-base font-black">ب</span>
    )
  },
  {
    key: 'hdb',
    matchKeywords: ['التعمير', 'hdb', 'housing & development'],
    ar: 'بنك التعمير والإسكان (HDB)',
    en: 'Housing & Development Bank (HDB)',
    gradient: 'from-[#1e40af] to-[#3b82f6]',
    textColor: 'text-white',
    shortName: 'HDB',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    key: 'egbank',
    matchKeywords: ['الخليجى', 'خليجي', 'eg bank', 'egyptian gulf'],
    ar: 'البنك المصري الخليجي (EG Bank)',
    en: 'Egyptian Gulf Bank (EG Bank)',
    gradient: 'from-[#be123c] to-[#e11d48]',
    textColor: 'text-white',
    shortName: 'EG Bank',
    customIcon: (
      <span className="font-sans text-[10px] font-black">EG</span>
    )
  },
  {
    key: 'suez',
    matchKeywords: ['قناة السويس', 'suez'],
    ar: 'بنك قناة السويس',
    en: 'Suez Canal Bank',
    gradient: 'from-[#1d3557] to-[#457b9d]',
    textColor: 'text-white',
    shortName: 'السويس',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
  },
  {
    key: 'saib',
    matchKeywords: ['saib', 'المصرفية العربية الدولية'],
    ar: 'بنك الشركة المصرفية العربية الدولية (SAIB)',
    en: 'Société Arabe Internationale de Banque (SAIB)',
    gradient: 'from-[#115e59] to-[#0d9488]',
    textColor: 'text-white',
    shortName: 'SAIB',
    customIcon: (
      <span className="font-sans text-xs font-black">SAIB</span>
    )
  },
  {
    key: 'united',
    matchKeywords: ['المتحد', 'united bank'],
    ar: 'المصرف المتحد',
    en: 'The United Bank',
    gradient: 'from-[#1e3a8a] to-[#3b82f6]',
    textColor: 'text-white',
    shortName: 'المتحد',
    customIcon: (
      <span className="font-sans text-xs font-black">UB</span>
    )
  },
  {
    key: 'next',
    matchKeywords: ['نكست', 'next bank'],
    ar: 'بنك نكست',
    en: 'Next Bank',
    gradient: 'from-[#4f46e5] to-[#6366f1]',
    textColor: 'text-white',
    shortName: 'نكست',
    customIcon: (
      <span className="font-sans text-xs font-black tracking-tighter">NEXT</span>
    )
  },
  {
    key: 'enbd',
    matchKeywords: ['امارات دبي', 'الإمارات دبي', 'enbd', 'emirates nbd'],
    ar: 'بنك الإمارات دبي الوطني',
    en: 'Emirates NBD',
    gradient: 'from-[#0284c7] to-[#0ea5e9]',
    textColor: 'text-white',
    shortName: 'ENBD',
    customIcon: (
      <span className="font-sans text-xs font-black">ENBD</span>
    )
  },
  {
    key: 'fab',
    matchKeywords: ['ابوظبي الاول', 'أبوظبي الأول', 'fab', 'first abu dhabi'],
    ar: 'بنك أبوظبي الأول (FAB)',
    en: 'First Abu Dhabi Bank (FAB)',
    gradient: 'from-[#0f172a] to-[#1e293b]',
    textColor: 'text-[#eab308]',
    shortName: 'FAB',
    customIcon: (
      <span className="font-sans text-xs font-black">FAB</span>
    )
  },
  {
    key: 'hsbc',
    matchKeywords: ['hsbc', 'اتش اس بي سي'],
    ar: 'بنك إتش إس بي سي مصر (HSBC)',
    en: 'HSBC Bank Egypt',
    gradient: 'from-[#1f2937] to-[#374151]',
    textColor: 'text-white',
    shortName: 'HSBC',
    customIcon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full scale-90">
        <polygon points="10,10 30,10 20,20" fill="#db0011" />
        <polygon points="10,30 30,30 20,20" fill="#db0011" />
        <polygon points="10,10 10,30 20,20" fill="white" />
        <polygon points="30,10 30,30 20,20" fill="white" />
      </svg>
    )
  },
  {
    key: 'attijari',
    matchKeywords: ['التجاري وفا', 'attijari'],
    ar: 'التجاري وفا بنك',
    en: 'Attijariwafa Bank',
    gradient: 'from-[#ea580c] to-[#f97316]',
    textColor: 'text-[#facc15]',
    shortName: 'وفا',
    customIcon: (
      <span className="font-sans text-xs font-black">ATW</span>
    )
  },
  {
    key: 'agricole',
    matchKeywords: ['كريدي', 'agricole', 'أجريكول'],
    ar: 'كريدي أجريكول مصر',
    en: 'Crédit Agricole Egypt',
    gradient: 'from-[#065f46] to-[#0f766e]',
    textColor: 'text-[#f59e0b]',
    shortName: 'أجريكول',
    customIcon: (
      <span className="font-sans text-[10px] font-black">CA</span>
    )
  },
  {
    key: 'citibank',
    matchKeywords: ['سيتي', 'citibank'],
    ar: 'سيتي بنك (Citibank)',
    en: 'Citibank',
    gradient: 'from-[#1d4ed8] to-[#2563eb]',
    textColor: 'text-white',
    shortName: 'Citi',
    customIcon: (
      <span className="font-sans text-xs font-black">citi</span>
    )
  },
  {
    key: 'arab',
    matchKeywords: ['العربي', 'arab bank'],
    ar: 'البنك العربي',
    en: 'Arab Bank',
    gradient: 'from-[#7f1d1d] to-[#991b1b]',
    textColor: 'text-[#d4af37]',
    shortName: 'العربي',
    customIcon: (
      <span className="font-serif text-base font-black">ع</span>
    )
  },
  // Mobile Wallets
  {
    key: 'vodafone_cash',
    matchKeywords: ['vodafone cash', 'فودافون كاش', 'vodafone', 'فودافون'],
    ar: 'فودافون كاش',
    en: 'Vodafone Cash',
    gradient: 'from-[#e60000] to-[#990000]',
    textColor: 'text-white',
    shortName: 'VF',
    customIcon: (
      <span className="font-sans text-sm font-black tracking-tight">VF</span>
    )
  },
  {
    key: 'orange_cash',
    matchKeywords: ['orange cash', 'اورنج كاش', 'أورانج كاش', 'orange', 'اورنج'],
    ar: 'أورانج كاش',
    en: 'Orange Cash',
    gradient: 'from-[#ff6600] to-[#cc5200]',
    textColor: 'text-white',
    shortName: 'Orange',
    customIcon: (
      <span className="font-sans text-[9px] font-black tracking-tighter">Orange</span>
    )
  },
  {
    key: 'etisalat_cash',
    matchKeywords: ['etisalat cash', 'اتصالات كاش', 'etisalat', 'etislate', 'اتصالات'],
    ar: 'اتصالات كاش',
    en: 'Etisalat Cash',
    gradient: 'from-[#7fba00] to-[#4e7300]',
    textColor: 'text-white',
    shortName: 'e&',
    customIcon: (
      <span className="font-sans text-xs font-black">e&</span>
    )
  },
  {
    key: 'wepay',
    matchKeywords: ['we pay', 'wepay', 'وي باي', 'we', 'وي'],
    ar: 'وي باي (WE Pay)',
    en: 'WE Pay',
    gradient: 'from-[#501a96] to-[#360e6b]',
    textColor: 'text-white',
    shortName: 'WE',
    customIcon: (
      <span className="font-sans text-xs font-black tracking-tighter">WE</span>
    )
  }
];

export function getTranslatedBankName(name: string, lang: 'ar' | 'en'): string {
  if (!name) return '';
  const nameLower = name.toLowerCase();
  
  // Find match in catalog
  const found = BANK_WALLET_CATALOG.find(item => 
    item.matchKeywords.some(keyword => nameLower.includes(keyword.toLowerCase()))
  );
  if (found) {
    return lang === 'ar' ? found.ar : found.en;
  }
  
  // Custom case: Cash
  if (nameLower.includes('كاش') || nameLower.includes('cash')) {
    return lang === 'ar' ? 'نقد كاش' : 'Cash';
  }
  
  return name;
}

interface BankLogoProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BankLogo({ name, className, size = 'md' }: BankLogoProps) {
  const nameLower = (name || '').toLowerCase();
  
  // Find in catalog
  const matchedInfo = BANK_WALLET_CATALOG.find(item => 
    item.matchKeywords.some(keyword => nameLower.includes(keyword.toLowerCase()))
  );
  
  let brand = {
    shortName: '؟',
    gradient: 'from-slate-600 to-slate-800',
    textColor: 'text-white',
    customIcon: null as React.ReactNode | null,
  };

  if (matchedInfo) {
    brand = {
      shortName: matchedInfo.shortName,
      gradient: matchedInfo.gradient,
      textColor: matchedInfo.textColor,
      customIcon: matchedInfo.customIcon || null,
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
