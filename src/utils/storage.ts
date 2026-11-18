import { UserProfile, RoutinePlan, IndoorReading, ImpactRecord, CommunityChallenge } from '../types';

const PROFILE_KEY = 'breathewise_user_profile';
const ROUTINE_KEY = 'breathewise_routine_plan';
const INDOOR_KEY = 'breathewise_indoor_reading';
const IMPACT_KEY = 'breathewise_impact_records';
const CHALLENGES_KEY = 'breathewise_challenges';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  occupation: 'Working Professional',
  travelMethod: 'Metro / Rail',
  workoutPreference: 'Evening',
  householdType: 'Young Children (0-5)',
  defaultCity: 'New Delhi',
  aqiStandard: 'indian',
  alertThreshold: 150,
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export function loadRoutine(): RoutinePlan | null {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveRoutine(plan: RoutinePlan): void {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(plan));
  } catch (err) {
    console.warn('Routine save failed:', err);
  }
}

export function loadIndoorReading(): IndoorReading {
  try {
    const raw = localStorage.getItem(INDOOR_KEY);
    if (!raw) {
      return {
        pm25: 35,
        co2: 680,
        humidity: 48,
        temp: 22,
        hasPhysicalMonitor: false,
        lastUpdated: new Date().toISOString(),
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      pm25: 35,
      co2: 680,
      humidity: 48,
      temp: 22,
      hasPhysicalMonitor: false,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveIndoorReading(reading: IndoorReading): void {
  try {
    localStorage.setItem(INDOOR_KEY, JSON.stringify(reading));
  } catch (err) {
    console.warn('Indoor save failed:', err);
  }
}

export function loadImpactRecords(): ImpactRecord[] {
  try {
    const raw = localStorage.getItem(IMPACT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default seed impact records showing historical engagement
  const today = new Date();
  const d1 = new Date(today.getTime() - 86400000 * 2).toISOString().slice(0, 10);
  const d2 = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  const d3 = today.toISOString().slice(0, 10);
  return [
    {
      id: 'imp-1',
      date: d1,
      title: 'Metro Commute over Solo Car (18 km)',
      category: 'transit',
      co2SavedKg: 2.66,
      details: 'Substituted 18 km solo passenger car drive with electric metro line.',
    },
    {
      id: 'imp-2',
      date: d2,
      title: 'Carpool with 3 Neighbors to School',
      category: 'transit',
      co2SavedKg: 2.07,
      details: 'Unified school drop-off trip, reducing 2 cold-start gasoline engine trips.',
    },
    {
      id: 'imp-3',
      date: d3,
      title: 'HEPA Purifier Routine & Sealed Windows',
      category: 'indoor',
      co2SavedKg: 0.85,
      details: 'Prevented aerosol surge indoors, scheduled continuous sleep cycle at 18W.',
    },
  ];
}

export function saveImpactRecords(records: ImpactRecord[]): void {
  try {
    localStorage.setItem(IMPACT_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Impact save failed:', err);
  }
}

export const INITIAL_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'ch-1',
    title: 'Car-Free Winter Wednesday',
    description: 'Switch to metro, bus, bicycle, or walking for all trips today to avoid cold-start tailpipe smog.',
    impactTag: 'High Urban Air Benefit',
    durationDays: 1,
    progressDays: 1,
    participants: 1240,
    joined: true,
    completed: true,
    iconName: 'Footprints',
  },
  {
    id: 'ch-2',
    title: 'Peak Smog Window Shield (5 Days)',
    description: 'Keep residential windows closed during morning rush hour (7-10 AM) and verify outdoor air before exercising.',
    impactTag: 'Personal Exposure Shield',
    durationDays: 5,
    progressDays: 3,
    participants: 2890,
    joined: true,
    completed: false,
    iconName: 'Shield',
  },
  {
    id: 'ch-3',
    title: 'Air Purifier Maintenance & Dust Audit',
    description: 'Vacuum your pre-filter, check True-HEPA saturation, and wet-mop main rooms instead of dry brooming.',
    impactTag: 'Indoor IAQ Optimization',
    durationDays: 1,
    progressDays: 0,
    participants: 840,
    joined: false,
    completed: false,
    iconName: 'Sparkles',
  },
  {
    id: 'ch-4',
    title: 'Carpool Relay Challenge',
    description: 'Coordinate shared rides with at least 2 coworkers or parents for 3 consecutive days.',
    impactTag: 'Collective Emission Reduction',
    durationDays: 3,
    progressDays: 1,
    participants: 1530,
    joined: false,
    completed: false,
    iconName: 'Users',
  },
];

export function loadChallenges(): CommunityChallenge[] {
  try {
    const raw = localStorage.getItem(CHALLENGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_CHALLENGES;
}

export function saveChallenges(challenges: CommunityChallenge[]): void {
  try {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  } catch (err) {
    console.warn('Challenges save failed:', err);
  }
}
