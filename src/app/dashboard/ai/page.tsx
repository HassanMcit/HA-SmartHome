'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { transactionsApi, formatCurrency, getCategoryInfo } from '@/lib/api';
import {
  TrendingUp, TrendingDown, ChevronRight, ChevronLeft,
  BarChart2, PieChart, Wallet, Target, ArrowUpRight, ArrowDownRight,
  Calendar, AlertCircle, RefreshCw,
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
  Area,
  AreaChart,
} from 'recharts';

// ─── Color palette ────────────────────────────────────────────────
const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#a855f7', '#06b6d4', '#84cc16',
];

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Tooltips ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(22,22,50,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 12,
        padding: '10px 16px',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        minWidth: 160,
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

// ─── Main Page ────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { lang } = useLanguage();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // 6-month trend
  const [trendData, setTrendData]         = useState<any[]>([]);
  const [trendLoading, setTrendLoading]   = useState(true);

  const monthNames = lang === 'ar' ? MONTH_NAMES_AR : MONTH_NAMES_EN;

  // ─── Fetch current month stats ─────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await transactionsApi.getStats({ month: selectedMonth, year: selectedYear });
      setStats(data);
    } catch {
      setError(true);
      toast.error(lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, lang]);

  // ─── Fetch 6-month trend ───────────────────────────────────────
  const fetchTrend = useCallback(async () => {
    setTrendLoading(true);
    try {
      const months: { month: number; year: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      }
      const results = await Promise.all(
        months.map(m => transactionsApi.getStats({ month: m.month, year: m.year }).catch(() => null))
      );
      setTrendData(
        months.map((m, i) => ({
          name: `${monthNames[m.month - 1].substring(0, 3)}`,
          income:   results[i]?.totalIncome   || 0,
          expenses: results[i]?.totalExpenses || 0,
          balance:  (results[i]?.totalIncome || 0) - (results[i]?.totalExpenses || 0),
        }))
      );
    } catch {
      console.error('Trend fetch failed');
    } finally {
      setTrendLoading(false);
    }
  }, [selectedMonth, selectedYear, monthNames]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
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

  // ─── Derived data ──────────────────────────────────────────────
  const categoryBreakdown = Object.entries(stats?.categoryBreakdown || {})
    .map(([cat, amount]: any) => ({
      category:   cat,
      categoryAr: getCategoryInfo(cat, 'expense').label,
      icon:       getCategoryInfo(cat, 'expense').icon,
      amount,
      percentage: stats?.totalExpenses
        ? Number(((amount / stats.totalExpenses) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const pieData = categoryBreakdown.slice(0, 8).map((c, i) => ({
    name:       c.categoryAr,
    value:      c.amount,
    percentage: c.percentage,
    fill:       CHART_COLORS[i % CHART_COLORS.length],
  }));

  const barData = [
    { name: lang === 'ar' ? 'إيرادات' : 'Income',   value: stats?.totalIncome   || 0, fill: '#10b981' },
    { name: lang === 'ar' ? 'مصروفات' : 'Expenses', value: stats?.totalExpenses || 0, fill: '#ef4444' },
  ];

  const savingsRate = stats?.totalIncome
    ? Math.max(0, Math.round(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100))
    : 0;

  const spendingRate = stats?.totalIncome
    ? Math.min(100, Math.round((stats.totalExpenses / stats.totalIncome) * 100))
    : 0;

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-sky-400" />
            {lang === 'ar' ? 'التحليلات المالية' : 'Financial Analytics'}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {lang === 'ar' ? 'رسوم بيانية تفاعلية لوضعك المالي' : 'Interactive charts for your finances'}
          </p>
        </div>

        {/* Month selector + Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchStats(); fetchTrend(); }}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-all active:scale-90"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>

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
      </div>

      {/* ── Loading ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
          <p className="text-slate-400 text-sm font-bold animate-pulse">
            {lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
          </p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-white font-black text-xl mb-2">
            {lang === 'ar' ? 'تعذّر تحميل البيانات' : 'Failed to load data'}
          </h3>
          <button onClick={() => { fetchStats(); fetchTrend(); }}
            className="mt-4 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: lang === 'ar' ? 'الرصيد المحاسبي' : 'Net Balance',
                value: (stats?.totalIncome || 0) - (stats?.totalExpenses || 0),
                icon:  <Wallet className="w-4 h-4" />,
                color: 'sky',
                format: (v: number) => formatCurrency(v),
                textColor: (v: number) => v >= 0 ? 'text-white' : 'text-red-400',
              },
              {
                label: lang === 'ar' ? 'الإيرادات' : 'Income',
                value: stats?.totalIncome || 0,
                icon:  <ArrowUpRight className="w-4 h-4" />,
                color: 'emerald',
                format: (v: number) => formatCurrency(v),
                textColor: () => 'text-emerald-400',
              },
              {
                label: lang === 'ar' ? 'المصروفات' : 'Expenses',
                value: stats?.totalExpenses || 0,
                icon:  <ArrowDownRight className="w-4 h-4" />,
                color: 'red',
                format: (v: number) => formatCurrency(v),
                textColor: () => 'text-red-400',
              },
              {
                label: lang === 'ar' ? 'نسبة الادخار' : 'Savings Rate',
                value: savingsRate,
                icon:  <Target className="w-4 h-4" />,
                color: 'purple',
                format: (v: number) => `${v}%`,
                textColor: (v: number) => v >= 20 ? 'text-purple-400' : v >= 10 ? 'text-amber-400' : 'text-red-400',
              },
            ].map((card, i) => (
              <div key={i} className={`glass-card p-5 relative overflow-hidden group hover:border-${card.color}-500/30 transition-all`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:bg-${card.color}-500/20 transition-all`} />
                <div className={`w-9 h-9 rounded-xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400 mb-3`}>
                  {card.icon}
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={cn('text-xl font-black tabular-nums', card.textColor(card.value))}>
                  {card.format(card.value)}
                </p>
              </div>
            ))}
          </div>

          {/* ── Charts Row 1: Donut + Bar ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Donut Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-sm">
                  {lang === 'ar' ? 'توزيع المصروفات' : 'Expense Breakdown'}
                </h3>
              </div>

              {pieData.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
                  {lang === 'ar' ? 'لا توجد مصروفات هذا الشهر' : 'No expenses this month'}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                        paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-1.5">
                    {pieData.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
                          <span className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-slate-500">{item.percentage}%</span>
                          <span className="text-xs font-black text-white tabular-nums">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-sm">
                  {lang === 'ar' ? 'الإيرادات مقابل المصروفات' : 'Income vs Expenses'}
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Spending rate bar */}
              {stats?.totalIncome > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>{lang === 'ar' ? 'معدل الإنفاق من الدخل' : 'Spending rate'}</span>
                    <span className={cn(
                      spendingRate > 90 ? 'text-red-400' : spendingRate > 70 ? 'text-amber-400' : 'text-emerald-400'
                    )}>{spendingRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${spendingRate}%`,
                        background: spendingRate > 90
                          ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                          : spendingRate > 70
                          ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                          : 'linear-gradient(90deg,#10b981,#059669)',
                      }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 6-Month Trend ─────────────────────────────────── */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-sm">
                  {lang === 'ar' ? 'الاتجاه المالي — آخر 6 أشهر' : 'Financial Trend — Last 6 Months'}
                </h3>
              </div>
              {trendLoading && (
                <div className="w-4 h-4 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
              )}
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) =>
                  <span style={{ color: '#94a3b8', fontFamily: 'Cairo', fontSize: 12, fontWeight: 700 }}>{value}</span>
                } />
                <Area type="monotone" dataKey="income"
                  name={lang === 'ar' ? 'إيرادات' : 'Income'}
                  stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)"
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }} />
                <Area type="monotone" dataKey="expenses"
                  name={lang === 'ar' ? 'مصروفات' : 'Expenses'}
                  stroke="#ef4444" strokeWidth={2.5} fill="url(#expenseGrad)"
                  dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Top Categories Table ───────────────────────────── */}
          {categoryBreakdown.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-sm">
                  {lang === 'ar' ? 'أعلى فئات الإنفاق' : 'Top Spending Categories'}
                </h3>
              </div>
              <div className="p-2">
                {categoryBreakdown.slice(0, 8).map((cat, i) => {
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-4 hover:bg-white/[0.02] rounded-xl transition-colors group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                        style={{ background: `${color}15` }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {cat.categoryAr}
                          </span>
                          <span className="text-sm font-black text-white tabular-nums ml-4">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${cat.percentage}%`, background: color }} />
                        </div>
                      </div>
                      <span className="text-xs font-black tabular-nums shrink-0 w-9 text-left" style={{ color }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Summary Footer ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'الشهر' : 'Month'}</p>
                <p className="text-base font-black text-white">{monthNames[selectedMonth - 1]} {selectedYear}</p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'متوسط يومي' : 'Daily Avg'}</p>
                <p className="text-base font-black text-amber-400 tabular-nums">
                  {formatCurrency((stats?.totalExpenses || 0) / 30)}
                </p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold">{lang === 'ar' ? 'أعلى فئة' : 'Top Category'}</p>
                <p className="text-sm font-black text-pink-400 truncate">
                  {categoryBreakdown[0]?.categoryAr || '—'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
