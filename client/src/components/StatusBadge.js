import { statusOf } from "../hooks/format";

const StatusBadge = ({ ride }) => {
  const { label, badge } = statusOf(ride);
  return <span className={`badge ${badge}`}>{label}</span>;
};

export default StatusBadge;
