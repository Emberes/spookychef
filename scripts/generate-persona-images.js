const fs = require('fs');
const https = require('https');
const path = require('path');

const personasData = require('../data/personas_pool_iconic.json');

const outputDir = path.join(__dirname, '../public/personas');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function generatePersonaImages() {
  console.log(`🎨 Generating images for ${personasData.length} personas...`);

  for (const persona of personasData) {
    const movieContext = persona.origin || persona.movieImdbUrl;
    const prompt = `Portrait of ${persona.displayName} from ${movieContext}, horror movie character, cinematic lighting, high quality, professional photography`;
    
    // Generate square portrait image (512x512 for profile pics)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&enhance=true`;
    
    const filename = `${persona.id}.jpg`;
    const filepath = path.join(outputDir, filename);
    
    console.log(`⏳ Generating ${persona.displayName}...`);
    
    try {
      await downloadImage(imageUrl, filepath);
      console.log(`✅ Saved: ${filename}`);
      
      // Update persona object with image path
      persona.imageUrl = `/personas/${filename}`;
      
      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to generate ${persona.displayName}:`, error.message);
    }
  }

  // Save updated personas JSON
  const outputJsonPath = path.join(__dirname, '../data/personas_pool_iconic_with_images.json');
  fs.writeFileSync(outputJsonPath, JSON.stringify(personasData, null, 2));
  console.log(`\n✅ Done! Updated JSON saved to: personas_pool_iconic_with_images.json`);
  console.log(`📁 Images saved to: ${outputDir}`);
}

generatePersonaImages().catch(console.error);
