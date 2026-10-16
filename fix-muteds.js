const fs = require('fs');
const files = [
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/result/[type]/SoultiResultContent.tsx',
  '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/report/[type]/SoultiDeepReportContent.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-text-muted/g, 'text-[#7A6A5A] font-medium');  
  fs.writeFileSync(file, content, 'utf8');
});
