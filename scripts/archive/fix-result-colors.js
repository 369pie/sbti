const fs = require('fs');

let content = fs.readFileSync('src/app/xpti/result/[type]/XptiResultContent.tsx', 'utf8');

// The dark void background
const VOID_BG = '#0D0608';
const CARD_BG = '#1A0C11';

// Replace container bg 
// If it wraps the whole thing in a min-h-screen:
if (!content.includes('bg-['+VOID_BG+']')) {
    // try to find the outmost div
    // Well, XptiResultContent may return something wrapped in <div className="min-h-screen
    content = content.replace(/className="min-h-screen bg-bg-primary"/g, `className="min-h-screen" style={{ background: '${VOID_BG}', color: '#F3E8EB' }}`);
}

// Replace card backgrounds
content = content.replace(/bg-bg-elevated/g, `bg-[${CARD_BG}] backdrop-blur-xl border-[#A3526E]/20`);
content = content.replace(/bg-bg-secondary\/60/g, `bg-[#20181A]/60`);
content = content.replace(/bg-bg-secondary/g, `bg-[#20181A]`);
content = content.replace(/bg-bg-tertiary/g, `bg-[#3D1A25]/50`); // For the radar/bar chart background

// Replace text colors
content = content.replace(/text-text-muted/g, `text-[#A38A90]`);
content = content.replace(/text-text-secondary/g, `text-[#D4C5C9]`);
content = content.replace(/text-text-primary/g, `text-[#F3E8EB]`);

// Replace borders
content = content.replace(/border-border-subtle/g, `border-[#A3526E]/15`);
content = content.replace(/border border-border/g, `border border-[#A3526E]/30`);

// Decorative gradients
content = content.replace(/bg-gradient-to-t from-bg-primary/g, `bg-gradient-to-t from-[#0D0608] via-[#0D0608]/80 to-transparent`);
content = content.replace(/bg-gradient-to-t from-bg-primary via-bg-primary/g, `bg-gradient-to-t from-[#0D0608] via-[#0D0608]/90`);

fs.writeFileSync('src/app/xpti/result/[type]/XptiResultContent.tsx', content, 'utf8');
console.log('Colors replaced in XptiResultContent.tsx');
