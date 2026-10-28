import { formatDay, formatTime, seatsText } from "../hooks/format";

import StatusBadge from "./StatusBadge";
import SeatIcons from "./SeatIcons";

const RideCard = ({ ride, onSelect }) => {
  return <article className="px-card ride-card">
    <div className="ride-card-top">
      <h3 className="pf">{ride.destination}</h3>
      <StatusBadge ride={ride} />
    </div>
    <div className="dash" />
    <div className="when vt">{formatDay(ride.departure)} · {formatTime(ride.departure)}</div>
    <div className="meta">Arrive ~{formatTime(ride.arrival)} · Driver {ride.driver}</div>
    <div className="seats">
      <SeatIcons ride={ride} />
      <span className="meta" style={{ marginLeft: 6 }}>{seatsText(ride)}</span>
    </div>
    <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => onSelect(ride.rideNumber)}>
      View ride
    </button>
  </article>;
};

export default RideCard;
