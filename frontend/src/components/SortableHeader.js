export default function SortableHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  return (
    <th onClick={() => onSort(field)}>
      {label}
      {active && <span className="sort-arrow">{order === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}
