import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HISTORICAL, SERIES, STATES, TIMESTEPS, applyScenario } from "../data/mock";
import { getWmoInfo } from "../services/openMeteo";
import { useTwin } from "../store/twinStore";

// Horizon Tab Bar Component
function HorizonTabs({ horizonFilter, setHorizonFilter, size = "sm" }) {
  return (
    <div className="flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-xl p-1 shadow-inner">
      {[
        { id: "all", label: "🌐 All Horizons", desc: "-24h → +24h" },
        { id: "past", label: "⏪ Past (Observed)", desc: "-24h, -12h" },
        { id: "current", label: "🟢 Current (NOW)", desc: "Real-time" },
        { id: "future", label: "🔮 Future Prediction", desc: "+6h, +12h, +24h NWP" },
      ].map((tab) => {
        const isActive = horizonFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setHorizonFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              size === "lg" ? "text-xs sm:text-sm" : "text-[11px]"
            } ${
              isActive
                ? tab.id === "past"
                  ? "bg-slate-700 text-white border border-slate-600 shadow-sm"
                  : tab.id === "current"
                  ? "bg-emerald-700 text-white border border-emerald-600 shadow-sm"
                  : "bg-blue-600 text-white border border-blue-500 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Charts() {
  const {
    regionId,
    tempDelta,
    rainDeltaPct,
    simulated,
    theme,
    series,
    detailedForecast,
    nwpModel,
    weatherModels,
    liveApiActive,
  } = useTwin();

  const light = theme === "light";

  // Tab filter: 'all' | 'past' | 'current' | 'future'
  const [horizonFilter, setHorizonFilter] = useState("all");
  // Active feature tab: 'standard' | 'ensemble' | 'extended7day'
  const [activeTab, setActiveTab] = useState("standard");
  // Fullscreen modal state: null | 'temperature' | 'rainfall' | 'ensemble' | 'all'
  const [fullscreenChart, setFullscreenChart] = useState(null);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setFullscreenChart(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const grid = light ? "#cbd5e1" : "#1e293b";
  const axis = light ? "#475569" : "#94a3b8";
  const tip = light
    ? { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }
    : { background: "#0b1426", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.6)" };
  const card = light ? "bg-white border-slate-300 shadow-sm" : "bg-[#0a1224] border-slate-800 shadow-xl";
  const title = light ? "text-slate-800" : "text-slate-200";

  const currentState = STATES.find((s) => s.id === regionId) || STATES[0];
  const activeModelObj = weatherModels.find((m) => m.id === nwpModel) || weatherModels[0];
  const currentRegionSeries = series?.[regionId] || SERIES[regionId] || {};

  // Filter timesteps based on active horizon filter
  const activeTimesteps = TIMESTEPS.filter((t) => {
    if (horizonFilter === "past") return t.kind === "observed" || t.id === "NOW";
    if (horizonFilter === "current") return t.id === "NOW";
    if (horizonFilter === "future") return t.kind === "predicted" || t.id === "NOW";
    return true; // 'all'
  });

  // Prepare chart series data using live Open-Meteo data
  const tempData = activeTimesteps.map((t) => {
    const v = currentRegionSeries[t.id] || { temp: 28, rain: 15, humidity: 65, wind: 14 };
    const s = applyScenario(v, simulated ? tempDelta : 0, 0);
    return {
      name: t.label,
      full: t.full,
      kind: t.kind,
      observed: t.kind !== "predicted" ? v.temp : null,
      predicted: t.kind === "predicted" || t.id === "NOW" ? v.temp : null,
      historical: HISTORICAL[regionId]?.temp ?? 27,
      scenario: simulated ? s.temp : null,
    };
  });

  const rainData = activeTimesteps.map((t) => {
    const v = currentRegionSeries[t.id] || { temp: 28, rain: 15, humidity: 65, wind: 14 };
    const s = applyScenario(v, 0, simulated ? rainDeltaPct : 0);
    return {
      name: t.label,
      full: t.full,
      kind: t.kind,
      observed: t.kind !== "predicted" ? v.rain : null,
      predicted: t.kind === "predicted" || t.id === "NOW" ? v.rain : null,
      historical: HISTORICAL[regionId]?.rain ?? 12,
      scenario: simulated ? s.rain : null,
    };
  });

  const modelComparisonData = detailedForecast?.modelComparison || [];
  const dailyForecastData = detailedForecast?.daily || [];

  return (
    <div className="mt-4 space-y-3">
      {/* ── CHARTS HEADER WITH MODEL BADGE & TAB SELECTOR ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold tracking-wide text-white uppercase flex items-center gap-2">
            <span>📊 Weather Analytics &amp; Predictions — {currentState.name}</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-950 text-blue-200 font-bold border border-blue-700/80">
            {currentState.id}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 font-mono border border-sky-800/70">
            Model: {activeModelObj.name}
          </span>
          {liveApiActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open-Meteo Live API
            </span>
          )}
        </div>

        {/* View Switcher: Standard Curves vs Ensemble Comparison vs 7-Day Forecast */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-xl p-1 shadow-inner text-xs">
            <button
              onClick={() => setActiveTab("standard")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "standard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📈 Primary Horizons
            </button>
            <button
              onClick={() => setActiveTab("ensemble")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                activeTab === "ensemble"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🤖 NWP Ensemble</span>
              <span className="text-[9px] px-1 rounded bg-sky-900 text-sky-200">ECMWF / GFS / ICON</span>
            </button>
            <button
              onClick={() => setActiveTab("extended7day")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "extended7day"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📅 7-Day Outlook
            </button>
          </div>

          <button
            onClick={() => setFullscreenChart(activeTab === "ensemble" ? "ensemble" : "all")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-100 hover:text-white font-bold text-xs shadow-sm transition"
            title="Expand to fullscreen"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: STANDARD PRIMARY HORIZON CHARTS ── */}
      {activeTab === "standard" && (
        <>
          <div className="flex justify-end">
            <HorizonTabs horizonFilter={horizonFilter} setHorizonFilter={setHorizonFilter} size="sm" />
          </div>

          <div className="grid md:grid-cols-2 gap-3.5">
            {/* 1. TEMPERATURE CHART */}
            <div className={`${card} border rounded-2xl p-4 transition hover:border-slate-700`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${title}`}>
                    <span>🌡️ TEMPERATURE (°C)</span>
                    {horizonFilter === "future" && (
                      <span className="text-[10px] text-sky-400 font-bold">• 24h NWP Prediction</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Open-Meteo Observed vs NWP Predicted vs 30yr Baseline
                  </div>
                </div>
                <button
                  onClick={() => setFullscreenChart("temperature")}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-900/80 hover:text-white border border-slate-700 text-slate-300 text-xs transition"
                  title="Full screen temperature chart"
                >
                  ⛶ Expand
                </button>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempData} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                    <XAxis dataKey="name" stroke={axis} fontSize={11} tickLine={false} />
                    <YAxis stroke={axis} fontSize={11} domain={["auto", "auto"]} tickLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {horizonFilter === "all" && (
                      <ReferenceLine
                        x="NOW"
                        stroke="#10b981"
                        strokeWidth={2}
                        label={{ value: "NOW (LIVE)", fill: "#10b981", fontSize: 10, position: "top" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#64748b"
                      strokeDasharray="4 4"
                      dot={false}
                      name="30yr Hist. Avg"
                    />
                    <Line
                      type="monotone"
                      dataKey="observed"
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#0284c7" }}
                      name="Observed (Open-Meteo)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      strokeDasharray="6 3"
                      dot={{ r: 4, fill: "#3b82f6" }}
                      name={`Predicted (${activeModelObj.name.split(" ")[0]})`}
                      connectNulls
                    />
                    {simulated && (
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#d97706"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#d97706" }}
                        name="Scenario What-If"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. RAINFALL CHART */}
            <div className={`${card} border rounded-2xl p-4 transition hover:border-slate-700`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${title}`}>
                    <span>🌧️ PRECIPITATION (MM)</span>
                    {horizonFilter === "future" && (
                      <span className="text-[10px] text-sky-400 font-bold">• 24h NWP Precipitation</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Open-Meteo Rain telemetry &amp; atmospheric model forecast
                  </div>
                </div>
                <button
                  onClick={() => setFullscreenChart("rainfall")}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-900/80 hover:text-white border border-slate-700 text-slate-300 text-xs transition"
                  title="Full screen rainfall chart"
                >
                  ⛶ Expand
                </button>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rainData} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                    <XAxis dataKey="name" stroke={axis} fontSize={11} tickLine={false} />
                    <YAxis stroke={axis} fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {horizonFilter === "all" && (
                      <ReferenceLine
                        x="NOW"
                        stroke="#10b981"
                        strokeWidth={2}
                        label={{ value: "NOW", fill: "#10b981", fontSize: 10, position: "top" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#64748b"
                      strokeDasharray="4 4"
                      dot={false}
                      name="30yr Hist. Avg"
                    />
                    <Area
                      type="monotone"
                      dataKey="observed"
                      stroke="#0284c7"
                      fill="url(#rainGradient)"
                      strokeWidth={3}
                      name="Observed Rain"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#2563eb"
                      strokeWidth={3}
                      strokeDasharray="6 3"
                      dot={{ r: 4, fill: "#2563eb" }}
                      name="Predicted Rain"
                      connectNulls
                    />
                    {simulated && (
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#d97706"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#d97706" }}
                        name="Scenario Rain"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: NWP MULTI-MODEL ENSEMBLE COMPARISON (ECMWF vs GFS vs ICON) ── */}
      {activeTab === "ensemble" && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3.5">
            {/* Model Temperature Comparison */}
            <div className={`${card} border rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${title}`}>
                    <span>🌡️ MODEL ENSEMBLE TEMPERATURE (°C)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    European ECMWF IFS vs US NOAA GFS vs German DWD ICON (72-hour forecast)
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {modelComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelComparisonData} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                      <XAxis dataKey="time" stroke={axis} fontSize={10} tickLine={false} />
                      <YAxis stroke={axis} fontSize={10} domain={["auto", "auto"]} tickLine={false} />
                      <Tooltip contentStyle={tip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="ecmwf" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="ECMWF IFS (0.25°)" />
                      <Line type="monotone" dataKey="gfs" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 2" dot={false} name="NOAA GFS Seamless" />
                      <Line type="monotone" dataKey="icon" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="2 2" dot={false} name="DWD ICON Seamless" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Loading Open-Meteo multi-model ensemble forecast...
                  </div>
                )}
              </div>
            </div>

            {/* Model Rainfall Comparison */}
            <div className={`${card} border rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${title}`}>
                    <span>🌧️ MODEL PRECIPITATION FORECAST (MM)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Comparative convective precipitation across atmospheric models
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {modelComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelComparisonData.slice(0, 16)} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                      <XAxis dataKey="time" stroke={axis} fontSize={10} tickLine={false} />
                      <YAxis stroke={axis} fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={tip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="rainEcmwf" fill="#3b82f6" name="ECMWF Rain" />
                      <Bar dataKey="rainGfs" fill="#10b981" name="GFS Rain" />
                      <Bar dataKey="rainIcon" fill="#f59e0b" name="ICON Rain" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Loading precipitation comparison...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Model Synopsis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className={`p-3 rounded-xl border ${card}`}>
              <div className="text-xs font-bold text-blue-400">🇪🇺 ECMWF IFS (0.25°)</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">European Centre for Medium-Range Weather Forecasts</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Top-ranked global NWP model with 4D-Var data assimilation.</div>
            </div>
            <div className={`p-3 rounded-xl border ${card}`}>
              <div className="text-xs font-bold text-emerald-400">🇺🇸 NOAA GFS Seamless</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">US National Weather Service (NCEP)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Global spectral model updated 4x daily with seamless hourly resolution.</div>
            </div>
            <div className={`p-3 rounded-xl border ${card}`}>
              <div className="text-xs font-bold text-amber-400">🇩🇪 DWD ICON Seamless</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">Deutscher Wetterdienst (Germany)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Non-hydrostatic icosahedral grid optimized for deep convective forecasting.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: 7-DAY EXTENDED FORECAST OUTLOOK ── */}
      {activeTab === "extended7day" && (
        <div className={`${card} border rounded-2xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className={`text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${title}`}>
                <span>📅 7-DAY EXTENDED NUMERICAL OUTLOOK — {currentState.name}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Daily max/min temperatures, precipitation sums, and atmospheric conditions from Open-Meteo
              </div>
            </div>
          </div>

          {dailyForecastData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {dailyForecastData.map((d, i) => {
                const wmo = getWmoInfo(d.weatherCode);
                const dayName = new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" });
                const dateNum = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                return (
                  <div
                    key={d.date}
                    className={`p-3 rounded-xl border text-center transition ${
                      i === 0
                        ? "bg-blue-950/40 border-blue-600/70 shadow-sm"
                        : "bg-[#0b1322] border-slate-800"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-300">
                      {i === 0 ? "Today" : dayName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{dateNum}</div>
                    <div className="text-2xl my-1.5" title={wmo.label}>
                      {wmo.icon}
                    </div>
                    <div className="text-xs font-black text-white">
                      {Math.round(d.tempMax)}° <span className="text-slate-400 font-normal">/ {Math.round(d.tempMin)}°</span>
                    </div>
                    <div className="text-[10px] text-sky-400 font-semibold mt-1">
                      🌧 {d.precipitationSum} mm
                    </div>
                    {d.precipProbability > 0 && (
                      <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                        {d.precipProbability}% prob
                      </div>
                    )}
                    <div className="text-[9px] text-slate-400 capitalize truncate mt-1">
                      {wmo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              Fetching 7-day outlook from Open-Meteo...
            </div>
          )}
        </div>
      )}

      {/* ── FULL SCREEN MODAL OVERLAY ── */}
      {fullscreenChart && (
        <div className="fixed inset-0 z-50 bg-[#070c18]/98 backdrop-blur-2xl p-4 sm:p-7 flex flex-col justify-between overflow-y-auto animate-fadeIn select-none">
          {/* Fullscreen Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {fullscreenChart === "temperature"
                    ? "🌡️ TEMPERATURE FORECAST & PREDICTION"
                    : fullscreenChart === "rainfall"
                    ? "🌧️ PRECIPITATION & FLOOD FORECAST"
                    : fullscreenChart === "ensemble"
                    ? "🤖 NWP MODEL ENSEMBLE COMPARISON (ECMWF vs GFS vs ICON)"
                    : "📊 MULTI-HORIZON WEATHER PREDICTION SUITE"}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-950 border border-blue-700/80 text-blue-200 font-extrabold text-xs">
                  {currentState.name} ({currentState.id})
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Deep predictive digital twin modeling • Open-Meteo NWP atmospheric model integration
              </div>
            </div>

            <div className="flex items-center gap-3">
              {fullscreenChart !== "ensemble" && (
                <HorizonTabs horizonFilter={horizonFilter} setHorizonFilter={setHorizonFilter} size="lg" />
              )}
              <button
                onClick={() => setFullscreenChart(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>✕</span>
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Graph Container */}
          <div className="flex-1 my-4 flex flex-col justify-center min-h-[420px] bg-[#0b1322] border border-slate-800 rounded-2xl p-4 shadow-2xl">
            {fullscreenChart === "temperature" ? (
              <div className="h-[460px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempData} margin={{ top: 15, right: 25, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} />
                    <YAxis stroke="#94a3b8" fontSize={13} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                    {horizonFilter === "all" && (
                      <ReferenceLine
                        x="NOW"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        label={{ value: "NOW (LIVE OBSERVED)", fill: "#10b981", fontSize: 12, position: "top" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Historical 30yr Avg"
                    />
                    <Line
                      type="monotone"
                      dataKey="observed"
                      stroke="#0284c7"
                      strokeWidth={4}
                      dot={{ r: 6, fill: "#0284c7" }}
                      name="Observed Temp (°C)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      strokeDasharray="8 4"
                      dot={{ r: 6, fill: "#3b82f6" }}
                      name="Predicted Temp (°C)"
                      connectNulls
                    />
                    {simulated && (
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#d97706"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#d97706" }}
                        name="What-If Scenario"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : fullscreenChart === "rainfall" ? (
              <div className="h-[460px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rainData} margin={{ top: 15, right: 25, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="fullRainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={13} />
                    <YAxis stroke="#94a3b8" fontSize={13} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                    {horizonFilter === "all" && (
                      <ReferenceLine
                        x="NOW"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        label={{ value: "NOW (LIVE OBSERVED)", fill: "#10b981", fontSize: 12, position: "top" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Historical 30yr Avg"
                    />
                    <Area
                      type="monotone"
                      dataKey="observed"
                      stroke="#0284c7"
                      fill="url(#fullRainGradient)"
                      strokeWidth={4}
                      name="Observed Rain (mm)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#2563eb"
                      strokeWidth={4}
                      strokeDasharray="8 4"
                      dot={{ r: 6, fill: "#2563eb" }}
                      name="Predicted Rain (mm)"
                      connectNulls
                    />
                    {simulated && (
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#d97706"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#d97706" }}
                        name="What-If Scenario"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : fullscreenChart === "ensemble" ? (
              <div className="h-[460px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelComparisonData} margin={{ top: 15, right: 25, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="ecmwf" stroke="#3b82f6" strokeWidth={3.5} dot={false} name="ECMWF IFS (0.25° Europe)" />
                    <Line type="monotone" dataKey="gfs" stroke="#10b981" strokeWidth={3.5} strokeDasharray="6 3" dot={false} name="NOAA GFS Seamless (USA)" />
                    <Line type="monotone" dataKey="icon" stroke="#f59e0b" strokeWidth={3.5} strokeDasharray="4 4" dot={false} name="DWD ICON Seamless (Germany)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* All Charts in Fullscreen Grid */
              <div className="grid md:grid-cols-2 gap-4 h-[460px]">
                <div className="h-full flex flex-col">
                  <div className="text-xs font-bold text-amber-400 mb-1">🌡️ TEMPERATURE (°C)</div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={tip} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="observed" stroke="#0284c7" strokeWidth={3} dot name="Observed" />
                        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} strokeDasharray="6 3" dot name="Predicted" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="h-full flex flex-col">
                  <div className="text-xs font-bold text-sky-400 mb-1">🌧️ PRECIPITATION (MM)</div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rainData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={tip} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="observed" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} strokeWidth={3} name="Observed" />
                        <Line type="monotone" dataKey="predicted" stroke="#2563eb" strokeWidth={3} strokeDasharray="6 3" dot name="Predicted" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Bottom Horizon Prediction Insight Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CURRENT (NOW)</div>
              <div className="text-xl font-black text-white mt-0.5">
                {currentRegionSeries?.["NOW"]?.temp}°C • {currentRegionSeries?.["NOW"]?.rain} mm
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Live Open-Meteo telemetry</div>
            </div>

            <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">+6H PREDICTION</div>
              <div className="text-xl font-black text-blue-100 mt-0.5">
                {currentRegionSeries?.["+6h"]?.temp}°C • {currentRegionSeries?.["+6h"]?.rain} mm
              </div>
              <div className="text-[10px] text-blue-400 mt-0.5">Short-range NWP forecast</div>
            </div>

            <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">+12H PREDICTION</div>
              <div className="text-xl font-black text-sky-100 mt-0.5">
                {currentRegionSeries?.["+12h"]?.temp}°C • {currentRegionSeries?.["+12h"]?.rain} mm
              </div>
              <div className="text-[10px] text-sky-400 mt-0.5">12h atmospheric model advance</div>
            </div>

            <div className="bg-[#0b1322] border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">+24H FULL DAY PREDICTION</div>
              <div className="text-xl font-black text-amber-100 mt-0.5">
                {currentRegionSeries?.["+24h"]?.temp}°C • {currentRegionSeries?.["+24h"]?.rain} mm
              </div>
              <div className="text-[10px] text-amber-400 mt-0.5">
                Anomaly ΔT: {Math.round(((currentRegionSeries?.["+24h"]?.temp ?? 28) - (HISTORICAL[regionId]?.temp ?? 27)) * 10) / 10}°C
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
