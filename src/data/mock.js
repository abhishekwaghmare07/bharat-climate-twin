// ── Central mock catalogue for Bharat Climate Digital Twin ──
// Timesteps: Past ─── Current ─── Future
export const TIMESTEPS = [
  { id: "-24h", label: "-24h", full: "−24 hours", kind: "observed" },
  { id: "-12h", label: "-12h", full: "−12 hours", kind: "observed" },
  { id: "NOW", label: "NOW", full: "Current", kind: "current" },
  { id: "+6h", label: "+6h", full: "+6 hours", kind: "predicted" },
  { id: "+12h", label: "+12h", full: "+12 hours", kind: "predicted" },
  { id: "+24h", label: "+24h", full: "+24 hours", kind: "predicted" },
];

export const NOW_INDEX = 2;

export const STATES = [
  { id: "MH", name: "Maharashtra", capital: "Mumbai", lat: 19.7515, lon: 75.7139 },
  { id: "KA", name: "Karnataka", capital: "Bengaluru", lat: 15.3173, lon: 75.7139 },
  { id: "GJ", name: "Gujarat", capital: "Gandhinagar", lat: 22.2587, lon: 71.1924 },
  { id: "RJ", name: "Rajasthan", capital: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { id: "UP", name: "Uttar Pradesh", capital: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { id: "MP", name: "Madhya Pradesh", capital: "Bhopal", lat: 22.9734, lon: 78.6569 },
  { id: "TN", name: "Tamil Nadu", capital: "Chennai", lat: 11.1271, lon: 78.6569 },
  { id: "WB", name: "West Bengal", capital: "Kolkata", lat: 22.9868, lon: 87.855 },
  { id: "PB", name: "Punjab", capital: "Chandigarh", lat: 31.1471, lon: 75.3412 },
  { id: "KL", name: "Kerala", capital: "Thiruvananthapuram", lat: 10.8505, lon: 76.2711 },
  { id: "OD", name: "Odisha", capital: "Bhubaneswar", lat: 20.9517, lon: 85.0985 },
  { id: "DL", name: "Delhi", capital: "New Delhi", lat: 28.6139, lon: 77.209 },
  { id: "AP", name: "Andhra Pradesh", capital: "Amaravati", lat: 16.541, lon: 80.515 },
  { id: "TG", name: "Telangana", capital: "Hyderabad", lat: 17.385, lon: 78.486 },
  { id: "BR", name: "Bihar", capital: "Patna", lat: 25.594, lon: 85.137 },
  { id: "AS", name: "Assam", capital: "Dispur", lat: 26.143, lon: 91.789 },
  { id: "JH", name: "Jharkhand", capital: "Ranchi", lat: 23.344, lon: 85.309 },
  { id: "CG", name: "Chhattisgarh", capital: "Raipur", lat: 21.251, lon: 81.629 },
  { id: "HR", name: "Haryana", capital: "Chandigarh", lat: 29.058, lon: 76.085 },
  { id: "HP", name: "Himachal Pradesh", capital: "Shimla", lat: 31.104, lon: 77.173 },
  { id: "UK", name: "Uttaranchal", capital: "Dehradun", lat: 30.066, lon: 79.019 },
  { id: "JK", name: "Jammu and Kashmir", capital: "Srinagar", lat: 34.083, lon: 74.797 },
  { id: "GA", name: "Goa", capital: "Panaji", lat: 15.498, lon: 73.827 },
  { id: "AR", name: "Arunachal Pradesh", capital: "Itanagar", lat: 27.084, lon: 93.605 },
  { id: "ML", name: "Meghalaya", capital: "Shillong", lat: 25.578, lon: 91.893 },
  { id: "MN", name: "Manipur", capital: "Imphal", lat: 24.817, lon: 93.936 },
  { id: "MZ", name: "Mizoram", capital: "Aizawl", lat: 23.164, lon: 92.937 },
  { id: "NL", name: "Nagaland", capital: "Kohima", lat: 25.675, lon: 94.108 },
  { id: "TR", name: "Tripura", capital: "Agartala", lat: 23.831, lon: 91.286 },
  { id: "SK", name: "Sikkim", capital: "Gangtok", lat: 27.533, lon: 88.512 },
  { id: "PY", name: "Puducherry", capital: "Puducherry", lat: 11.941, lon: 79.808 },
  { id: "CH", name: "Chandigarh", capital: "Chandigarh", lat: 30.733, lon: 76.779 },
  { id: "AN", name: "Andaman and Nicobar", capital: "Port Blair", lat: 11.667, lon: 92.735 },
  { id: "LD", name: "Lakshadweep", capital: "Kavaratti", lat: 10.566, lon: 72.641 },
  { id: "DH", name: "Dadra and Nagar Haveli", capital: "Silvassa", lat: 20.276, lon: 73.008 },
  { id: "DD", name: "Daman and Diu", capital: "Daman", lat: 20.428, lon: 72.839 },
];

// Base values per state
const BASE = {
  MH: { t: 28, r: 14, h: 68, w: 14, c: 45 },
  KA: { t: 26, r: 22, h: 74, w: 12, c: 60 },
  GJ: { t: 31, r: 8, h: 55, w: 18, c: 25 },
  RJ: { t: 33, r: 3, h: 38, w: 20, c: 12 },
  UP: { t: 30, r: 10, h: 62, w: 10, c: 35 },
  MP: { t: 29, r: 12, h: 60, w: 11, c: 38 },
  TN: { t: 31, r: 16, h: 71, w: 16, c: 50 },
  WB: { t: 30, r: 24, h: 78, w: 13, c: 65 },
  PB: { t: 29, r: 6, h: 52, w: 12, c: 20 },
  KL: { t: 27, r: 32, h: 84, w: 15, c: 75 },
  OD: { t: 30, r: 19, h: 76, w: 17, c: 58 },
  DL: { t: 32, r: 5, h: 48, w: 13, c: 22 },
  AP: { t: 32, r: 18, h: 72, w: 16, c: 48 },
  TG: { t: 31, r: 15, h: 65, w: 14, c: 42 },
  BR: { t: 30, r: 16, h: 68, w: 12, c: 45 },
  AS: { t: 27, r: 38, h: 84, w: 11, c: 75 },
  JH: { t: 28, r: 18, h: 68, w: 11, c: 44 },
  CG: { t: 29, r: 17, h: 66, w: 12, c: 40 },
  HR: { t: 31, r: 7, h: 50, w: 14, c: 22 },
  HP: { t: 18, r: 24, h: 70, w: 15, c: 55 },
  UK: { t: 19, r: 28, h: 72, w: 14, c: 58 },
  JK: { t: 16, r: 20, h: 65, w: 14, c: 50 },
  GA: { t: 29, r: 34, h: 82, w: 16, c: 60 },
  AR: { t: 20, r: 42, h: 88, w: 9, c: 80 },
  ML: { t: 21, r: 48, h: 90, w: 10, c: 85 },
  MN: { t: 24, r: 26, h: 80, w: 8, c: 65 },
  MZ: { t: 23, r: 34, h: 82, w: 9, c: 70 },
  NL: { t: 22, r: 30, h: 82, w: 9, c: 68 },
  TR: { t: 28, r: 29, h: 81, w: 10, c: 62 },
  SK: { t: 17, r: 36, h: 85, w: 10, c: 78 },
  PY: { t: 31, r: 21, h: 75, w: 16, c: 52 },
  CH: { t: 29, r: 8, h: 54, w: 12, c: 25 },
  AN: { t: 29, r: 35, h: 85, w: 22, c: 70 },
  LD: { t: 29, r: 28, h: 82, w: 20, c: 65 },
  DH: { t: 30, r: 18, h: 70, w: 15, c: 40 },
  DD: { t: 30, r: 14, h: 72, w: 18, c: 35 },
};

// Deterministic drift per timestep
const DRIFT = {
  "-24h": { t: -1.6, r: -4, h: -4, w: -2, c: -6 },
  "-12h": { t: -0.8, r: -2, h: -2, w: -1, c: -3 },
  NOW: { t: 0, r: 0, h: 0, w: 0, c: 0 },
  "+6h": { t: 0.9, r: 3.5, h: 3, w: 1.5, c: 5 },
  "+12h": { t: 1.4, r: 5, h: 5, w: 2.5, c: 8 },
  "+24h": { t: 2.1, r: 7, h: 7, w: 3, c: 11 },
};

function jitter(seed, amt) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 97;
  return ((h % 10) / 10 - 0.5) * 2 * amt;
}
function round1(n) { return Math.round(n * 10) / 10; }
function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

// SERIES[stateId][timestepId] = { temp, rain, humidity, wind, cloud }
export const SERIES = {};
for (const s of STATES) {
  SERIES[s.id] = {};
  const b = BASE[s.id] || { t: 28, r: 15, h: 65, w: 14, c: 40 };
  for (const ts of TIMESTEPS) {
    const d = DRIFT[ts.id] || { t: 0, r: 0, h: 0, w: 0, c: 0 };
    SERIES[s.id][ts.id] = {
      temp: round1(b.t + d.t + jitter(s.id, 0.3)),
      rain: Math.max(0, round1(b.r + d.r + jitter(s.id, 1.2))),
      humidity: clamp(Math.round(b.h + d.h), 10, 98),
      wind: Math.max(0, round1(b.w + d.w)),
      cloud: clamp(Math.round(b.c + d.c), 2, 98),
    };
  }
}

// 30-yr historical average
export const HISTORICAL = {};
for (const s of STATES) {
  const b = BASE[s.id] || { t: 28, r: 15, h: 65 };
  HISTORICAL[s.id] = {
    temp: round1(b.t - 1.2),
    rain: Math.max(0, round1(b.r * 0.82)),
    humidity: clamp(Math.round(b.h - 5), 10, 98),
  };
}

// Colour scales
export function tempColor(t) {
  if (t < 20) return "#38bdf8";
  if (t < 25) return "#22c55e";
  if (t < 29) return "#facc15";
  if (t < 32) return "#f97316";
  return "#ef4444";
}

export function rainColor(r) {
  if (r < 5) return "#fef3c7";
  if (r < 12) return "#7dd3fc";
  if (r < 20) return "#38bdf8";
  if (r < 28) return "#2563eb";
  return "#1e1b4b";
}

export function humidityColor(h) {
  if (h < 45) return "#fef9c3";
  if (h < 60) return "#a5f3fc";
  if (h < 75) return "#34d399";
  return "#0d9488";
}

// Destination Earth Scientific Simulation colormap (Plasma / Inferno gradient)
export function destineColormap(t) {
  const clamped = Math.max(0, Math.min(1, t));
  // 0.0: deep dark navy #0c0826
  // 0.2: rich dark purple #320a5c
  // 0.4: electric violet/magenta #7b009a
  // 0.6: radiant magenta/pink #db1379
  // 0.8: neon orange #ff6e00
  // 1.0: glowing bright yellow #fff01f
  const stops = [
    { pos: 0.0, r: 12, g: 8, b: 38 },
    { pos: 0.2, r: 50, g: 10, b: 92 },
    { pos: 0.4, r: 123, g: 0, b: 154 },
    { pos: 0.6, r: 219, g: 19, b: 121 },
    { pos: 0.8, r: 255, g: 110, b: 0 },
    { pos: 1.0, r: 255, g: 240, b: 31 },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (clamped >= s1.pos && clamped <= s2.pos) {
      const f = (clamped - s1.pos) / (s2.pos - s1.pos);
      const r = Math.round(s1.r + (s2.r - s1.r) * f);
      const g = Math.round(s1.g + (s2.g - s1.g) * f);
      const b = Math.round(s1.b + (s2.b - s1.b) * f);
      return `rgb(${r},${g},${b})`;
    }
  }
  return "rgb(255,240,31)";
}

// Apply what-if scenario
export function applyScenario(values, tempDelta, rainDeltaPct) {
  if (!values) return { temp: 28, rain: 15, humidity: 65, wind: 14, cloud: 40 };
  return {
    ...values,
    temp: round1(values.temp + tempDelta),
    rain: Math.max(0, round1(values.rain * (1 + rainDeltaPct / 100))),
  };
}
