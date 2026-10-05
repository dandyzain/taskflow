// Renders the TaskFlow logo SVG into PNG assets (apple icon, PWA icons, preview).
// Usage: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const svg = await readFile(path.join(root, 'app', 'icon.svg'), 'utf8');

// Full-bleed variant (no rounded corners) for iOS / maskable icons — the OS applies its own mask.
const fullBleed = svg.replace(/rx="18"/g, 'rx="0"');

async function render(source, size, out) {
  await mkdir(path.dirname(out), { recursive: true });
  const buf = await sharp(Buffer.from(source), { density: 72 * (size / 64) * 1.5 })
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(out, buf);
  console.log('✓', path.relative(root, out), `${size}x${size}`);
}

await render(fullBleed, 180, path.join(root, 'app', 'apple-icon.png'));
await render(svg, 192, path.join(root, 'public', 'icon-192.png'));
await render(svg, 512, path.join(root, 'public', 'icon-512.png'));
await render(fullBleed, 512, path.join(root, 'public', 'icon-maskable-512.png'));

if (process.argv[2]) {
  await render(svg, 256, path.resolve(process.argv[2]));
}
