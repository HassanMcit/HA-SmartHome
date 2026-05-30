import BillSplitting from '@/components/BillSplitting';

export const metadata = {
  title: 'شيل معايا — تقسيم الفواتير | مدبّر',
  description: 'قسّم الفاتورة على أصحابك في ثواني وابعت الحسبة على واتساب',
};

export default function PublicSplitPage() {
  return (
    <div className="min-h-screen py-10" style={{ background: '#0f0f23' }}>
      <BillSplitting />
    </div>
  );
}
