// ---------------------------------------------------------------------------
// All HTTP calls to the backend live here.
//
// While USE_MOCK_API is true in settings.js, every function uses the fake
// in-memory API in mockApi.js instead, so the site works without a server.
//
// Every function returns the same shape:  { ok, status, data, error }
// ---------------------------------------------------------------------------
import { API_URL, USE_MOCK_API } from "../settings";
import * as mock from "./mockApi";

const MEMBER_KEY = "tampaDrive.member";

// The invite code is saved in localStorage after the Welcome page.
// Every request (except /session) sends it in the x-invite-code header.
function getInviteCode() {
  try {
    const saved = JSON.parse(localStorage.getItem(MEMBER_KEY));
    return saved?.inviteCode || "";
  } catch (err) {
    return "";
  }
}

async function request(path, { method = "get", body } = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-invite-code": getInviteCode(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : (data?.error || "Something went wrong"),
    };
  } catch (err) {
    // fetch itself failed: server not running, no internet, etc.
    return { ok: false, status: 0, data: null, error: "Can't reach the server" };
  }
}

// POST /session  { inviteCode }  ->  { members: ["Aarav", ...] }
async function httpCreateSession(inviteCode) {
  if (USE_MOCK_API) return mock.createSession(inviteCode);
  return request("/session", { method: "post", body: { inviteCode } });
}

// GET /destinations  ->  [{ name, driveMinutes }]
async function httpGetDestinations() {
  if (USE_MOCK_API) return mock.getDestinations();
  return request("/destinations");
}

// GET /rides?view=upcoming | history  ->  [ride]
async function httpGetRides(view) {
  if (USE_MOCK_API) return mock.getRides(view);
  return request(`/rides?view=${view}`);
}

// POST /rides  { destination, departure, seats, driver, note }  ->  ride
async function httpPostRide(ride) {
  if (USE_MOCK_API) return mock.postRide(ride);
  return request("/rides", { method: "post", body: ride });
}

// POST /rides/:rideNumber/join  { name }  ->  ride
async function httpJoinRide(rideNumber, name) {
  if (USE_MOCK_API) return mock.joinRide(rideNumber, name);
  return request(`/rides/${rideNumber}/join`, { method: "post", body: { name } });
}

// POST /rides/:rideNumber/leave  { name }  ->  ride
async function httpLeaveRide(rideNumber, name) {
  if (USE_MOCK_API) return mock.leaveRide(rideNumber, name);
  return request(`/rides/${rideNumber}/leave`, { method: "post", body: { name } });
}

// DELETE /rides/:rideNumber  { name }  ->  ride (status: "cancelled")
async function httpCancelRide(rideNumber, name) {
  if (USE_MOCK_API) return mock.cancelRide(rideNumber, name);
  return request(`/rides/${rideNumber}`, { method: "delete", body: { name } });
}

export {
  MEMBER_KEY,
  httpCreateSession,
  httpGetDestinations,
  httpGetRides,
  httpPostRide,
  httpJoinRide,
  httpLeaveRide,
  httpCancelRide,
};
