import { useEffect, useState } from "react";
import { NOW_INDEX, STATES, TIMESTEPS } from "../data/mock";
import { useTwin } from "../store/twinStore";
import GlobeMap from "./GlobeMap";
import HeatmapView from "./HeatmapView";
import RealisticTwinMap from "./RealisticTwinMap";

function MapHorizonTabs({ timeIndex, setTimeIndex, size = "sm" }) {
  const currentTimestep = TIMESTEPS[timeIndex] || TIMESTEPS[NOW_INDEX];
  const isPast = currentTimestep.kind === "observed";
  const isCurrent = currentTimestep.id === "NOW";
  const isFuture = currentTimestep.kind === "predicted";

  return (
    <div className="flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-lg p-0.5 shadow-inner">
      <button
        onClick={() => setTimeIndex(0)}
        className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
          size === "lg" ? "text-xs sm:text-sm" : "text-[11px]"
        } ${
          isPast
            ? "bg-slate-700 text-white border border-slate-600 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
        }`}
        title="View past observed weather telemetry (-24h, -12h)"
      >
        <span>⏪ Past</span>
      </button>

      <button
        onClick={() => setTimeIndex(NOW_INDEX)}
        className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
          size === "lg" ? "text-xs sm:text-sm" : "text-[11px]"
        } ${
          isCurrent
            ? "bg-emerald-700 text-white border border-emerald-600/80 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
        }`}
        title="View current live telemetry (NOW)"
      >
        <span>🟢 Current (NOW)</span>
      </button>

      <button
        onClick={() => setTimeIndex(5)}
        className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
          size === "lg" ? "text-xs sm:text-sm" : "text-[11px]"
        } ${
          isFuture
            ? "bg-blue-600 text-white border border-blue-500/80 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
        }`}
        title="View future predictive simulation (+6h, +12h, +24h)"
      >
        <span>🔮 Future Prediction</span>
      </button>
    </div>
  );
}

export default function IndiaMap() {
  const { mapMode, setMapMode, timeIndex, setTimeIndex, regionId, digitalTwin, simulated, tempDelta } = useTwin();
  const [view, setView] = useState("twin"); // twin | heat | globe
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentState = STATES.find((s) => s.id === regionId) || STATES[0];
  const currentTimestep = TIMESTEPS[timeIndex] || TIMESTEPS[NOW_INDEX];

  return (
    <div>
      {/* ── EMBEDDED MAP TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0d1627] border border-slate-800 rounded-xl p-1.5 text-xs mb-2 shadow-md">
        {/* Left: View & Variable Switchers */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setView("heat")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              view === "heat"
                ? "bg-blue-600 text-white border border-blue-500/80 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
            }`}
          >
            🔥 Heatmap
          </button>
          <button
            onClick={() => setView("twin")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              view === "twin"
                ? "bg-blue-600 text-white border border-blue-500/80 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
            }`}
          >
            🛰️ Twin 3D
          </button>
          <button
            onClick={() => setView("globe")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              view === "globe"
                ? "bg-blue-600 text-white border border-blue-500/80 shadow-sm"
                : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
            }`}
          >
            🌐 Globe 3D
          </button>
          <span className="w-px h-5 bg-slate-800 mx-1 hidden sm:inline" />
          {[
            ["temperature", "🌡 Temp"],
            ["rainfall", "🌧 Rain"],
            ["humidity", "💧 Humidity"],
            ["wind", "💨 Wind Flow"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMapMode(m)}
              className={`px-2.5 py-1.5 rounded-lg transition font-medium ${
                mapMode === m
                  ? "bg-blue-950 border border-blue-600/80 text-blue-200 font-bold"
                  : "text-slate-400 hover:bg-slate-800/90 hover:text-slate-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Right: Past / Current / Future Tabs + Fullscreen Button */}
        <div className="flex items-center gap-2">
          <MapHorizonTabs timeIndex={timeIndex} setTimeIndex={setTimeIndex} size="sm" />
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-100 hover:text-white font-bold text-xs shadow-sm transition"
            title="Full screen map with predictive horizon analysis"
          >
            <span>⛶</span>
            <span className="hidden md:inline">Full Screen</span>
          </button>
        </div>
      </div>

      {/* ── ACTIVE MAP COMPONENT (EMBEDDED) ── */}
      {view === "twin" ? (
        <RealisticTwinMap isFullscreen={false} />
      ) : view === "heat" ? (
        <HeatmapView isFullscreen={false} />
      ) : (
        <GlobeMap isFullscreen={false} />
      )}

      {/* ── FULL SCREEN MODAL OVERLAY (FOR TWIN 3D, GLOBE 3D, AND HEATMAP) ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#070c18] p-3 sm:p-5 flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
          {/* Fullscreen Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
            {/* Left Title & View Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-wide">
                  🛰️ BHARAT DIGITAL TWIN — FULL SCREEN
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-950 border border-blue-700/80 text-blue-200 font-extrabold text-xs">
                  {currentState.name} ({currentState.id})
                </span>
              </div>

              {/* View Switcher inside Fullscreen */}
              <div className="flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setView("twin")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    view === "twin" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🛰️ Twin 3D
                </button>
                <button
                  onClick={() => setView("heat")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    view === "heat" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔥 Heatmap
                </button>
                <button
                  onClick={() => setView("globe")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    view === "globe" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 Globe 3D
                </button>
              </div>

              {/* Variable Switcher inside Fullscreen */}
              <div className="hidden lg:flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-lg p-0.5 text-xs">
                {[
                  ["temperature", "🌡 Temp"],
                  ["rainfall", "🌧 Rain"],
                  ["humidity", "💧 Humidity"],
                  ["wind", "💨 Wind Flow"],
                ].map(([m, l]) => (
                  <button
                    key={m}
                    onClick={() => setMapMode(m)}
                    className={`px-2 py-1 rounded transition ${
                      mapMode === m ? "bg-blue-900 border border-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Past / Current / Future Tabs */}
            <div className="flex items-center gap-2">
              <MapHorizonTabs timeIndex={timeIndex} setTimeIndex={setTimeIndex} size="lg" />
            </div>

            {/* Right: Timestep Scrubber & Exit Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-[#0b1322] border border-slate-800 rounded-lg p-1 text-xs">
                {TIMESTEPS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeIndex(i)}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      i === timeIndex
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm"
              >
                <span>✕</span>
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Map Viewport */}
          <div className="flex-1 w-full my-2 relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
            {view === "twin" ? (
              <RealisticTwinMap isFullscreen={true} />
            ) : view === "heat" ? (
              <HeatmapView isFullscreen={true} />
            ) : (
              <GlobeMap isFullscreen={true} />
            )}
          </div>

          {/* Fullscreen Bottom Horizon Prediction Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#0b1322] border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-white">
                {currentState.name} ({currentState.capital}):
              </span>
              <span className="text-amber-400 font-bold">🌡️ {digitalTwin.temperature}°C</span>
              <span className="text-sky-300 font-bold">🌧️ {digitalTwin.rainfall} mm</span>
              <span className="text-teal-300 font-bold">💧 {digitalTwin.humidity}%</span>
            </div>

            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <span>Forecast Horizon:</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-700/80 font-mono">
                {currentTimestep.kind.toUpperCase()} • {currentTimestep.full}
              </span>
              {simulated && (
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700 font-mono">
                  SCENARIO ACTIVE (ΔT {tempDelta >= 0 ? `+${tempDelta}` : tempDelta}°C)
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono">Esc</kbd> to exit fullscreen
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
