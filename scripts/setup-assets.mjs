import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const wasmDest = path.join(rootDir, 'public', 'wasm');
const fontsDest = path.join(rootDir, 'public', 'fonts');

// Files to copy from node_modules
const wasmFiles = [
  {
    src: 'node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
    dest: 'typst_ts_web_compiler_bg.wasm'
  },
  {
    src: 'node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
    dest: 'typst_ts_renderer_bg.wasm'
  }
];

// Fonts to download for offline compilation
const fontsToDownload = [
  {
    url: 'https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf',
    dest: 'Roboto-Regular.ttf'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function setupAssets() {
  console.log('Setting up assets (WASM + Fonts)...');

  // Create directories
  [wasmDest, fontsDest].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Copy WASM
  for (const file of wasmFiles) {
    const srcPath = path.join(rootDir, file.src);
    const destPath = path.join(wasmDest, file.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file.dest}`);
    } else {
      console.warn(`WARNING: Missing source file ${srcPath}`);
    }
  }

  // Download Fonts (if not already downloaded)
  for (const font of fontsToDownload) {
    const destPath = path.join(fontsDest, font.dest);
    if (!fs.existsSync(destPath)) {
      console.log(`Downloading font: ${font.dest}...`);
      try {
        await downloadFile(font.url, destPath);
        console.log(`Downloaded: ${font.dest}`);
      } catch (err) {
        console.error(`Failed to download ${font.dest}:`, err);
      }
    } else {
      console.log(`Font already exists: ${font.dest}`);
    }
  }

  console.log('Assets setup complete.');
}

setupAssets().catch(console.error);
