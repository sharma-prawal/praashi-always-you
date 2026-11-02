import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Heart, RotateCcw, X } from 'lucide-react';
import { letterDate, letters } from '../lib/letters';

type View = 'collection' | 'excerpt' | 'original';
export interface ArchiveEntry { index: number | null; original?: boolean }
export interface ArchiveMemory { collectionScroll: number }

function Screenshot({ index }: { index: number }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [complete, setComplete] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const letter = letters[index];
  const crop = letter.readingWindow;
  const retry = () => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); };
  const toggle = () => {
    setComplete(value => !value); setLoaded(false); setFailed(false);
    figure.current?.closest('dialog')?.scrollTo({ top: 0, behavior: 'instant' });
  };
  return <figure ref={figure} className="original-letter" data-complete={complete ? 'true' : undefined} aria-busy={!loaded && !failed}>
    <button className="text-button original-toggle" aria-pressed={complete} onClick={toggle}>{complete ? <ArrowLeft size={15} /> : null}{complete ? 'Back to the note' : 'See the whole page'}{complete ? null : <ArrowRight size={15} />}</button>
    {failed ? <div className="letter-image-error" role="status"><p>This page couldn't open just now. My words are still here.</p><button className="text-button" onClick={retry}><RotateCcw size={15} />Try again</button></div> : <div className={complete ? 'complete-screenshot' : 'note-content-window'} style={complete ? undefined : {
      aspectRatio: `${crop.width} / ${crop.height}`,
      '--note-width': `${letter.width / crop.width * 100}%`, '--note-left': `${-crop.left / crop.width * 100}%`, '--note-top': `${-crop.top / crop.height * 100}%`,
    } as CSSProperties}>
      {!loaded && <p className="original-loading" role="status">Opening a little piece of 2021…</p>}
      <img key={`${complete}-${attempt}`} src={`${import.meta.env.BASE_URL}${complete ? letter.originalImage : letter.image}`} width={letter.width} height={letter.height} decoding="async" loading="eager" draggable={false}
        alt={`${complete ? 'The whole original page' : 'A closer view of the original note'} from ${letterDate(letter.date)}.`}
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
    </div>}
    <figcaption>{complete ? 'The whole page, just as it was kept.' : 'Just as I wrote it to you.'}<br />Pinch to read closer.</figcaption>
  </figure>;
}

export default function LettersArchive({ initial, readMemory, remember, onClose }: { initial: ArchiveEntry; readMemory: () => ArchiveMemory; remember: (value: ArchiveMemory) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restorePage = useRef<(() => void) | null>(null);
  const collectionScroll = useRef(0);
  const excerptScroll = useRef(0);
  const fromCollection = useRef(false);
  const returnFocus = useRef<'collection' | 'original' | null>(null);
  const [index, setIndex] = useState(initial.index ?? 0);
  const [view, setView] = useState<View>(initial.index === null ? 'collection' : initial.original ? 'original' : 'excerpt');
  const letter = letters[index];

  useEffect(() => {
    const element = dialog.current!;
    const before = document.activeElement as HTMLElement | null;
    const scroll = window.scrollY;
    const body = document.body;
    const prior = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width };
    Object.assign(body.style, { position: 'fixed', top: `-${scroll}px`, left: '0', right: '0', width: '100%' });
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true; Object.assign(body.style, prior);
      window.scrollTo({ top: scroll, behavior: 'instant' }); before?.focus({ preventScroll: true });
    };
    restorePage.current = restore;
    collectionScroll.current = readMemory().collectionScroll;
    element.showModal();
    if (initial.index === null) element.scrollTop = collectionScroll.current;
    closeButton.current?.focus({ preventScroll: true });
    const close = () => { restore(); onClose(); };
    element.addEventListener('close', close);
    return () => { element.removeEventListener('close', close); element.close(); restore(); restorePage.current = null; };
  }, [onClose, initial.index, readMemory]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.scrollTop = view === 'collection' ? collectionScroll.current : returnFocus.current === 'original' ? excerptScroll.current : 0;
    const target = returnFocus.current === 'collection' ? element.querySelector<HTMLButtonElement>(`[data-letter-index="${index}"]`)
      : returnFocus.current === 'original' ? element.querySelector<HTMLButtonElement>('.view-original') : element.querySelector<HTMLElement>('.archive-content h3');
    target?.focus({ preventScroll: true });
    if (returnFocus.current === 'collection' && target) {
      const box = target.getBoundingClientRect(), header = element.querySelector('header')!.getBoundingClientRect();
      if (box.bottom < header.bottom || box.top > element.getBoundingClientRect().bottom) target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    returnFocus.current = null;
  }, [view, index]);

  function close() { dialog.current?.close(); restorePage.current?.(); onClose(); }
  function back() {
    if (view === 'original') { returnFocus.current = 'original'; setView('excerpt'); }
    else { returnFocus.current = fromCollection.current ? 'collection' : null; setView('collection'); }
  }
  function select(value: number) {
    collectionScroll.current = dialog.current?.scrollTop || 0;
    remember({ collectionScroll: collectionScroll.current });
    fromCollection.current = true; setIndex(value); setView('excerpt');
  }
  function move(step: number) { setIndex(value => (value + step + letters.length) % letters.length); }
  return <dialog ref={dialog} className="letters-dialog" aria-labelledby="letters-title" data-view={view}
    onScroll={event => { if (view === 'collection') { collectionScroll.current = event.currentTarget.scrollTop; remember({ collectionScroll: collectionScroll.current }); } }}
    onCancel={event => { event.preventDefault(); close(); }} onClick={event => {
      if (event.target !== dialog.current) return;
      const bounds = dialog.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
    <header className="letters-dialog-header">
      {view === 'collection' ? <span className="gallery-header-spacer" aria-hidden="true" /> : <button className="icon-button" aria-label={view === 'original' ? 'Back to excerpt' : 'Back to all letters'} onClick={back}><ArrowLeft size={19} /></button>}
      <h2 id="letters-title">{view === 'collection' ? 'Letters from 2021' : view === 'original' ? 'The original' : 'A few words, kept'}</h2>
      <button ref={closeButton} className="icon-button" aria-label="Close letters and return to the story" onClick={close}><X size={20} /></button>
    </header>
    <div className="archive-content">
      {view === 'collection' ? <>
        <p className="archive-intro">Ten little pieces of 2021.<br /><em>My words. Still yours.</em></p>
        <ol className="letter-timeline">{letters.map((item, i) => <li key={item.date}><button data-letter-index={i} onClick={() => select(i)} aria-label={`Read excerpt from ${letterDate(item.date)}`}>
          <time dateTime={item.date}>{letterDate(item.date)}</time><span className="timeline-excerpt">{item.excerpt}</span><span className="timeline-open">Unfold this memory <ArrowRight size={14} /></span>
        </button></li>)}</ol>
        <p className="archive-end">Different mornings. The same you.<Heart size={16} strokeWidth={1} /></p>
      </> : <>
        <h3 className="archive-date" tabIndex={-1}><time dateTime={letter.date}>{letterDate(letter.date)}</time></h3>
        {view === 'original' ? <Screenshot key={index} index={index} /> : <>
          <article className="archive-paper" key={index}>
            <span className="capsule-fold" aria-hidden="true" /><Heart className="archive-heart" size={19} strokeWidth={1} aria-hidden="true" />
            {letter.greeting && <p className="capsule-greeting">{letter.greeting}</p>}
            <blockquote>{letter.excerpt}</blockquote>
            <p className="capsule-fragment">A little piece of my heart, from 2021.</p>
          </article>
          <button className="text-button view-original" onClick={() => { excerptScroll.current = dialog.current?.scrollTop || 0; setView('original'); }}>View original <ArrowRight size={15} /></button>
          <p className="archive-source-note">These were my words, long before today.</p>
          <div className="archive-pagination"><button className="icon-button" aria-label="Previous letter" onClick={() => move(-1)}><ArrowLeft size={18} /></button><span aria-live="polite">{index + 1} / {letters.length}</span><button className="icon-button" aria-label="Next letter" onClick={() => move(1)}><ArrowRight size={18} /></button></div>
        </>}
      </>}
      <button className="text-button archive-return" onClick={close}>Return to our story <ArrowRight size={15} /></button>
    </div>
  </dialog>;
}
