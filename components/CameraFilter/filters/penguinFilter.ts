import type { FaceMetrics } from "../faceMetrics";
import { chinY, faceRx, faceRy, faceOvalSubpath, fillWithFaceHole } from "./shared";

export function drawPenguinFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const hoodRx = faceRx(m) * 1.42;
  const hoodRy = faceRy(m) * 1.3;
  const hoodCY = -u * 6;
  const hoodOutline = () => {
    ctx.moveTo(hoodRx, hoodCY);
    ctx.ellipse(0, hoodCY, hoodRx, hoodRy, 0, 0, Math.PI * 2);
  };

  // Flippers beside the chin, flapping (faster when the mouth opens)
  const flapSpeed = m.mouthOpenRatio > 0.3 ? 12 : 3;
  [-1, 1].forEach((side) => {
    const flap = Math.sin(m.time * flapSpeed + (side > 0 ? Math.PI : 0)) * 0.18;
    ctx.save();
    ctx.translate(side * hoodRx * 0.92, chinY(m) - u * 4);
    ctx.rotate(-side * (0.55 + flap));
    ctx.beginPath();
    ctx.ellipse(0, u * 14, u * 8, u * 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0D1B6E";
    ctx.fill();
    ctx.restore();
  });

  // Navy hood around the head, face showing through
  const hoodGrad = ctx.createRadialGradient(-hoodRx * 0.3, hoodCY - hoodRy * 0.4, u * 5, 0, hoodCY, hoodRy);
  hoodGrad.addColorStop(0, "#303F9F");
  hoodGrad.addColorStop(1, "#1A237E");
  fillWithFaceHole(ctx, m, hoodOutline, hoodGrad, 1.02);

  // White cheek patches on the hood, clipped so they never cover the face
  ctx.save();
  ctx.beginPath();
  hoodOutline();
  faceOvalSubpath(ctx, m, 1.02);
  ctx.clip("evenodd");
  ctx.fillStyle = "#ECEFF1";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(side * faceRx(m) * 1.02, u * 14, u * 12, u * 34, side * -0.15, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Hood shine
  ctx.beginPath();
  ctx.ellipse(-hoodRx * 0.45, hoodCY - hoodRy * 0.62, u * 12, u * 6, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();

  // Small orange beak on the nose; the lower half drops open with the mouth
  const bx = m.nose.x;
  const by = m.nose.y + u * 1;
  const open = m.mouthOpenRatio > 0.3 ? m.mouthOpenRatio : 0;
  if (open > 0) {
    ctx.beginPath();
    ctx.moveTo(bx - u * 4.5, by + u * 1.5);
    ctx.lineTo(bx + u * 4.5, by + u * 1.5);
    ctx.lineTo(bx, by + u * (4 + 6 * open));
    ctx.closePath();
    ctx.fillStyle = "#E65100";
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(bx - u * 5, by - u * 1);
  ctx.quadraticCurveTo(bx, by - u * 4, bx + u * 5, by - u * 1);
  ctx.lineTo(bx, by + u * (4 - open * 1.5));
  ctx.closePath();
  ctx.fillStyle = "#FF8F00";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx - u * 1.5, by - u * 1.2, u * 1.4, u * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  // Red bow tie under the chin
  const tieY = chinY(m) + u * 8;
  ctx.fillStyle = "#E53935";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(0, tieY);
    ctx.lineTo(side * u * 12, tieY - u * 6);
    ctx.quadraticCurveTo(side * u * 14, tieY, side * u * 12, tieY + u * 6);
    ctx.closePath();
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(0, tieY, u * 2.6, 0, Math.PI * 2);
  ctx.fillStyle = "#B71C1C";
  ctx.fill();

  ctx.restore();
}
