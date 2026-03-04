export function getDirection(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): string {
  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;

  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

  const directions = [
    { dir: "↑", min: -22.5, max: 22.5 },
    { dir: "↗", min: 22.5, max: 67.5 },
    { dir: "→", min: 67.5, max: 112.5 },
    { dir: "↘", min: 112.5, max: 157.5 },
    { dir: "↓", min: 157.5, max: 180 },
    { dir: "↓", min: -180, max: -157.5 },
    { dir: "↙", min: -157.5, max: -112.5 },
    { dir: "←", min: -112.5, max: -67.5 },
    { dir: "↖", min: -67.5, max: -22.5 },
  ];

  const found = directions.find((d) => angle >= d.min && angle < d.max);

  return found?.dir ?? "↑";
}
