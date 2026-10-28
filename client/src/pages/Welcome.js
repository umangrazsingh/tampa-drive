import { useState } from "react";

import SunsetSky, { Stars } from "../components/SunsetSky";
import PixelCar from "../components/PixelCar";
import Message from "../components/Message";
import HowItWorks from "../components/HowItWorks";
import { USE_MOCK_API } from "../settings";

const DRIVE_COLORS = { body: "#ff9e4f", light: "#ffc58f", dark: "#c8662a" };

// Step 1: invite code. Step 2: pick your name. Then the app remembers you.
const Welcome = ({ member }) => {
  const [code, setCode] = useState("");
  const [picked, setPicked] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const submitCode = (e) => {
    e.preventDefault();
    member.submitCode(code);
  };

  return <section className="scene scene-welcome" aria-label="Welcome">
    <SunsetSky heights={[140, 90, 80, 70, 60, 50, 50]} />
    <Stars />
    <div className="curb-top" style={{ bottom: 136 }} />
    <div className="curb" style={{ bottom: 128 }} />
    <div className="lane-line" style={{ bottom: 60 }} />
    <div className="drive" style={{ bottom: 72 }} aria-hidden="true">
      <PixelCar colors={DRIVE_COLORS} />
    </div>

    <div className="px-hl welcome-card">
      <h1 className="page-title pf">WELCOME, RIDER</h1>
      <p style={{ margin: 0, color: "#e3dafa" }}>
        Tampa Drive is a private ride board for our friend group. Enter the invite code from the group chat to get in.
      </p>
      <button type="button" className="welcome-help vt" onClick={() => setShowHelp(true)}>
        New here? See how it works &#9654;
      </button>

      {!member.hasCode && <form onSubmit={submitCode} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label htmlFor="invite-code" className="pf">INVITE CODE</label>
        <div className="code-row">
          <input id="invite-code" type="text" autoComplete="off" className="px-inset code-input vt"
            placeholder="Code from the group chat"
            value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ fontSize: 20, minHeight: 52 }}
            disabled={member.isPending || !code.trim()}>
            {member.isPending ? "..." : "ENTER"}
          </button>
        </div>
        <Message message={member.error ? { type: "error", text: member.error } : null} />
        {USE_MOCK_API && <div className="small">
          Demo mode code: <span className="vt" style={{ fontSize: 20, color: "var(--yellow)" }}>BULLS</span>
        </div>}
      </form>}

      {member.hasCode && <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div><span className="badge b-done">CODE ACCEPTED</span></div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <legend className="pf" style={{ fontSize: 24, marginBottom: 10 }}>Who are you?</legend>
          <div className="chip-row">
            {member.members.map((n) => <button type="button" key={n}
              className={n === picked ? "btn chip-on" : "btn chip-off"}
              aria-pressed={n === picked}
              onClick={() => setPicked(n)}>
              {n}
            </button>)}
          </div>
        </fieldset>
        {picked
          ? <button className="btn btn-primary btn-lg" style={{ alignSelf: "flex-start" }}
              onClick={() => member.pickName(picked)}>LET'S RIDE</button>
          : <button className="btn btn-off" style={{ alignSelf: "flex-start", fontSize: 20, minHeight: 52 }}
              disabled>PICK YOUR NAME</button>}
        <div className="small">Not on the list? Ask the group admin to add you. The site remembers you on this device after this.</div>
      </div>}
    </div>
    {showHelp && <HowItWorks onClose={() => setShowHelp(false)} />}
  </section>;
};

export default Welcome;
