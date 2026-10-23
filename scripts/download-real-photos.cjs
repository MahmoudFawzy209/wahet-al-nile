const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const downloads = [
  {
    name: 'hero-yemeni-feast.jpg',
    dir: path.join(__dirname, '..', 'public', 'images'),
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'mandi-meat.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'mandi-chicken.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'zurbian-meat.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'haneeth-meat.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'madhbi-chicken.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'saltah.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'fahsa.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'tasa-meat.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'soup-meat.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'shafout.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'malawah.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'areeka.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'masoub.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'aden-tea.jpg',
    dir: path.join(__dirname, '..', 'public', 'images', 'dishes'),
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
  }
];

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const handleResponse = (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        https.get(res.headers.location, handleResponse).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${fileUrl}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
    };

    https.get(fileUrl, handleResponse).on('error', reject);
  });
}

async function run() {
  console.log('Downloading real authentic food photographs...');
  for (const item of downloads) {
    if (!fs.existsSync(item.dir)) {
      fs.mkdirSync(item.dir, { recursive: true });
    }
    const dest = path.join(item.dir, item.name);
    try {
      await downloadFile(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`✓ Downloaded ${item.name} (${Math.round(stat.size / 1024)} KB)`);
    } catch (e) {
      console.error(`✗ Error downloading ${item.name}:`, e.message);
    }
  }
  console.log('All food photography downloaded successfully!');
}

run();
