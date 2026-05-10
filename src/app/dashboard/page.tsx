'use client';

import { useEffect, useState } from 'react';
import { transactionsApi, TransactionStats, Transaction, formatCurrency } from '@/lib/api';
import { ArrowDownRight, ArrowUpRight, Wallet, Activity, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, txData] = await Promise.all([
          transactionsApi.getStats(),
          transactionsApi.getAll({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecentTransactions(txData);
      } catch {
        toast.error('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>الرئيسية</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>نظرة عامة على نشاطك المالي هذا الشهر</p>
      </div>

      {/* Stats Cards - 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* Balance */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(20px)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>إجمالي الرصيد</p>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet style={{ width: '1rem', height: '1rem', color: '#818cf8' }} />
            </div>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{formatCurrency(stats?.balance || 0)}</p>
        </div>

        {/* Income */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', filter: 'blur(20px)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>الدخل هذا الشهر</p>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowUpRight style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
            </div>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(stats?.totalIncome || 0)}</p>
        </div>

        {/* Expenses */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', filter: 'blur(20px)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>المصروفات هذا الشهر</p>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowDownRight style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
            </div>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(stats?.totalExpenses || 0)}</p>
        </div>
      </div>

      {/* Bottom 2 panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Transactions */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(45,45,94,0.8)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity style={{ width: '1.1rem', height: '1.1rem', color: '#818cf8', flexShrink: 0 }} />
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>أحدث المعاملات</h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {recentTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0', fontSize: '0.875rem' }}>لا توجد معاملات حديثة</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentTransactions.map((tx) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', borderRadius: '12px', background: 'rgba(30,30,60,0.5)', border: '1px solid rgba(45,45,94,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tx.type === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                        {tx.type === 'income'
                          ? <ArrowUpRight style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                          : <ArrowDownRight style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.125rem' }}>{tx.description || tx.category}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(tx.date).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: tx.type === 'income' ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(45,45,94,0.8)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard style={{ width: '1.1rem', height: '1.1rem', color: '#ec4899', flexShrink: 0 }} />
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>توزيع المصروفات</h3>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {Object.keys(stats?.categoryBreakdown || {}).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0', fontSize: '0.875rem' }}>لا توجد بيانات مصروفات</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(stats?.categoryBreakdown || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([category, amount]) => {
                    const total = stats?.totalExpenses || 1;
                    const pct = Math.round((amount / total) * 100);
                    return (
                      <div key={category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{category}</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{formatCurrency(amount)}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#1e1e3f', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                        </div>
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
