import { SEDAN, SUV, JEEP, PICKUP, FIXED_COLORS } from "./vehicleSprites";

// Draws a pixel-art vehicle from the sprites in vehicleSprites.js.
// model: "sedan", "suv", "jeep" or "pickup". colors: { body, light, dark } from settings.js.
const SPRITES = { sedan: SEDAN, suv: SUV, jeep: JEEP, pickup: PICKUP };

// Darkens a hex color (used for the lowest shade of the paint)
function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

// Turns each row of letters into as few <rect>s as possible
// (one rect per run of the same color)
function spriteToRects(rows, palette) {
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== ".") {
        rects.push({ key: `${x}-${y}`, x, y, width: end - x, fill: palette[ch], shadow: ch === "s" });
      }
      x = end;
    }
  });
  return rects;
}

const PixelCar = ({ colors, model = "sedan", blink = false, scale = 4 }) => {
  const rows = SPRITES[model] || SEDAN;
  const width = rows[0].length;
  const height = rows.length;
  const palette = {
    ...FIXED_COLORS,
    H: colors.light,
    B: colors.body,
    D: colors.dark,
    S: darken(colors.dark, 0.35),
  };

  // headlight row = first row that has an "L" in it
  const lightRow = rows.findIndex((row) => row.includes("L"));
  const lightX = rows[lightRow].lastIndexOf("L") + 1;

  return <svg width={(width + 3) * scale} height={height * scale} viewBox={`0 0 ${width + 3} ${height}`} aria-hidden="true">
    {spriteToRects(rows, palette).map((r) =>
      <rect key={r.key} x={r.x} y={r.y} width={r.width} height="1" fill={r.fill} opacity={r.shadow ? 0.45 : 1} />)}
    {/* headlight glow (blinks when the ride is leaving soon) */}
    <rect x={lightX + 1} y={lightRow} width="2" height="1" fill="#ffe27a" opacity="0.5" className={blink ? "blink" : undefined} />
    <rect x={lightX + 1} y={lightRow + 1} width="1" height="1" fill="#ffe27a" opacity="0.25" className={blink ? "blink" : undefined} />
  </svg>;
};

export const CAR_MODELS = Object.keys(SPRITES);
export default PixelCar;
