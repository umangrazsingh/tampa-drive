// ---------------------------------------------------------------------------
// FAKE backend that lives in the browser. Used while USE_MOCK_API is true.
//
// It follows the same rules as the Express server (see server/src/models/rides.model.js).
// All names and places are sample data only.
// Data resets when you refresh the page.
// ---------------------------------------------------------------------------

const MOCK_INVITE_CODE = "BULLS";

const MEMBERS = ["Aarav", "Sita", "Prabin", "Anish", "Rohan", "Nima", "Kiran", "Asha", "Sujan", "Bibek"];

const DESTINATIONS = [
  { name: "TPA Airport", driveMinutes: 25 },
  { name: "Walmart", driveMinutes: 10 },
  { name: "Walgreens", driveMinutes: 8 },
  { name: "International Plaza", driveMinutes: 20 },
  { name: "Clearwater Beach", driveMinutes: 45 },
  { name: "AMC Movies", driveMinutes: 15 },
  { name: "Raymond James Stadium", driveMinutes: 20 },
];

const HOUR = 60 * 60 * 1000;
const now = Date.now();
const at = (hoursFromNow) => new Date(now + hoursFromNow * HOUR);

// What the DATABASE stores. Only "upcoming" or "cancelled" are ever saved.
let rides = [
  { rideNumber: 100, destination: "Walmart", driveMinutes: 10, departure: at(3), seats: 4, driver: "Prabin", riders: ["Anish", "Rohan", "Nima", "Kiran"], note: "Quick grocery run, back by 8.", status: "upcoming", cancelledAt: null },
  { rideNumber: 101, destination: "TPA Airport", driveMinutes: 25, departure: at(10), seats: 3, driver: "Aarav", riders: ["Sita"], note: "Room for 2 big suitcases.", status: "upcoming", cancelledAt: null },
  { rideNumber: 102, destination: "AMC Movies", driveMinutes: 15, departure: at(30), seats: 3, driver: "Kiran", riders: ["Sita", "Anish"], note: "", status: "upcoming", cancelledAt: null },
  { rideNumber: 103, destination: "International Plaza", driveMinutes: 20, departure: at(50), seats: 2, driver: "Bibek", riders: [], note: "Can stop at Bay Street too.", status: "upcoming", cancelledAt: null },
  { rideNumber: 104, destination: "Clearwater Beach", driveMinutes: 45, departure: at(54), seats: 4, driver: "Sujan", riders: ["Asha"], note: "Sunset, then dinner after.", status: "upcoming", cancelledAt: null },
  // past rides for History
  { rideNumber: 97, destination: "Walmart", driveMinutes: 10, departure: at(-60), seats: 4, driver: "Prabin", riders: ["Anish", "Sita", "Rohan", "Nima"], note: "", status: "upcoming", cancelledAt: null },
  { rideNumber: 98, destination: "TPA Airport", driveMinutes: 25, departure: at(-130), seats: 3, driver: "Aarav", riders: ["Kiran"], note: "", status: "cancelled", cancelledAt: at(-150) },
  { rideNumber: 99, destination: "Clearwater Beach", driveMinutes: 45, departure: at(-200), seats: 4, driver: "Sujan", riders: ["Asha", "Bibek", "Sita"], note: "", status: "upcoming", cancelledAt: null },
];
let latestRideNumber = 104;

// ---- helpers ---------------------------------------------------------------

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data, status = 200) => ({ ok: true, status, data, error: null });
const fail = (status, error) => ({ ok: false, status, data: { error }, error });

// What the API SENDS BACK: the stored ride plus calculated fields.
// FULL and COMPLETED are never stored, they're worked out here every time,
// so they can't get out of sync with the real data.
function toApiRide(ride) {
  const departure = new Date(ride.departure);
  const seatsLeft = ride.seats - ride.riders.length;
  let status = ride.status; // "upcoming" | "cancelled"
  if (status === "upcoming" && departure.getTime() < Date.now()) status = "completed";
  else if (status === "upcoming" && seatsLeft <= 0) status = "full";
  return {
    ...ride,
    riders: [...ride.riders],
    departure: departure.toISOString(),
    arrival: new Date(departure.getTime() + ride.driveMinutes * 60000).toISOString(),
    seatsLeft,
    status, // "upcoming" | "full" | "cancelled" | "completed"
    cancelledAt: ride.cancelledAt ? new Date(ride.cancelledAt).toISOString() : null,
  };
}

const findRide = (rideNumber) => rides.find((r) => r.rideNumber === Number(rideNumber));

// ---- the fake endpoints ------------------------------------------------------

export async function createSession(inviteCode) {
  await delay();
  if (String(inviteCode || "").trim().toUpperCase() !== MOCK_INVITE_CODE) {
    return fail(401, "That code didn't work. Try again.");
  }
  return ok({ members: MEMBERS });
}

export async function getDestinations() {
  await delay(100);
  return ok(DESTINATIONS);
}

export async function getRides(view) {
  await delay(150);
  const all = rides.map(toApiRide);
  if (view === "history") {
    return ok(all
      .filter((r) => r.status === "completed" || r.status === "cancelled")
      .sort((a, b) => new Date(b.departure) - new Date(a.departure)));
  }
  return ok(all
    .filter((r) => r.status === "upcoming" || r.status === "full")
    .sort((a, b) => new Date(a.departure) - new Date(b.departure)));
}

export async function postRide(body) {
  await delay();
  const { destination, departure, seats, driver, note = "" } = body || {};
  if (!destination || !departure || !seats || !driver) {
    return fail(400, "Missing required ride property");
  }
  const dest = DESTINATIONS.find((d) => d.name === destination);
  if (!dest) return fail(400, "Unknown destination");
  const when = new Date(departure);
  if (isNaN(when)) return fail(400, "Invalid departure date");
  if (when.getTime() < Date.now()) return fail(400, "Departure must be in the future");
  const seatCount = Number(seats);
  if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 6) {
    return fail(400, "Seats must be between 1 and 6");
  }
  latestRideNumber++;
  const ride = {
    rideNumber: latestRideNumber,
    destination,
    driveMinutes: dest.driveMinutes,
    departure: when,
    seats: seatCount,
    driver,
    riders: [],
    note: String(note).slice(0, 200),
    status: "upcoming",
    cancelledAt: null,
  };
  rides.push(ride);
  return ok(toApiRide(ride), 201);
}

export async function joinRide(rideNumber, name) {
  await delay();
  const ride = findRide(rideNumber);
  if (!ride) return fail(404, "Ride not found");
  const view = toApiRide(ride);
  if (view.status !== "upcoming") return fail(400, view.status === "full" ? "Ride is full" : "Ride is not open");
  if (ride.driver === name) return fail(400, "You're the driver of this ride");
  if (ride.riders.includes(name)) return fail(400, "You already joined this ride");
  ride.riders.push(name);
  return ok(toApiRide(ride));
}

export async function leaveRide(rideNumber, name) {
  await delay();
  const ride = findRide(rideNumber);
  if (!ride) return fail(404, "Ride not found");
  if (!ride.riders.includes(name)) return fail(400, "You're not on this ride");
  ride.riders = ride.riders.filter((r) => r !== name);
  return ok(toApiRide(ride));
}

export async function cancelRide(rideNumber, name) {
  await delay();
  const ride = findRide(rideNumber);
  if (!ride) return fail(404, "Ride not found");
  if (ride.driver !== name) return fail(403, "Only the driver can cancel this ride");
  if (ride.status === "cancelled") return fail(400, "Ride is already cancelled");
  ride.status = "cancelled";
  ride.cancelledAt = new Date();
  return ok(toApiRide(ride));
}
