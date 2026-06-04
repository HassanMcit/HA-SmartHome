import BillSplitting from '@/components/BillSplitting';
import Link from 'next/link';
import { Sparkles, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'شيل معايا — تقسيم الفواتير | مدبّر',
  description: 'قسّم الفاتورة على أصحابك في ثواني وابعت الحسبة على واتساب',
};

export default function PublicSplitPage() {
  return (
    <div className="min-h-screen py-10 flex flex-col items-center justify-start gap-8" style={{ background: '#0f0f23' }}>
      
      {/* Main Calculator */}
      <BillSplitting />

      {/* Premium CTA Card to sign up/login */}
      <div dir="rtl" className="w-full max-w-md px-3">
        <div 
          className="relative rounded-[28px] overflow-hidden border p-6 text-right transition-all duration-300 hover:shadow-2xl"
          style={{
            background: 'rgba(30, 27, 75, 0.4)',
            borderColor: 'rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Subtle orb background */}
          <div
            className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ background: '#6366f1' }}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">أدر أموالك بذكاء مع تطبيق مدبّر 🏠💰</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">المنصة المتكاملة لإدارة ميزانيتك ومصاريفك العائلية</p>
            </div>
          </div>

          {/* Features bullet list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">تنظيم الميزانية والمصاريف بسهولة</p>
                <p className="text-[10px] text-slate-400">تتبع دخل ومصاريف منزلك بضغطة زر وشوف إحصائيات دقيقة لفلوسك راحت فين.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">مشاركة الميزانية مع أفراد العائلة</p>
                <p className="text-[10px] text-slate-400">اعمل ميزانية مشتركة وادعو زوجتك أو أفراد بيتك لمتابعة المصاريف والمدخرات معاً.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">أمن وحماية وذكاء مالي</p>
                <p className="text-[10px] text-slate-400">بياناتك مشفرة بالكامل لمساعدتك في تحقيق أهدافك المالية والادخار بشكل أسهل.</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2.5">
            <Link 
              href="/register" 
              className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 flex items-center justify-center gap-2 text-xs font-extrabold text-white hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-md shadow-sky-500/10"
            >
              <span>أنشئ حسابك مجاناً الآن</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
            
            <Link 
              href="/login" 
              className="w-full h-10 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center text-xs font-bold text-slate-300 transition-all duration-200"
            >
              <span>لديك حساب بالفعل؟ سجل دخولك</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
