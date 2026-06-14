import type { FaceMetrics } from "../faceMetrics";

export function drawGrapesFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const gr = m.faceWidth * 0.18; // grape radius

  // Grape cluster positions relative to face center
  const positions: [number, number][] = [
    [0, 0],
    [-gr * 1.8, -gr * 0.6],
    [gr * 1.8, -gr * 0.6],
    [-gr * 3.4, gr * 0.4],
    [0, -gr * 1.8],
    [gr * 3.4, gr * 0.4],
    [-gr * 1.8, gr * 1.6],
    [gr * 1.8, gr * 1.6],
    [0, gr * 2.8],
    [-gr * 3.6, -gr * 1.4],
    [gr * 3.6, -gr * 1.4],
  ];

  // Shadows first
  positions.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(m.cx + dx + 3, m.cy + dy + 3, gr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(106,27,154,0.3)";
    ctx.fill();
  });

  // Grapes
  positions.forEach(([dx, dy]) => {
    const grad = ctx.createRadialGradient(
      m.cx + dx - gr * 0.25, m.cy + dy - gr * 0.25, gr * 0.05,
      m.cx + dx, m.cy + dy, gr
    );
    grad.addColorStop(0, "#CE93D8");
    grad.addColorStop(1, "#6A1B9A");
    ctx.beginPath();
    ctx.arc(m.cx + dx, m.cy + dy, gr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });

  // Stem
  const stemTopY = m.cy - m.faceHeight * 0.55;
  ctx.beginPath();
  ctx.moveTo(m.cx, m.cy - gr * 2.8);
  ctx.bezierCurveTo(m.cx + 5, stemTopY + 10, m.cx - 5, stemTopY + 5, m.cx, stemTopY);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Green leaf
  ctx.beginPath();
  ctx.moveTo(m.cx, stemTopY);
  ctx.bezierCurveTo(m.cx + 35, stemTopY - 20, m.cx + 40, stemTopY + 15, m.cx + 15, stemTopY + 10);
  ctx.bezierCurveTo(m.cx + 5, stemTopY + 8, m.cx, stemTopY + 4, m.cx, stemTopY);
  ctx.fillStyle = "#4CAF50";
  ctx.fill();

  ctx.restore();
}
