const https = require('https');

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const headers = { 'User-Agent': 'Node.js' };
  const responseText = await fetchUrl('https://api.github.com/repos/HassanMcit/HA-SmartHome/commits/main', headers);
  const commit = JSON.parse(responseText);
  console.log('GitHub Latest Commit SHA:', commit.sha);
  console.log('GitHub Latest Commit Message:', commit.commit.message);
  console.log('GitHub Latest Commit Date:', commit.commit.author.date);
}

main().catch(console.error);
