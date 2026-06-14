import type { FaceMetrics } from "../faceMetrics";

export function drawKiteFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const hw = m.faceWidth * 0.62;
  const hh = m.faceHeight * 0.68;

  const topY = m.cy - hh;
  const botY = m.cy + hh;
  const leftX = m.cx - hw;
  const rightX = m.cx + hw;

  // Fill quadrants with different colors
  const quadColors = ["#FF9E98", "#FDD835", "#4FC3F7", "#A5D6A7"];
  const quads: [number, number, number, number][] = [
    [m.cx, topY, rightX, m.cy],
    [rightX, m.cy, m.cx, botY],
    [m.cx, botY, leftX, m.cy],
    [leftX, m.cy, m.cx, topY],
  ];

  quads.forEach(([x1, y1, x2, y2], i) => {
    ctx.beginPath();
    ctx.moveTo(m.cx, m.cy);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fillStyle = quadColors[i];
    ctx.fill();
  });

  // Kite border
  ctx.beginPath();
  ctx.moveTo(m.cx, topY);
  ctx.lineTo(rightX, m.cy);
  ctx.lineTo(m.cx, botY);
  ctx.lineTo(leftX, m.cy);
  ctx.closePath();
  ctx.strokeStyle = "#FF6B63";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cross ribbons
  ctx.beginPath();
  ctx.moveTo(m.cx, topY);
  ctx.lineTo(m.cx, botY);
  ctx.moveTo(leftX, m.cy);
  ctx.lineTo(rightX, m.cy);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tail with bows
  ctx.beginPath();
  ctx.moveTo(m.cx, botY);
  ctx.bezierCurveTo(m.cx + 30, botY + 30, m.cx - 20, botY + 60, m.cx + 10, botY + 90);
  ctx.strokeStyle = "#FF6B63";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bows on tail
  const bowColors = ["#FDD835", "#4FC3F7", "#FF6B88"];
  const bowPositions: [number, number][] = [[0, 30], [10, 60], [-5, 90]];
  bowPositions.forEach(([bx, by], i) => {
    ctx.beginPath();
    ctx.ellipse(m.cx + bx - 8, botY + by, 9, 5, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = bowColors[i % bowColors.length];
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(m.cx + bx + 8, botY + by, 9, 5, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = bowColors[i % bowColors.length];
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.cx + bx, botY + by, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  });

  ctx.restore();
}
