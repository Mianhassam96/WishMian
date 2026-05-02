/**
 * Generates a minimal valid PNG favicon using pure Node.js (no dependencies)
 * Creates a 32x32 icon with WishMian branding colors
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import zlib from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// ── Minimal PNG encoder ──────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xffffffff;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function encodePNG(pixels, width, height) {
  // pixels: Uint8Array of RGBA values, row by row
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (we'll use RGBA → type 6)
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data with filter bytes
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Draw the icon ────────────────────────────────────────────────────────────

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outside circle → transparent
      if (dist > r - 0.5) {
        pixels[idx + 3] = 0;
        continue;
      }

      // Background: deep purple-black radial
      const t = dist / r;
      const bgR = Math.round(26 * (1 - t) + 5 * t);
      const bgG = Math.round(10 * (1 - t) + 5 * t);
      const bgB = Math.round(46 * (1 - t) + 10 * t);

      // Gold glow overlay
      const glowStrength = Math.max(0, 1 - t * 2.5) * 0.35;
      const glowR = Math.round(255 * glowStrength);
      const glowG = Math.round(215 * glowStrength);
      const glowB = Math.round(0 * glowStrength);

      let pr = Math.min(255, bgR + glowR);
      let pg = Math.min(255, bgG + glowG);
      let pb = Math.min(255, bgB + glowB);
      let pa = 255;

      // 4-point star shape
      const nx = dx / r;
      const ny = dy / r;
      const angle = Math.atan2(ny, nx);
      const starR = 0.55 * (0.5 + 0.5 * Math.pow(Math.abs(Math.cos(2 * angle)), 0.4));

      if (dist / r < starR) {
        // Star fill: gold gradient
        const starT = dist / r / starR;
        pr = Math.round(255 * (1 - starT * 0.2));
        pg = Math.round(215 + 40 * (1 - starT));
        pb = Math.round(0 + 160 * (1 - starT));
        pa = 255;
      }

      // Center white dot
      if (dist < r * 0.12) {
        const dotT = dist / (r * 0.12);
        pr = Math.round(255 * (1 - dotT) + pr * dotT);
        pg = Math.round(255 * (1 - dotT) + pg * dotT);
        pb = Math.round(255 * (1 - dotT) + pb * dotT);
      }

      // Corner sparkles
      const sparkles = [
        { sx: -0.5, sy: -0.5, sr: 0.1, r: 167, g: 139, b: 250 },
        { sx:  0.5, sy: -0.5, sr: 0.08, r: 255, g: 215, b: 0 },
        { sx: -0.5, sy:  0.5, sr: 0.07, r: 255, g: 215, b: 0 },
        { sx:  0.5, sy:  0.5, sr: 0.09, r: 167, g: 139, b: 250 },
      ];
      for (const sp of sparkles) {
        const sdx = nx - sp.sx;
        const sdy = ny - sp.sy;
        const sd = Math.sqrt(sdx * sdx + sdy * sdy);
        if (sd < sp.sr) {
          const st = sd / sp.sr;
          pr = Math.round(sp.r * (1 - st) + pr * st);
          pg = Math.round(sp.g * (1 - st) + pg * st);
          pb = Math.round(sp.b * (1 - st) + pb * st);
        }
      }

      // Anti-alias edge
      if (dist > r - 1.5) {
        pa = Math.round(255 * (r - dist));
      }

      pixels[idx]     = pr;
      pixels[idx + 1] = pg;
      pixels[idx + 2] = pb;
      pixels[idx + 3] = pa;
    }
  }

  return pixels;
}

// Generate sizes
for (const size of [32, 180, 192]) {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size, size);
  const name = size === 32 ? "favicon.png"
    : size === 180 ? "apple-touch-icon.png"
    : "icon-192.png";
  writeFileSync(resolve(publicDir, name), png);
  console.log(`✓ ${name} (${size}x${size})`);
}

console.log("✅ All favicons generated!");
