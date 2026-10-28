// ---------------------------------------------------------------------------
// App settings
// ---------------------------------------------------------------------------

// true  = use fake data from hooks/mockApi.js (works with NO backend running)
// false = talk to the Express server at API_URL
const USE_MOCK_API = false;

// The Express server runs on port 8000.
// After `npm run deploy` the server itself serves this site, so the API is on
// the same address and no URL is needed ("").
const API_URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

// A ride shows "LEAVING SOON" when it departs within this many hours
const LEAVING_SOON_HOURS = 12;

// How many cars fit on the road scene (the rest show only as cards)
const MAX_CARS_ON_ROAD = 5;

// Where each car sits on the road (left = across the screen, bottom = which lane)
const ROAD_SLOTS = [
  { left: "3%", bottom: "58px" },
  { left: "20%", bottom: "4px" },
  { left: "38%", bottom: "58px" },
  { left: "56%", bottom: "4px" },
  { left: "74%", bottom: "58px" },
];

// Car paint jobs: body, light (highlight), dark (shade)
const CAR_COLORS = [
  { body: "#ff9e4f", light: "#ffc58f", dark: "#c8662a" },
  { body: "#4fe3ff", light: "#a8f3ff", dark: "#1f8fb0" },
  { body: "#7dff9a", light: "#c2ffcf", dark: "#3aa856" },
  { body: "#b28dff", light: "#d8c6ff", dark: "#7a52d1" },
  { body: "#ff5fa2", light: "#ffa3c8", dark: "#c23376" },
];

export {
  USE_MOCK_API,
  API_URL,
  LEAVING_SOON_HOURS,
  MAX_CARS_ON_ROAD,
  ROAD_SLOTS,
  CAR_COLORS,
};
