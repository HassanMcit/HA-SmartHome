'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Droplets, Wind, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherData {
  morningTemp: number;
  eveningTemp: number;
  currentTemp: number;
  humidity?: number;
  windspeed?: number;
  weatherCode?: number;
}

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_LABELS: Record<string, { ar: string; en: string }> = {
  Fajr:    { ar: 'الفجر',   en: 'Fajr' },
  Sunrise: { ar: 'الشروق',  en: 'Sunrise' },
  Dhuhr:   { ar: 'الظهر',   en: 'Dhuhr' },
  Asr:     { ar: 'العصر',   en: 'Asr' },
  Maghrib: { ar: 'المغرب',  en: 'Maghrib' },
  Isha:    { ar: 'العشاء',  en: 'Isha' },
};

const PRAYERS = [
  { key: 'Fajr',    icon: '🌙' },
  { key: 'Sunrise', icon: '🌅' },
  { key: 'Dhuhr',   icon: '☀️'  },
  { key: 'Asr',     icon: '🌤️' },
  { key: 'Maghrib', icon: '🌆' },
  { key: 'Isha',    icon: '🌃' },
];

const WMO_LABELS: Record<number, { ar: string; en: string; icon: string }> = {
  0:  { ar: 'صافٍ',          en: 'Clear',            icon: '☀️'  },
  1:  { ar: 'صافٍ غالباً',   en: 'Mostly Clear',     icon: '🌤️' },
  2:  { ar: 'غائم جزئياً',   en: 'Partly Cloudy',    icon: '⛅'  },
  3:  { ar: 'غائم',          en: 'Cloudy',           icon: '☁️'  },
  45: { ar: 'ضباب',          en: 'Foggy',            icon: '🌫️' },
  61: { ar: 'مطر',           en: 'Rainy',            icon: '🌧️' },
  80: { ar: 'زخات مطر',      en: 'Rain Showers',     icon: '🌦️' },
  95: { ar: 'عاصفة رعدية',  en: 'Thunderstorm',     icon: '⛈️'  },
};

function weatherInfo(code?: number, lang: 'ar' | 'en' = 'ar') {
  if (code === undefined) return { label: '—', icon: '🌡️' };
  const match = WMO_LABELS[code];
  if (!match) return { label: lang === 'ar' ? 'متغير' : 'Variable', icon: '🌥️' };
  return { label: lang === 'ar' ? match.ar : match.en, icon: match.icon };
}

function to12hr(t: string, lang: 'ar' | 'en' = 'ar') {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 
    ? (lang === 'ar' ? 'م' : 'PM') 
    : (lang === 'ar' ? 'ص' : 'AM');
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function getNextPrayer(times: PrayerTimes) {
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  for (const { key } of PRAYERS) {
    const [h, m] = (times[key as keyof PrayerTimes] ?? '').split(':').map(Number);
    if (h * 60 + m > nowMins) return key;
  }
  return 'Fajr';
}

export default function WeatherPrayerWidget() {
  const { lang } = useLanguage();
  const [now, setNow]       = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [city, setCity]     = useState('القاهرة');
  const [loadingW, setLW]   = useState(true);
  const [loadingP, setLP]   = useState(true);

  // Clock — update every minute (no seconds)
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const ms = (60 - new Date().getSeconds()) * 1000;
    const first = setTimeout(() => { tick(); setInterval(tick, 60_000); }, ms);
    return () => clearTimeout(first);
  }, []);

  useEffect(() => {
    const fetchAll = async (lat: number, lon: number) => {
      // Weather
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,weathercode&timezone=auto&forecast_days=1`
        );
        const d = await r.json();
        const hr = new Date().getHours();
        setWeather({
          morningTemp: Math.round(d.hourly.temperature_2m[6]  ?? d.hourly.temperature_2m[0]),
          eveningTemp: Math.round(d.hourly.temperature_2m[18] ?? d.hourly.temperature_2m[12]),
          currentTemp: Math.round(d.hourly.temperature_2m[hr] ?? d.hourly.temperature_2m[0]),
          humidity:    Math.round(d.hourly.relative_humidity_2m[hr]  ?? 0),
          windspeed:   Math.round(d.hourly.windspeed_10m[hr]         ?? 0),
          weatherCode: d.hourly.weathercode[hr] ?? d.hourly.weathercode[0],
        });
      } catch { /* silent */ } finally { setLW(false); }

      // Prayer
      try {
        const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`);
        const d = await r.json();
        if (d.data?.timings) {
          const t = d.data.timings;
          setPrayers({ Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
        }
      } catch { /* silent */ } finally { setLP(false); }
    };

    const Cairo = [30.0626, 31.2497] as const;
    if (!navigator.geolocation) { fetchAll(...Cairo); return; }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const g = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const gd = await g.json();
          setCity(gd.address?.city || gd.address?.town || gd.address?.county || 'موقعك');
        } catch { /* keep default */ }
        fetchAll(latitude, longitude);
      },
      () => fetchAll(...Cairo)
    );
  }, []);

  const nextPrayer = prayers ? getNextPrayer(prayers) : null;
  const wInfo      = weatherInfo(weather?.weatherCode, lang);

  const clockStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr  = now.toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const cityDisplayName = city === 'القاهرة' 
    ? (lang === 'ar' ? 'القاهرة' : 'Cairo')
    : city === 'موقعك'
      ? (lang === 'ar' ? 'موقعك' : 'Your Location')
      : city;

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col gap-6">

      {/* ── Row 1: Clock + Weather ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

        {/* Clock */}
        <div className={`text-center flex-1 ${lang === 'ar' ? 'sm:text-right' : 'sm:text-left'}`}>
          <div className="text-5xl sm:text-6xl font-black text-white tabular-nums tracking-tight leading-none" dir="ltr">
            {clockStr}
          </div>
          <p className="text-slate-400 text-sm font-medium mt-1.5">{dateStr}</p>
          <div className={`flex items-center justify-center gap-1 mt-1 text-slate-500 text-xs ${lang === 'ar' ? 'sm:justify-start' : 'sm:justify-end'}`}>
            <MapPin className="w-3 h-3" />
            <span>{cityDisplayName}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-20 bg-white/5" />
        <div className="block sm:hidden w-full h-px bg-white/5" />

        {/* Weather */}
        {loadingW ? (
          <div className="flex-1 flex justify-center"><div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /></div>
        ) : weather ? (
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
            {/* Current */}
            <div className="flex flex-col items-center gap-1 min-w-[90px]">
              <span className="text-4xl font-black text-white">{weather.currentTemp}°C</span>
              <span className="text-slate-400 text-sm">{wInfo.icon} {wInfo.label}</span>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {weather.humidity !== undefined && (
                  <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3 text-blue-400" />{weather.humidity}%</span>
                )}
                {weather.windspeed !== undefined && (
                  <span className="flex items-center gap-0.5"><Wind className="w-3 h-3" />{weather.windspeed}{lang === 'ar' ? 'كم/س' : 'km/h'}</span>
                )}
              </div>
            </div>

            {/* Morning / Evening */}
            <div className="flex gap-3">
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-2xl px-4 py-3 flex flex-col items-center gap-0.5 min-w-[72px]">
                <Sun className="w-4 h-4 text-amber-400 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'صباحاً' : 'Morning'}</span>
                <span className="text-xl font-black text-amber-400">{weather.morningTemp}°</span>
              </div>
              <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-2xl px-4 py-3 flex flex-col items-center gap-0.5 min-w-[72px]">
                <Moon className="w-4 h-4 text-indigo-400 mb-0.5" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'مساءً' : 'Evening'}</span>
                <span className="text-xl font-black text-indigo-400">{weather.eveningTemp}°</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-center text-slate-500 text-sm">{lang === 'ar' ? 'تعذّر تحميل الطقس' : 'Failed to load weather'}</div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* ── Row 2: Prayer Times (grid 3×2) ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مواقيت الصلاة' : 'Prayer Times'}</h3>
          {nextPrayer && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              {lang === 'ar' ? 'القادمة:' : 'Next:'} {PRAYER_LABELS[nextPrayer]?.[lang] || nextPrayer}
            </span>
          )}
        </div>

        {loadingP ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : prayers ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {PRAYERS.map(({ key, icon }) => {
              const isNext = key === nextPrayer;
              const label = PRAYER_LABELS[key]?.[lang] || key;
              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 transition-all',
                    isNext
                      ? 'bg-emerald-500/15 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 scale-105'
                      : 'bg-white/3 border border-white/5 hover:bg-white/5'
                  )}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className={cn('text-[11px] font-bold', isNext ? 'text-emerald-400' : 'text-slate-400')}>{label}</span>
                  <span className={cn('text-xs font-black tabular-nums', isNext ? 'text-white' : 'text-slate-300')} dir="ltr">
                    {to12hr(prayers[key as keyof PrayerTimes], lang)}
                  </span>
                  {isNext && <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-md leading-none">{lang === 'ar' ? 'التالية' : 'Next'}</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-4">{lang === 'ar' ? 'تعذّر تحميل مواقيت الصلاة' : 'Failed to load prayer times'}</p>
        )}
      </div>
    </div>
  );
}
