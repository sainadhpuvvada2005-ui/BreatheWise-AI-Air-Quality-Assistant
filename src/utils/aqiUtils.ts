import { AQIStandard } from '../types';

export interface AQICategoryInfo {
  label: string;
  min: number;
  max: number;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  advisories: {
    general: string;
    sensitive: string;
    outdoorActivity: string;
    ventilation: string;
    maskRequired: boolean;
    maskType: string;
  };
}

export const INDIAN_AQI_CATEGORIES: AQICategoryInfo[] = [
  {
    label: 'Good',
    min: 0,
    max: 50,
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    advisories: {
      general: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      sensitive: 'No special health precautions required.',
      outdoorActivity: 'Ideal conditions for outdoor sports, morning walks, and cycling.',
      ventilation: 'Excellent time to open windows and naturally ventilate indoor spaces.',
      maskRequired: false,
      maskType: 'None needed',
    },
  },
  {
    label: 'Satisfactory',
    min: 51,
    max: 100,
    colorClass: 'text-teal-500 dark:text-teal-400',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    advisories: {
      general: 'Minor breathing discomfort to sensitive people; acceptable for general population.',
      sensitive: 'Individuals with asthma or cardiopulmonary disease may notice mild symptoms.',
      outdoorActivity: 'Safe for normal outdoor recreation. Moderate exertion acceptable.',
      ventilation: 'Natural ventilation is safe during clean afternoon hours.',
      maskRequired: false,
      maskType: 'Optional for hyper-sensitive individuals near traffic corridors',
    },
  },
  {
    label: 'Moderate',
    min: 101,
    max: 200,
    colorClass: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    advisories: {
      general: 'Breathing discomfort to people with lungs, asthma, and heart diseases.',
      sensitive: 'Children and seniors should reduce prolonged or heavy outdoor exertion.',
      outdoorActivity: 'Consider reducing prolonged outdoor jogging; exercise in afternoon rather than dawn.',
      ventilation: 'Limit natural ventilation to 15-20 min during midday when sun disperses ground soot.',
      maskRequired: false,
      maskType: 'N95 recommended for heavy traffic commutes or prolonged exposure',
    },
  },
  {
    label: 'Poor',
    min: 201,
    max: 300,
    colorClass: 'text-orange-500 dark:text-orange-400',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
    advisories: {
      general: 'Breathing discomfort to most people on prolonged exposure; significant smog haze.',
      sensitive: 'Children, seniors, and asthmatics must avoid outdoor exertion.',
      outdoorActivity: 'Avoid outdoor cardio. Shift workouts to indoor filtered spaces.',
      ventilation: 'Keep windows closed. Thermal inversion traps ground pollutants.',
      maskRequired: true,
      maskType: 'Fitted N95, KN95, or FFP2 respirator outdoors (surgical masks do not seal fine PM2.5)',
    },
  },
  {
    label: 'Very Poor',
    min: 301,
    max: 400,
    colorClass: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
    advisories: {
      general: 'Respiratory illness to the people on prolonged exposure. Significant winter smog emergency.',
      sensitive: 'Strictly remain indoors in rooms with operational HEPA filtration.',
      outdoorActivity: 'Zero prolonged outdoor activities. All sports and runs must be cancelled.',
      ventilation: 'Do not open windows. Seal drafts and run HEPA air cleaners on high.',
      maskRequired: true,
      maskType: 'Certified N95/FFP2 tightly sealed over nose and mouth for any necessary transit',
    },
  },
  {
    label: 'Severe',
    min: 401,
    max: 500,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    advisories: {
      general: 'Affects healthy people and seriously impacts those with existing diseases. Public health alert.',
      sensitive: 'Extreme danger: consult healthcare provider if experiencing chest tightness or wheezing.',
      outdoorActivity: 'Avoid all outdoor exposure. Work from home if possible.',
      ventilation: 'Keep all building envelopes strictly sealed. Use HEPA air purifiers continuous 24/7.',
      maskRequired: true,
      maskType: 'Mandatory certified N95/FFP2/N99 respirator with airtight nasal strip check',
    },
  },
];

export const US_AQI_CATEGORIES: AQICategoryInfo[] = [
  {
    label: 'Good (0-50)',
    min: 0,
    max: 50,
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    advisories: {
      general: 'Air quality is satisfactory and poses little or no health risk.',
      sensitive: 'None required.',
      outdoorActivity: 'Great day for outdoor activities.',
      ventilation: 'Safe to open windows.',
      maskRequired: false,
      maskType: 'None',
    },
  },
  {
    label: 'Moderate (51-100)',
    min: 51,
    max: 100,
    colorClass: 'text-teal-500 dark:text-teal-400',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    advisories: {
      general: 'Air quality is acceptable; however, unusually sensitive people should consider reducing exertion.',
      sensitive: 'Unusually sensitive individuals should monitor respiratory symptoms.',
      outdoorActivity: 'Generally safe; sensitive groups take it easier.',
      ventilation: 'Acceptable during afternoon.',
      maskRequired: false,
      maskType: 'Optional',
    },
  },
  {
    label: 'Unhealthy for Sensitive Groups (101-150)',
    min: 101,
    max: 150,
    colorClass: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    advisories: {
      general: 'Members of sensitive groups may experience health effects. General public not likely affected.',
      sensitive: 'Children, seniors, and lung/heart patients should reduce strenuous outdoor exertion.',
      outdoorActivity: 'Take more breaks, avoid rush-hour highway corridors.',
      ventilation: 'Limit outdoor air intake during traffic peaks.',
      maskRequired: false,
      maskType: 'N95 recommended for sensitive groups commuting',
    },
  },
  {
    label: 'Unhealthy (151-200)',
    min: 151,
    max: 200,
    colorClass: 'text-orange-500 dark:text-orange-400',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-200 dark:border-orange-800',
    advisories: {
      general: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
      sensitive: 'Avoid prolonged outdoor exertion. Stay indoors as much as possible.',
      outdoorActivity: 'Avoid outdoor exercise; move activities indoors.',
      ventilation: 'Keep windows and doors closed. Run mechanical filtration.',
      maskRequired: true,
      maskType: 'N95/KN95 respirator outdoors',
    },
  },
  {
    label: 'Very Unhealthy (201-300)',
    min: 201,
    max: 300,
    colorClass: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-200 dark:border-rose-800',
    advisories: {
      general: 'Health alert: the risk of health effects is increased for everyone in the area.',
      sensitive: 'Avoid all physical activity outdoors. Vulnerable people remain strictly inside.',
      outdoorActivity: 'No outdoor activities recommended.',
      ventilation: 'Seal windows. Run air purifiers on high mode.',
      maskRequired: true,
      maskType: 'Certified N95/FFP2 tightly sealed',
    },
  },
  {
    label: 'Hazardous (301-500)',
    min: 301,
    max: 500,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    advisories: {
      general: 'Health warning of emergency conditions: everyone is more likely to be affected.',
      sensitive: 'Immediate serious health risk for vulnerable individuals.',
      outdoorActivity: 'Remain indoors. Keep physical activity at minimum level.',
      ventilation: 'Strictly sealed interior spaces with HEPA filtration.',
      maskRequired: true,
      maskType: 'N95/N99/FFP3 respirator required outdoors',
    },
  },
];

export function getCategoryInfo(aqi: number, standard: AQIStandard = 'indian'): AQICategoryInfo {
  const categories = standard === 'indian' ? INDIAN_AQI_CATEGORIES : US_AQI_CATEGORIES;
  const match = categories.find((c) => aqi >= c.min && aqi <= c.max);
  return match || categories[categories.length - 1];
}

export interface CityPreset {
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  isSmogProne: boolean;
}

export const PRESET_CITIES: CityPreset[] = [
  { name: 'New Delhi', country: 'India', region: 'National Capital Region', lat: 28.6139, lon: 77.2090, isSmogProne: true },
  { name: 'Mumbai', country: 'India', region: 'Maharashtra', lat: 19.0760, lon: 72.8777, isSmogProne: true },
  { name: 'Kolkata', country: 'India', region: 'West Bengal', lat: 22.5726, lon: 88.3639, isSmogProne: true },
  { name: 'Lahore', country: 'Pakistan', region: 'Punjab', lat: 31.5204, lon: 74.3587, isSmogProne: true },
  { name: 'Beijing', country: 'China', region: 'Beijing', lat: 39.9042, lon: 116.4074, isSmogProne: true },
  { name: 'Bangkok', country: 'Thailand', region: 'Central', lat: 13.7563, lon: 100.5018, isSmogProne: true },
  { name: 'Jakarta', country: 'Indonesia', region: 'Java', lat: -6.2088, lon: 106.8456, isSmogProne: true },
  { name: 'Milan', country: 'Italy', region: 'Po Valley', lat: 45.4642, lon: 9.1900, isSmogProne: true },
  { name: 'London', country: 'United Kingdom', region: 'Greater London', lat: 51.5074, lon: -0.1278, isSmogProne: false },
  { name: 'Los Angeles', country: 'United States', region: 'California', lat: 34.0522, lon: -118.2437, isSmogProne: true },
  { name: 'New York', country: 'United States', region: 'New York', lat: 40.7128, lon: -74.0060, isSmogProne: false },
  { name: 'Tokyo', country: 'Japan', region: 'Kanto', lat: 35.6762, lon: 139.6503, isSmogProne: false },
];

export const TRANSIT_MODES = [
  {
    id: 'car_petrol',
    name: 'Personal Gasoline Car',
    factorGramsPerKm: 172,
    description: 'Average passenger ICE vehicle emitting CO2, NOx, and fine exhaust particulates.',
    icon: 'Car',
    isZeroDirectEmission: false,
  },
  {
    id: 'car_diesel',
    name: 'Personal Diesel Car',
    factorGramsPerKm: 168,
    description: 'Higher NOx and black carbon particulate emissions per kilometer traveled.',
    icon: 'Car',
    isZeroDirectEmission: false,
  },
  {
    id: 'car_ev',
    name: 'Electric Vehicle (Grid avg)',
    factorGramsPerKm: 47,
    description: 'Zero tailpipe emissions at ground level; lifecycle emissions depend on grid mix.',
    icon: 'Zap',
    isZeroDirectEmission: true,
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle / Scooter',
    factorGramsPerKm: 98,
    description: 'Lower CO2 than a car, but higher localized PM and HC emissions without catalytic converter.',
    icon: 'Bike',
    isZeroDirectEmission: false,
  },
  {
    id: 'bus_cng',
    name: 'Public Bus (CNG / Hybrid)',
    factorGramsPerKm: 42,
    description: 'Shared high-capacity transit significantly decreases per-capita street congestion and soot.',
    icon: 'Bus',
    isZeroDirectEmission: false,
  },
  {
    id: 'metro_train',
    name: 'Electric Metro / Rapid Rail',
    factorGramsPerKm: 24,
    description: 'Most energy-efficient urban mobility mode with zero local street smog exposure.',
    icon: 'Train',
    isZeroDirectEmission: true,
  },
  {
    id: 'carpool',
    name: 'Carpool (3 occupants)',
    factorGramsPerKm: 57,
    description: 'Shared personal ride dividing vehicular emissions across 3 commuters.',
    icon: 'Users',
    isZeroDirectEmission: false,
  },
  {
    id: 'bicycle_walk',
    name: 'Active Transit (Cycling / Walking)',
    factorGramsPerKm: 0,
    description: 'Zero emissions. In high smog, ensure appropriate N95 respiratory protection or choose transit.',
    icon: 'Footprints',
    isZeroDirectEmission: true,
  },
];
