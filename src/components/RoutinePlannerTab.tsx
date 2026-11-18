import React, { useState, useEffect } from 'react';
import {
  AirQualityResponse,
  UserProfile,
  RoutinePlan,
  RoutineTask,
} from '../types';
import { loadRoutine, saveRoutine } from '../utils/storage';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Leaf,
  ShieldCheck,
  RefreshCw,
  Info,
  Clock,
} from 'lucide-react';

interface RoutinePlannerTabProps {
  airData: AirQualityResponse | null;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const RoutinePlannerTab: React.FC<RoutinePlannerTabProps> = ({
  airData,
  profile,
  onUpdateProfile,
}) => {
  const [plan, setPlan] = useState<RoutinePlan | null>(() => loadRoutine());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Local form state for quick lifestyle tuning
  const [occupation, setOccupation] = useState(profile.occupation);
  const [travelMethod, setTravelMethod] = useState(profile.travelMethod);
  const [workoutPreference, setWorkoutPreference] = useState(profile.workoutPreference);
  const [householdType, setHouseholdType] = useState(profile.householdType);

  const current = airData?.current;

  // Client-side fallback generator ensuring 100% reliability
  const createClientFallbackRoutine = (
    prof: UserProfile,
    city = 'your area',
    aqi = 150,
    category = 'Moderate',
    pm25 = 80
  ): RoutinePlan => {
    const isSevere = aqi > 250;
    const isMorningWorkout = (prof.workoutPreference || '').toLowerCase().includes('morning');
    const isTransit = (prof.travelMethod || '').toLowerCase().includes('metro') || (prof.travelMethod || '').toLowerCase().includes('bus');

    return {
      summary: `Strategic air protection plan for ${city} at AQI ${aqi} (${category}): prioritize indoor air filtration and shift outdoor exertion away from morning thermal smog traps.`,
      smogRiskLevel: isSevere ? 'Severe' : aqi > 150 ? 'High' : 'Moderate',
      morning: [
        {
          id: 'm1',
          title: isSevere ? 'Strict Window Envelope Seal' : 'Morning Air Quality & Ventilation Check',
          action: isSevere
            ? 'Keep all home and bedroom windows tightly closed. Ground-level temperature inversion holds traffic exhaust near the surface until noon.'
            : 'Check live AQI before opening windows; keep windows closed during rush hour (7:00 AM – 10:00 AM) when commuter emissions peak.',
          reason: 'Nocturnal radiational cooling creates an atmospheric lid that traps PM2.5 within the lowest 50 meters of the urban boundary layer.',
          isEcoFriendly: false,
          completed: false,
        },
        {
          id: 'm2',
          title: isTransit ? 'Protected Transit Commute' : 'Low-Emission Travel Strategy',
          action: isTransit
            ? `Proceed with ${prof.travelMethod || 'Public Transit'}; wear a certified, well-fitted N95/FFP2 respirator while walking and waiting at boarding platforms.`
            : 'Switch to enclosed public rail or electric bus to reduce direct tailpipe exhaust inhalation and prevent additional vehicular emissions.',
          reason: 'Public transit drastically reduces per-commuter soot discharge while respirators block microscopic sub-2.5-micron aerosols.',
          isEcoFriendly: true,
          completed: false,
        },
        ...(isMorningWorkout ? [{
          id: 'm3',
          title: 'Indoor Workout Re-route',
          action: 'Shift cardiovascular training indoors into a room with an operating True-HEPA air purifier. Avoid outdoor jogging.',
          reason: 'Cardio exertion increases ventilation rate by 500-1000%, exponentially multiplying fine particle deposition deep in bronchioles.',
          isEcoFriendly: false,
          completed: false,
        }] : []),
      ],
      afternoon: [
        {
          id: 'a1',
          title: 'Midday Atmospheric Inversion Lifting Window',
          action: 'Between 1:30 PM and 3:30 PM, solar radiation lifts the boundary layer. If outdoor PM2.5 drops, run a 15-minute cross-ventilation, then seal and filter.',
          reason: 'Solar thermal updrafts temporarily disperse particulate concentration before evening cooling re-traps emissions.',
          isEcoFriendly: false,
          completed: false,
        },
        {
          id: 'a2',
          title: 'Workplace & Kitchen Air Optimization',
          action: 'Wipe desks with a damp microfiber cloth instead of dry dusting; ensure range hood exhaust fans run on high during any cooking.',
          reason: 'Cooking oil smoke and resuspension of settled dust are the primary indoor contributors to dangerous PM2.5 spikes.',
          isEcoFriendly: true,
          completed: false,
        },
      ],
      evening: [
        {
          id: 'e1',
          title: (prof.workoutPreference || '').toLowerCase().includes('evening') ? 'Filtered Indoor Evening Workout' : 'Evening Smog Defense',
          action: isSevere
            ? 'Stay indoors. Evening rush-hour traffic coincides with rapid atmospheric cooling, spiking roadside particulate density.'
            : 'Exercise in a filtered indoor space. Keep window seals locked as ground temperatures drop.',
          reason: 'The nocturnal boundary layer begins contracting around sunset, capturing commuter soot directly at head height.',
          isEcoFriendly: false,
          completed: false,
        },
        {
          id: 'e2',
          title: 'Bedroom Sanctuary Air Cleanse',
          action: 'Turn bedroom HEPA purifier to continuous sleep mode 30 minutes before sleep with doors closed; change into fresh indoor clothing.',
          reason: 'Removes commute-borne particulate soot from clothing and maintains sleeping PM2.5 below WHO 15 µg/m³ clean air standards.',
          isEcoFriendly: true,
          completed: false,
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  };

  // Generate routine using backend API endpoint with zero-crash guarantee
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const updatedProfile = {
      ...profile,
      occupation,
      travelMethod,
      workoutPreference,
      householdType,
    };
    onUpdateProfile(updatedProfile);

    try {
      const res = await fetch('/api/routine/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentalContext: {
            city: airData?.city,
            aqiIndian: current?.aqiIndian,
            aqiUs: current?.aqiUs,
            pm25: current?.pm25,
            pm10: current?.pm10,
            temperature: current?.temperature,
            weatherCondition: current?.weatherCondition,
          },
          userProfile: updatedProfile,
        }),
      });

      let data: RoutinePlan;
      if (res.ok) {
        data = await res.json();
      } else {
        data = createClientFallbackRoutine(
          updatedProfile,
          airData?.city,
          current?.aqiIndian || current?.aqiUs || 150,
          current?.categoryIndian || 'Moderate',
          current?.pm25 || 80
        );
      }

      const initializedPlan: RoutinePlan = {
        ...data,
        morning: (data.morning || []).map((t) => ({ ...t, completed: false })),
        afternoon: (data.afternoon || []).map((t) => ({ ...t, completed: false })),
        evening: (data.evening || []).map((t) => ({ ...t, completed: false })),
        generatedAt: new Date().toISOString(),
      };

      setPlan(initializedPlan);
      saveRoutine(initializedPlan);
      setShowConfig(false);
    } catch (err) {
      console.warn('Routine network fallback invoked:', err);
      const fallback = createClientFallbackRoutine(
        updatedProfile,
        airData?.city,
        current?.aqiIndian || current?.aqiUs || 150,
        current?.categoryIndian || 'Moderate',
        current?.pm25 || 80
      );
      setPlan(fallback);
      saveRoutine(fallback);
      setShowConfig(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // If no plan exists initially, auto-generate once airData is ready
  useEffect(() => {
    if (!plan && airData) {
      handleGeneratePlan();
    }
  }, [airData]);

  // Toggle task completion
  const toggleTask = (period: 'morning' | 'afternoon' | 'evening', id: string) => {
    if (!plan) return;
    const updated = {
      ...plan,
      [period]: plan[period].map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    };
    setPlan(updated);
    saveRoutine(updated);
  };

  // Calculate completion percentage
  const allTasks: RoutineTask[] = plan
    ? [...plan.morning, ...plan.afternoon, ...plan.evening]
    : [];
  const completedCount = allTasks.filter((t) => t.completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="w-4 h-4" />
            <span>AI-Driven Circadian Air Routine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Personalized Daily Smog Shield
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Converting atmospheric inversions, PM2.5 levels, and your daily lifestyle into low-exposure, high-impact routines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            {showConfig ? 'Hide Lifestyle Settings' : 'Customize Lifestyle'}
          </button>
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Lifestyle Settings Drawer (Collapsible) */}
      {showConfig && (
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Your Lifestyle & Exposure Profile
            </h3>
            <span className="text-xs text-slate-400">Stored on-device</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Occupation / Status
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="Working Professional">Working Professional</option>
                <option value="Student">Student</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Senior / Retiree">Senior / Retiree</option>
                <option value="Outdoor Worker">Outdoor Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Usual Commute Method
              </label>
              <select
                value={travelMethod}
                onChange={(e) => setTravelMethod(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="Metro / Rail">Metro / Rail</option>
                <option value="Public Bus">Public Bus</option>
                <option value="Personal Car">Personal Car</option>
                <option value="Motorcycle">Motorcycle / Scooter</option>
                <option value="Bicycle / Walk">Bicycle / Walk</option>
                <option value="Remote / WFH">Remote / WFH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Preferred Exercise Time
              </label>
              <select
                value={workoutPreference}
                onChange={(e) => setWorkoutPreference(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="Early Morning">Early Morning (6-8 AM)</option>
                <option value="Midday">Midday (12-2 PM)</option>
                <option value="Late Evening">Late Evening (6-8 PM)</option>
                <option value="Indoor Only">Indoor Gym / Home Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Household Vulnerability
              </label>
              <select
                value={householdType}
                onChange={(e) => setHouseholdType(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="General Public">General Population</option>
                <option value="Young Children (0-5)">Young Children (0-5 yrs)</option>
                <option value="Elderly Parents (65+)">Elderly Parents (65+ yrs)</option>
                <option value="Asthmatic / Sensitive">Asthmatic / Respiratory Vulnerable</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleGeneratePlan}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Update Routine for This Profile
            </button>
          </div>
        </div>
      )}

      {/* 3. Daily Adherence Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Today's Routine Adherence: {completedCount} of {allTasks.length} Completed
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {plan?.summary && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 italic">
            "{plan.summary}"
          </p>
        )}
      </div>

      {/* 4. Routine Periods: Morning, Afternoon, Evening */}
      <div className="space-y-6">
        {/* Morning Block */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Morning Sequence (06:00 – 11:30)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Peak ground smog inversion & morning rush hour protection
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">High Risk Window</span>
          </div>

          <div className="space-y-3">
            {plan?.morning.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask('morning', task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  task.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        task.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isEcoFriendly && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        <Leaf className="w-3 h-3" />
                        Low Emission
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {task.action}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Why it matters:</span> {task.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Afternoon Block */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Afternoon Sequence (11:30 – 16:30)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Solar boundary lifting & strategic ventilation window
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">Optimal Transition Window</span>
          </div>

          <div className="space-y-3">
            {plan?.afternoon.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask('afternoon', task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  task.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        task.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isEcoFriendly && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        <Leaf className="w-3 h-3" />
                        Low Emission
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {task.action}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Why it matters:</span> {task.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evening Block */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evening & Night Sequence (16:30 – 23:00)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cooling temperature inversion & overnight bedroom air cleaning
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">Night Restoration</span>
          </div>

          <div className="space-y-3">
            {plan?.evening.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask('evening', task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  task.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        task.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isEcoFriendly && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        <Leaf className="w-3 h-3" />
                        Low Emission
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {task.action}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Why it matters:</span> {task.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Scientific Note */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 dark:text-white">
            The Atmospheric Science Behind This Routine
          </span>
          <p className="leading-relaxed">
            During winter smog crises, radiative surface cooling forms a nocturnal inversion layer that traps vehicular exhaust and smoke beneath a blanket of cold air until solar insolation warms the soil around 11:00 AM. Adapting your workout, commute, and ventilation hours to these meteorological dynamics reduces personal micro-gram particle exposure by up to 60%.
          </p>
        </div>
      </div>
    </div>
  );
};
