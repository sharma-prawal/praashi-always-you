import { useState, type CSSProperties } from 'react';
import { ArrowRight, Images, Sparkles } from 'lucide-react';
import type { Photo } from '../types';

const positions = [[19, 20], [72, 12], [44, 39], [83, 48], [17, 65], [65, 75], [40, 88]];
const labels = ['you & me', 'our kind of magic', 'always us', 'a little joy', 'closer', 'my favourite', 'home'];
const path = [0, 1, 2, 3, 5, 6, 4, 2, 0].map((index, i) => `${i ? 'L' : 'M'}${positions[index].join(' ')}`).join(' ');

export default function Constellation({ photos, next, seen, mark, unlocked, browsable, openPhoto, openCollection }: {
  photos: Photo[]; next: () => void; seen: number[]; mark: (index: number) => void; unlocked: boolean; browsable: boolean; openPhoto: (index: number) => void; openCollection: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return <div className="constellation-scene scene-content">
    <h1>The moments I'd<br /><em>choose again.</em></h1>
    <p className="scene-description">A little sky of us. Touch a star.</p>
    <div className="constellation-map" role="group" aria-label="Seven photo memories">
      <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={path} pathLength={1} /></svg>
      {positions.map(([x, y], i) => <button key={i} className={`memory-star ${seen.includes(i) ? 'seen' : ''}`} data-selected={selected === i ? 'true' : undefined}
        style={{ left: `${x}%`, top: `${y}%`, '--star-delay': `${i * -0.7}s` } as CSSProperties}
        aria-haspopup="dialog" aria-label={`Reveal star ${i + 1}: ${photos[i + 8].caption}`}
        onClick={event => { event.currentTarget.focus(); setSelected(i); mark(i); openPhoto(i + 8); }}>
        <span className="star-glow" /><Sparkles size={i % 3 === 0 ? 25 : 19} strokeWidth={1} /><span className="star-label">{labels[i]}</span>
      </button>)}
    </div>
    <p className="quiet-note constellation-count" role="status">{seen.length ? `${seen.length} of 7 little moments revisited` : 'Some things are written in the stars.'}</p>
    {!unlocked && <p className="gate-hint">Touch every star to go on</p>}
    <button className="primary-button" disabled={!unlocked} onClick={next}>Through every kind of day <ArrowRight size={18} /></button>
    {browsable && <button className="text-button constellation-alternative" onClick={openCollection}><Images size={14} />Browse our photos</button>}
  </div>;
}
