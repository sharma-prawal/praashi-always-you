import type { Progress } from '../types';
const items = (value: unknown, size: number) => Array.isArray(value) ? [...new Set<number>(value.filter((index: unknown) => Number.isInteger(index) && (index as number) >= 0 && (index as number) < size))] : [];
const KEY = 'praashi-keepsake-v1';
export function readProgress(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    // Keep existing bookmarks pointing to the promise/finale after inserting the 2021 chapter.
    const previous = Number.isInteger(value.scene) ? Math.max(0, Math.min(value.narrativeVersion === 2 ? 6 : 5, value.scene)) : 0;
    const scene = value.narrativeVersion === 2 || previous < 4 ? previous : previous + 1;
    const capsule = value.capsule;
    const opened = Array.isArray(capsule?.opened) ? [...new Set<number>(capsule.opened.filter((index: unknown) => typeof index === 'number' && [1, 6, 8].includes(index)))] : [];
    return { scene, letterRead: value.letterRead === true, soundPreference: value.soundPreference === true, capsule: {
      featured: Number.isInteger(capsule?.featured) ? Math.max(0, Math.min(2, capsule.featured)) : 0,
      opened,
      read: [...new Set<number>([...opened, ...(Array.isArray(capsule?.read) ? capsule.read.filter((index: unknown) => typeof index === 'number' && [1, 6, 8].includes(index)) : [])])],
      bridge: capsule?.bridge === true,
    },
    reached: Math.max(scene, Number.isInteger(value.reached) ? Math.max(0, Math.min(6, value.reached)) : 0),
    completed: value.completed === true || scene === 6,
    seen: { memories: items(value.seen?.memories, 8), stars: items(value.seen?.stars, 7), weather: items(value.seen?.weather, 3) } };
  } catch { return { scene: 0, letterRead: false, soundPreference: false, capsule: { featured: 0, opened: [], read: [], bridge: false }, reached: 0, completed: false, seen: { memories: [], stars: [], weather: [] } }; }
}
export function saveProgress(value: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...value, narrativeVersion: 2 })); } catch { /* Private browsing may disable storage. The experience still works. */ }
}
