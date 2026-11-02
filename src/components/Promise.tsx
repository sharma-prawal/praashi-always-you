import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import content from '../data/content.json';
import Artwork from './Artwork';

export default function Promise({ revealed, reveal, finish }: { revealed: boolean; reveal: () => void; finish: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointer = useRef<number | null>(null);
  const letterHeading = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; pointer.current = null; setHolding(false); };
  const cancelPointer = (event: PointerEvent<HTMLButtonElement>) => { if (event.pointerId === pointer.current) cancel(); };
  useLayoutEffect(() => {
    if (revealed) { window.scrollTo({ top: 0, behavior: 'instant' }); letterHeading.current?.focus({ preventScroll: true }); }
  }, [revealed]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const cancelHold = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; pointer.current = null; setHolding(false); };
    const cancelHidden = () => { if (document.hidden) cancelHold(); };
    document.addEventListener('visibilitychange', cancelHidden);
    window.addEventListener('blur', cancelHold);
    return () => { document.removeEventListener('visibilitychange', cancelHidden); window.removeEventListener('blur', cancelHold); };
  }, []);
  if (revealed) return <div className="letter-scene"><p className="letter-intro">My heart, in a few words.</p><motion.article className="letter-paper" style={{ borderImageSource: `url("${import.meta.env.BASE_URL}assets/paper-texture.svg")` }} aria-label="My promise to Nikki" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0.12 : 0.3, ease: [0.23, 1, 0.32, 1] }}>
    <span className="paper-fold" aria-hidden="true" /><div className="letter-ornament" aria-hidden="true"><span /><Heart size={16} /><span /></div>
    <h1 ref={letterHeading} tabIndex={-1}>{content.letter.title}</h1>
    {content.letter.paragraphs.map((paragraph, i) => <p key={paragraph} className={i === 8 ? 'letter-promise' : [3, 10].includes(i) ? 'letter-emphasis' : ''}>{[3, 6, 10].includes(i) ? <strong>{paragraph}</strong> : paragraph}</p>)}
    <p className="signature">{content.letter.signoff[0]}<br /><span>{content.letter.signoff[1]}</span></p>
    <div className="paper-footer" aria-hidden="true">P + N <span>·</span> ALWAYS</div>
  </motion.article><button className="primary-button" onClick={finish}>Every tomorrow <ArrowRight size={18} /></button><p className="quiet-note">This promise is always here for you.</p></div>;
  return <div className="promise-scene scene-content"><h1>My promise<br /><em>to you.</em></h1><p className="scene-description">There's something I need you to know.</p><div className={`hold-heart ${holding ? 'is-holding' : ''}`}>
    <svg className="hold-fill" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <clipPath id="hold-fill-shape"><path d="M200 280 C148 230 106 186 106 138 C106 98 136 72 170 72 C190 72 200 85 200 85 C200 85 210 72 230 72 C264 72 294 98 294 138 C294 186 252 230 200 280 Z" /></clipPath>
        <linearGradient id="hold-fill-colour" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#c9607f" /><stop offset="45%" stopColor="#ee9db6" /><stop offset="74%" stopColor="#f7cad7" /><stop offset="100%" stopColor="#f7cad7" stopOpacity="0" /></linearGradient>
      </defs>
      <g clipPath="url(#hold-fill-shape)"><rect className="hold-fill-level" x="100" y="-6" width="200" height="290" fill="url(#hold-fill-colour)" /></g>
    </svg>
    <Artwork name="glowing-heart" className="promise-heart-art" />
    <button className="heart-button" aria-label="Hold for two seconds to open my promise" aria-describedby="hold-help" aria-pressed={holding} onClick={event => { if (event.detail === 0) reveal(); }} onPointerDown={e => {
      if (pointer.current !== null || e.button !== 0) return;
      pointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); setHolding(true);
      timer.current = setTimeout(() => { timer.current = null; pointer.current = null; setHolding(false); reveal(); }, 2000);
    }} onPointerUp={cancelPointer} onPointerCancel={cancelPointer} onLostPointerCapture={cancelPointer} onBlur={cancel} onContextMenu={event => event.preventDefault()}>
      <Heart aria-hidden="true" size={44} strokeWidth={0.7} fill="currentColor" />
    </button>
  </div><p id="hold-help" className="hold-help" role="status" aria-live="polite">{holding ? 'A little closer…' : 'Hold my heart for a moment.'}</p><button className="text-button" onClick={reveal}>Or tap to read my promise <ArrowRight size={15} /></button><p className="promise-bottom">Written for you. Meant for always.</p></div>;
}
