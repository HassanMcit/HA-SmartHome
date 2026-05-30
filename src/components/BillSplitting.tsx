'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
import {
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  name: string;
  amount: number;
  isManual: boolean;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
];

const WHATSAPP_SVG = (
  <svg
    aria-hidden="true"
    className="w-5 h-5 fill-current shrink-0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24 1.744 17.837C.703 16.033.156 13.988.157 11.891.16 5.348 5.497.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.57 1.977 14.1 1.953 12.006 1.953c-5.437 0-9.865 4.371-9.869 9.802-.001 1.736.48 3.425 1.396 4.87l-.997 3.637 3.737-.974zm10.59-5.457c-.3-.15-1.782-.88-2.062-.982-.28-.102-.48-.15-.68.15-.2.3-.782.982-.962 1.183-.18.2-.36.225-.66.075-.3-.15-1.272-.47-2.423-1.496-.895-.8-1.5-1.785-1.68-2.085-.18-.3-.02-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.68-1.643-.933-2.253-.247-.597-.497-.514-.68-.523-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.272.496 1.705.635.717.227 1.37.195 1.884.118.574-.086 1.78-.727 2.03-1.43.25-.702.25-1.3.175-1.43-.075-.13-.275-.205-.575-.355z" />
  </svg>
);

// ─── Utility ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const initials = (name: string, fallback: string) => {
  const s = name.trim() || fallback;
  return s.charAt(0).toUpperCase();
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryBar({
  total,
  count,
  perPerson,
}: {
  total: number;
  count: number;
  perPerson: number;
}) {
  if (total <= 0) return null;
  return (
    <div
      className="
        flex items-center justify-between gap-3 px-4 py-3 mb-4
        rounded-2xl
        bg-gradient-to-l from-emerald-500/10 to-emerald-500/5
        border border-emerald-500/20
        transition-all duration-500
      "
    >
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest">
          الإجمالي
        </span>
        <span className="text-lg font-extrabold text-emerald-400 leading-tight tabular-nums">
          {fmt(total)}
          <span className="text-xs font-bold mr-1 opacity-70">ج.م</span>
        </span>
      </div>

      <div className="w-px h-8 bg-emerald-500/20 self-center" />

      <div className="flex flex-col items-center">
        <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest">
          عدد الأشخاص
        </span>
        <span className="text-lg font-extrabold text-emerald-400 leading-tight tabular-nums">
          {count}
        </span>
      </div>

      <div className="w-px h-8 bg-emerald-500/20 self-center" />

      <div className="flex flex-col items-end">
        <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest">
          نصيب الفرد
        </span>
        <span className="text-lg font-extrabold text-emerald-400 leading-tight tabular-nums">
          {fmt(perPerson)}
          <span className="text-xs font-bold mr-1 opacity-70">ج.م</span>
        </span>
      </div>
    </div>
  );
}

function ParticipantRow({
  participant,
  index,
  onNameChange,
  onAmountChange,
  onToggleLock,
  onRemove,
  canRemove,
}: {
  participant: Participant;
  index: number;
  onNameChange: (id: string, name: string) => void;
  onAmountChange: (id: string, val: string) => void;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const nameInputId = useId();
  const amountInputId = useId();
  const fallback = `شخص ${index + 1}`;

  return (
    <div
      className={`
        group flex items-center gap-2 px-3 py-2.5 rounded-2xl border
        transition-all duration-300 ease-out
        ${participant.isManual
          ? 'border-violet-500/40 bg-violet-500/5 shadow-[0_0_0_1px_rgba(139,92,246,0.15)]'
          : 'border-transparent bg-white/[0.04] hover:bg-white/[0.07]'
        }
      `}
    >
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-xl flex items-center justify-center
          text-white text-xs font-extrabold shrink-0 select-none
          ${participant.color}
        `}
      >
        {initials(participant.name, fallback)}
      </div>

      {/* Name Input */}
      <input
        id={nameInputId}
        type="text"
        dir="rtl"
        placeholder={fallback}
        value={participant.name}
        onChange={(e) => onNameChange(participant.id, e.target.value)}
        className="
          flex-1 min-w-0 h-9 px-3 rounded-xl border text-sm font-semibold
          bg-white/5 border-white/10 text-white placeholder:text-white/30
          focus:outline-none focus:border-emerald-500/50 focus:bg-white/8
          transition-all duration-200
        "
      />

      {/* Amount + Lock */}
      <div className="relative w-28 shrink-0">
        <input
          id={amountInputId}
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={participant.amount > 0 ? participant.amount : ''}
          onChange={(e) => onAmountChange(participant.id, e.target.value)}
          className={`
            w-full h-9 pl-7 pr-2 rounded-xl border text-xs font-extrabold
            focus:outline-none transition-all duration-200 tabular-nums text-left
            ${participant.isManual
              ? 'bg-violet-500/10 border-violet-500/40 text-violet-300 focus:border-violet-400'
              : 'bg-white/5 border-white/10 text-white/80 focus:border-emerald-500/50'
            }
          `}
        />
        <button
          onClick={() => onToggleLock(participant.id)}
          aria-label={participant.isManual ? 'فك القفل' : 'قفل المبلغ'}
          className="
            absolute left-2 top-1/2 -translate-y-1/2
            transition-all duration-200
            hover:scale-110 active:scale-95
          "
        >
          {participant.isManual ? (
            <Lock className="w-3.5 h-3.5 text-violet-400" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60" />
          )}
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(participant.id)}
        disabled={!canRemove}
        aria-label="إزالة المشارك"
        className="
          w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          border border-white/10 text-white/30
          hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400
          disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent
          disabled:hover:border-white/10 disabled:hover:text-white/30
          transition-all duration-200 active:scale-95
        "
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillSplitting() {
  const [billTitle, setBillTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'أنا', amount: 0, isManual: false, color: AVATAR_COLORS[0] },
    { id: '2', name: 'أحمد', amount: 0, isManual: false, color: AVATAR_COLORS[1] },
    { id: '3', name: 'محمد', amount: 0, isManual: false, color: AVATAR_COLORS[2] },
  ]);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Recalculate splits ──────────────────────────────────────────────────────

  const recalculate = (list: Participant[], total: number): Participant[] => {
    if (total <= 0) return list.map((p) => ({ ...p, amount: 0 }));

    const locked = list.filter((p) => p.isManual);
    const free = list.filter((p) => !p.isManual);
    const lockedSum = locked.reduce((s, p) => s + p.amount, 0);
    const remaining = total - lockedSum;

    if (free.length === 0) return list;
    const share = remaining <= 0 ? 0 : Math.round((remaining / free.length) * 100) / 100;

    return list.map((p) => (p.isManual ? p : { ...p, amount: share }));
  };

  useEffect(() => {
    setParticipants((prev) => recalculate(prev, totalAmount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleTotalChange = (val: string) => {
    const n = parseFloat(val);
    setTotalAmount(isNaN(n) ? 0 : n);
  };

  const handleAddParticipant = () => {
    const newId = `${Date.now()}`;
    const colorIdx = participants.length % AVATAR_COLORS.length;
    const newP: Participant = {
      id: newId,
      name: '',
      amount: 0,
      isManual: false,
      color: AVATAR_COLORS[colorIdx],
    };
    const updated = recalculate([...participants, newP], totalAmount);
    setParticipants(updated);

    // Scroll the list to bottom after add
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const handleRemove = (id: string) => {
    if (participants.length <= 1) {
      toast.error('يجب أن يبقى مشارك واحد على الأقل.');
      return;
    }
    const updated = recalculate(
      participants.filter((p) => p.id !== id),
      totalAmount
    );
    setParticipants(updated);
  };

  const handleNameChange = (id: string, name: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleAmountChange = (id: string, val: string) => {
    const num = parseFloat(val);
    const amount = isNaN(num) ? 0 : num;
    const updated = recalculate(
      participants.map((p) => (p.id === id ? { ...p, amount, isManual: true } : p)),
      totalAmount
    );
    setParticipants(updated);
  };

  const handleToggleLock = (id: string) => {
    const updated = recalculate(
      participants.map((p) => (p.id === id ? { ...p, isManual: !p.isManual } : p)),
      totalAmount
    );
    setParticipants(updated);
  };

  const handleResetSplits = () => {
    const reset = participants.map((p) => ({ ...p, isManual: false }));
    setParticipants(recalculate(reset, totalAmount));
    toast.success('تمت إعادة التقسيم بالتساوي ✓');
  };

  // ── Sharing ─────────────────────────────────────────────────────────────────

  const buildShareText = () => {
    const title = billTitle.trim() || 'حسبة مشتركة';
    const lines: string[] = [
      `💸 *شيل معايا — ${title}*`,
      ``,
      `💰 الإجمالي: *${fmt(totalAmount)} ج.م*`,
      `👥 عدد الأشخاص: ${participants.length}`,
      ``,
      `──────────────`,
    ];
    participants.forEach((p, i) => {
      const name = p.name.trim() || `شخص ${i + 1}`;
      lines.push(`👤 ${name}: *${fmt(p.amount)} ج.م*`);
    });
    lines.push(`──────────────`);
    lines.push(`💡 احسبها صح مع تطبيق *مدبّر* 🚀`);
    return encodeURIComponent(lines.join('\n'));
  };

  const handleShareWhatsApp = () => {
    if (totalAmount <= 0) {
      toast.error('حدد المبلغ الإجمالي أولاً.');
      return;
    }
    if (isOverallocated) {
      toast.error('المبالغ اليدوية تتجاوز الإجمالي — راجع التقسيم.');
      return;
    }
    setIsSharing(true);
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?text=${buildShareText()}`, '_blank');
      setIsSharing(false);
      toast.success('جاري فتح واتساب... 🟢');
    }, 600);
  };

  const handleCopy = () => {
    if (totalAmount <= 0) {
      toast.error('حدد المبلغ الإجمالي أولاً.');
      return;
    }
    const title = billTitle.trim() || 'حسبة مشتركة';
    const lines = [`📋 ${title}\nالإجمالي: ${fmt(totalAmount)} ج.م\n`];
    participants.forEach((p, i) => {
      lines.push(`• ${p.name.trim() || `شخص ${i + 1}`}: ${fmt(p.amount)} ج.م`);
    });

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => {
        setCopied(true);
        toast.success('تم نسخ الحسبة! 📋');
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error('فشل نسخ الحسبة.'));
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const lockedSum = participants.filter((p) => p.isManual).reduce((s, p) => s + p.amount, 0);
  const isOverallocated = totalAmount > 0 && lockedSum > totalAmount;
  const hasManual = participants.some((p) => p.isManual);
  const perPerson = participants.length > 0 ? totalAmount / participants.length : 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      dir="rtl"
      className="w-full max-w-md mx-auto px-3 py-6 font-sans"
      style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif" }}
    >
      {/* ── Outer Card ── */}
      <div
        className="
          relative rounded-[28px] overflow-hidden
          border border-white/[0.08]
          shadow-2xl shadow-black/40
          bg-[#0f1117]
        "
      >
        {/* ── Gradient Orbs (decorative) ── */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -top-24 -right-24
            w-64 h-64 rounded-full
            bg-emerald-500/15 blur-3xl
          "
        />
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute -bottom-16 -left-16
            w-48 h-48 rounded-full
            bg-violet-500/10 blur-3xl
          "
        />

        {/* ── Inner Padding ── */}
        <div className="relative z-10 p-5">

          {/* ─── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="
                w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center
                bg-emerald-500/15 border border-emerald-500/20
                shadow-[0_0_16px_rgba(16,185,129,0.15)]
              "
            >
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-white leading-tight truncate">
                قسّم الفاتورة
                <span className="mr-1.5 text-emerald-400">شيل معايا</span>
              </h2>
              <p className="text-[11px] text-white/40 leading-snug mt-0.5 truncate">
                احسبها صح وابعت اللينك لصحابك على الواتساب
              </p>
            </div>
            <div
              className="
                px-2.5 py-1 rounded-full text-[10px] font-bold
                bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                whitespace-nowrap
              "
            >
              {participants.length} أشخاص
            </div>
          </div>

          {/* ─── Bill Title ──────────────────────────────────────────────────── */}
          <div className="mb-3">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
              اسم الفاتورة
            </label>
            <div className="relative">
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: خروجة القهوة، إيجار الشقة..."
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                className="
                  w-full h-12 pr-4 pl-10 rounded-2xl
                  bg-white/[0.05] border border-white/[0.09]
                  text-white text-sm font-semibold placeholder:text-white/25
                  focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07]
                  transition-all duration-200
                "
              />
              <FileText
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none"
              />
            </div>
          </div>

          {/* ─── Total Amount ─────────────────────────────────────────────────── */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
              المبلغ الإجمالي
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={totalAmount > 0 ? totalAmount : ''}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="
                  w-full h-16 pl-20 pr-4 rounded-2xl
                  bg-white/[0.05] border border-white/[0.09]
                  text-white text-3xl font-extrabold placeholder:text-white/20 placeholder:text-xl
                  focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.07]
                  focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]
                  transition-all duration-200 tabular-nums text-right
                "
              />
              <div
                className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  px-2.5 py-1 rounded-xl
                  bg-white/[0.08] border border-white/[0.12]
                  text-white/70 text-xs font-black tracking-tight whitespace-nowrap
                "
              >
                ج.م
              </div>
            </div>
          </div>

          {/* ─── Summary Bar ──────────────────────────────────────────────────── */}
          <SummaryBar
            total={totalAmount}
            count={participants.length}
            perPerson={perPerson}
          />

          {/* ─── Participants Section ─────────────────────────────────────────── */}
          <div className="mb-4">
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/70">المشاركون</span>
              {hasManual && (
                <button
                  onClick={handleResetSplits}
                  className="
                    flex items-center gap-1.5 text-[11px] font-bold
                    text-violet-400 hover:text-violet-300
                    transition-colors duration-150
                  "
                >
                  <RefreshCw className="w-3 h-3" />
                  إعادة تقسيم بالتساوي
                </button>
              )}
            </div>

            {/* Over-allocation warning */}
            {isOverallocated && (
              <div
                className="
                  flex items-start gap-2.5 p-3 mb-3 rounded-xl
                  bg-red-500/10 border border-red-500/25
                  text-red-400 text-xs font-semibold leading-relaxed
                "
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>المبالغ اليدوية ({fmt(lockedSum)} ج.م) تتجاوز الإجمالي!</span>
              </div>
            )}

            {/* Participant rows */}
            <div
              ref={listRef}
              className="space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pl-0.5"
            >
              {participants.map((p, idx) => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  index={idx}
                  onNameChange={handleNameChange}
                  onAmountChange={handleAmountChange}
                  onToggleLock={handleToggleLock}
                  onRemove={handleRemove}
                  canRemove={participants.length > 1}
                />
              ))}
            </div>

            {/* Add Person Button */}
            <button
              onClick={handleAddParticipant}
              className="
                w-full mt-2.5 h-11 rounded-2xl
                border border-dashed border-white/15
                flex items-center justify-center gap-2
                text-sm font-bold text-white/50
                hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              <UserPlus className="w-4 h-4" />
              + أضف شخص
            </button>
          </div>

          {/* ─── Divider ──────────────────────────────────────────────────────── */}
          <div className="h-px bg-white/[0.06] my-4" />

          {/* ─── CTA Buttons ──────────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* WhatsApp Share — Primary CTA */}
            <button
              id="btn-share-whatsapp"
              onClick={handleShareWhatsApp}
              disabled={totalAmount <= 0 || isOverallocated || isSharing}
              className={`
                relative w-full h-14 rounded-2xl
                flex items-center justify-center gap-2.5
                text-sm font-extrabold text-white
                overflow-hidden
                transition-all duration-300
                ${totalAmount <= 0 || isOverallocated
                  ? 'bg-white/10 opacity-40 cursor-not-allowed'
                  : `
                    bg-[#25D366] hover:bg-[#1fb855]
                    shadow-[0_4px_24px_rgba(37,211,102,0.30)]
                    hover:shadow-[0_4px_32px_rgba(37,211,102,0.45)]
                    active:scale-[0.98]
                    cursor-pointer
                  `
                }
              `}
            >
              {/* Shimmer layer */}
              {!isSharing && totalAmount > 0 && !isOverallocated && (
                <span
                  aria-hidden="true"
                  className="
                    absolute inset-0
                    bg-gradient-to-l from-white/0 via-white/10 to-white/0
                    translate-x-[-100%]
                    animate-[shimmer_2.5s_infinite]
                    pointer-events-none
                  "
                />
              )}
              {isSharing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                WHATSAPP_SVG
              )}
              <span>{isSharing ? 'جاري الإرسال...' : 'شارك الحسبة على واتساب'}</span>
              {!isSharing && totalAmount > 0 && (
                <Sparkles className="w-4 h-4 text-white/60" />
              )}
            </button>

            {/* Copy Text — Secondary CTA */}
            <button
              id="btn-copy-summary"
              onClick={handleCopy}
              disabled={totalAmount <= 0}
              className="
                w-full h-12 rounded-2xl
                flex items-center justify-center gap-2
                text-sm font-bold
                bg-white/[0.05] border border-white/[0.1]
                text-white/70 hover:text-white hover:bg-white/[0.09] hover:border-white/20
                disabled:opacity-30 disabled:cursor-not-allowed
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
              <span>{copied ? 'تم النسخ بنجاح ✓' : 'نسخ الحسبة كنص'}</span>
            </button>
          </div>

          {/* ─── Footer Note ──────────────────────────────────────────────────── */}
          <p className="mt-4 text-center text-[10px] text-white/25 leading-relaxed">
            المبالغ تُحسب تلقائياً بالتساوي • اضغط 🔒 لتثبيت مبلغ يدوياً
          </p>
        </div>
      </div>

      {/* ── Shimmer keyframe (injected inline for portability) ── */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
