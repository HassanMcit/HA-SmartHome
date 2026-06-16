'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { transactionsApi, adminApi, accountsApi, Account, Transaction, User, formatCurrency, getCategoryInfo, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2, Users, Loader2, Activity, Calendar, Tag, AlertCircle, Pencil, ArrowLeftRight, Mic, MicOff, Sparkles } from 'lucide-react';
import BankLogo, { getTranslatedBankName } from '@/components/BankLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EGYPTIAN_DENOMINATIONS_LIST = [
  { value: '200', ar: '٢٠٠ جنيه', en: '200 EGP' },
  { value: '100', ar: '١٠٠ جنيه', en: '100 EGP' },
  { value: '50', ar: '٥٠ جنيه', en: '50 EGP' },
  { value: '20', ar: '٢٠ جنيه', en: '20 EGP' },
  { value: '10', ar: '١٠ جنيه', en: '10 EGP' },
  { value: '5', ar: '٥ جنيه', en: '5 EGP' },
  { value: '1', ar: '١ جنيه', en: '1 EGP' },
  { value: '0.5', ar: '٠.٥ جنيه', en: '0.5 EGP' },
];



export default function TransactionsPage() {
  const { user: currentUser } = useAuth();
  const { lang } = useLanguage();
  const isAdmin = currentUser?.role === 'admin';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [denominations, setDenominations] = useState<Record<string, number>>({
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '1': 0,
    '0.5': 0,
  });

  const selectedAccount = accounts.find(a => a.id === accountId);
  const isCashAccount = selectedAccount?.type === 'cash';

  const getDenominationsTotal = useCallback(() => {
    return Object.entries(denominations).reduce((acc, [denom, count]) => {
      return acc + (parseFloat(denom) * (count || 0));
    }, 0);
  }, [denominations]);

  // Change calculator states
  const [useChangeCalculator, setUseChangeCalculator] = useState(false);
  const [paidDenominations, setPaidDenominations] = useState<Record<string, number>>({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
  });
  const [receivedDenominations, setReceivedDenominations] = useState<Record<string, number>>({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
  });

  const getChangeCalculatorTotal = useCallback(() => {
    const paidTotal = Object.entries(paidDenominations).reduce((acc, [denom, count]) => {
      return acc + (parseFloat(denom) * (count || 0));
    }, 0);
    const receivedTotal = Object.entries(receivedDenominations).reduce((acc, [denom, count]) => {
      return acc + (parseFloat(denom) * (count || 0));
    }, 0);
    return type === 'expense' ? (paidTotal - receivedTotal) : (receivedTotal - paidTotal);
  }, [paidDenominations, receivedDenominations, type]);

  const getChangeCalculatorDenominations = useCallback(() => {
    const result: Record<string, number> = {};
    const denoms = ['200', '100', '50', '20', '10', '5', '1', '0.5'];
    for (const denom of denoms) {
      const p = paidDenominations[denom] || 0;
      const r = receivedDenominations[denom] || 0;
      const net = type === 'expense' ? (p - r) : (r - p);
      if (net !== 0) {
        result[denom] = net;
      }
    }
    return result;
  }, [paidDenominations, receivedDenominations, type]);

  // Sync cash denominations total to transaction amount input automatically
  useEffect(() => {
    if (isCashAccount) {
      if (useChangeCalculator) {
        const total = getChangeCalculatorTotal();
        setAmount(total > 0 ? total.toString() : '');
      } else {
        const total = getDenominationsTotal();
        setAmount(total > 0 ? total.toString() : '');
      }
    }
  }, [denominations, paidDenominations, receivedDenominations, useChangeCalculator, isCashAccount, getDenominationsTotal, getChangeCalculatorTotal]);
  
  // Transfer form state
  const [transferOpen, setTransferOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  // Transfer denominations states
  const [transferFromDenominations, setTransferFromDenominations] = useState<Record<string, number>>({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
  });
  const [transferToDenominations, setTransferToDenominations] = useState<Record<string, number>>({
    '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
  });

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);
  const isFromCash = fromAccount?.type === 'cash';
  const isToCash = toAccount?.type === 'cash';

  const getTransferFromDenominationsTotal = useCallback(() => {
    return Object.entries(transferFromDenominations).reduce((acc, [denom, count]) => {
      return acc + (parseFloat(denom) * (count || 0));
    }, 0);
  }, [transferFromDenominations]);

  const getTransferToDenominationsTotal = useCallback(() => {
    return Object.entries(transferToDenominations).reduce((acc, [denom, count]) => {
      return acc + (parseFloat(denom) * (count || 0));
    }, 0);
  }, [transferToDenominations]);
  
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; transactionId: string; description: string }>({
    isOpen: false,
    transactionId: '',
    description: '',
  });

  // Edit states
  const [editOpen, setEditOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAccountId, setEditAccountId] = useState<string>('');
  const [editDate, setEditDate] = useState('');
  const [editTargetUserId, setEditTargetUserId] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsing, setVoiceParsing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ─── Voice input parser ──────────────────────────────────────────────────────
  const parseVoiceInput = useCallback((text: string) => {
    if (!text.trim()) return;
    setVoiceParsing(true);
    const lower = text.toLowerCase().trim();

    // ── 1. Detect type: income or expense ────────────────────────────────────
    // ايداع / استلمت / حصلت = income
    // سحب / دفعت / صرفت = expense
    const incomeKeywords = [
      'ايداع', 'إيداع', 'ودعت', 'ودعنا', 'استلمت', 'استلم', 'أخذت', 'اخذت',
      'حصلت', 'دخل', 'راتب', 'مرتب', 'إيراد', 'ايراد', 'مكافأة', 'هدية',
      'ربحت', 'كسبت', 'تحويل وارد', 'received', 'income', 'deposit', 'salary',
      'earned', 'bonus', 'got paid',
    ];
    const expenseKeywords = [
      'سحب', 'سحبت', 'دفعت', 'صرفت', 'اشتريت', 'خلصت', 'بعتلهم',
      'مصروف', 'مصاريف', 'خرج', 'راح', 'تحويل صادر',
      'spent', 'paid', 'bought', 'purchased', 'expense', 'withdrawal',
    ];

    let detectedType: 'income' | 'expense' = 'expense'; // default expense
    // check income first (more specific)
    if (incomeKeywords.some(k => lower.includes(k))) detectedType = 'income';
    else if (expenseKeywords.some(k => lower.includes(k))) detectedType = 'expense';

    // ── 2. Extract amount ────────────────────────────────────────────────────
    // Strategy: try western digits first, then eastern Arabic digits, then word numbers
    let detectedAmount = '';

    // a) Western digits with optional multiplier: "100 الف" = 100000, "5 مية" = 500
    const westernMatch = lower.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(الف|ألف|آلاف|الاف|مية|مئة|مليون)?\b/);
    if (westernMatch) {
      let num = parseFloat(westernMatch[1].replace(/,/g, ''));
      const multiplier = westernMatch[2] || '';
      if (multiplier.match(/الف|ألف|آلاف|الاف/)) num *= 1000;
      else if (multiplier.match(/مية|مئة/)) num *= 100;
      else if (multiplier.match(/مليون/)) num *= 1000000;
      detectedAmount = Number.isInteger(num) ? String(num) : num.toFixed(2);
    }

    // b) Eastern Arabic digits: ١٠٠٠
    if (!detectedAmount) {
      const easternMatch = lower.match(/[٠-٩]+(?:[٫.][٠-٩]+)?/);
      if (easternMatch) {
        detectedAmount = easternMatch[0]
          .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
          .replace('٫', '.');
      }
    }

    // c) Arabic word-form numbers (ordered from largest to smallest to avoid partial matches)
    if (!detectedAmount) {
      // Multi-word patterns first (order matters!)
      const wordPatterns: [RegExp, number][] = [
        [/مية الف|مئة الف|مئة ألف/, 100000],
        [/خمسين الف|خمسين ألف/, 50000],
        [/عشرين الف|عشرين ألف/, 20000],
        [/خمستاشر الف|خمستعشر الف|خمسة عشر الف/, 15000],
        [/عشر(ة)? (آلاف|الاف|ألف)/, 10000],
        [/خمس(ة)? آلاف|خمس(ة)? الاف/, 5000],
        [/ألفين|الفين|الفان/, 2000],
        [/الف|ألف/, 1000],
        [/تسعمية|تسعمائة/, 900],
        [/تمانمية|ثمانمائة/, 800],
        [/سبعمية|سبعمائة/, 700],
        [/ستمية|ستمائة/, 600],
        [/خمسمية|خمسمائة/, 500],
        [/اربعمية|أربعمائة/, 400],
        [/تلاتمية|ثلاثمائة/, 300],
        [/مئتين|ميتين|مئتان/, 200],
        [/مية|ميه|مئة|مائة/, 100],
        [/تسعين/, 90],
        [/تمانين|ثمانين/, 80],
        [/سبعين/, 70],
        [/ستين/, 60],
        [/خمسين/, 50],
        [/اربعين|أربعين/, 40],
        [/تلاتين|ثلاثين/, 30],
        [/عشرين/, 20],
        [/تسعة عشر|تسعتعشر/, 19],
        [/تمنتاشر|ثمانية عشر/, 18],
        [/سبعتاشر|سبعة عشر/, 17],
        [/ستاشر|ستة عشر/, 16],
        [/خمستاشر|خمسة عشر/, 15],
        [/اربعتاشر|أربعة عشر/, 14],
        [/تلتاشر|ثلاثة عشر/, 13],
        [/اتناشر|اثنا عشر/, 12],
        [/حداشر|أحد عشر/, 11],
        [/عشرة|عشره/, 10],
        [/تسعة|تسعه/, 9],
        [/تمانية|ثمانية/, 8],
        [/سبعة|سبعه/, 7],
        [/ستة|سته/, 6],
        [/خمسة|خمسه/, 5],
        [/اربعة|أربعة/, 4],
        [/تلاتة|ثلاثة/, 3],
        [/اتنين|اثنين/, 2],
        [/واحد/, 1],
      ];
      for (const [pattern, val] of wordPatterns) {
        if (pattern.test(lower)) {
          detectedAmount = String(val);
          break;
        }
      }
    }

    // ── 3. Detect account from loaded accounts list ──────────────────────────
    // Match by name or alias, case-insensitive, partial match
    let detectedAccountId = '';
    if (accounts.length > 0) {
      // Dynamic matching: vodafone cash, cib, nbe, banque misr, instapay, etc.
      const bankAliasMap: Array<[string, string[]]> = [
        ['vodafone', ['فودافون', 'vodafone', 'vf cash', 'فودافون كاش', 'فودا فون']],
        ['orange', ['اورنج', 'orange', 'اورانج']],
        ['etisalat', ['اتصالات', 'etisalat', 'we', 'وي']],
        ['instapay', ['انستاباي', 'instapay', 'انستا باي']],
        ['cib', ['سيب', 'cib', 'سي اي بي', 'التجاري الدولي']],
        ['nbe', ['الاهلي', 'nbe', 'بنك الاهلي', 'البنك الأهلي', 'الاهلى']],
        ['banque_misr', ['بنك مصر', 'banque misr', 'ميسر']],
        ['hdb', ['التعمير', 'الاسكان', 'التعمير والاسكان', 'hdb', 'housing development']],
        ['alexbank', ['الاسكندرية', 'alex bank', 'بنك الاسكندرية', 'اسكندرية']],
        ['qnb', ['قطر', 'qnb', 'بنك قطر', 'القطري']],
        ['hsbc', ['hsbc', 'اتش اس بي سي']],
        ['fawry', ['فوري', 'fawry']],
        ['wepay', ['وي باي', 'wepay']],
        ['aaib', ['العربي الافريقي', 'aaib', 'العربي']],
        ['saib', ['سايب', 'saib', 'الصناعي']],
        ['mibank', ['ميدميد', 'mibank', 'ميدل']],
        ['cash', ['كاش', 'نقدي', 'نقود', 'فلوس', 'cash']],
      ];

      for (const acc of accounts) {
        const accLower = (acc.name + ' ' + (acc.alias || '')).toLowerCase();
        // Direct partial match
        if (lower.includes(accLower.trim()) || accLower.includes(lower.trim())) {
          detectedAccountId = acc.id;
          break;
        }
        // Keyword match
        for (const [key, kws] of bankAliasMap) {
          const nameMatches = accLower.includes(key) || kws.some(k => accLower.includes(k));
          const speechMatches = kws.some(k => lower.includes(k));
          if (nameMatches && speechMatches) {
            detectedAccountId = acc.id;
            break;
          }
        }
        if (detectedAccountId) break;
      }
    }

    // ── 4. Detect category ───────────────────────────────────────────────────
    const categoryMap: Array<{ value: string; type: 'both' | 'income' | 'expense'; keywords: string[] }> = [
      // Income categories
      { value: 'installments', type: 'expense', keywords: ['قسط', 'أقساط', 'اقساط', 'installment', 'installments'] },
      { value: 'salary', type: 'income', keywords: ['راتب', 'مرتب', 'salary', 'paycheck'] },
      { value: 'bonus', type: 'income', keywords: ['مكافأة', 'bonus', 'عيدية', 'حافز'] },
      { value: 'gift', type: 'income', keywords: ['هدية', 'gift'] },
      { value: 'freelance', type: 'income', keywords: ['شغل حر', 'freelance', 'مشروع'] },
      { value: 'rental', type: 'income', keywords: ['ايجار وارد', 'rent income'] },
      // Expense categories
      { value: 'food', type: 'expense', keywords: ['اكل', 'طعام', 'فطار', 'فطور', 'غداء', 'غذاء', 'عشاء', 'مطعم', 'كافيه', 'كافيهات', 'مكدونالدز', 'بيتزا', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'restaurant'] },
      { value: 'transport', type: 'expense', keywords: ['مواصلات', 'عربية', 'بنزين', 'تاكسي', 'اوبر', 'كريم', 'uber', 'careem', 'transport', 'metro', 'مترو', 'اتوبيس'] },
      { value: 'shopping', type: 'expense', keywords: ['تسوق', 'اشتريت', 'شراء', 'ملابس', 'هدوم', 'shopping', 'clothes', 'mall'] },
      { value: 'health', type: 'expense', keywords: ['دكتور', 'دواء', 'صيدلية', 'مستشفى', 'علاج', 'طب', 'doctor', 'medicine', 'hospital', 'pharmacy'] },
      { value: 'education', type: 'expense', keywords: ['تعليم', 'كتب', 'دروس', 'مدرسة', 'جامعة', 'school', 'education', 'books'] },
      { value: 'utilities', type: 'expense', keywords: ['كهرباء', 'مياه', 'غاز', 'فاتورة كهرباء', 'electricity', 'water', 'utilities'] },
      { value: 'internet_bill', type: 'expense', keywords: ['نت', 'انترنت', 'internet', 'wifi'] },
      { value: 'phone_recharge', type: 'expense', keywords: ['شحن', 'شحن موبايل', 'رصيد', 'موبايل', 'تليفون', 'recharge', 'mobile credit'] },
      { value: 'entertainment', type: 'expense', keywords: ['ترفيه', 'سينما', 'لعبة', 'netflix', 'entertainment', 'cinema', 'game'] },
      { value: 'housing', type: 'expense', keywords: ['ايجار', 'إيجار', 'شقة', 'rent', 'housing'] },
      { value: 'subscriptions', type: 'expense', keywords: ['اشتراك', 'subscription'] },
      { value: 'allowance', type: 'expense', keywords: ['مصروف يومي', 'بدل'] },
      { value: 'money_pool', type: 'expense', keywords: ['جمعية', 'جميعة', 'money pool'] },
      { value: 'charity', type: 'expense', keywords: ['صدقة', 'تبرع', 'charity', 'donation'] },
      { value: 'savings', type: 'expense', keywords: ['توفير', 'ادخار', 'savings'] },
      { value: 'personal', type: 'expense', keywords: ['شخصي', 'personal'] },
      { value: 'gas_cylinder', type: 'expense', keywords: ['انبوبة', 'بوتاجاز', 'gas cylinder'] },
      { value: 'house_wife_allowance', type: 'expense', keywords: ['مصروف البيت', 'مصروف الست', 'بيت'] },
      { value: 'bank_fees', type: 'expense', keywords: ['عمولة', 'رسوم بنك', 'bank fee'] },
    ];

    let detectedCategory = '';
    for (const { value, type: catType, keywords } of categoryMap) {
      if (keywords.some(k => lower.includes(k))) {
        if (catType === 'both') { detectedCategory = value; break; }
        if (catType === detectedType) { detectedCategory = value; break; }
      }
    }
    if (!detectedCategory) detectedCategory = 'other';

    // ── 5. Use the raw text as description ───────────────────────────────────
    const detectedDesc = text.trim();

    // ── 6. Apply everything to form ──────────────────────────────────────────
    setType(detectedType);
    setCategory(detectedCategory);
    if (detectedAmount) setAmount(detectedAmount);
    setDescription(detectedDesc);
    if (detectedAccountId) setAccountId(detectedAccountId);

    setVoiceParsing(false);

    // Build summary toast
    const catLabel = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.value === detectedCategory)?.label || detectedCategory;
    const accName = accounts.find(a => a.id === detectedAccountId)?.name || '';
    const parts = [
      detectedType === 'expense' ? '🔴 مصروف' : '🟢 إيراد',
      detectedAmount ? `💰 ${detectedAmount} ج.م` : '💰 ؟',
      `📂 ${catLabel}`,
      accName ? `🏦 ${accName}` : '',
    ].filter(Boolean).join('  ');

    toast.success(parts, { duration: 5000 });
  }, [lang, accounts]);

  // ─── Start / Stop voice listening ────────────────────────────────────────────
  // We keep the transcript accumulating so when user presses stop manually
  // we parse whatever was captured.
  const finalTranscriptRef = useRef('');

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(lang === 'ar' ? '❌ المتصفح لا يدعم التعرف على الصوت — استخدم Chrome أو Edge' : '❌ Voice not supported — use Chrome or Edge');
      return;
    }
    finalTranscriptRef.current = '';
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // keep listening until user presses stop

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
    };
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) finalTranscriptRef.current += final;
      setVoiceTranscript((finalTranscriptRef.current + interim).trim());
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(lang === 'ar' ? `❌ خطأ في الصوت: ${event.error}` : `❌ Voice error: ${event.error}`);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      // Auto-parse whatever we captured when recognition ends naturally
      const captured = finalTranscriptRef.current.trim();
      if (captured) parseVoiceInput(captured);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, parseVoiceInput]);

  const stopListening = useCallback(() => {
    // Stop recognition — onend will fire and parse automatically
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setEditType(tx.type);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
    setEditDescription(tx.description || '');
    setEditDate(new Date(tx.date).toISOString().split('T')[0]);
    setEditTargetUserId(tx.userId);
    setEditAccountId(tx.accountId || '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTxId || !editAmount || !editCategory) {
      toast.error('المبلغ والفئة مطلوبان');
      return;
    }
    setEditSubmitting(true);
    try {
      await transactionsApi.update(editingTxId, {
        type: editType,
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription,
        date: editDate,
        targetUserId: editTargetUserId,
        accountId: editAccountId && editAccountId !== 'none' ? editAccountId : undefined,
      });
      toast.success('تم تحديث المعاملة بنجاح');
      setEditOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const apiUserId = (selectedUserId === 'all' || !selectedUserId) ? undefined : selectedUserId;
      const data = await transactionsApi.getAll({ userId: apiUserId });
      setTransactions(data || []);
    } catch {
      toast.error('حدث خطأ في تحميل المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      const sortedAccs = (data || []).sort((a: any, b: any) => {
        const typeOrder = { cash: 1, bank: 2, wallet: 3 };
        const orderA = typeOrder[a.type as keyof typeof typeOrder] || 99;
        const orderB = typeOrder[b.type as keyof typeof typeOrder] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '', 'ar');
      });
      setAccounts(sortedAccs);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchAccounts();
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    if (selectedUserId) {
      fetchTransactions();
    }
  }, [selectedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast.error('المبلغ والفئة مطلوبان');
      return;
    }

    const parsedAmount = parseFloat(amount);

    if (isCashAccount) {
      const denomTotal = useChangeCalculator ? getChangeCalculatorTotal() : getDenominationsTotal();
      if (Math.abs(denomTotal - parsedAmount) > 0.01) {
        toast.error(
          lang === 'ar'
            ? `⚠️ مجموع فئات العملة (${denomTotal} ج.م) يجب أن يساوي قيمة المعاملة (${parsedAmount} ج.م)`
            : `⚠️ Denominations total (${denomTotal} EGP) must equal the transaction amount (${parsedAmount} EGP)`
        );
        return;
      }
    }
    
    const selectedUser = users.find(u => u.id === targetUserId);
    console.log(`[Transaction Form] Attempting to save for: ${selectedUser?.name} (ID: ${targetUserId})`);

    setSubmitting(true);
    try {
      await transactionsApi.create({ 
        type, 
        amount: parsedAmount, 
        category, 
        description, 
        date,
        targetUserId: targetUserId,
        accountId: accountId && accountId !== 'none' ? accountId : undefined,
        denominations: isCashAccount 
          ? (useChangeCalculator ? getChangeCalculatorDenominations() : denominations) 
          : undefined,
      });
      
      toast.success(`تم إضافة معاملة ${selectedUser?.name || ''} بنجاح`);
      setOpen(false);
      setAmount('');
      setDescription('');
      setCategory('');
      setAccountId('');
      setDate(new Date().toISOString().split('T')[0]);
      setUseChangeCalculator(false);
      setDenominations({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
      });
      setPaidDenominations({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
      });
      setReceivedDenominations({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
      });
      fetchTransactions();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الإضافة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !transferAmount) {
      toast.error(lang === 'ar' ? 'يرجى تحديد الحسابات والمبلغ' : 'Please select accounts and amount');
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error(lang === 'ar' ? 'لا يمكن التحويل لنفس الحساب المالي' : 'Cannot transfer to the same account');
      return;
    }
    
    const parsedAmount = parseFloat(transferAmount);
    
    if (isFromCash) {
      const fromTotal = getTransferFromDenominationsTotal();
      if (Math.abs(fromTotal - parsedAmount) > 0.01) {
        toast.error(
          lang === 'ar'
            ? `⚠️ فئات الكاش الصادر (${fromTotal} ج.م) يجب أن تساوي مبلغ التحويل (${parsedAmount} ج.م)`
            : `⚠️ Outgoing cash denoms total (${fromTotal} EGP) must equal the transfer amount (${parsedAmount} EGP)`
        );
        return;
      }
    }

    if (isToCash) {
      const toTotal = getTransferToDenominationsTotal();
      if (Math.abs(toTotal - parsedAmount) > 0.01) {
        toast.error(
          lang === 'ar'
            ? `⚠️ فئات الكاش الوارد (${toTotal} ج.م) يجب أن تساوي مبلغ التحويل (${parsedAmount} ج.م)`
            : `⚠️ Incoming cash denoms total (${toTotal} EGP) must equal the transfer amount (${parsedAmount} EGP)`
        );
        return;
      }
    }

    setTransferSubmitting(true);
    try {
      await transactionsApi.transfer({
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        description: transferDesc,
        date: transferDate,
        fromDenominations: isFromCash ? transferFromDenominations : undefined,
        toDenominations: isToCash ? transferToDenominations : undefined,
      });
      toast.success(lang === 'ar' ? 'تمت عملية التحويل المالي بنجاح! 💸' : 'Transfer completed successfully! 💸');
      setTransferOpen(false);
      setFromAccountId('');
      setToAccountId('');
      setTransferAmount('');
      setTransferDesc('');
      setTransferDate(new Date().toISOString().split('T')[0]);
      setTransferFromDenominations({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
      });
      setTransferToDenominations({
        '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '1': 0, '0.5': 0
      });
      fetchTransactions();
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء إجراء التحويل' : 'Error performing transfer'));
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.transactionId) return;
    try {
      await transactionsApi.delete(deleteDialog.transactionId);
      toast.success('تم حذف المعاملة بنجاح');
      setDeleteDialog({ isOpen: false, transactionId: '', description: '' });
      fetchTransactions();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  if (!currentUser) return null;

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-400" />
              {lang === 'ar' ? 'المعاملات المالية' : 'Financial Transactions'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">{lang === 'ar' ? 'سجل وراقب كافة تحركاتك المالية' : 'Record and monitor all your financial activities'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Transfer Dialog */}
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger 
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <ArrowLeftRight className="w-5 h-5 ml-2" />
                {lang === 'ar' ? 'تحويل مالي' : 'Transfer'}
              </DialogTrigger>
              <DialogContent className="rounded-[24px] sm:rounded-[32px] p-0 outline-none sm:max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
                <DialogHeader className="text-right p-5 sm:p-8 pb-0">
                  <DialogTitle className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>{lang === 'ar' ? 'تحويل مالي بين الحسابات' : 'Transfer Between Accounts'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTransferSubmit} className="space-y-6 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-5 sm:pb-8 pt-2">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'من الحساب' : 'From Account'}</label>
                    <Select value={fromAccountId} onValueChange={(val) => setFromAccountId(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المصدر' : 'Select source account'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                              <span>
                                {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'إلى الحساب' : 'To Account'}</label>
                    <Select value={toAccountId} onValueChange={(val) => setToAccountId(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المستهدف' : 'Select target account'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                              <span>
                                {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          value={transferAmount} 
                          onChange={e => setTransferAmount(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-14 pr-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-right"
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs bg-white/10 px-2 py-0.5 rounded-lg pointer-events-none">ج.م</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                      <div className="relative group cursor-pointer" onClick={(e) => {
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker?.();
                      }}>
                        <input 
                          type="date" 
                          value={transferDate} 
                          onChange={e => setTransferDate(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                          dir="ltr"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الوصف / ملاحظات' : 'Description / Notes'}</label>
                    <input 
                      type="text" 
                      value={transferDesc} 
                      onChange={e => setTransferDesc(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                      placeholder={lang === 'ar' ? 'مثال: تحويل مصروف، سداد حصة...' : 'e.g. Allowance, split pay...'}
                    />
                  </div>

                  {/* Outgoing cash denominations */}
                  {isFromCash && (
                    <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 animate-fade-in text-right">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-slate-400">
                          {lang === 'ar' ? '💵 فئات الكاش الصادر (من الكاش)' : '💵 Outgoing Cash Denominations (from Cash)'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {lang === 'ar' ? 'حدد الأوراق الصادرة (إجباري)' : 'Specify outgoing counts (required)'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {EGYPTIAN_DENOMINATIONS_LIST.map(({ value: denom, ar, en }) => {
                          const count = transferFromDenominations[denom] || 0;
                          const subtotal = count * parseFloat(denom);
                          return (
                            <div key={denom} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-16 h-10 rounded-xl border border-white/10 relative overflow-hidden shadow bg-slate-900/10">
                                  <img
                                    src={`/banknotes/egp_${denom}.png`}
                                    alt={`${denom} EGP`}
                                    className="w-full h-full object-cover rounded-xl"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-[10px] font-bold text-[var(--foreground)] truncate">{lang === 'ar' ? ar : en}</span>
                                  <span className="text-[10px] font-black text-emerald-400 tabular-nums truncate">
                                    {subtotal > 0 ? `${subtotal} ج.م` : '—'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransferFromDenominations(prev => ({
                                      ...prev,
                                      [denom]: Math.max(0, (prev[denom] || 0) - 1)
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={count || ''}
                                  onChange={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    setTransferFromDenominations(prev => ({
                                      ...prev,
                                      [denom]: Math.max(0, val)
                                    }));
                                  }}
                                  className="w-10 h-7 rounded-lg text-center font-black text-[10px] focus:outline-none focus:border-emerald-500/50 select-all p-0 m-0 tabular-nums border"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                  placeholder="0"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransferFromDenominations(prev => ({
                                      ...prev,
                                      [denom]: (prev[denom] || 0) + 1
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">{lang === 'ar' ? 'إجمالي الكاش الصادر:' : 'Total Outgoing Cash:'}</span>
                          <span className={cn(
                            "tabular-nums font-black text-sm",
                            Math.abs(getTransferFromDenominationsTotal() - parseFloat(transferAmount || '0')) < 0.01
                              ? "text-emerald-400"
                              : "text-amber-500"
                          )}>
                            {getTransferFromDenominationsTotal()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                        {transferAmount && Math.abs(getTransferFromDenominationsTotal() - parseFloat(transferAmount)) >= 0.01 && (
                          <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">
                            {lang === 'ar' 
                              ? `⚠️ المجموع لا يطابق مبلغ التحويل (${transferAmount} ج.م) - الفرق: ${parseFloat(transferAmount) - getTransferFromDenominationsTotal()} ج.م`
                              : `⚠️ Total does not match transfer amount (${transferAmount} EGP) - Diff: ${parseFloat(transferAmount) - getTransferFromDenominationsTotal()} EGP`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Incoming cash denominations */}
                  {isToCash && (
                    <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 animate-fade-in text-right">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-slate-400">
                          {lang === 'ar' ? '💵 فئات الكاش الوارد (إلى الكاش)' : '💵 Incoming Cash Denominations (to Cash)'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {lang === 'ar' ? 'حدد الأوراق الواردة (إجباري)' : 'Specify incoming counts (required)'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {EGYPTIAN_DENOMINATIONS_LIST.map(({ value: denom, ar, en }) => {
                          const count = transferToDenominations[denom] || 0;
                          const subtotal = count * parseFloat(denom);
                          return (
                            <div key={denom} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-16 h-10 rounded-xl border border-white/10 relative overflow-hidden shadow bg-slate-900/10">
                                  <img
                                    src={`/banknotes/egp_${denom}.png`}
                                    alt={`${denom} EGP`}
                                    className="w-full h-full object-cover rounded-xl"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-[10px] font-bold text-[var(--foreground)] truncate">{lang === 'ar' ? ar : en}</span>
                                  <span className="text-[10px] font-black text-emerald-400 tabular-nums truncate">
                                    {subtotal > 0 ? `${subtotal} ج.م` : '—'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransferToDenominations(prev => ({
                                      ...prev,
                                      [denom]: Math.max(0, (prev[denom] || 0) - 1)
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={count || ''}
                                  onChange={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    setTransferToDenominations(prev => ({
                                      ...prev,
                                      [denom]: Math.max(0, val)
                                    }));
                                  }}
                                  className="w-10 h-7 rounded-lg text-center font-black text-[10px] focus:outline-none focus:border-emerald-500/50 select-all p-0 m-0 tabular-nums border"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                  placeholder="0"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransferToDenominations(prev => ({
                                      ...prev,
                                      [denom]: (prev[denom] || 0) + 1
                                    }));
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">{lang === 'ar' ? 'إجمالي الكاش الوارد:' : 'Total Incoming Cash:'}</span>
                          <span className={cn(
                            "tabular-nums font-black text-sm",
                            Math.abs(getTransferToDenominationsTotal() - parseFloat(transferAmount || '0')) < 0.01
                              ? "text-emerald-400"
                              : "text-amber-500"
                          )}>
                            {getTransferToDenominationsTotal()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                        {transferAmount && Math.abs(getTransferToDenominationsTotal() - parseFloat(transferAmount)) >= 0.01 && (
                          <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">
                            {lang === 'ar' 
                              ? `⚠️ المجموع لا يطابق مبلغ التحويل (${transferAmount} ج.م) - الفرق: ${parseFloat(transferAmount) - getTransferToDenominationsTotal()} ج.م`
                              : `⚠️ Total does not match transfer amount (${transferAmount} EGP) - Diff: ${parseFloat(transferAmount) - getTransferToDenominationsTotal()} EGP`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={
                      transferSubmitting || 
                      !fromAccountId || 
                      !toAccountId || 
                      !transferAmount || 
                      (isFromCash && Math.abs(getTransferFromDenominationsTotal() - parseFloat(transferAmount || '0')) >= 0.01) ||
                      (isToCash && Math.abs(getTransferToDenominationsTotal() - parseFloat(transferAmount || '0')) >= 0.01)
                    }
                    className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                  >
                    {transferSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (lang === 'ar' ? 'إجراء التحويل المالي' : 'Execute Transfer')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Standard Transaction Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger 
                onClick={() => {
                  setTargetUserId(currentUser?.id || '');
                  setOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 h-12 sm:h-11 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة معاملة
              </DialogTrigger>
            <DialogContent className="rounded-[24px] sm:rounded-[32px] p-0 outline-none sm:max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
              <DialogHeader className="text-right p-5 sm:p-8 pb-3">
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>{lang === 'ar' ? 'إضافة معاملة جديدة' : 'Add New Transaction'}</DialogTitle>
                </div>

                {/* ─── Voice Input Panel ─── */}
                <div className={cn(
                  "mt-4 rounded-2xl border transition-all duration-300",
                  isListening
                    ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10"
                    : "bg-white/3 border-white/8 hover:border-indigo-500/30"
                )}>
                  <div className="flex items-center gap-4 p-4">
                    {/* Mic button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0",
                        isListening
                          ? "bg-red-500 text-white shadow-xl shadow-red-500/40 scale-105"
                          : "bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 hover:border-indigo-400/50 hover:scale-105 active:scale-95"
                      )}
                    >
                      {isListening ? (
                        <>
                          {/* Pulse rings */}
                          <span className="absolute inset-0 rounded-2xl bg-red-400 opacity-30 animate-ping" />
                          <MicOff className="w-6 h-6 relative z-10" />
                        </>
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>

                    {/* Text area */}
                    <div className="flex-1 min-w-0 text-right">
                      {isListening ? (
                        <>
                          <p className="text-xs font-black text-red-400 mb-1 flex items-center gap-1 justify-end">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            {lang === 'ar' ? 'جاري الاستماع...' : 'Listening...'}
                          </p>
                          <p className="text-sm text-white/80 font-medium leading-snug truncate">
                            {voiceTranscript || (lang === 'ar' ? 'تكلم الآن...' : 'Speak now...')}
                          </p>
                        </>
                      ) : voiceParsing ? (
                        <>
                          <p className="text-xs font-black text-indigo-400 mb-1 flex items-center gap-1 justify-end">
                            <Sparkles className="w-3 h-3 animate-spin" />
                            {lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                          </p>
                          <p className="text-sm text-white/60 font-medium leading-snug truncate">{voiceTranscript}</p>
                        </>
                      ) : voiceTranscript ? (
                        <>
                          <p className="text-xs font-black text-emerald-400 mb-1 flex items-center gap-1 justify-end">
                            <Sparkles className="w-3 h-3" />
                            {lang === 'ar' ? 'تم التعرف ✓' : 'Recognized ✓'}
                          </p>
                          <p className="text-sm text-white/60 font-medium leading-snug truncate">{voiceTranscript}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-300 mb-0.5">{lang === 'ar' ? 'إدخال بالصوت' : 'Voice Input'}</p>
                          <p className="text-xs text-slate-500 leading-snug">
                            {lang === 'ar'
                              ? 'اضغط على الميكروفون وقول مثلاً: "دفعت 150 جنيه اكل كافيه"'
                              : 'Tap mic and say e.g. "spent 150 EGP on food cafe"'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto custom-scrollbar px-5 sm:px-8 pb-5 sm:pb-8 pt-2">
                {isAdmin && (
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المستخدم المستهدف' : 'Target User'}</label>
                    <Select value={targetUserId} onValueChange={(val) => setTargetUserId(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر المستخدم' : 'Select User'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                            {u.name} {u.id === currentUser?.id ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                  {(['expense', 'income'] as const).map(t => (
                    <button 
                      key={t} 
                      type="button" 
                      onClick={() => { setType(t); setCategory(''); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                        type === t 
                          ? (t === 'expense' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20") 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {lang === 'ar' ? (t === 'expense' ? 'مصروف' : 'إيراد') : (t === 'expense' ? 'Expense' : 'Income')}
                    </button>
                  ))}
                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01" 
                        required 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl h-12 pl-14 pr-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-right"
                        placeholder="0.00"
                        dir="ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs bg-white/10 px-2 py-0.5 rounded-lg pointer-events-none">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                    <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select Category'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                        {cats.map(c => {
                          const Item = SelectItem as any;
                          const translatedLabel = getCategoryInfo(c.value, type, lang).label;
                          return (
                            <Item key={c.value} value={c.value} textValue={translatedLabel} className="focus:bg-white/10 rounded-xl cursor-pointer py-3 pr-12 pl-4">
                              <div className="flex items-center gap-3 w-full">
                                <span className="text-xl shrink-0">{c.icon}</span>
                                <span className="font-bold text-sm whitespace-nowrap">{translatedLabel}</span>
                              </div>
                            </Item>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الحساب المالي (بنك / كاش)' : 'Financial Account (Bank / Cash)'}</label>
                  <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                      <SelectValue placeholder={lang === 'ar' ? 'اختر الحساب المالي (اختياري)' : 'Select Financial Account (Optional)'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                      <SelectItem value="none" className="focus:bg-white/10 rounded-lg text-slate-400">
                        {lang === 'ar' ? 'بدون ربط (سجل عام)' : 'No account link (General Log)'}
                      </SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                            <span>
                              {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isCashAccount && (
                  <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10 animate-fade-in text-right">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-slate-400">
                        {lang === 'ar' ? '💵 فئات العملة الكاش' : '💵 Cash Denominations'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {lang === 'ar' ? 'تحديد توزيع الفئات النقدية' : 'Specify cash banknote details'}
                      </span>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex gap-2 p-1.5 bg-black/30 rounded-xl border border-white/5">
                      <button 
                        type="button" 
                        onClick={() => setUseChangeCalculator(false)} 
                        className={cn('flex-1 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all cursor-pointer', !useChangeCalculator ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white')}
                      >
                        {lang === 'ar' ? '💵 فئات عادية' : '💵 Simple Denoms'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setUseChangeCalculator(true)} 
                        className={cn('flex-1 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all cursor-pointer', useChangeCalculator ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white')}
                      >
                        {lang === 'ar' ? '🧮 حساب الباقي (المدفوع والباقي)' : '🧮 Change Calculator'}
                      </button>
                    </div>

                    {!useChangeCalculator ? (
                      <>
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                          {EGYPTIAN_DENOMINATIONS_LIST.map(({ value: denom, ar, en }) => {
                            const count = denominations[denom] || 0;
                            const subtotal = count * parseFloat(denom);
                            return (
                              <div key={denom} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="shrink-0 w-16 h-10 rounded-xl border border-white/10 relative overflow-hidden bg-slate-900/10">
                                    <img
                                      src={`/banknotes/egp_${denom}.png`}
                                      alt={`${denom} EGP`}
                                      className="w-full h-full object-cover rounded-xl"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-[var(--foreground)] truncate">{lang === 'ar' ? ar : en}</span>
                                    <span className="text-[10px] font-black text-emerald-400 tabular-nums truncate">
                                      {subtotal > 0 ? `${subtotal} ج.م` : '—'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDenominations(prev => ({
                                        ...prev,
                                        [denom]: Math.max(0, (prev[denom] || 0) - 1)
                                      }));
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                  >
                                    -
                                  </button>
                                  
                                  <input
                                    type="number"
                                    min="0"
                                    value={count || ''}
                                    onChange={e => {
                                      const val = parseInt(e.target.value) || 0;
                                      setDenominations(prev => ({
                                        ...prev,
                                        [denom]: Math.max(0, val)
                                      }));
                                    }}
                                    className="w-10 h-7 rounded-lg text-center font-black text-[10px] focus:outline-none focus:border-emerald-500/50 select-all p-0 m-0 tabular-nums border"
                                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    placeholder="0"
                                  />
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDenominations(prev => ({
                                        ...prev,
                                        [denom]: (prev[denom] || 0) + 1
                                      }));
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Realtime sum checking */}
                        <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">{lang === 'ar' ? 'إجمالي فئات الكاش:' : 'Total Cash Denoms:'}</span>
                            <span className={cn(
                              "tabular-nums font-black text-sm",
                              Math.abs(getDenominationsTotal() - parseFloat(amount || '0')) < 0.01
                                ? "text-emerald-400"
                                : "text-amber-500"
                            )}>
                              {getDenominationsTotal()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                          </div>
                          
                          {amount && Math.abs(getDenominationsTotal() - parseFloat(amount)) >= 0.01 && (
                            <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">
                              {lang === 'ar' 
                                ? `⚠️ المجموع لا يطابق مبلغ المعاملة (${amount} ج.م) - الفرق: ${parseFloat(amount) - getDenominationsTotal()} ج.م`
                                : `⚠️ Total does not match transaction amount (${amount} EGP) - Diff: ${parseFloat(amount) - getDenominationsTotal()} EGP`}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Paid Section */}
                        <div className="space-y-2 border-b border-white/5 pb-3">
                          <label className="text-[10px] font-bold text-indigo-300 block mb-1">
                            {lang === 'ar' ? '💸 الأوراق المدفوعة (التي قمت بإعطائها):' : '💸 Paid Banknotes (What you paid):'}
                          </label>
                          <div className="grid grid-cols-1 gap-1.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                            {EGYPTIAN_DENOMINATIONS_LIST.map(({ value: denom, ar, en }) => {
                              const count = paidDenominations[denom] || 0;
                              const subtotal = count * parseFloat(denom);
                              return (
                                <div key={denom} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="shrink-0 w-12 h-8 rounded-lg border border-white/10 relative overflow-hidden bg-slate-900/10">
                                      <img
                                        src={`/banknotes/egp_${denom}.png`}
                                        alt={`${denom} EGP`}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-[9px] font-bold text-slate-300 truncate">{lang === 'ar' ? ar : en}</span>
                                      <span className="text-[9px] font-black text-emerald-400 tabular-nums truncate">
                                        {subtotal > 0 ? `${subtotal} ج.م` : '—'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaidDenominations(prev => ({
                                          ...prev,
                                          [denom]: Math.max(0, (prev[denom] || 0) - 1)
                                        }));
                                      }}
                                      className="w-6 h-6 rounded-md flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={count || ''}
                                      onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setPaidDenominations(prev => ({
                                          ...prev,
                                          [denom]: Math.max(0, val)
                                        }));
                                      }}
                                      className="w-8 h-6 rounded-md text-center font-black text-[9px] focus:outline-none focus:border-emerald-500/50 select-all p-0 m-0 tabular-nums border"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                      placeholder="0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaidDenominations(prev => ({
                                          ...prev,
                                          [denom]: (prev[denom] || 0) + 1
                                        }));
                                      }}
                                      className="w-6 h-6 rounded-md flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Received Section */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-amber-300 block mb-1">
                            {lang === 'ar' ? '🪙 الباقي المستلم (الذي استرددته):' : '🪙 Change Received (What you got back):'}
                          </label>
                          <div className="grid grid-cols-1 gap-1.5 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                            {EGYPTIAN_DENOMINATIONS_LIST.map(({ value: denom, ar, en }) => {
                              const count = receivedDenominations[denom] || 0;
                              const subtotal = count * parseFloat(denom);
                              return (
                                <div key={denom} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="shrink-0 w-12 h-8 rounded-lg border border-white/10 relative overflow-hidden bg-slate-900/10">
                                      <img
                                        src={`/banknotes/egp_${denom}.png`}
                                        alt={`${denom} EGP`}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="text-[9px] font-bold text-slate-300 truncate">{lang === 'ar' ? ar : en}</span>
                                      <span className="text-[9px] font-black text-amber-400 tabular-nums truncate">
                                        {subtotal > 0 ? `${subtotal} ج.م` : '—'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReceivedDenominations(prev => ({
                                          ...prev,
                                          [denom]: Math.max(0, (prev[denom] || 0) - 1)
                                        }));
                                      }}
                                      className="w-6 h-6 rounded-md flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={count || ''}
                                      onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setReceivedDenominations(prev => ({
                                          ...prev,
                                          [denom]: Math.max(0, val)
                                        }));
                                      }}
                                      className="w-8 h-6 rounded-md text-center font-black text-[9px] focus:outline-none focus:border-emerald-500/50 select-all p-0 m-0 tabular-nums border"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                      placeholder="0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReceivedDenominations(prev => ({
                                          ...prev,
                                          [denom]: (prev[denom] || 0) + 1
                                        }));
                                      }}
                                      className="w-6 h-6 rounded-md flex items-center justify-center transition-all active:scale-95 font-black text-xs border hover:bg-white/5 cursor-pointer"
                                      style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Realtime sum checking for Change Calculator */}
                        <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400">{lang === 'ar' ? 'صافي الحساب (المدفوع - الباقي):' : 'Net Calculated Amount:'}</span>
                            <span className={cn(
                              "tabular-nums font-black text-sm",
                              Math.abs(getChangeCalculatorTotal() - parseFloat(amount || '0')) < 0.01
                                ? "text-emerald-400"
                                : "text-amber-500"
                            )}>
                              {getChangeCalculatorTotal()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                          </div>
                          
                          {amount && Math.abs(getChangeCalculatorTotal() - parseFloat(amount)) >= 0.01 && (
                            <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">
                              {lang === 'ar' 
                                ? `⚠️ الصافي لا يطابق مبلغ المعاملة (${amount} ج.م) - الفرق: ${parseFloat(amount) - getChangeCalculatorTotal()} ج.م`
                                : `⚠️ Net does not match transaction amount (${amount} EGP) - Diff: ${parseFloat(amount) - getChangeCalculatorTotal()} EGP`}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الوصف — ماذا فعلت؟' : 'Description — What did you do?'}</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                    placeholder={lang === 'ar' ? 'مثال: فطور كافيه، بنزين عربية، دفعت إيجار، اشتريت...' : 'e.g. Cafe breakfast, car gas, paid rent, bought...'}
                  />
                  <p className="text-[10px] text-slate-500 mr-1">{lang === 'ar' ? '💡 اكتب بالتفصيل إيه اللي عملته — المبلغ راح على إيه؟' : '💡 Write in detail what you did — what was the amount spent on?'}</p>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                  <div className="relative group cursor-pointer" onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.showPicker?.();
                  }}>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                      dir="ltr"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting || !amount || !category || (isCashAccount && (
                    useChangeCalculator 
                      ? Math.abs(getChangeCalculatorTotal() - parseFloat(amount || '0')) >= 0.01
                      : Math.abs(getDenominationsTotal() - parseFloat(amount || '0')) >= 0.01
                  ))}
                  className={cn(
                    "w-full h-14 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-4",
                    type === 'expense' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  )}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (lang === 'ar' ? 'حفظ المعاملة' : 'Save Transaction')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        {isAdmin && (
          <div className="w-full sm:w-[300px] text-right">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 block mr-1">{lang === 'ar' ? 'تصفية حسب المستخدم' : 'Filter by User'}</label>
            <Select value={selectedUserId} onValueChange={(val) => setSelectedUserId(val || '')}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-xl h-12 shadow-inner" style={{ color: 'var(--foreground)' }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder={lang === 'ar' ? 'الكل' : 'All'} />
                </div>
              </SelectTrigger>
                <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
                  <SelectItem value="all" className="font-bold text-indigo-400 focus:bg-white/10 rounded-lg">{lang === 'ar' ? 'كل العائلة' : 'All Family'}</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                      {u.name} {u.id === currentUser?.id ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{lang === 'ar' ? 'جاري تحميل المعاملات' : 'Loading Transactions'}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{lang === 'ar' ? 'لا توجد معاملات مسجلة' : 'No Transactions Recorded'}</h3>
          <p className="text-slate-500 max-w-xs mx-auto">{lang === 'ar' ? 'ابدأ بتسجيل أولى معاملاتك المالية لتتبع دخلك ومصروفاتك.' : 'Start recording your first financial transactions to track your income and expenses.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {transactions.map((tx) => {
            const cat = getCategoryInfo(tx.category, tx.type, lang);
            const isIncome = tx.type === 'income';
            
            return (
              <div key={tx.id} className="glass-card p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 group hover:border-white/10 transition-all active:scale-[0.99]">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-inner transition-transform group-hover:scale-110 shrink-0 mt-0.5 sm:mt-0",
                    isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-white text-sm sm:text-base leading-snug break-words whitespace-normal">
                        {tx.description || cat.label}
                      </h4>
                      {isAdmin && (
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-bold whitespace-nowrap border border-indigo-500/20">
                          👤 {users.find(u => u.id === tx.userId)?.name || (lang === 'ar' ? 'مستخدم' : 'User')}
                        </span>
                      )}
                    </div>

                    {/* Meta row: category + date + account */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-md">
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        {cat.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 shrink-0" />
                        {new Date(tx.date).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      {tx.account ? (
                        <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-slate-400 font-semibold">
                          <BankLogo name={tx.account.name} size="sm" className="w-3 h-3 rounded border-0 shrink-0" />
                          {getTranslatedBankName(tx.account.name, lang)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-600 text-[9px] italic">
                          {lang === 'ar' ? 'سجل عام' : 'General Log'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: amount + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn(
                    "text-sm sm:text-xl font-black tabular-nums flex items-center gap-0.5 sm:gap-1",
                    isIncome ? "text-emerald-500" : "text-red-500"
                  )}>
                    {isIncome ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="text-sm sm:text-base">{formatCurrency(tx.amount)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(tx)}
                      className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all active:scale-90"
                      title={lang === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, transactionId: tx.id, description: tx.description || cat.label })}
                      className="p-1.5 sm:p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent className="p-5 sm:p-8 overflow-hidden sm:max-w-[440px] rounded-[24px] sm:rounded-[32px] outline-none" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{lang === 'ar' ? 'حذف المعاملة' : 'Delete Transaction'}</DialogTitle>
            </DialogHeader>
            <p className="text-base font-medium mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف معاملة "${deleteDialog.description}"؟ لا يمكن التراجع عن هذا الإجراء.` 
                : `Are you sure you want to delete the transaction "${deleteDialog.description}"? This action cannot be undone.`}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <Button 
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all" 
                onClick={handleDelete}
              >
                {lang === 'ar' ? 'حذف نهائي' : 'Delete'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-14 font-bold rounded-2xl transition-all" 
                style={{ borderColor: 'var(--border)', background: 'transparent', color: 'var(--foreground)' }}
                onClick={() => setDeleteDialog({ isOpen: false, transactionId: '', description: '' })}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 outline-none sm:max-w-[480px] max-h-[90vh] overflow-y-auto custom-scrollbar" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black mb-6" style={{ color: 'var(--foreground)' }}>تعديل المعاملة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {isAdmin && (
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">المستخدم المستهدف</label>
                <Select value={editTargetUserId} onValueChange={(val) => setEditTargetUserId(val || '')}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id} className="focus:bg-white/10 rounded-lg">
                        {u.name} {u.id === currentUser?.id ? '(أنت)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5">
              {(['expense', 'income'] as const).map(t => (
                <button 
                  key={t} 
                  type="button" 
                  onClick={() => { setEditType(t); setEditCategory(''); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-black text-sm transition-all",
                    editType === t 
                      ? (t === 'expense' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20") 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {t === 'expense' ? 'مصروف' : 'إيراد'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'المبلغ' : 'Amount'}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={editAmount} 
                    onChange={e => setEditAmount(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all text-center"
                    placeholder="0.00"
                    dir="ltr"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                <Select value={editCategory} onValueChange={(val) => setEditCategory(val || '')}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select Category'} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] max-h-[400px] py-2 pr-2 pl-6 custom-scrollbar border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                    {(editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => {
                      const Item = SelectItem as any;
                      const translatedLabel = getCategoryInfo(c.value, editType, lang).label;
                      return (
                        <Item key={c.value} value={c.value} textValue={translatedLabel} className="focus:bg-white/10 rounded-xl cursor-pointer py-3 pr-12 pl-4">
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-xl shrink-0">{c.icon}</span>
                            <span className="font-bold text-sm whitespace-nowrap">{translatedLabel}</span>
                          </div>
                        </Item>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الحساب المالي (بنك / كاش)</label>
              <Select value={editAccountId} onValueChange={(val) => setEditAccountId(val || '')}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-right h-12 rounded-xl px-4" dir="rtl" style={{ color: 'var(--foreground)' }}>
                  <SelectValue placeholder="اختر الحساب المالي (اختياري)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border" style={{ background: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }} dir="rtl">
                  <SelectItem value="none" className="focus:bg-white/10 rounded-lg text-slate-400">
                    {lang === 'ar' ? 'بدون ربط (سجل عام)' : 'No account link (General Log)'}
                  </SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="focus:bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BankLogo name={acc.name} size="sm" className="w-4 h-4 rounded border-0" />
                        <span>
                          {getTranslatedBankName(acc.name, lang)} ({acc.alias || (acc.type === 'cash' ? (lang === 'ar' ? 'كاش' : 'Cash') : acc.type === 'wallet' ? (lang === 'ar' ? 'محفظة' : 'Wallet') : (lang === 'ar' ? 'بنك' : 'Bank'))}){acc.accountNum ? ` - ${acc.accountNum}` : ''} - {formatCurrency(acc.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">الوصف — ماذا فعلت؟</label>
              <input 
                type="text" 
                value={editDescription} 
                onChange={e => setEditDescription(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all text-right"
                placeholder="مثال: فطور كافيه، بنزين عربية، دفعت إيجار، اشتريت..."
              />
              <p className="text-[10px] text-slate-500 mr-1">💡 اكتب بالتفصيل إيه اللي عملته — المبلغ راح على إيه؟</p>
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">التاريخ</label>
              <div className="relative group cursor-pointer" onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input) input.showPicker?.();
              }}>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={e => setEditDate(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white font-medium focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                  dir="ltr"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors pointer-events-none" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={editSubmitting || !editAmount || !editCategory}
              className={cn(
                "w-full h-14 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-4",
                editType === 'expense' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              )}
            >
              {editSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ التعديلات'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

