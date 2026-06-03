'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, transactionsApi, formatCurrency, getCategoryInfo, EXPENSE_CATEGORIES } from '@/lib/api';
import {
  Sparkles, BrainCircuit, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, ChevronRight, ChevronLeft,
  BarChart2, PieChart, Wallet, Target, ArrowUpRight, ArrowDownRight,
  Calendar, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

// ─── Color palette for charts ─────────────────────────────────────
const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#a855f7', '#06b6d4', '#84cc16',
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ─── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, lang }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(22,22,50,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 12,
        padding: '10px 16px',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        minWidth: 180,
      }}>
        {label && <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 700 }}>{label}</p>}
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>
              {p.name && <span style={{ color: '#94a3b8', marginLeft: 4 }}>{p.name}: </span>}
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Pie Tooltip ─────────────────────────────────────────────────
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{
        background: 'rgba(22,22,50,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 12,
        padding: '10px 16px',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
      }}>
        <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{d.name}</p>
        <p style={{ color: d.payload.fill || '#6366f1', fontWeight: 700, fontSize: 14 }}>{formatCurrency(d.value)}</p>
        <p style={{ color: '#94a3b8', fontSize: 11 }}>{d.payload.percentage}%</p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────
export default function AdvancedAnalyticsPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(false);

  // Multi-month data for trend chart (last 6 months)
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);

  const monthNames = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  // ─── Fetch Analysis ────────────────────────────────────────────
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Custom fetch with month/year params
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(
        `${apiUrl}/ai/analysis?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setError(true);
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب التحليل' : 'Error fetching analysis');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, lang]);

  // ─── Fetch 6-month trend ───────────────────────────────────────
  const fetchTrend = useCallback(async () => {
    setTrendLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const months: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      }
      const results = await Promise.all(
        months.map(m =>
          fetch(`${apiUrl}/ai/analysis?month=${m.month}&year=${m.year}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.json()).catch(() => null)
        )
      );
      const trend = months.map((m, i) => ({
        name: `${monthNames[m.month - 1].substring(0, 3)} ${m.year}`,
        income: results[i]?.totalIncome || 0,
        expenses: results[i]?.totalExpenses || 0,
        balance: results[i]?.balance || 0,
      }));
      setTrendData(trend);
    } catch {
      console.error('Trend error');
    } finally {
      setTrendLoading(false);
    }
  }, [selectedMonth, selectedYear, monthNames]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);
  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  // ─── Month navigation ──────────────────────────────────────────
  const prevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    const next = new Date(selectedYear, selectedMonth, 1);
    if (next > now) return;
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };
  const isNextDisabled = new Date(selectedYear, selectedMonth, 1) > now;

  // ─── Derived chart data ────────────────────────────────────────
  const categoryChartData = (analysis?.categoryBreakdown || []).slice(0, 8).map((c: any, i: number) => ({
    name: c.categoryAr || c.category,
    value: c.amount,
    percentage: c.percentage,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const incomeVsExpense = [
    { name: lang === 'ar' ? 'إيرادات' : 'Income', value: analysis?.totalIncome || 0, fill: '#10b981' },
    { name: lang === 'ar' ? 'مصروفات' : 'Expenses', value: analysis?.totalExpenses || 0, fill: '#ef4444' },
  ];

  const savingsRate = analysis?.totalIncome
    ? Math.max(0, Math.round(((analysis.totalIncome - analysis.totalExpenses) / analysis.totalIncome) * 100))
    : 0;

  // ─── Refresh AI text only ──────────────────────────────────────
  const handleRefreshAI = async () => {
    setAiLoading(true);
    try {
      await fetchAnalysis();
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in" dir="rtl">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-indigo-400" />
            {lang === 'ar' ? 'التحليل المالي المتقدم' : 'Advanced Financial Analytics'}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {lang === 'ar' ? 'رسوم بيانية تفاعلية وتحليل ذكي لوضعك المالي' : 'Interactive charts and AI-powered financial insights'}
          </p>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 shadow-inner self-start sm:self-auto">
          <button
            onClick={nextMonth}
            disabled={isNextDisabled}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-[110px]">
            <p className="text-white font-black text-sm">{monthNames[selectedMonth - 1]}</p>
            <p className="text-slate-500 text-xs font-bold">{selectedYear}</p>
          </div>
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <BrainCircuit className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-slate-400 text-sm font-bold animate-pulse">
            {lang === 'ar' ? 'جاري تحليل بياناتك المالية...' : 'Analyzing your financial data...'}
          </p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-white font-black text-xl mb-2">
            {lang === 'ar' ? 'تعذّر تحميل البيانات' : 'Failed to load data'}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {lang === 'ar' ? 'تحقق من الاتصال وأعد المحاولة' : 'Check connection and try again'}
          </p>
          <button
            onClick={fetchAnalysis}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="glass-card p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {lang === 'ar' ? 'الرصيد' : 'Balance'}
              </p>
              <p className={cn("text-xl font-black tabular-nums", analysis?.balance >= 0 ? 'text-white' : 'text-red-400')}>
                {formatCurrency(analysis?.balance || 0)}
              </p>
            </div>

            {/* Total Income */}
            <div className="glass-card p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {lang === 'ar' ? 'الإيرادات' : 'Income'}
              </p>
              <p className="text-xl font-black text-emerald-500 tabular-nums">
                {formatCurrency(analysis?.totalIncome || 0)}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="glass-card p-5 relative overflow-hidden group hover:border-red-500/30 transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {lang === 'ar' ? 'المصروفات' : 'Expenses'}
              </p>
              <p className="text-xl font-black text-red-500 tabular-nums">
                {formatCurrency(analysis?.totalExpenses || 0)}
              </p>
            </div>

            {/* Savings Rate */}
            <div className="glass-card p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {lang === 'ar' ? 'نسبة الادخار' : 'Savings Rate'}
              </p>
              <p className={cn("text-xl font-black tabular-nums", savingsRate >= 20 ? 'text-purple-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-red-400')}>
                {savingsRate}%
              </p>
            </div>
          </div>

          {/* ── Charts Row 1: Pie + Bar ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart - Category Breakdown */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-base">
                  {lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}
                </h3>
              </div>

              {categoryChartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12 text-slate-500 text-sm">
                  {lang === 'ar' ? 'لا توجد مصروفات هذا الشهر' : 'No expenses this month'}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryChartData.map((entry: any, index: number) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-2">
                    {categoryChartData.slice(0, 6).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
                          <span className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-500">{item.percentage}%</span>
                          <span className="text-xs font-black text-white tabular-nums">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart - Income vs Expenses */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-base">
                  {lang === 'ar' ? 'الإيرادات مقابل المصروفات' : 'Income vs Expenses'}
                </h3>
              </div>

              <div className="flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip lang={lang} />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {incomeVsExpense.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Income vs Expenses progress */}
                {analysis?.totalIncome > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                      <span>{lang === 'ar' ? 'معدل الإنفاق' : 'Spending Rate'}</span>
                      <span className={cn(
                        analysis.totalExpenses / analysis.totalIncome > 0.9 ? 'text-red-400' :
                        analysis.totalExpenses / analysis.totalIncome > 0.7 ? 'text-amber-400' : 'text-emerald-400'
                      )}>
                        {Math.round((analysis.totalExpenses / analysis.totalIncome) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, Math.round((analysis.totalExpenses / analysis.totalIncome) * 100))}%`,
                          background: analysis.totalExpenses / analysis.totalIncome > 0.9
                            ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                            : analysis.totalExpenses / analysis.totalIncome > 0.7
                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                            : 'linear-gradient(90deg, #10b981, #059669)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Trend Chart: Last 6 Months ────────────────────── */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-black text-white text-base">
                {lang === 'ar' ? 'الاتجاه المالي — آخر 6 أشهر' : 'Financial Trend — Last 6 Months'}
              </h3>
              {trendLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mr-auto" />}
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip lang={lang} />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontFamily: 'Cairo', fontSize: 12, fontWeight: 700 }}>{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name={lang === 'ar' ? 'إيرادات' : 'Income'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#incomeGrad)"
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name={lang === 'ar' ? 'مصروفات' : 'Expenses'}
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#expenseGrad)"
                  dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Top Categories Table ─────────────────────────── */}
          {categoryChartData.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white">
                  {lang === 'ar' ? 'أعلى فئات الإنفاق' : 'Top Spending Categories'}
                </h3>
              </div>
              <div className="p-2">
                {(analysis?.categoryBreakdown || []).slice(0, 8).map((cat: any, i: number) => {
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  const catInfo = getCategoryInfo(cat.category, 'expense');
                  return (
                    <div key={i} className="px-4 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                        style={{ background: `${color}15` }}>
                        {catInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {cat.categoryAr || cat.category}
                          </span>
                          <span className="text-sm font-black text-white tabular-nums ml-4">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${cat.percentage}%`, background: color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-black tabular-nums shrink-0 w-10 text-left" style={{ color }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AI Analysis ──────────────────────────────────── */}
          <div className="glass-card overflow-hidden relative">
            {/* top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    {lang === 'ar' ? 'التحليل الذكي بالذكاء الاصطناعي' : 'AI-Powered Analysis'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'ar' ? `تحليل ${monthNames[selectedMonth - 1]} ${selectedYear}` : `Analysis for ${monthNames[selectedMonth - 1]} ${selectedYear}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshAI}
                disabled={aiLoading || loading}
                className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                title={lang === 'ar' ? 'تحديث التحليل' : 'Refresh Analysis'}
              >
                <RefreshCw className={cn("w-4 h-4", (aiLoading || loading) && "animate-spin")} />
              </button>
            </div>

            <div className="p-6">
              {/* API Key Warning */}
              {analysis?.noApiKey && (
                <div className="mb-4 flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/25">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-bold text-sm mb-1">
                      {lang === 'ar' ? 'وضع المحاكاة' : 'Simulation Mode'}
                    </p>
                    <p className="text-amber-200/70 text-xs leading-relaxed">
                      {lang === 'ar'
                        ? 'مفتاح Gemini API غير متوفر. يتم عرض نصائح تقريبية بناءً على القواعد الأساسية.'
                        : 'Gemini API key not available. Showing approximate tips based on basic rules.'}
                    </p>
                  </div>
                </div>
              )}

              {analysis?.transactionCount === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {lang === 'ar' ? 'لا توجد معاملات كافية للتحليل هذا الشهر' : 'Not enough transactions to analyze this month'}
                  </p>
                </div>
              ) : analysis?.aiAnalysis ? (
                <div
                  className="leading-loose text-sm text-slate-200 opacity-90"
                  style={{
                    background: 'rgba(99,102,241,0.04)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: 12,
                    padding: '1.25rem 1.5rem',
                    lineHeight: 2,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: analysis.aiAnalysis
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#818cf8">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em style="color:#a5b4fc">$1</em>')
                  }}
                />
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm animate-pulse">
                  {lang === 'ar' ? 'جاري معالجة التحليل الذكي...' : 'Processing AI analysis...'}
                </div>
              )}
            </div>
          </div>

          {/* ── Summary Footer ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'عدد المعاملات' : 'Transactions'}</p>
                <p className="text-xl font-black text-white">{analysis?.transactionCount || 0}</p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'متوسط يومي' : 'Daily Average'}</p>
                <p className="text-xl font-black text-emerald-400">
                  {formatCurrency(analysis?.totalExpenses ? analysis.totalExpenses / 30 : 0)}
                </p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'أعلى فئة إنفاق' : 'Top Category'}</p>
                <p className="text-sm font-black text-amber-400 truncate">
                  {analysis?.categoryBreakdown?.[0]?.categoryAr || analysis?.categoryBreakdown?.[0]?.category || '—'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
