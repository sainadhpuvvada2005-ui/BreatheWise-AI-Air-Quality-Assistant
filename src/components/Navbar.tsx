import React from 'react';
import {
  Wind,
  LayoutDashboard,
  BotMessageSquare,
  CalendarCheck,
  Home,
  Bike,
  Activity,
  Users,
  Settings,
  Sun,
  Moon,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { AirQualityResponse } from '../types';
import { getCategoryInfo } from '../utils/aqiUtils';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  airData: AirQualityResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenLocation: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  standard: 'indian' | 'us';
}

export const NAV_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assistant', label: 'AI Assistant', icon: BotMessageSquare },
  { id: 'planner', label: 'Daily Routine', icon: CalendarCheck },
  { id: 'indoor', label: 'Indoor IAQ', icon: Home },
  { id: 'transit', label: 'Clean Transit', icon: Bike },
  { id: 'tracker', label: 'Impact Tracker', icon: Activity },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  airData,
  isLoading,
  onRefresh,
  onOpenLocation,
  theme,
  onToggleTheme,
  standard,
}) => {
  const aqiValue = airData?.current
    ? standard === 'indian'
      ? airData.current.aqiIndian
      : airData.current.aqiUs
    : null;

  const category = aqiValue !== null ? getCategoryInfo(aqiValue, standard) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar contract: Zone 1 (Wordmark) — Zone 2 (Nav links) — Zone 3 (Action / Theme) */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  BreatheWise
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Air Companion
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean hover underlines) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 overflow-x-auto py-1">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Location & Theme / Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Location Trigger */}
            <button
              onClick={onOpenLocation}
              title="Change City or Location"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="max-w-[110px] sm:max-w-[160px] truncate">
                {airData?.city || 'Select City'}
              </span>
              {aqiValue !== null && category && (
                <span
                  className={`hidden sm:inline-flex px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums font-semibold ${category.badgeBg} ${category.badgeText}`}
                >
                  AQI {aqiValue}
                </span>
              )}
            </button>

            {/* Refresh Live Environmental Data */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh environmental data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-200/80 dark:border-slate-800/80 no-scrollbar">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
