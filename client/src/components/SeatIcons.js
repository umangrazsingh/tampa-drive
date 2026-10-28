// One tiny pixel person per seat: orange = taken, purple = open.
const Person = ({ taken, size }) => {
  const fill = taken ? "#ff9e4f" : "#4a3a72";
  return <svg width={size * 7} height={size * 8} viewBox="0 0 7 8" aria-hidden="true">
    <rect x="2" y="0" width="3" height="3" fill={fill} />
    <rect x="1" y="4" width="5" height="4" fill={fill} />
    <rect x="0" y="5" width="1" height="2" fill={fill} />
    <rect x="6" y="5" width="1" height="2" fill={fill} />
  </svg>;
};

const SeatIcons = ({ ride, size = 2 }) => {
  const taken = ride.seats - ride.seatsLeft;
  return <span style={{ display: "inline-flex", gap: size * 3 }}>
    {Array.from({ length: ride.seats }, (_, i) => <Person key={i} taken={i < taken} size={size} />)}
  </span>;
};

export default SeatIcons;
