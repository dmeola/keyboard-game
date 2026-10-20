import type { FaceMetrics } from "../faceMetrics";
import { foreheadY, chinY, drawSparkle } from "./shared";

export function drawQueenFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const w = u * 72;
  const bandH = u * 10;
  // Crown band sits just above the hairline
  const bandTop = foreheadY(m) - u * 8 - bandH;
  const crownH = u * 32;

  // Crown points
  const points = 5;
  const pointColors = ["#FDD835", "#F9A825", "#FDD835", "#F9A825", "#FDD835"];
  const tips: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const px = -w / 2 + (i / points) * w;
    const tipX = px + w / points / 2;
    const tipY = bandTop - crownH * (i === 2 ? 1 : i % 2 === 1 ? 0.75 : 0.6);
    tips.push([tipX, tipY]);
    ctx.beginPath();
    ctx.moveTo(px, bandTop + u * 0.5);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(px + w / points, bandTop + u * 0.5);
    ctx.closePath();
    ctx.fillStyle = pointColors[i];
    ctx.fill();
    ctx.strokeStyle = "#E65100";
    ctx.lineWidth = u * 0.8;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  // Pearls on each tip
  tips.forEach(([tx, ty]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, u * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFDE7";
    ctx.fill();
    ctx.strokeStyle = "#F9A825";
    ctx.lineWidth = u * 0.5;
    ctx.stroke();
  });

  // Crown band
  ctx.beginPath();
  ctx.rect(-w / 2, bandTop, w, bandH);
  const bandGrad = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH);
  bandGrad.addColorStop(0, "#FFD54F");
  bandGrad.addColorStop(1, "#F9A825");
  ctx.fillStyle = bandGrad;
  ctx.fill();
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = u * 1;
  ctx.stroke();

  // Jewels on the band
  const jewels: [number, string][] = [
    [-0.35, "#E53935"],
    [-0.17, "#4CAF50"],
    [0, "#9C27B0"],
    [0.17, "#FF9800"],
    [0.35, "#1976D2"],
  ];
  jewels.forEach(([fx, color]) => {
    const jx = fx * w;
    const jy = bandTop + bandH / 2;
    ctx.beginPath();
    ctx.arc(jx, jy, u * 3.2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(jx - u * 1, jy - u * 1.1, u * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fill();
  });

  // Twinkle on the tallest point; extra sparkle when the mouth opens
  const twinkle = 0.6 + Math.sin(m.time * 4) * 0.4;
  drawSparkle(ctx, tips[2][0] + u * 6, tips[2][1] - u * 2, u * 5 * twinkle);
  if (m.mouthOpenRatio > 0.3) {
    drawSparkle(ctx, tips[0][0] - u * 5, tips[0][1] - u * 3, u * 6 * m.mouthOpenRatio);
    drawSparkle(ctx, tips[4][0] + u * 5, tips[4][1] - u * 3, u * 6 * m.mouthOpenRatio);
  }

  // Royal ruff collar under the chin: two scalloped rows
  const ruffY = chinY(m) + u * 6;
  const ruffleR = u * 9;
  [
    { count: 9, spread: 1.3, y: ruffY + u * 5, fill: "#FFF9C4" },
    { count: 8, spread: 1.1, y: ruffY, fill: "#FFFDE7" },
  ].forEach(({ count, spread, y, fill }) => {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const rx = -w * spread * 0.5 + t * w * spread;
      ctx.beginPath();
      ctx.arc(rx, y, ruffleR, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "#F9A825";
      ctx.lineWidth = u * 0.5;
      ctx.stroke();
    }
  });

  ctx.restore();
}
