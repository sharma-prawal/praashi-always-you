import { useLayoutEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { ArrowLeft, ArrowRight, Heart, MailOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { bridgeLines, featuredLetters, letterDate, letters, type CapsuleState } from '../lib/letters';
import { usePageZoom } from '../lib/usePageZoom';

export default function LetterCapsule({ state, setState, explore, original, next }: {
  state: CapsuleState; setState: Dispatch<SetStateAction<CapsuleState>>;
  explore: () => void; original: (index: number) => void; next: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const excerpt = useRef<HTMLElement>(null);
  const focusExcerpt = useRef(false);
  const savedScroll = useRef(0);
  const dragged = useRef(false);
  const zoomed = usePageZoom();
  const index = featuredLetters[state.featured];
  const letter = letters[index];
  const opened = state.opened.includes(index);
  useLayoutEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [state.bridge]);
  useLayoutEffect(() => {
    if (focusExcerpt.current && opened) {
      excerpt.current?.focus({ preventScroll: true });
      focusExcerpt.current = false;
    }
  }, [opened, index]);
  function move(step: number) {
    setState(value => ({ ...value, featured: (value.featured + step + featuredLetters.length) % featuredLetters.length }));
  }
  function bridge(show: boolean) {
    if (show) savedScroll.current = window.scrollY;
    setState(value => ({ ...value, bridge: show }));
    window.scrollTo({ top: show ? 0 : savedScroll.current, behavior: 'instant' });
  }
  if (state.bridge) return <div className="capsule-bridge scene-content">
    <span className="bridge-thread" aria-hidden="true"><Heart size={20} strokeWidth={1} /></span>
    <h1 ref={heading} tabIndex={-1}>{bridgeLines[0]}</h1>
    <div className="bridge-words">{bridgeLines.slice(1).map((line, i) => <p key={line} className={i === 2 ? 'bridge-always' : ''}>{line}</p>)}</div>
    <button className="primary-button" onClick={next}>Open my promise <ArrowRight size={18} /></button>
    <button className="text-button" onClick={() => bridge(false)}><ArrowLeft size={14} />Back to the letters</button>
  </div>;
  return <div className="capsule-scene scene-content">
    <h1 ref={heading} tabIndex={-1}>Where It<br /><em>All Began</em></h1>
    <p className="capsule-subtitle">It started with a good morning.</p>
    <motion.div className="capsule-stage" role="region" aria-roledescription="carousel" aria-label="Three letters from 2021"
      drag={!opened && !zoomed ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
      onDragStart={() => { dragged.current = true; }} onDragEnd={(_, info) => {
        if (!zoomed && (window.visualViewport?.scale || 1) <= 1.02 && (Math.abs(info.offset.x) > 42 || Math.abs(info.velocity.x) > 350)) move((info.offset.x || info.velocity.x) < 0 ? 1 : -1);
        setTimeout(() => { dragged.current = false; }, 0);
      }} onClickCapture={event => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <div className="capsule-light" aria-hidden="true" />
      <div className="capsule-motes" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div>
      {opened ? <article ref={excerpt} tabIndex={-1} className="capsule-paper" key={letter.date} aria-label={`Excerpt from ${letterDate(letter.date)}`}>
        <span className="capsule-fold" aria-hidden="true" />
        <time dateTime={letter.date}>{letterDate(letter.date)}</time>
        {letter.greeting && <p className="capsule-greeting">{letter.greeting}</p>}
        <blockquote>{letter.excerpt}</blockquote>
        <p className="capsule-fragment">A little piece of my heart, from 2021.</p>
        <button className="text-button" onClick={event => { event.currentTarget.focus(); original(index); }}>View original <ArrowRight size={14} /></button>
      </article> : <button key={letter.date} className="time-envelope" aria-label={`Open letter from ${letterDate(letter.date)}`} onClick={() => { focusExcerpt.current = true; setState(value => ({ ...value, opened: [...value.opened, index] })); }}>
        <span className="time-envelope-letter" aria-hidden="true">{letter.excerpt}</span>
        <span className="time-envelope-flap" aria-hidden="true" />
        <span className="time-envelope-front" aria-hidden="true"><span className="time-address">For my Nikki,</span><time dateTime={letter.date}>{letterDate(letter.date)}</time><span className="time-seal"><Heart size={18} strokeWidth={1} /></span></span>
        <span className="envelope-open-label"><MailOpen size={14} />Tap to unfold</span>
      </button>}
    </motion.div>
    <div className="capsule-controls">
      <button className="icon-button" aria-label="Previous featured letter" onClick={() => move(-1)}><ArrowLeft size={18} /></button>
      <span aria-live="polite">{state.featured + 1} / {featuredLetters.length} <span>little beginnings</span></span>
      <button className="icon-button" aria-label="Next featured letter" onClick={() => move(1)}><ArrowRight size={18} /></button>
    </div>
    <button className="text-button capsule-explore" onClick={event => { event.currentTarget.focus(); explore(); }}><MailOpen size={15} />Explore all 10 letters <ArrowRight size={14} /></button>
    <p className="capsule-note">Fragments of my messages to you, saved from 2021.</p>
    <button className="primary-button" onClick={() => bridge(true)}>From then to always <ArrowRight size={18} /></button>
  </div>;
}
