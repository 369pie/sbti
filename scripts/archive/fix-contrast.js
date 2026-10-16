const fs = require('fs');

const files = [
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/result/[type]/SoultiResultContent.tsx',
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/report/[type]/SoultiDeepReportContent.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Headers (e.g. THREE MIRRORS, PERSONA, etc)
  content = content.replace(/text-text-muted\/80 uppercase/g, 'text-[#8b7355] opacity-80 uppercase');
  
  // Subtitles
  content = content.replace(/text-text-muted\/70 mb-8/g, 'text-text-secondary mb-8');
  content = content.replace(/text-text-muted\/70 mb-4/g, 'text-text-secondary mb-4');
  content = content.replace(/text-text-muted\/70 mb-10/g, 'text-text-secondary mb-10');
  
  // Card elements
  // {sub} labels (DAY SELF)
  content = content.replace(/text-text-muted\/70 uppercase mb-3/g, 'text-[#8b7355] opacity-70 uppercase mb-3');
  // Code (SRBFG)
  content = content.replace(/text-text-muted\/80 tracking-wider/g, 'text-text-secondary opacity-80 tracking-wider');
  // Tagline inside cards
  content = content.replace(/text-text-muted\/80 line-clamp-2/g, 'text-text-secondary opacity-90 line-clamp-2');
  // Bottom labels
  content = content.replace(/text-text-muted\/60 mt-2/g, 'text-text-secondary mt-2');
  content = content.replace(/text-text-muted\/60 mt-4/g, 'text-text-secondary mt-4');
  // Tension
  content = content.replace(/text-text-muted\/70 mt-6/g, 'text-text-secondary mt-6');
  
  // Deep Mirror teaser
  content = content.replace(/text-text-muted\/70 uppercase mb-4/g, 'text-[#8b7355] opacity-80 uppercase mb-4');
  content = content.replace(/text-text-muted\/80 mb-5/g, 'text-text-secondary/90 mb-5');
  
  // "your mirror", "your opposite"
  content = content.replace(/text-text-muted\/70 uppercase mb-4/g, 'text-[#8b7355] opacity-80 uppercase mb-4');
  
  // Poetic closing
  content = content.replace(/text-text-muted\/80/g, 'text-text-secondary');
  
  // Other small texts
  content = content.replace(/text-text-muted\/60/g, 'text-text-secondary');
  content = content.replace(/text-text-muted\/70/g, 'text-text-secondary');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed contrast in both files.');
