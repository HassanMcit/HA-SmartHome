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
      <svg viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="3" fill="#d4af37" />
        <path d="M12 10v10M9 20h6M8 14h8" />
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
      <svg viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" fill="#d4af37" fillOpacity="0.1" />
        <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
        <path d="M8 16c-1.5 1.5-2.5 2-4 2" />
        <circle cx="12" cy="12" r="1.5" fill="#d4af37" />
      </svg>
    )
  },
  {
    key: 'cairo',
    matchKeywords: ['القاهرة', 'cairo', 'caire'],
    ar: 'بنك القاهرة',
    en: 'Banque du Caire',
    gradient: 'from-[#d97706] to-[#ea580c]',
    textColor: 'text-white',
    shortName: 'القاهرة',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-full h-full">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="2" fill="white" />
      </svg>
    )
  },
  {
    key: 'ealb',
    matchKeywords: ['العقاري', 'ealb', 'land bank'],
    ar: 'البنك العقاري المصري العربي',
    en: 'Egyptian Arab Land Bank',
    gradient: 'from-[#1e3a8a] to-[#2563eb]',
    textColor: 'text-white',
    shortName: 'العقاري',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2.2" />
        <path d="M3 12h18" strokeWidth="1.8" />
        <text x="12" y="12.5" fontFamily="sans-serif" fontSize="7" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">CIB</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="8" fontWeight="900" fontStyle="italic" fill="#d4af37" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">QNB</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-full h-full">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" strokeWidth="1" />
        <path d="M12 3a9 9 0 010 18M12 3a9 9 0 000 18" strokeWidth="1" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4C8 4 5 7 5 11c0 5 7 9 7 9s7-4 7-9c0-4-3-7-7-7z" fill="#eab308" fillOpacity="0.2" />
        <path d="M12 8v6M9 11h6" strokeWidth="1.8" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" fill="#eab308" fillOpacity="0.2" />
        <text x="12" y="12.5" fontFamily="serif" fontSize="7" fontWeight="950" fill="white" textAnchor="middle" dominantBaseline="middle">ف</text>
      </svg>
    )
  },
  {
    key: 'baraka',
    matchKeywords: ['البركة', 'البركه', 'baraka'],
    ar: 'بنك البركة مصر',
    en: 'Al Baraka Bank Egypt',
    gradient: 'from-[#854d0e] to-[#a16207]',
    textColor: 'text-white',
    shortName: 'البركة',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4a8 8 0 008 8 8 8 0 00-8 8" />
        <text x="11.5" y="12.5" fontFamily="serif" fontSize="7" fontWeight="950" fill="white" textAnchor="middle" dominantBaseline="middle">ب</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="9.5" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">EG</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13.5" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">saib</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">UB</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">NEXT</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="9" y="13" fontFamily="sans-serif" fontSize="8.5" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">FAB</text>
        <path d="M19 8l2.5 3.5-2.5 3.5-2.5-3.5z" fill="#db0011" />
      </svg>
    )
  },
  {
    key: 'hsbc',
    matchKeywords: ['hsbc', 'اتش اس بي سي', 'إتش إس بي سي'],
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
    matchKeywords: ['التجاري وفا', 'تجاري وفا', 'attijari'],
    ar: 'التجاري وفا بنك',
    en: 'Attijariwafa Bank',
    gradient: 'from-[#ea580c] to-[#f97316]',
    textColor: 'text-[#facc15]',
    shortName: 'وفا',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-[#facc15]" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2 2" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#f59e0b" textAnchor="middle" dominantBaseline="middle">CA</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 10 Q12 4 20 10" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <text x="12" y="15" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">citi</text>
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" className="w-full h-full">
        <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
        <text x="12" y="12.5" fontFamily="serif" fontSize="10" fontWeight="900" fill="#d4af37" textAnchor="middle" dominantBaseline="middle">ع</text>
      </svg>
    )
  },
  // Mobile Wallets
  {
    key: 'vodafone_cash',
    matchKeywords: ['vodafone cash', 'فودافون كاش', 'vodafone', 'فودافون'],
    ar: 'فودافون كاش',
    en: 'Vodafone Cash',
    gradient: 'from-[#e60000] to-[#b30000]',
    textColor: 'text-white',
    shortName: 'VF',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
        <path d="M14.5 6.5C11.5 6.5 9 9 9 12C9 13.5 9.6 15 10.6 16C9 17.5 7.5 20 7 21C9.5 20.5 12 19 13.5 17.4C14 17.5 14.5 17.5 15 17.5C18 17.5 20.5 15 20.5 12C20.5 9 18 6.5 15 6.5 Z" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <text x="12" y="13" fontFamily="sans-serif" fontSize="7" fontWeight="900" fill="white" textAnchor="middle" dominantBaseline="middle">orange</text>
      </svg>
    )
  },
  {
    key: 'etisalat_cash',
    matchKeywords: ['etisalat cash', 'اتصالات كاش', 'etisalat', 'etislate', 'اتصالات'],
    ar: 'اتصالات كاش',
    en: 'Etisalat Cash',
    gradient: 'from-[#1c1c1c] to-[#2d2d2d]',
    textColor: 'text-white',
    shortName: 'e&',
    customIcon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 .6-.4 1-1 1h-11c.4 2.8 2.8 5 5.9 5 2.1 0 4-1 5.1-2.6.4-.5 1-.5 1.4-.1l1.6 1.6c.3.3.3.8 0 1.1C17.3 20.2 14.1 22 10.5 22 6.1 22 4 18.4 4 12zm12.9-1.8c-.4-2.6-2.6-4.2-5.4-4.2-2.9 0-5.1 1.7-5.4 4.2h10.8z" fill="#7fba00" />
        <circle cx="19.5" cy="12.5" r="2.5" fill="#7fba00" />
        <rect x="18.5" y="16" width="2" height="6" fill="#7fba00" />
      </svg>
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
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M6 13c0-3 1.8-5 4.3-5 1.5 0 2.5.8 3 1.8.5-1 1.5-1.8 3-1.8 2 0 3.5 1.5 3.5 3.8 0 3-2.5 5-5.5 5-2.5 0-4-1.3-4.5-2.3-.5 1-1.8 2.3-3.5 2.3-1.5 0-2.8-1.3-2.8-3 0-2 1.8-3 3.8-2.5l-.2 1c-1 .2-2 .3-2 .8 0 .5.3.8.8.8 1.3 0 2.5-1.3 3.3-2.8l.8-2.5c-.3-.3-.8-.5-1.3-.5-1.5 0-2.5 1.5-2.5 3.5z" fill="white" />
      </svg>
    )
  }
];

function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
    .trim();
}

export function getTranslatedBankName(name: string, lang: 'ar' | 'en'): string {
  if (!name) return '';
  const normalizedName = normalizeArabicText(name);
  
  // Find match in catalog
  const found = BANK_WALLET_CATALOG.find(item => 
    item.matchKeywords.some(keyword => normalizedName.includes(normalizeArabicText(keyword)))
  );
  if (found) {
    return lang === 'ar' ? found.ar : found.en;
  }
  
  // Custom case: Cash
  const nameLower = name.toLowerCase();
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
  const [imgError, setImgError] = React.useState(false);
  const nameLower = (name || '').toLowerCase();
  const normalizedName = normalizeArabicText(name);
  
  // Find in catalog
  const matchedInfo = BANK_WALLET_CATALOG.find(item => 
    item.matchKeywords.some(keyword => normalizedName.includes(normalizeArabicText(keyword)))
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
      customIcon: <Wallet className="w-full h-full text-white" />,
    };
  }

  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-[10px]',
    md: 'w-10 h-10 rounded-xl text-xs',
    lg: 'w-12 h-12 rounded-2xl text-sm',
  };

  // Icon inner wrapper size mapping
  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  let logoSrc = '';
  if (matchedInfo && !imgError) {
    const isWalletKey = ['vodafone_cash', 'orange_cash', 'etisalat_cash', 'wepay'].includes(matchedInfo.key);
    const folder = isWalletKey ? 'wallets' : 'banks';
    const isSvg = ['suez', 'hsbc', 'attijari', 'baraka'].includes(matchedInfo.key);
    const ext = isSvg ? 'svg' : 'png';
    logoSrc = `/assets/logos/${folder}/${matchedInfo.key}.${ext}`;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-black select-none shrink-0 border border-white/10 shadow-lg overflow-hidden bg-[#242444]',
        !logoSrc && brand.gradient,
        !logoSrc && brand.textColor,
        sizeClasses[size],
        className
      )}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
        />
      ) : brand.customIcon ? (
        <div className={cn('flex items-center justify-center shrink-0', iconSizeClasses[size])}>
          {brand.customIcon}
        </div>
      ) : (
        <span className="font-extrabold">{brand.shortName}</span>
      )}
    </div>
  );
}
