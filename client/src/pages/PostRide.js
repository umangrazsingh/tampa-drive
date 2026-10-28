import { useState } from "react";
import { useHistory } from "react-router-dom";

import { addMinutesToTime } from "../hooks/format";

import Centered from "../components/Centered";
import Message from "../components/Message";

// Today's date as "YYYY-MM-DD" in local time, for the date input
function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const PostRide = props => {
  const { destinations, isPending, message, clearMessage, postRide } = props;
  const history = useHistory();

  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState("18:30");
  const [seats, setSeats] = useState("3");
  const [note, setNote] = useState("");

  const picked = destinations.find((d) => d.name === destination);
  const summary = picked
    ? `${picked.name.toUpperCase()} · DEPART ${addMinutesToTime(time, 0)} → ARRIVE ~${addMinutesToTime(time, picked.driveMinutes)} (${picked.driveMinutes} MIN)`
    : "PICK A DESTINATION ABOVE";

  const submit = async (e) => {
    e.preventDefault();
    const posted = await postRide({
      destination,
      departure: new Date(`${date}T${time}`).toISOString(),
      seats: Number(seats),
      note: note.trim(),
    });
    if (posted) history.push("/"); // go see your car on the road
  };

  return <Centered className="page page-narrow">
    <h1 className="page-title pf">POST A RIDE</h1>
    <Message message={message?.type === "error" ? message : null} onClose={clearMessage} />

    <form className="px-card form" onSubmit={submit}>
      <fieldset>
        <legend className="pf">Where to?</legend>
        <div className="chip-row">
          {destinations.map((d) => <button type="button" key={d.name}
            className={d.name === destination ? "btn chip-on" : "btn chip-off"}
            aria-pressed={d.name === destination}
            onClick={() => setDestination(d.name)}>
            {d.name}
          </button>)}
        </div>
      </fieldset>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="ride-date" className="pf">Date</label>
          <input id="ride-date" type="date" className="px-inset" min={todayString()}
            value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="ride-time" className="pf">Departure time</label>
          <input id="ride-time" type="time" className="px-inset"
            value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="ride-seats" className="pf">Seats</label>
          <select id="ride-seats" className="px-inset" value={seats} onChange={(e) => setSeats(e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="px-inset summary vt" aria-live="polite">{summary}</div>

      <div className="field">
        <label htmlFor="ride-note" className="pf">Note (optional)</label>
        <textarea id="ride-note" rows="3" maxLength={200} className="px-inset"
          placeholder="e.g. Can stop at Walgreens on the way"
          value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {destination
        ? <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start" }} disabled={isPending}>
            {isPending ? "POSTING..." : "POST RIDE"}
          </button>
        : <button type="button" className="btn btn-off" style={{ alignSelf: "flex-start", fontSize: 20 }} disabled>
            PICK A DESTINATION
          </button>}
    </form>
  </Centered>;
};

export default PostRide;
