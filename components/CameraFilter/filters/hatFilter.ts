import type { FaceMetrics } from "../faceMetrics";

export function drawHatFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const brimW = m.faceWidth * 0.9;
  const brimH = 18;
  const cylW = m.faceWidth * 0.6;
  const cylH = m.faceHeight * 0.7;
  const topY = m.cy - m.faceHeight * 0.5 - cylH;

  // Hat cylinder body
  ctx.beginPath();
  ctx.rect(m.cx - cylW / 2, topY, cylW, cylH);
  ctx.fillStyle = "#212121";
  ctx.fill();

  // Hat brim
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy - m.faceHeight * 0.5 + brimH / 2, brimW / 2, brimH / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#212121";
  ctx.fill();

  // Hat band
  ctx.beginPath();
  ctx.rect(m.cx - cylW / 2, topY + cylH * 0.78, cylW, 14);
  ctx.fillStyle = "#E53935";
  ctx.fill();

  // Flower on hat band
  const flowerX = m.cx + cylW * 0.2;
  const flowerY = topY + cylH * 0.78 + 7;
  const petalR = 7;
  ["#FDD835", "#FF7043", "#AB47BC", "#4FC3F7", "#FF6B88"].forEach((color, i) => {
    const angle = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(flowerX + Math.cos(angle) * petalR, flowerY + Math.sin(angle) * petalR, petalR * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(flowerX, flowerY, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF9C4";
  ctx.fill();

  // Shine stripe on cylinder
  ctx.beginPath();
  ctx.rect(m.cx - cylW * 0.25, topY + 4, cylW * 0.08, cylH - 8);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fill();

  ctx.restore();
}
