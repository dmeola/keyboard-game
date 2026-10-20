import type { FaceMetrics } from "../faceMetrics";
import { browY, faceRx, headTop } from "./shared";

function seed(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.7, 0, 0, size * 0.8);
  ctx.quadraticCurveTo(-size * 0.7, 0, 0, -size);
  ctx.fillStyle = "#212121";
  ctx.fill();
  ctx.restore();
}

/** Half-slice helmet: rind on top, cut face (red flesh) toward the camera */
function drawHelmet(ctx: CanvasRenderingContext2D, m: FaceMetrics): void {
  const u = m.u;
  const bottom = browY(m) - u * 2;
  const rx = faceRx(m) * 1.2;
  const ry = bottom - (headTop(m) - u * 12);

  const dome = (scale: number) => {
    ctx.beginPath();
    ctx.ellipse(0, bottom, rx * scale, ry * scale, 0, Math.PI, 0);
    ctx.closePath();
  };

  // Green rind with dark stripes
  dome(1);
  ctx.fillStyle = "#43A047";
  ctx.fill();
  ctx.save();
  dome(1);
  ctx.clip();
  ctx.strokeStyle = "#1B5E20";
  ctx.lineWidth = u * 3;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * u * 14, bottom);
    ctx.quadraticCurveTo(i * u * 18, bottom - ry * 0.6, i * u * 10, bottom - ry * 1.1);
    ctx.stroke();
  }
  ctx.restore();

  // White rind, then the red flesh
  dome(0.9);
  ctx.fillStyle = "#F1F8E9";
  ctx.fill();
  dome(0.82);
  const flesh = ctx.createRadialGradient(0, bottom, 0, 0, bottom, ry * 0.82);
  flesh.addColorStop(0, "#E53935");
  flesh.addColorStop(1, "#EF9A9A");
  ctx.fillStyle = flesh;
  ctx.fill();

  // Seeds
  ([[-0.45, 0.3, -0.4], [-0.2, 0.55, 0.2], [0.1, 0.35, -0.1], [0.38, 0.5, 0.35], [0.55, 0.22, 0.5], [-0.6, 0.15, -0.6], [0, 0.7, 0]] as const)
    .forEach(([fx, fy, a]) => seed(ctx, fx * rx * 0.8, bottom - fy * ry * 0.82, u * 3, a));

  // Neat edge where the helmet meets the forehead
  ctx.beginPath();
  ctx.moveTo(-rx, bottom);
  ctx.lineTo(rx, bottom);
  ctx.strokeStyle = "#2E7D32";
  ctx.lineWidth = u * 2.5;
  ctx.lineCap = "round";
  ctx.stroke();
}

/** A wedge held beside the face — opening the mouth takes a chomp out of it */
function drawSlice(ctx: CanvasRenderingContext2D, m: FaceMetrics): void {
  const u = m.u;
  const open = m.mouthOpenRatio > 0.3;
  const tipX = faceRx(m) + u * 6 - (open ? m.mouthOpenRatio * u * 4 : 0);
  const tipY = m.mouth.y;
  const r = u * 40;
  const spread = 0.45;

  ctx.save();
  if (open) {
    // Clip away bite marks near the tip without erasing the video
    ctx.beginPath();
    ctx.rect(tipX - u * 10, tipY - r, r * 1.5, r * 2);
    [[8, -5], [12, 3], [7, 9]].forEach(([bx, by]) => {
      const cx = tipX + u * bx;
      const cy = tipY + u * by;
      ctx.moveTo(cx + u * 7, cy);
      ctx.arc(cx, cy, u * 7, 0, Math.PI * 2, true);
    });
    ctx.clip("evenodd");
  }

  const wedge = (scale: number) => {
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.arc(tipX, tipY, r * scale, -spread, spread);
    ctx.closePath();
  };
  wedge(1);
  ctx.fillStyle = "#43A047";
  ctx.fill();
  wedge(0.92);
  ctx.fillStyle = "#F1F8E9";
  ctx.fill();
  wedge(0.86);
  ctx.fillStyle = "#EF5350";
  ctx.fill();
  [[0.5, -0.2], [0.65, 0.15], [0.35, 0.05], [0.75, -0.05]].forEach(([d, a]) =>
    seed(ctx, tipX + Math.cos(a) * r * d, tipY + Math.sin(a) * r * d, u * 2.2, Math.PI / 2 + a)
  );
  ctx.restore();

  // Juice drops fly off on a chomp
  if (open) {
    ctx.fillStyle = "#E53935";
    for (let i = 0; i < 4; i++) {
      const p = (m.time * 2 + i / 4) % 1;
      ctx.globalAlpha = 1 - p;
      ctx.beginPath();
      ctx.arc(tipX + u * (6 + i * 3) + p * u * 10, tipY - u * 6 - p * u * 18 + p * p * u * 24, u * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function drawWatermelonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  drawHelmet(ctx, m);
  drawSlice(ctx, m);
  ctx.restore();
}
