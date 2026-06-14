import type { FaceMetrics } from "../faceMetrics";

export function drawElephantFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.5;
  const earR = r * 1.1;
  const earCY = m.cy - m.faceHeight * 0.1;

  // Left big ear (large semicircle)
  ctx.beginPath();
  ctx.arc(m.cx - r * 0.85, earCY, earR, Math.PI * 0.4, Math.PI * 1.6);
  ctx.fillStyle = "#9E9E9E";
  ctx.fill();

  // Left ear inner
  ctx.beginPath();
  ctx.arc(m.cx - r * 0.85, earCY, earR * 0.65, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fillStyle = "#BDBDBD";
  ctx.fill();

  // Right big ear
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.85, earCY, earR, Math.PI * 1.4, Math.PI * 2.6);
  ctx.fillStyle = "#9E9E9E";
  ctx.fill();

  // Right ear inner
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.85, earCY, earR * 0.65, Math.PI * 1.5, Math.PI * 2.5);
  ctx.fillStyle = "#BDBDBD";
  ctx.fill();

  // Trunk extending from nose area downward
  const trunkStartY = m.cy + m.faceHeight * 0.12;
  const trunkLen = m.faceHeight * 0.55 + (m.mouthOpenRatio > 0.4 ? 20 : 0);
  ctx.beginPath();
  ctx.moveTo(m.cx - 16, trunkStartY);
  ctx.bezierCurveTo(
    m.cx - 24, trunkStartY + trunkLen * 0.4,
    m.cx + 20, trunkStartY + trunkLen * 0.7,
    m.cx - 8, trunkStartY + trunkLen
  );
  ctx.bezierCurveTo(
    m.cx - 20, trunkStartY + trunkLen + 18,
    m.cx + 8, trunkStartY + trunkLen + 18,
    m.cx + 16, trunkStartY
  );
  ctx.closePath();
  ctx.fillStyle = "#757575";
  ctx.fill();

  // Trunk tip wrinkles
  const tipY = trunkStartY + trunkLen - 5;
  ctx.strokeStyle = "#616161";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(m.cx + (i - 1) * 5, tipY, 8, 0, Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}
