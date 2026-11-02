import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Reset reading position only after the next scene actually mounts. */
export default function SceneSurface({ scene, children }: { scene: number; children: ReactNode }) {
  const surface = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = surface.current?.querySelector('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [scene]);
  return <motion.div
    ref={surface}
    className="scene"
    data-scene={scene}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: reduce ? 0.12 : 0.22, ease: [0.23, 1, 0.32, 1] }}
  >{children}</motion.div>;
}
