import { useState } from "react";

import Road from "../components/Road";
import RideCard from "../components/RideCard";
import RideDetails from "../components/RideDetails";
import Message from "../components/Message";
import Centered from "../components/Centered";

const Upcoming = props => {
  const { name, rides, isPending, message, clearMessage, joinRide, leaveRide, cancelRide } = props;
  const [selectedNumber, setSelectedNumber] = useState(null);

  // If the selected ride was cancelled it's no longer in the list, so this
  // becomes undefined and the panel closes by itself.
  const selected = rides.find((ride) => ride.rideNumber === selectedNumber);

  const select = (rideNumber) => {
    clearMessage();
    setSelectedNumber(rideNumber);
  };

  return <>
    <Road rides={rides} onSelect={select} />

    <Centered className="page">
      <Message message={message} onClose={clearMessage} />

      {selected && <RideDetails
        ride={selected}
        name={name}
        isPending={isPending}
        onJoin={joinRide}
        onLeave={leaveRide}
        onCancel={cancelRide}
        onClose={() => setSelectedNumber(null)} />}

      <section aria-labelledby="departures-title" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 id="departures-title" className="section-title pf">DEPARTURES</h2>
        {rides.length === 0
          ? <div className="px-card empty">No rides yet. Be the first to post one!</div>
          : <div className="cards">
              {rides.map((ride) => <RideCard key={ride.rideNumber} ride={ride} onSelect={select} />)}
            </div>}
      </section>
    </Centered>
  </>;
};

export default Upcoming;
