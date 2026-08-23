// Circular "wax seal" badge used everywhere an average rating is shown.
// This is the app's signature visual element.
export default function RatingSeal({ value, size = 'default' }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const display = hasValue ? Number(value).toFixed(1) : '—';

  return (
    <span
      className={`rating-seal ${size === 'small' ? 'small' : ''} ${!hasValue ? 'empty' : ''}`}
      title={hasValue ? `${display} average rating` : 'No ratings yet'}
    >
      {hasValue ? `${display}★` : '—'}
    </span>
  );
}
