import { useEffect, useRef } from "react";

// Read-only "how this works" panel. Opens from the highway sign on the road
// (and the link on the welcome page). Esc, the X or clicking outside closes it.
const SECTIONS = [
  {
    title: "UPCOMING",
    text: "Every car on the road is a ride a friend is offering. Hover a car to see where it's headed, click it to see the time, seats and who's already in. Hit Join to grab a seat, or Leave if your plans change.",
  },
  {
    title: "POST A RIDE",
    text: "Driving somewhere anyway? Pick the place, the time and how many seats you have. Your car shows up on the road and friends can join.",
  },
  {
    title: "HISTORY",
    text: "Rides that already happened or got cancelled end up here, so you can look back at who went where.",
  },
];

const TIPS = [
  "Blinking headlights = leaving within 12 hours.",
  "Faded car with a FULL sign = no seats left.",
  "Only the driver can cancel their ride.",
];

const HowItWorks = ({ onClose }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div className="help-overlay" onClick={onClose}>
    <section className="px-hl help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title"
      onClick={(e) => e.stopPropagation()}>
      <div className="help-top">
        <h2 id="help-title" className="page-title pf">HOW TAMPA DRIVE WORKS</h2>
        <button ref={closeRef} className="btn btn-ghost help-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <p className="help-intro">
        This board is for our friends only. The invite code keeps it that way. Here you can find
        rides to join, go places together, and offer a ride when you're driving somewhere.
      </p>

      {SECTIONS.map((s) => <div key={s.title} className="px-note help-section">
        <h3 className="pf">{s.title}</h3>
        <p>{s.text}</p>
      </div>)}

      <div className="help-tips">
        <h3 className="pf">ROAD SIGNS</h3>
        <ul>{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>
  </div>;
};

export default HowItWorks;
