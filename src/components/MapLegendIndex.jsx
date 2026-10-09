import { useState } from "react";

export const LEGEND_SCALES = {
  temperature: {
    title: "Temperature Scale",
    unit: "°C",
    icon: "🌡",
    gradient: "linear-gradient(to right, #38bdf8, #22c55e, #facc15, #f97316, #ef4444)",
    stops: [
      { range: "< 20°", label: "Cool", color: "#38bdf8" },
      { range: "20–25°", label: "Mild", color: "#22c55e" },
      { range: "25–29°", label: "Warm", color: "#facc15" },
      { range: "29–32°", label: "Hot", color: "#f97316" },
      { range: "> 32°", label: "Extreme", color: "#ef4444" },
    ],
  },
  rainfall: {
    title: "Precipitation Scale",
    unit: "mm",
    icon: "🌧",
    gradient: "linear-gradient(to right, #fef3c7, #7dd3fc, #38bdf8, #2563eb, #1e1b4b)",
    stops: [
      { range: "0–5", label: "Trace", color: "#fef3c7" },
      { range: "5–12", label: "Light", color: "#7dd3fc" },
      { range: "12–20", label: "Moderate", color: "#38bdf8" },
      { range: "20–28", label: "Heavy", color: "#2563eb" },
      { range: "> 28", label: "Torrential", color: "#1e1b4b" },
    ],
  },
  humidity: {
    title: "Relative Humidity Scale",
    unit: "%",
    icon: "💧",
    gradient: "linear-gradient(to right, #fef9c3, #a5f3fc, #34d399, #0d9488)",
    stops: [
      { range: "< 45%", label: "Arid", color: "#fef9c3" },
      { range: "45–60%", label: "Comfort", color: "#a5f3fc" },
      { range: "60–75%", label: "Humid", color: "#34d399" },
      { range: "> 75%", label: "Saturated", color: "#0d9488" },
    ],
  },
  wind: {
    title: "Wind Velocity Scale",
    unit: "km/h",
    icon: "💨",
    gradient: "linear-gradient(to right, #38bdf8, #2dd4bf, #a3e635, #facc15, #f97316)",
    stops: [
      { range: "< 12", label: "Gentle", color: "#38bdf8" },
      { range: "12–22", label: "Breeze", color: "#2dd4bf" },
      { range: "22–32", label: "Fresh", color: "#a3e635" },
      { range: "32–42", label: "Strong", color: "#facc15" },
      { range: "> 42", label: "Gale/Storm", color: "#f97316" },
    ],
  },
};

export default function MapLegendIndex({ mode = "temperature", className = "" }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scale = LEGEND_SCALES[mode] || LEGEND_SCALES.temperature;

  return (
    <div
      className={`absolute z-20 pointer-events-auto transition-all duration-300 ${className}`}
    >
      <div className="bg-[#070e1c]/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl text-xs select-none min-w-[210px] max-w-[260px]">
        {/* Header / Collapse Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px] tracking-wide">
            <span>{scale.icon}</span>
            <span>{scale.title}</span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">({scale.unit})</span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition font-mono text-xs"
            title={isCollapsed ? "Expand Color Index" : "Collapse Color Index"}
          >
            {isCollapsed ? "＋" : "−"}
          </button>
        </div>

        {/* Expanded View */}
        {!isCollapsed && (
          <div className="mt-2 space-y-2">
            {/* Continuous Gradient Bar */}
            <div
              className="h-2 rounded-full w-full shadow-inner border border-slate-700/50"
              style={{ background: scale.gradient }}
            />

            {/* Individual Swatches and Definitions */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5">
              {scale.stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm border border-slate-700/60"
                    style={{ backgroundColor: stop.color }}
                  />
                  <div className="flex items-baseline gap-1 overflow-hidden">
                    <span className="font-mono font-bold text-white shrink-0">
                      {stop.range}
                    </span>
                    <span className="text-slate-400 truncate text-[9.5px]">
                      {stop.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint */}
            <div className="text-[9px] text-slate-500 pt-0.5 border-t border-slate-800/80 flex items-center justify-between">
              <span>Color Definition Index</span>
              <span className="font-mono text-slate-400">Live Telemetry</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
