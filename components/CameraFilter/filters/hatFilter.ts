import type { FaceMetrics } from "../faceMetrics";
import { drawSparkle, foreheadY } from "./shared";

export function drawHatFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));
  const brimY = foreheadY(m) - u * 6;
  // Opening the mouth tips the hat — it lifts and tilts
  const lift = open * u * 22;

  const brimW = u * 58;
  const brimH = u * 9;
  const cylW = u * 66;
  const cylH = u * 72;

  // Magic sparkles under the lifted hat
  if (open > 0.1) {
    const pulse = 1 + Math.sin(m.time * 10) * 0.2;
    [-u * 16, 0, u * 17].forEach((x, i) => {
      drawSparkle(ctx, x, brimY - lift * (0.35 + (i % 2) * 0.3), u * 4.5 * open * pulse, "#FFF176");
    });
  }

  ctx.save();
  ctx.translate(0, brimY - lift);
  ctx.rotate(-open * 0.22);

  // Back of the brim
  ctx.beginPath();
  ctx.ellipse(0, 0, brimW, brimH, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#212121";
  ctx.fill();

  // Cylinder
  ctx.beginPath();
  ctx.rect(-cylW / 2, -cylH, cylW, cylH);
  ctx.fillStyle = "#212121";
  ctx.fill();

  // Top of the hat
  ctx.beginPath();
  ctx.ellipse(0, -cylH, cylW / 2, u * 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#303030";
  ctx.fill();

  // Front of the brim, overlapping the cylinder base
  ctx.beginPath();
  ctx.ellipse(0, 0, brimW, brimH, 0, 0, Math.PI);
  ctx.fillStyle = "#1A1A1A";
  ctx.fill();

  // Hat band
  ctx.beginPath();
  ctx.rect(-cylW / 2, -u * 16, cylW, u * 9);
  ctx.fillStyle = "#E53935";
  ctx.fill();

  // Flower on the band
  const flowerX = cylW * 0.22;
  const flowerY = -u * 11.5;
  const petalR = u * 3.5;
  ["#FDD835", "#FF7043", "#AB47BC", "#4FC3F7", "#FF6B88"].forEach((color, i) => {
    const angle = (i / 5) * Math.PI * 2 + m.time * 0.5;
    ctx.beginPath();
    ctx.arc(flowerX + Math.cos(angle) * u * 3.8, flowerY + Math.sin(angle) * u * 3.8, petalR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(flowerX, flowerY, u * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = "#FFF9C4";
  ctx.fill();

  // Shine stripe
  ctx.beginPath();
  ctx.rect(-cylW * 0.32, -cylH + u * 4, cylW * 0.08, cylH - u * 22);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fill();

  ctx.restore();
  ctx.restore();
}
