import { formatDay, formatTime, seatsText } from "../hooks/format";

import StatusBadge from "./StatusBadge";
import SeatIcons from "./SeatIcons";

// The yellow panel that opens when you click a car or "View ride".
// Which buttons show depends on who you are on this ride.
const RideDetails = ({ ride, name, isPending, onJoin, onLeave, onCancel, onClose }) => {
  const isDriver = ride.driver === name;
  const isRider = ride.riders.includes(name);
  const isFull = ride.status === "full";

  return <section className="px-hl details" aria-label={`Ride to ${ride.destination}`}>
    <div className="details-info">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <h2 className="pf">{ride.destination}</h2>
        <StatusBadge ride={ride} />
      </div>
      <div className="details-when vt">
        {formatDay(ride.departure)} · DEPART {formatTime(ride.departure)} → ARRIVE ~{formatTime(ride.arrival)}
      </div>
      <div className="meta" style={{ fontSize: 16 }}>
        About {ride.driveMinutes} min drive · Driver: <strong style={{ color: "var(--text)" }}>{ride.driver}</strong>
      </div>
      {ride.note && <div className="px-note note">“{ride.note}”</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="pf">SEATS · {seatsText(ride)}</div>
        <SeatIcons ride={ride} size={3} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {ride.riders.map((rider) => <span key={rider} className="badge b-name">{rider}</span>)}
          {ride.riders.length === 0 && <span className="small">Nobody has joined yet.</span>}
        </div>
      </div>
    </div>

    <div className="details-actions">
      {isDriver && <>
        <div className="small">You're driving this one.</div>
        <button className="btn btn-danger" disabled={isPending} onClick={() => onCancel(ride.rideNumber)}>
          Cancel ride
        </button>
        <div className="small">Cancelled rides move to History. Nothing gets deleted.</div>
      </>}
      {!isDriver && isRider &&
        <button className="btn btn-ghost" disabled={isPending} onClick={() => onLeave(ride.rideNumber)}>
          Leave ride
        </button>}
      {!isDriver && !isRider && !isFull &&
        <button className="btn btn-primary btn-lg" disabled={isPending} onClick={() => onJoin(ride.rideNumber)}>
          JOIN RIDE
        </button>}
      {!isDriver && !isRider && isFull &&
        <button className="btn btn-off" disabled style={{ fontSize: 20 }}>RIDE IS FULL</button>}
      <button className="btn btn-flat" onClick={onClose}>Close</button>
    </div>
  </section>;
};

export default RideDetails;
