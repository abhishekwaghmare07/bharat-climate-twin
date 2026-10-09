import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { getDistrictsGeoJSON } from "../data/districts";
import { INDIA_GEOJSON } from "../data/geo";
import { SERIES, STATES } from "../data/mock";
import { useTwin } from "../store/twinStore";
import { degreesToCompass } from "../utils/windUtils";
import MapLegendIndex from "./MapLegendIndex";
import WindParticleOverlay from "./WindParticleOverlay";

const TS_IDS = ["-24h", "-12h", "NOW", "+6h", "+12h", "+24h"];

function getMetricVal(stateId, tsId, mode, simulated, tempDelta, rainDeltaPct, series) {
  const v = series?.[stateId]?.[tsId] || SERIES[stateId]?.[tsId] || { temp: 28, rain: 15, humidity: 65, wind: 14 };
  let val = mode === "temperature" ? v.temp : mode === "rainfall" ? v.rain : mode === "wind" ? v.wind : v.humidity;
  if (simulated) {
    if (mode === "temperature") val = Math.round((val + tempDelta) * 10) / 10;
    if (mode === "rainfall") val = Math.max(0, Math.round(val * (1 + rainDeltaPct / 100) * 10) / 10);
  }
  return val;
}

export default function GlobeMap({ isFullscreen = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const {
    regionId,
    setRegionId,
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

  const [err, setErr] = useState("");
  const [autoRotate, setAutoRotate] = useState(false);
  const [isGlobeMode, setIsGlobeMode] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, state: null, val: null, district: null });
  const [mapLoaded, setMapLoaded] = useState(false);

  const liveRef = useRef({ timeIndex, mapMode, simulated, tempDelta, rainDeltaPct, regionId, series });
  liveRef.current = { timeIndex, mapMode, simulated, tempDelta, rainDeltaPct, regionId, series };

  const tsId = TS_IDS[timeIndex];
  const currentState = STATES.find((s) => s.id === regionId) || STATES[0];

  // Update selection filters and district visibility
  const updateMapLayers = () => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;
    const { regionId: rid } = liveRef.current;

    try {
      if (m.getLayer("states-selected")) {
        m.setFilter("states-selected", ["==", "id", rid]);
      }
      if (m.getLayer("states-selected-line")) {
        m.setFilter("states-selected-line", ["==", "id", rid]);
      }
      if (m.getLayer("districts-beacon")) {
        m.setLayoutProperty("districts-beacon", "visibility", showDistricts ? "visible" : "none");
      }
      if (m.getLayer("districts-label")) {
        m.setLayoutProperty("districts-label", "visibility", showDistricts ? "visible" : "none");
      }
    } catch (e) {
      console.warn("Globe layer update notice:", e);
    }
  };

  // Initialize MapLibre GL with True 3D Spherical Earth Globe & Global Satellite
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let map;

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          projection: { type: "globe" },
          sources: {
            "world-satellite": {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution: "Tiles &copy; Esri World Imagery",
              maxzoom: 19,
            },
          },
          layers: [
            {
              id: "space-bg",
              type: "background",
              paint: { "background-color": "#020617" },
            },
            {
              id: "world-satellite-layer",
              type: "raster",
              source: "world-satellite",
              paint: {
                "raster-opacity": 1.0,
                "raster-contrast": 0.06,
                "raster-brightness-min": 0.02,
              },
            },
          ],
        },
        center: [78.96, 22.59],
        zoom: 3.4,
        pitch: 48,
        bearing: -4,
        antialias: true,
        maxZoom: 16,
        minZoom: 1.2,
      });
    } catch (e) {
      setErr("WebGL unavailable: " + (e?.message || e));
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      try {
        setMapLoaded(true);
        setErr("");

        // Safely activate globe projection once style is fully loaded
        try {
          if (map.setProjection) {
            map.setProjection({ type: "globe" });
          }
        } catch (projErr) {
          console.warn("Globe projection activation:", projErr);
        }

        // 1. Add India GeoJSON boundaries
        map.addSource("states", { type: "geojson", data: INDIA_GEOJSON });

        const { regionId: rid } = liveRef.current;

        // 2. Interactive invisible fill layer for hit-testing & click/hover events
        map.addLayer({
          id: "states-fill",
          type: "fill",
          source: "states",
          paint: {
            "fill-color": "#38bdf8",
            "fill-opacity": 0.001,
          },
        });

        // 3. Subtle translucent glassmorphic hover effect
        map.addLayer({
          id: "states-hover",
          type: "fill",
          source: "states",
          filter: ["==", "id", ""],
          paint: {
            "fill-color": "#38bdf8",
            "fill-opacity": 0.16,
          },
        });

        // 4. Elegant, luminous outer outline around India
        map.addLayer({
          id: "india-glow-outer",
          type: "line",
          source: "states",
          paint: {
            "line-color": "#38bdf8",
            "line-width": 1.8,
            "line-opacity": 0.8,
          },
        });

        // 5. Delicate, clean internal state borders
        map.addLayer({
          id: "states-line",
          type: "line",
          source: "states",
          paint: {
            "line-color": "rgba(255, 255, 255, 0.4)",
            "line-width": 0.8,
            "line-opacity": 0.65,
          },
        });

        // 6. Selected state subtle glass highlight & border
        map.addLayer({
          id: "states-selected",
          type: "fill",
          source: "states",
          filter: ["==", "id", rid],
          paint: {
            "fill-color": "#38bdf8",
            "fill-opacity": 0.16,
          },
        });

        map.addLayer({
          id: "states-selected-line",
          type: "line",
          source: "states",
          filter: ["==", "id", rid],
          paint: {
            "line-color": "#38bdf8",
            "line-width": 2.2,
            "line-opacity": 0.95,
          },
        });

        // 7. District Hubs & Inner District Beacons Layer
        map.addSource("districts", { type: "geojson", data: getDistrictsGeoJSON() });

        map.addLayer({
          id: "districts-beacon",
          type: "circle",
          source: "districts",
          paint: {
            "circle-radius": [
              "interpolate", ["linear"], ["zoom"],
              3, 2,
              5, 3.5,
              8, 5
            ],
            "circle-color": "#38bdf8",
            "circle-stroke-width": 1.2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "districts-label",
          type: "symbol",
          source: "districts",
          minzoom: 5.5,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 10.5,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          },
          paint: {
            "text-color": "#f8fafc",
            "text-halo-color": "#020617",
            "text-halo-width": 2,
          },
        });

        // State & District Click Handling
        map.on("click", "districts-beacon", (e) => {
          const f = e.features?.[0];
          if (f?.properties) {
            if (f.properties.stateId) setRegionId(f.properties.stateId);
            if (f.properties.id) setDistrictId(f.properties.id);
          }
        });

        map.on("click", "states-fill", (e) => {
          const f = e.features?.[0];
          if (f?.properties?.id) {
            setRegionId(f.properties.id);
          }
        });

        // Hover tooltip for states and districts
        map.on("mousemove", "states-fill", (e) => {
          const f = e.features?.[0];
          if (!f?.properties?.id) return;
          const id = f.properties.id;
          const s = STATES.find((st) => st.id === id);
          if (!s) return;

          if (map.getLayer("states-hover")) {
            map.setFilter("states-hover", ["==", "id", id]);
          }

          const { timeIndex: cTi, mapMode: cMm, simulated: cSim, tempDelta: cTd, rainDeltaPct: cRp, series: cSer } = liveRef.current;
          const val = getMetricVal(id, TS_IDS[cTi], cMm, cSim, cTd, cRp, cSer);

          setTooltip({
            visible: true,
            x: e.point.x,
            y: e.point.y,
            state: s,
            val,
            district: null,
          });
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mousemove", "districts-beacon", (e) => {
          const f = e.features?.[0];
          if (!f?.properties) return;
          setTooltip({
            visible: true,
            x: e.point.x,
            y: e.point.y,
            state: null,
            val: `${f.properties.elevation}m elev`,
            district: f.properties,
          });
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "states-fill", () => {
          if (map.getLayer("states-hover")) {
            map.setFilter("states-hover", ["==", "id", ""]);
          }
          setTooltip((prev) => ({ ...prev, visible: false }));
          map.getCanvas().style.cursor = "";
        });

        map.on("mouseleave", "districts-beacon", () => {
          setTooltip((prev) => ({ ...prev, visible: false }));
          map.getCanvas().style.cursor = "";
        });
      } catch (e) {
        console.warn("Globe map layer configuration notice:", e);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync state & mode updates
  useEffect(() => {
    updateMapLayers();
  }, [timeIndex, mapMode, simulated, tempDelta, rainDeltaPct, regionId, series, showDistricts]);

  // Smooth auto-orbit rotation
  useEffect(() => {
    if (!autoRotate) return;
    let animId;
    const rotate = () => {
      const m = mapRef.current;
      if (m) {
        m.easeTo({ bearing: m.getBearing() + 0.25, duration: 80, easing: (t) => t });
      }
      animId = requestAnimationFrame(rotate);
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Camera Fly Actions
  const flyToWholeEarth = () => {
    const m = mapRef.current;
    if (!m) return;
    m.flyTo({
      center: [78.96, 22.59],
      zoom: 1.8,
      pitch: 0,
      bearing: 0,
      duration: 2200,
    });
  };

  const flyToIndia = () => {
    const m = mapRef.current;
    if (!m) return;
    m.flyTo({
      center: [78.96, 22.59],
      zoom: 3.8,
      pitch: 52,
      bearing: -6,
      duration: 1800,
    });
  };

  const flyToSelectedState = () => {
    const m = mapRef.current;
    if (!m) return;
    m.flyTo({
      center: [currentState.lon, currentState.lat],
      zoom: 5.8,
      pitch: 56,
      bearing: -4,
      duration: 1500,
    });
  };

  const toggleProjection = () => {
    const m = mapRef.current;
    if (!m) return;
    const nextGlobe = !isGlobeMode;
    setIsGlobeMode(nextGlobe);
    try {
      if (m.isStyleLoaded && m.isStyleLoaded() && m.setProjection) {
        m.setProjection({ type: nextGlobe ? "globe" : "mercator" });
      }
    } catch (e) {
      console.warn("Projection toggle:", e);
    }
  };

  const unit = mapMode === "temperature" ? "°C" : mapMode === "rainfall" ? "mm" : mapMode === "wind" ? "km/h" : "%";

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? "h-full min-h-[75vh]" : "h-[580px] sm:h-[620px]"
      } rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-[#020617] flex flex-col justify-between select-none`}
    >
      {/* ── TOP MISSION CONTROL TOOLBAR ── */}
      <div className="z-10 p-3 bg-gradient-to-b from-[#070e1e]/95 via-[#070e1e]/80 to-transparent flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: View Title & Globe Highlight Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/90 border border-blue-600/80 text-blue-200 text-xs font-black tracking-wide shadow-md">
            <span>🌍 3D EARTH GLOBE</span>
            <span className="text-slate-400">•</span>
            <span className="text-cyan-300 font-bold">INDIA HIGHLIGHTED</span>
          </div>

          <button
            onClick={flyToWholeEarth}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            title="Zoom out to view whole 3D Earth planet floating in space"
          >
            🌐 Whole Earth
          </button>

          <button
            onClick={flyToIndia}
            className="px-2.5 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-600 border border-blue-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm"
            title="Focus camera directly on India with 3D terrain pitch"
          >
            <span>🇮🇳</span>
            <span>Focus India</span>
          </button>

          <button
            onClick={flyToSelectedState}
            className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-amber-300 font-semibold text-xs transition"
            title={`Zoom into ${currentState.name} and inner districts`}
          >
            📍 {currentState.name}
          </button>
        </div>

        {/* Right: Feature Toggles (Districts, Orbit, Projection) */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Districts & Inner States Toggle */}
          <button
            onClick={() => setShowDistricts(!showDistricts)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
              showDistricts
                ? "bg-emerald-700 text-white border border-emerald-500 shadow-sm"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700"
            }`}
            title="Toggle inner state and district beacon telemetry"
          >
            <span>🏙️</span>
            <span>Districts</span>
          </button>

          {/* Auto Orbit */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              autoRotate
                ? "bg-amber-600 text-white border border-amber-500"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title="Smoothly rotate 3D Earth globe"
          >
            {autoRotate ? "⏹ Stop Orbit" : "🔄 Auto-Orbit"}
          </button>

          {/* Globe / Flat Switch */}
          <button
            onClick={toggleProjection}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Switch between 3D spherical globe and flat projection"
          >
            {isGlobeMode ? "🌐 Sphere" : "🗺 Flat"}
          </button>
        </div>
      </div>

      {/* WebGL Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Animated Real Wind Particles Overlay Layer (Anchored to 3D Globe Projection - Strictly in Wind Mode) */}
      {mapLoaded && mapMode === "wind" && (
        <WindParticleOverlay
          active={true}
          showHud={false}
          projectFn={(lon, lat) => {
            const m = mapRef.current;
            if (!m) return null;
            if (isGlobeMode) {
              const center = m.getCenter();
              const toRad = Math.PI / 180;
              const phi1 = lat * toRad;
              const phi2 = center.lat * toRad;
              const deltaLambda = (lon - center.lng) * toRad;
              const cosDist = Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
              if (cosDist < 0.08) return null; // Behind globe horizon
            }
            const p = m.project([lon, lat]);
            return [p.x, p.y];
          }}
        />
      )}

      {/* Fallback Error message if WebGL unavailable */}
      {err && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#070c18]/90 p-4">
          <div className="max-w-md p-4 rounded-xl border border-red-700 bg-red-950/80 text-white text-xs text-center space-y-2">
            <div className="font-bold text-sm text-red-300">3D Globe Simulation Alert</div>
            <div>{err}</div>
            <div className="text-[11px] text-slate-400">
              Please ensure Hardware Acceleration is enabled in your browser.
            </div>
          </div>
        </div>
      )}

      {/* ── HOVER TELEMETRY TOOLTIP ── */}
      {tooltip.visible && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full -mt-3.5 px-3 py-2 rounded-xl bg-[#070e1c]/95 border border-cyan-700/80 text-white text-xs shadow-2xl backdrop-blur-md space-y-0.5 min-w-[140px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.district ? (
            <>
              <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                DISTRICT HUB • {tooltip.district.stateName}
              </div>
              <div className="font-extrabold text-sm text-white">{tooltip.district.name}</div>
              <div className="text-[11px] text-slate-300">
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
                {mapMode.toUpperCase()}: {tooltip.val} {unit}
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
      <div className="z-10 p-3 bg-gradient-to-t from-[#070e1e]/95 via-[#070e1e]/80 to-transparent flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Active Region & Metric Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target:</span>
            <b className="text-white font-black">{currentState.name}</b>
            <span className="text-[11px] text-slate-400 font-mono">({currentState.id})</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-[#0b1426] border border-blue-600/70 text-blue-200 font-mono font-bold">
            {mapMode.toUpperCase()}: {getMetricVal(currentState.id, tsId, mapMode, simulated, tempDelta, rainDeltaPct, series)} {unit}
          </div>

          {mapMode === "wind" && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#071328] border border-cyan-800/80 text-cyan-200 font-mono text-[11px] shadow-sm">
              <span className="text-amber-300 font-bold">
                Bearing: {degreesToCompass(series?.[currentState.id]?.[tsId]?.windDir ?? 245)} ({series?.[currentState.id]?.[tsId]?.windDir ?? 245}°)
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                Gusts: {series?.[currentState.id]?.[tsId]?.windGust ?? Math.round((series?.[currentState.id]?.[tsId]?.wind ?? 14) * 1.5 * 10) / 10} km/h
              </span>
            </div>
          )}
        </div>

        {/* Right: Variable Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#070d1a]/90 border border-slate-800 rounded-lg p-0.5">
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
