import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DISTRICTS, calculateDistrictWeather, getDistrictsByState } from "../data/districts";
import { HISTORICAL, NOW_INDEX, SERIES, STATES, TIMESTEPS, applyScenario } from "../data/mock";
import {
  WEATHER_MODELS,
  fetchAllStatesOpenMeteo,
  fetchDetailedStateForecast,
  getWmoInfo,
} from "../services/openMeteo";

const TwinContext = createContext(null);

export function TwinProvider({ children }) {
  const [regionId, setRegionId] = useState("MH");
  const [districtId, setDistrictId] = useState(null);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showWindFlow, setShowWindFlow] = useState(false);
  const [timeIndex, setTimeIndex] = useState(NOW_INDEX);
  const [mapMode, setMapModeInternal] = useState("temperature"); // temperature | rainfall | humidity | wind
  const [tempDelta, setTempDelta] = useState(0); // -5 .. +5
  const [rainDeltaPct, setRainDeltaPct] = useState(0); // -50 .. +50
  const [simulated, setSimulated] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("bct-theme") || "dark");

  // Open-Meteo Integration State
  const [nwpModel, setNwpModel] = useState("best_match");
  const [seriesData, setSeriesData] = useState(() => ({ ...SERIES }));
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveApiActive, setLiveApiActive] = useState(false);
  const [detailedForecast, setDetailedForecast] = useState(null);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);

  // Wind streamlines are strictly active only in wind mode
  const setMapMode = useCallback((mode) => {
    setMapModeInternal(mode);
    setShowWindFlow(mode === "wind");
  }, []);

  const toggleTheme = () => setTheme((t) => {
    const n = t === "dark" ? "light" : "dark";
    localStorage.setItem("bct-theme", n);
    return n;
  });

  // Fetch all 36 Indian states batch data from Open-Meteo
  const fetchAllStates = useCallback(async (modelToFetch = nwpModel) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await fetchAllStatesOpenMeteo(STATES, modelToFetch);
      // Synchronize in-memory SERIES so direct readers get updated data
      for (const [id, steps] of Object.entries(data.series)) {
        if (!SERIES[id]) SERIES[id] = {};
        Object.assign(SERIES[id], steps);
      }
      setSeriesData({ ...SERIES });
      setLiveApiActive(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Open-Meteo batch sync notice (using cached/fallback):", err.message);
      setWeatherError(err.message);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [nwpModel]);

  // Fetch detailed 7-day outlook and multi-model comparison for selected state
  const fetchDetailedState = useCallback(async (selectedId, modelToFetch = nwpModel) => {
    const stateObj = STATES.find((s) => s.id === selectedId) || STATES[0];
    setIsLoadingDetailed(true);
    try {
      const detailed = await fetchDetailedStateForecast(stateObj, modelToFetch);
      setDetailedForecast(detailed);
    } catch (err) {
      console.warn("Detailed state forecast fetch notice:", err.message);
    } finally {
      setIsLoadingDetailed(false);
    }
  }, [nwpModel]);

  // Auto-reset or pick default district when region changes
  useEffect(() => {
    const stateDistricts = getDistrictsByState(regionId);
    if (stateDistricts.length > 0) {
      setDistrictId(stateDistricts[0].id);
    } else {
      setDistrictId(null);
    }
  }, [regionId]);

  // Fetch all states on mount or when model changes
  useEffect(() => {
    fetchAllStates(nwpModel);
  }, [fetchAllStates, nwpModel]);

  // Fetch detailed forecast whenever region or model changes
  useEffect(() => {
    fetchDetailedState(regionId, nwpModel);
  }, [fetchDetailedState, regionId, nwpModel]);

  const refreshWeather = useCallback(() => {
    fetchAllStates(nwpModel);
    fetchDetailedState(regionId, nwpModel);
  }, [fetchAllStates, fetchDetailedState, regionId, nwpModel]);

  const handleSetNwpModel = useCallback((newModel) => {
    setNwpModel(newModel);
  }, []);

  const value = useMemo(() => {
    const region = STATES.find((s) => s.id === regionId) || STATES[0];
    const timestamp = TIMESTEPS[timeIndex] || TIMESTEPS[NOW_INDEX];
    const currentSeriesForRegion = seriesData[regionId] || SERIES[regionId] || {};
    const base = currentSeriesForRegion[timestamp.id] || { temp: 28, rain: 15, humidity: 65, wind: 14, cloud: 40 };
    const scenarioVals = applyScenario(base, simulated ? tempDelta : 0, simulated ? rainDeltaPct : 0);

    const cur = currentSeriesForRegion["NOW"] || { temp: 28, rain: 15, humidity: 65, wind: 14, cloud: 40, weatherCode: 0 };
    const pred = currentSeriesForRegion["+24h"] || { temp: 30, rain: 18, humidity: 68, wind: 16, cloud: 45, weatherCode: 0 };
    const wmo = getWmoInfo(base.weatherCode ?? cur.weatherCode ?? 0);

    // District-level localized weather
    const activeDistrict = DISTRICTS.find((d) => d.id === districtId) || null;
    const districtWeather = activeDistrict ? calculateDistrictWeather(activeDistrict, scenarioVals) : null;

    const digitalTwin = {
      region,
      district: activeDistrict,
      districtWeather,
      timestamp,
      temperature: districtWeather ? districtWeather.temp : scenarioVals.temp,
      rainfall: districtWeather ? districtWeather.rain : scenarioVals.rain,
      humidity: districtWeather ? districtWeather.humidity : scenarioVals.humidity,
      wind: districtWeather ? districtWeather.wind : scenarioVals.wind,
      windDir: base.windDir ?? cur.windDir ?? 240,
      windGust: base.windGust ?? cur.windGust ?? 20,
      cloud: districtWeather ? districtWeather.cloud : scenarioVals.cloud,
      weatherCode: base.weatherCode ?? 0,
      weatherDesc: wmo.label,
      weatherIcon: wmo.icon,
      historicalData: HISTORICAL[regionId] || { temp: 27, rain: 12, humidity: 60 },
      predictedData: pred,
      currentData: cur,
      scenario: { tempDelta, rainDeltaPct, simulated },
      liveApiActive,
      nwpModel,
      elevation: activeDistrict ? activeDistrict.elevation : detailedForecast?.elevation,
    };

    return {
      regionId,
      setRegionId,
      districtId,
      setDistrictId,
      showDistricts,
      setShowDistricts,
      showWindFlow,
      setShowWindFlow,
      timeIndex,
      setTimeIndex,
      mapMode,
      setMapMode,
      tempDelta,
      setTempDelta,
      rainDeltaPct,
      setRainDeltaPct,
      simulated,
      setSimulated,
      theme,
      toggleTheme,
      digitalTwin,
      series: seriesData,
      nwpModel,
      setNwpModel: handleSetNwpModel,
      weatherModels: WEATHER_MODELS,
      isLoadingWeather,
      weatherError,
      lastUpdated,
      liveApiActive,
      detailedForecast,
      isLoadingDetailed,
      refreshWeather,
    };
  }, [
    regionId,
    districtId,
    showDistricts,
    showWindFlow,
    timeIndex,
    mapMode,
    tempDelta,
    rainDeltaPct,
    simulated,
    theme,
    seriesData,
    liveApiActive,
    nwpModel,
    detailedForecast,
    handleSetNwpModel,
    isLoadingWeather,
    weatherError,
    lastUpdated,
    isLoadingDetailed,
    refreshWeather,
    setMapMode,
  ]);

  return <TwinContext.Provider value={value}>{children}</TwinContext.Provider>;
}

export function useTwin() {
  const ctx = useContext(TwinContext);
  if (!ctx) throw new Error("useTwin must be used inside TwinProvider");
  return ctx;
}
