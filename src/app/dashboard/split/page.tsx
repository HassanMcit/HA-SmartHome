import BillSplitting from '@/components/BillSplitting';

export const metadata = {
  title: 'شيل معايا — تقسيم الفواتير | مدبّر',
  description: 'قسّم الفاتورة على أصحابك في ثواني وابعت الحسبة على واتساب',
};

export default function SplitPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <BillSplitting />
    </div>
  );
}
