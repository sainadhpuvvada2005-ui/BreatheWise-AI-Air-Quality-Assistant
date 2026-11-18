import React, { useState } from 'react';
import {
  UserProfile,
  AQIStandard,
} from '../types';
import {
  Settings,
  User,
  MapPin,
  Shield,
  Bell,
  Sun,
  Moon,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import { PRESET_CITIES } from '../utils/aqiUtils';

interface SettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  onUpdateProfile,
  theme,
  onToggleTheme,
  onResetAllData,
}) => {
  const [name, setName] = useState(profile.name);
  const [occupation, setOccupation] = useState(profile.occupation);
  const [travelMethod, setTravelMethod] = useState(profile.travelMethod);
  const [workoutPreference, setWorkoutPreference] = useState(profile.workoutPreference);
  const [householdType, setHouseholdType] = useState(profile.householdType);
  const [defaultCity, setDefaultCity] = useState(profile.defaultCity);
  const [aqiStandard, setAqiStandard] = useState<AQIStandard>(profile.aqiStandard);
  const [alertThreshold, setAlertThreshold] = useState(profile.alertThreshold);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name: name.trim() || 'Alex Rivera',
      occupation,
      travelMethod,
      workoutPreference,
      householdType,
      defaultCity,
      aqiStandard,
      alertThreshold,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              User Profile & App Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize environmental recommendations and interface preferences
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Check className="w-4 h-4" />
            Saved!
          </span>
        )}
      </div>

      {/* 2. Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Household */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Personal & Household Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Occupation / Daily Status
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
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
                Household Vulnerability Group
              </label>
              <select
                value={householdType}
                onChange={(e) => setHouseholdType(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="General Public">General Public (No known sensitivities)</option>
                <option value="Young Children (0-5)">Young Children (Ages 0 - 5)</option>
                <option value="Elderly Parents (65+)">Elderly Parents (Ages 65+)</option>
                <option value="Asthmatic / Sensitive">Asthmatic / Chronic Bronchitis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Preferred Exercise Hour
              </label>
              <select
                value={workoutPreference}
                onChange={(e) => setWorkoutPreference(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                <option value="Early Morning">Early Morning (6:00 - 8:30 AM)</option>
                <option value="Midday">Midday (12:00 - 2:30 PM)</option>
                <option value="Late Evening">Late Evening (6:00 - 8:30 PM)</option>
                <option value="Indoor Only">Indoor Gym / Living Room Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Environmental Standards & Default City */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Environmental Standards & Locations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Default City on Launch
              </label>
              <select
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
              >
                {PRESET_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                AQI Standard Calculation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAqiStandard('indian')}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                    aqiStandard === 'indian'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Indian CPCB NAQI
                </button>
                <button
                  type="button"
                  onClick={() => setAqiStandard('us')}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                    aqiStandard === 'us'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  US EPA Scale
                </button>
              </div>
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Smog Alert Notification Threshold
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                AQI {alertThreshold}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="350"
              step="10"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 150)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              When local AQI surpasses {alertThreshold}, the dashboard displays high-priority respiratory advisories.
            </p>
          </div>
        </div>

        {/* Theme & Display */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Visual Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Currently in {theme === 'light' ? 'Light' : 'Dark'} mode
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Switch to Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy & Local Storage Guarantee */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white">
              Privacy & Zero-Tracking Guarantee
            </span>
            <p className="leading-relaxed">
              BreatheWise does not transmit your personal profile or location history to advertising networks or third-party brokers. All questionnaire responses, routines, and impact records are stored on your local device (localStorage).
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetAllData}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo & Stored Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
