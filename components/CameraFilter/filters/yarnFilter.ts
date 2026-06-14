import type { FaceMetrics } from "../faceMetrics";

export function drawYarnFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.6;
  const cx = m.cx;
  const cy = m.cy;

  // Yarn ball base circle (fluffy background)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#FDD835";
  ctx.fill();

  // Wavy spiral yarn lines in pink/purple
  const yarnColors = ["#F48FB1", "#CE93D8", "#FF80AB", "#EA80FC", "#B39DDB"];
  const lineCount = 12;
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const color = yarnColors[i % yarnColors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();

    // Draw a wavy arc across the ball
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.moveTo(cx + cos * r * 0.95, cy + sin * r * 0.95);

    // Bezier with wobble
    const cp1x = cx + Math.cos(angle + 0.7) * r * 0.6;
    const cp1y = cy + Math.sin(angle + 0.7) * r * 0.6;
    const cp2x = cx + Math.cos(angle + 1.4) * r * 0.6;
    const cp2y = cy + Math.sin(angle + 1.4) * r * 0.6;
    const endX = cx + Math.cos(angle + Math.PI) * r * 0.95;
    const endY = cy + Math.sin(angle + Math.PI) * r * 0.95;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
  }

  // Additional wavy lines perpendicular
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2 + Math.PI / lineCount;
    const color = yarnColors[(i + 2) % yarnColors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    const cos = Math.cos(angle + Math.PI / 4);
    const sin = Math.sin(angle + Math.PI / 4);
    ctx.moveTo(cx + cos * r * 0.9, cy + sin * r * 0.9);
    ctx.bezierCurveTo(
      cx + Math.cos(angle + 1.0) * r * 0.4,
      cy + Math.sin(angle + 1.0) * r * 0.4,
      cx + Math.cos(angle + 2.0) * r * 0.4,
      cy + Math.sin(angle + 2.0) * r * 0.4,
      cx + Math.cos(angle + Math.PI + Math.PI / 4) * r * 0.9,
      cy + Math.sin(angle + Math.PI + Math.PI / 4) * r * 0.9
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Loose yarn tail dangling from bottom-right
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.65, cy + r * 0.65);
  ctx.bezierCurveTo(cx + r * 0.9, cy + r * 1.1, cx + r * 0.5, cy + r * 1.4, cx + r * 0.7, cy + r * 1.7);
  ctx.strokeStyle = "#F48FB1";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Ball border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#E91E63";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}
