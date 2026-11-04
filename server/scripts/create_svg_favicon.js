const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '../public/favicon.png');
const svgPath = path.join(__dirname, '../public/favicon.svg');

try {
  const pngData = fs.readFileSync(pngPath);
  const base64Png = pngData.toString('base64');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="128" height="128" xlink:href="data:image/png;base64,${base64Png}" />
</svg>`;

  fs.writeFileSync(svgPath, svgContent);
  console.log('Successfully created favicon.svg from favicon.png');
} catch (error) {
  console.error('Error creating SVG:', error);
}
