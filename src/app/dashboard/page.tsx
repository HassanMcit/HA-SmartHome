'use client';

import { useEffect, useState } from 'react';
import { transactionsApi, billsApi, TransactionStats, Transaction, Bill, formatCurrency, getCategoryInfo } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDownRight, ArrowUpRight, Wallet, Activity, CreditCard, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import WeatherPrayerWidget from '@/components/WeatherPrayerWidget';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const now = new Date();
        const m = now.getMonth() + 1;
        const y = now.getFullYear();
        const [statsData, txData, billsData] = await Promise.all([
          transactionsApi.getStats({ month: m, year: y }),
          transactionsApi.getAll({ limit: 5 }),
          billsApi.getAll(false, user.id), // Only current user's unpaid bills
        ]);

        setStats(statsData);
        setRecentTransactions(txData);
        setUnpaidBills(billsData);
      } catch {
        toast.error(t('data_load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-fade-in">
      {/* Weather, Clock & Prayer Times */}
      <WeatherPrayerWidget />

      {/* Professional Bills Alert */}
      {unpaidBills.length > 0 && (
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity rounded-3xl" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-right sm:text-left rtl:text-right">
                <h4 className="text-lg font-black">{t('bills_alert_title')}</h4>
                <p className="text-sm font-medium opacity-90">{t('bills_alert_desc_1')} <span className="underline decoration-2 underline-offset-4">{unpaidBills.length}</span> {t('bills_alert_desc_2')} {formatCurrency(unpaidBills.reduce((acc, b) => acc + b.amount, 0))}</p>
              </div>
            </div>
            <Link
              href="/dashboard/bills"
              className="px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:bg-orange-50 transition-all flex items-center gap-2 group/btn"
            >
              <span>{t('bills_pay_now')}</span>
              <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{t('dashboard_title')}</h2>
        <p className="text-slate-400 text-sm sm:text-base font-medium">{t('dashboard_subtitle')}</p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Balance */}
        <div className="glass-card p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('total_balance')}</p>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(stats?.balance || 0)}</p>
        </div>

        {/* Income */}
        <div className="glass-card p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('income_this_month')}</p>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-500 tracking-tight">{formatCurrency(stats?.totalIncome || 0)}</p>
        </div>

        {/* Expenses */}
        <div className="glass-card p-6 relative overflow-hidden group hover:border-red-500/30 transition-all sm:col-span-2 lg:col-span-1">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('expenses_this_month')}</p>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/5">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-500 tracking-tight">{formatCurrency(stats?.totalExpenses || 0)}</p>
        </div>
      </div>

      {/* Bottom Panels - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white">{t('recent_transactions')}</h3>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                <p className="text-sm font-medium">{t('no_recent_transactions')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                 {recentTransactions.map((tx) => {
                   const cat = getCategoryInfo(tx.category, tx.type);
                   return (
                     <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                           tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                         )}>
                           {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                         </div>
                         <div>
                           <div className="flex flex-wrap items-center gap-2">
                             <p className="text-sm sm:text-base font-bold text-slate-100 mb-0.5 break-words whitespace-normal">{tx.description || cat.label}</p>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">{new Date(tx.date).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' })}</p>
                         </div>
                       </div>
                       <p className={cn(
                         "font-black text-sm sm:text-base tabular-nums shrink-0",
                         tx.type === 'income' ? "text-emerald-500" : "text-red-500"
                       )}>
                         {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                       </p>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white">{t('expense_breakdown')}</h3>
          </div>
          <div className="p-6">
            {Object.keys(stats?.categoryBreakdown || {}).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                <p className="text-sm font-medium">{t('no_expense_data')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(stats?.categoryBreakdown || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]) => {
                    const total = stats?.totalExpenses || 1;
                    const pct = Math.round((amount / total) * 100);
                    return (
                      <div key={category} className="group">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{category}</span>
                          <span className="text-sm font-black text-white tabular-nums">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 text-left">{pct}% {t('of_total')}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
