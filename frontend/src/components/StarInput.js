import { useState } from 'react';

export default function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={`star-btn ${n <= (hover || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
