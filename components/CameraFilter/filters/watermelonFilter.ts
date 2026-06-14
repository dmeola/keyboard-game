import type { FaceMetrics } from "../faceMetrics";

export function drawWatermelonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const rx = m.faceWidth * 0.62;
  const ry = m.faceHeight * 0.58;

  // Green rind outer oval
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#4CAF50";
  ctx.fill();

  // Dark green stripe rings
  ctx.strokeStyle = "#2E7D32";
  ctx.lineWidth = 6;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(m.cx, m.cy, rx * (1 - i * 0.08), ry * (1 - i * 0.08), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // White rind band
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#F1F8E9";
  ctx.fill();

  // Pink flesh inner oval
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#EF9A9A";
  ctx.fill();

  // Darker pink center
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#EF5350";
  ctx.fill();

  // Black seed dots scattered in flesh
  const seeds: [number, number, number][] = [
    [-rx * 0.35, -ry * 0.25, -0.4],
    [rx * 0.3, -ry * 0.35, 0.3],
    [-rx * 0.15, ry * 0.32, 0.1],
    [rx * 0.42, ry * 0.18, -0.2],
    [-rx * 0.45, ry * 0.08, 0.5],
    [rx * 0.08, -ry * 0.48, -0.1],
    [-rx * 0.28, -ry * 0.48, 0.3],
    [rx * 0.5, -ry * 0.1, -0.4],
  ];
  ctx.fillStyle = "#212121";
  seeds.forEach(([sx, sy, angle]) => {
    ctx.save();
    ctx.translate(m.cx + sx, m.cy + sy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Smile on the flesh
  const smileY = m.cy + ry * 0.42;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(m.cx, smileY, rx * 0.22, ry * 0.12 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#B71C1C";
    ctx.fill();
  } else {
    ctx.arc(m.cx, smileY - ry * 0.06, rx * 0.2, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#B71C1C";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}
