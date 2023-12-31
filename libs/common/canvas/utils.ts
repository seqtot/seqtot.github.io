export function squaredDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
  return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}