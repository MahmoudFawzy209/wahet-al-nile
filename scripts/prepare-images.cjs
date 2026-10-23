const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', 'public', 'images', 'dishes');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const dishes = [
  { name: 'mandi-meat.jpg', title: 'مندي لحم بلدي', color: '#854d0e', icon: '🍖' },
  { name: 'mandi-chicken.jpg', title: 'مندي دجاج مدخن', color: '#b45309', icon: '🍗' },
  { name: 'zurbian-meat.jpg', title: 'زربيان عدني', color: '#9a3412', icon: '🥘' },
  { name: 'haneeth-meat.jpg', title: 'حنيذ تهامي فاخر', color: '#7c2d12', icon: '🥩' },
  { name: 'madhbi-chicken.jpg', title: 'مظبي على الحجر', color: '#c2410c', icon: '🔥' },
  { name: 'saltah.jpg', title: 'سلتة صنعانية فوارة', color: '#15803d', icon: '🍲' },
  { name: 'fahsa.jpg', title: 'فحسة لحم مدعوسة', color: '#991b1b', icon: '🥣' },
  { name: 'tasa-meat.jpg', title: 'طاسة جملية باللحم', color: '#b91c1c', icon: '🍳' },
  { name: 'soup-meat.jpg', title: 'شوربة لحم يمنية', color: '#a16207', icon: '🍲' },
  { name: 'shafout.jpg', title: 'شفوت يمني باللحوح', color: '#166534', icon: '🥗' },
  { name: 'malawah.jpg', title: 'خبز ملوح يمني بالتنور', color: '#d97706', icon: '🫓' },
  { name: 'areeka.jpg', title: 'عريكة ملكية بالقشطة', color: '#78350f', icon: '🍯' },
  { name: 'masoub.jpg', title: 'معصوب ملكي بالموز', color: '#92400e', icon: '🍌' },
  { name: 'aden-tea.jpg', title: 'شاي عدني بالحليب والهيل', color: '#b45309', icon: '☕' }
];

// Create responsive SVG for each dish
dishes.forEach(d => {
  const filePath = path.join(dir, d.name.replace('.jpg', '.svg'));
  const jpgFallback = path.join(dir, d.name);
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
    <defs>
      <radialGradient id="grad-${d.name}" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stop-color="#2a1d13" />
        <stop offset="100%" stop-color="#140d07" />
      </radialGradient>
      <linearGradient id="glow-${d.name}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${d.color}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#eab308" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${d.name})" />
    <circle cx="400" cy="270" r="180" fill="url(#glow-${d.name})" filter="blur(20px)" opacity="0.35" />
    <circle cx="400" cy="270" r="150" fill="#23170e" stroke="${d.color}" stroke-width="4" stroke-dasharray="12 8" />
    <circle cx="400" cy="270" r="130" fill="#1b120b" stroke="#f59e0b" stroke-width="2" />
    <text x="400" y="295" font-size="90" text-anchor="middle" dominant-baseline="middle">${d.icon}</text>
    <rect x="150" y="440" width="500" height="70" rx="35" fill="#1e130a" stroke="${d.color}" stroke-width="2" />
    <text x="400" y="485" font-family="'Cairo', 'Tajawal', sans-serif" font-size="28" font-weight="bold" fill="#fef3c7" text-anchor="middle">${d.title}</text>
    <text x="400" y="550" font-family="'Cairo', 'Tajawal', sans-serif" font-size="18" fill="#d97706" text-anchor="middle">مطعم واحة النيل • أصل المذاق اليمني</text>
  </svg>`;

  fs.writeFileSync(filePath, svgContent, 'utf8');
  // Also create .jpg alias so both extensions work seamlessly
  fs.writeFileSync(jpgFallback, svgContent, 'utf8');
});

// Also create hero image
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="heroGrad" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#2d1d11" />
      <stop offset="70%" stop-color="#180e07" />
      <stop offset="100%" stop-color="#0c0703" />
    </radialGradient>
    <pattern id="patternYemeni" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="#d97706" stroke-width="0.7" opacity="0.15" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#heroGrad)" />
  <rect width="100%" height="100%" fill="url(#patternYemeni)" />
  <circle cx="800" cy="450" r="380" fill="#b45309" opacity="0.15" filter="blur(60px)" />
  <text x="800" y="420" font-family="'Cairo', 'Tajawal', sans-serif" font-size="140" text-anchor="middle">🍖 🥘 🫓</text>
  <text x="800" y="560" font-family="'Cairo', 'Tajawal', sans-serif" font-size="52" font-weight="900" fill="#fef3c7" text-anchor="middle">ولائم المندي والحنيذ اليمني الأصيل</text>
  <text x="800" y="630" font-family="'Cairo', 'Tajawal', sans-serif" font-size="26" fill="#f59e0b" text-anchor="middle">مطعم واحة النيل • طهي على الحطب والتنور التقليدي</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'images', 'hero-yemeni-feast.jpg'), heroSvg, 'utf8');

console.log('Dish and Hero visuals generated successfully.');
