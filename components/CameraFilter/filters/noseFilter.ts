import type { FaceMetrics } from "../faceMetrics";

export function drawNoseFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;

  // Size the nose from the real nose-to-mouth gap so it never reaches the
  // mouth or the eyes
  const gap = Math.max(u * 10, m.mouth.y - m.nose.y);
  const noseR = Math.min(u * 16, Math.max(u * 8, gap * 0.6));

  // Wiggle when the mouth opens, plus a tiny idle bob
  const wiggle = m.mouthOpenRatio > 0.3 ? Math.sin(m.time * 22) * u * 1.8 * m.mouthOpenRatio : 0;
  const nx = m.nose.x + wiggle;
  const ny = m.nose.y - noseR * 0.25 + Math.sin(m.time * 2) * u * 0.4;

  // Main bulb
  ctx.beginPath();
  ctx.arc(nx, ny, noseR, 0, Math.PI * 2);
  const noseGrad = ctx.createRadialGradient(nx - noseR * 0.3, ny - noseR * 0.3, noseR * 0.05, nx, ny, noseR);
  noseGrad.addColorStop(0, "#FFCC80");
  noseGrad.addColorStop(0.6, "#FFA726");
  noseGrad.addColorStop(1, "#E65100");
  ctx.fillStyle = noseGrad;
  ctx.fill();

  // Nostril balls
  [-1, 1].forEach((side) => {
    const bx = nx + side * noseR * 0.55;
    const by = ny + noseR * 0.45;
    const br = noseR * 0.42;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(bx - side * br * 0.2, by - br * 0.3, br * 0.1, bx, by, br);
    g.addColorStop(0, "#FFB74D");
    g.addColorStop(1, "#E65100");
    ctx.fillStyle = g;
    ctx.fill();

    // Dark nostril hole
    ctx.beginPath();
    ctx.ellipse(bx - side * br * 0.15, by + br * 0.35, br * 0.38, br * 0.25, side * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#5D2E0C";
    ctx.fill();
  });

  // Shine
  ctx.beginPath();
  ctx.arc(nx - noseR * 0.3, ny - noseR * 0.35, noseR * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  ctx.restore();
}
