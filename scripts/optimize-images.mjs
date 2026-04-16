import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const IMG_DIR = 'public/images';
const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
const PNG_EFFORT = 4;

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await getFiles(full));
    else files.push(full);
  }
  return files;
}

async function optimize(file) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const before = (await stat(file)).size;
  const img = sharp(file);
  const meta = await img.metadata();

  let pipeline = sharp(file).rotate(); // preserve EXIF rotation

  // Resize if wider than MAX_WIDTH
  if (meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, effort: PNG_EFFORT });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();
  // Only overwrite if we actually saved space
  if (buf.length < before) {
    await sharp(buf).toFile(file);
    const after = buf.length;
    const pct = ((1 - after / before) * 100).toFixed(0);
    console.log(`${file}: ${fmt(before)} → ${fmt(after)} (−${pct}%)`);
    return { before, after };
  } else {
    console.log(`${file}: ${fmt(before)} (already optimal)`);
    return { before, after: before };
  }
}

function fmt(bytes) {
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + 'M';
  return (bytes / 1e3).toFixed(0) + 'K';
}

const files = await getFiles(IMG_DIR);
let totalBefore = 0, totalAfter = 0;

for (const f of files.sort()) {
  const result = await optimize(f);
  if (result) {
    totalBefore += result.before;
    totalAfter += result.after;
  }
}

console.log(`\nTotal: ${fmt(totalBefore)} → ${fmt(totalAfter)} (−${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
