const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../public/logo_understory_authentic.png');
  const { data, info } = await sharp(logoPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Extract tree emblem (canopy + trunk)
  const treeBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isCanopy = (y <= 360 && x >= 300 && x <= 1260);
      const isTrunk = (y > 360 && y <= 490 && x >= 650 && x <= 830);
      if (isCanopy || isTrunk) {
        treeBuffer[idx] = data[idx];
        treeBuffer[idx + 1] = data[idx + 1];
        treeBuffer[idx + 2] = data[idx + 2];
        treeBuffer[idx + 3] = data[idx + 3];
      }
    }
  }

  const trimmedTree = await sharp(treeBuffer, { raw: { width, height, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  const treeMeta = await sharp(trimmedTree).metadata();
  console.log('Trimmed tree emblem size:', treeMeta.width, 'x', treeMeta.height);

  const size = 512;
  const maxDim = Math.max(treeMeta.width, treeMeta.height);
  const targetTreeWidth = Math.round(treeMeta.width * (size * 0.85) / maxDim);
  const targetTreeHeight = Math.round(treeMeta.height * (size * 0.85) / maxDim);

  const resizedTree = await sharp(trimmedTree)
    .resize(targetTreeWidth, targetTreeHeight, { fit: 'contain' })
    .toBuffer();

  const icon512 = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: resizedTree, gravity: 'center' }])
  .png()
  .toBuffer();

  // Next.js App Router metadata icon conventions
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), icon512);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), icon512);
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), icon512);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), icon512);
  
  // Favicon.ico 32x32 & 48x48
  const ico32 = await sharp(icon512).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), ico32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), ico32);

  console.log('All Favicons and App icons created successfully!');
}

generateFavicon().catch(console.error);
