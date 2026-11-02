import { useEffect, useState } from 'react';
import type { Photo as PhotoData } from '../types';

interface PhotoProps { photo: PhotoData; eager?: boolean; className?: string; small?: boolean }
const base = import.meta.env.BASE_URL;

export default function Photo(props: PhotoProps) {
  return <PhotoImage key={props.photo.id} {...props} />;
}

function PhotoImage({ photo, eager = false, className = '', small = false }: PhotoProps) {
  const [error, setError] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const retry = () => { if (!error) return; setError(false); setFallback(false); setLoaded(false); setAttempt(v => v + 1); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [error]);
  if (error) return <div className={`photo-unavailable ${className}`} role="img" aria-label={photo.alt}><span>This moment will return<br />when we're connected.</span></div>;
  const renditionWidth = (limit: number) => Math.round(photo.width * Math.min(limit / photo.width, limit / photo.height, 1));
  return <picture className={`photo-picture ${className}`} data-loaded={loaded ? 'true' : undefined}>
    {!fallback && <source type="image/webp" srcSet={small ? `${base}${photo.small}` : `${base}${photo.small} ${renditionWidth(480)}w, ${base}${photo.src} ${renditionWidth(960)}w`} sizes="(max-width: 520px) 80vw, 420px" />}
    <img
      key={`${photo.id}-${attempt}-${fallback}`}
      src={`${base}${fallback ? photo.fallback : small ? photo.small : photo.src}`}
      draggable={false} alt={photo.alt} width={photo.width} height={photo.height}
      loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async"
      style={{ objectPosition: photo.position }}
      onLoad={() => setLoaded(true)}
      onError={() => { setLoaded(false); if (fallback) setError(true); else setFallback(true); }}
    />
  </picture>;
}
