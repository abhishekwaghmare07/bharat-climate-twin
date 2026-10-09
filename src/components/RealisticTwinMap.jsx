import { useMemo, useState } from "react";
import { DISTRICTS, calculateDistrictWeather, getDistrictsByState } from "../data/districts";
import svgData from "../data/india_svg_paths.json";
import { SERIES, STATES, tempColor, rainColor, humidityColor, destineColormap } from "../data/mock";
import { useTwin } from "../store/twinStore";
import MapLegendIndex from "./MapLegendIndex";
import WindParticleOverlay from "./WindParticleOverlay";

const TS_IDS = ["-24h", "-12h", "NOW", "+6h", "+12h", "+24h"];

const NAME_ALIASES = {
  Odisha: "Orissa",
  Orissa: "Odisha",
  "Delhi NCR": "Delhi",
  Delhi: "Delhi NCR",
  Uttarakhand: "Uttaranchal",
  Uttaranchal: "Uttarakhand",
};

export default function RealisticTwinMap({ isFullscreen = false }) {
  const {
    regionId,
    setRegionId,
    districtId,
    setDistrictId,
    showDistricts,
    setShowDistricts,
    showWindFlow,
    setShowWindFlow,
    timeIndex,
    mapMode,
    setMapMode,
    simulated,
    tempDelta,
    rainDeltaPct,
    series,
  } = useTwin();

  const [selectedDays, setSelectedDays] = useState(4); // 1..6 days
  const [is3DView, setIs3DView] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, state: null, data: null, district: null });

  const tsId = TS_IDS[timeIndex];

  // Helper to match state
  const findState = (name) => {
    return (
      STATES.find((s) => s.name === name) ||
      STATES.find((s) => s.name === NAME_ALIASES[name]) ||
      STATES.find((s) => s.id === name) ||
      null
    );
  };

  // State data calculation
  const stateValues = useMemo(() => {
    const result = {};
    for (const s of STATES) {
      const v = series?.[s.id]?.[tsId] || SERIES[s.id]?.[tsId] || { temp: 28, rain: 15, humidity: 65, wind: 14 };
      let t = v.temp;
      let r = v.rain;
      let h = v.humidity;
      let w = v.wind;

      if (simulated) {
        t = Math.round((t + tempDelta) * 10) / 10;
        r = Math.max(0, Math.round(r * (1 + rainDeltaPct / 100) * 10) / 10);
      }

      // Normalized 0..1 probability / risk based on selected days and active variable
      let prob = 0.5;
      if (mapMode === "rainfall") {
        prob = (r / 38) * (selectedDays / 4);
      } else if (mapMode === "temperature") {
        prob = (t - 18) / 18;
      } else if (mapMode === "wind") {
        prob = w / 35;
      } else {
        prob = (h - 35) / 60;
      }
      prob = Math.max(0.05, Math.min(0.98, prob));

      result[s.id] = {
        state: s,
        temp: t,
        rain: r,
        humidity: h,
        wind: w,
        probability: Math.round(prob * 100) / 100,
      };
    }
    return result;
  }, [tsId, simulated, tempDelta, rainDeltaPct, selectedDays, mapMode, series]);

  // Current active state & districts in that state
  const currentState = STATES.find((s) => s.id === regionId) || STATES[0];
  const activeStateDistricts = useMemo(() => getDistrictsByState(regionId), [regionId]);
  const activeDistrict = DISTRICTS.find((d) => d.id === districtId) || activeStateDistricts[0] || null;

  // Geographic lat/lon to SVG coordinates transformation
  const projectToSvg = (lon, lat) => {
    const x = ((lon - 66.8) / (98.2 - 66.8)) * 896;
    const y = (1 - (lat - 4.8) / (37.6 - 4.8)) * 1200;
    return { x, y };
  };

  const handleMouseMove = (e, stateName) => {
    const s = findState(stateName);
    if (!s) return;
    const rect = e.currentTarget.closest(".map-box-viewport")?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      state: s,
      data: stateValues[s.id],
      district: null,
    });
  };

  const handleDistrictHover = (e, dist) => {
    e.stopPropagation();
    const rect = e.currentTarget.closest(".map-box-viewport")?.getBoundingClientRect();
    if (!rect) return;
    const parentState = STATES.find((s) => s.id === dist.stateId);
    const parentData = stateValues[dist.stateId];
    const distWeather = calculateDistrictWeather(dist, parentData);
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      state: parentState,
      data: distWeather,
      district: dist,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleStateClick = (stateName) => {
    const s = findState(stateName);
    if (s) setRegionId(s.id);
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? "h-full min-h-[75vh]" : "h-[580px] sm:h-[620px]"
      } rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-[#060c18] flex flex-col justify-between map-box-viewport select-none`}
    >
      {/* ── BACKGROUND MISSION CONTROL GRID PATTERN ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="twinDotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#38bdf8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#twinDotGrid)" />
      </svg>

      {/* ── TOP FLOATING CONTROL BAR ── */}
      <div className="relative z-20 px-3.5 pt-2.5 pb-1 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Badge + Days Selector */}
        <div className="flex items-center gap-2 bg-[#0b1426]/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-lg">
          <span className="text-[11px] font-extrabold text-cyan-400 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>3D DIGITAL TWIN • REAL SATELLITE</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-300 font-semibold hidden sm:inline">Days:</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                className={`w-5 h-5 rounded-md text-[10px] font-bold transition flex items-center justify-center ${
                  selectedDays === d
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={`Cumulated forecast over ${d} days`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Camera, Wind Flow & Districts Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b1426]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-lg text-xs">
          {/* Wind Streamline Toggle */}
          {/* Wind Mode Toggle */}
          <button
            onClick={() => setMapMode(mapMode === "wind" ? "temperature" : "wind")}
            className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
              mapMode === "wind"
                ? "bg-cyan-600 text-white border border-cyan-400 shadow-md"
                : "text-slate-300 hover:bg-slate-800"
            }`}
            title="Toggle animated wind particle flow over 3D terrain"
          >
            <span>💨</span>
            <span>Wind Flow</span>
          </button>

          {/* Districts Toggle */}
          <button
            onClick={() => setShowDistricts(!showDistricts)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
              showDistricts
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800"
            }`}
            title="Toggle inner district telemetry beacons"
          >
            <span>🏙️</span>
            <span>Districts</span>
          </button>

          <span className="w-px h-4 bg-slate-700" />

          {/* 3D Tilt */}
          <button
            onClick={() => setIs3DView(!is3DView)}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              is3DView ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
            }`}
            title="Toggle 3D tilted camera perspective"
          >
            {is3DView ? "🌐 3D Tilt" : "🗺️ 2D Flat"}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="w-5 h-5 rounded hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.1))}
              className="w-5 h-5 rounded hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* ── 3D MAP VIEWPORT CONTAINER ── */}
      <div
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden"
        style={{
          perspective: is3DView ? "1050px" : "none",
        }}
      >
        {/* Tilted map stage */}
        <div
          className="relative transition-transform duration-500 ease-out flex items-center justify-center"
          style={{
            transform: is3DView
              ? `rotateX(26deg) rotateZ(-1.5deg) scale(${0.96 * zoomLevel}) translateY(-10px)`
              : `scale(${0.96 * zoomLevel})`,
            transformOrigin: "50% 55%",
            filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.9))",
          }}
        >
          {/* Main SVG Map containing Satellite Image + Boundaries + Districts */}
          <svg
            viewBox="0 0 896 1200"
            className="w-[430px] sm:w-[480px] md:w-[530px] h-[540px] sm:h-[590px] md:h-[630px] max-w-none overflow-visible"
            style={{
              filter: "drop-shadow(0 0 15px rgba(2, 6, 23, 0.95))",
            }}
          >
            <defs>
              <pattern id="simRaster" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.6" fill="rgba(255,255,255,0.25)" />
                <circle cx="4.5" cy="4.5" r="0.6" fill="rgba(255,255,255,0.15)" />
              </pattern>

              <filter id="twinStateGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* LAYER 1: PHOTOREALISTIC SATELLITE BASMAP OF INDIA */}
            <image
              href="/india_satellite.jpg"
              x="0"
              y="0"
              width="896"
              height="1200"
              preserveAspectRatio="none"
              className="rounded-3xl"
              style={{
                filter: "contrast(1.1) brightness(0.95) saturate(1.12)",
              }}
            />

            {/* LAYER 2: DARK OCEANIC SURROUND VIGNETTE */}
            <rect
              x="0"
              y="0"
              width="896"
              height="1200"
              fill="transparent"
              style={{
                boxShadow: "inset 0 0 120px rgba(5,10,24,0.95)",
              }}
              pointerEvents="none"
            />

            {/* LAYER 3: 36 REAL INDIAN STATES & UNION TERRITORIES */}
            {Object.entries(svgData.paths).map(([stateName, pathD]) => {
              const stateObj = findState(stateName);
              const stateId = stateObj?.id || "";
              const isSelected = regionId === stateId;
              const data = stateValues[stateId];
              const meta = svgData.meta[stateName];

              // In wind mode: render states transparent so photorealistic satellite terrain and clean wind flow are visible!
              // In temp/rain/humidity: render appropriate thematic colormaps.
              let stateFill = "transparent";
              let stateOp = 0.001;

              if (mapMode === "temperature") {
                stateFill = tempColor(data?.temp ?? 28);
                stateOp = isSelected ? 0.72 : 0.42;
              } else if (mapMode === "rainfall") {
                stateFill = rainColor(data?.rain ?? 10);
                stateOp = isSelected ? 0.72 : 0.42;
              } else if (mapMode === "humidity") {
                stateFill = humidityColor(data?.humidity ?? 60);
                stateOp = isSelected ? 0.72 : 0.42;
              } else if (mapMode === "wind") {
                stateFill = isSelected ? "rgba(56, 189, 248, 0.22)" : "transparent";
                stateOp = isSelected ? 0.25 : 0.001;
              }

              return (
                <g key={stateName}>
                  {/* Base thematic path */}
                  <path
                    d={pathD}
                    fill={stateFill}
                    fillOpacity={stateOp}
                    stroke={isSelected ? "#38bdf8" : mapMode === "wind" ? "rgba(255, 255, 255, 0.35)" : "#ffffff"}
                    strokeWidth={isSelected ? 3.0 : mapMode === "wind" ? 0.8 : 1.1}
                    strokeOpacity={isSelected ? 1 : 0.75}
                    className="cursor-pointer transition-all duration-150 hover:fill-opacity-80"
                    filter={isSelected ? "url(#twinStateGlow)" : undefined}
                    onMouseMove={(e) => handleMouseMove(e, stateName)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleStateClick(stateName)}
                  />

                  {/* Representative state abbreviation label */}
                  {meta && meta.width > 26 && meta.height > 26 && mapMode !== "wind" && (
                    <text
                      x={meta.cx}
                      y={meta.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[11px] font-black pointer-events-none select-none tracking-wider"
                      fill="#ffffff"
                      style={{
                        paintOrder: "stroke",
                        stroke: "#030712",
                        strokeWidth: "2.5px",
                        strokeLinejoin: "round",
                        opacity: isSelected ? 1 : 0.85,
                      }}
                    >
                      {stateId}
                    </text>
                  )}
                </g>
              );
            })}

            {/* LAYER 4: INNER DISTRICT BEACONS & REGIONAL HUBS */}
            {showDistricts && (
              <g id="districts-layer">
                {activeStateDistricts.map((dist) => {
                  const pt = projectToSvg(dist.lon, dist.lat);
                  const isDistSelected = districtId === dist.id;
                  const parentData = stateValues[dist.stateId];
                  const distWeather = calculateDistrictWeather(dist, parentData);

                  return (
                    <g
                      key={dist.id}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDistrictId(dist.id);
                      }}
                      onMouseMove={(e) => handleDistrictHover(e, dist)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Pulse ring for active district */}
                      {isDistSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={14}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin"
                          style={{ animationDuration: "6s" }}
                        />
                      )}

                      {/* District core beacon */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isDistSelected ? 6.5 : 4.5}
                        fill={isDistSelected ? "#fbbf24" : "#38bdf8"}
                        stroke="#030712"
                        strokeWidth="1.5"
                        filter="drop-shadow(0 0 4px rgba(56,189,248,0.9))"
                      />

                      {/* District name label */}
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        className="text-[10px] font-extrabold select-none pointer-events-none"
                        fill={isDistSelected ? "#fef08a" : "#f8fafc"}
                        style={{
                          paintOrder: "stroke",
                          stroke: "#020617",
                          strokeWidth: "2.5px",
                        }}
                      >
                        {dist.name.split(" ")[0]} ({distWeather.temp}°)
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* LAYER 5: ANIMATED 3D WIND STREAMLINES OVERLAY (ONLY IN WIND SECTION) */}
          {mapMode === "wind" && (
            <WindParticleOverlay
              active={true}
              bounds={{ minLon: 66.8, maxLon: 98.2, minLat: 4.8, maxLat: 37.6 }}
              opacity={0.88}
              showHud={false}
            />
          )}
        </div>
      </div>

      {/* ── HOVER TELEMETRY TOOLTIP ── */}
      {tooltip.visible && (
        <div
          className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-full -mt-3.5 px-3 py-2 rounded-xl bg-[#070e1c]/95 border border-cyan-700/80 text-white text-xs shadow-2xl backdrop-blur-md space-y-0.5 min-w-[150px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.district ? (
            <>
              <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                DISTRICT HUB • {tooltip.district.stateName}
              </div>
              <div className="font-extrabold text-sm text-white">{tooltip.district.name}</div>
              <div className="text-xs font-black text-amber-300 mt-0.5">
                🌡 {tooltip.data.temp}°C • 🌧 {tooltip.data.rain} mm
              </div>
              <div className="text-[10px] text-slate-300">
                Terrain: <b>{tooltip.district.elevation}m</b> elev • {tooltip.district.type}
              </div>
            </>
          ) : tooltip.state ? (
            <>
              <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                STATE • {tooltip.state.id}
              </div>
              <div className="font-extrabold text-sm text-white">{tooltip.state.name}</div>
              <div className="text-xs font-black text-amber-300 mt-0.5">
                🌡 {tooltip.data?.temp}°C • 🌧 {tooltip.data?.rain} mm • 💨 {tooltip.data?.wind} km/h
              </div>
              <div className="text-[10px] text-slate-400">
                Capital: {tooltip.state.capital}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── MAP COLOR SCALE INDEX / LEGEND KEY ── */}
      <MapLegendIndex mode={mapMode} className="bottom-16 right-3" />

      {/* ── BOTTOM HUD MISSION DECK ── */}
      <div className="relative z-20 px-3.5 py-2.5 bg-gradient-to-t from-[#060c18] via-[#060c18]/90 to-transparent flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Active State & District Info */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target:</span>
            <b className="text-white font-black">{currentState.name}</b>
            <span className="text-[10px] text-slate-400 font-mono">({currentState.id})</span>
          </div>

          {activeDistrict && (
            <div className="px-2.5 py-1.5 rounded-lg bg-[#071328] border border-cyan-700/80 text-cyan-200 font-mono text-[11px] flex items-center gap-1.5 shadow-sm">
              <span>🏙️ District:</span>
              <b className="text-white font-bold">{activeDistrict.name}</b>
              <span className="text-slate-400">({activeDistrict.elevation}m elev)</span>
            </div>
          )}
        </div>

        {/* Right: Variable Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#0b1426] border border-slate-800 rounded-lg p-0.5">
          {[
            ["temperature", "🌡 Temp"],
            ["rainfall", "🌧 Rain"],
            ["humidity", "💧 Humidity"],
            ["wind", "💨 Wind Flow"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMapMode(m)}
              className={`px-2.5 py-1 rounded-md transition font-bold text-xs ${
                mapMode === m
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
