import { useLayoutEffect } from 'react';

/** Safari's visible viewport can shrink independently of its layout viewport. */
export function useVisibleViewport() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let frame = 0, width = 0;
    // Compact phone layout is chosen from the smallest viewport, so Safari's toolbar can't flip it mid-scroll.
    const measureLayout = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;visibility:hidden;height:100vh;height:100svh;width:0';
      document.body.append(probe);
      const smallest = probe.offsetHeight;
      probe.remove();
      if (width < 700 && smallest <= 740) root.dataset.compact = 'true'; else delete root.dataset.compact;
      if (width < 700 && smallest <= 600) root.dataset.short = 'true'; else delete root.dataset.short;
    };
    const update = () => {
      frame = 0;
      measureLayout();
      // Native pinch zoom owns its viewport; never reflow content to its magnified size.
      if (viewport && Math.abs(viewport.scale - 1) > 0.02) return;
      const height = `${viewport?.height ?? window.innerHeight}px`, top = `${viewport?.offsetTop ?? 0}px`;
      if (root.style.getPropertyValue('--visible-height') !== height) root.style.setProperty('--visible-height', height);
      if (root.style.getPropertyValue('--visible-top') !== top) root.style.setProperty('--visible-top', top);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      delete root.dataset.compact; delete root.dataset.short;
      root.style.removeProperty('--visible-height'); root.style.removeProperty('--visible-top');
    };
  }, []);
}
