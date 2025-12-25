/**
 * Generate PWA icons with correct dimensions
 * Run with: node scripts/generate-icons.js
 *
 * Creates simple solid-color PNG icons for PWA installability.
 * These are placeholder icons - replace with real branding later.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Simple PNG encoder (no external dependencies)
function createPNG(width, height) {
	// PNG signature
	const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

	// IHDR chunk
	const ihdrData = Buffer.alloc(13);
	ihdrData.writeUInt32BE(width, 0);
	ihdrData.writeUInt32BE(height, 4);
	ihdrData[8] = 8; // bit depth
	ihdrData[9] = 2; // color type (RGB)
	ihdrData[10] = 0; // compression
	ihdrData[11] = 0; // filter
	ihdrData[12] = 0; // interlace
	const ihdr = createChunk('IHDR', ihdrData);

	// IDAT chunk (image data)
	// Create raw image data: each row starts with filter byte (0), then RGB pixels
	const rowSize = 1 + width * 3; // filter byte + RGB for each pixel
	const rawData = Buffer.alloc(rowSize * height);

	for (let y = 0; y < height; y++) {
		const rowStart = y * rowSize;
		rawData[rowStart] = 0; // filter: none

		for (let x = 0; x < width; x++) {
			const pixelStart = rowStart + 1 + x * 3;

			// Create a simple "TT" pattern or solid color
			// For simplicity, create a blue square with white "T" shapes
			const inLeftT =
				x >= width * 0.15 &&
				x <= width * 0.45 &&
				((y >= height * 0.2 && y <= height * 0.35) || // top bar
					(x >= width * 0.27 && x <= width * 0.33 && y <= height * 0.8)); // stem
			const inRightT =
				x >= width * 0.55 &&
				x <= width * 0.85 &&
				((y >= height * 0.2 && y <= height * 0.35) || // top bar
					(x >= width * 0.67 && x <= width * 0.73 && y <= height * 0.8)); // stem

			if (inLeftT || inRightT) {
				// White for "TT"
				rawData[pixelStart] = 255;
				rawData[pixelStart + 1] = 255;
				rawData[pixelStart + 2] = 255;
			} else {
				// Blue background (#1e40af)
				rawData[pixelStart] = 30;
				rawData[pixelStart + 1] = 64;
				rawData[pixelStart + 2] = 175;
			}
		}
	}

	const compressedData = zlib.deflateSync(rawData, { level: 9 });
	const idat = createChunk('IDAT', compressedData);

	// IEND chunk
	const iend = createChunk('IEND', Buffer.alloc(0));

	return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);

	const typeBuffer = Buffer.from(type, 'ascii');
	const crcData = Buffer.concat([typeBuffer, data]);
	const crc = crc32(crcData);

	const crcBuffer = Buffer.alloc(4);
	crcBuffer.writeUInt32BE(crc >>> 0, 0);

	return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation for PNG
function crc32(data) {
	let crc = 0xffffffff;
	const table = getCRC32Table();

	for (let i = 0; i < data.length; i++) {
		crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}

	return crc ^ 0xffffffff;
}

let crc32Table = null;
function getCRC32Table() {
	if (crc32Table) return crc32Table;

	crc32Table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		crc32Table[i] = c;
	}
	return crc32Table;
}

// Generate icons
console.log('Generating PWA icons...\n');

const iconsDir = path.join(ROOT, 'static', 'icons');
if (!fs.existsSync(iconsDir)) {
	fs.mkdirSync(iconsDir, { recursive: true });
}

// 192x192 icon
const icon192 = createPNG(192, 192);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);
console.log('✅ Created static/icons/icon-192.png (192x192)');

// 512x512 icon
const icon512 = createPNG(512, 512);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);
console.log('✅ Created static/icons/icon-512.png (512x512)');

// Apple touch icon (180x180 recommended)
const appleTouchIcon = createPNG(180, 180);
fs.writeFileSync(path.join(ROOT, 'static', 'apple-touch-icon.png'), appleTouchIcon);
console.log('✅ Created static/apple-touch-icon.png (180x180)');

console.log('\n✅ All icons generated successfully!');
console.log('   These are placeholder icons with "TT" on blue background.');
console.log('   Replace with real branding when ready.');
