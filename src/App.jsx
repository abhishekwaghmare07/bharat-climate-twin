import Charts from "./components/Charts";
import IndiaMap from "./components/IndiaMap";
import RegionPanel from "./components/RegionPanel";
import Simulator from "./components/Simulator";
import Timeline from "./components/Timeline";
import TopBar from "./components/TopBar";
import { TwinProvider, useTwin } from "./store/twinStore";
import { STATES } from "./data/mock";

function VariableStrip() {
  const { digitalTwin, theme, mapMode, setMapMode, nwpModel, weatherModels } = useTwin();
  const light = theme === "light";
  const activeModel = weatherModels.find((m) => m.id === nwpModel) || weatherModels[0];

  const cards = [
    ["temperature", "🌡 Temperature", `${digitalTwin.temperature}°C`, "border-amber-500", "text-amber-500", "2m Atmospheric Temp"],
    ["rainfall", "🌧 Rainfall", `${digitalTwin.rainfall} mm`, "border-sky-500", "text-sky-400", "Surface Precip."],
    ["humidity", "💧 Humidity", `${digitalTwin.humidity}%`, "border-teal-500", "text-teal-400", "Relative Humidity"],
    ["wind", "💨 Wind Flow", `${digitalTwin.wind} km/h`, "border-cyan-500", "text-cyan-400", "10m Vector Currents"],
    ["cloud", "☁ Cloud Cover", `${digitalTwin.cloud}%`, "border-indigo-400", "text-indigo-400", "Total Cloudiness"],
    ["condition", `${digitalTwin.weatherIcon || "🌤️"} Condition`, digitalTwin.weatherDesc || "Clear", "border-emerald-500", "text-emerald-400", `NWP: ${activeModel.name.split(" ")[0]}`],
  ];

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {cards.map(([key, l, v, b, tc, sub]) => {
          const isSelected = mapMode === key;
          return (
            <div
              key={l}
              onClick={() => {
                if (key !== "condition" && key !== "cloud") {
                  setMapMode(key);
                }
              }}
              className={`${
                light ? "bg-white border-slate-200" : "bg-[#0d1627] border-slate-800"
              } border-t-2 ${b} border rounded-lg px-3 py-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] ${
                isSelected ? "ring-2 ring-blue-500/80 bg-blue-950/20 shadow-md" : ""
              }`}
              title={key !== "condition" ? `Click to activate ${l} mode` : undefined}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold tracking-wider ${light ? "text-slate-500" : "text-slate-400"}`}>
                  {l.toUpperCase()}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                )}
              </div>
              <div className={`text-lg font-black mt-0.5 truncate ${light ? "text-slate-900" : "text-white"}`}>
                {v}
              </div>
              <div className="text-[9px] text-slate-500 font-mono truncate mt-0.5">
                {sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StateChips() {
  const { regionId, setRegionId, theme } = useTwin();
  const light = theme === "light";
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
      {STATES.map((s) => (
        <button
          key={s.id}
          onClick={() => setRegionId(s.id)}
          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
            regionId === s.id
              ? "bg-blue-600 text-white border-blue-500 font-bold shadow-sm"
              : light
              ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              : "bg-[#0d1627] text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}

function Shell() {
  const { theme, liveApiActive, nwpModel, weatherModels } = useTwin();
  const light = theme === "light";
  const activeModel = weatherModels.find((m) => m.id === nwpModel) || weatherModels[0];

  return (
    <div className={`min-h-full ${light ? "bg-[#f8fafc] text-slate-900" : "bg-[#070c18] text-slate-100"}`}>
      <TopBar />
      <main className="max-w-[1280px] mx-auto p-3 sm:p-4 space-y-3">
        <VariableStrip />
        <div className="grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <IndiaMap />
            <StateChips />
            <Timeline />
          </div>
          <div className="space-y-3">
            <RegionPanel />
            <Simulator />
          </div>
        </div>
        <Charts />
        <footer className={`text-center text-[11px] py-4 space-y-1 ${light ? "text-slate-500" : "text-slate-500"}`}>
          <div>
            Bharat Climate Digital Twin • Powered by <strong>Open-Meteo Numerical Weather Prediction API</strong>
          </div>
          <div className="text-[10px] text-slate-400">
            Active NWP Atmospheric Model: <span className="text-sky-400 font-semibold">{activeModel.name}</span> ({activeModel.org}) • Real-time assimilation &amp; multi-model ensemble (ECMWF IFS, NOAA GFS, DWD ICON, CMC GEM) • React + Recharts + MapLibre
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TwinProvider>
      <Shell />
    </TwinProvider>
  );
}
