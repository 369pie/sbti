const fs = require('fs');

const files = [
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/result/[type]/SoultiResultContent.tsx',
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/report/[type]/SoultiDeepReportContent.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove opacity from text-primary for quotes
  content = content.replace(/text-text-primary\/80/g, 'text-text-primary');

  // Hardcode Three Mirrors headers for supreme clarity
  content = content.replace(/text-\[\#8b7355\] opacity-80 uppercase/g, 'text-[#8b7355] font-medium uppercase');
  
  // Subtitles
  content = content.replace(/text-text-secondary mb-8/g, 'text-[#7A6A5A] mb-8 font-medium');
  content = content.replace(/text-text-secondary mb-4/g, 'text-[#7A6A5A] mb-4 font-medium');
  content = content.replace(/text-text-secondary mb-10/g, 'text-[#7A6A5A] mb-10 font-medium');
  
  // Cards sub
  content = content.replace(/text-\[\#8b7355\] opacity-70 uppercase mb-3/g, 'text-[#8b7355] font-medium uppercase mb-3');
  
  // Personality Code
  content = content.replace(/text-text-secondary opacity-80 tracking-wider/g, 'text-text-secondary font-semibold tracking-wider');
  
  // Tagline inside cards
  content = content.replace(/text-text-secondary opacity-90 line-clamp-2/g, 'text-text-primary line-clamp-2 text-[12px] font-medium');
  
  // Bottom labels
  content = content.replace(/text-text-secondary mt-2/g, 'text-text-secondary font-medium mt-2');
  content = content.replace(/text-text-secondary mt-4/g, 'text-text-secondary font-medium mt-4');
  
  // Tension text
  content = content.replace(/text-text-secondary mt-6 leading-relaxed/g, 'text-text-primary opacity-90 mt-6 leading-relaxed');

  // Deep mirror teaser header
  content = content.replace(/text-\[\#8b7355\] opacity-80 uppercase mb-4/g, 'text-[#8b7355] font-medium uppercase mb-4');
  content = content.replace(/text-text-secondary\/90 mb-5/g, 'text-text-secondary font-medium mb-5');

  // Other components
  content = content.replace(/text-text-secondary/g, 'text-[#6A6054]'); // Replace all secondary with a slightly darker, warmer brown-gray
  
  // Specific fix for font weight adjustments
  content = content.replace(/text-\[\#6A6054\] opacity-80 tracking-wider/g, 'text-[#6A6054] font-semibold tracking-wider');
  content = content.replace(/text-text-primary font-medium/g, 'text-text-primary font-[500]');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Applied strong color fixes.');
