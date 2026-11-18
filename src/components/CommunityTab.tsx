import React, { useState } from 'react';
import {
  CommunityChallenge,
} from '../types';
import {
  loadChallenges,
  saveChallenges,
} from '../utils/storage';
import {
  Users,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  CloudFog,
  Factory,
  Car,
  AlertCircle,
  Sparkles,
  Share2,
} from 'lucide-react';

export const CommunityTab: React.FC = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(() => loadChallenges());
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const toggleJoin = (id: string) => {
    const updated = challenges.map((ch) =>
      ch.id === id ? { ...ch, joined: !ch.joined } : ch
    );
    setChallenges(updated);
    saveChallenges(updated);
  };

  const incrementProgress = (id: string) => {
    const updated = challenges.map((ch) => {
      if (ch.id === id) {
        const nextProgress = Math.min(ch.durationDays, ch.progressDays + 1);
        const isCompleted = nextProgress >= ch.durationDays;
        if (isCompleted && !ch.completed) {
          setCelebrationMsg(`Congratulations! You completed the "${ch.title}" challenge!`);
          setTimeout(() => setCelebrationMsg(null), 4000);
        }
        return {
          ...ch,
          progressDays: nextProgress,
          completed: isCompleted,
        };
      }
      return ch;
    });
    setChallenges(updated);
    saveChallenges(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay">
          <img
            src="/src/assets/images/community_action_1794979522364.jpg"
            alt="Community clean air initiative"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Users className="w-4 h-4" />
            <span>Collective Smog Mitigation</span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
              Sample Community Cohort (Demo Data)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Community Clean Air Stewardship
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Coordinating weekly behavioral challenges, mutual air audits, and citizen science campaigns to protect neighborhood air basins.
          </p>
        </div>
      </div>

      {celebrationMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-medium text-xs sm:text-sm flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{celebrationMsg}</span>
          </div>
        </div>
      )}

      {/* 2. Active Weekly Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Weekly Clean Air Eco-Challenges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join active community missions to reduce winter pollution and personal exposure
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            4 Challenges Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map((ch) => {
            const percent = Math.round((ch.progressDays / ch.durationDays) * 100);
            return (
              <div
                key={ch.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {ch.impactTag}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {ch.participants.toLocaleString()} active
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Progress: {ch.progressDays} of {ch.durationDays} days
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {ch.completed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed!
                      </span>
                    ) : ch.joined ? (
                      <button
                        onClick={() => incrementProgress(ch.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        + Log Day Progress
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleJoin(ch.id)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Join Challenge
                      </button>
                    )}

                    {ch.joined && !ch.completed && (
                      <button
                        onClick={() => toggleJoin(ch.id)}
                        className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Winter Smog Educational Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <CloudFog className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Understanding Winter Smog Drivers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Why particulate pollution spikes during cold months and what communities can do
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <CloudFog className="w-4 h-4 text-blue-500" />
              <span>1. Thermal Inversions</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              In summer, warm air rises and ventilates pollutants upward. In winter, radiation cooling traps a layer of cold air underneath warm air, creating a lid over the city that holds vehicular soot and dust at human breathing heights.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>2. Biomass & Waste Burning</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Heating fires, garbage incineration, and post-harvest crop residue emit volatile organic compounds and fine carbon particles that form secondary aerosol precursors, coating regional basins in dense haze.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Car className="w-4 h-4 text-teal-500" />
              <span>3. Cold-Start Emissions</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Automotive catalytic converters require 5-10 minutes to reach operating temperatures. In sub-15°C mornings, idling cars emit 3-5 times more unburned hydrocarbons and carbon monoxide than when warmed up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
