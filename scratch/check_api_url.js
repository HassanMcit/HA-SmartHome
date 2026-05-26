const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const landingHtml = await fetchUrl('https://ha-smart-home.vercel.app/');
  
  // Find all JS chunks supporting folders
  const chunkRegex = /\/_next\/static\/chunks\/[a-zA-Z0-9\-\.\/]+\.js/g;
  const matches = landingHtml.match(chunkRegex) || [];
  const uniqueMatches = Array.from(new Set(matches));
  console.log('Found chunks:', uniqueMatches);

  for (const chunkPath of uniqueMatches) {
    const chunkUrl = `https://ha-smart-home.vercel.app${chunkPath}`;
    console.log(`Checking ${chunkUrl}...`);
    const content = await fetchUrl(chunkUrl);
    if (content.includes('localhost:5000')) {
      console.log(`  --> FOUND 'localhost:5000' in ${chunkPath}!`);
    }
    if (content.includes('home-mgmt-api.onrender.com')) {
      console.log(`  --> FOUND 'home-mgmt-api.onrender.com' in ${chunkPath}!`);
    }
  }
}

main().catch(console.error);
