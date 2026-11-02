import { Fragment, useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, BookHeart, Check, ChevronLeft, ChevronRight, CloudRain, Heart, Images, Moon, Music2, RotateCcw, Sparkles, Sun, Volume2, VolumeX } from 'lucide-react';
import photoData from './data/photos.json';
import content from './data/content.json';
import type { Photo as PhotoData, SeenItems } from './types';
import Photo from './components/Photo';
import Stars from './components/Stars';
import Artwork from './components/Artwork';
import SceneSurface from './components/SceneSurface';
import Constellation from './components/Constellation';
import PromiseScene from './components/Promise';
import PhotoGallery from './components/PhotoGallery';
import LetterCapsule from './components/LetterCapsule';
import LettersArchive, { type ArchiveEntry, type ArchiveMemory } from './components/LettersArchive';
import { featuredLetters, type CapsuleState } from './lib/letters';
import { Music } from './lib/music';
import { readProgress, saveProgress } from './lib/storage';
import { useVisibleViewport } from './lib/useVisibleViewport';
import { useAppUpdate } from './lib/useAppUpdate';

const photos: PhotoData[] = photoData;
const finalClauses = content.finalPromise.split(/ (?=through )/);
function Continue({ children = 'Continue our story', onClick, disabled = false }: { children?: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button className="primary-button" disabled={disabled} onClick={onClick}>{children}<ArrowRight size={18} /></button>;
}
function Opening({ next, resume, saved, returning, letterRead, promise, music, setMusic }: { next: () => void; resume: () => void; saved: number; returning: boolean; letterRead: boolean; promise: () => void; music: boolean; setMusic: (on: boolean) => void }) {
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
    <div className="music-choice" role="group" aria-label="Music for this little world"><Music2 size={15} strokeWidth={1.4} aria-hidden="true" /><button aria-pressed={music} onClick={() => setMusic(true)}>Music on</button><button aria-pressed={!music} onClick={() => setMusic(false)}>Music off</button></div>
    <Continue onClick={next}>Open our little world</Continue>
    {saved > 0 ? <button className="text-button resume-button" onClick={resume}>{returning ? 'Welcome back. Pick up where we left off' : 'Continue our story'} <ArrowRight size={14} /></button> : <p className="quiet-note"><Heart size={11} /> From Pawi. For you. Always.</p>}
    {returning && letterRead && <button className="text-button resume-button" onClick={promise}>Read my promise again <ArrowRight size={14} /></button>}
  </div>;
}
function Memories({ next, seen, mark, unlocked }: { next: () => void; seen: number; mark: (index: number) => void; unlocked: boolean }) {
  const [selection, setSelection] = useState({ index: 0, version: 0 });
  const index = selection.index;
  const reduce = useReducedMotion();
  useEffect(() => { mark(index); }, [index, mark]);
  const move = (step: number) => setSelection(current => ({ index: (current.index + step + 8) % 8, version: current.version + 1 }));
  return <div className="memories scene-content"><h1>All the<br /><em>little things.</em></h1><p className="scene-description">It's you who makes them everything.</p>
    <div className="memory-stack" role="region" aria-roledescription="carousel" aria-label="Eight little moments" tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
      <div className="memory-back back-one" aria-hidden="true"><Photo photo={photos[(index + 1) % 8]} small /></div><div className="memory-back back-two" aria-hidden="true"><Photo photo={photos[(index + 2) % 8]} small /></div>
      <AnimatePresence mode="wait" initial={false}><motion.figure key={selection.version} className="memory-frame" initial={{ opacity: 0, transform: reduce ? 'none' : 'translateX(24px) rotate(3deg)' }} animate={{ opacity: 1, transform: 'translateX(0px) rotate(-2deg)' }} exit={{ opacity: 0, transform: reduce ? 'none' : 'translateX(-75%) rotate(-8deg)', transition: { duration: reduce ? 0.1 : 0.24, ease: [0.23, 1, 0.32, 1], opacity: { delay: reduce ? 0 : 0.12, duration: 0.1 } } }} transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 35 || Math.abs(info.velocity.x) > 250) move((info.offset.x || info.velocity.x) < 0 ? 1 : -1); }}>
        <Photo photo={photos[index]} eager /><figcaption>{content.moments[index]}</figcaption>
      </motion.figure></AnimatePresence>
    </div>
    <div className="memory-controls"><button className="icon-button" aria-label="Previous memory" onClick={() => move(-1)}><ChevronLeft size={19} /></button><div className="memory-dots" role="group" aria-label={`Memory ${index + 1} of 8`}>{Array.from({ length: 8 }, (_, i) => <span key={i} className={i === index ? 'current' : ''} aria-hidden="true"><i /></span>)}</div><button className="icon-button" aria-label="Next memory" onClick={() => move(1)}><ChevronRight size={19} /></button></div>
    <p className="gesture-note">Swipe a little. Stay a while.</p>{!unlocked && <p className="gate-hint" role="status">See all eight to go on · {seen} of 8</p>}<Continue disabled={!unlocked} onClick={next}>A sky full of us</Continue>
  </div>;
}
function Weather({ next, seen, mark, unlocked }: { next: () => void; seen: number; mark: (index: number) => void; unlocked: boolean }) {
  const [weather, setWeather] = useState(15);
  const [line, setLine] = useState(0);
  useEffect(() => { mark(line); }, [line, mark]);
  return <div className="weather-scene scene-content" style={{ '--weather': weather / 100 } as CSSProperties}><h1>Through<br /><em>it all.</em></h1><div className="weather-window"><div className="weather-warm"><Artwork name="weather-sunlight" className="weather-art weather-sunlight-art" /></div><div className="weather-cool"><Moon className="moon" size={40} strokeWidth={0.8} /><Artwork name="weather-rain" className="weather-art weather-rain-art" /><div className="rain" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 17) % 100}%`, animationDelay: `${(i % 5) * -0.4}s` }} />)}</div></div><div className="weather-landscape" /><div className="weather-couple"><Photo photo={photos[16]} eager /></div><span className="weather-inscription">you are my constant</span></div>
    <div className="weather-slider"><Sun size={19} aria-hidden="true" /><label className="sr-only" htmlFor="weather">Move between sunshine and rain</label><input id="weather" type="range" min="0" max="100" value={weather} onChange={e => { const value = Number(e.target.value); setWeather(value); setLine(value < 34 ? 0 : value < 67 ? 1 : 2); }} /><CloudRain size={19} aria-hidden="true" /></div><p className="gesture-note">Slide between sunshine and rain.</p>
    <div className="weather-words" aria-live="polite"><AnimatePresence mode="wait" initial={false}><motion.p key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>{content.weather[line]}</motion.p></AnimatePresence><button className="text-button weather-next" onClick={() => { const nextLine = (line + 1) % 3; setLine(nextLine); setWeather([15, 50, 90][nextLine]); }} aria-label="Read the next thought">{line + 1} <span>/ 3</span><ArrowRight size={14} /></button></div>
    <p className="weather-promise">On every kind of day,<br /><em>I'll choose you.</em></p>{!unlocked && <p className="gate-hint" role="status">Read all three thoughts to go on · {seen} of 3</p>}<Continue disabled={!unlocked} onClick={next}>Where it all began</Continue>
  </div>;
}
function Finale({ replay, promise, gallery }: { replay: () => void; promise: () => void; gallery: () => void }) {
  const [burst, setBurst] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  return <div className="finale scene-content"><p className="finale-intro">In every tomorrow...</p><h1><span className="ending-choice">I'll choose you.</span><br /><em>Always.</em></h1><div className="finale-constellation"><div className="finale-orbit" aria-hidden="true" />{[0, 1, 5, 14, 16, 19].map((photo, i) => <div className={`finale-photo finale-photo-${i}`} key={i} style={{ '--gather-delay': `${i * 55}ms` } as CSSProperties}><Photo photo={photos[photo]} small /></div>)}<button className="final-heart" aria-label="Send a little love into our sky" onClick={() => { setBurst(b => b + 1); if (timeout.current) clearTimeout(timeout.current); timeout.current = setTimeout(() => setBurst(0), 1400); }}><Artwork name="glowing-heart" className="final-heart-art" /><Heart size={36} strokeWidth={0.7} fill="currentColor" /></button>{burst > 0 && <div className="love-burst" key={burst} aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--x': `${Math.cos(i * Math.PI / 6) * (i % 2 ? 110 : 80)}px`, '--y': `${Math.sin(i * Math.PI / 6) * 110}px` } as CSSProperties}>{i % 4 === 0 ? <Heart size={10} fill="currentColor" /> : <i />}</span>)}</div>}</div><p className="forever-line">Forever <span>#PrAashi</span> <Heart size={14} /></p><p className="finale-description final-promise">{finalClauses.map((line, index) => <Fragment key={line}>{index > 0 ? ' ' : null}<span>{line}</span></Fragment>)}</p><button className="text-button finale-reread" onClick={promise}>Read my promise <ArrowRight size={14} /></button><div className="finale-actions"><button className="text-button" onClick={replay}><RotateCcw size={15} />Experience again</button><button className="text-button" onClick={e => { e.currentTarget.focus(); gallery(); }}><Images size={16} />Our photos</button></div><p className="finale-signature">Made with all my love, Pawi.</p><details className="music-credit"><summary>Music</summary><p><a href="https://freemusicarchive.org/music/maarten-schellekens/soft-piano-music/echoes-of-embrace/" target="_blank" rel="noreferrer">Echoes of Embrace</a> and <a href="https://freemusicarchive.org/music/maarten-schellekens/soft-piano-music/pristine-reverie/" target="_blank" rel="noreferrer">Pristine Reverie</a> by Maarten Schellekens, <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer">CC BY-NC 4.0</a>. Gently joined and faded for this gift.</p></details></div>;
}

// One soundtrack, quieter for reading and fuller at the ending.
const musicLevels = [0.6, 0.6, 0.6, 0.6, 0.42, 0.3, 0.72];
export default function App() {
  useVisibleViewport();
  const updateReady = useAppUpdate();
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [saved] = useState(readProgress);
  const [scene, setScene] = useState(0);
  const [resumeScene, setResumeScene] = useState(saved.scene);
  const [reached, setReached] = useState(saved.reached);
  const [completed, setCompleted] = useState(saved.completed);
  const [seen, setSeen] = useState(saved.seen);
  const galleryOpen = completed || seen.stars.length === 7;
  const markSeen = useCallback((kind: keyof SeenItems, index: number) => setSeen(current => current[kind].includes(index) ? current : { ...current, [kind]: [...current[kind], index] }), []);
  const markMemory = useCallback((index: number) => markSeen('memories', index), [markSeen]);
  const markStar = useCallback((index: number) => markSeen('stars', index), [markSeen]);
  const markWeather = useCallback((index: number) => markSeen('weather', index), [markSeen]);
  const [returning, setReturning] = useState(saved.scene > 0);
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
  const music = useRef<Music | null>(null);
  const resumeOnVisible = useRef(false);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioIntent = useRef(false);
  const audioRequest = useRef(0);
  const [audioPending, setAudioPending] = useState(false);
  const reduce = useReducedMotion();
  const closeGallery = useCallback(() => setGallery(null), []);
  const invalidateAudio = useCallback(() => { audioIntent.current = false; audioRequest.current++; }, []);
  const go = useCallback((to: number) => {
    setScene(to);
    if (to > 0) { setResumeScene(to); setReturning(false); setReached(current => Math.max(current, to)); }
    if (to === 6) setCompleted(true);
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
  useEffect(() => { saveProgress({ scene: resumeScene, letterRead, soundPreference, capsule, reached, completed, seen }); }, [resumeScene, letterRead, soundPreference, capsule, reached, completed, seen]);
  const resumeFromBackground = useEffectEvent(() => { void setMusic(true); });
  useEffect(() => {
    const hidden = () => { document.documentElement.dataset.paused = String(document.hidden); if (document.hidden) { resumeOnVisible.current = audioIntent.current; invalidateAudio(); void music.current?.pause(false); setSound(false); setAudioPending(false); } else if (resumeOnVisible.current) { resumeOnVisible.current = false; resumeFromBackground(); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { document.removeEventListener('visibilitychange', hidden); delete document.documentElement.dataset.paused; invalidateAudio(); if (openingTimer.current) clearTimeout(openingTimer.current); void music.current?.dispose(); music.current = null; };
  }, [invalidateAudio]);
  useEffect(() => { document.title = scene === 0 ? '#PrAashi — Always You' : `${content.chapters[scene]} · #PrAashi`; }, [scene]);
  const level = () => scene === 5 && revealed ? 0.24 : archive ? 0.36 : musicLevels[scene];
  useEffect(() => { if (sound) music.current?.setLevel(level()); });
  async function setMusic(enable: boolean) {
    if (enable === audioIntent.current && enable === sound) return;
    const request = ++audioRequest.current;
    audioIntent.current = enable;
    if (!enable) resumeOnVisible.current = false;
    setAudioPending(true); setAudioError('');
    try {
      if (enable) {
        music.current ||= new Music(() => { audioIntent.current = false; setSound(false); });
        await music.current.start(level());
        if (!audioIntent.current || document.hidden) { await music.current.pause(false); return; }
      } else await music.current?.pause();
      if (request === audioRequest.current) { setSound(enable); setSoundPreference(enable); }
    } catch {
      if (request === audioRequest.current) { audioIntent.current = false; setAudioError("The music couldn't start. You can try again."); setSound(false); }
    } finally { if (request === audioRequest.current) setAudioPending(false); }
  }
  const startPreferred = () => { if (soundPreference && !audioIntent.current) void setMusic(true); };
  const openWorld = () => {
    startPreferred();
    if (openingTimer.current) clearTimeout(openingTimer.current);
    if (!reduce) { setOpening(true); openingTimer.current = setTimeout(() => setOpening(false), 1100); }
    go(1);
  };
  const replay = () => { setCapsule({ featured: 0, opened: [], read: [], bridge: false }); archiveMemory.current = { collectionScroll: 0 }; setRevealed(false); setResumeScene(0); setReturning(false); go(0); };
  const resume = () => { startPreferred(); if (resumeScene === 5 && letterRead) setRevealed(true); go(resumeScene); };
  return <MotionConfig reducedMotion="user"><div className="world"><div className="desktop-aside aside-left" aria-hidden="true"><span>PAWI + NIKKI</span><i /><p>a little world.<br />an endless love.</p></div><div className="experience-shell" data-scene={scene} data-reading={scene === 5 && revealed ? 'true' : undefined}><Artwork name="starfield" className="celestial-backdrop" /><Stars /><header className="app-header"><button className="brand" aria-label="Return to our little world" onClick={() => go(0)}><Artwork name="praashi-monogram" className="brand-monogram" /><span className="brand-wordmark">#PrAashi<small>ALWAYS YOU</small></span></button><div className="header-actions"><button className="icon-button" aria-label="Open our photos" title={galleryOpen ? 'Open our photos' : 'Opens once every star is touched'} disabled={!galleryOpen} onClick={e => { e.currentTarget.focus(); setGallery({ initial: null }); }}><Images size={18} strokeWidth={1.4} /></button><button className="icon-button promise-shortcut" aria-label="Go straight to my promise" title={completed ? 'Go straight to my promise' : 'Opens after the story ends'} disabled={!completed} aria-current={scene === 5 && revealed ? 'page' : undefined} onClick={promise}><BookHeart size={19} strokeWidth={1.4} /></button><button className="icon-button audio-button" title={soundPreference ? "Your quiet soundtrack. Tap to resume or pause." : "A little music, only if you like."} aria-label={sound ? 'Turn music off' : 'Turn music on'} aria-pressed={sound} aria-busy={audioPending} onClick={() => void setMusic(!audioIntent.current)}>{sound ? <Volume2 size={18} strokeWidth={1.4} /> : <VolumeX size={18} strokeWidth={1.4} />}</button></div></header>
      {audioError && <p className="audio-status" role="status">{audioError}</p>}
      {updateReady && !updateDismissed && !gallery && !archive && !(scene === 5 && revealed) && <div className="update-note" role="status"><span>A little update is ready.</span><button className="text-button" onClick={() => location.reload()}>Refresh</button><button className="text-button" onClick={() => setUpdateDismissed(true)}>Later</button></div>}
      {opening && <div className="opening-light" aria-hidden="true"><Artwork name="light-trails" className="opening-trails" /></div>}
      <main id="experience" tabIndex={-1} className="main-scene"><AnimatePresence mode="wait" initial={false}><SceneSurface key={scene} scene={scene}>
      {scene === 0 && <Opening next={openWorld} resume={resume} saved={resumeScene} returning={returning} letterRead={letterRead && completed} promise={promise} music={soundPreference} setMusic={on => { if (!on) setSoundPreference(false); void setMusic(on); }} />}
      {scene === 1 && <Memories next={() => go(2)} seen={seen.memories.length} mark={markMemory} unlocked={completed || seen.memories.length === 8} />}
      {scene === 2 && <Constellation photos={photos} next={() => go(3)} seen={seen.stars} mark={markStar} unlocked={completed || seen.stars.length === 7} browsable={galleryOpen} openPhoto={i => setGallery({ initial: i })} openCollection={() => setGallery({ initial: null })} />}
      {scene === 3 && <Weather next={() => go(4)} seen={seen.weather.length} mark={markWeather} unlocked={completed || seen.weather.length === 3} />}
      {scene === 4 && <LetterCapsule state={capsule} setState={setCapsule} unlocked={completed || featuredLetters.every(index => capsule.read.includes(index))} explore={() => setArchive({ index: null })} original={index => setArchive({ index, original: true })} next={() => go(5)} />}
      {scene === 5 && <PromiseScene revealed={revealed} reveal={reveal} finish={() => go(6)} />}
      {scene === 6 && <Finale replay={replay} promise={promise} gallery={() => setGallery({ initial: null })} />}
      </SceneSurface></AnimatePresence></main>
      <footer className="chapter-footer"><div className="chapter-nav"><nav aria-label="Our seven chapters">{content.chapters.map((chapter, i) => <button key={chapter} aria-label={chapter} title={chapter} aria-current={scene === i ? 'step' : undefined} disabled={!completed && i > reached} onClick={() => go(i)}><span className={i < scene ? 'visited' : ''}>{i < scene ? <Check size={8} /> : null}</span></button>)}</nav></div><div className="chapter-context"><button className="text-button chapter-back" aria-label="Previous chapter" disabled={scene === 0} onClick={() => go(scene - 1)}><ChevronLeft size={13} />Back</button><p>{content.chapters[scene]}<span> · </span> just for Nikki</p><span className="chapter-location" aria-hidden="true">{scene + 1} / {content.chapters.length}</span></div></footer>
    </div><div className="desktop-aside aside-right" aria-hidden="true"><Heart size={19} strokeWidth={0.8} /><p>through it all,<br />always you.</p></div></div>{gallery && <PhotoGallery photos={photos} initial={gallery.initial} single={!galleryOpen} onClose={closeGallery} />}{archive && <LettersArchive initial={archive} readMemory={readArchiveMemory} remember={rememberArchive} onClose={closeArchive} />}</MotionConfig>;
}
