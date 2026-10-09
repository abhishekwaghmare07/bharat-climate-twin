import { useEffect, useState } from "react";
import { useTwin } from "../store/twinStore";

export default function TopBar() {
  const [now, setNow] = useState(new Date());
  const {
    theme,
    toggleTheme,
    nwpModel,
    setNwpModel,
    weatherModels,
    isLoadingWeather,
    liveApiActive,
    lastUpdated,
    refreshWeather,
  } = useTwin();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ist = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const updatedTimeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true, hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <header className="w-full">
      <div className="tricolor" />
      <div className="bg-[#0b1322] border-b border-slate-800/90 px-4 py-2.5 flex flex-wrap items-center gap-3 justify-between">
        {/* Left: Branding & Model Source */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800/90 flex items-center justify-center font-black text-sky-400 text-base border border-slate-700 shadow-sm">
            🌐
          </div>
          <div>
            <div className="font-extrabold tracking-wide text-white text-sm sm:text-base flex items-center gap-2">
              <span>BHARAT CLIMATE DIGITAL TWIN</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/70 text-sky-300 font-mono font-medium">
                OPEN-METEO NWP ENGINE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 tracking-wider flex items-center gap-1.5">
              <span>National Weather Numerical Simulation</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400">ECMWF / GFS / ICON Live Forecast</span>
            </div>
          </div>
        </div>

        {/* Right: API Status, NWP Model Picker & Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* NWP Model Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <span className="text-[10px] text-slate-400 font-bold hidden md:inline">MODEL:</span>
            <select
              value={nwpModel}
              onChange={(e) => setNwpModel(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs outline-none cursor-pointer pr-1"
              title="Select Numerical Weather Prediction (NWP) atmospheric model"
            >
              {weatherModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0b1322] text-slate-200">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={refreshWeather}
            disabled={isLoadingWeather}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition ${
              isLoadingWeather
                ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white"
            }`}
            title="Fetch latest atmospheric data from Open-Meteo"
          >
            <span className={isLoadingWeather ? "animate-spin" : ""}>↻</span>
            <span className="hidden sm:inline">{isLoadingWeather ? "Syncing..." : "Sync Live"}</span>
          </button>

          {/* Live API Telemetry Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition ${
              liveApiActive
                ? "bg-emerald-950/60 border-emerald-700/70 text-emerald-300"
                : "bg-amber-950/60 border-amber-700/70 text-amber-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveApiActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-bold">
              {liveApiActive ? "OPEN-METEO LIVE" : "STANDBY"}
            </span>
            {updatedTimeStr && (
              <span className="text-[10px] opacity-75 font-mono hidden lg:inline">
                ({updatedTimeStr})
              </span>
            )}
          </div>

          {/* Clock */}
          <span className="hidden xl:inline-block px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700 text-slate-300 font-mono text-[11px]">
            IST {ist}
          </span>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle dark / light mode"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-semibold hover:bg-slate-700 transition"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}
