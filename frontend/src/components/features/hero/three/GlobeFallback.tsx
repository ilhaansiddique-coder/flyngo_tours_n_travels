import { LAND_LATLON } from '@/lib/land-dots';

// Orthographic projection of the existing land dots: no GPU or network required.
const dots: string[] = [];
for (let i = 0; i < LAND_LATLON.length; i += 4) {
  const latitude = LAND_LATLON[i] / 100 * Math.PI / 180;
  const longitude = (LAND_LATLON[i + 1] / 100 - 80) * Math.PI / 180;
  if (Math.cos(latitude) * Math.cos(longitude) < 0) continue;
  const x = (Math.cos(latitude) * Math.sin(longitude) * 98).toFixed(1);
  const y = (-Math.sin(latitude) * 98).toFixed(1);
  dots.push(`M${x} ${y}h1v1h-1z`);
}

export function GlobeFallback() {
  return (
    <svg viewBox="-115 -115 230 230" className="h-full w-full" role="img" aria-label="Travel destinations globe">
      <circle r="101" fill="#021935" stroke="#1881ff" strokeWidth="1.5" />
      <g fill="none" stroke="#1881ff" strokeOpacity="0.3">
        <ellipse rx="50" ry="100" />
        <ellipse rx="85" ry="100" />
        <ellipse rx="100" ry="35" />
        <ellipse rx="100" ry="70" />
      </g>
      <path d={dots.join('')} fill="#1881ff" />
    </svg>
  );
}
