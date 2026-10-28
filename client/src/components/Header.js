import { NavLink, Link } from "react-router-dom";

import Centered from "./Centered";
import PixelCar from "./PixelCar";

const LOGO_COLORS = { body: "#ff9e4f", light: "#ffc58f", dark: "#c8662a" };

const Header = ({ name, isSignedIn, onSwitchUser }) => {
  return <header className="header">
    <Centered className="header-inner">
      <Link to="/" className="brand" aria-label="Tampa Drive home">
        <PixelCar colors={LOGO_COLORS} scale={2} />
        <span className="brand-name pf">TAMPA DRIVE</span>
      </Link>

      {isSignedIn && <nav className="nav" aria-label="Main">
        <NavLink exact to="/" className="btn tab-off" activeClassName="tab-on">Upcoming</NavLink>
        <NavLink to="/post" className="btn tab-off" activeClassName="tab-on">Post a Ride</NavLink>
        <NavLink to="/history" className="btn tab-off" activeClassName="tab-on">History</NavLink>
      </nav>}

      {isSignedIn
        ? <button className="btn btn-flat vt" style={{ fontFamily: "VT323, monospace", fontSize: 22 }}
            onClick={onSwitchUser} aria-label={`Signed in as ${name}. Switch user`}>
            <svg width="16" height="16" viewBox="0 0 4 4" aria-hidden="true">
              <rect x="1" y="0" width="2" height="4" fill="#7dff9a" />
              <rect x="0" y="1" width="4" height="2" fill="#7dff9a" />
            </svg>
            {name} · switch
          </button>
        : <span className="vt" style={{ fontSize: 22, color: "var(--muted)" }}>Private · friends only</span>}
    </Centered>
  </header>;
};

export default Header;
