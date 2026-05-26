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
  const url = 'https://ha-smart-home.vercel.app/_next/static/chunks/app/dashboard/transactions/page-608245ea67d7720a.js';
  console.log(`Fetching ${url}...`);
  const content = await fetchUrl(url);
  console.log(`Content length: ${content.length}`);
  
  const tokens = ['house_wife_allowance', 'ar-EG-u-nu-latn', 'editOpen', 'handleOpenEdit', 'حفظ التعديلات'];
  for (const token of tokens) {
    if (content.includes(token)) {
      console.log(`FOUND '${token}' in the transactions page chunk!`);
    } else {
      console.log(`NOT FOUND '${token}' in the transactions page chunk!`);
    }
  }
}

main().catch(console.error);
