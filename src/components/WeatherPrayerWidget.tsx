'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunset, Moon, Droplets, Wind, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌆',
  Isha: '🌃',
};

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'صافٍ', icon: '☀️' },
  1: { label: 'صافٍ غالباً', icon: '🌤️' },
  2: { label: 'غائم جزئياً', icon: '⛅' },
  3: { label: 'غائم', icon: '☁️' },
  45: { label: 'ضباب', icon: '🌫️' },
  51: { label: 'رذاذ', icon: '🌦️' },
  61: { label: 'مطر', icon: '🌧️' },
  71: { label: 'ثلج', icon: '❄️' },
  80: { label: 'زخات مطر', icon: '🌦️' },
  95: { label: 'عاصفة رعدية', icon: '⛈️' },
};

function getWeatherInfo(code?: number) {
  if (!code && code !== 0) return { label: '—', icon: '🌡️' };
  return WMO_CODES[code] || { label: 'متغير', icon: '🌥️' };
}

function to12hr(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr);
  const suffix = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${suffix}`;
}

function getNextPrayer(times: PrayerTimes): string | null {
  const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const key of order) {
    const [h, m] = (times[key as keyof PrayerTimes] || '').split(':').map(Number);
    const pMins = h * 60 + m;
    if (pMins > nowMins) return key;
  }
  return 'Fajr'; // Next day
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WeatherPrayerWidget() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [city, setCity] = useState<string>('القاهرة');
  const [loadingW, setLoadingW] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch weather + prayer by geolocation (fallback → Cairo)
  useEffect(() => {
    const fetchAll = async (lat: number, lon: number) => {
      // ── Weather (Open-Meteo, no key needed) ───────────────────────
      try {
        const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,weathercode&timezone=auto&forecast_days=1`;
        const wRes = await fetch(wUrl);
        const wData = await wRes.json();

        const temps: number[] = wData.hourly.temperature_2m;
        const humid: number[] = wData.hourly.relative_humidity_2m;
        const wind: number[] = wData.hourly.windspeed_10m;
        const codes: number[] = wData.hourly.weathercode;
        const currentHour = new Date().getHours();

        setWeather({
          morningTemp: Math.round(temps[6] ?? temps[0]),   // 6 AM
          eveningTemp: Math.round(temps[18] ?? temps[12]),  // 6 PM
          currentTemp: Math.round(temps[currentHour] ?? temps[0]),
          humidity: Math.round(humid[currentHour] ?? humid[0]),
          windspeed: Math.round(wind[currentHour] ?? wind[0]),
          weatherCode: codes[currentHour] ?? codes[0],
        });
      } catch {
        console.error('Weather fetch failed');
      } finally {
        setLoadingW(false);
      }

      // ── Prayer times (Aladhan, no key needed) ─────────────────────
      try {
        const pRes = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`
        );
        const pData = await pRes.json();
        if (pData.data?.timings) {
          const t = pData.data.timings;
          setPrayers({
            Fajr: t.Fajr,
            Sunrise: t.Sunrise,
            Dhuhr: t.Dhuhr,
            Asr: t.Asr,
            Maghrib: t.Maghrib,
            Isha: t.Isha,
          });
        }
      } catch {
        console.error('Prayer fetch failed');
      } finally {
        setLoadingP(false);
      }
    };

    // Try geolocation first, fallback to Cairo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode for city name
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geoData = await geoRes.json();
            const c = geoData.address?.city || geoData.address?.town || geoData.address?.county || 'موقعك';
            setCity(c);
          } catch { /* keep default */ }
          fetchAll(latitude, longitude);
        },
        () => fetchAll(30.0626, 31.2497) // Cairo fallback
      );
    } else {
      fetchAll(30.0626, 31.2497);
    }
  }, []);

  const nextPrayer = prayers ? getNextPrayer(prayers) : null;
  const weatherInfo = getWeatherInfo(weather?.weatherCode);
  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Clock + Weather ─────────────────────────────────────── */}
      <div className="glass-card p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clock */}
        <div className="text-center">
          <div
            className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums', direction: 'ltr' }}
          >
            {timeStr}
          </div>
          <p className="text-slate-400 text-sm font-medium mt-1">{dateStr}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-slate-500 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{city}</span>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Weather */}
        {loadingW ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : weather ? (
          <div className="flex flex-col gap-4">
            {/* Current */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{weather.currentTemp}°</span>
                  <span className="text-slate-400 text-sm font-bold">الآن</span>
                </div>
                <p className="text-slate-400 text-sm font-medium mt-0.5">
                  {weatherInfo.icon} {weatherInfo.label}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium items-end">
                {weather.humidity !== undefined && (
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    رطوبة {weather.humidity}%
                  </span>
                )}
                {weather.windspeed !== undefined && (
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-400" />
                    رياح {weather.windspeed} km/h
                  </span>
                )}
              </div>
            </div>

            {/* Morning / Evening */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-2xl p-4 flex flex-col items-center gap-1">
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">الصباح</span>
                <span className="text-2xl font-black text-amber-400">{weather.morningTemp}°</span>
              </div>
              <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-2xl p-4 flex flex-col items-center gap-1">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">المساء</span>
                <span className="text-2xl font-black text-indigo-400">{weather.eveningTemp}°</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm">تعذّر تحميل بيانات الطقس</p>
        )}
      </div>

      {/* ── Prayer Times ────────────────────────────────────────── */}
      <div className="glass-card p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-lg">مواقيت الصلاة</h3>
          {nextPrayer && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 animate-pulse">
              القادم: {PRAYER_NAMES[nextPrayer]}
            </span>
          )}
        </div>

        {loadingP ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : prayers ? (
          <div className="flex flex-col gap-2">
            {prayerOrder.map((key) => {
              const isNext = key === nextPrayer;
              return (
                <div
                  key={key}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-2xl transition-all',
                    isNext
                      ? 'bg-emerald-500/15 border border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                      : 'bg-white/3 border border-white/5 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{PRAYER_ICONS[key]}</span>
                    <span className={cn(
                      'font-bold text-sm',
                      isNext ? 'text-emerald-400' : 'text-slate-300'
                    )}>
                      {PRAYER_NAMES[key]}
                    </span>
                    {isNext && (
                      <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">
                        التالية
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'font-black text-sm tabular-nums',
                    isNext ? 'text-white' : 'text-slate-400'
                  )} dir="ltr">
                    {to12hr(prayers[key as keyof PrayerTimes])}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-8">تعذّر تحميل مواقيت الصلاة</p>
        )}
      </div>
    </div>
  );
}
