import type { FaceMetrics } from "../faceMetrics";
import { faceRx } from "./shared";

export function drawOrangeFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const eyeGap = Math.abs(m.rightEye.x - m.leftEye.x);
  const R = Math.min(u * 18, eyeGap * 0.45);

  // Surprised glasses hop up a little when the mouth opens
  const hop = m.mouthOpenRatio > 0.3 ? -u * 3 * m.mouthOpenRatio : 0;
  const lenses = [m.leftEye, m.rightEye].map((e) => ({ x: e.x, y: e.y + hop }));

  // Arms back to the sides of the head
  ctx.strokeStyle = "#EF6C00";
  ctx.lineWidth = u * 2;
  ctx.lineCap = "round";
  lenses.forEach((p, i) => {
    const side = i === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(p.x + side * R, p.y);
    ctx.lineTo(side * faceRx(m) * 1.02, p.y - u * 2);
    ctx.stroke();
  });

  // Bridge between the lenses
  ctx.beginPath();
  ctx.moveTo(lenses[0].x + R * 0.95, lenses[0].y - R * 0.2);
  ctx.quadraticCurveTo(
    (lenses[0].x + lenses[1].x) / 2, Math.min(lenses[0].y, lenses[1].y) - R * 0.55,
    lenses[1].x - R * 0.95, lenses[1].y - R * 0.2
  );
  ctx.lineWidth = u * 2.6;
  ctx.stroke();

  lenses.forEach((p) => {
    const ring = (outer: number, inner: number, fill: string) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, outer, 0, Math.PI * 2);
      ctx.arc(p.x, p.y, inner, 0, Math.PI * 2, true);
      ctx.fillStyle = fill;
      ctx.fill("evenodd");
    };

    // See-through orange tint so the eyes stay visible
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,183,77,0.18)";
    ctx.fill();

    // Peel rim and white pith
    ring(R, R * 0.82, "#FB8C00");
    ring(R * 0.82, R * 0.72, "#FFF3E0");

    // Segment tips just inside the pith — kept away from the pupil
    ctx.strokeStyle = "rgba(255,243,224,0.75)";
    ctx.lineWidth = u * 0.8;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(a) * R * 0.52, p.y + Math.sin(a) * R * 0.52);
      ctx.lineTo(p.x + Math.cos(a) * R * 0.72, p.y + Math.sin(a) * R * 0.72);
      ctx.stroke();
    }

    // Peel dimples
    ctx.fillStyle = "rgba(230,81,0,0.45)";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      ctx.beginPath();
      ctx.arc(p.x + Math.cos(a) * R * 0.91, p.y + Math.sin(a) * R * 0.91, u * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lens shine
    ctx.beginPath();
    ctx.arc(p.x - R * 0.35, p.y - R * 0.35, R * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  });

  // Little stem and leaf on top of the left lens
  const top = lenses[0];
  const sx = top.x + R * 0.2;
  const sy = top.y - R;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + u * 1, sy - u * 4);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = u * 1.2;
  ctx.stroke();
  ctx.save();
  ctx.translate(sx + u * 1, sy - u * 4);
  ctx.rotate(-0.5 + Math.sin(m.time * 2) * 0.12);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(u * 5, -u * 5, u * 11, 0);
  ctx.quadraticCurveTo(u * 5, u * 4, 0, 0);
  ctx.fillStyle = "#43A047";
  ctx.fill();
  ctx.restore();

  // Juice drops spray out when the mouth opens
  if (m.mouthOpenRatio > 0.3) {
    ctx.fillStyle = "#FFA726";
    [-1, 1].forEach((side) => {
      [0, 1].forEach((i) => {
        const t = (m.time * 1.5 + i * 0.5) % 1;
        const p = lenses[side < 0 ? 0 : 1];
        const dx = p.x + side * (R + u * (4 + t * 12));
        const dy = p.y - R * 0.6 + t * u * 10 - i * u * 4;
        ctx.globalAlpha = 1 - t;
        ctx.beginPath();
        ctx.arc(dx, dy, u * 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
