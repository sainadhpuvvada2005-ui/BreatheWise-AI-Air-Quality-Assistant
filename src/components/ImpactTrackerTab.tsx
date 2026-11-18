import React, { useState } from 'react';
import {
  ImpactRecord,
} from '../types';
import {
  loadImpactRecords,
  saveImpactRecords,
} from '../utils/storage';
import {
  Activity,
  Plus,
  Trash2,
  Leaf,
  Bike,
  Home,
  CheckCircle2,
  TrendingUp,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ImpactTrackerTab: React.FC = () => {
  const [records, setRecords] = useState<ImpactRecord[]>(() => loadImpactRecords());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'transit' | 'indoor' | 'community' | 'lifestyle'>('transit');
  const [co2Saved, setCo2Saved] = useState('2.5');
  const [details, setDetails] = useState('');

  const totalCo2Saved = records.reduce((sum, r) => sum + r.co2SavedKg, 0);
  const transitTripsCount = records.filter((r) => r.category === 'transit').length;
  const ecoHabitsCount = records.filter((r) => r.category !== 'transit').length;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newRecord: ImpactRecord = {
      id: `imp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      title,
      category,
      co2SavedKg: parseFloat(co2Saved) || 1.0,
      details: details || 'Sustainable everyday habit recorded in BreatheWise.',
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    saveImpactRecords(updated);

    setTitle('');
    setDetails('');
    setShowAddModal(false);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveImpactRecords(updated);
  };

  // Prepare chart data grouped by recent days
  const chartDataMap: { [date: string]: number } = {};
  // Generate last 7 days keys
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    chartDataMap[key] = 0;
  }
  records.forEach((r) => {
    const key = r.date.slice(5, 10);
    if (chartDataMap[key] !== undefined) {
      chartDataMap[key] += r.co2SavedKg;
    }
  });

  const chartData = Object.entries(chartDataMap).map(([date, val]) => ({
    date,
    co2: Math.round(val * 10) / 10,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Header & Summary Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
            <span>Cumulative Carbon & Habit Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Environmental Impact Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Monitor verified emissions avoided through low-carbon transit, home energy discipline, and proactive smog protection.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log Clean Air Action</span>
        </button>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total CO2 Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {totalCo2Saved.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">kg CO2e</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Equivalent to {(totalCo2Saved * 2.4).toFixed(0)} km not driven by a combustion car
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sustainable Commutes</span>
            <Bike className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {transitTripsCount}
            </span>
            <span className="text-xs text-slate-500">trips logged</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Electric metro, shared bus, and zero-emission transit
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Clean Air Habits</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {ecoHabitsCount}
            </span>
            <span className="text-xs text-slate-500">routines completed</span>
          </div>
          <p className="text-[11px] text-slate-400">
            HEPA maintenance, sealed windows & timed workouts
          </p>
        </div>
      </div>

      {/* 3. Weekly Avoided Emissions Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              7-Day Emission Reduction Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily kilograms of CO2 avoided across logged actions
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            kg CO2e
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} kg CO2e`, 'Avoided Emissions']}
              />
              <Bar dataKey="co2" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Deep-Dive Scientific Article: Personal Exposure Reduction vs. Outdoor Emission Reduction */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Exposure Reduction vs. Outdoor Emission Reduction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A foundational distinction in environmental health and atmospheric policy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              1. Personal Exposure Reduction
            </h4>
            <p>
              Actions that prevent fine particulate matter (PM2.5, black carbon, ultrafine aerosols) from entering <em>your individual lungs and bloodstream</em>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Wearing an airtight N95/FFP2 respirator outdoors.</li>
              <li>Running True-HEPA air cleaners in residential rooms.</li>
              <li>Exercising indoors during thermal morning smog inversions.</li>
            </ul>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic">
              Result: Protects your cardiovascular health, but does not decrease city smog.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-teal-500" />
              2. Environmental Emission Reduction
            </h4>
            <p>
              Actions that eliminate or reduce the pollutants and greenhouse gases <em>discharged into the shared atmosphere</em>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Taking the electric metro instead of driving a solo car.</li>
              <li>Carpooling or shifting to electric mobility.</li>
              <li>Eliminating open biomass and waste incineration.</li>
            </ul>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 italic">
              Result: Lowers cumulative urban emissions and smog loads for the entire community.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Activity Log Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Logged Impact Records ({records.length})
        </h3>

        {records.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No impact records yet. Click "Log Clean Air Action" above or use the transit calculator!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                    {rec.category === 'transit' ? <Bike className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {rec.title}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {rec.date} · {rec.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                    +{rec.co2SavedKg} kg CO2
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add custom record */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Record a Sustainable Activity
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cycled to grocery store (6 km)"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="transit">Sustainable Transportation</option>
                  <option value="indoor">Indoor Air Quality / Filtration</option>
                  <option value="lifestyle">Low-Emission Lifestyle</option>
                  <option value="community">Community Stewardship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Estimated CO2 Avoided (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={co2Saved}
                  onChange={(e) => setCo2Saved(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Details / Notes
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
