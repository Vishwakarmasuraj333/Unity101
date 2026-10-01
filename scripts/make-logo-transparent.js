const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '..', 'public', 'images', 'unity101-21st-anniversary-logo.png');
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'unity101-21st-anniversary-logo-transparent.png');

  // Load image, ensure alpha channel, make near-white pixels transparent
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is near-white (background of the logo)
    if (r > 242 && g > 242 && b > 242) {
      data[i + 3] = 0; // Transparent
    } else if (r > 225 && g > 225 && b > 225) {
      // Smooth edge antialiasing
      const alphaFactor = (255 - Math.max(r, g, b)) / (255 - 225);
      data[i + 3] = Math.round(data[i + 3] * alphaFactor);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent logo to: ${outputPath}`);
}

processLogo().catch(console.error);
