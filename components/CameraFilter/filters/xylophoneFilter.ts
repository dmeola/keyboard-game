import type { FaceMetrics } from "../faceMetrics";
import { faceRx, faceRy, headTop } from "./shared";

const BAR_COLORS = ["#E53935", "#FF9800", "#FDD835", "#4CAF50", "#2196F3", "#3F51B5", "#9C27B0", "#FF4081"];

function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.25;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.6, s * 0.45, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.5, y);
  ctx.lineTo(x + s * 0.5, y - s * 2);
  ctx.quadraticCurveTo(x + s * 1.2, y - s * 1.6, x + s * 1.1, y - s * 1.1);
  ctx.stroke();
}

export function drawXylophoneFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const ovalY = m.faceHeight * 0.02;
  const rx = faceRx(m) * 1.05;
  const ry = faceRy(m) * 1.05;
  const count = BAR_COLORS.length;
  const barW = u * 10;
  const playing = Math.floor(m.time * 6) % count;

  // Bars fan out over the head like a crown, longest in the middle
  const bars = BAR_COLORS.map((color, i) => {
    const t = i / (count - 1);
    const a = Math.PI * (1.15 + t * 0.7);
    const len = u * (20 + Math.sin(t * Math.PI) * 14);
    const bx = Math.cos(a) * rx;
    const by = ovalY + Math.sin(a) * ry;
    // Point the bar away from the face centre
    const out = Math.atan2(by - ovalY, bx) + Math.PI / 2;
    return { color, bx, by, len, out };
  });

  // Two cords threading the bars together
  [0.3, 0.75].forEach((f) => {
    ctx.beginPath();
    bars.forEach(({ bx, by, len, out }, i) => {
      const x = bx + Math.sin(out) * len * f;
      const y = by - Math.cos(out) * len * f;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#8D6E63";
    ctx.lineWidth = u * 1.2;
    ctx.stroke();
  });

  bars.forEach(({ color, bx, by, len, out }, i) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(out);
    ctx.beginPath();
    ctx.roundRect(-barW / 2, -len, barW, len, u * 2.5);
    ctx.fillStyle = color;
    ctx.fill();
    // Shine
    ctx.beginPath();
    ctx.roundRect(-barW / 2 + u * 1.5, -len + u * 2, barW * 0.3, len - u * 4, u * 1.2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    // Bolts
    ctx.fillStyle = "#ECEFF1";
    [0.3, 0.75].forEach((f) => {
      ctx.beginPath();
      ctx.arc(0, -len * f, u * 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    // The bar being "played" lights up
    if (i === playing) {
      ctx.beginPath();
      ctx.roundRect(-barW / 2, -len, barW, len, u * 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();
    }
    ctx.restore();
  });

  // Crossed mallets above the crown
  const crossY = headTop(m) - u * 40;
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.translate(0, crossY);
    ctx.rotate(side * 0.6 + Math.sin(m.time * 6 + side) * 0.05);
    ctx.fillStyle = "#795548";
    ctx.fillRect(-u, -u * 22, u * 2, u * 44);
    ctx.beginPath();
    ctx.arc(0, -u * 24, u * 5.5, 0, Math.PI * 2);
    ctx.fillStyle = side < 0 ? "#FDD835" : "#FF9800";
    ctx.fill();
    ctx.restore();
  });

  // Mouth open → music notes float up
  if (m.mouthOpenRatio > 0.3) {
    for (let i = 0; i < 5; i++) {
      const p = (m.time * 0.7 + i / 5) % 1;
      const x = (i - 2) * u * 22 + Math.sin(p * 8 + i) * u * 6;
      const y = headTop(m) - u * 20 - p * u * 60;
      ctx.globalAlpha = 1 - p;
      drawNote(ctx, x, y, u * 5, BAR_COLORS[(i * 3) % count]);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
