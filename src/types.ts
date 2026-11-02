export interface Photo {
  id: string;
  source: string;
  caption: string;
  alt: string;
  position: string;
  width: number;
  height: number;
  src: string;
  small: string;
  fallback: string;
}
export interface Progress { scene: number; letterRead: boolean; soundPreference: boolean; capsule: { featured: number; opened: number[]; bridge: boolean } }
