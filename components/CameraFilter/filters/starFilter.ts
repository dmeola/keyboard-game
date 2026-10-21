import type { FaceMetrics } from "../faceMetrics";
import { drawSparkle, drawStar, faceRx, faceRy } from "./shared";

const SMALL_STAR_COLORS = ["#FF80AB", "#40C4FF", "#FFEB3B", "#B388FF"];

export function drawStarFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const ovalY = m.faceHeight * 0.02;
  const rx = faceRx(m);
  const ry = faceRy(m);
  const onBand = (a: number) => ({ x: Math.cos(a) * rx, y: ovalY + Math.sin(a) * ry });

  // Headband following the hairline
  ctx.beginPath();
  ctx.ellipse(0, ovalY, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.9);
  ctx.strokeStyle = "#7C4DFF";
  ctx.lineWidth = u * 8;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, ovalY, rx, ry - u * 1.5, 0, Math.PI * 1.15, Math.PI * 1.85);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();

  // Small stars along the band
  [1.25, 1.38, 1.62, 1.75].forEach((t, i) => {
    const p = onBand(Math.PI * t);
    const wobble = Math.sin(m.time * 2 + i) * 0.2;
    drawStar(ctx, p.x, p.y, u * 8, SMALL_STAR_COLORS[i], 0.45, wobble);
  });

  // Big star on top of the head
  const bigR = u * 22;
  const bigY = ovalY - ry - u * 14;
  const grad = ctx.createRadialGradient(0, bigY - bigR * 0.2, bigR * 0.1, 0, bigY, bigR);
  grad.addColorStop(0, "#FFF9C4");
  grad.addColorStop(0.5, "#FDD835");
  grad.addColorStop(1, "#F57F17");
  drawStar(ctx, 0, bigY, bigR, grad, 0.45, Math.sin(m.time * 1.5) * 0.08);
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = u * 1.8;
  ctx.lineJoin = "round";
  ctx.stroke();
  drawSparkle(ctx, -bigR * 0.25, bigY - bigR * 0.15, u * 4, "rgba(255,255,255,0.9)");

  // Star stickers on the cheeks, well below the eyes
  const cheekY = m.nose.y + u * 4;
  drawStar(ctx, m.leftEye.x - u * 10, cheekY, u * 6, "#FF80AB", 0.45, -0.2);
  drawStar(ctx, m.rightEye.x + u * 10, cheekY, u * 6, "#FF80AB", 0.45, 0.2);

  // Twinkling sparkles around the head
  [-0.15, 0.2, 0.5, 0.8, 1.15].forEach((t, i) => {
    const a = Math.PI + t * Math.PI;
    const pulse = 0.5 + 0.5 * Math.sin(m.time * 4 + i * 1.7);
    const x = Math.cos(a) * rx * 1.5;
    const y = ovalY + Math.sin(a) * ry * 1.25;
    ctx.globalAlpha = 0.4 + pulse * 0.6;
    drawSparkle(ctx, x, y, u * (4 + pulse * 4));
  });
  ctx.globalAlpha = 1;

  // Mouth open → stars burst outward
  if (m.mouthOpenRatio > 0.3) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const p = (m.time * 1.1 + i * 0.13) % 1;
      const x = Math.cos(a) * rx * (1.15 + p * 0.8);
      const y = ovalY + Math.sin(a) * ry * (1.1 + p * 0.7);
      ctx.globalAlpha = 1 - p;
      drawStar(ctx, x, y, u * 5 * (1 - p * 0.5) * (0.6 + m.mouthOpenRatio), SMALL_STAR_COLORS[i % SMALL_STAR_COLORS.length], 0.45, p * 4);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
