import type { FaceMetrics } from "../faceMetrics";
import { headTop, faceRx, crescentPath, drawStar } from "./shared";

export function drawMoonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const r = u * 24;
  const moonX = faceRx(m) * 0.95;
  const moonY = headTop(m) + u * 2;

  // Twinkling stars scattered around the head
  const stars: [number, number, number][] = [
    [-70, -60, 5],
    [-58, -95, 3.5],
    [-25, -110, 4.5],
    [20, -122, 3],
    [88, -40, 4],
    [78, -10, 2.8],
    [-80, -15, 3],
    [96, -95, 3.2],
  ];
  stars.forEach(([sx, sy, sr], i) => {
    const twinkle = 0.7 + Math.sin(m.time * 3 + i * 1.7) * 0.3;
    drawStar(ctx, sx * u, sy * u, sr * u * twinkle, "#FFF9C4", 0.45, i * 0.3);
  });

  ctx.save();
  ctx.translate(moonX, moonY);
  // Gentle rocking, like the moon is dozing on the child's head
  ctx.rotate(-0.35 + Math.sin(m.time * 1.2) * 0.08);

  // Soft glow
  const glow = ctx.createRadialGradient(-r * 0.3, 0, r * 0.3, -r * 0.3, 0, r * 1.6);
  glow.addColorStop(0, "rgba(255,249,196,0.25)");
  glow.addColorStop(1, "rgba(255,249,196,0)");
  ctx.beginPath();
  ctx.arc(-r * 0.3, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Crescent body, bite to the right so the "C" opens away from the face
  crescentPath(ctx, 0, 0, r, 0.45, 0);
  const moonGrad = ctx.createLinearGradient(-r, -r, 0, r);
  moonGrad.addColorStop(0, "#FFF9C4");
  moonGrad.addColorStop(1, "#FFD54F");
  ctx.fillStyle = moonGrad;
  ctx.fill();
  ctx.strokeStyle = "#F9A825";
  ctx.lineWidth = u * 1;
  ctx.stroke();

  // Craters
  ctx.fillStyle = "rgba(249,168,37,0.35)";
  [[-0.8, -0.45, 0.09], [-0.72, 0.55, 0.07]].forEach(([fx, fy, fr]) => {
    ctx.beginPath();
    ctx.arc(r * fx, r * fy, r * fr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sleepy closed eye
  ctx.beginPath();
  ctx.arc(-r * 0.66, -r * 0.18, r * 0.12, 0.15, Math.PI - 0.15);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = u * 1;
  ctx.lineCap = "round";
  ctx.stroke();

  // Rosy cheek
  ctx.beginPath();
  ctx.ellipse(-r * 0.74, r * 0.08, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,138,128,0.6)";
  ctx.fill();

  // Mouth: a little smile, or a big yawn when the child opens their mouth
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(-r * 0.62, r * 0.32, r * 0.08, r * 0.12 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#6D4C41";
    ctx.fill();
  } else {
    ctx.arc(-r * 0.66, r * 0.26, r * 0.09, 0.3, Math.PI - 0.3);
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = u * 0.9;
    ctx.stroke();
  }
  ctx.restore();

  // Floating "z"s while yawning
  if (m.mouthOpenRatio > 0.3) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [0, 1, 2].forEach((i) => {
      const t = (m.time * 0.6 + i / 3) % 1;
      ctx.globalAlpha = 1 - t;
      ctx.font = `bold ${u * (6 + i * 2)}px sans-serif`;
      ctx.fillText("z", moonX + r * 0.6 + t * u * 14, moonY - r * 0.6 - t * u * 22);
    });
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
