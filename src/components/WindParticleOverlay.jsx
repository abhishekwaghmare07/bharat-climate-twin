import { useEffect, useRef } from "react";
import { STATES } from "../data/mock";
import { useTwin } from "../store/twinStore";

const TS_IDS = ["-24h", "-12h", "NOW", "+6h", "+12h", "+24h"];

// Planetary & regional circulation nodes (South-West Monsoon, Somali Jet, Trade Winds, Westerlies)
const PLANETARY_NODES = [
  { lon: 52.0, lat: 11.0, u: 32, v: 18, speed: 36 },  // Somali Jet
  { lon: 58.0, lat: 7.0, u: 28, v: 16, speed: 32 },   // Arabian Sea Gateway
  { lon: 63.0, lat: 13.0, u: 24, v: 14, speed: 28 },  // Central Arabian Sea conveyor
  { lon: 67.0, lat: 21.0, u: 19, v: 8, speed: 21 },   // Gujarat entry
  { lon: 72.0, lat: 18.0, u: 18, v: 6, speed: 19 },   // Konkan coastline surge
  { lon: 84.0, lat: 6.0, u: 20, v: 14, speed: 24 },   // Sri Lanka / Equatorial Bay of Bengal
  { lon: 86.0, lat: 12.0, u: 16, v: 22, speed: 27 },  // East Indian coastal surge
  { lon: 89.0, lat: 21.0, u: 8, v: 24, speed: 25 },   // Bengal delta surge
  { lon: 94.0, lat: 26.0, u: 9, v: 17, speed: 19 },   // Assam-Meghalaya orographic inflow
  { lon: 78.0, lat: -2.0, u: 26, v: 8, speed: 27 },   // Equatorial jet
  { lon: 88.0, lat: -6.0, u: 22, v: -10, speed: 24 }, // SE Trade winds cross-equatorial curve
  { lon: 60.0, lat: -5.0, u: 24, v: -8, speed: 25 },  // SW Indian Ocean trade conveyor
  { lon: 82.0, lat: 34.5, u: 32, v: 2, speed: 32 },   // Upper Himalayan Jet Stream
  { lon: 70.0, lat: 32.0, u: 22, v: -4, speed: 22 },  // Western Disturbance
  { lon: 85.0, lat: 25.0, u: 16, v: -5, speed: 17 },  // Gangetic trough
];

// Grid dimensions for fast bilinear interpolation
const GRID_MIN_LON = 46;
const GRID_MAX_LON = 114;
const GRID_MIN_LAT = -10;
const GRID_MAX_LAT = 42;
const GRID_STEP = 0.8;
const COLS = Math.round((GRID_MAX_LON - GRID_MIN_LON) / GRID_STEP) + 1; // 86
const ROWS = Math.round((GRID_MAX_LAT - GRID_MIN_LAT) / GRID_STEP) + 1; // 66

export default function WindParticleOverlay({
  projectFn = null, // (lon, lat) => [x, y] screen coordinates (or null if behind globe)
  bounds = { minLon: 48, maxLon: 112, minLat: -8, maxLat: 40 },
  active = true,
  opacity = 0.95,
  particleCount = 1800, // Crisp, clean field of pure white streamlines (NO blurry blobs)
  speedMultiplier = 1.15,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { series, timeIndex } = useTwin();

  const curTsId = TS_IDS[timeIndex] || "NOW";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      ctx.clearRect(0, 0, width, height);
    };
    window.addEventListener("resize", handleResize);

    // 1. Compile state vector observations from live Open-Meteo
    const landStations = STATES.map((s) => {
      const stateData = series?.[s.id]?.[curTsId] || series?.[s.id]?.["NOW"] || {};
      const spd = stateData.wind ?? 14;
      const dir = stateData.windDir ?? 245;
      const rad = (dir * Math.PI) / 180;
      const u = -spd * Math.sin(rad);
      const v = -spd * Math.cos(rad);
      return {
        lat: s.lat,
        lon: s.lon,
        speed: spd,
        u,
        v,
      };
    });

    const allBaseStations = [...landStations, ...PLANETARY_NODES];

    // 2. Precompute seamless atmospheric vector grid
    const gridU = new Float32Array(COLS * ROWS);
    const gridV = new Float32Array(COLS * ROWS);
    const gridSpeed = new Float32Array(COLS * ROWS);

    for (let r = 0; r < ROWS; r++) {
      const lat = GRID_MIN_LAT + r * GRID_STEP;
      for (let c = 0; c < COLS; c++) {
        const lon = GRID_MIN_LON + c * GRID_STEP;

        let sumW = 0, uBase = 0, vBase = 0, spdBase = 0;
        for (let k = 0; k < allBaseStations.length; k++) {
          const st = allBaseStations[k];
          const dLon = lon - st.lon;
          const dLat = lat - st.lat;
          const d2 = dLon * dLon + dLat * dLat + 1.5;
          const w = 1 / d2;
          sumW += w;
          uBase += st.u * w;
          vBase += st.v * w;
          spdBase += st.speed * w;
        }

        let uTotal = sumW > 0 ? uBase / sumW : 14;
        let vTotal = sumW > 0 ? vBase / sumW : 8;

        // Subtle cyclonic curvature in Bay of Bengal
        const dLonBob = lon - 88.5;
        const dLatBob = lat - 16.0;
        const distBob = Math.sqrt(dLonBob * dLonBob + dLatBob * dLatBob);
        if (distBob < 18) {
          const factor = Math.exp(-0.5 * (distBob / 8.0) * (distBob / 8.0));
          uTotal += -18 * (dLatBob / (distBob + 0.1)) * factor - 5 * (dLonBob / (distBob + 0.1)) * factor;
          vTotal += 18 * (dLonBob / (distBob + 0.1)) * factor - 5 * (dLatBob / (distBob + 0.1)) * factor;
        }

        const totalSpeed = Math.sqrt(uTotal * uTotal + vTotal * vTotal);
        const idx = r * COLS + c;
        gridU[idx] = uTotal;
        gridV[idx] = vTotal;
        gridSpeed[idx] = totalSpeed;
      }
    }

    // 3. Fast bilinear interpolation
    const sampleFlowField = (lon, lat) => {
      const colFrac = (lon - GRID_MIN_LON) / GRID_STEP;
      const rowFrac = (lat - GRID_MIN_LAT) / GRID_STEP;

      const c0 = Math.floor(colFrac);
      const r0 = Math.floor(rowFrac);

      if (c0 < 0 || c0 >= COLS - 1 || r0 < 0 || r0 >= ROWS - 1) {
        return null;
      }

      const fx = colFrac - c0;
      const fy = rowFrac - r0;

      const idx00 = r0 * COLS + c0;
      const idx10 = idx00 + 1;
      const idx01 = (r0 + 1) * COLS + c0;
      const idx11 = idx01 + 1;

      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      return {
        u: w00 * gridU[idx00] + w10 * gridU[idx10] + w01 * gridU[idx01] + w11 * gridU[idx11],
        v: w00 * gridV[idx00] + w10 * gridV[idx10] + w01 * gridV[idx01] + w11 * gridV[idx11],
        speed: w00 * gridSpeed[idx00] + w10 * gridSpeed[idx10] + w01 * gridSpeed[idx01] + w11 * gridSpeed[idx11],
      };
    };

    const defaultProject = (lon, lat) => {
      const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
      const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
      return [x, y];
    };

    const project = projectFn || defaultProject;

    // 4. Physical Streamline Particle Simulation (Pure Crisp White Lines - Earth Nullschool / Windy Style)
    class StreamlineParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.lon = bounds.minLon + Math.random() * (bounds.maxLon - bounds.minLon);
        this.lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
        this.prevLon = this.lon;
        this.prevLat = this.lat;

        this.age = initial ? Math.floor(Math.random() * 60) : 0;
        this.maxLife = 45 + Math.floor(Math.random() * 55);

        const flow = sampleFlowField(this.lon, this.lat);
        this.speed = flow ? flow.speed : 15;
      }

      step() {
        this.prevLon = this.lon;
        this.prevLat = this.lat;

        const flow = sampleFlowField(this.lon, this.lat);
        if (!flow) {
          this.reset();
          return;
        }

        this.speed = flow.speed;

        const cosLat = Math.max(0.18, Math.cos((this.lat * Math.PI) / 180));
        const dt = 0.0075 * speedMultiplier;
        this.lon += (flow.u * dt) / (111.32 * cosLat);
        this.lat += (flow.v * dt) / 111.13;

        this.age++;
        if (
          this.age > this.maxLife ||
          this.lon < bounds.minLon - 4 ||
          this.lon > bounds.maxLon + 4 ||
          this.lat < bounds.minLat - 3 ||
          this.lat > bounds.maxLat + 3
        ) {
          this.reset();
        }
      }

      draw() {
        if (this.age <= 1) return;

        const p0 = project(this.prevLon, this.prevLat);
        const p1 = project(this.lon, this.lat);
        if (!p0 || !p1) return;

        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        if (dx * dx + dy * dy > 1800) return;

        const alpha = Math.sin((this.age / this.maxLife) * Math.PI) * opacity;
        if (alpha <= 0.03) return;

        // Clean, crisp luminous white streamlines (Earth Nullschool / Windy style)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.90})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
    }

    const particles = Array.from({ length: particleCount }, () => new StreamlineParticle());

    // 60 FPS Continuous Streamline Flow Loop
    const render = () => {
      // Subtle 0.045 fade creates smooth, silky, continuous flowing streamlines with ZERO smudge blobs
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.step();
        p.draw();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, particleCount, speedMultiplier, opacity, bounds, projectFn, series, curTsId]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
