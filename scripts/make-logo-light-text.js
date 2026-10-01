const sharp = require('sharp');
const path = require('path');

async function transformLogoGold() {
  const inputPath = path.join(__dirname, '..', 'public', 'images', 'unity101-21st-anniversary-logo.png');
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'unity101-21st-anniversary-logo-transparent.png');

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Pass 1: Identify mask of the UNITY 101 text letters (y: 380 to 445)
  const isTextLetter = new Uint8Array(info.width * info.height);

  for (let y = 380; y <= 445; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Original text is dark green/charcoal (r < 100, g < 115, b < 90)
      if (r < 105 && g < 120 && b < 95) {
        isTextLetter[y * info.width + x] = 1;
      }
    }
  }

  // Pass 2: Render crisp, radiant gold/light text with smooth gradient and 1px contrast edge
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // 1. Transparent background
      if (r > 240 && g > 240 && b > 240) {
        data[idx + 3] = 0;
        continue;
      } else if (r > 220 && g > 220 && b > 220) {
        const alphaFactor = (255 - Math.max(r, g, b)) / (255 - 220);
        data[idx + 3] = Math.round(a * alphaFactor);
        continue;
      }

      // 2. Text transformation for UNITY 101
      if (y >= 380 && y <= 445) {
        const isCore = isTextLetter[y * info.width + x] === 1;

        if (isCore) {
          // Radiant metallic gold/light gradient
          // Vertical progress across letter height (approx 392 to 438)
          const prog = Math.max(0, Math.min(1, (y - 392) / (438 - 392)));

          // Gradient: Top is bright radiant champagne/white gold (255, 248, 210),
          // Middle is rich metallic gold (245, 196, 81),
          // Bottom is deep warm gold (220, 160, 45)
          let tr, tg, tb;
          if (prog < 0.45) {
            const p = prog / 0.45;
            tr = Math.round(255 - (255 - 248) * p);
            tg = Math.round(250 - (250 - 215) * p);
            tb = Math.round(220 - (220 - 130) * p);
          } else {
            const p = (prog - 0.45) / 0.55;
            tr = Math.round(248 - (248 - 230) * p);
            tg = Math.round(215 - (215 - 175) * p);
            tb = Math.round(130 - (130 - 60) * p);
          }

          data[idx] = tr;
          data[idx + 1] = tg;
          data[idx + 2] = tb;
          data[idx + 3] = 255;
        } else if (r < 150 && g < 165 && b < 140) {
          // Soft edge blending
          const blend = (165 - g) / (165 - 110);
          data[idx] = Math.min(255, Math.round(r + (248 - r) * blend));
          data[idx + 1] = Math.min(255, Math.round(g + (205 - g) * blend));
          data[idx + 2] = Math.min(255, Math.round(b + (100 - b) * blend));
          data[idx + 3] = 255;
        }
      }
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

  console.log(`Saved logo with radiant gold/light text to: ${outputPath}`);
}

transformLogoGold().catch(console.error);
