// Wind and meteorological utility helpers

export function degreesToCompass(deg) {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return directions[idx];
}

export function windSpeedToColor(speed) {
  if (speed < 8) return "#38bdf8";      // Ice Blue (Gentle)
  if (speed < 16) return "#2dd4bf";     // Electric Teal (Moderate)
  if (speed < 26) return "#a3e635";     // Spring Lime (Fresh)
  if (speed < 38) return "#facc15";     // Golden Amber (Strong)
  return "#f97316";                     // Fiery Orange (Gale)
}
