# 🇮🇳 Bharat Climate Digital Twin — India Weather 3D & Planetary Globe

A next-generation **High-Resolution Climate Digital Twin** for the Indian subcontinent, featuring realistic satellite terrain, real-time numerical weather prediction telemetry, aerodynamic wind streamlines, interactive 3D Earth globe visualization, and what-if climate perturbation experiments.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)
[![Open--Meteo](https://img.shields.io/badge/API-Open--Meteo%20NWP-0284c7.svg)](https://open-meteo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Key Features

### 1. 🛰️ 3D Digital Twin — Realistic Satellite India
- **Photorealistic Satellite Basemap**: High-resolution true-color satellite imagery covering all 36 Indian States and Union Territories.
- **State & District Boundary Precision**: Clean SVG path projection for all Indian administrative boundaries.
- **District Hub Drilldown**: Sub-state telemetry across 70+ major districts with elevation profiles, micro-climates, and weather beacons.
- **Thematic Heatmaps**: Dynamic color-coded overlays for **Temperature (°C)**, **Precipitation (mm)**, and **Relative Humidity (%)**.

### 2. 💨 Realistic Aerodynamic Wind Flow Engine
- **Continuous Streamlines**: High-fidelity streamline particle physics simulating natural atmospheric wind flow without blur or foggy artifacts.
- **Synoptic Planetary Nodes**: Integrates live Open-Meteo wind vectors with major regional atmospheric currents:
  - Somali Jet & Arabian Sea gateway conveyor
  - South-West Monsoon surge
  - Bay of Bengal cyclonic curvature
  - Upper Himalayan Jet Stream & Western Disturbances
- **Dedicated Mode Activation**: Streamlines render exclusively in **Wind Flow** mode for a clear, unobstructed satellite view in other modes.

### 3. 🌍 3D Earth Globe (Photorealistic Satellite)
- **Authentic ArcGIS World Imagery**: True-color global Earth texture with natural oceanic depth and atmospheric glow.
- **Highlighted Subcontinent**: India boundary highlighted with a luminous cyan perimeter and subtle state demarcations.
- **Interactive Orbit**: Smooth drag-to-rotate, pinch/wheel zoom, and reset-to-India camera focus.

### 4. 📊 Color Scale Index & Map Legend
- Built-in collapsible color scale legend explaining exact ranges and unit metrics:
  - 🌡 **Temperature Scale**: Cool (< 20°C) to Extreme (> 32°C)
  - 🌧 **Precipitation Scale**: Trace (0–5 mm) to Torrential (> 28 mm)
  - 💧 **Relative Humidity Scale**: Arid (< 45%) to Saturated (> 75%)
  - 💨 **Wind Velocity Scale**: Gentle (< 12 km/h) to Gale/Storm (> 42 km/h)

### 5. 🔬 What-If Numerical Perturbation Modeling
- Real-time sensitivity experiments:
  - **Temperature Perturbation**: Adjust ambient delta from `-5°C` to `+5°C`.
  - **Rainfall Sensitivity**: Adjust precipitation flux from `-50%` to `+50%`.
- Live comparison between Baseline and Scenario predictions.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Engine**: [Open-Meteo NWP](https://open-meteo.com/) (ECMWF, GFS, ICON ensembles)
- **Map Visualizations**: Custom Canvas 2D Particle Engine, SVG Subdivisions, ArcGIS World Imagery

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/abhishekwaghmare07/bharat-climate-twin.git

# Navigate to project directory
cd bharat-climate-twin

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
```

The optimized static assets will be generated in the `dist/` directory.

---

## 🧭 Project Architecture

```
bharat-climate-twin/
├── public/
│   ├── india_satellite.jpg     # High-res satellite basemap of India
│   ├── india_states_real.json   # GeoJSON / path boundaries
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── RealisticTwinMap.jsx    # 3D Digital Twin with satellite layer & districts
│   │   ├── GlobeMap.jsx            # 3D ArcGIS Earth Globe with highlighted India
│   │   ├── HeatmapView.jsx         # 2D Flat heat distribution view
│   │   ├── WindParticleOverlay.jsx # Aerodynamic streamline canvas physics
│   │   ├── MapLegendIndex.jsx      # Color scale index legend
│   │   ├── TelemetryPanel.jsx      # State & district telemetry readouts
│   │   ├── ScenarioSimulator.jsx   # What-if perturbation controls
│   │   └── Header.jsx              # Mission control header & NWP sync
│   ├── data/
│   │   ├── mock.js                 # Baseline data, color ramps, timesteps
│   │   ├── districts.js            # District coordinates & elevation data
│   │   └── india_svg_paths.json    # Exact SVG paths for Indian states
│   ├── store/
│   │   └── twinStore.jsx           # Global state management (Zustand/Context)
│   ├── App.jsx                     # Root application container
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 📜 License

MIT License. Developed for advanced climate visualization and planetary digital twins.
