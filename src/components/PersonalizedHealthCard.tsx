import React, { useState, useEffect, useCallback } from 'react';
import {
  AirQualityResponse,
  UserProfile,
  HealthAdvisoryResponse,
  HealthTierItem,
} from '../types';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Wind,
  Activity,
  HeartPulse,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PersonalizedHealthCardProps {
  airData: AirQualityResponse | null;
  profile: UserProfile;
  onNavigateTab: (tab: string) => void;
}

export const PersonalizedHealthCard: React.FC<PersonalizedHealthCardProps> = ({
  airData,
  profile,
  onNavigateTab,
}) => {
  const [advisory, setAdvisory] = useState<HealthAdvisoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const current = airData?.current;
  const aqiVal = current
    ? profile.aqiStandard === 'indian'
      ? current.aqiIndian
      : current.aqiUs
    : 150;

  const fetchAdvisory = useCallback(async () => {
    if (!airData) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/health-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentalContext: {
            city: airData.city,
            aqiIndian: current?.aqiIndian,
            categoryIndian: current?.categoryIndian,
            aqiUs: current?.aqiUs,
            pm25: current?.pm25,
            pm10: current?.pm10,
            temperature: current?.temperature,
            humidity: current?.humidity,
            weatherCondition: current?.weatherCondition,
          },
          userProfile: {
            occupation: profile.occupation,
            travelMethod: profile.travelMethod,
            workoutPreference: profile.workoutPreference,
            householdType: profile.householdType,
          },
        }),
      });

      if (res.ok) {
        const data: HealthAdvisoryResponse = await res.json();
        setAdvisory(data);
      }
    } catch (err) {
      console.warn('Health advisory fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [airData, current, profile]);

  useEffect(() => {
    fetchAdvisory();
  }, [fetchAdvisory]);

  // Visual risk styling
  const getRiskStyles = (risk = 'Moderate') => {
    switch (risk.toLowerCase()) {
      case 'severe':
      case 'critical':
        return {
          border: 'border-purple-300 dark:border-purple-800/80',
          badgeBg: 'bg-purple-100 dark:bg-purple-950/70',
          badgeText: 'text-purple-800 dark:text-purple-300',
          gradient: 'from-purple-50/50 dark:from-purple-950/20 to-transparent',
        };
      case 'high':
        return {
          border: 'border-rose-200 dark:border-rose-800/80',
          badgeBg: 'bg-rose-100 dark:bg-rose-950/70',
          badgeText: 'text-rose-800 dark:text-rose-300',
          gradient: 'from-rose-50/50 dark:from-rose-950/20 to-transparent',
        };
      case 'moderate':
        return {
          border: 'border-amber-200 dark:border-amber-800/80',
          badgeBg: 'bg-amber-100 dark:bg-amber-950/70',
          badgeText: 'text-amber-800 dark:text-amber-300',
          gradient: 'from-amber-50/50 dark:from-amber-950/20 to-transparent',
        };
      default:
        return {
          border: 'border-emerald-200 dark:border-emerald-800/80',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70',
          badgeText: 'text-emerald-800 dark:text-emerald-300',
          gradient: 'from-emerald-50/50 dark:from-emerald-950/20 to-transparent',
        };
    }
  };

  const riskStyle = getRiskStyles(advisory?.overallRisk);

  const getTierIcon = (cat: string) => {
    switch (cat) {
      case 'respiratory':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'ventilation':
        return <Wind className="w-4 h-4 text-teal-500 shrink-0" />;
      case 'exertion':
        return <Activity className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <HeartPulse className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border ${riskStyle.border} shadow-sm transition-colors`}>
      {/* Top Banner Header */}
      <div className={`p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r ${riskStyle.gradient}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Personalized Health Recommendations
              </h2>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AI Context-Aware Diagnosis
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-3xl">
              {advisory?.summary || `Generating clinical environmental advice for ${airData?.city}...`}
            </p>

            {advisory?.lifestyleFocus && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{advisory.lifestyleFocus}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {advisory?.overallRisk && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskStyle.badgeBg} ${riskStyle.badgeText}`}>
                {advisory.overallRisk} Health Risk
              </span>
            )}

            <button
              onClick={fetchAdvisory}
              disabled={isLoading}
              title="Regenerate context-aware advice"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Pillar Tiered Guidance Grid */}
      <div className="p-6 sm:p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(advisory?.tiers || []).map((tier: HealthTierItem) => (
            <div
              key={tier.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTierIcon(tier.category)}
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {tier.title}
                    </span>
                  </div>
                </div>

                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {tier.badge}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {tier.action}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong className="text-slate-600 dark:text-slate-300">Why: </strong>
                  {tier.reason}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Real-time atmospheric synthesis for {airData?.city} (AQI {aqiVal}, PM2.5: {current?.pm25 ?? 0} µg/m³).
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('assistant')}
            className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Assistant for deeper clinical explanations</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
};
