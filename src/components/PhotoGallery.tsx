import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Photo from './Photo';
import { usePageZoom } from '../lib/usePageZoom';
import type { Photo as PhotoData } from '../types';

export default function PhotoGallery({ photos, initial, onClose }: { photos: PhotoData[]; initial: number | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(initial);
  const [version, setVersion] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restorePage = useRef<(() => void) | null>(null);
  const gridScroll = useRef(0);
  const openedFromGrid = useRef(false);
  const lastOpened = useRef(initial);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const zoomed = usePageZoom();
  const columns = useMemo(() => {
    const result: Array<Array<{ photo: PhotoData; index: number }>> = [[], []];
    const height = [0, 0];
    photos.forEach((photo, index) => {
      const column = height[0] <= height[1] ? 0 : 1;
      result[column].push({ photo, index });
      height[column] += photo.height / photo.width + 0.24;
    });
    return result;
  }, [photos]);
  const move = useCallback((step: number) => {
    setDirection(step);
    setSelected(current => ((current ?? 0) + step + photos.length) % photos.length);
    setVersion(value => value + 1);
  }, [photos.length]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.scrollTop = selected === null ? gridScroll.current : 0;
    if (selected === null && openedFromGrid.current && lastOpened.current !== null) {
      element.querySelector<HTMLButtonElement>(`[data-photo-index="${lastOpened.current}"]`)?.focus({ preventScroll: true });
    } else if (selected === null) closeButton.current?.focus({ preventScroll: true });
  }, [selected]);

  useEffect(() => {
    const element = dialog.current!;
    const before = document.activeElement as HTMLElement | null;
    const scroll = window.scrollY;
    const body = document.body;
    const priorStyle = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width };
    Object.assign(body.style, { position: 'fixed', top: `-${scroll}px`, left: '0', right: '0', width: '100%' });
    element.showModal();
    closeButton.current?.focus();
    let released = false;
    const restore = () => {
      if (released) return;
      released = true;
      Object.assign(body.style, priorStyle);
      window.scrollTo({ top: scroll, behavior: 'instant' }); before?.focus({ preventScroll: true });
    };
    restorePage.current = restore;
    const close = () => { restore(); onClose(); };
    element.addEventListener('close', close);
    return () => {
      element.removeEventListener('close', close); element.close();
      restore(); restorePage.current = null;
    };
  }, [onClose]);

  useEffect(() => {
    if (selected === null) return;
    // One adjacent image, at low priority; never decode the entire collection at once.
    const next = new Image();
    next.decoding = 'async'; next.fetchPriority = 'low';
    next.src = `${import.meta.env.BASE_URL}${photos[(selected + direction + photos.length) % photos.length].src}`;
  }, [selected, photos, direction]);

  function requestClose() {
    dialog.current?.close();
    restorePage.current?.();
    onClose();
  }

  function open(index: number) {
    gridScroll.current = dialog.current?.scrollTop || 0;
    lastOpened.current = index; openedFromGrid.current = true; setDirection(1);
    setVersion(value => value + 1); setSelected(index);
  }

  return <dialog className="gallery-dialog" data-view={selected === null ? 'collection' : 'photo'} ref={dialog} aria-labelledby="gallery-title" onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => {
    if (event.target !== dialog.current) return;
    const bounds = dialog.current.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
  }} onKeyDown={event => {
    if (selected !== null && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }}>
    <div className="gallery-header">
      {selected !== null
        ? <button className="icon-button" aria-label="Back to all photos" onClick={() => setSelected(null)}><ArrowLeft size={20} /></button>
        : <span className="gallery-header-spacer" aria-hidden="true" />}
      <h2 id="gallery-title">{selected === null ? 'Our little collection' : 'A moment of us'}</h2>
      <button ref={closeButton} className="icon-button" aria-label="Close gallery" onClick={requestClose}><X size={20} /></button>
    </div>
    {selected === null ? <>
      <p className="gallery-intro">Little pieces of my favourite life. With you.</p>
      <div className="gallery-grid">{columns.map((entries, column) => <div className="gallery-column" key={column}>{entries.map(({ photo, index }) => <button key={photo.id} data-photo-index={index} style={{ '--photo-ratio': `${photo.width} / ${photo.height}` } as CSSProperties} aria-label={`Open photo ${index + 1}: ${photo.caption}`} onClick={() => open(index)}>
        <Photo photo={photo} small eager={index < 4} /><span>{String(index + 1).padStart(2, '0')}</span>
      </button>)}</div>)}</div>
      <p className="gallery-end">Twenty little reasons to smile. One very big love.</p>
    </> : <div className="lightbox" role="region" aria-roledescription="carousel" aria-label="Our photographs" data-zoomed={zoomed ? 'true' : undefined}>
      <div className="photo-viewport">
        <motion.div className="viewer-photo" drag={zoomed ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (zoomed || (window.visualViewport?.scale || 1) > 1.02) return;
            if (Math.abs(info.offset.x) > 42 || Math.abs(info.velocity.x) > 350) move((info.offset.x || info.velocity.x) < 0 ? 1 : -1);
          }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="photo-reveal" key={version} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.08 : 0.12 }}>
              <Photo photo={photos[selected]} eager />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <p className="viewer-caption">{photos[selected].caption}</p>
      <div className="lightbox-controls">
        <button className="icon-button" aria-label="Previous photo" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <span aria-live="polite">{selected + 1} / {photos.length}</span>
        <button className="icon-button" aria-label="Next photo" onClick={() => move(1)}><ArrowRight size={20} /></button>
      </div>
      <p className="viewer-hint">Swipe to see another little moment.</p>
    </div>}
  </dialog>;
}
