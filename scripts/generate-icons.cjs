const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG generator for RGBA buffers
function createPNG(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression method 0
  ihdr.writeUInt8(0, 11); // filter method 0
  ihdr.writeUInt8(0, 12); // interlace method 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // Filter: None
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    srcOffset += width * 4;
    dstOffset += width * 4;
  }

  // IDAT chunk (compressed scanlines)
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

// Render the OmniLaunch Vector Emblem into RGBA pixel buffer
function renderOmniLaunchIcon(size) {
  const buf = Buffer.alloc(size * size * 4, 0); // Transparent black RGBA

  const cx = size / 2;
  const cy = size / 2;

  // Helper to blend a color with anti-aliasing
  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    const existingA = buf[idx + 3] / 255;
    const newA = a / 255;
    const outA = newA + existingA * (1 - newA);
    if (outA <= 0) return;

    buf[idx] = Math.round((r * newA + buf[idx] * existingA * (1 - newA)) / outA);
    buf[idx + 1] = Math.round((g * newA + buf[idx + 1] * existingA * (1 - newA)) / outA);
    buf[idx + 2] = Math.round((b * newA + buf[idx + 2] * existingA * (1 - newA)) / outA);
    buf[idx + 3] = Math.round(outA * 255);
  }

  // Draw smooth icon geometry
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - cx) / (size / 2); // -1 to 1
      const ny = (y - cy) / (size / 2); // -1 to 1
      const dist = Math.sqrt(nx * nx + ny * ny);

      // 1. Orbital Ring (Left / Right arcs)
      const ringDist = Math.abs(dist - 0.72);
      if (ringDist < 0.18) {
        const ringAlpha = Math.max(0, 1 - ringDist / 0.18) * 0.85;
        // Cyan-to-Emerald gradient
        const t = (ny + 1) / 2;
        const r = Math.round(16 + 43 * (1 - t));
        const g = Math.round(185 + 2 * t);
        const b = Math.round(129 + 85 * (1 - t));
        setPixel(x, y, r, g, b, Math.round(ringAlpha * 255));
      }

      // 2. Central Supersonic Jet / Chevron
      // Tip at (0, -0.85), bottom wings at (-0.6, 0.55) and (0.6, 0.55), bottom indent at (0, 0.25)
      const tipY = -0.82;
      const wingY = 0.55;
      const indentY = 0.25;

      if (ny >= tipY && ny <= wingY) {
        const progressY = (ny - tipY) / (wingY - tipY);
        const maxWidth = progressY * 0.65;
        if (Math.abs(nx) <= maxWidth) {
          // Check bottom indent
          const bottomProgress = Math.abs(nx) / 0.65;
          const cutoffY = indentY + (wingY - indentY) * bottomProgress;
          if (ny <= cutoffY) {
            // Gradient color from Tip (Emerald #10b981) to Wings (Cyan #06b6d4 / Electric Blue #3b82f6)
            const t = progressY;
            const isRightSide = nx > 0;
            const r = isRightSide ? Math.round(6 + 53 * t) : Math.round(16 + 20 * t);
            const g = isRightSide ? Math.round(182 + 30 * t) : Math.round(185 - 20 * t);
            const b = isRightSide ? Math.round(212 + 30 * t) : Math.round(129 + 115 * t);
            setPixel(x, y, r, g, b, 255);
          }
        }
      }

      // 3. Engine Exhaust / Flame Tail (0, 0.45) to (0, 0.9)
      if (ny >= 0.4 && ny <= 0.88) {
        const flameProg = (ny - 0.4) / 0.48;
        const flameWidth = (1 - flameProg) * 0.22;
        if (Math.abs(nx) <= flameWidth) {
          const r = Math.round(16 + (240 - 16) * (1 - flameProg));
          const g = Math.round(185 + (255 - 185) * (1 - flameProg));
          const b = Math.round(129 + (255 - 129) * (1 - flameProg));
          setPixel(x, y, r, g, b, 240);
        }
      }

      // 4. Glowing Quantum Core Star at center (0, -0.15)
      const coreDx = nx - 0;
      const coreDy = ny - (-0.12);
      const coreDist = Math.sqrt(coreDx * coreDx + coreDy * coreDy);
      if (coreDist < 0.16) {
        const coreAlpha = Math.max(0, 1 - coreDist / 0.16);
        setPixel(x, y, 255, 255, 255, Math.round(coreAlpha * 255));
      }
    }
  }

  return buf;
}

// Generate ICO format file containing multiple icon sizes
function createICO(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  let offset = 6 + pngBuffers.length * 16;
  const dirEntries = [];

  for (const item of pngBuffers) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // Width
    dir.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // Height
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(item.buffer.length, 8); // Size of image data
    dir.writeUInt32LE(offset, 12); // Offset of image data
    dirEntries.push(dir);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

// Generate all required icons
const publicDir = path.join(__dirname, '../public');
const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

// 1. Tray Icon PNG (32x32)
const trayBuf = renderOmniLaunchIcon(32);
const trayPNG = createPNG(32, 32, trayBuf);
fs.writeFileSync(path.join(publicDir, 'tray-icon.png'), trayPNG);

// 2. 64x64 PNG
const buf64 = renderOmniLaunchIcon(64);
const png64 = createPNG(64, 64, buf64);

// 3. High-res Icon PNG (256x256)
const iconBuf256 = renderOmniLaunchIcon(256);
const iconPNG256 = createPNG(256, 256, iconBuf256);
fs.writeFileSync(path.join(publicDir, 'icon.png'), iconPNG256);
fs.writeFileSync(path.join(buildDir, 'icon.png'), iconPNG256);

// 4. Windows .ICO file (containing 32, 64, 256)
const icoBuffer = createICO([
  { size: 32, buffer: trayPNG },
  { size: 64, buffer: png64 },
  { size: 256, buffer: iconPNG256 },
]);
fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);

console.log('✅ Generated crisp transparent icons:');
console.log(' - public/tray-icon.png (32x32)');
console.log(' - public/icon.png (256x256)');
console.log(' - public/icon.ico (Windows multi-res ICO)');
console.log(' - build/icon.ico');
