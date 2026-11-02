import type { CSSProperties } from 'react';
export default function Stars() {
  return <div className="stars" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} className={i % 7 === 0 ? 'star cross-star' : 'star'} style={{ left: `${(i * 37 + 13) % 100}%`, top: `${(i * 23 + 7) % 100}%`, '--delay': `${i % 8}s`, '--size': `${i % 3 === 0 ? 3 : 2}px` } as CSSProperties} />)}</div>;
}
