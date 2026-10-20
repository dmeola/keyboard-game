import type { FaceMetrics } from "../faceMetrics";

/*
 * Drawing helpers shared by the letter filters.
 *
 * Every filter draws in the upright face frame: (0, 0) is the face centre,
 * y grows downward, and m.u is 1/100 of the face width. Useful landmarks:
 *   headTop(m)   — top of the skull (where hats and ears sit)
 *   browY(m)     — eyebrow line
 *   chinY(m)     — bottom of the chin
 *   m.nose / m.mouth / m.leftEye / m.rightEye — live feature points
 */

export const headTop = (m: FaceMetrics) => -m.faceHeight * 0.68;
export const foreheadY = (m: FaceMetrics) => -m.faceHeight * 0.5;
export const browY = (m: FaceMetrics) => (m.leftEye.y + m.rightEye.y) / 2 - m.faceHeight * 0.12;
export const chinY = (m: FaceMetrics) => m.faceHeight * 0.5;

/** Horizontal half-width of the face oval */
export const faceRx = (m: FaceMetrics) => m.faceWidth * 0.5;
/** Vertical half-height of the face oval (hairline to chin) */
export const faceRy = (m: FaceMetrics) => m.faceHeight * 0.56;

/** Adds the face oval as a sub-path (counter-clockwise, so it cuts a hole with fill("evenodd")). */
export function faceOvalSubpath(ctx: CanvasRenderingContext2D, m: FaceMetrics, pad = 1): void {
  ctx.moveTo(faceRx(m) * pad, 0);
  ctx.ellipse(0, m.faceHeight * 0.02, faceRx(m) * pad, faceRy(m) * pad, 0, 0, Math.PI * 2, true);
}

/**
 * Fills a shape with the child's face showing through a hole in the middle.
 * `outer` must add the outer outline to the current path (no beginPath).
 */
export function fillWithFaceHole(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics,
  outer: () => void,
  fill: string | CanvasGradient,
  pad = 1
): void {
  ctx.beginPath();
  outer();
  faceOvalSubpath(ctx, m, pad);
  ctx.fillStyle = fill;
  ctx.fill("evenodd");
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string | CanvasGradient,
  innerRatio = 0.45,
  rotation = 0
): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + rotation;
    const rr = i % 2 === 0 ? r : r * innerRatio;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Four-point twinkle */
export function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill = "#FFF9C4"): void {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill = "#FFFFFF"): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.arc(x + r * 0.45, y + r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.arc(x - r * 0.4, y + r * 0.15, r * 0.4, 0, Math.PI * 2);
  ctx.arc(x + r * 0.1, y + r * 0.35, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Crescent path: circle (x, y, r) minus a circle shifted by `bite`·r toward
 * `angle`. Built from the two arcs so nothing underneath is erased.
 */
export function crescentPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  bite = 0.45,
  angle = 0
): void {
  const d = r * bite;
  const r2 = r * 0.85;
  // Intersection of the two circles along the line between their centres
  const a = (d * d + r * r - r2 * r2) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const theta = Math.atan2(h, a);
  ctx.beginPath();
  ctx.arc(x, y, r, angle + theta, angle - theta + Math.PI * 2);
  const bx = x + Math.cos(angle) * d;
  const by = y + Math.sin(angle) * d;
  const phiStart = Math.atan2(y + Math.sin(angle - theta) * r - by, x + Math.cos(angle - theta) * r - bx);
  const phiEnd = Math.atan2(y + Math.sin(angle + theta) * r - by, x + Math.cos(angle + theta) * r - bx);
  ctx.arc(bx, by, r2, phiStart, phiEnd, true);
  ctx.closePath();
}

/** Soft pink cheeks — a cheap way to make any character cuter */
export function drawBlush(ctx: CanvasRenderingContext2D, m: FaceMetrics, color = "rgba(255,107,107,0.35)"): void {
  const y = m.nose.y + m.u * 4;
  ctx.fillStyle = color;
  [m.leftEye.x - m.u * 4, m.rightEye.x + m.u * 4].forEach((x) => {
    ctx.beginPath();
    ctx.ellipse(x, y, m.u * 9, m.u * 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
