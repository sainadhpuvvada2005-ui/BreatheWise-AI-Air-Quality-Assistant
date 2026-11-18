export type AQIStandard = 'indian' | 'us';

export interface AirPollutants {
  aqiIndian: number;
  categoryIndian: string;
  aqiUs: number;
  primaryPollutant: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCondition: string;
}

export interface HourlyAQI {
  time: string;
  hourLabel: string;
  pm25: number;
  pm10: number;
  aqi: number;
  temperature: number;
  isForecast: boolean;
}

export interface AirQualityResponse {
  source: string;
  isDemo: boolean;
  city: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  current: AirPollutants;
  hourly: HourlyAQI[];
}

export interface UserProfile {
  name: string;
  occupation: string; // 'Working Professional' | 'Student' | 'Homemaker' | 'Senior / Retiree'
  travelMethod: string; // 'Metro / Rail' | 'Public Bus' | 'Personal Car' | 'Motorcycle' | 'Bicycle / Walk' | 'Hybrid / WFH'
  workoutPreference: string; // 'Early Morning' | 'Midday' | 'Late Evening' | 'Indoor Only'
  householdType: string; // 'General' | 'Young Children (0-5)' | 'Elderly Parents (65+)' | 'Asthmatic / Respiratory'
  defaultCity: string;
  aqiStandard: AQIStandard;
  alertThreshold: number;
}

export interface RoutineTask {
  id: string;
  title: string;
  action: string;
  reason: string;
  isEcoFriendly: boolean;
  completed?: boolean;
}

export interface RoutinePlan {
  summary: string;
  smogRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  morning: RoutineTask[];
  afternoon: RoutineTask[];
  evening: RoutineTask[];
  generatedAt?: string;
}

export interface IndoorReading {
  pm25: number;
  co2?: number;
  humidity?: number;
  temp?: number;
  hasPhysicalMonitor: boolean;
  lastUpdated: string;
}

export interface TransitModeData {
  id: string;
  name: string;
  factorGramsPerKm: number; // grams CO2 equivalent per passenger-km
  description: string;
  icon: string;
  isZeroDirectEmission: boolean;
}

export interface ImpactRecord {
  id: string;
  date: string;
  title: string;
  category: 'transit' | 'indoor' | 'community' | 'lifestyle';
  co2SavedKg: number;
  details: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  impactTag: string;
  durationDays: number;
  progressDays: number;
  participants: number;
  joined: boolean;
  completed: boolean;
  iconName: string;
}

export interface HealthTierItem {
  id: string;
  category: 'respiratory' | 'ventilation' | 'exertion' | 'household';
  title: string;
  action: string;
  reason: string;
  badge: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HealthAdvisoryResponse {
  summary: string;
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
  lifestyleFocus: string;
  tiers: HealthTierItem[];
  generatedAt: string;
}

