import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI with recommended server-side settings
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to calculate Indian CPCB AQI from PM2.5 and PM10
function calculateIndianAQI(pm25: number, pm10: number): { aqi: number; category: string; primary: string } {
  // CPCB Breakpoints for PM2.5 (24-hr avg approx):
  // 0-30: Good (0-50)
  // 31-60: Satisfactory (51-100)
  // 61-90: Moderately Polluted (101-200)
  // 91-120: Poor (201-300)
  // 121-250: Very Poor (301-400)
  // 250+: Severe (401-500)
  let aqi25 = 0;
  if (pm25 <= 30) aqi25 = (50 / 30) * pm25;
  else if (pm25 <= 60) aqi25 = 50 + ((100 - 50) / (60 - 30)) * (pm25 - 30);
  else if (pm25 <= 90) aqi25 = 100 + ((200 - 100) / (90 - 60)) * (pm25 - 60);
  else if (pm25 <= 120) aqi25 = 200 + ((300 - 200) / (120 - 90)) * (pm25 - 90);
  else if (pm25 <= 250) aqi25 = 300 + ((400 - 300) / (250 - 120)) * (pm25 - 120);
  else aqi25 = 400 + ((500 - 400) / (380 - 250)) * (pm25 - 250);

  // CPCB Breakpoints for PM10:
  // 0-50: Good (0-50)
  // 51-100: Satisfactory (51-100)
  // 101-250: Moderate (101-200)
  // 251-350: Poor (201-300)
  // 351-430: Very Poor (301-400)
  // 430+: Severe (401-500)
  let aqi10 = 0;
  if (pm10 <= 50) aqi10 = pm10;
  else if (pm10 <= 100) aqi10 = 50 + ((100 - 50) / (100 - 50)) * (pm10 - 50);
  else if (pm10 <= 250) aqi10 = 100 + ((200 - 100) / (250 - 100)) * (pm10 - 100);
  else if (pm10 <= 350) aqi10 = 200 + ((300 - 200) / (350 - 250)) * (pm10 - 250);
  else if (pm10 <= 430) aqi10 = 300 + ((400 - 300) / (430 - 350)) * (pm10 - 350);
  else aqi10 = 400 + ((500 - 400) / (550 - 430)) * (pm10 - 430);

  const maxVal = Math.round(Math.max(aqi25, aqi10));
  const primary = aqi25 >= aqi10 ? 'PM2.5' : 'PM10';

  let category = 'Good';
  if (maxVal > 400) category = 'Severe';
  else if (maxVal > 300) category = 'Very Poor';
  else if (maxVal > 200) category = 'Poor';
  else if (maxVal > 100) category = 'Moderate';
  else if (maxVal > 50) category = 'Satisfactory';

  return { aqi: maxVal, category, primary };
}

// Fallback environmental data if external Open-Meteo API is unreachable
function getRealisticFallbackData(cityName: string, lat: number, lon: number) {
  const isSouthAsia = (lat > 8 && lat < 36 && lon > 68 && lon < 97);
  const basePM25 = isSouthAsia ? 142 : 18;
  const basePM10 = isSouthAsia ? 220 : 35;
  const indAqi = calculateIndianAQI(basePM25, basePM10);

  const now = new Date();
  const hourly = [];
  for (let i = -12; i <= 12; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    const hour = t.getHours();
    // Diurnal winter smog curve: highest at early morning and night due to inversion
    const diurnalFactor = (hour >= 6 && hour <= 10) || (hour >= 20 && hour <= 23) ? 1.35 : 0.85;
    const pm25 = Math.round(basePM25 * diurnalFactor);
    const pm10 = Math.round(basePM10 * diurnalFactor);
    hourly.push({
      time: t.toISOString(),
      hourLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pm25,
      pm10,
      aqi: Math.round(indAqi.aqi * diurnalFactor),
      temperature: Math.round(isSouthAsia ? 21 - Math.cos((hour - 4) / 12 * Math.PI) * 7 : 14 - Math.cos((hour - 4) / 12 * Math.PI) * 5),
      isForecast: i > 0,
    });
  }

  return {
    source: 'Open-Meteo & CAMS (Demonstration Fallback)',
    isDemo: true,
    city: cityName,
    latitude: lat,
    longitude: lon,
    updatedAt: now.toISOString(),
    current: {
      aqiIndian: indAqi.aqi,
      categoryIndian: indAqi.category,
      aqiUs: Math.min(500, Math.round(basePM25 * 1.8)),
      primaryPollutant: indAqi.primary,
      pm25: basePM25,
      pm10: basePM10,
      no2: isSouthAsia ? 48.5 : 16.2,
      o3: 32.1,
      so2: 12.4,
      co: isSouthAsia ? 1120 : 450,
      temperature: isSouthAsia ? 22 : 16,
      humidity: 68,
      windSpeed: 4.8,
      windDirection: 310,
      weatherCondition: isSouthAsia ? 'Hazy / Smog Inversion' : 'Partly Cloudy',
    },
    hourly,
  };
}

// 1. GET /api/air-quality: Live environmental telemetry endpoint
app.get('/api/air-quality', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 28.6139; // Default New Delhi
    const lon = parseFloat(req.query.lon as string) || 77.2090;
    const cityName = (req.query.city as string) || 'Selected Location';

    const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&hourly=pm10,pm2_5,us_aqi,european_aqi&past_days=1&forecast_days=2&timezone=auto`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;

    // Fetch with responsive timeout of 2.5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const [aqRes, weatherRes] = await Promise.allSettled([
      fetch(aqUrl, { signal: controller.signal }),
      fetch(weatherUrl, { signal: controller.signal }),
    ]);
    clearTimeout(timeoutId);

    if (aqRes.status !== 'fulfilled' || !aqRes.value.ok) {
      console.warn('Open-Meteo Air Quality API unreachable or failed; using realistic demonstration model.');
      return res.json(getRealisticFallbackData(cityName, lat, lon));
    }

    const aqData = await aqRes.value.json();
    let weatherData: any = null;
    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      weatherData = await weatherRes.value.json();
    }

    const currentAQ = aqData.current || {};
    const pm25 = Math.round((currentAQ.pm2_5 ?? 25) * 10) / 10;
    const pm10 = Math.round((currentAQ.pm10 ?? 45) * 10) / 10;
    const no2 = Math.round((currentAQ.nitrogen_dioxide ?? 20) * 10) / 10;
    const o3 = Math.round((currentAQ.ozone ?? 35) * 10) / 10;
    const so2 = Math.round((currentAQ.sulphur_dioxide ?? 10) * 10) / 10;
    const co = Math.round((currentAQ.carbon_monoxide ?? 400) * 10) / 10;

    const indCalc = calculateIndianAQI(pm25, pm10);
    const usAqi = Math.round(currentAQ.us_aqi ?? indCalc.aqi);

    const currentWeather = weatherData?.current || {};
    const temp = currentWeather.temperature_2m ?? 20;
    const humidity = currentWeather.relative_humidity_2m ?? 60;
    const windSpeed = currentWeather.wind_speed_10m ?? 8;
    const windDirection = currentWeather.wind_direction_10m ?? 0;

    // Build 24-hr sequence: 12 hours past + current + 12 hours forecast
    const hourlyTimes: string[] = aqData.hourly?.time || [];
    const hourlyPM25: number[] = aqData.hourly?.pm2_5 || [];
    const hourlyPM10: number[] = aqData.hourly?.pm10 || [];
    const hourlyUSAQI: number[] = aqData.hourly?.us_aqi || [];
    const weatherTemps: number[] = weatherData?.hourly?.temperature_2m || [];

    const nowIso = new Date();
    // find closest index in hourlyTimes
    let closestIdx = 0;
    let minDiff = Infinity;
    hourlyTimes.forEach((tStr, idx) => {
      const diff = Math.abs(new Date(tStr).getTime() - nowIso.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    const startIdx = Math.max(0, closestIdx - 12);
    const endIdx = Math.min(hourlyTimes.length, closestIdx + 13);
    const hourlyList = [];

    for (let i = startIdx; i < endIdx; i++) {
      const timeStr = hourlyTimes[i];
      const d = new Date(timeStr);
      const p25 = hourlyPM25[i] ?? pm25;
      const p10 = hourlyPM10[i] ?? pm10;
      const aqiVal = hourlyUSAQI[i] ?? calculateIndianAQI(p25, p10).aqi;
      hourlyList.push({
        time: timeStr,
        hourLabel: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pm25: Math.round(p25),
        pm10: Math.round(p10),
        aqi: Math.round(aqiVal),
        temperature: Math.round(weatherTemps[i] ?? temp),
        isForecast: i > closestIdx,
      });
    }

    return res.json({
      source: 'Open-Meteo Air Quality & CAMS Monitoring',
      isDemo: false,
      city: cityName,
      latitude: lat,
      longitude: lon,
      updatedAt: new Date().toISOString(),
      current: {
        aqiIndian: indCalc.aqi,
        categoryIndian: indCalc.category,
        aqiUs: usAqi,
        primaryPollutant: indCalc.primary,
        pm25,
        pm10,
        no2,
        o3,
        so2,
        co,
        temperature: Math.round(temp),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDirection,
        weatherCondition: temp < 18 && pm25 > 100 ? 'Winter Smog / Smoke Layer' : 'Live Atmospheric Measurement',
      },
      hourly: hourlyList,
    });
  } catch (err: any) {
    console.error('Air quality fetch error:', err);
    const fallback = getRealisticFallbackData(
      (req.query.city as string) || 'Current Location',
      parseFloat(req.query.lat as string) || 28.6139,
      parseFloat(req.query.lon as string) || 77.2090
    );
    return res.json(fallback);
  }
});

// 2. POST /api/chat: Conversational AI Air Quality Assistant powered by Gemini
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, environmentalContext, userProfile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const envInfo = environmentalContext || {};
    const profile = userProfile || {};

    const systemPrompt = `You are BreatheWise AI, an environmental awareness and air-quality guidance assistant.
Your responsibility is to help families and communities understand air pollution and make informed daily decisions.
You are given the following verified live environmental data from the user's dashboard:
- Location: ${envInfo.city || 'Unknown'} (${envInfo.latitude || 'N/A'}, ${envInfo.longitude || 'N/A'})
- Indian CPCB AQI: ${envInfo.aqiIndian ?? 'N/A'} (${envInfo.categoryIndian ?? 'N/A'})
- US EPA AQI: ${envInfo.aqiUs ?? 'N/A'}
- PM2.5: ${envInfo.pm25 ? envInfo.pm25 + ' µg/m³' : 'N/A'}
- PM10: ${envInfo.pm10 ? envInfo.pm10 + ' µg/m³' : 'N/A'}
- Temperature: ${envInfo.temperature ? envInfo.temperature + '°C' : 'N/A'}
- Humidity: ${envInfo.humidity ? envInfo.humidity + '%' : 'N/A'}
- Weather Condition: ${envInfo.weatherCondition || 'N/A'}
- Data Source: ${envInfo.source || 'Open-Meteo & CAMS'}

User Profile & Lifestyle:
- Status: ${profile.occupation || 'Standard Commuter'}
- Typical Travel Method: ${profile.travelMethod || 'Public Transit'}
- Household Vulnerability: ${profile.householdType || 'General Public'}
- Preferred Workout: ${profile.workoutPreference || 'Evening'}

Guidelines you MUST strictly follow:
1. Use the actual environmental information provided above. Never invent AQI values, pollution measurements, or weather information.
2. Generate clear, personalized, practical suggestions.
3. Explain WHY each recommendation matters.
4. Distinguish personal exposure reduction (e.g. wearing well-fitted N95/FFP2 respirators, air purifier with HEPA, avoiding rush hour) from environmental emission reduction (e.g. taking metro/bus, carpooling, avoiding open burning).
5. Do NOT make medical diagnoses or guarantee health outcomes.
6. For severe pollution conditions (AQI > 250 or PM2.5 > 120 µg/m³), explicitly advise following official local public health advisories and cautioning vulnerable groups (children, elderly, asthmatics).
7. Do not claim ordinary houseplants replace mechanical HEPA air filtration.
8. If any information is missing or requested for an unknown area, state the limitation clearly.
9. Format your responses with clean, organized markdown:
   - Brief direct answer
   - **Recommended Actions**
   - **Why It Matters**
   - **Precautionary Notes**`;

    if (!ai) {
      // Meaningful fallback if GEMINI_API_KEY is not configured
      const simulatedAdvice = `Based on current readings for **${envInfo.city || 'your area'}** (AQI: ${envInfo.aqiIndian || envInfo.aqiUs || 140}, PM2.5: ${envInfo.pm25 || 85} µg/m³):

### Current Situation
The ambient air quality is in the **${envInfo.categoryIndian || 'Unhealthy for Sensitive Groups'}** range. In winter conditions, thermal inversion layers trap fine particulates close to the ground, especially during early mornings and late nights.

### Recommended Actions
1. **Timing Outdoor Activity:** Shift any vigorous exercise indoors or postpone until midday (12:00 PM – 4:00 PM) when solar radiation helps disperse ground-level smog.
2. **Personal Protection:** If commuting during peak hours, use a certified, well-fitted particulate respirator (such as an N95 or FFP2). Cloth and surgical masks do not provide an airtight seal against sub-2.5-micron particles.
3. **Indoor Sanctuary:** Keep windows closed during high-smog periods. Run a HEPA air purifier on automatic mode in bedrooms and living spaces.
4. **Clean Commuting:** Prefer electric metro, public bus, or carpooling to reduce individual vehicular emissions during high pollution episodes.

*(Note: BreatheWise server running in demonstration mode. Connect your Gemini API key in Settings > Secrets for real-time generative dialogue).*`;

      return res.json({ reply: simulatedAdvice });
    }

    // Call Gemini API using recommended gemini-4-hydrogen model
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      // Include last 6 turns for context
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const reply = response.text || 'I apologize, but I could not formulate a response at this time. Please check your air quality parameters.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI response. ' + (error.message || 'Unknown error'),
    });
  }
});

// Helper to generate a tailored deterministic routine matching user profile and conditions
function generateStructuredRoutine(
  profile: any,
  aqi: number,
  category: string,
  pm25: number,
  city: string
) {
  const isSevere = aqi > 250;
  const isPoor = aqi > 150;
  const isMorningWorkout = (profile.workoutPreference || '').toLowerCase().includes('morning');
  const isTransit = (profile.travelMethod || '').toLowerCase().includes('metro') || (profile.travelMethod || '').toLowerCase().includes('bus');
  const isVulnerable = (profile.householdType || '').toLowerCase().includes('children') ||
    (profile.householdType || '').toLowerCase().includes('elderly') ||
    (profile.householdType || '').toLowerCase().includes('asthmatic');

  return {
    summary: `Strategic air protection plan for ${city} at AQI ${aqi} (${category}): prioritize indoor air filtration and shift outdoor exertion away from morning thermal smog traps.`,
    smogRiskLevel: isSevere ? 'Severe' : isPoor ? 'High' : 'Moderate',
    morning: [
      {
        id: 'm1',
        title: isSevere ? 'Strict Window Envelope Seal' : 'Morning Air Quality & Ventilation Check',
        action: isSevere
          ? 'Keep all home and bedroom windows tightly closed. Ground-level temperature inversion holds traffic exhaust near the surface until noon.'
          : 'Check live AQI before opening windows; keep windows closed during rush hour (7:00 AM – 10:00 AM) when commuter emissions peak.',
        reason: 'Nocturnal radiational cooling creates an atmospheric lid that traps PM2.5 within the lowest 50 meters of the urban boundary layer.',
        isEcoFriendly: false,
      },
      {
        id: 'm2',
        title: isTransit ? 'Protected Transit Commute' : 'Low-Emission Travel Strategy',
        action: isTransit
          ? `Proceed with ${profile.travelMethod || 'Public Transit'}; wear a certified, well-fitted N95/FFP2 respirator while walking and waiting at boarding platforms.`
          : 'Switch to enclosed public rail or electric bus to reduce direct tailpipe exhaust inhalation and prevent additional vehicular emissions.',
        reason: 'Public transit drastically reduces per-commuter soot discharge while respirators block microscopic sub-2.5-micron aerosols.',
        isEcoFriendly: true,
      },
      ...(isMorningWorkout ? [{
        id: 'm3',
        title: 'Indoor Workout Re-route',
        action: 'Shift cardiovascular training indoors into a room with an operating True-HEPA air purifier. Avoid outdoor jogging.',
        reason: 'Cardio exertion increases ventilation rate by 500-1000%, exponentially multiplying fine particle deposition deep in bronchioles.',
        isEcoFriendly: false,
      }] : []),
    ],
    afternoon: [
      {
        id: 'a1',
        title: 'Midday Atmospheric Inversion Lifting Window',
        action: 'Between 1:30 PM and 3:30 PM, solar radiation lifts the boundary layer. If outdoor PM2.5 drops, run a 15-minute cross-ventilation, then seal and filter.',
        reason: 'Solar thermal updrafts temporarily disperse particulate concentration before evening cooling re-traps emissions.',
        isEcoFriendly: false,
      },
      {
        id: 'a2',
        title: 'Workplace & Kitchen Air Optimization',
        action: 'Wipe desks with a damp microfiber cloth instead of dry dusting; ensure range hood exhaust fans run on high during any cooking.',
        reason: 'Cooking oil smoke and resuspension of settled dust are the primary indoor contributors to dangerous PM2.5 spikes.',
        isEcoFriendly: true,
      },
    ],
    evening: [
      {
        id: 'e1',
        title: (profile.workoutPreference || '').toLowerCase().includes('evening') ? 'Filtered Indoor Evening Workout' : 'Evening Smog Defense',
        action: isSevere
          ? 'Stay indoors. Evening rush-hour traffic coincides with rapid atmospheric cooling, spiking roadside particulate density.'
          : 'Exercise in a filtered indoor space. Keep window seals locked as ground temperatures drop.',
        reason: 'The nocturnal boundary layer begins contracting around sunset, capturing commuter soot directly at head height.',
        isEcoFriendly: false,
      },
      {
        id: 'e2',
        title: 'Bedroom Sanctuary Air Cleanse',
        action: 'Turn bedroom HEPA purifier to continuous sleep mode 30 minutes before sleep with doors closed; change into fresh indoor clothing.',
        reason: 'Removes commute-borne particulate soot from clothing and maintains sleeping PM2.5 below WHO 15 µg/m³ clean air standards.',
        isEcoFriendly: true,
      },
      ...(isVulnerable ? [{
        id: 'e3',
        title: 'Sensitive Household Respiratory Check',
        action: `Review respiratory comfort for ${profile.householdType || 'sensitive members'}. Ensure clean filtered air is active throughout the night.`,
        reason: 'Sub-micron soot causes delayed bronchial inflammation that frequently peaks during nocturnal sleep cycles.',
        isEcoFriendly: false,
      }] : []),
    ],
  };
}

// 3. POST /api/routine/generate: Personalized Daily Routine Planner
app.post('/api/routine/generate', async (req: Request, res: Response) => {
  try {
    const { environmentalContext, userProfile } = req.body;
    const envInfo = environmentalContext || {};
    const profile = userProfile || {};

    const aqi = envInfo.aqiIndian || envInfo.aqiUs || 150;
    const category = envInfo.categoryIndian || 'Moderate';
    const pm25 = envInfo.pm25 || 80;
    const city = envInfo.city || 'your area';

    const fallbackPlan = generateStructuredRoutine(profile, aqi, category, pm25, city);

    if (!ai) {
      return res.json(fallbackPlan);
    }

    try {
      const prompt = `Generate a personalized 3-part daily routine plan (Morning, Afternoon, Evening) for a resident in ${city} with current AQI ${aqi} (${category}, PM2.5: ${pm25} µg/m³).
User lifestyle details:
- Status: ${profile.occupation || 'Working professional'}
- Travel Method: ${profile.travelMethod || 'Public Transit'}
- Preferred Exercise: ${profile.workoutPreference || 'Morning'}
- Household Sensitivity: ${profile.householdType || 'General'}

Return a valid JSON object matching this schema:
{
  "summary": "Short 1-2 sentence overview of today's air quality strategy",
  "smogRiskLevel": "Low" | "Moderate" | "High" | "Severe",
  "morning": [
    { "id": "m1", "title": "short task name", "action": "concrete practical recommendation", "reason": "why it matters", "isEcoFriendly": true/false }
  ],
  "afternoon": [
    { "id": "a1", "title": "short task name", "action": "concrete practical recommendation", "reason": "why it matters", "isEcoFriendly": true/false }
  ],
  "evening": [
    { "id": "e1", "title": "short task name", "action": "concrete practical recommendation", "reason": "why it matters", "isEcoFriendly": true/false }
  ]
}`;

      // Enforce a strict 6-second timeout race so generation never hangs
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini generation timeout')), 6000)
      );

      const aiPromise = ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: 'You are an environmental epidemiologist. Return valid JSON only adhering strictly to the schema provided.',
        },
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);
      let rawText = (response.text || '').trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(rawText);
      if (parsed && Array.isArray(parsed.morning) && Array.isArray(parsed.afternoon)) {
        return res.json(parsed);
      }
      return res.json(fallbackPlan);
    } catch (aiErr) {
      console.warn('Gemini routine generation fallback used:', aiErr);
      return res.json(fallbackPlan);
    }
  } catch (err: any) {
    console.error('Routine endpoint error:', err);
    return res.json(generateStructuredRoutine({}, 150, 'Moderate', 80, 'your area'));
  }
});

// Helper to generate a tailored deterministic health advisory matching current conditions
function generateStructuredHealthAdvisory(
  profile: any,
  aqi: number,
  category: string,
  pm25: number,
  city: string
) {
  const isSevere = aqi > 250;
  const isHigh = aqi > 150;
  const isModerate = aqi > 100;
  const overallRisk = isSevere ? 'Severe' : isHigh ? 'High' : isModerate ? 'Moderate' : 'Low';
  const workout = (profile.workoutPreference || '').toLowerCase();
  const household = (profile.householdType || '').toLowerCase();

  return {
    summary: isSevere
      ? `Severe smog inversion detected in ${city}. Ultrafine PM2.5 is concentrated at surface level. Mandatory respiratory precautions apply.`
      : isHigh
      ? `Air quality is unhealthy in ${city} (AQI ${aqi}). Fine particulate soot requires sealed indoor protection and modified cardio routines.`
      : isModerate
      ? `Moderate air quality in ${city}. Vulnerable groups should limit prolonged outdoor exertion during peak rush hours.`
      : `Air quality in ${city} is satisfactory (AQI ${aqi}). Optimal conditions for normal outdoor activities and natural home ventilation.`,
    overallRisk,
    lifestyleFocus: household.includes('children')
      ? 'Customized for families with young children (higher inhalation volume per kg)'
      : household.includes('elderly')
      ? 'Customized for senior family members (cardiopulmonary preservation)'
      : household.includes('asthmatic')
      ? 'Customized for asthmatic / chronic bronchial sensitivity'
      : 'Customized for everyday urban commuters and active residents',
    tiers: [
      {
        id: 'tier-resp',
        category: 'respiratory',
        title: 'Respiratory Protection & Masking',
        badge: isSevere ? 'Certified N95/FFP2 Mandatory' : isHigh ? 'N95/FFP2 Recommended' : 'Optional / Low Risk',
        action: isHigh || isSevere
          ? 'Wear a certified particulate respirator (N95, KN95, or FFP2) with an airtight nasal seal whenever outdoors. Standard cloth or surgical masks leak up to 70% of fine sub-micron soot.'
          : 'Particulate masking is generally optional, but recommended when commuting along high-density diesel truck routes.',
        reason: 'PM2.5 particles are 30 times smaller than human hair and bypass upper airway cilia directly into bronchial alveoli.',
        priority: isHigh || isSevere ? 'high' : 'low',
      },
      {
        id: 'tier-vent',
        category: 'ventilation',
        title: 'Indoor Air & Ventilation Timing',
        badge: isSevere ? 'Strictly Sealed 24/7' : isHigh ? 'Midday 15-Min Window Only' : 'Safe to Ventilate',
        action: isSevere
          ? 'Keep building envelopes tightly sealed. Run continuous True-HEPA air purification on medium/high speed in primary rooms.'
          : isHigh
          ? 'Avoid opening windows in early morning and late night. If cross-ventilation is needed, limit to 1:30 PM – 3:30 PM when solar warming lifts the boundary layer.'
          : 'Open windows during clean afternoon hours to flush out exhaled carbon dioxide and replenish indoor oxygen.',
        reason: 'Winter temperature inversions form at dawn and dusk, creating a cold lid that traps combustion soot directly at street level.',
        priority: isSevere ? 'high' : isHigh ? 'medium' : 'low',
      },
      {
        id: 'tier-exer',
        category: 'exertion',
        title: 'Physical Activity & Cardio Adaptation',
        badge: isSevere ? 'Cancel Outdoor Exercise' : isHigh ? 'Shift Workouts Indoors' : 'Full Outdoor Cardio Safe',
        action: isSevere
          ? 'Cancel all outdoor running, cycling, and strenuous exercise. Shift cardio routines to indoor spaces equipped with operating HEPA filtration.'
          : isHigh
          ? workout.includes('morning')
            ? 'Avoid morning outdoor jogging. Shift cardiovascular exertion indoors to prevent inhaling concentrated nocturnal inversion smog.'
            : 'Reduce prolonged cardio duration outdoors; avoid busy highway corridors during peak transit hours.'
          : 'Outdoor running, cycling, and sports are safe for all fitness levels under current atmospheric conditions.',
        reason: 'Vigorous exercise increases minute ventilation by 5x to 10x, forcing fine particles deep into pulmonary capillary beds.',
        priority: isHigh || isSevere ? 'high' : 'low',
      },
      {
        id: 'tier-house',
        category: 'household',
        title: 'Household & Sensitive Group Care',
        badge: household.includes('children') || household.includes('elderly') || household.includes('asthmatic') ? 'High Sensitivity Alert' : 'Standard Baseline',
        action: household.includes('children')
          ? 'Children breathe 50% more air per pound of body weight than adults. Keep play indoors during high smog episodes and ensure school rooms use air cleaners.'
          : household.includes('elderly')
          ? 'Seniors should avoid sudden thermal transitions and keep prescribed cardiopulmonary medications easily accessible.'
          : household.includes('asthmatic')
          ? 'Keep rescue inhalers accessible. Ensure bedroom humidity is kept in the 40-50% sweet spot to avoid airway irritation.'
          : 'Maintain general hydration, wash eyes and face with cool water after commuting, and minimize indoor combustion (candles, incense, frying).',
        reason: 'Children, seniors, and individuals with reactive airways experience heightened acute inflammatory responses to fine PM2.5 and NO2.',
        priority: isSevere || isHigh ? 'high' : 'medium',
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

// 4. POST /api/health-advisory: Context-aware personalized health recommendations
app.post('/api/health-advisory', async (req: Request, res: Response) => {
  try {
    const { environmentalContext, userProfile } = req.body;
    const envInfo = environmentalContext || {};
    const profile = userProfile || {};

    const aqi = envInfo.aqiIndian || envInfo.aqiUs || 150;
    const category = envInfo.categoryIndian || 'Moderate';
    const pm25 = envInfo.pm25 || 80;
    const city = envInfo.city || 'your area';

    const fallbackAdvisory = generateStructuredHealthAdvisory(profile, aqi, category, pm25, city);

    if (!ai) {
      return res.json(fallbackAdvisory);
    }

    try {
      const prompt = `Generate a personalized, medically accurate environmental health advisory for a resident in ${city} with current AQI ${aqi} (${category}, PM2.5: ${pm25} µg/m³, Temp: ${envInfo.temperature || 20}°C, Humidity: ${envInfo.humidity || 60}%).
User Profile:
- Occupation: ${profile.occupation || 'Resident'}
- Travel Mode: ${profile.travelMethod || 'Public Transit'}
- Workout Habit: ${profile.workoutPreference || 'Evening'}
- Household Sensitivity: ${profile.householdType || 'General Public'}

Return a valid JSON object matching this exact schema:
{
  "summary": "1-2 sentence clinical-grade summary diagnosing today's atmospheric threat level and primary exposure vector",
  "overallRisk": "Low" | "Moderate" | "High" | "Severe" | "Critical",
  "lifestyleFocus": "Short 1-sentence note on why this advice is specifically tailored to their household or workout habits",
  "tiers": [
    {
      "id": "tier-resp",
      "category": "respiratory",
      "title": "Respiratory Protection & Masking",
      "badge": "Short badge text (e.g. N95 Mandatory, FFP2 Recommended, Optional)",
      "action": "Concrete practical recommendation on mask type and seal checking",
      "reason": "Scientific explanation of particle penetration and filtration physics",
      "priority": "high" | "medium" | "low"
    },
    {
      "id": "tier-vent",
      "category": "ventilation",
      "title": "Indoor Air & Ventilation Timing",
      "badge": "Short badge text (e.g. Seal Windows, 1:30-3:30 PM Window)",
      "action": "Concrete instructions on window management and HEPA filtration",
      "reason": "Explanation of thermal inversion layer diurnal dynamics",
      "priority": "high" | "medium" | "low"
    },
    {
      "id": "tier-exer",
      "category": "exertion",
      "title": "Physical Activity & Cardio Adaptation",
      "badge": "Short badge text (e.g. Indoor Gym Only, Safe for Outdoor Cardio)",
      "action": "Guidance on modifying workout timing and intensity for their preference (${profile.workoutPreference || 'Evening'})",
      "reason": "Explanation of alveolar particle deposition at elevated minute ventilation rates",
      "priority": "high" | "medium" | "low"
    },
    {
      "id": "tier-house",
      "category": "household",
      "title": "Household & Sensitive Group Care",
      "badge": "Short badge text (e.g. Pediatric Alert, Senior Care, Standard)",
      "action": "Tailored guidance specifically for ${profile.householdType || 'General Population'}",
      "reason": "Vulnerability physiology explanation",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

      // Enforce a strict 6-second timeout race
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health advisory Gemini timeout')), 6000)
      );

      const aiPromise = ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: 'You are an environmental epidemiologist and pulmonologist. Return valid JSON only adhering strictly to the schema provided. Prioritize safety, factual accuracy, and clear distinctions between personal exposure reduction and emission reduction.',
        },
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);
      let rawText = (response.text || '').trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      }

      const parsed = JSON.parse(rawText);
      if (parsed && Array.isArray(parsed.tiers) && parsed.tiers.length >= 3) {
        return res.json({
          ...parsed,
          generatedAt: new Date().toISOString(),
        });
      }
      return res.json(fallbackAdvisory);
    } catch (aiErr) {
      console.warn('Gemini health advisory fallback used:', aiErr);
      return res.json(fallbackAdvisory);
    }
  } catch (err: any) {
    console.error('Health advisory endpoint error:', err);
    return res.json(generateStructuredHealthAdvisory({}, 150, 'Moderate', 80, 'your area'));
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BreatheWise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
