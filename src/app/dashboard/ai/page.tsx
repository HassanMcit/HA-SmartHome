'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiApi, AIAnalysis, formatCurrency } from '@/lib/api';
import { Sparkles, BrainCircuit, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPage() {
  const { lang } = useLanguage();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await aiApi.getAnalysis();
      setAnalysis(data);
    } catch {
      setError(true);
      toast.error(lang === 'ar' ? 'حدث خطأ في جلب التحليل' : 'Error fetching analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BrainCircuit style={{ width: 24, height: 24, color: '#818cf8' }} />
            {lang === 'ar' ? 'المستشار الذكي' : 'AI Financial Advisor'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            {lang === 'ar'
              ? 'تحليل ذكي لمصاريفك ونصائح مخصصة للتوفير'
              : 'Smart analysis of your expenses with personalized saving tips'}
          </p>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.4)',
            background: 'transparent', color: '#818cf8',
            fontSize: 14, fontWeight: 600, fontFamily: 'Cairo, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          <RefreshCw style={{ width: 16, height: 16, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {lang === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 256, gap: 16 }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#818cf8', fontSize: 14 }}>
            {lang === 'ar' ? 'جاري تحليل بياناتك المالية...' : 'Analyzing your financial data...'}
          </p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#94a3b8' }}>
          <AlertCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 1.5rem', opacity: 0.8 }} />
          <h3 style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {lang === 'ar' ? 'فشل الاتصال بالذكاء الاصطناعي' : 'AI Connection Failed'}
          </h3>
          <p style={{ fontSize: 14, maxWidth: 350, margin: '0 auto 1.5rem' }}>
            {lang === 'ar'
              ? 'تأكد من صحة مفتاح API وجودة الاتصال بالإنترنت، ثم حاول التحديث مرة أخرى.'
              : 'Check your API key and internet connection, then try refreshing.'}
          </p>
          <button
            onClick={fetchAnalysis}
            style={{
              padding: '8px 24px', borderRadius: 8, border: '1px solid #334155',
              background: '#1e293b', color: '#fff', fontSize: 14, cursor: 'pointer'
            }}
          >
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      ) : analysis && analysis.transactionCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* API Key Warning */}
          {analysis.noApiKey && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertCircle style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                  {lang === 'ar' ? 'وضع المحاكاة' : 'Simulation Mode'}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(253,230,138,0.8)', lineHeight: 1.6 }}>
                  {lang === 'ar'
                    ? 'مفتاح Gemini API غير متوفر في الخادم. يتم عرض نصائح تقريبية بناءً على القواعد الأساسية بدلاً من الذكاء الاصطناعي.'
                    : 'Gemini API key is not available on the server. Approximate tips based on basic rules are shown instead of AI.'}
                </p>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="glass-card" style={{ overflow: 'hidden', position: 'relative' }}>
            {/* top gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

            <div style={{ padding: '1.5rem 1.75rem' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                <Sparkles style={{ width: 20, height: 20, color: '#a78bfa' }} />
                {lang === 'ar' ? `ملخص شهر ${analysis.monthName}` : `Monthly Summary: ${analysis.monthName}`}
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 sm:p-5">
                  <div className="text-xs text-slate-400 mb-2">{lang === 'ar' ? 'الدخل' : 'Income'}</div>
                  <div className="font-bold text-base sm:text-lg text-emerald-500 break-words">{formatCurrency(analysis.totalIncome)}</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 sm:p-5">
                  <div className="text-xs text-slate-400 mb-2">{lang === 'ar' ? 'المصروفات' : 'Expenses'}</div>
                  <div className="font-bold text-base sm:text-lg text-red-500 break-words">{formatCurrency(analysis.totalExpenses)}</div>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 sm:p-5">
                  <div className="text-xs text-slate-400 mb-2">{lang === 'ar' ? 'المتبقي' : 'Balance'}</div>
                  <div className="font-bold text-base sm:text-lg break-words" style={{ color: 'var(--foreground)' }}>{formatCurrency(analysis.balance)}</div>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 sm:p-5">
                  <div className="text-xs text-slate-400 mb-2">{lang === 'ar' ? 'عدد المعاملات' : 'Transactions'}</div>
                  <div className="font-bold text-xl sm:text-2xl text-indigo-400">{analysis.transactionCount}</div>
                </div>
              </div>

              {/* AI Analysis Text */}
              {analysis.aiAnalysis ? (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '1.25rem 1.5rem', lineHeight: 1.8, color: 'var(--foreground)', fontSize: 14, opacity: 0.8 }}>
                  <div dangerouslySetInnerHTML={{
                    __html: analysis.aiAnalysis
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#818cf8">$1</strong>')
                  }} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted-foreground)', fontSize: 14 }}>
                  {lang === 'ar' ? 'جاري معالجة التحليل...' : 'Processing analysis...'}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
          {lang === 'ar' ? 'لا توجد بيانات كافية للتحليل' : 'Not enough data for analysis'}
        </div>
      )}
    </div>
  );
}
