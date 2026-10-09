import { NOW_INDEX, TIMESTEPS } from "../data/mock";
import { useTwin } from "../store/twinStore";

export default function Timeline() {
  const { timeIndex, setTimeIndex, theme } = useTwin();
  const light = theme === "light";

  return (
    <div className={`${light ? "bg-white border-slate-200" : "bg-[#0d1627] border-slate-800"} border rounded-xl p-3.5 mt-2.5 shadow-sm transition-all`}>
      <div className="flex flex-wrap items-center justify-between text-xs mb-2.5 gap-2">
        {/* Past / Current / Future Quick Jumps */}
        <div className="flex items-center gap-1 bg-[#0b1322] border border-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setTimeIndex(0)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              TIMESTEPS[timeIndex].kind === "observed"
                ? "bg-slate-700 text-white shadow-sm border border-slate-600"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            ⏪ Past
          </button>
          <button
            onClick={() => setTimeIndex(NOW_INDEX)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
              TIMESTEPS[timeIndex].kind === "current"
                ? "bg-emerald-700 text-white shadow-sm border border-emerald-600/80"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            🟢 Current (NOW)
          </button>
          <button
            onClick={() => setTimeIndex(5)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
              TIMESTEPS[timeIndex].kind === "predicted"
                ? "bg-blue-600 text-white shadow-sm border border-blue-500/80"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            🔮 Future Prediction
          </button>
        </div>

        <span
          className={`px-2.5 py-1 rounded-md font-mono text-[11px] border ${
            TIMESTEPS[timeIndex].kind === "current"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/80"
              : TIMESTEPS[timeIndex].kind === "observed"
              ? "bg-slate-800 text-slate-300 border-slate-700"
              : "bg-blue-950/80 text-blue-200 border-blue-700/80"
          }`}
        >
          {TIMESTEPS[timeIndex].kind.toUpperCase()} • {TIMESTEPS[timeIndex].full}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTimeIndex((timeIndex + 5) % 6)}
          className={`px-2.5 py-1.5 text-xs border rounded-lg transition ${
            light ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-[#0b1322] border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
          title="Previous timestep"
        >
          ◀
        </button>
        <div className="flex-1 grid grid-cols-6 gap-1">
          {TIMESTEPS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTimeIndex(i)}
              className={`py-2 rounded-lg text-xs font-semibold border transition ${
                i === timeIndex
                  ? "bg-blue-600 border-blue-500 text-white font-bold shadow-sm"
                  : light
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-[#0b1322] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              } ${i === NOW_INDEX && i !== timeIndex ? "ring-1 ring-emerald-500/50" : ""}`}
            >
              {t.label}
              <div className="text-[9px] font-normal opacity-80">
                {t.kind === "current" ? "● now" : t.kind}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setTimeIndex((timeIndex + 1) % 6)}
          className={`px-2.5 py-1.5 text-xs border rounded-lg transition ${
            light ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-[#0b1322] border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
          title="Next timestep"
        >
          ▶
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        value={timeIndex}
        onChange={(e) => setTimeIndex(Number(e.target.value))}
        className="w-full mt-3 accent-blue-600 cursor-pointer"
      />
    </div>
  );
}
