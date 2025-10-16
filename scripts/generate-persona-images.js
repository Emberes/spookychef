const fs = require('fs');
const https = require('https');
const path = require('path');

const personasData = require('../data/personas_pool_iconic.json');

const outputDir = path.join(__dirname, '../public/personas');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generatePersonaImages() {
  console.log(`🎨 Skipping image generation as Pollinations.ai is no longer used.`);
  console.log(`Please ensure persona images are available in ${outputDir}`);

  for (const persona of personasData) {
    const filename = `${persona.id}.jpg`;
    // Assuming images are pre-existing or handled externally
    persona.imageUrl = `/personas/${filename}`; 
  }

  // Save updated personas JSON
  const outputJsonPath = path.join(__dirname, '../data/personas_pool_iconic_with_images.json');
  fs.writeFileSync(outputJsonPath, JSON.stringify(personasData, null, 2));
  console.log(`
✅ Done! Updated JSON saved to: personas_pool_iconic_with_images.json`);
  console.log(`📁 Images should be placed in: ${outputDir}`);
}

generatePersonaImages().catch(console.error);
