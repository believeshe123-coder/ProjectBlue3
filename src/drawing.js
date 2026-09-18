export const GRID_SIZE = 28;

export const UNIT_OPTIONS = [
  {label: '1 foot', short: "1′", feet: 1},
  {label: '6 inches', short: '6″', feet: 0.5},
  {label: '1 inch', short: '1″', feet: 1 / 12},
];

export function snap(value, grid = GRID_SIZE) {
  return Math.round(value / grid) * grid;
}

export function lineLength(line, feetPerSquare) {
  return Math.hypot(line.x2 - line.x1, line.y2 - line.y1) / GRID_SIZE * feetPerSquare;
}

export function formatLength(feet) {
  const totalInches = Math.round(feet * 12);
  const wholeFeet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  if (!wholeFeet) return `${inches}″`;
  return inches ? `${wholeFeet}′ ${inches}″` : `${wholeFeet}′`;
}
