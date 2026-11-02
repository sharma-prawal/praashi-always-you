import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
// The focus ring is only for people moving with the Tab key, never for touch, mouse or other keys.
window.addEventListener('keydown', event => { if (event.key === 'Tab') document.documentElement.dataset.keyboard = 'true'; }, { capture: true, passive: true });
window.addEventListener('pointerdown', () => { delete document.documentElement.dataset.keyboard; }, { capture: true, passive: true });
// iOS Safari only applies :active press feedback once a touch listener exists.
document.addEventListener('touchstart', () => undefined, { passive: true });
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* Online mode remains available if storage is unavailable. */ });
  });
}
