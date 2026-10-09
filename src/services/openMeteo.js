// ── Open-Meteo Numerical Weather Prediction (NWP) API Service ──
// Provides real-time observations, multi-horizon forecasts, and NWP model comparisons.

export const WEATHER_MODELS = [
  { id: "best_match", name: "Best Match (Auto-Blend)", org: "Open-Meteo Ensemble", desc: "Optimal multi-model weighted blend" },
  { id: "ecmwf_ifs025", name: "ECMWF IFS (0.25°)", org: "ECMWF Europe", desc: "World-leading numerical medium-range model" },
  { id: "gfs_seamless", name: "NOAA GFS Seamless", org: "NOAA / NCEP USA", desc: "US Global Forecast System atmospheric model" },
  { id: "icon_seamless", name: "DWD ICON Seamless", org: "DWD Germany", desc: "German Weather Service icosahedral grid" },
  { id: "gem_seamless", name: "CMC GEM Seamless", org: "Canada Met Centre", desc: "Canadian Global Environmental Multiscale" },
];

export const WMO_CODES = {
  0: { label: "Clear sky", icon: "☀️", color: "text-amber-400" },
  1: { label: "Mainly clear", icon: "🌤️", color: "text-amber-300" },
  2: { label: "Partly cloudy", icon: "⛅", color: "text-sky-300" },
  3: { label: "Overcast", icon: "☁️", color: "text-slate-300" },
  45: { label: "Foggy", icon: "🌫️", color: "text-slate-400" },
  48: { label: "Depositing rime fog", icon: "🌫️", color: "text-slate-400" },
  51: { label: "Light drizzle", icon: "🌦️", color: "text-sky-300" },
  53: { label: "Moderate drizzle", icon: "🌧️", color: "text-sky-400" },
  55: { label: "Dense drizzle", icon: "🌧️", color: "text-sky-500" },
  56: { label: "Freezing drizzle", icon: "🌨️", color: "text-cyan-300" },
  57: { label: "Dense freezing drizzle", icon: "🌨️", color: "text-cyan-400" },
  61: { label: "Slight rain", icon: "🌦️", color: "text-sky-400" },
  63: { label: "Moderate rain", icon: "🌧️", color: "text-blue-400" },
  65: { label: "Heavy rain", icon: "🌧️", color: "text-blue-600" },
  66: { label: "Freezing rain", icon: "🌨️", color: "text-cyan-400" },
  67: { label: "Heavy freezing rain", icon: "🌨️", color: "text-cyan-600" },
  71: { label: "Slight snow", icon: "🌨️", color: "text-slate-100" },
  73: { label: "Moderate snow", icon: "❄️", color: "text-slate-200" },
  75: { label: "Heavy snow", icon: "❄️", color: "text-slate-300" },
  77: { label: "Snow grains", icon: "🌨️", color: "text-slate-200" },
  80: { label: "Slight rain showers", icon: "🌦️", color: "text-sky-400" },
  81: { label: "Moderate rain showers", icon: "🌧️", color: "text-blue-400" },
  82: { label: "Violent rain showers", icon: "⛈️", color: "text-indigo-500" },
  85: { label: "Slight snow showers", icon: "🌨️", color: "text-slate-200" },
  86: { label: "Heavy snow showers", icon: "❄️", color: "text-slate-300" },
  95: { label: "Thunderstorm", icon: "⚡", color: "text-amber-500" },
  96: { label: "Thunderstorm with hail", icon: "⛈️", color: "text-amber-600" },
  99: { label: "Severe thunderstorm with hail", icon: "🌩️", color: "text-red-500" },
};

export function getWmoInfo(code) {
  return WMO_CODES[code] || { label: "Fair", icon: "🌤️", color: "text-sky-300" };
}

// In-memory cache to prevent redundant API calls
const cache = {
  allStates: {},      // key: model
  allStatesTime: {},  // key: model -> timestamp
  stateDetailed: {},  // key: `${stateId}_${model}`
  stateDetailedTime: {},
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch Open-Meteo forecast data for all Indian states in a single batch request
 * @param {Array} statesList Array of state objects { id, lat, lon, name }
 * @param {string} model NWP model identifier
 * @returns {Promise<Object>} Formatted series for all states
 */
export async function fetchAllStatesOpenMeteo(statesList, model = "best_match") {
  const cacheKey = model || "best_match";
  const now = Date.now();
  if (cache.allStates[cacheKey] && now - (cache.allStatesTime[cacheKey] || 0) < CACHE_TTL_MS) {
    return cache.allStates[cacheKey];
  }

  const lats = statesList.map((s) => s.lat).join(",");
  const lons = statesList.map((s) => s.lon).join(",");

  let url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code` +
    `&past_days=1&forecast_days=2&timezone=Asia%2FKolkata`;

  if (model && model !== "best_match") {
    url += `&models=${model}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API responded with status ${res.status}`);
  }

  const data = await res.json();
  const results = Array.isArray(data) ? data : [data];

  const series = {};
  const currentDetails = {};

  results.forEach((item, index) => {
    const state = statesList[index];
    if (!state) return;

    const hourly = item.hourly || {};
    const times = hourly.time || [];
    const current = item.current || {};

    // Find index of current hour
    const currentIsoHour = current.time ? current.time.slice(0, 13) + ":00" : "";
    let nowIdx = times.findIndex((t) => t.startsWith(currentIsoHour));
    if (nowIdx === -1) {
      nowIdx = Math.floor(times.length / 2);
    }

    const stepMap = {
      "-24h": Math.max(0, nowIdx - 24),
      "-12h": Math.max(0, nowIdx - 12),
      "NOW": nowIdx,
      "+6h": Math.min(times.length - 1, nowIdx + 6),
      "+12h": Math.min(times.length - 1, nowIdx + 12),
      "+24h": Math.min(times.length - 1, nowIdx + 24),
    };

    const stateSeries = {};
    for (const [stepId, idx] of Object.entries(stepMap)) {
      if (stepId === "NOW" && current.temperature_2m !== undefined) {
        const wSpeed = Math.round((current.wind_speed_10m ?? 12) * 10) / 10;
        const wDir = Math.round(current.wind_direction_10m ?? 240);
        const rad = (wDir * Math.PI) / 180;
        stateSeries[stepId] = {
          temp: Math.round(current.temperature_2m * 10) / 10,
          rain: Math.max(0, Math.round((current.precipitation ?? current.rain ?? 0) * 10) / 10),
          humidity: Math.round(current.relative_humidity_2m ?? 60),
          wind: wSpeed,
          windDir: wDir,
          windGust: Math.round((current.wind_gusts_10m ?? 18) * 10) / 10,
          u: -Math.round(wSpeed * Math.sin(rad) * 10) / 10,
          v: -Math.round(wSpeed * Math.cos(rad) * 10) / 10,
          cloud: Math.round(current.cloud_cover ?? 30),
          weatherCode: current.weather_code ?? 0,
        };
      } else {
        const wSpeed = Math.round((hourly.wind_speed_10m?.[idx] ?? 12) * 10) / 10;
        const wDir = Math.round(hourly.wind_direction_10m?.[idx] ?? 240);
        const rad = (wDir * Math.PI) / 180;
        stateSeries[stepId] = {
          temp: Math.round((hourly.temperature_2m?.[idx] ?? 28) * 10) / 10,
          rain: Math.max(0, Math.round((hourly.precipitation?.[idx] ?? 0) * 10) / 10),
          humidity: Math.round(hourly.relative_humidity_2m?.[idx] ?? 60),
          wind: wSpeed,
          windDir: wDir,
          windGust: Math.round(wSpeed * 1.5 * 10) / 10,
          u: -Math.round(wSpeed * Math.sin(rad) * 10) / 10,
          v: -Math.round(wSpeed * Math.cos(rad) * 10) / 10,
          cloud: Math.round(hourly.cloud_cover?.[idx] ?? 30),
          weatherCode: hourly.weather_code?.[idx] ?? 0,
        };
      }
    }

    series[state.id] = stateSeries;
    currentDetails[state.id] = {
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      rain: current.precipitation ?? current.rain ?? 0,
      wind: current.wind_speed_10m,
      windDir: current.wind_direction_10m ?? 240,
      windGust: current.wind_gusts_10m,
      cloud: current.cloud_cover,
      weatherCode: current.weather_code ?? 0,
      time: current.time,
      elevation: item.elevation,
    };
  });

  const payload = { series, currentDetails, fetchedAt: now, model };
  cache.allStates[cacheKey] = payload;
  cache.allStatesTime[cacheKey] = now;
  return payload;
}

/**
 * Fetch detailed state forecast including 7-day outlook and multi-model NWP comparison
 * @param {Object} state State object { id, lat, lon, name }
 * @param {string} model Selected NWP model
 * @returns {Promise<Object>} Detailed forecast & comparison data
 */
export async function fetchDetailedStateForecast(state, model = "best_match") {
  const cacheKey = `${state.id}_${model}`;
  const now = Date.now();
  if (cache.stateDetailed[cacheKey] && now - (cache.stateDetailedTime[cacheKey] || 0) < CACHE_TTL_MS) {
    return cache.stateDetailed[cacheKey];
  }

  // 1. Fetch primary forecast with daily & hourly
  let primaryUrl = `https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,surface_pressure` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code` +
    `&past_days=1&forecast_days=7&timezone=Asia%2FKolkata`;

  if (model && model !== "best_match") {
    primaryUrl += `&models=${model}`;
  }

  // 2. Fetch multi-model comparison (ECMWF, GFS, ICON) for the next 48h
  const multiModelUrl = `https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}` +
    `&hourly=temperature_2m,precipitation` +
    `&models=ecmwf_ifs025,gfs_seamless,icon_seamless` +
    `&forecast_days=3&timezone=Asia%2FKolkata`;

  const [resPrimary, resMulti] = await Promise.all([
    fetch(primaryUrl).then((r) => (r.ok ? r.json() : null)),
    fetch(multiModelUrl).then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);

  if (!resPrimary) {
    throw new Error(`Failed to fetch detailed forecast for ${state.name}`);
  }

  // Parse daily 7-day outlook
  const daily = [];
  if (resPrimary.daily && resPrimary.daily.time) {
    for (let i = 0; i < resPrimary.daily.time.length; i++) {
      daily.push({
        date: resPrimary.daily.time[i],
        tempMax: resPrimary.daily.temperature_2m_max[i],
        tempMin: resPrimary.daily.temperature_2m_min[i],
        precipitationSum: resPrimary.daily.precipitation_sum[i],
        precipProbability: resPrimary.daily.precipitation_probability_max?.[i] ?? 0,
        windMax: resPrimary.daily.wind_speed_10m_max?.[i],
        weatherCode: resPrimary.daily.weather_code[i],
      });
    }
  }

  // Parse multi-model comparison data
  const modelComparison = [];
  if (resMulti && resMulti.hourly && resMulti.hourly.time) {
    const times = resMulti.hourly.time;
    // Step by 3 hours for clean visualization over the 3-day horizon
    for (let i = 0; i < times.length; i += 3) {
      const t = times[i];
      const hourStr = t.slice(11, 16);
      const dayStr = t.slice(5, 10);
      modelComparison.push({
        time: `${dayStr} ${hourStr}`,
        iso: t,
        ecmwf: resMulti.hourly.temperature_2m_ecmwf_ifs025?.[i],
        gfs: resMulti.hourly.temperature_2m_gfs_seamless?.[i],
        icon: resMulti.hourly.temperature_2m_icon_seamless?.[i],
        rainEcmwf: resMulti.hourly.precipitation_ecmwf_ifs025?.[i] ?? 0,
        rainGfs: resMulti.hourly.precipitation_gfs_seamless?.[i] ?? 0,
        rainIcon: resMulti.hourly.precipitation_icon_seamless?.[i] ?? 0,
      });
    }
  }

  const payload = {
    current: resPrimary.current,
    daily,
    hourly: resPrimary.hourly,
    modelComparison,
    elevation: resPrimary.elevation,
    timezone: resPrimary.timezone,
    fetchedAt: now,
  };

  cache.stateDetailed[cacheKey] = payload;
  cache.stateDetailedTime[cacheKey] = now;
  return payload;
}
