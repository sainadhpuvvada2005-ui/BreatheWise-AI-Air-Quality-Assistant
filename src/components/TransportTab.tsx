import React, { useState } from 'react';
import {
  TRANSIT_MODES,
} from '../utils/aqiUtils';
import {
  saveImpactRecords,
  loadImpactRecords,
} from '../utils/storage';
import {
  Bike,
  Car,
  Bus,
  Train,
  Users,
  Footprints,
  Zap,
  ArrowRight,
  Calculator,
  Leaf,
  PlusCircle,
  Check,
  Info,
} from 'lucide-react';

interface TransportTabProps {
  onNavigateTab: (tab: string) => void;
}

export const TransportTab: React.FC<TransportTabProps> = ({ onNavigateTab }) => {
  const [distanceKm, setDistanceKm] = useState(16);
  const [tripsPerWeek, setTripsPerWeek] = useState(10); // e.g. 5 days round-trip
  const [baselineModeId, setBaselineModeId] = useState('car_petrol');
  const [targetModeId, setTargetModeId] = useState('metro_train');
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const baselineMode = TRANSIT_MODES.find((m) => m.id === baselineModeId) || TRANSIT_MODES[0];
  const targetMode = TRANSIT_MODES.find((m) => m.id === targetModeId) || TRANSIT_MODES[5];

  // Emissions in kg CO2 (grams / 1000)
  const baselineTripKg = (baselineMode.factorGramsPerKm * distanceKm) / 1000;
  const targetTripKg = (targetMode.factorGramsPerKm * distanceKm) / 1000;

  const tripSavedKg = Math.max(0, baselineTripKg - targetTripKg);
  const weeklySavedKg = tripSavedKg * tripsPerWeek;
  const monthlySavedKg = weeklySavedKg * 4.33;

  // Approximate fuel cost estimation ($0.12/km for car vs $0.04/km for public transit)
  const carFuelCostPerTrip = distanceKm * 0.12;
  const transitCostPerTrip = targetMode.isZeroDirectEmission ? 0.35 : 0.65;
  const weeklyCostSavings = Math.max(0, (carFuelCostPerTrip - transitCostPerTrip) * tripsPerWeek);

  const handleLogToImpactTracker = () => {
    const records = loadImpactRecords();
    const newRecord = {
      id: `trip-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      title: `${targetMode.name} commute (${distanceKm} km)`,
      category: 'transit' as const,
      co2SavedKg: Math.round(weeklySavedKg * 10) / 10,
      details: `Replaced ${baselineMode.name} with ${targetMode.name} over ${tripsPerWeek} trips/week.`,
    };
    saveImpactRecords([newRecord, ...records]);
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'car_petrol':
      case 'car_diesel':
        return <Car className="w-4 h-4" />;
      case 'car_ev':
        return <Zap className="w-4 h-4" />;
      case 'motorcycle':
        return <Bike className="w-4 h-4" />;
      case 'bus_cng':
        return <Bus className="w-4 h-4" />;
      case 'metro_train':
        return <Train className="w-4 h-4" />;
      case 'carpool':
        return <Users className="w-4 h-4" />;
      default:
        return <Footprints className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay">
          <img
            src="/src/assets/images/sustainable_transit_1794979521994.jpg"
            alt="Sustainable urban transit"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Bike className="w-4 h-4" />
            <span>Sustainable Urban Mobility</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Clean Commute & Emission Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Quantify carbon and vehicular exhaust abatement when transitioning daily commutes from single-occupancy combustion vehicles to high-efficiency rail, bus, and active transit.
          </p>
        </div>
      </div>

      {/* 2. Interactive Calculator Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Trip Parameters</span>
          </div>
        </div>

        {/* Sliders for distance and frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                One-Way Commute Distance
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {distanceKm} km ({(distanceKm * 0.621).toFixed(1)} miles)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseInt(e.target.value) || 1)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 km</span>
              <span>30 km</span>
              <span>60 km</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Weekly Trip Frequency
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {tripsPerWeek} trips / week
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={tripsPerWeek}
              onChange={(e) => setTripsPerWeek(parseInt(e.target.value) || 1)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 (occasional)</span>
              <span>10 (standard 5-day work)</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Mode Selectors Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Baseline Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              1. Current / Baseline Commute Mode
            </label>
            <div className="space-y-2">
              {TRANSIT_MODES.slice(0, 4).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setBaselineModeId(mode.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-colors ${
                    baselineModeId === mode.id
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {getModeIcon(mode.id)}
                    </span>
                    <div>
                      <div className="font-semibold">{mode.name}</div>
                      <div className="text-[11px] text-slate-400">{mode.factorGramsPerKm} g CO2e / km</div>
                    </div>
                  </div>
                  {baselineModeId === mode.id && <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white">Selected</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Target Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              2. Sustainable Alternative Mode
            </label>
            <div className="space-y-2">
              {TRANSIT_MODES.slice(3).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setTargetModeId(mode.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-colors ${
                    targetModeId === mode.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-medium'
                      : 'border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      {getModeIcon(mode.id)}
                    </span>
                    <div>
                      <div className="font-semibold">{mode.name}</div>
                      <div className="text-[11px] text-slate-400">{mode.factorGramsPerKm} g CO2e / km</div>
                    </div>
                  </div>
                  {targetModeId === mode.id && <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Selected</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Output Comparison Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Calculated Environmental & Financial Benefits
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Model: IPCC Mobile Combustion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">CO2 Avoided / Week</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300 tabular-nums">
                {weeklySavedKg.toFixed(1)}
              </span>
              <span className="text-xs text-emerald-800 dark:text-emerald-400">kg CO2e</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Equivalent to ~{(weeklySavedKg * 4.33).toFixed(0)} kg CO2e / month
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Per-Trip Reduction</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                {baselineTripKg > 0 ? Math.round(((baselineTripKg - targetTripKg) / baselineTripKg) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-400">lower</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {targetTripKg.toFixed(2)} kg vs {baselineTripKg.toFixed(2)} kg baseline
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Est. Weekly Fuel Savings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                ${weeklyCostSavings.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">est. USD</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ~${(weeklyCostSavings * 4.33).toFixed(0)} / month saved in fuel & tolls
            </p>
          </div>
        </div>

        {/* Action Button: Log directly to tracker */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adopting {targetMode.name} saves approximately <strong>{monthlySavedKg.toFixed(1)} kg</strong> of atmospheric carbon each month.
          </p>
          <button
            onClick={handleLogToImpactTracker}
            disabled={loggedSuccess}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm disabled:bg-emerald-800"
          >
            {loggedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Logged to Impact Tracker!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Log to My Impact Tracker</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Scientific & Assumption Transparency */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 leading-relaxed">
          <span className="font-semibold text-slate-900 dark:text-white">
            Transparency on Mobility Emission Factors & Citywide AQI
          </span>
          <p>
            Emission calculations are modeled using verified factors from DEFRA / IPCC guidelines (Average Gasoline Car: 172g CO2e/km; Electric Rail: 24g CO2e/passenger-km; CNG Bus: 42g CO2e/passenger-km). All calculations are <em>estimates</em>.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            <strong>Important distinction:</strong> While one individual choosing public rail reduces their individual carbon and tailpipe footprint, a city's ambient AQI is determined by macro-scale thermal inversions, industrial emissions, construction dust, and millions of cumulative vehicles. Individual action inspires collective policy change.
          </p>
        </div>
      </div>
    </div>
  );
};
