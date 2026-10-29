import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const source = 'public/brand/glossary-logo.png';
const sizes = [16,32,48];
const pngs = await Promise.all(sizes.map(size => sharp(source).resize(size,size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
let offset = header.length;
for (let i=0;i<sizes.length;i++) {
  const entry=6+i*16; header[entry]=sizes[i]; header[entry+1]=sizes[i];
  header.writeUInt16LE(1,entry+4); header.writeUInt16LE(32,entry+6);
  header.writeUInt32LE(pngs[i].length,entry+8); header.writeUInt32LE(offset,entry+12);
  offset += pngs[i].length;
}
await writeFile('app/favicon.ico',Buffer.concat([header,...pngs]));
await sharp(source).resize(192,192).png().toFile('app/icon.png');
await sharp(source).resize(180,180).png().toFile('app/apple-icon.png');
await writeFile('public/brand/favicon-32.png',pngs[1]);
console.log('Created favicon.ico (16,32,48px), icon.png (192px), apple-icon.png (180px).');
