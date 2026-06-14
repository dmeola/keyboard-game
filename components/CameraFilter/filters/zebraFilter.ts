import type { FaceMetrics } from "../faceMetrics";

export function drawZebraFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.55;

  // White face circle base
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ECEFF1";
  ctx.fill();

  // Black stripes — alternating arcs across the face
  ctx.fillStyle = "#212121";
  const stripeCount = 6;
  for (let i = 0; i < stripeCount; i++) {
    const t = (i + 0.5) / stripeCount;
    const stripeY = m.cy - r + t * r * 2;
    const halfW = Math.sqrt(Math.max(0, r * r - (stripeY - m.cy) * (stripeY - m.cy)));
    const stripeH = (r * 2) / (stripeCount * 2.2);

    if (i % 2 === 0) {
      // Use clipping to keep stripes inside circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillRect(m.cx - halfW, stripeY - stripeH / 2, halfW * 2, stripeH);
      ctx.restore();
    }
  }

  // Circle border
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#212121";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Zebra ears on top (oval, black-rimmed white)
  const earTopY = m.cy - r * 0.9;
  [-1, 1].forEach((side) => {
    const earCX = m.cx + side * r * 0.6;
    // Black ear
    ctx.beginPath();
    ctx.ellipse(earCX, earTopY - 22, 18, 28, side * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    // White inner
    ctx.beginPath();
    ctx.ellipse(earCX, earTopY - 22, 10, 18, side * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  });

  // Zebra snout / muzzle (slightly protruding)
  const muzzleY = m.cy + m.faceHeight * 0.15;
  ctx.beginPath();
  ctx.ellipse(m.cx, muzzleY, r * 0.38, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FAFAFA";
  ctx.fill();
  ctx.strokeStyle = "#212121";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = "#616161";
  ctx.beginPath();
  ctx.ellipse(m.cx - 10, muzzleY + 5, 5, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(m.cx + 10, muzzleY + 5, 5, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  if (m.mouthOpenRatio > 0.3) {
    ctx.beginPath();
    ctx.ellipse(m.cx, muzzleY + 14, r * 0.2, r * 0.1 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#37474F";
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(m.cx, muzzleY + 8, r * 0.18, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#37474F";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.restore();
}
