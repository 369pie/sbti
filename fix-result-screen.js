const fs = require('fs');
let content = fs.readFileSync('src/app/xpti/result/[type]/XptiResultContent.tsx', 'utf8');
content = content.replace(/className="min-h-screen"/, `className="min-h-screen text-[#F3E8EB]" style={{ background: '#0D0608' }}`);
fs.writeFileSync('src/app/xpti/result/[type]/XptiResultContent.tsx', content, 'utf8');
