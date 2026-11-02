import data from '../data/letters.json' with { type: 'json' };

export const letters = data;
export const featuredLetters = [1, 6, 8];
export const bridgeLines = [
  'In 2021, I kept finding new ways to tell you how much I loved you.',
  'Years have passed. So many things have changed.',
  "But there's one thing that never will.",
  "It's you. It has always been you.",
  "And there's one promise I want to make to you today…",
];
export function letterDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
export interface CapsuleState { featured: number; opened: number[]; bridge: boolean }
