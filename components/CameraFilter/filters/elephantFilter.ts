import type { FaceMetrics, Point } from "../faceMetrics";
import { faceOvalSubpath, faceRx } from "./shared";

/** Point and tangent on a cubic bezier */
function bezierAt(t: number, p0: Point, p1: Point, p2: Point, p3: Point): { p: Point; d: Point } {
  const mt = 1 - t;
  const p = {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
  const d = {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
  return { p, d };
}

export function drawElephantFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));
  const flap = 1 + Math.sin(m.time * 2.5) * 0.05 + open * 0.1;

  // Big ears beside the head — clipped so they never cover the face
  ctx.save();
  ctx.beginPath();
  ctx.rect(-m.faceWidth * 3, -m.faceHeight * 3, m.faceWidth * 6, m.faceHeight * 6);
  faceOvalSubpath(ctx, m);
  ctx.clip("evenodd");
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.ellipse(s * (faceRx(m) + u * 20), -u * 2, u * 36 * flap, u * 46, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "#9E9E9E";
    ctx.fill();
    ctx.strokeStyle = "#757575";
    ctx.lineWidth = u * 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(s * (faceRx(m) + u * 24), 0, u * 24 * flap, u * 32, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(248,187,208,0.8)";
    ctx.fill();
  });
  ctx.restore();

  // Trunk curls out to the side from the nose, and lifts up to trumpet when the mouth opens
  const n = m.nose;
  const lerp = (a: number, b: number) => a + (b - a) * open;
  const p0 = { x: n.x, y: n.y };
  const p1 = { x: n.x + u * lerp(12, 14), y: n.y + u * lerp(6, 2) };
  const p2 = { x: n.x + u * lerp(32, 42), y: n.y + u * lerp(14, 2) };
  const p3 = { x: n.x + u * lerp(52, 54), y: n.y + u * lerp(4, -34) };

  ctx.lineCap = "round";
  [
    { color: "#757575", width: u * 10 },
    { color: "#9E9E9E", width: u * 7.5 },
  ].forEach(({ color, width }) => {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  });

  // Wrinkles across the trunk
  ctx.strokeStyle = "#616161";
  ctx.lineWidth = u * 1;
  [0.35, 0.5, 0.65, 0.8].forEach((t) => {
    const { p, d } = bezierAt(t, p0, p1, p2, p3);
    const len = Math.hypot(d.x, d.y) || 1;
    const nx = (-d.y / len) * u * 3.5;
    const ny = (d.x / len) * u * 3.5;
    ctx.beginPath();
    ctx.moveTo(p.x - nx, p.y - ny);
    ctx.lineTo(p.x + nx, p.y + ny);
    ctx.stroke();
  });

  // Trunk tip
  const tip = bezierAt(1, p0, p1, p2, p3);
  const angle = Math.atan2(tip.d.y, tip.d.x);
  ctx.beginPath();
  ctx.ellipse(p3.x, p3.y, u * 3.5, u * 5.5, angle, 0, Math.PI * 2);
  ctx.fillStyle = "#757575";
  ctx.fill();

  // Toot! Sound lines coming out of the raised trunk
  if (open > 0.2) {
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + open * 0.5})`;
    ctx.lineWidth = u * 1.6;
    [-0.5, 0, 0.5].forEach((spread) => {
      const a = angle + spread;
      const r0 = u * 8;
      const r1 = u * (14 + 6 * open + Math.sin(m.time * 10) * 2);
      ctx.beginPath();
      ctx.moveTo(p3.x + Math.cos(a) * r0, p3.y + Math.sin(a) * r0);
      ctx.lineTo(p3.x + Math.cos(a) * r1, p3.y + Math.sin(a) * r1);
      ctx.stroke();
    });
  }

  ctx.restore();
}
