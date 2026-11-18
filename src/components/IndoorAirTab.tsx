import React, { useState } from 'react';
import {
  AirQualityResponse,
  IndoorReading,
} from '../types';
import { loadIndoorReading, saveIndoorReading } from '../utils/storage';
import {
  Home,
  Sliders,
  Wind,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Fan,
  Flame,
  Clock,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface IndoorAirTabProps {
  airData: AirQualityResponse | null;
}

export const IndoorAirTab: React.FC<IndoorAirTabProps> = ({ airData }) => {
  const [reading, setReading] = useState<IndoorReading>(() => loadIndoorReading());
  const [isEditing, setIsEditing] = useState(false);
  const [pm25Input, setPm25Input] = useState(reading.pm25.toString());
  const [co2Input, setCo2Input] = useState((reading.co2 || 650).toString());
  const [humidityInput, setHumidityInput] = useState((reading.humidity || 45).toString());
  const [tempInput, setTempInput] = useState((reading.temp || 22).toString());

  // CADR sizing calculator state
  const [roomArea, setRoomArea] = useState(250); // sq ft
  const [ceilingHeight, setCeilingHeight] = useState(9); // ft
  const requiredCADR = Math.round((roomArea * ceilingHeight * 5) / 60); // 5 Air Changes per Hour (ACH)

  // Filter maintenance tracker
  const [daysSinceFilterClean, setDaysSinceFilterClean] = useState(18);
  const [daysSinceHepaReplaced, setDaysSinceHepaReplaced] = useState(115);

  const outdoorPM25 = airData?.current?.pm25 ?? 90;

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: IndoorReading = {
      pm25: parseFloat(pm25Input) || 30,
      co2: parseFloat(co2Input) || 600,
      humidity: parseFloat(humidityInput) || 45,
      temp: parseFloat(tempInput) || 22,
      hasPhysicalMonitor: true,
      lastUpdated: new Date().toISOString(),
    };
    setReading(updated);
    saveIndoorReading(updated);
    setIsEditing(false);
  };

  // Determine indoor health tier
  const getIndoorStatus = (pm: number, co2: number) => {
    if (pm <= 15 && co2 <= 800) {
      return {
        label: 'Optimal Clean Air Sanctuary',
        badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
        summary: 'Both particulate matter and carbon dioxide are within target restorative thresholds.',
      };
    }
    if (pm <= 35 && co2 <= 1000) {
      return {
        label: 'Acceptable Indoor Air',
        badge: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
        summary: 'Good baseline. Maintain HEPA filtration during cooking or dusting.',
      };
    }
    if (co2 > 1200 && pm <= 40) {
      return {
        label: 'Elevated CO2 / Stale Air',
        badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
        summary: 'Rooms have accumulated exhaled CO2. Requires brief cross-ventilation or fresh air intake.',
      };
    }
    return {
      label: 'Elevated Particulate Intrusion',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
      summary: 'Outdoor winter smog or indoor combustion is elevating fine particles inside your home.',
    };
  };

  const status = getIndoorStatus(reading.pm25, reading.co2 || 600);

  // Ventilation decision based on indoor vs outdoor
  const shouldVentilateNow = outdoorPM25 < 60 && (reading.co2 || 600) > 900;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Scientific Clarification Notice Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-sm">Physical Monitor vs. Ambient Outdoor Air</span>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300">
            Outdoor AQI cannot directly measure what you breathe inside your living room or bedroom. Indoor air quality depends on your building envelope, cooking methods, HEPA filtration, and human respiration. The readings below represent your physical monitor or manual room assessment.
          </p>
        </div>
      </div>

      {/* 2. Indoor Environment Snapshot & Monitor Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Home className="w-4 h-4" />
              <span>Personal Living Space Monitor</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Indoor Air Sanctuary Status
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${status.badge}`}>
              {status.label}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Update Readings'}</span>
            </button>
          </div>
        </div>

        {/* Manual Input Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveReading}
            className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in"
          >
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Enter Data from Your Room Air Monitor (e.g., Laser PM Sensor, CO2 NDIR)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Indoor PM2.5 (µg/m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pm25Input}
                  onChange={(e) => setPm25Input(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. 24"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CO2 Concentration (ppm)
                </label>
                <input
                  type="number"
                  value={co2Input}
                  onChange={(e) => setCo2Input(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. 720"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Relative Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidityInput}
                  onChange={(e) => setHumidityInput(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. 48"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Room Temp (°C)
                </label>
                <input
                  type="number"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono"
                  placeholder="e.g. 21"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Save Measurements
              </button>
            </div>
          </form>
        )}

        {/* Metric Display Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Indoor PM2.5</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {reading.pm25}
              </span>
              <span className="text-xs text-slate-400">µg/m³</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Outdoor ratio: {Math.round((reading.pm25 / Math.max(outdoorPM25, 1)) * 100)}% of outdoor
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">CO2 Concentration</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {reading.co2 || 650}
              </span>
              <span className="text-xs text-slate-400">ppm</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {(reading.co2 || 650) < 800 ? 'Fresh oxygenation' : 'Stagnant respiration'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Indoor Humidity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {reading.humidity || 48}%
              </span>
              <span className="text-xs text-slate-400">RH</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Optimal 40–50% range
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Room Temperature</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {reading.temp || 22}°C
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Thermal comfort zone
            </span>
          </div>
        </div>

        {/* Real-time Outdoor vs Indoor Comparison banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">Smart Ventilation Decision: </span>
            <span className="text-slate-600 dark:text-slate-300">
              {shouldVentilateNow
                ? 'Outdoor air is currently acceptable. Safe for 15-minute cross-ventilation.'
                : `Keep windows sealed. Outdoor PM2.5 (${outdoorPM25} µg/m³) is higher than indoor air (${reading.pm25} µg/m³).`}
            </span>
          </div>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            {shouldVentilateNow ? 'Ventilation Safe' : 'Keep Windows Sealed'}
          </span>
        </div>
      </div>

      {/* 3. Targeted IAQ Improvement Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module A: Dust & Aerosol Hygiene */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Dust & Particle Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preventing aerosol resuspension
              </p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Wet mopping & microfiber:</strong> Never use a dry broom or feather duster; dry sweeping kicks sub-micron particles back into the breathing zone for 2-4 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Sealed HEPA vacuuming:</strong> Standard unsealed vacuums exhaust fine PM2.5 out through their motor vents. Ensure your vacuum has an airtight HEPA exhaust.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Doormat & shoe-free zone:</strong> 60% of outdoor lead, soot, and soil enters on shoe soles. Removing shoes at the doorway cuts interior particulate load drastically.</span>
            </li>
          </ul>
        </div>

        {/* Module B: Kitchen & Cooking Smoke Control */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Cooking Smoke & Combustion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Managing peak indoor PM2.5 spikes
              </p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Pre-cook exhaust trigger:</strong> Turn on range hood exhaust 2 minutes BEFORE heating oil; keep running for 5 minutes after cooking finishes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Oil smoke point discipline:</strong> Frying and searing above oil smoke points generates ultrafine acrolein and polycyclic aromatic aerosols. Keep lids on frying pans.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Eliminate scented candles & incense:</strong> Incense sticks generate up to 400 µg/m³ of PM2.5 in an enclosed room, equivalent to active highway diesel soot.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Air Purifier Sizing (CADR) & Filter Maintenance Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Fan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                HEPA Purifier CADR Sizing & Filter Maintenance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculate clean air delivery rate (CADR) and track filter lifecycles
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CADR Calculator */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              Room Sizing & Required CADR
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Room Area (sq ft)</label>
                <input
                  type="number"
                  value={roomArea}
                  onChange={(e) => setRoomArea(parseInt(e.target.value) || 100)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Ceiling Height (ft)</label>
                <input
                  type="number"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(parseInt(e.target.value) || 8)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Required Smoke CADR:</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {requiredCADR} CFM
                </p>
              </div>
              <span className="text-[11px] text-slate-400 text-right">
                Delivers 5 Air Changes/hr<br />for smoke removal
              </span>
            </div>
          </div>

          {/* Filter Replacement Tracker */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              Filter Maintenance Lifecycles
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Pre-Filter (Mesh/Washable)</span>
                  <p className="text-[11px] text-slate-400">Clean every 14-21 days with vacuum or water</p>
                </div>
                <button
                  onClick={() => setDaysSinceFilterClean(0)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 text-[11px] rounded border border-slate-200 dark:border-slate-700 hover:text-emerald-600 font-mono"
                >
                  Rinsed {daysSinceFilterClean}d ago (Reset)
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">True HEPA (H13 Glass Fiber)</span>
                  <p className="text-[11px] text-slate-400">Replace every 6-9 months in winter smog</p>
                </div>
                <button
                  onClick={() => setDaysSinceHepaReplaced(0)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 text-[11px] rounded border border-slate-200 dark:border-slate-700 hover:text-emerald-600 font-mono"
                >
                  {daysSinceHepaReplaced}d in use (Reset)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fact check: Houseplants vs HEPA */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Scientific Clarification on Houseplants:</strong> While indoor plants provide psychological benefits and trace VOC absorption in sealed laboratory chambers, peer-reviewed atmospheric studies show you would need over 100 plants per square meter to equal the particulate filtration speed of a single compact True-HEPA mechanical air cleaner.
          </p>
        </div>
      </div>
    </div>
  );
};
