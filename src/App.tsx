import React, { useState, useEffect, useCallback } from 'react';
import {
  AirQualityResponse,
  UserProfile,
  AQIStandard,
} from './types';
import { loadProfile, saveProfile } from './utils/storage';
import { PRESET_CITIES, CityPreset } from './utils/aqiUtils';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ChatAssistantTab } from './components/ChatAssistantTab';
import { RoutinePlannerTab } from './components/RoutinePlannerTab';
import { IndoorAirTab } from './components/IndoorAirTab';
import { TransportTab } from './components/TransportTab';
import { ImpactTrackerTab } from './components/ImpactTrackerTab';
import { CommunityTab } from './components/CommunityTab';
import { SettingsTab } from './components/SettingsTab';
import { LocationModal } from './components/LocationModal';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('breathewise_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Active coordinates & city name
  const [activeCity, setActiveCity] = useState<string>(profile.defaultCity || 'New Delhi');
  const [activeLat, setActiveLat] = useState<number>(() => {
    const preset = PRESET_CITIES.find((c) => c.name.toLowerCase() === (profile.defaultCity || 'new delhi').toLowerCase());
    return preset ? preset.lat : 28.6139;
  });
  const [activeLon, setActiveLon] = useState<number>(() => {
    const preset = PRESET_CITIES.find((c) => c.name.toLowerCase() === (profile.defaultCity || 'new delhi').toLowerCase());
    return preset ? preset.lon : 77.2090;
  });

  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dismissSmogAlert, setDismissSmogAlert] = useState(false);

  // Apply dark theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('breathewise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch air quality data from our full-stack Express server
  const fetchAirQuality = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const url = `/api/air-quality?lat=${activeLat}&lon=${activeLon}&city=${encodeURIComponent(activeCity)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load atmospheric data (HTTP ${res.status})`);
      }
      const data: AirQualityResponse = await res.json();
      setAirData(data);
    } catch (err: any) {
      console.warn('Air quality load warning:', err);
      setApiError(err.message || 'Could not fetch live atmospheric stream.');
    } finally {
      setIsLoading(false);
    }
  }, [activeLat, activeLon, activeCity]);

  useEffect(() => {
    fetchAirQuality();
  }, [fetchAirQuality]);

  const handleSelectCityPreset = (city: CityPreset) => {
    setActiveCity(city.name);
    setActiveLat(city.lat);
    setActiveLon(city.lon);
  };

  const handleUseCoordinates = (lat: number, lon: number, cityName: string) => {
    setActiveLat(lat);
    setActiveLon(lon);
    setActiveCity(cityName);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    if (newProfile.defaultCity !== profile.defaultCity) {
      const match = PRESET_CITIES.find((c) => c.name.toLowerCase() === newProfile.defaultCity.toLowerCase());
      if (match) {
        setActiveCity(match.name);
        setActiveLat(match.lat);
        setActiveLon(match.lon);
      }
    }
  };

  const handleToggleStandard = (std: AQIStandard) => {
    const updated = { ...profile, aqiStandard: std };
    handleUpdateProfile(updated);
  };

  const handleResetAllData = () => {
    if (confirm('Are you sure you want to reset all cached data, challenges, and saved preferences?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Check if current AQI triggers alert threshold
  const currentAQI = airData?.current
    ? profile.aqiStandard === 'indian'
      ? airData.current.aqiIndian
      : airData.current.aqiUs
    : null;

  const showAlertBanner =
    !dismissSmogAlert &&
    currentAQI !== null &&
    currentAQI >= profile.alertThreshold;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        airData={airData}
        isLoading={isLoading}
        onRefresh={fetchAirQuality}
        onOpenLocation={() => setLocationModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        standard={profile.aqiStandard}
      />

      {/* High-Smog Alert Banner if triggered */}
      {showAlertBanner && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Smog Alert for {airData?.city}:</strong> AQI has reached {currentAQI} (Threshold: {profile.alertThreshold}). Sensitive groups, children, and elderly individuals should avoid outdoor exertion.
            </span>
          </div>
          <button
            onClick={() => setDismissSmogAlert(true)}
            className="p-1 text-white/80 hover:text-white"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardTab
            airData={airData}
            isLoading={isLoading}
            profile={profile}
            standard={profile.aqiStandard}
            onOpenLocation={() => setLocationModalOpen(true)}
            onNavigateTab={setCurrentTab}
            onToggleStandard={handleToggleStandard}
          />
        )}

        {currentTab === 'assistant' && (
          <ChatAssistantTab
            airData={airData}
            profile={profile}
            standard={profile.aqiStandard}
          />
        )}

        {currentTab === 'planner' && (
          <RoutinePlannerTab
            airData={airData}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentTab === 'indoor' && (
          <IndoorAirTab airData={airData} />
        )}

        {currentTab === 'transit' && (
          <TransportTab onNavigateTab={setCurrentTab} />
        )}

        {currentTab === 'tracker' && (
          <ImpactTrackerTab />
        )}

        {currentTab === 'community' && (
          <CommunityTab />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            theme={theme}
            onToggleTheme={toggleTheme}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentCity={activeCity}
        onSelectCity={handleSelectCityPreset}
        onUseCoordinates={handleUseCoordinates}
      />
    </div>
  );
}
