import type { FaceMetrics } from "../faceMetrics";

export function drawQueenFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const w = m.faceWidth * 0.75;
  const crownBaseY = m.cy - m.faceHeight * 0.5;
  const crownH = m.faceHeight * 0.55;

  // Crown base band
  ctx.beginPath();
  ctx.rect(m.cx - w / 2, crownBaseY, w, 22);
  ctx.fillStyle = "#F9A825";
  ctx.fill();

  // Crown points (5 points)
  const points = 5;
  const pointColors = ["#FDD835", "#F9A825", "#FDD835", "#F9A825", "#FDD835"];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const px = m.cx - w / 2 + t * w;
    const topX = m.cx - w / 2 + (i + 0.5) / points * w;
    ctx.beginPath();
    ctx.moveTo(px, crownBaseY);
    ctx.lineTo(topX, crownBaseY - crownH * (0.6 + Math.sin(i * 1.2) * 0.3));
    ctx.lineTo(px + w / points, crownBaseY);
    ctx.fillStyle = pointColors[i];
    ctx.fill();
    ctx.strokeStyle = "#E65100";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Jewels on crown base
  const jewels: [number, string][] = [
    [m.cx - w * 0.35, "#E53935"],
    [m.cx, "#9C27B0"],
    [m.cx + w * 0.35, "#1976D2"],
    [m.cx - w * 0.15, "#4CAF50"],
    [m.cx + w * 0.15, "#FF9800"],
  ];
  jewels.forEach(([jx, color]) => {
    ctx.beginPath();
    ctx.arc(jx, crownBaseY + 11, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(jx - 2, crownBaseY + 8, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  });

  // Royal collar/ruff at neck
  const rufflY = m.cy + m.faceHeight * 0.5;
  const ruffleCount = 9;
  for (let i = 0; i < ruffleCount; i++) {
    const t = i / (ruffleCount - 1);
    const rx = m.cx - w * 0.65 + t * w * 1.3;
    ctx.beginPath();
    ctx.arc(rx, rufflY, 22, 0, Math.PI, true);
    ctx.fillStyle = i % 2 === 0 ? "#FFFDE7" : "#FFF9C4";
    ctx.fill();
    ctx.strokeStyle = "#F9A825";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Crown outline
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(m.cx - w / 2, crownBaseY, w, 22);

  ctx.restore();
}
