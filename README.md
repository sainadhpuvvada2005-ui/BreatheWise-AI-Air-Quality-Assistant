# BreatheWise – Your AI Air Quality Companion

> **"Breathe Smarter. Live Healthier. Build a Cleaner Tomorrow."**

BreatheWise is a production-grade, full-stack, GenAI-powered web application designed to help families, commuters, and urban communities navigate severe winter smog and urban air pollution. 

Unlike conventional weather monitors that merely display numbers, BreatheWise translates real-time particulate dynamics (PM2.5, PM10, NO2, O3, CO) and thermal inversion meteorology into practical, low-exposure daily actions and measurable carbon-reduction routines.

---

## 🌟 Key Features

### 1. Interactive Environmental Dashboard
- **Dual AQI Standards:** Real-time computation of Indian CPCB NAQI (Central Pollution Control Board) and US EPA Air Quality Index.
- **Atmospheric Telemetry:** Real-time tracking of PM2.5 (fine soot), PM10 (coarse dust), NO2 (vehicular traffic), O3, CO, SO2, temperature, humidity, and wind velocity.
- **Diurnal 24-Hour Smog Trend:** Interactive Recharts area chart capturing past 12-hour history and 12-hour hourly forecast to pinpoint diurnal winter inversion peaks.
- **Location Selector:** Global and smog-sensitive presets (New Delhi, Mumbai, Lahore, Beijing, Bangkok, Milan, Los Angeles, London, etc.) + GPS live geolocation.

### 2. Conversational AI Air Quality Assistant (Gemini)
- Powered by server-side **Google Gemini** (`gemini-4-hydrogen`).
- Context-aware dialogue fed with live atmospheric data (AQI, PM2.5, weather, user lifestyle, and household vulnerability).
- Answers critical questions regarding outdoor workouts, pediatric smog safety, certified respirators vs surgical masks, and ventilation timing.
- Strictly distinguishes **personal exposure reduction** (protecting lungs) from **environmental emission reduction** (protecting the air basin).

### 3. Circadian Daily Routine Planner
- Generates a customized 3-part routine (Morning, Afternoon, Evening) based on local atmospheric boundary layers.
- Checkable interactive tasks with real-time adherence progress bars.
- Tailored to user's profession, commuting method, workout hours, and sensitive family members (infants, elderly, asthmatics).

### 4. Indoor Air Quality (IAQ) Assistant
- **Physical Monitor vs. Ambient Air:** Transparently explains why outdoor AQI cannot determine indoor air without physical sensors.
- **Manual Indoor Monitor Input:** Track indoor PM2.5, CO2, humidity, and temperature.
- **CADR Sizing Calculator:** Determines required Clean Air Delivery Rate (CFM) for 5 room air changes/hour.
- **Filter Lifecycle Counters:** Track pre-filter rinse cycles and True-HEPA cartridge replacements.
- **Action Protocols:** Wet mopping vs dry sweeping, range hood exhaust protocols, and humidity optimization.

### 5. Sustainable Transportation Assistant
- **Interactive Mobility Calculator:** Compares emissions across 8 transit modes (Gasoline car, Diesel, Electric vehicle, Motorcycle, CNG Bus, Electric Metro, Carpool, and Walking/Biking).
- **Quantified Avoided Carbon:** Estimates per-trip, weekly, and monthly CO2e savings based on IPCC/DEFRA mobility factors.
- **Direct Logging:** One-click logging into the user's permanent Impact Tracker.

### 6. Environmental Impact Tracker
- Tracks total kilograms of CO2 avoided, sustainable commutes logged, and clean air habits completed.
- 7-day velocity bar charts.
- Deep-dive educational article on exposure reduction vs. emission abatement.

### 7. Community Awareness & Eco-Challenges
- Weekly community challenges (Car-Free Wednesday, Peak Smog Window Shield, Air Purifier Audit, Carpool Relay) with progress tracking.
- Winter Smog Knowledge Base explaining thermal inversions, biomass burning, and cold-start vehicular emissions.

### 8. User Profile, Settings & Dual-Theme
- Customizable profile, notification smog alert threshold, default city, and calculation standards.
- Seamless Light / Dark mode.
- 100% on-device privacy guarantee with zero telemetry transmission.

---

## 🛠 Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts.
- **Backend:** Node.js, Express (full-stack API server hosting Vite middlewares in dev).
- **GenAI Engine:** Google Gemini API (`@google/genai` SDK using `gemini-4-hydrogen`).
- **Environmental Telemetry:** Open-Meteo Air Quality API & CAMS (Copernicus Atmosphere Monitoring Service) with resilient fallback simulation models.
- **Persistence:** LocalStorage for user privacy and persistent habit tracking.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd breathewise
npm install
```

### 2. Environment Variable Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Gemini API Key (Injected automatically in Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Application URL
APP_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
The app will launch on `http://localhost:3000` with full-stack API proxying and hot client serving.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛡 Security & Safety Boundaries
- **API Key Protection:** The Gemini API key is strictly maintained on the server (`server.ts`) and is never leaked to client bundles.
- **Medical Disclaimer:** BreatheWise provides educational environmental health guidance and practical pollution navigation; it does not diagnose medical conditions or substitute for professional medical care.
- **Official Health Advisories:** In severe air pollution emergencies (AQI > 300), users are always directed to local municipal emergency guidelines.

---

*Product tagline: Breathe Smarter. Live Healthier. Build a Cleaner Tomorrow.*
