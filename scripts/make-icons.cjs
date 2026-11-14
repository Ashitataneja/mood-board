/**
 * Generates public/favicon.svg (Work's face), public/apple-touch-icon.png and
 * public/og.png (the crowd, 1200×630). Needs the dev server on :5173.
 *   node scripts/make-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const pub = path.join(__dirname, '..', 'public');

// --- favicon: the squircle (n≈4.2) with Work's intense face ---
function squircle(n, w, h, steps = 96) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t),
      s = Math.sin(t);
    const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push(`${(w / 2 + (x * w) / 2).toFixed(2)} ${(h / 2 + (y * h) / 2).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
const W = 64,
  E = 0.27 * W,
  gap = 0.32 * E,
  ey = 0.36 * W;
const lx = W / 2 - gap / 2 - E / 2,
  rx = W / 2 + gap / 2 + E / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}">
  <path d="${squircle(4.2, W, W)}" fill="#2B4BF2"/>
  <circle cx="${lx}" cy="${ey}" r="${E / 2}" fill="#fff"/><circle cx="${rx}" cy="${ey}" r="${E / 2}" fill="#fff"/>
  <circle cx="${lx}" cy="${ey + 1}" r="${(E / 2) * 0.56}" fill="#1B1A17"/><circle cx="${rx}" cy="${ey + 1}" r="${(E / 2) * 0.56}" fill="#1B1A17"/>
  <path d="M${W / 2 - E * 0.65} ${ey + E * 1.15} L${W / 2 + E * 0.65} ${ey + E * 1.15}" stroke="#F2E8D5" stroke-width="3.4" stroke-linecap="round"/>
</svg>
`;
fs.writeFileSync(path.join(pub, 'favicon.svg'), svg);

(async () => {
  const b = await chromium.launch();
  // apple-touch-icon: the face on night, 180×180
  const i = await b.newPage({ viewport: { width: 180, height: 180 } });
  await i.setContent(`<body style="margin:0;background:#141414;display:grid;place-items:center;height:180px">
    <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="148" height="148"></body>`);
  await i.screenshot({ path: path.join(pub, 'apple-touch-icon.png') });

  // og.png: the crowd, eyes looking up at the name
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:5173/?noaxe', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: '[aria-haspopup=dialog]{display:none!important}' });
  await p.mouse.move(520, 40);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(pub, 'og.png') });
  await b.close();
  console.log('wrote favicon.svg, apple-touch-icon.png, og.png');
})();
