import { DISTRICTS, getDistrictsByState } from "../data/districts";
import { STATES } from "../data/mock";
import { useTwin } from "../store/twinStore";
import { degreesToCompass } from "../utils/windUtils";

export default function RegionPanel() {
  const {
    regionId,
    setRegionId,
    districtId,
    setDistrictId,
    digitalTwin,
    theme,
    nwpModel,
    weatherModels,
    liveApiActive,
    isLoadingWeather,
    refreshWeather,
  } = useTwin();

  const light = theme === "light";
  const cur = digitalTwin.currentData;
  const pred = digitalTwin.predictedData;
  const tempAnomaly = pred.temp - cur.temp;
  const rainAnomaly = pred.rain - cur.rain;
  const activeModelObj = weatherModels.find((m) => m.id === nwpModel) || weatherModels[0];

  const stateDistricts = getDistrictsByState(regionId);
  const activeDistrict = digitalTwin.district || stateDistricts[0] || null;
  const distWeather = digitalTwin.districtWeather;
  const compass = degreesToCompass(digitalTwin.windDir ?? 240);

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all ${
        light ? "bg-white text-slate-900 border-slate-200" : "bg-[#0d1627] text-slate-100 border-slate-800"
      }`}
    >
      {/* Header with Live Open-Meteo Badge */}
      <div className="bg-[#0b1322] text-slate-200 px-4 py-2.5 text-xs font-extrabold tracking-wider border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span>REGION &amp; DISTRICT TELEMETRY</span>
          <span
            className={`w-2 h-2 rounded-full ${
              liveApiActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-sky-400 font-semibold">
            {liveApiActive ? "OPEN-METEO SYNC" : "OFFLINE FALLBACK"}
          </span>
          <button
            onClick={refreshWeather}
            disabled={isLoadingWeather}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
            title="Refresh Open-Meteo data"
          >
            {isLoadingWeather ? "..." : "↻"}
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {/* State and District Dual Selectors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">STATE / UT</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-2 text-xs font-semibold border transition ${
                light
                  ? "bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600 focus:bg-white"
                  : "bg-[#0b1322] border-slate-700/80 text-slate-100 focus:border-blue-500 focus:bg-[#0e172a]"
              } outline-none`}
            >
              {STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-cyan-400 font-bold block mb-1">INNER DISTRICT</label>
            <select
              value={districtId || (activeDistrict ? activeDistrict.id : "")}
              onChange={(e) => setDistrictId(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-2 text-xs font-semibold border transition ${
                light
                  ? "bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600 focus:bg-white"
                  : "bg-[#071328] border-cyan-800/80 text-cyan-100 focus:border-cyan-500 focus:bg-[#091b38]"
              } outline-none`}
            >
              {stateDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.elevation}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Weather Condition Banner */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border ${
            light
              ? "bg-sky-50/60 border-sky-200 text-slate-800"
              : "bg-[#09152b]/80 border-sky-900/60 text-sky-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="weather icon">
              {digitalTwin.weatherIcon || "🌤️"}
            </span>
            <div>
              <div className="text-xs font-bold capitalize">
                {digitalTwin.weatherDesc || "Current Weather"}
                {activeDistrict ? ` • ${activeDistrict.name}` : ""}
              </div>
              <div className="text-[10px] text-slate-400">
                {activeDistrict
                  ? `${activeDistrict.type} • Elev ${activeDistrict.elevation}m • Lat ${activeDistrict.lat}° Lon ${activeDistrict.lon}°`
                  : `${digitalTwin.region.name} • Lat ${digitalTwin.region.lat}° Lon ${digitalTwin.region.lon}°`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300">
              {activeModelObj.name.split(" ")[0]}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
              {activeModelObj.org}
            </div>
          </div>
        </div>

        {/* Current Observed vs Predicted Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Current Observed */}
          <div
            className={`rounded-lg border p-3 ${
              light
                ? "border-emerald-300 bg-emerald-50/70 text-slate-900"
                : "border-emerald-600/50 bg-emerald-950/25 text-emerald-100"
            }`}
          >
            <div className={`text-[10px] font-bold tracking-wider ${light ? "text-emerald-700" : "text-emerald-400"}`}>
              {activeDistrict ? `${activeDistrict.name.toUpperCase()} (NOW)` : "CURRENT (OBSERVED)"}
            </div>
            <div className={`text-2xl font-black mt-1 ${light ? "text-slate-900" : "text-white"}`}>
              {distWeather ? distWeather.temp : cur.temp}°C
            </div>
            <div className={`text-xs font-bold mt-0.5 ${light ? "text-sky-700" : "text-sky-400"}`}>
              🌧 {distWeather ? distWeather.rain : cur.rain} mm
            </div>
            <div className={`text-[11px] mt-1.5 ${light ? "text-slate-600" : "text-slate-400"}`}>
              💧 {distWeather ? distWeather.humidity : cur.humidity}% • 💨 {distWeather ? distWeather.wind : cur.wind} km/h {compass} • ☁ {cur.cloud}%
            </div>
          </div>

          {/* Predicted */}
          <div
            className={`rounded-lg border p-3 ${
              light
                ? "border-blue-300 bg-blue-50/70 text-slate-900"
                : "border-blue-600/50 bg-blue-950/25 text-blue-100"
            }`}
          >
            <div className={`text-[10px] font-bold tracking-wider ${light ? "text-blue-700" : "text-blue-400"}`}>
              PREDICTED (+24h NWP)
            </div>
            <div className={`text-2xl font-black mt-1 ${light ? "text-slate-900" : "text-white"}`}>
              {pred.temp}°C
            </div>
            <div className={`text-xs font-bold mt-0.5 ${light ? "text-sky-700" : "text-sky-400"}`}>
              🌧 {pred.rain} mm
            </div>
            <div className={`text-[11px] mt-1.5 ${light ? "text-slate-600" : "text-slate-400"}`}>
              💧 {pred.humidity}% • 💨 {pred.wind} km/h • ☁ {pred.cloud}%
            </div>
          </div>
        </div>

        {/* Anomaly summary */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div
            className={`rounded p-2 border ${
              light ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#0b1322] border-slate-800 text-slate-300"
            }`}
          >
            <span>Temp Anomaly </span>
            <b className={tempAnomaly >= 0 ? (light ? "text-amber-600" : "text-amber-400") : "text-sky-400"}>
              {tempAnomaly >= 0 ? "+" : ""}{tempAnomaly.toFixed(1)}°C
            </b>
          </div>
          <div
            className={`rounded p-2 border ${
              light ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#0b1322] border-slate-800 text-slate-300"
            }`}
          >
            <span>Rain Anomaly </span>
            <b className={light ? "text-sky-700" : "text-sky-400"}>
              {rainAnomaly >= 0 ? "+" : ""}{rainAnomaly.toFixed(1)} mm
            </b>
          </div>
        </div>

        {/* Historical context & simulation indicator */}
        <div
          className={`text-[11px] rounded p-2 border ${
            light
              ? "bg-slate-50 border-slate-200 text-slate-600"
              : "bg-[#0b1322] border-slate-800/90 text-slate-400"
          }`}
        >
          <span>Hist. baseline: </span>
          <b className={light ? "text-slate-800" : "text-slate-200"}>{digitalTwin.historicalData.temp}°C</b> /{" "}
          <b className={light ? "text-slate-800" : "text-slate-200"}>{digitalTwin.historicalData.rain} mm</b> • Step:{" "}
          <b className={light ? "text-slate-800" : "text-slate-200"}>{digitalTwin.timestamp.label}</b>
          {digitalTwin.scenario.simulated && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">
              SCENARIO ACTIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
