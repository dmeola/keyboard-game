import type { FaceMetrics } from "../faceMetrics";
import { faceOvalSubpath, faceRx, faceRy, fillWithFaceHole, headTop } from "./shared";

export function drawZebraFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const ovalY = m.faceHeight * 0.02;
  const hoodRx = faceRx(m) * 1.4;
  const hoodRy = faceRy(m) * 1.28;
  const hood = () => ctx.ellipse(0, ovalY, hoodRx, hoodRy, 0, 0, Math.PI * 2);

  // Striped hood with the child's face showing through
  fillWithFaceHole(ctx, m, hood, "#FAFAFA");
  ctx.save();
  ctx.beginPath();
  hood();
  faceOvalSubpath(ctx, m);
  ctx.clip("evenodd");
  ctx.fillStyle = "#212121";
  for (let i = -6; i <= 6; i++) {
    const x = i * u * 15;
    ctx.beginPath();
    ctx.moveTo(x - u * 4, ovalY - hoodRy);
    ctx.bezierCurveTo(x + u * 10, ovalY - hoodRy * 0.4, x - u * 10, ovalY + hoodRy * 0.3, x + u * 2, ovalY + hoodRy);
    ctx.lineTo(x + u * 8, ovalY + hoodRy);
    ctx.bezierCurveTo(x - u * 4, ovalY + hoodRy * 0.3, x + u * 16, ovalY - hoodRy * 0.4, x + u * 3, ovalY - hoodRy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.beginPath();
  hood();
  ctx.strokeStyle = "#212121";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();

  // Faint cheek stripes, outside the eyes and mouth
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#212121";
  ctx.lineWidth = u * 3;
  ctx.lineCap = "round";
  [-1, 1].forEach((side) => {
    for (let i = 0; i < 3; i++) {
      const y = m.nose.y - u * 4 + i * u * 8;
      ctx.beginPath();
      ctx.moveTo(side * faceRx(m) * 0.95, y);
      ctx.quadraticCurveTo(side * faceRx(m) * 0.82, y + u * 2, side * faceRx(m) * 0.7, y - u);
      ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;

  // Ears — they perk up when the mouth opens
  const perk = m.mouthOpenRatio > 0.3 ? m.mouthOpenRatio : 0;
  const earY = headTop(m) - u * 12;
  [-1, 1].forEach((side) => {
    ctx.save();
    ctx.translate(side * u * 32, earY);
    ctx.rotate(side * (0.4 - perk * 0.3));
    const h = u * (22 + perk * 6);
    ctx.beginPath();
    ctx.ellipse(0, 0, u * 11, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FAFAFA";
    ctx.fill();
    ctx.lineWidth = u * 3;
    ctx.strokeStyle = "#212121";
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, u * 2, u * 6, h * 0.65, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#F8BBD0";
    ctx.fill();
    // Black ear tip
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.75, u * 6, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    ctx.restore();
  });

  // Spiky striped mane standing up between the ears
  const maneBase = headTop(m) - u * 2;
  const maneTop = maneBase - u * 30;
  const mane = () => {
    ctx.beginPath();
    ctx.moveTo(-u * 14, maneBase);
    for (let i = 0; i <= 6; i++) {
      const x = -u * 14 + (i / 6) * u * 28;
      const spikeY = maneTop + (i % 2 === 0 ? 0 : u * 7) + Math.sin(m.time * 3 + i) * u;
      ctx.lineTo(x, spikeY);
    }
    ctx.lineTo(u * 14, maneBase);
    ctx.closePath();
  };
  mane();
  ctx.fillStyle = "#FAFAFA";
  ctx.fill();
  ctx.save();
  mane();
  ctx.clip();
  ctx.fillStyle = "#212121";
  for (let y = maneTop - u * 4; y < maneBase; y += u * 10) {
    ctx.fillRect(-u * 16, y, u * 32, u * 5);
  }
  ctx.restore();
  mane();
  ctx.strokeStyle = "#212121";
  ctx.lineWidth = u * 1.2;
  ctx.stroke();

  ctx.restore();
}
