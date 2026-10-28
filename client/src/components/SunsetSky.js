// The dithered sunset background. Between every two color bands it draws two
// 4px checkerboard rows, the classic pixel-art way to blend colors.
const BANDS = ["#170c33", "#2a1350", "#4a1c6b", "#7a2479", "#b33a6e", "#e2585e", "#f78a4f"];

const checker = (a, b) => ({
  height: 4,
  background: `repeating-linear-gradient(90deg, ${a} 0 4px, ${b} 4px 8px)`,
});

// heights = how tall each band is, top to bottom (px)
const SunsetSky = ({ heights = [60, 32, 28, 22, 18, 14, 16] }) => {
  return <div className="sky" aria-hidden="true">
    {BANDS.map((color, i) => {
      const next = BANDS[i + 1];
      return <div key={color} style={{ display: "contents" }}>
        <div style={{ height: heights[i], background: color }} />
        {next && <div style={checker(color, next)} />}
        {next && <div style={checker(next, color)} />}
      </div>;
    })}
    <div className="sky-fill" />
  </div>;
};

const STARS = [
  { top: 20, left: "7%", cls: "twinkle" },
  { top: 44, left: "15%", cls: "star-dim" },
  { top: 34, left: "38%", cls: "star-dim" },
  { top: 58, left: "63%", cls: "" },
  { top: 46, left: "84%", cls: "star-dim" },
  { top: 24, left: "93%", cls: "twinkle2" },
  { top: 70, left: "52%", cls: "star-dim" },
  { top: 130, left: "11%", cls: "star-dim" },
  { top: 150, left: "33%", cls: "twinkle" },
  { top: 118, left: "46%", cls: "star-dim" },
  { top: 170, left: "58%", cls: "star-dim" },
  { top: 140, left: "68%", cls: "twinkle2" },
  { top: 190, left: "79%", cls: "star-dim" },
  { top: 110, left: "90%", cls: "" },
  { top: 205, left: "22%", cls: "star-dim" },
];

// Plus-shaped twinkling stars are two thin bars on top of each other
const BIG_STARS = [
  { top: 8, left: "27%", cls: "twinkle2" },
  { top: 14, left: "71%", cls: "twinkle" },
];

// Pixel crescent moon: [x, y, width] rows on a 12x12 grid, scaled 4x
const MOON_ROWS = [[4, 0, 5], [2, 1, 6], [1, 2, 5], [0, 3, 4], [0, 4, 4], [0, 5, 4], [0, 6, 4], [0, 7, 4], [1, 8, 5], [2, 9, 6], [4, 10, 5]];

const Moon = () => <svg viewBox="0 0 12 12" width="48" height="48" style={{ position: "absolute", top: 44, right: "14%" }}>
  {MOON_ROWS.map(([x, y, w]) => <rect key={y} x={x} y={y} width={w} height="1" fill="#f6f0d8" />)}
  <rect x="1" y="4" width="1" height="3" fill="#d8cfa8" />
</svg>;

const Stars = () => <div aria-hidden="true">
  <Moon />
  {STARS.map((s) => <div key={s.left} className={`star ${s.cls}`} style={{ top: s.top, left: s.left }} />)}
  {BIG_STARS.map((s) => <div key={s.left}>
    <div className={`star star-h ${s.cls}`} style={{ top: s.top + 4, left: s.left }} />
    <div className={`star star-v ${s.cls}`} style={{ top: s.top, left: `calc(${s.left} + 4px)` }} />
  </div>)}
</div>;

export { Stars };
export default SunsetSky;
