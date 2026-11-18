import React from 'react';
import {
  AirQualityResponse,
  UserProfile,
  AQIStandard,
} from '../types';
import { getCategoryInfo } from '../utils/aqiUtils';
import {
  Wind,
  Droplets,
  Thermometer,
  Compass,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PersonalizedHealthCard } from './PersonalizedHealthCard';

interface DashboardTabProps {
  airData: AirQualityResponse | null;
  isLoading: boolean;
  profile: UserProfile;
  standard: AQIStandard;
  onOpenLocation: () => void;
  onNavigateTab: (tab: string) => void;
  onToggleStandard: (std: AQIStandard) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  airData,
  isLoading,
  profile,
  standard,
  onOpenLocation,
  onNavigateTab,
  onToggleStandard,
}) => {
  if (isLoading && !airData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Retrieving live atmospheric telemetry & smog models...
        </p>
      </div>
    );
  }

  const current = airData?.current;
  const aqiVal = current
    ? standard === 'indian'
      ? current.aqiIndian
      : current.aqiUs
    : 145;

  const category = getCategoryInfo(aqiVal, standard);
  const updatedAt = airData?.updatedAt
    ? new Date(airData.updatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  // Format chart data
  const chartData = (airData?.hourly || []).map((h) => ({
    time: h.hourLabel,
    aqi: h.aqi,
    pm25: h.pm25,
    pm10: h.pm10,
    isForecast: h.isForecast,
  }));

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Hero & Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        {/* Subtle decorative background imagery */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <img
            src="/src/assets/images/hero_clean_atmosphere_1794979521100.jpg"
            alt="Atmospheric view"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Environmental Intelligence</span>
              <span>·</span>
              <span>{updatedAt}</span>
              {airData?.isDemo && (
                <span className="ml-2 px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Simulation Mode
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {getGreeting()}, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Monitoring winter smog dynamics and actionable health guidance for{' '}
              <button
                onClick={onOpenLocation}
                className="font-semibold text-white underline decoration-emerald-400 underline-offset-4 hover:text-emerald-300 transition-colors"
              >
                {airData?.city || 'Selected Metropolis'}
              </button>
              . Current index is categorized as{' '}
              <span className="font-semibold text-emerald-300">{category.label}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Standard Switcher */}
            <div className="p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center gap-1">
              <button
                onClick={() => onToggleStandard('indian')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  standard === 'indian'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Indian CPCB
              </button>
              <button
                onClick={() => onToggleStandard('us')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  standard === 'us'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                US EPA
              </button>
            </div>

            <button
              onClick={() => onNavigateTab('assistant')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Companion</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Prominent AQI & Core Atmospheric Measurements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main AQI Gauge Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Air Quality Index ({standard === 'indian' ? 'CPCB NAQI' : 'US EPA'})
                </span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${category.badgeBg} ${category.badgeText}`}>
                {category.label}
              </span>
            </div>

            {/* Circular Indicator Visual */}
            <div className="flex items-center justify-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Radial Meter */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (Math.min(aqiVal, 500) / 500) * 264}
                    strokeLinecap="round"
                    className={`${category.colorClass} transition-all duration-1000 ease-out`}
                    fill="none"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {aqiVal}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Primary: {current?.primaryPollutant || 'PM2.5'}
                  </span>
                  <span className={`text-xs font-semibold mt-0.5 ${category.colorClass}`}>
                    {category.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {category.advisories.general}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Standard Scale: 0 – 500</span>
              <button
                onClick={() => onNavigateTab('assistant')}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>Health impact details</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Pollutants & Weather telemetry */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Key Pollutant Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* PM2.5 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PM2.5 Fine Soot</span>
                <span className="text-[10px] text-slate-400 font-mono">WHO: 15</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.pm25 ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.pm25 ?? 0) / 150) * 100)}%` }}
                />
              </div>
            </div>

            {/* PM10 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PM10 Coarse Dust</span>
                <span className="text-[10px] text-slate-400 font-mono">WHO: 45</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.pm10 ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.pm10 ?? 0) / 250) * 100)}%` }}
                />
              </div>
            </div>

            {/* Nitrogen Dioxide NO2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">NO2 Traffic</span>
                <span className="text-[10px] text-slate-400 font-mono">WHO: 25</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.no2 ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.no2 ?? 0) / 100) * 100)}%` }}
                />
              </div>
            </div>

            {/* Ozone O3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ozone O3</span>
                <span className="text-[10px] text-slate-400 font-mono">WHO: 100</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.o3 ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.o3 ?? 0) / 120) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbon Monoxide CO */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CO Combustion</span>
                <span className="text-[10px] text-slate-400 font-mono">Std</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.co ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.co ?? 0) / 2000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Sulphur Dioxide SO2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SO2 Industrial</span>
                <span className="text-[10px] text-slate-400 font-mono">WHO: 40</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.so2 ?? 0}
                </span>
                <span className="text-xs text-slate-500">µg/m³</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, ((current?.so2 ?? 0) / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meteorological Conditions Strip */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Temperature</p>
                <p className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.temperature ?? 0}°C
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Humidity</p>
                <p className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.humidity ?? 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Wind Velocity</p>
                <p className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                  {current?.windSpeed ?? 0} km/h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Atmosphere</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
                  {current?.weatherCondition || 'Normal'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Personalized Context-Aware Health Recommendations */}
      <PersonalizedHealthCard
        airData={airData}
        profile={profile}
        onNavigateTab={onNavigateTab}
      />

      {/* 4. Diurnal 24-Hour Smog & AQI Trend Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                24-Hour Atmospheric Trajectory (Historical & Hourly Forecast)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reflects diurnal winter inversion patterns — PM2.5 levels typically peak in cold early mornings
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              AQI Trend
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              PM2.5 (µg/m³)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={3}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} ${name === 'pm25' ? 'µg/m³' : ''}`,
                    name === 'aqi' ? 'Air Quality Index' : 'PM2.5 Particle Load',
                  ]}
                />
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Poor Threshold', fill: '#ef4444', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#aqiGrad)"
                  name="aqi"
                />
                <Area
                  type="monotone"
                  dataKey="pm25"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#pm25Grad)"
                  name="pm25"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading hourly trend data...
            </div>
          )}
        </div>
      </section>

      {/* 4. Actionable Health & Lifestyle Guidance Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Practical Health Actions for Today
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized protection protocols tailored to current atmospheric readings
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('planner')}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View Full Daily Planner</span>
            <CalendarCheck className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card A: Mask & Respiratory Barrier */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Respiratory Protection</span>
              {category.advisories.maskRequired ? (
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {category.advisories.maskRequired ? 'Particulate Mask Recommended' : 'Standard Ambient Exposure'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {category.advisories.maskType}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Note: Simple cloth or surgical masks have high peripheral leakage for sub-micron PM2.5.
            </div>
          </div>

          {/* Card B: Ventilation & Windows */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Indoor Ventilation</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Home Air Management
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {category.advisories.ventilation}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Optimal hour: 1:30 PM - 3:30 PM</span>
              <button
                onClick={() => onNavigateTab('indoor')}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                IAQ Guide →
              </button>
            </div>
          </div>

          {/* Card C: Outdoor Exercise & Commute */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fitness & Travel</span>
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Physical Activity Safety
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {category.advisories.outdoorActivity}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Vulnerable: {profile.householdType}</span>
              <button
                onClick={() => onNavigateTab('transit')}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                Transit options →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Attribution & Transparency Footer Strip */}
      <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <span>Data Provider: </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{airData?.source || 'Open-Meteo & CAMS Atmospheric Model'}</span>
          <span className="mx-2">·</span>
          <span>Lat: {airData?.latitude.toFixed(2)}°, Lon: {airData?.longitude.toFixed(2)}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]">
            *General air-quality guidance. Refer to local municipal advisories during extreme smog episodes.
          </span>
        </div>
      </footer>
    </div>
  );
};
