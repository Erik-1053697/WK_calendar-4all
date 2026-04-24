import { statusLabel } from '../../lib/domain';

export default function StatusBadge({ status, children }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span />
      {children || statusLabel(status)}
    </span>
  );
}
