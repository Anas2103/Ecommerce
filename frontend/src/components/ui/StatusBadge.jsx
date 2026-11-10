const STYLES = {
  pending:  'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
  paid:     'badge-green',
}

/** Coloured pill for review / return / document statuses. */
export default function StatusBadge({ status, label }) {
  return <span className={`badge ${STYLES[status] || 'badge-gray'}`}>{label || status}</span>
}
