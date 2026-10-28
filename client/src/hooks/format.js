// Small display helpers for dates, times and ride statuses.
import { LEAVING_SOON_HOURS } from "../settings";

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// "Today", "Tomorrow" or "Fri, Nov 14"
function formatDay(iso) {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// "6:30 AM"
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// The label + badge class shown on cards. "LEAVING SOON" is display-only,
// the server never stores it.
function statusOf(ride) {
  if (ride.status === "cancelled") return { label: "CANCELLED", badge: "b-cancelled" };
  if (ride.status === "completed") return { label: "COMPLETED", badge: "b-done" };
  if (ride.status === "full") return { label: "FULL", badge: "b-full" };
  const hoursAway = (new Date(ride.departure) - Date.now()) / 3600000;
  if (hoursAway <= LEAVING_SOON_HOURS) return { label: "LEAVING SOON", badge: "b-soon" };
  return { label: "UPCOMING", badge: "b-up" };
}

function seatsText(ride) {
  if (ride.seatsLeft <= 0) return "No seats left";
  return `${ride.seatsLeft} of ${ride.seats} seats left`;
}

// "18:30" + 25 minutes -> "6:55 PM" (used for the arrival preview on Post a Ride)
function addMinutesToTime(hhmm, minutes) {
  const [h, m] = String(hhmm || "18:00").split(":").map(Number);
  const date = new Date();
  date.setHours(h || 0, (m || 0) + (minutes || 0), 0, 0);
  return formatTime(date.toISOString());
}

export {
  formatDay,
  formatTime,
  statusOf,
  seatsText,
  addMinutesToTime,
};
