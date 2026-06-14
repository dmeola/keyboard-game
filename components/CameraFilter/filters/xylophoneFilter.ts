import type { FaceMetrics } from "../faceMetrics";

export function drawXylophoneFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const barColors = ["#E53935", "#FF9800", "#FDD835", "#4CAF50", "#2196F3", "#9C27B0", "#FF4081", "#00BCD4"];
  const barCount = barColors.length;
  const totalW = m.faceWidth * 1.25;
  const barH = 22;
  const barSpacing = 6;
  const startY = m.cy - m.faceHeight * 0.52;

  // Draw bars at different heights (staggered) behind the face
  barColors.forEach((color, i) => {
    const t = i / (barCount - 1);
    // Bars get shorter from left to right (like a real xylophone)
    const barW = totalW * (1 - t * 0.28) / barCount;
    const bx = m.cx - totalW / 2 + i * (totalW / barCount + barSpacing * 0.3);
    const by = startY + i * (barH + barSpacing) * 0.3;

    // Bar shadow
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + 5 + i * 3, barW, barH, 4);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Bar body
    ctx.beginPath();
    ctx.roundRect(bx, by + i * 3, barW, barH, 4);
    ctx.fillStyle = color;
    ctx.fill();

    // Shine on top of bar
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + i * 3 + 3, barW * 0.5, barH * 0.35, 3);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
  });

  // Two crossed mallets above the bars
  const malletHeadR = 10;
  const malletColors = ["#FDD835", "#FF9800"];
  const malletAngles = [-Math.PI * 0.35, Math.PI * 0.35];
  malletAngles.forEach((angle, i) => {
    const handleLen = 70;
    const headX = m.cx + (i === 0 ? -40 : 40);
    const headY = m.cy - m.faceHeight * 0.7;
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(angle);
    // Handle
    ctx.beginPath();
    ctx.rect(-3, malletHeadR, 6, handleLen);
    ctx.fillStyle = "#795548";
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(0, 0, malletHeadR, 0, Math.PI * 2);
    ctx.fillStyle = malletColors[i];
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}
