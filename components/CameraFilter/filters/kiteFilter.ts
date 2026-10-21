import type { FaceMetrics } from "../faceMetrics";
import { headTop, chinY, faceRx } from "./shared";

export function drawKiteFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;

  // Kite flies above and to the right of the head; opening the mouth "blows"
  // it higher and makes it flutter faster
  const gust = m.mouthOpenRatio > 0.3 ? m.mouthOpenRatio : 0;
  const speed = 2 + gust * 4;
  const kx = faceRx(m) + u * 30 + Math.sin(m.time * 0.9) * u * 4;
  const ky = headTop(m) - u * 10 - gust * u * 12 + Math.sin(m.time * 1.3) * u * 3;
  const hw = u * 18;
  const hh = u * 26;
  const tilt = 0.25 + Math.sin(m.time * speed) * 0.08;

  // String from the kite down to beside the chin
  const handX = faceRx(m) + u * 12;
  const handY = chinY(m);
  ctx.beginPath();
  ctx.moveTo(kx, ky + hh * 0.2);
  ctx.quadraticCurveTo(kx + u * 18, (ky + handY) / 2, handX, handY);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = u * 0.8;
  ctx.stroke();

  ctx.save();
  ctx.translate(kx, ky);
  ctx.rotate(tilt);

  // Tail with fluttering bows
  const tailLen = u * 50;
  const tailPoint = (t: number) => ({
    x: Math.sin(m.time * speed + t * 5) * u * 6 * t,
    y: hh + t * tailLen,
  });
  ctx.beginPath();
  ctx.moveTo(0, hh);
  for (let i = 1; i <= 12; i++) {
    const p = tailPoint(i / 12);
    ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = "#FF6B63";
  ctx.lineWidth = u * 1;
  ctx.stroke();

  const bowColors = ["#FDD835", "#4FC3F7", "#FF6B88"];
  [0.3, 0.62, 0.95].forEach((t, i) => {
    const p = tailPoint(t);
    const flap = 0.4 + Math.sin(m.time * speed * 1.5 + i) * 0.25;
    ctx.fillStyle = bowColors[i];
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(p.x + side * u * 4, p.y, u * 4.5, u * 2.5, side * flap, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(p.x, p.y, u * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  });

  // Kite body: four coloured quadrants (top point is shorter, like a real kite)
  const top = -hh * 0.75;
  const quadColors = ["#FF9E98", "#FDD835", "#4FC3F7", "#A5D6A7"];
  const corners: [number, number][] = [
    [0, top],
    [hw, 0],
    [0, hh],
    [-hw, 0],
  ];
  corners.forEach(([x1, y1], i) => {
    const [x2, y2] = corners[(i + 1) % 4];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fillStyle = quadColors[i];
    ctx.fill();
  });

  // Border and cross spars
  ctx.beginPath();
  corners.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.strokeStyle = "#FF6B63";
  ctx.lineWidth = u * 1.4;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, top);
  ctx.lineTo(0, hh);
  ctx.moveTo(-hw, 0);
  ctx.lineTo(hw, 0);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = u * 0.9;
  ctx.stroke();

  ctx.restore();

  // Wind swirls when the child blows
  if (gust > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + gust * 0.4})`;
    ctx.lineWidth = u * 1.2;
    ctx.lineCap = "round";
    [0, 1, 2].forEach((i) => {
      const wy = ky + u * (i * 9 - 6);
      const wx = kx - hw - u * (14 + i * 4);
      ctx.beginPath();
      ctx.moveTo(wx - u * 12, wy);
      ctx.quadraticCurveTo(wx, wy - u * 4, wx + u * 6, wy);
      ctx.stroke();
    });
  }

  ctx.restore();
}
