import { useEffect, useState } from 'react';

/** True once a newer build has taken over this open page. Never reloads by itself. */
export function useAppUpdate() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const worker = navigator.serviceWorker;
    // The very first install also claims the page; that is not an update.
    const hadController = Boolean(worker.controller);
    const changed = () => { if (hadController) setReady(true); };
    const check = () => { if (!document.hidden) void worker.getRegistration().then(registration => registration?.update()).catch(() => { /* Offline. */ }); };
    worker.addEventListener('controllerchange', changed);
    document.addEventListener('visibilitychange', check);
    return () => { worker.removeEventListener('controllerchange', changed); document.removeEventListener('visibilitychange', check); };
  }, []);
  return ready;
}
