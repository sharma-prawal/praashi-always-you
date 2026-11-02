import { useEffect, useState } from 'react';

export function usePageZoom() {
  const [zoomed, setZoomed] = useState(() => (window.visualViewport?.scale || 1) > 1.02);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => setZoomed((viewport?.scale || 1) > 1.02);
    viewport?.addEventListener('resize', update);
    return () => viewport?.removeEventListener('resize', update);
  }, []);
  return zoomed;
}
