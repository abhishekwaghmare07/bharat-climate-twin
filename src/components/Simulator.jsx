import { useTwin } from "../store/twinStore";

export default function Simulator() {
  const { tempDelta, setTempDelta, rainDeltaPct, setRainDeltaPct, simulated, setSimulated, digitalTwin, theme } = useTwin();
  const light = theme === "light";
  const base = digitalTwin.currentData;
  const scenT = base.temp + (simulated ? tempDelta : 0);
  const scenR = Math.max(0, Math.round(base.rain * (1 + (simulated ? rainDeltaPct : 0) / 100) * 10) / 10);

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all ${
        light ? "bg-white text-slate-900 border-slate-200" : "bg-[#0d1627] text-slate-100 border-slate-800"
      }`}
    >
      <div className="bg-[#0b1322] text-slate-200 px-4 py-2.5 text-xs font-extrabold tracking-wider border-b border-slate-800/80 flex justify-between items-center">
        <span>WHAT-IF NUMERICAL EXPERIMENT</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
            simulated
              ? "bg-amber-600/90 text-white border border-amber-500 shadow-sm"
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {simulated ? "ACTIVE RUN" : "STANDBY"}
        </span>
      </div>

      <div className="p-4 text-sm space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`font-semibold text-xs ${light ? "text-slate-700" : "text-slate-300"}`}>
              Temperature Perturbation
            </label>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                light ? "bg-slate-100 text-slate-800 border border-slate-200" : "bg-[#0b1322] text-sky-400 border border-slate-800"
              }`}
            >
              {tempDelta >= 0 ? "+" : ""}{tempDelta}°C
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>-5°C</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.5}
              value={tempDelta}
              onChange={(e) => {
                setTempDelta(Number(e.target.value));
                setSimulated(false);
              }}
              className="flex-1 cursor-pointer"
            />
            <span>+5°C</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`font-semibold text-xs ${light ? "text-slate-700" : "text-slate-300"}`}>
              Rainfall Sensitivity
            </label>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                light ? "bg-slate-100 text-slate-800 border border-slate-200" : "bg-[#0b1322] text-sky-400 border border-slate-800"
              }`}
            >
              {rainDeltaPct >= 0 ? "+" : ""}{rainDeltaPct}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>-50%</span>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={rainDeltaPct}
              onChange={(e) => {
                setRainDeltaPct(Number(e.target.value));
                setSimulated(false);
              }}
              className="flex-1 cursor-pointer"
            />
            <span>+50%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setSimulated(true)}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition"
          >
            Run Numerical Simulation
          </button>
          <button
            onClick={() => {
              setTempDelta(0);
              setRainDeltaPct(0);
              setSimulated(false);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              light
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div
            className={`rounded-lg p-2.5 border ${
              light ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#0b1322] border-slate-800 text-slate-300"
            }`}
          >
            <div className="text-[10px] font-bold tracking-wider text-slate-400">BASELINE</div>
            <div className={`text-xl font-black mt-0.5 ${light ? "text-slate-900" : "text-white"}`}>
              {base.temp}°C
            </div>
            <div className={`text-xs font-bold ${light ? "text-sky-700" : "text-sky-400"}`}>
              {base.rain} mm
            </div>
          </div>

          <div
            className={`rounded-lg p-2.5 border ${
              simulated
                ? light
                  ? "border-amber-400 bg-amber-50 text-slate-900"
                  : "border-amber-600/70 bg-amber-950/25 text-amber-100"
                : light
                ? "border-dashed border-slate-200 bg-slate-50/50 text-slate-400"
                : "border-dashed border-slate-800 bg-[#0b1322]/50 text-slate-500"
            }`}
          >
            <div className={`text-[10px] font-bold tracking-wider ${simulated ? (light ? "text-amber-700" : "text-amber-400") : "text-slate-400"}`}>
              SCENARIO
            </div>
            <div className={`text-xl font-black mt-0.5 ${simulated ? (light ? "text-slate-900" : "text-amber-300") : ""}`}>
              {simulated ? `${scenT.toFixed(1)}°C` : "—"}
            </div>
            <div className={`text-xs font-bold ${simulated ? (light ? "text-sky-700" : "text-sky-400") : ""}`}>
              {simulated ? `${scenR} mm` : "—"}
            </div>
          </div>
        </div>

        <p className={`text-[11px] leading-relaxed pt-1 ${light ? "text-slate-500" : "text-slate-400"}`}>
          Real-time perturbation propagated through physics parameterizations. Linked to India 3D twin & graphs.
        </p>
      </div>
    </div>
  );
}
