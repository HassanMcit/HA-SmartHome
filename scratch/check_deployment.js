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
  
  // Find all JS chunks
  const chunkRegex = /\/_next\/static\/chunks\/[a-zA-Z0-9\-\.\/]+\.js/g;
  const matches = landingHtml.match(chunkRegex) || [];
  const uniqueMatches = Array.from(new Set(matches));

  for (const chunkPath of uniqueMatches) {
    const chunkUrl = `https://ha-smart-home.vercel.app${chunkPath}`;
    const content = await fetchUrl(chunkUrl);
    
    if (content.includes('house_wife_allowance')) {
      console.log(`FOUND 'house_wife_allowance' (new category) in ${chunkPath}`);
    }
    if (content.includes('ar-EG-u-nu-latn')) {
      console.log(`FOUND 'ar-EG-u-nu-latn' (new locale) in ${chunkPath}`);
    }
  }
}

main().catch(console.error);
