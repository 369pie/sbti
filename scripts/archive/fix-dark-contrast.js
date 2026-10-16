const fs = require('fs');

const files = [
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/result/[type]/SoultiResultContent.tsx',
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/report/[type]/SoultiDeepReportContent.tsx',
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/SoultiLandingContent.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Upgrade Dark Card Background
  // Before: style={{ background: '#1C1B19' }} OR <div ... style={{ background: '#1C1B19' }}>
  content = content.replace(
    /style=\{\{\s*background:\s*['"]#1C1B19['"]\s*\}\}/g,
    `style={{ background: 'linear-gradient(145deg, #2A2520 0%, #1A1715 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(36, 33, 29, 0.1)', border: '1px solid rgba(255, 255, 255, 0.05)' }}`
  );

  // 2. Fix opacity of texts on dark backgrounds (making them way more readable)
  content = content.replace(/rgba\(255,255,255,0\.25\)/g, 'rgba(255,255,255,0.45)');
  content = content.replace(/rgba\(255,255,255,0\.3\)/g, 'rgba(255,255,255,0.45)');
  content = content.replace(/rgba\(255,255,255,0\.30\)/g, 'rgba(255,255,255,0.45)');
  content = content.replace(/rgba\(255,255,255,0\.35\)/g, 'rgba(255,255,255,0.55)');
  content = content.replace(/rgba\(255,255,255,0\.45\)/g, 'rgba(255,255,255,0.7)');
  content = content.replace(/rgba\(255,255,255,0\.5\)/g, 'rgba(255,255,255,0.65)');
  content = content.replace(/rgba\(255,255,255,0\.55\)/g, 'rgba(255,255,255,0.75)');
  content = content.replace(/rgba\(255,255,255,0\.60\)/g, 'rgba(255,255,255,0.8)');
  content = content.replace(/rgba\(255,255,255,0\.9\)/g, 'rgba(255,255,255,0.95)');

  // 3. For the SBTI → SoulTI arrow specifically, it might have been 0.15
  content = content.replace(/rgba\(255,255,255,0\.15\)/g, 'rgba(255,255,255,0.3)');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed dark cards in all files.');
