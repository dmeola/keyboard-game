import type { FaceMetrics } from "../faceMetrics";

export function drawRainbowFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const arcCX = m.cx;
  const arcCY = m.cy + m.faceHeight * 0.1;
  const outerR = m.faceWidth * 1.05;
  const colors = ["#FF3D33", "#FF9800", "#FDD835", "#4CAF50", "#2196F3", "#9C27B0"];
  const bandW = 16;

  // Rainbow arcs (only top half — arch above head)
  colors.forEach((color, i) => {
    const r = outerR - i * bandW;
    ctx.beginPath();
    ctx.arc(arcCX, arcCY, r, Math.PI, 0);
    ctx.arc(arcCX, arcCY, r - bandW + 1, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Left cloud
  drawCloud(ctx, m.cx - outerR + 10, arcCY - 10, 50);
  // Right cloud
  drawCloud(ctx, m.cx + outerR - 10, arcCY - 10, 50);

  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.45, cy + r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - r * 0.4, cy + r * 0.15, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.1, cy + r * 0.35, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}
