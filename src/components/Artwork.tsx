type ArtworkName =
  | 'praashi-monogram'
  | 'glowing-heart'
  | 'light-trails'
  | 'starfield'
  | 'weather-sunlight'
  | 'weather-rain';

/** Local decorative art never replaces a control's accessible name. */
export default function Artwork({ name, className = '' }: { name: ArtworkName; className?: string }) {
  return (
    <img
      className={`decorative-art ${className}`}
      src={`${import.meta.env.BASE_URL}assets/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={400}
      height={400}
      draggable={false}
      decoding="async"
    />
  );
}
