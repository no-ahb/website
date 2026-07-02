// Pre-render waveform peaks for the audio players' hairline-envelope seekbars.
// Decodes each public/audio/*.mp3 with macOS afconvert (no npm decoder dependency),
// takes per-bucket peak amplitude, and writes src/data/audio-peaks.json, which
// AudioPlayer.astro reads at build time. Run after adding or replacing audio:
//   npm run generate-peaks
// The JSON is committed, so CI never needs afconvert.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const BUCKETS = 400;
const files = readdirSync('public/audio').filter((f) => f.endsWith('.mp3')).sort();
const out = {};

for (const f of files) {
  const tmp = mkdtempSync(join(tmpdir(), 'peaks-'));
  try {
    const wav = join(tmp, 'x.wav');
    execFileSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@22050', '-c', '1', join('public/audio', f), wav]);
    const buf = readFileSync(wav);
    // Locate the WAVE 'data' chunk (afconvert may emit extra chunks before it).
    let off = 12, dataOff = -1, dataLen = 0;
    while (off + 8 <= buf.length) {
      const id = buf.toString('ascii', off, off + 4);
      const len = buf.readUInt32LE(off + 4);
      if (id === 'data') { dataOff = off + 8; dataLen = Math.min(len, buf.length - dataOff); break; }
      off += 8 + len + (len % 2);
    }
    if (dataOff < 0) throw new Error('no data chunk');
    const n = Math.floor(dataLen / 2);
    const per = Math.max(1, Math.floor(n / BUCKETS));
    const peaks = [];
    for (let b = 0; b < BUCKETS; b++) {
      let m = 0;
      const s1 = Math.min(n, b * per + per);
      for (let s = b * per; s < s1; s += 4) {   // stride-4 sampling is plenty for a peak estimate
        const v = Math.abs(buf.readInt16LE(dataOff + s * 2));
        if (v > m) m = v;
      }
      peaks.push(m / 32768);
    }
    const max = Math.max(...peaks, 0.001);
    // sqrt lifts quiet ambient detail so soft pieces don't render as a flat sliver.
    out['/audio/' + f] = peaks.map((p) => +Math.sqrt(p / max).toFixed(3));
    console.log(`  ${f}: ${peaks.length} buckets`);
  } catch (e) {
    console.warn(`  ${f}: skipped (${e.message})`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/audio-peaks.json', JSON.stringify(out));
console.log(`peaks for ${Object.keys(out).length}/${files.length} file(s) → src/data/audio-peaks.json`);
