import { useState } from "react";

import { MAX_CARS_ON_ROAD, ROAD_SLOTS, CAR_COLORS } from "../settings";
import { formatDay, formatTime, statusOf } from "../hooks/format";

import SunsetSky, { Stars } from "./SunsetSky";
import PixelCar, { CAR_MODELS } from "./PixelCar";
import HowItWorks from "./HowItWorks";

// ---- scenery pieces (purely decorative) ------------------------------------

// Everything is laid out from the horizon line (y position of the curb, in px)
const HORIZON = 348;

// [width, color, height, gap above] - the gaps at the bottom make the stripes
const SUN_ROWS = [
  [40, "#fff3a8", 6, 0], [72, "#ffe27a", 6, 0], [96, "#ffd25a", 6, 0], [116, "#ffc14f", 6, 0],
  [132, "#ffb24f", 6, 0], [144, "#ffa34f", 6, 0], [152, "#ff944f", 6, 4], [156, "#ff854f", 6, 4],
  [160, "#ff764f", 4, 6], [160, "#ff684f", 4, 6],
];

const Sun = () => <div className="sun" aria-hidden="true">
  {SUN_ROWS.map(([width, color, height, gap]) =>
    <div key={color} style={{ width, height, background: color, marginTop: gap }} />)}
</div>;

// [flex width, height, windows] - "o" = lit window, "x" = dark window, "r" = blinking red light
const BUILDINGS = [[3, 16, ""], [2, 32, "oo"], [1, 24, ""], [2, 44, "oxo"], [7, 0, ""], [2, 28, ""], [1, 48, "r"], [3, 20, ""], [2, 36, "xo"]];

const Skyline = () => <div className="skyline" aria-hidden="true">
  {BUILDINGS.map(([flex, height, windows], i) =>
    <div key={i} style={{ flex, height, background: height ? undefined : "transparent" }}>
      {windows.split("").map((w, j) => <div key={j}
        className={w === "r" ? "window blink" : w === "x" ? "window window-off" : "window"}
        style={w === "r" ? { background: "#ff4f6b" } : undefined} />)}
    </div>)}
</div>;

// Tampa palm: curved trunk + drooping fronds, drawn on a 26x40 grid.
// size = how many screen pixels per grid pixel (2 = small, 4 = tall).
const PALM = "#100822";
const PALM_RING = "#1f1338";
const COCONUT = "#2a1a48";
const PALM_PIXELS = [
  // trunk (leans right as it goes up)
  [11, 30, 2, 10], [12, 22, 2, 8], [13, 16, 2, 6], [14, 11, 2, 5],
  // crown
  [11, 5, 8, 5],
  // fronds: top, upper-left, upper-right
  [13, 1, 3, 1], [12, 2, 6, 1], [10, 3, 4, 1], [8, 4, 6, 1], [6, 5, 4, 1], [5, 6, 3, 1],
  [16, 3, 5, 1], [17, 4, 6, 1], [21, 5, 4, 1], [23, 6, 3, 1],
  // long drooping left + right
  [4, 7, 11, 1], [2, 8, 6, 1], [1, 9, 4, 1], [0, 10, 2, 1],
  [15, 7, 8, 1], [21, 8, 4, 1], [23, 9, 2, 1], [24, 10, 1, 1],
  // thicker frond bases
  [6, 8, 6, 1], [16, 8, 5, 1], [9, 6, 3, 1], [18, 6, 3, 1],
  // lower hanging fronds
  [9, 9, 4, 1], [7, 10, 4, 1], [6, 11, 3, 1], [5, 12, 2, 1],
  [17, 9, 4, 1], [19, 10, 4, 1], [21, 11, 3, 1], [22, 12, 2, 1],
];
const RINGS = [[11, 32], [11, 35], [11, 38], [12, 24], [12, 27], [13, 18], [14, 13]];

const Palm = ({ left, size }) => <svg aria-hidden="true" viewBox="0 0 26 40"
  width={26 * size} height={40 * size}
  style={{ position: "absolute", left, top: HORIZON - 40 * size }}>
  {PALM_PIXELS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={PALM} />)}
  {RINGS.map(([x, y], i) => <rect key={`r${i}`} x={x} y={y} width="1" height="1" fill={PALM_RING} />)}
  <rect x="13" y="10" width="1" height="1" fill={COCONUT} />
  <rect x="15" y="10" width="1" height="1" fill={COCONUT} />
  <rect x="14" y="11" width="1" height="1" fill={COCONUT} />
</svg>;

const StreetLight = ({ left }) => <svg aria-hidden="true" viewBox="0 0 10 25" width="40" height="100"
  style={{ position: "absolute", left, top: HORIZON - 100 }}>
  <rect x="2" y="2" width="1" height="23" fill="#2a1a48" />
  <rect x="2" y="1" width="6" height="1" fill="#2a1a48" />
  <rect x="6" y="2" width="3" height="1" fill="#ffe27a" />
  <rect x="5" y="3" width="5" height="1" fill="#ffe27a" opacity="0.35" />
</svg>;

const Billboard = () => <div className="billboard" aria-hidden="true">
  <div className="billboard-lamps">
    {["twinkle", "", "twinkle2"].map((cls, i) => <div key={i}>
      <div style={{ width: 16, height: 4, background: "#2a1a48" }} />
      <div className={cls} style={{ width: 8, height: 4, background: "#ffe27a" }} />
      <div style={{ width: 16, height: 4, background: "#ffe27a", opacity: 0.35 }} />
    </div>)}
  </div>
  <div className="billboard-board pf">GO BULLS!</div>
  <div className="billboard-posts"><div /><div /></div>
</div>;

// Neon sign. Glows brighter when you hover it and opens the "how it works" panel.
const InfoSign = ({ onClick }) => <button className="info-sign" onClick={onClick}
  aria-label="New here? Open how Tampa Drive works">
  <span className="info-sign-lamp" aria-hidden="true" />
  <span className="info-sign-board pf">
    <span className="info-sign-small">NEW HERE?</span>
    <span>CLICK ME</span>
  </span>
  <span className="info-sign-posts" aria-hidden="true"><span /><span /></span>
</button>;

// ---- the road ----------------------------------------------------------------

const Road = ({ rides, onSelect }) => {
  const cars = rides.slice(0, MAX_CARS_ON_ROAD);
  const [showHelp, setShowHelp] = useState(false);

  return <section className="scene scene-road" aria-label="Upcoming rides on the road">
    <SunsetSky heights={[110, 52, 40, 30, 24, 20, 24]} />
    <Stars />
    <Sun />
    <Skyline />
    <Billboard />
    <InfoSign onClick={() => setShowHelp(true)} />
    <StreetLight left="39%" />
    <StreetLight left="80%" />
    <Palm left="1%" size={4} />
    <Palm left="28%" size={3} />
    <Palm left="58%" size={2} />
    <Palm left="88%" size={4} />

    <div className="curb-top" style={{ top: HORIZON }} />
    <div className="curb" style={{ top: HORIZON + 4 }} />
    <div className="curb-shadow" style={{ top: HORIZON + 12 }} />
    <div className="lane-line" style={{ top: HORIZON + 68 }} />

    {cars.map((ride, i) => {
      const status = statusOf(ride);
      const isFull = ride.status === "full";
      const colors = CAR_COLORS[ride.rideNumber % CAR_COLORS.length];
      return <button key={ride.rideNumber}
        className={isFull ? "car car-full" : "car"}
        style={ROAD_SLOTS[i]}
        onClick={() => onSelect(ride.rideNumber)}
        aria-label={`Ride to ${ride.destination}, ${formatDay(ride.departure)} at ${formatTime(ride.departure)}, ${status.label}`}>
        <span className="car-tag pf">Heading to {ride.destination}</span>
        <PixelCar colors={colors} model={CAR_MODELS[ride.rideNumber % CAR_MODELS.length]} blink={status.label === "LEAVING SOON"} />
        {isFull && <span className="badge b-full car-full-sign">FULL</span>}
      </button>;
    })}

    <p className="scene-hint vt">Hover a car to see where it's headed · Click to open the ride</p>
    {showHelp && <HowItWorks onClose={() => setShowHelp(false)} />}
  </section>;
};

export default Road;
