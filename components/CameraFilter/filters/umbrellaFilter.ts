import type { FaceMetrics } from "../faceMetrics";

export function drawUmbrellaFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.65;
  const domeBottomY = m.cy - m.faceHeight * 0.42;
  const domeCX = m.cx;
  const domeCY = domeBottomY;

  // Umbrella dome (filled semicircle)
  const colors = ["#AB47BC", "#7B1FA2", "#CE93D8", "#6A1B9A", "#BA68C8", "#9C27B0", "#E040FB", "#8E24AA"];
  const segCount = colors.length;
  for (let i = 0; i < segCount; i++) {
    const startAngle = Math.PI + (i / segCount) * Math.PI;
    const endAngle = Math.PI + ((i + 1) / segCount) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(domeCX, domeCY);
    ctx.arc(domeCX, domeCY, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
  }

  // Dome outline
  ctx.beginPath();
  ctx.arc(domeCX, domeCY, r, Math.PI, 0);
  ctx.strokeStyle = "#4A148C";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(domeCX - r, domeCY);
  ctx.lineTo(domeCX + r, domeCY);
  ctx.stroke();

  // Scalloped edge at dome bottom
  const scallopCount = 8;
  ctx.fillStyle = "#F3E5F5";
  for (let i = 0; i < scallopCount; i++) {
    const t = i / scallopCount;
    const sx = domeCX - r + t * r * 2 + r / scallopCount;
    ctx.beginPath();
    ctx.arc(sx, domeCY, r / scallopCount, 0, Math.PI);
    ctx.fill();
  }

  // Handle (curved line downward)
  ctx.beginPath();
  ctx.moveTo(domeCX, domeCY);
  ctx.lineTo(domeCX, domeCY + m.faceHeight * 1.0);
  ctx.bezierCurveTo(
    domeCX, domeCY + m.faceHeight * 1.1,
    domeCX + 35, domeCY + m.faceHeight * 1.1,
    domeCX + 35, domeCY + m.faceHeight * 0.95
  );
  ctx.strokeStyle = "#4A148C";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();

  // Rain drops falling around
  const drops: [number, number][] = [
    [m.cx - r * 0.7, domeBottomY + 40],
    [m.cx + r * 0.5, domeBottomY + 55],
    [m.cx - r * 0.2, domeBottomY + 70],
    [m.cx + r * 0.8, domeBottomY + 30],
    [m.cx - r * 0.9, domeBottomY + 65],
    [m.cx + r * 0.2, domeBottomY + 45],
  ];
  ctx.fillStyle = "#B3E5FC";
  drops.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.ellipse(dx, dy, 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
