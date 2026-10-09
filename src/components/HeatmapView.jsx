import { useEffect, useMemo, useRef, useState } from "react";
import { INDIA_GEOJSON } from "../data/geo";
import { SERIES, STATES } from "../data/mock";
import { useTwin } from "../store/twinStore";

const TS_IDS = ["-24h", "-12h", "NOW", "+6h", "+12h", "+24h"];

const LAYERS = [
  { id: "temperature", label: "Temperature", unit: "°C", icon: "🌡", get: (v) => v.temp },
  { id: "rainfall", label: "Precipitation", unit: "mm", icon: "🌧", get: (v) => v.rain },
  { id: "humidity", label: "Humidity", unit: "%", icon: "💧", get: (v) => v.humidity },
  { id: "wind", label: "Wind", unit: "km/h", icon: "💨", get: (v) => v.wind },
  { id: "cloud", label: "Cloud Cover", unit: "%", icon: "☁", get: (v) => v.cloud },
];

// Destination Earth / Viridis colormap stops
const VIR = [
  [0.267, 0.005, 0.329],
  [0.283, 0.141, 0.458],
  [0.254, 0.265, 0.530],
  [0.207, 0.372, 0.553],
  [0.164, 0.471, 0.558],
  [0.128, 0.567, 0.551],
  [0.135, 0.659, 0.518],
  [0.267, 0.749, 0.441],
  [0.478, 0.821, 0.318],
  [0.741, 0.873, 0.149],
  [0.993, 0.906, 0.144],
];

function viridis(t) {
  const x = Math.min(0.9999, Math.max(0, t)) * (VIR.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = VIR[i];
  const b = VIR[i + 1];
  return [
    Math.round((a[0] + (b[0] - a[0]) * f) * 255),
    Math.round((a[1] + (b[1] - a[1]) * f) * 255),
    Math.round((a[2] + (b[2] - a[2]) * f) * 255),
  ];
}

const viridisCss = `linear-gradient(to top, ${VIR.map(
  (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(",")})`
).join(",")})`;

function word(t) {
  if (t < 0.2) return "Very Low";
  if (t < 0.4) return "Low";
  if (t < 0.6) return "Moderate";
  if (t < 0.8) return "High";
  return "Very High";
}

// Major representative states for uncluttered labelling
const PRIMARY_LABEL_STATES = new Set([
  "RJ", "MH", "MP", "UP", "GJ", "KA", "TN", "AP", "WB", "OD", "PB", "KL", "AS", "BR", "JK"
]);

export default function HeatmapView({ isFullscreen = false }) {
  const {
    regionId,
    setRegionId,
    timeIndex,
    mapMode,
    setMapMode,
    simulated,
    tempDelta,
    rainDeltaPct,
    series,
  } = useTwin();

  const [layerId, setLayerId] = useState(mapMode);
  const [overlayOn, setOverlayOn] = useState(true);
  const [gains, setGains] = useState({ temperature: 1, rainfall: 1, humidity: 1, wind: 1, cloud: 1 });
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, state: null, val: null });

  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const satelliteImgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [size, setSize] = useState({ w: 900, h: 560 });

  const tsId = TS_IDS[timeIndex];
  const layer = LAYERS.find((l) => l.id === layerId) || LAYERS[0];

  // Preload satellite basemap image
  useEffect(() => {
    const img = new Image();
    img.src = "/india_satellite.jpg";
    img.onload = () => {
      satelliteImgRef.current = img;
      setImgLoaded(true);
    };
  }, []);

  // Per-state values (scenario-aware) + normalization
  const { vals, tNorm, avg } = useMemo(() => {
    const vals = {};
    for (const s of STATES) {
      const v = series?.[s.id]?.[tsId] || SERIES[s.id]?.[tsId] || { temp: 28, rain: 15, humidity: 65, wind: 14, cloud: 40 };
      let raw = layer.get(v);
      if (simulated) {
        if (layerId === "temperature") raw = Math.round((raw + tempDelta) * 10) / 10;
        if (layerId === "rainfall") raw = Math.max(0, Math.round(raw * (1 + rainDeltaPct / 100) * 10) / 10);
      }
      vals[s.id] = raw;
    }
    const arr = Object.values(vals);
    const mn = Math.min(...arr);
    const mx = Math.max(...arr);
    const tNorm = {};
    for (const k of Object.keys(vals)) {
      tNorm[k] = mx === mn ? 0.5 : (vals[k] - mn) / (mx - mn);
    }
    return { vals, tNorm, avg: { mn, mx } };
  }, [tsId, layer, layerId, simulated, tempDelta, rainDeltaPct, series]);

  // Responsive resize observer
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Canvas render with accurate clipping & uncluttered text
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { w, h } = size;
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");

    // Coordinate mapping (covering all India)
    const PAD_X = 50;
    const PAD_Y = 25;
    const minLon = 67.5;
    const maxLon = 97.8;
    const minLat = 6.5;
    const maxLat = 36.5;

    const scX = (w - PAD_X * 2) / (maxLon - minLon);
    const scY = (h - PAD_Y * 2) / (maxLat - minLat);
    const sc = Math.min(scX, scY);

    const offX = PAD_X + (w - PAD_X * 2 - (maxLon - minLon) * sc) / 2;
    const offY = PAD_Y + (h - PAD_Y * 2 - (maxLat - minLat) * sc) / 2;

    const X = (lon) => offX + (lon - minLon) * sc;
    const Y = (lat) => offY + (maxLat - lat) * sc;

    // 1. Clear background: deep space dark blue
    ctx.fillStyle = "#060b17";
    ctx.fillRect(0, 0, w, h);

    // 2. Mission control subtle graticule lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
    ctx.lineWidth = 1;
    for (let lon = 68; lon <= 96; lon += 4) {
      ctx.beginPath();
      ctx.moveTo(X(lon), 0);
      ctx.lineTo(X(lon), h);
      ctx.stroke();
    }
    for (let lat = 8; lat <= 36; lat += 4) {
      ctx.beginPath();
      ctx.moveTo(0, Y(lat));
      ctx.lineTo(w, Y(lat));
      ctx.stroke();
    }

    // Helper to trace all state polygon boundaries
    const traceAllBoundaries = () => {
      ctx.beginPath();
      for (const f of INDIA_GEOJSON.features) {
        const geom = f.geometry;
        if (geom.type === "Polygon") {
          for (const ring of geom.coordinates) {
            ring.forEach(([lon, lat], i) => {
              const x = X(lon), y = Y(lat);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
          }
        } else if (geom.type === "MultiPolygon") {
          for (const poly of geom.coordinates) {
            for (const ring of poly) {
              ring.forEach(([lon, lat], i) => {
                const x = X(lon), y = Y(lat);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.closePath();
            }
          }
        }
      }
    };

    // 3. DRAW HEATMAP STRICTLY CLIPPED TO INDIA'S BOUNDARIES!
    if (overlayOn) {
      ctx.save();
      traceAllBoundaries();
      ctx.clip(); // <<-- KEY FIX: Heatmap is now clipped cleanly to India landmass!

      // Basemap inside India: subtle satellite terrain if loaded
      if (satelliteImgRef.current) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(
          satelliteImgRef.current,
          X(66.8),
          Y(37.6),
          (98.2 - 66.8) * sc,
          (37.6 - 4.8) * sc
        );
        ctx.globalAlpha = 1.0;
      }

      // Generate smooth interpolated simulation field
      const centers = STATES.map((s) => ({
        id: s.id,
        x: X(s.lon),
        y: Y(s.lat),
        t: tNorm[s.id] ?? 0.5,
      }));

      const SIG = Math.max(38, sc * 2.2);
      const gain = gains[layerId] ?? 1;

      // Render onto an offscreen canvas or buffer
      const buffer = ctx.createImageData(w, h);
      const data = buffer.data;

      // Sample bounding box of India to speed up calculation
      const minPxX = Math.max(0, Math.floor(X(68.0)));
      const maxPxX = Math.min(w, Math.ceil(X(97.5)));
      const minPxY = Math.max(0, Math.floor(Y(37.0)));
      const maxPxY = Math.min(h, Math.ceil(Y(7.0)));

      for (let y = minPxY; y < maxPxY; y += 2) {
        for (let x = minPxX; x < maxPxX; x += 2) {
          let num = 0;
          let den = 0;
          for (let i = 0; i < centers.length; i++) {
            const c = centers[i];
            const dx = x - c.x;
            const dy = y - c.y;
            const d2 = dx * dx + dy * dy;
            const g = Math.exp(-d2 / (2 * SIG * SIG));
            num += g * c.t;
            den += g;
          }

          const f = den > 0.0001 ? (num / den) * gain : 0;
          const [r, g2, b] = viridis(Math.min(1, Math.max(0, f)));

          // Write 2x2 block for crisp performance
          for (let dy = 0; dy < 2 && y + dy < h; dy++) {
            for (let dx = 0; dx < 2 && x + dx < w; dx++) {
              const k = ((y + dy) * w + (x + dx)) * 4;
              data[k] = r;
              data[k + 1] = g2;
              data[k + 2] = b;
              data[k + 3] = 195; // Vibrant 76% opacity over terrain
            }
          }
        }
      }

      // Blit to screen
      const tempCv = document.createElement("canvas");
      tempCv.width = w;
      tempCv.height = h;
      tempCv.getContext("2d").putImageData(buffer, 0, 0);
      ctx.drawImage(tempCv, 0, 0);

      ctx.restore();
    }

    // 4. DRAW STATE BORDERS (crisp vector lines)
    for (const f of INDIA_GEOJSON.features) {
      const id = f.properties.id;
      const isSelected = id === regionId;
      const isHovered = id === hoveredState;

      ctx.beginPath();
      const geom = f.geometry;
      if (geom.type === "Polygon") {
        for (const ring of geom.coordinates) {
          ring.forEach(([lon, lat], i) => {
            const x = X(lon), y = Y(lat);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
      } else if (geom.type === "MultiPolygon") {
        for (const poly of geom.coordinates) {
          for (const ring of poly) {
            ring.forEach(([lon, lat], i) => {
              const x = X(lon), y = Y(lat);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
          }
        }
      }

      ctx.strokeStyle = isSelected
        ? "#fb923c"
        : isHovered
        ? "#38bdf8"
        : "rgba(226, 232, 240, 0.4)";
      ctx.lineWidth = isSelected ? 3.2 : isHovered ? 2.2 : 0.9;
      ctx.stroke();

      if (isSelected) {
        ctx.fillStyle = "rgba(251, 146, 60, 0.22)";
        ctx.fill();
      }
    }

    // 5. DRAW CLEAN, UNCLUTTERED STATE LABELS
    // Only label primary states + selected state + hovered state to prevent overlap!
    for (const s of STATES) {
      const id = s.id;
      const isSelected = id === regionId;
      const isHovered = id === hoveredState;
      const shouldShow = isSelected || isHovered || PRIMARY_LABEL_STATES.has(id);

      if (!shouldShow) continue;

      const px = X(s.lon);
      const py = Y(s.lat);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw State Badge ID
      ctx.font = isSelected ? "800 13px system-ui" : "700 11px system-ui";
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(6, 12, 24, 0.95)";
      ctx.strokeText(id, px, py - 4);
      ctx.fillStyle = isSelected ? "#fde047" : "#ffffff";
      ctx.fillText(id, px, py - 4);

      // Draw Value below ID
      if (isSelected || isHovered) {
        ctx.font = "bold 11px system-ui";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(6, 12, 24, 0.95)";
        ctx.strokeText(`${vals[id]}${layer.unit}`, px, py + 11);
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`${vals[id]}${layer.unit}`, px, py + 11);
      }
    }
  }, [size, tNorm, vals, layer, layerId, gains, overlayOn, regionId, hoveredState, imgLoaded]);

  // Click handler to select closest state
  const handleCanvasClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    const PAD_X = 50, PAD_Y = 25;
    const minLon = 67.5, maxLon = 97.8, minLat = 6.5, maxLat = 36.5;
    const sc = Math.min((size.w - PAD_X * 2) / (maxLon - minLon), (size.h - PAD_Y * 2) / (maxLat - minLat));
    const offX = PAD_X + (size.w - PAD_X * 2 - (maxLon - minLon) * sc) / 2;
    const offY = PAD_Y + (size.h - PAD_Y * 2 - (maxLat - minLat) * sc) / 2;
    const X = (lon) => offX + (lon - minLon) * sc;
    const Y = (lat) => offY + (maxLat - lat) * sc;

    let best = null, bd = 1e9;
    for (const s of STATES) {
      const px = X(s.lon);
      const py = Y(s.lat);
      const dd = (mx - px) ** 2 + (my - py) ** 2;
      if (dd < bd) {
        bd = dd;
        best = s.id;
      }
    }
    if (best && Math.sqrt(bd) < 65) {
      setRegionId(best);
    }
  };

  // Mouse move handler for clean hover tooltip
  const handleCanvasMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    const PAD_X = 50, PAD_Y = 25;
    const minLon = 67.5, maxLon = 97.8, minLat = 6.5, maxLat = 36.5;
    const sc = Math.min((size.w - PAD_X * 2) / (maxLon - minLon), (size.h - PAD_Y * 2) / (maxLat - minLat));
    const offX = PAD_X + (size.w - PAD_X * 2 - (maxLon - minLon) * sc) / 2;
    const offY = PAD_Y + (size.h - PAD_Y * 2 - (maxLat - minLat) * sc) / 2;
    const X = (lon) => offX + (lon - minLon) * sc;
    const Y = (lat) => offY + (maxLat - lat) * sc;

    let best = null, bd = 1e9;
    for (const s of STATES) {
      const px = X(s.lon);
      const py = Y(s.lat);
      const dd = (mx - px) ** 2 + (my - py) ** 2;
      if (dd < bd) {
        bd = dd;
        best = s;
      }
    }

    if (best && Math.sqrt(bd) < 45) {
      setHoveredState(best.id);
      setTooltip({
        visible: true,
        x: mx,
        y: my,
        state: best,
        val: vals[best.id],
      });
    } else {
      setHoveredState(null);
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const pickLayer = (id) => {
    setLayerId(id);
    if (["temperature", "rainfall", "humidity"].includes(id)) setMapMode(id);
    setOverlayOn(true);
  };

  return (
    <div>
      {/* ── VARIABLE LAYER CARDS ── */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
        {LAYERS.map((l) => {
          const active = l.id === layerId;
          return (
            <div
              key={l.id}
              onClick={() => pickLayer(l.id)}
              className={`rounded-xl border px-3 py-2 cursor-pointer transition ${
                active
                  ? "bg-blue-950/70 border-blue-600 shadow-sm"
                  : "bg-[#0d1627] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayOn((o) => (l.id === layerId ? !o : true));
                    if (l.id !== layerId) pickLayer(l.id);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                    active && overlayOn ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                  title="Toggle layer"
                >
                  👁
                </button>
                <div className="text-xs text-slate-200 font-semibold">{l.label}</div>
                <div className="ml-auto text-[10px] italic text-slate-400">
                  {word(tNorm[regionId] ?? 0.5)}
                </div>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.8}
                step={0.05}
                value={gains[l.id]}
                title="Layer intensity"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setGains((g) => ({ ...g, [l.id]: Number(e.target.value) }))}
                className="w-full mt-1.5 h-1.5 accent-blue-600 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {/* ── HEATMAP CANVAS CONTAINER ── */}
      <div className={`relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#060b17] ${isFullscreen ? "h-full min-h-[72vh]" : ""}`}>
        <div
          ref={boxRef}
          className={`w-full ${isFullscreen ? "h-full min-h-[70vh]" : "h-[540px] sm:h-[580px]"} cursor-pointer`}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => {
            setHoveredState(null);
            setTooltip((t) => ({ ...t, visible: false }));
          }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Floating Tooltip */}
        {tooltip.visible && tooltip.state && (
          <div
            className="absolute z-40 pointer-events-none p-2.5 rounded-xl border border-slate-700 shadow-2xl text-xs"
            style={{
              left: Math.min(window.innerWidth > 768 ? 400 : 200, tooltip.x + 15),
              top: Math.max(50, tooltip.y - 65),
              background: "rgba(9, 14, 28, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="font-extrabold text-white text-sm flex items-center justify-between gap-3">
              <span>{tooltip.state.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-700/80 text-blue-200">
                {tooltip.state.id}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Capital: {tooltip.state.capital}</div>
            <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-300 font-bold">{layer.label}:</span>
              <span className="text-sm font-black text-amber-300">
                {tooltip.val} {layer.unit}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 italic">Click to select in Region Panel</div>
          </div>
        )}

        {/* Right Rail Legend */}
        <div className="absolute top-4 bottom-14 right-4 flex gap-1 items-stretch pointer-events-none">
          <div className="flex flex-col justify-between text-[11px] text-white text-right font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pr-0.5">
            <span>{avg.mx.toFixed(1)}</span>
            <span>{((avg.mx + avg.mn) / 2).toFixed(1)}</span>
            <span>{avg.mn.toFixed(1)}</span>
          </div>
          <div className="w-3.5 rounded shadow-2xl border border-slate-700" style={{ background: viridisCss }} />
          <div className="flex flex-col justify-between pl-0.5">
            <span className="text-[11px] text-slate-200 font-bold drop-shadow">{layer.unit}</span>
            <span
              className="text-[11px] text-slate-300 font-bold drop-shadow tracking-wider"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {layer.label}
            </span>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2 bg-[#090e1a]/95 border-t border-slate-800">
          <div className="text-xs font-semibold text-sky-300">
            {layer.label} field over India • {tsId} • clipped to national mesh{simulated ? " • SCENARIO ACTIVE" : ""}
          </div>
          <div className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-700 text-white shadow-sm">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
