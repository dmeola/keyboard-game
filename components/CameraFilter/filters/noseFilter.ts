import type { FaceMetrics } from "../faceMetrics";

export function drawNoseFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const noseY = m.cy + m.faceHeight * 0.06;
  const noseR = m.faceWidth * 0.32;

  // Giant cartoon bulbous nose
  ctx.beginPath();
  // Main big blob
  ctx.arc(m.cx, noseY + noseR * 0.1, noseR, 0, Math.PI * 2);
  const noseGrad = ctx.createRadialGradient(
    m.cx - noseR * 0.3, noseY - noseR * 0.2, noseR * 0.05,
    m.cx, noseY, noseR
  );
  noseGrad.addColorStop(0, "#FFCC80");
  noseGrad.addColorStop(0.6, "#FFA726");
  noseGrad.addColorStop(1, "#E65100");
  ctx.fillStyle = noseGrad;
  ctx.fill();

  // Left nostril ball
  ctx.beginPath();
  ctx.arc(m.cx - noseR * 0.42, noseY + noseR * 0.45, noseR * 0.32, 0, Math.PI * 2);
  const lGrad = ctx.createRadialGradient(
    m.cx - noseR * 0.5, noseY + noseR * 0.35, 2,
    m.cx - noseR * 0.42, noseY + noseR * 0.45, noseR * 0.32
  );
  lGrad.addColorStop(0, "#FFB74D");
  lGrad.addColorStop(1, "#E65100");
  ctx.fillStyle = lGrad;
  ctx.fill();

  // Right nostril ball
  ctx.beginPath();
  ctx.arc(m.cx + noseR * 0.42, noseY + noseR * 0.45, noseR * 0.32, 0, Math.PI * 2);
  const rGrad = ctx.createRadialGradient(
    m.cx + noseR * 0.34, noseY + noseR * 0.35, 2,
    m.cx + noseR * 0.42, noseY + noseR * 0.45, noseR * 0.32
  );
  rGrad.addColorStop(0, "#FFB74D");
  rGrad.addColorStop(1, "#E65100");
  ctx.fillStyle = rGrad;
  ctx.fill();

  // Nostrils (dark holes)
  ctx.fillStyle = "#5D2E0C";
  ctx.beginPath();
  ctx.ellipse(m.cx - noseR * 0.42, noseY + noseR * 0.6, noseR * 0.14, noseR * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(m.cx + noseR * 0.42, noseY + noseR * 0.6, noseR * 0.14, noseR * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Shine
  ctx.beginPath();
  ctx.arc(m.cx - noseR * 0.25, noseY - noseR * 0.25, noseR * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fill();

  ctx.restore();
}
