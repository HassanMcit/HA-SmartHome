'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/api';
import {
  BrainCircuit, AlertCircle, RefreshCw, Sparkles,
  ChevronRight, ChevronLeft, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Wallet, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdvisorPage() {
  const { lang } = useLanguage();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [analysis, setAnalysis]           = useState<any>(null);
  const [loading, setLoading]             = useState(false);
  const [fetched, setFetched]             = useState(false); // lazy — don't auto-fetch

  const monthNames = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  // ─── Fetch (only when user presses button) ────────────────────
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(
        `${apiUrl}/ai/analysis?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setAnalysis(data);
      setFetched(true);
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ في التحليل' : 'Analysis error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, lang]);

  // ─── Month navigation ──────────────────────────────────────────
  const prevMonth = () => {
    setFetched(false); setAnalysis(null);
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    const next = new Date(selectedYear, selectedMonth, 1);
    if (next > now) return;
    setFetched(false); setAnalysis(null);
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };
  const isNextDisabled = new Date(selectedYear, selectedMonth, 1) > now;

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-violet-400" />
            {lang === 'ar' ? 'مستشارك المالي' : 'Financial Advisor'}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {lang === 'ar'
              ? 'تحليل ذكي لمصروفاتك ونصائح مخصصة بالذكاء الاصطناعي'
              : 'AI-powered analysis and personalized financial tips'}
          </p>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
          <button onClick={nextMonth} disabled={isNextDisabled}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[100px]">
            <p className="text-white font-black text-sm leading-none">{monthNames[selectedMonth - 1]}</p>
            <p className="text-slate-500 text-[11px] font-bold mt-0.5">{selectedYear}</p>
          </div>
          <button onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Intro card (before first fetch) ────────────────────── */}
      {!fetched && !loading && (
        <div className="glass-card relative overflow-hidden">
          {/* top bar */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-sky-500" />

          <div className="p-8 flex flex-col items-center text-center gap-6">
            {/* Glowing icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <BrainCircuit className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-black text-white">
                {lang === 'ar' ? 'مرحباً بك في مستشارك المالي الذكي 🤖' : 'Welcome to your AI Financial Advisor 🤖'}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {lang === 'ar'
                  ? 'اختر الشهر الذي تريد تحليله ثم اضغط على الزر أدناه. سيقوم الذكاء الاصطناعي بتحليل مصروفاتك وتقديم نصائح مخصصة لك.'
                  : 'Select the month you want to analyze then press the button below. The AI will analyze your expenses and provide personalized tips.'}
              </p>
            </div>

            {/* What you get */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-right">
              {[
                { icon: '📊', text: lang === 'ar' ? 'تحليل شامل للمصروفات' : 'Full expense analysis' },
                { icon: '💡', text: lang === 'ar' ? 'نصائح توفير مخصصة' : 'Personalized saving tips' },
                { icon: '🎯', text: lang === 'ar' ? 'خطة للشهر القادم' : 'Plan for next month' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={fetchAnalysis}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-base rounded-2xl shadow-xl shadow-violet-500/25 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {lang === 'ar'
                ? `ابدأ تحليل ${monthNames[selectedMonth - 1]}`
                : `Analyze ${monthNames[selectedMonth - 1]}`}
            </button>

            <p className="text-slate-600 text-[11px]">
              {lang === 'ar'
                ? '⚡ كل ضغطة بتستهلك Gemini tokens — استخدمها عند الحاجة'
                : '⚡ Each request consumes Gemini tokens — use when needed'}
            </p>
          </div>
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────────── */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center gap-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
            <BrainCircuit className="w-7 h-7 text-violet-400 absolute inset-0 m-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-black text-lg">
              {lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
            </p>
            <p className="text-slate-500 text-sm">
              {lang === 'ar'
                ? 'الذكاء الاصطناعي يراجع بياناتك المالية. قد يستغرق 10-20 ثانية.'
                : 'AI is reviewing your financial data. May take 10-20 seconds.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {fetched && !loading && analysis && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label:  lang === 'ar' ? 'الإيرادات' : 'Income',
                value:  formatCurrency(analysis.totalIncome),
                icon:   <ArrowUpRight className="w-4 h-4" />,
                bg:     'bg-emerald-500/10', text: 'text-emerald-400',
              },
              {
                label:  lang === 'ar' ? 'المصروفات' : 'Expenses',
                value:  formatCurrency(analysis.totalExpenses),
                icon:   <ArrowDownRight className="w-4 h-4" />,
                bg:     'bg-red-500/10', text: 'text-red-400',
              },
              {
                label:  lang === 'ar' ? 'الرصيد' : 'Balance',
                value:  formatCurrency(analysis.balance),
                icon:   <Wallet className="w-4 h-4" />,
                bg:     'bg-sky-500/10', text: analysis.balance >= 0 ? 'text-white' : 'text-red-400',
              },
              {
                label:  lang === 'ar' ? 'المعاملات' : 'Transactions',
                value:  String(analysis.transactionCount),
                icon:   <TrendingUp className="w-4 h-4" />,
                bg:     'bg-purple-500/10', text: 'text-purple-400',
              },
            ].map((card, i) => (
              <div key={i} className="glass-card p-5">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', card.bg, card.text)}>
                  {card.icon}
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={cn('text-lg font-black tabular-nums', card.text)}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Simulation mode warning */}
          {analysis.noApiKey && (
            <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-bold text-sm mb-1">
                  {lang === 'ar' ? 'وضع المحاكاة — مفتاح AI غير متوفر' : 'Simulation Mode — No AI Key'}
                </p>
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  {lang === 'ar'
                    ? 'مفتاح Gemini API غير متوفر في الخادم. يتم عرض نصائح تقريبية.'
                    : 'Gemini API key not set on server. Showing approximate tips.'}
                </p>
              </div>
            </div>
          )}

          {/* Quota/Rate limit warning */}
          {analysis.quotaExceeded && (
            <div className="flex gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/25">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm leading-relaxed">
                {lang === 'ar'
                  ? 'وصلنا للحد الأقصى لاستخدام Gemini المجاني. حاول مرة أخرى بعد قليل.'
                  : 'Gemini free quota reached. Try again later.'}
              </p>
            </div>
          )}

          {/* AI Analysis card */}
          <div className="glass-card overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-sky-500" />

            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">
                    {lang === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {monthNames[selectedMonth - 1]} {selectedYear}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAnalysis}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-600/20 text-violet-400 hover:text-violet-300 border border-violet-500/20 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                {lang === 'ar' ? 'تحليل جديد' : 'Re-analyze'}
              </button>
            </div>

            <div className="p-6">
              {analysis.transactionCount === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    {lang === 'ar'
                      ? 'لا توجد معاملات مسجلة لهذا الشهر'
                      : 'No transactions recorded for this month'}
                  </p>
                </div>
              ) : analysis.aiAnalysis ? (
                <div
                  className="text-sm leading-loose text-slate-200 opacity-90"
                  style={{
                    background: 'rgba(139,92,246,0.05)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: 12,
                    padding: '1.25rem 1.5rem',
                    lineHeight: 2,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: analysis.aiAnalysis
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#a78bfa">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em style="color:#c4b5fd">$1</em>'),
                  }}
                />
              ) : (
                <p className="text-center py-6 text-slate-500 text-sm animate-pulse">
                  {lang === 'ar' ? 'جاري معالجة التحليل...' : 'Processing...'}
                </p>
              )}
            </div>
          </div>

          {/* Top categories from AI response */}
          {(analysis.categoryBreakdown || []).length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-sm">
                  {lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {(analysis.categoryBreakdown || []).slice(0, 6).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-slate-400 font-bold text-xs w-4 shrink-0">{i + 1}</span>
                      <span className="text-sm font-bold text-slate-200 truncate">{cat.categoryAr || cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-500 font-bold">{cat.percentage}%</span>
                      <span className="text-sm font-black text-white tabular-nums">{formatCurrency(cat.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Re-analyze nudge */}
          <div className="text-center">
            <button
              onClick={fetchAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-sm font-bold transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {lang === 'ar' ? 'إعادة التحليل' : 'Re-analyze'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
