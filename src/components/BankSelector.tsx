import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import BankLogo from './BankLogo';
import { useLanguage } from '@/contexts/LanguageContext';

export interface BankAccountItem {
  id: string;
  nameAr: string;
  nameEn: string;
  logo: string;
  color: string;
}

export const egyptianBanks: BankAccountItem[] = [
  { id: "nbe", nameAr: "البنك الأهلي المصري", nameEn: "National Bank of Egypt (NBE)", logo: "/assets/logos/banks/nbe.svg", color: "#064e3b" },
  { id: "misr", nameAr: "بنك مصر", nameEn: "Banque Misr", logo: "/assets/logos/banks/misr.svg", color: "#781c1c" },
  { id: "caire", nameAr: "بنك القاهرة", nameEn: "Banque du Caire", logo: "/assets/logos/banks/caire.svg", color: "#c2410c" },
  { id: "ealb", nameAr: "البنك العقاري المصري العربي", nameEn: "Egyptian Arab Land Bank", logo: "/assets/logos/banks/ealb.svg", color: "#1e3a8a" },
  { id: "cib", nameAr: "البنك التجاري الدولي", nameEn: "Commercial International Bank (CIB)", logo: "/assets/logos/banks/cib.svg", color: "#0284c7" },
  { id: "qnb", nameAr: "بنك QNB", nameEn: "QNB", logo: "/assets/logos/banks/qnb.svg", color: "#4c1d95" },
  { id: "aaib", nameAr: "البنك العربي الأفريقي الدولي", nameEn: "Arab African International Bank (AAIB)", logo: "/assets/logos/banks/aaib.svg", color: "#0f172a" },
  { id: "alex", nameAr: "بنك الإسكندرية", nameEn: "Bank of Alexandria", logo: "/assets/logos/banks/alex.svg", color: "#0369a1" },
  { id: "adib", nameAr: "مصرف أبوظبي الإسلامي", nameEn: "Abu Dhabi Islamic Bank (ADIB)", logo: "/assets/logos/banks/adib.svg", color: "#1e40af" },
  { id: "faisal", nameAr: "بنك فيصل الإسلامي المصري", nameEn: "Faisal Islamic Bank of Egypt", logo: "/assets/logos/banks/faisal.svg", color: "#15803d" },
  { id: "baraka", nameAr: "بنك البركة مصر", nameEn: "Al Baraka Bank Egypt", logo: "/assets/logos/banks/baraka.svg", color: "#166534" },
  { id: "hdb", nameAr: "بنك التعمير والإسكان", nameEn: "Housing & Development Bank (HDB)", logo: "/assets/logos/banks/hdb.svg", color: "#0369a1" },
  { id: "egbank", nameAr: "البنك المصري الخليجى", nameEn: "EG Bank", logo: "/assets/logos/banks/egbank.svg", color: "#111827" },
  { id: "suez", nameAr: "بنك قناة السويس", nameEn: "Suez Canal Bank", logo: "/assets/logos/banks/suez.svg", color: "#0f766e" },
  { id: "saib", nameAr: "بنك الشركة المصرفية العربية الدولية", nameEn: "SAIB Bank", logo: "/assets/logos/banks/saib.svg", color: "#b45309" },
  { id: "ub", nameAr: "المصرف المتحد", nameEn: "The United Bank", logo: "/assets/logos/banks/ub.svg", color: "#1d4ed8" },
  { id: "next", nameAr: "بنك نكست", nameEn: "Bank Next", logo: "/assets/logos/banks/next.svg", color: "#2563eb" },
  { id: "enbd", nameAr: "بنك الإمارات دبي الوطني", nameEn: "Emirates NBD Egypt", logo: "/assets/logos/banks/enbd.svg", color: "#1e3a8a" },
  { id: "fab", nameAr: "بنك أبوظبي الأول", nameEn: "FAB Egypt", logo: "/assets/logos/banks/fab.svg", color: "#1e40af" },
  { id: "hsbc", nameAr: "إتش إس بي سي مصر", nameEn: "HSBC Egypt", logo: "/assets/logos/banks/hsbc.svg", color: "#dc2626" },
  { id: "attijari", nameAr: "التجاري وفا بنك", nameEn: "Attijariwafa Bank", logo: "/assets/logos/banks/attijari.svg", color: "#854d0e" },
  { id: "ca-egypt", nameAr: "كريدي أجريكول مصر", nameEn: "Crédit Agricole Egypt", logo: "/assets/logos/banks/ca.svg", color: "#047857" },
  { id: "citi", nameAr: "سيتي بنك", nameEn: "Citibank", logo: "/assets/logos/banks/citi.svg", color: "#0284c7" },
  { id: "arab-bank", nameAr: "البنك العربي", nameEn: "Arab Bank", logo: "/assets/logos/banks/arab.svg", color: "#1e3a8a" }
];

export const mobileWallets: BankAccountItem[] = [
  { id: "vodafone_cash", nameAr: "فودافون كاش", nameEn: "Vodafone Cash", logo: "/assets/logos/wallets/vodafone.svg", color: "#e60000" },
  { id: "orange_cash", nameAr: "أورانج كاش", nameEn: "Orange Cash", logo: "/assets/logos/wallets/orange.svg", color: "#ff6600" },
  { id: "etisalat_cash", nameAr: "اتصالات كاش", nameEn: "Etisalat Cash", logo: "/assets/logos/wallets/etisalat.svg", color: "#1c1c1c" },
  { id: "wepay", nameAr: "وي باي (WE Pay)", nameEn: "WE Pay", logo: "/assets/logos/wallets/we.svg", color: "#501a96" }
];

interface BankSelectorProps {
  selectedName: string;
  onSelect: (name: string) => void;
  type?: 'bank' | 'wallet' | 'all';
}

export default function BankSelector({ selectedName, onSelect, type = 'all' }: BankSelectorProps) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  let items: BankAccountItem[] = [];
  if (type === 'bank') {
    items = egyptianBanks;
  } else if (type === 'wallet') {
    items = mobileWallets;
  } else {
    items = [...egyptianBanks, ...mobileWallets];
  }

  // Filter based on search query (matches both Arabic and English names/keywords)
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.nameAr.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Search Input with magnifying glass icon */}
      <div className="relative">
        <input
          type="text"
          placeholder={lang === 'ar' ? 'ابحث باسم البنك أو المحفظة...' : 'Search bank or wallet name...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-11 bg-[#242444] border border-[#2d2d5e] focus:border-sky-500 focus:ring-sky-500/20 text-white rounded-xl pr-10 pl-4 outline-none text-xs font-semibold placeholder:text-slate-500 transition-all text-right"
        />
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      </div>

      {/* Grid of Bank/Wallet Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 font-bold">
          {lang === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'No results matching your search'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredItems.map(item => {
            // Check if active
            const isSelected = selectedName === item.nameAr || selectedName === item.nameEn;
            const isHovered = hoveredId === item.id;
            
            // Dynamic style object for custom brand colors
            const activeColor = item.color;
            const cardStyle = {
              borderColor: isSelected ? activeColor : isHovered ? `${activeColor}50` : 'rgba(255, 255, 255, 0.05)',
              boxShadow: isSelected ? `0 0 10px ${activeColor}15` : undefined,
            };

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.nameAr)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={cardStyle}
                className={`relative p-2.5 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-center gap-2.5 active:scale-95 group overflow-hidden ${
                  isSelected
                    ? 'bg-white/[0.04]'
                    : 'bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                {/* Brand Logo Component */}
                <BankLogo name={item.nameAr} size="sm" className="shrink-0 transition-transform group-hover:scale-105" />

                {/* Primary & Secondary Titles */}
                <div className="min-w-0 text-right flex-1">
                  <h5 className="text-[11px] font-bold text-white break-words whitespace-normal leading-tight">
                    {lang === 'ar' ? item.nameAr : item.nameEn}
                  </h5>
                  <span className="text-[9px] font-semibold text-slate-500 block break-words whitespace-normal leading-normal mt-1">
                    {lang === 'ar' ? item.nameEn : item.nameAr}
                  </span>
                </div>

                {/* Active checkmark badge with dynamic brand color background */}
                {isSelected && (
                  <div 
                    style={{ backgroundColor: activeColor }}
                    className="absolute top-1 left-1 w-4 h-4 rounded-full text-white flex items-center justify-center animate-scale-in"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
