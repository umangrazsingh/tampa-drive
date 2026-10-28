import { useCallback, useEffect, useState } from "react";

import {
  httpGetRides,
  httpPostRide,
  httpJoinRide,
  httpLeaveRide,
  httpCancelRide,
} from "./requests";

// Loads the rides, exposes the actions, and reloads after every change so the screen always matches the server.
function useRides(name, enabled) {
  const [upcoming, saveUpcoming] = useState([]);
  const [history, saveHistory] = useState([]);
  const [isPending, setPending] = useState(false);
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }

  const getRides = useCallback(async () => {
    const [up, past] = await Promise.all([
      httpGetRides("upcoming"),
      httpGetRides("history"),
    ]);
    if (up.ok) saveUpcoming(up.data);
    if (past.ok) saveHistory(past.data);
    if (!up.ok) setMessage({ type: "error", text: up.error });
  }, []);

  useEffect(() => {
    if (enabled) getRides();
  }, [enabled, getRides]);

  // Runs any action, shows its result, then reloads the lists
  const run = useCallback(async (action, successText) => {
    setPending(true);
    setMessage(null);
    const response = await action();
    setPending(false);
    if (response.ok) {
      setMessage({ type: "success", text: successText });
      await getRides();
    } else {
      setMessage({ type: "error", text: response.error });
    }
    return response.ok;
  }, [getRides]);

  const postRide = useCallback((form) => run(
    () => httpPostRide({ ...form, driver: name }),
    "Ride posted! Your car is on the road now.",
  ), [run, name]);

  const joinRide = useCallback((rideNumber) => run(
    () => httpJoinRide(rideNumber, name),
    "You're in! Seat saved.",
  ), [run, name]);

  const leaveRide = useCallback((rideNumber) => run(
    () => httpLeaveRide(rideNumber, name),
    "You left the ride.",
  ), [run, name]);

  const cancelRide = useCallback((rideNumber) => run(
    () => httpCancelRide(rideNumber, name),
    "Ride cancelled. It's in History now.",
  ), [run, name]);

  const clearMessage = useCallback(() => setMessage(null), []);

  return {
    upcoming,
    history,
    isPending,
    message,
    clearMessage,
    postRide,
    joinRide,
    leaveRide,
    cancelRide,
  };
}

export default useRides;
