import { formatDay, formatTime } from "../hooks/format";

import Centered from "../components/Centered";
import StatusBadge from "../components/StatusBadge";

const History = ({ rides }) => {
  return <Centered className="page page-narrow">
    <h1 className="page-title pf">HISTORY</h1>
    <p className="lead">Completed and cancelled rides stay here so everyone can see what happened.</p>

    {rides.length === 0
      ? <div className="px-card empty">No past rides yet.</div>
      : <div className="history-list">
          {rides.map((ride) => <article key={ride.rideNumber} className="px-card history-item">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2 className="pf">{ride.destination}</h2>
              <div className="vt" style={{ fontSize: 24, lineHeight: "24px", color: "var(--yellow)" }}>
                {formatDay(ride.departure)} · {formatTime(ride.departure)}
              </div>
              <div className="meta">
                Driver {ride.driver} · {ride.status === "cancelled"
                  ? `Cancelled ${formatDay(ride.cancelledAt)} by driver`
                  : `${ride.riders.length} rider${ride.riders.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <StatusBadge ride={ride} />
          </article>)}
        </div>}
  </Centered>;
};

export default History;
