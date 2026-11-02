import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, BookHeart, Check, ChevronLeft, ChevronRight, CloudRain, Heart, Images, Moon, RotateCcw, Sparkles, Sun, Volume2, VolumeX } from 'lucide-react';
import photoData from './data/photos.json';
import content from './data/content.json';
import type { Photo as PhotoData } from './types';
import Photo from './components/Photo';
import Stars from './components/Stars';
import Artwork from './components/Artwork';
import SceneSurface from './components/SceneSurface';
import Constellation from './components/Constellation';
import PromiseScene from './components/Promise';
import PhotoGallery from './components/PhotoGallery';
import LetterCapsule from './components/LetterCapsule';
import LettersArchive, { type ArchiveEntry, type ArchiveMemory } from './components/LettersArchive';
import type { CapsuleState } from './lib/letters';
import { Ambient } from './lib/ambient';
import { readProgress, saveProgress } from './lib/storage';
import { useVisibleViewport } from './lib/useVisibleViewport';

const photos: PhotoData[] = photoData;
const finalClauses = content.finalPromise.split(/ (?=through )/);
function Continue({ children = 'Continue our story', onClick }: { children?: React.ReactNode; onClick: () => void }) {
  return <button className="primary-button" onClick={onClick}>{children}<ArrowRight size={18} /></button>;
}
function Opening({ next, resume, saved }: { next: () => void; resume: () => void; saved: number }) {
  return <div className="opening scene-content">
    <p className="dedication">For my favourite person.</p>
    <h1>Nikki, I made<br />you <em>something.</em></h1>
    <div className="keepsake" aria-hidden="true">
      <div className="keepsake-orbit" /><div className="keepsake-orbit orbit-two" />
      <span className="keepsake-spark spark-one"><Sparkles size={20} strokeWidth={1} /></span><span className="keepsake-spark spark-two"><Sparkles size={24} strokeWidth={1} /></span>
      <div className="envelope-back" />
      <div className="opening-photo"><Photo photo={photos[0]} eager small /><span>my favourite kind of forever</span></div>
      <div className="envelope-front"><span className="envelope-address">To my Nikki,</span><span className="envelope-sign">with all my heart</span><span className="wax-seal"><Heart size={21} strokeWidth={1} /></span></div>
    </div>
    <p className="opening-subtitle">A little world made just for Nikki.<br />A love that feels like coming home.</p>
    <Continue onClick={next}>Open our little world</Continue>
    {saved > 0 ? <button className="text-button resume-button" onClick={resume}>Welcome back. Pick up where we left off <ArrowRight size={14} /></button> : <p className="quiet-note"><Heart size={11} /> From Pawi. For you. Always.</p>}
  </div>;
}
function Memories({ next }: { next: () => void }) {
  const [selection, setSelection] = useState({ index: 0, version: 0 });
  const index = selection.index;
  const reduce = useReducedMotion();
  const move = (step: number) => setSelection(current => ({ index: (current.index + step + 8) % 8, version: current.version + 1 }));
  return <div className="memories scene-content"><h1>All the<br /><em>little things.</em></h1><p className="scene-description">It's you who makes them everything.</p>
    <div className="memory-stack" role="region" aria-roledescription="carousel" aria-label="Eight little moments" tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
      <div className="memory-back back-one" aria-hidden="true"><Photo photo={photos[(index + 1) % 8]} small /></div><div className="memory-back back-two" aria-hidden="true"><Photo photo={photos[(index + 2) % 8]} small /></div>
      <AnimatePresence mode="wait" initial={false}><motion.figure key={selection.version} className="memory-frame" initial={{ opacity: 0, transform: reduce ? 'none' : 'translateX(24px) rotate(3deg)' }} animate={{ opacity: 1, transform: 'translateX(0px) rotate(-2deg)' }} exit={{ opacity: 0, transform: reduce ? 'none' : 'translateX(-75%) rotate(-8deg)', transition: { duration: reduce ? 0.1 : 0.24, ease: [0.23, 1, 0.32, 1], opacity: { delay: reduce ? 0 : 0.12, duration: 0.1 } } }} transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 35 || Math.abs(info.velocity.x) > 250) move((info.offset.x || info.velocity.x) < 0 ? 1 : -1); }}>
        <Photo photo={photos[index]} eager /><figcaption>{content.moments[index]}</figcaption>
      </motion.figure></AnimatePresence>
    </div>
    <div className="memory-controls"><button className="icon-button" aria-label="Previous memory" onClick={() => move(-1)}><ChevronLeft size={19} /></button><div className="memory-dots" aria-label={`Memory ${index + 1} of 8`}>{Array.from({ length: 8 }, (_, i) => <span key={i} className={i === index ? 'current' : ''} aria-hidden="true"><i /></span>)}</div><button className="icon-button" aria-label="Next memory" onClick={() => move(1)}><ChevronRight size={19} /></button></div>
    <p className="gesture-note">Swipe a little. Stay a while.</p><Continue onClick={next}>A sky full of us</Continue>
  </div>;
}
function Weather({ next }: { next: () => void }) {
  const [weather, setWeather] = useState(15);
  const [line, setLine] = useState(0);
  return <div className="weather-scene scene-content" style={{ '--weather': weather / 100 } as CSSProperties}><h1>Through<br /><em>it all.</em></h1><div className="weather-window"><div className="weather-warm"><Artwork name="weather-sunlight" className="weather-art weather-sunlight-art" /></div><div className="weather-cool"><Moon className="moon" size={40} strokeWidth={0.8} /><Artwork name="weather-rain" className="weather-art weather-rain-art" /><div className="rain" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 17) % 100}%`, animationDelay: `${(i % 5) * -0.4}s` }} />)}</div></div><div className="weather-landscape" /><div className="weather-couple"><Photo photo={photos[16]} eager /></div><span className="weather-inscription">you are my constant</span></div>
    <div className="weather-slider"><Sun size={19} aria-hidden="true" /><label className="sr-only" htmlFor="weather">Move between sunshine and rain</label><input id="weather" type="range" min="0" max="100" value={weather} onChange={e => { const value = Number(e.target.value); setWeather(value); setLine(value < 34 ? 0 : value < 67 ? 1 : 2); }} /><CloudRain size={19} aria-hidden="true" /></div><p className="gesture-note">Slide between sunshine and rain.</p>
    <div className="weather-words" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.p key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>{content.weather[line]}</motion.p></AnimatePresence><button className="text-button weather-next" onClick={() => { const nextLine = (line + 1) % 3; setLine(nextLine); setWeather([15, 50, 90][nextLine]); }} aria-label="Read the next thought">{line + 1} <span>/ 3</span><ArrowRight size={14} /></button></div>
    <p className="weather-promise">On every kind of day,<br /><em>I'll choose you.</em></p><Continue onClick={next}>Where it all began</Continue>
  </div>;
}
function Finale({ replay, promise, gallery }: { replay: () => void; promise: () => void; gallery: () => void }) {
  const [burst, setBurst] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  return <div className="finale scene-content"><p className="finale-intro">In every tomorrow...</p><h1><span className="ending-choice">I'll choose you.</span><br /><em>Always.</em></h1><div className="finale-constellation"><div className="finale-orbit" aria-hidden="true" />{[0, 1, 5, 14, 16, 19].map((photo, i) => <div className={`finale-photo finale-photo-${i}`} key={i} style={{ '--gather-delay': `${i * 55}ms` } as CSSProperties}><Photo photo={photos[photo]} small /></div>)}<button className="final-heart" aria-label="Send a little love into our sky" onClick={() => { setBurst(b => b + 1); if (timeout.current) clearTimeout(timeout.current); timeout.current = setTimeout(() => setBurst(0), 1400); }}><Artwork name="glowing-heart" className="final-heart-art" /><Heart size={36} strokeWidth={0.7} fill="currentColor" /></button>{burst > 0 && <div className="love-burst" key={burst} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--x': `${Math.cos(i * Math.PI / 6) * (i % 2 ? 110 : 80)}px`, '--y': `${Math.sin(i * Math.PI / 6) * 110}px` } as CSSProperties}>{i % 4 === 0 ? <Heart size={10} fill="currentColor" /> : <i />}</span>)}</div>}</div><p className="forever-line">Forever <span>#PrAashi</span> <Heart size={14} /></p><p className="finale-description final-promise">{finalClauses.map((line, index) => <Fragment key={line}>{index > 0 ? ' ' : null}<span>{line}</span></Fragment>)}</p><Continue onClick={promise}>Read my promise</Continue><div className="finale-actions"><button className="text-button" onClick={replay}><RotateCcw size={15} />Experience again</button><button className="text-button" onClick={e => { e.currentTarget.focus(); gallery(); }}><Images size={16} />Our photos</button></div><p className="quiet-note">Made with all my love, Pawi.</p></div>;
}

export default function App() {
  useVisibleViewport();
  const [saved] = useState(readProgress);
  const [scene, setScene] = useState(0);
  const [resumeScene, setResumeScene] = useState(saved.scene);
  const [revealed, setRevealed] = useState(false);
  const [letterRead, setLetterRead] = useState(saved.letterRead);
  const [sound, setSound] = useState(false);
  const [soundPreference, setSoundPreference] = useState(saved.soundPreference);
  const [audioError, setAudioError] = useState('');
  const [gallery, setGallery] = useState<{ initial: number | null } | null>(null);
  const [opening, setOpening] = useState(false);
  const [capsule, setCapsule] = useState<CapsuleState>(saved.capsule);
  const archiveMemory = useRef<ArchiveMemory>({ collectionScroll: 0 });
  const readArchiveMemory = useCallback(() => archiveMemory.current, []);
  const rememberArchive = useCallback((value: ArchiveMemory) => { archiveMemory.current = value; }, []);
  const [archive, setArchive] = useState<ArchiveEntry | null>(null);
  const closeArchive = useCallback(() => setArchive(null), []);
  const ambient = useRef<Ambient | null>(null);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioIntent = useRef(false);
  const audioRequest = useRef(0);
  const [audioPending, setAudioPending] = useState(false);
  const reduce = useReducedMotion();
  const closeGallery = useCallback(() => setGallery(null), []);
  const invalidateAudio = useCallback(() => { audioIntent.current = false; audioRequest.current++; }, []);
  const go = useCallback((to: number) => {
    setScene(to);
    if (to > 0) setResumeScene(to);
    if (to !== 1) {
      if (openingTimer.current) clearTimeout(openingTimer.current);
      setOpening(false);
    }
  }, []);
  const reveal = useCallback(() => { setRevealed(true); setLetterRead(true); }, []);
  const promise = () => {
    if (scene === 5 && revealed) window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
    reveal(); go(5);
  };
  useEffect(() => { saveProgress({ scene: resumeScene, letterRead, soundPreference, capsule }); }, [resumeScene, letterRead, soundPreference, capsule]);
  useEffect(() => {
    const hidden = () => { document.documentElement.dataset.paused = String(document.hidden); if (document.hidden) { invalidateAudio(); void ambient.current?.pause(false); setSound(false); setAudioPending(false); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { document.removeEventListener('visibilitychange', hidden); delete document.documentElement.dataset.paused; invalidateAudio(); if (openingTimer.current) clearTimeout(openingTimer.current); void ambient.current?.dispose(); };
  }, [invalidateAudio]);
  useEffect(() => { document.title = scene === 0 ? '#PrAashi — Always You' : `${content.chapters[scene]} · #PrAashi`; }, [scene]);
  async function toggleAudio() {
    const request = ++audioRequest.current;
    const enable = !audioIntent.current;
    audioIntent.current = enable;
    setAudioPending(true); setAudioError('');
    try {
      if (enable) {
        ambient.current ||= new Ambient();
        await ambient.current.start();
        if (!audioIntent.current || document.hidden) { await ambient.current.pause(false); return; }
      } else await ambient.current?.pause();
      if (request === audioRequest.current) { setSound(enable); setSoundPreference(enable); }
    } catch {
      if (request === audioRequest.current) { audioIntent.current = false; setAudioError('Sound could not start. You can try again.'); setSound(false); }
    } finally { if (request === audioRequest.current) setAudioPending(false); }
  }
  const openWorld = () => {
    if (openingTimer.current) clearTimeout(openingTimer.current);
    if (!reduce) { setOpening(true); openingTimer.current = setTimeout(() => setOpening(false), 1100); }
    go(1);
  };
  const replay = () => { setCapsule({ featured: 0, opened: [], bridge: false }); archiveMemory.current = { collectionScroll: 0 }; setRevealed(false); setResumeScene(0); go(0); };
  const resume = () => { if (resumeScene === 5 && letterRead) setRevealed(true); go(resumeScene); };
  return <MotionConfig reducedMotion="user"><div className="world"><div className="desktop-aside aside-left" aria-hidden="true"><span>PAWI + NIKKI</span><i /><p>a little world.<br />an endless love.</p></div><div className="experience-shell" data-scene={scene} data-reading={scene === 5 && revealed ? 'true' : undefined}><Artwork name="starfield" className="celestial-backdrop" /><Stars /><header className="app-header"><button className="brand" aria-label="Return to our little world" onClick={() => go(0)}><Artwork name="praashi-monogram" className="brand-monogram" /><span className="brand-wordmark">#PrAashi<small>ALWAYS YOU</small></span></button><div className="header-actions"><button className="icon-button" aria-label="Open our photos" onClick={e => { e.currentTarget.focus(); setGallery({ initial: null }); }}><Images size={18} strokeWidth={1.4} /></button><button className="icon-button promise-shortcut" aria-label="Read my promise" onClick={promise}><BookHeart size={19} strokeWidth={1.4} /></button><button className="icon-button audio-button" title={soundPreference ? "Your quiet soundtrack. Tap to resume or pause." : "A little music, only if you like."} aria-label={sound ? 'Mute ambient sound' : 'Enable ambient sound'} aria-pressed={sound} aria-busy={audioPending} onClick={() => void toggleAudio()}>{sound ? <Volume2 size={18} strokeWidth={1.4} /> : <VolumeX size={18} strokeWidth={1.4} />}</button></div></header>
      {audioError && <p className="audio-status" role="status">{audioError}</p>}
      {opening && <div className="opening-light" aria-hidden="true"><Artwork name="light-trails" className="opening-trails" /></div>}
      <main id="experience" tabIndex={-1} className="main-scene"><AnimatePresence mode="wait" initial={false}><SceneSurface key={scene} scene={scene}>
      {scene === 0 && <Opening next={openWorld} resume={resume} saved={resumeScene} />}
      {scene === 1 && <Memories next={() => go(2)} />}
      {scene === 2 && <Constellation photos={photos} next={() => go(3)} openPhoto={i => setGallery({ initial: i })} openCollection={() => setGallery({ initial: null })} />}
      {scene === 3 && <Weather next={() => go(4)} />}
      {scene === 4 && <LetterCapsule state={capsule} setState={setCapsule} explore={() => setArchive({ index: null })} original={index => setArchive({ index, original: true })} next={() => go(5)} />}
      {scene === 5 && <PromiseScene revealed={revealed} reveal={reveal} finish={() => go(6)} />}
      {scene === 6 && <Finale replay={replay} promise={promise} gallery={() => setGallery({ initial: null })} />}
      </SceneSurface></AnimatePresence></main>
      <footer className="chapter-footer"><div className="chapter-nav"><nav aria-label="Our seven chapters">{content.chapters.map((chapter, i) => <button key={chapter} aria-label={chapter} title={chapter} aria-current={scene === i ? 'step' : undefined} onClick={() => go(i)}><span className={i < scene ? 'visited' : ''}>{i < scene ? <Check size={8} /> : null}</span></button>)}</nav></div><div className="chapter-context"><button className="text-button chapter-back" aria-label="Previous chapter" disabled={scene === 0} onClick={() => go(scene - 1)}><ChevronLeft size={13} />Back</button><p>{content.chapters[scene]}<span> · </span> just for Nikki</p><span className="chapter-location" aria-hidden="true">{scene + 1} / {content.chapters.length}</span></div></footer>
    </div><div className="desktop-aside aside-right" aria-hidden="true"><Heart size={19} strokeWidth={0.8} /><p>through it all,<br />always you.</p></div></div>{gallery && <PhotoGallery photos={photos} initial={gallery.initial} onClose={closeGallery} />}{archive && <LettersArchive initial={archive} readMemory={readArchiveMemory} remember={rememberArchive} onClose={closeArchive} />}</MotionConfig>;
}
