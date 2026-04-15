const fs = require('fs');

let content = fs.readFileSync('src/app/xpti/XptiHomeContent.tsx', 'utf8');

// The dark void background
const VOID_BG = '#0D0608';
const CARD_BG = '#1A0C11';
const TEXT_MUTED = '#8C7A80';
const TEXT_NORMAL = '#D4C5C9';
const TEXT_HIGHLIGHT = '#E6CDD5';
const AMBIENT_GLOW_RED = 'rgba(222, 49, 99, 0.15)'; // Cherry red glow
const AMBIENT_GLOW_WINE = 'rgba(114, 47, 55, 0.2)'; // Wine dark glow

// 1. Change color constants
content = content.replace(/const PAPER_WHITE      = '#FAF8F5';/, `const PAPER_WHITE      = '#FAF8F5';\nconst VOID_BG          = '#0D0608';\nconst CARD_BG          = '#1A0C11';`);

// 2. Layout background
content = content.replace(/className="min-h-screen" style={{ background: '#FAF8F5' }}/g, `className="min-h-screen text-white/90" style={{ background: VOID_BG }}`);

// 3. Hero Radial gradients -> make them heart-beat breathing glow
content = content.replace(/radial-gradient\(ellipse 70% 50% at 50% 30%, rgba\(168,85,247,0.05\) 0%, transparent 70%\)/g, 
  `radial-gradient(ellipse 70% 80% at 50% 30%, ${AMBIENT_GLOW_WINE} 0%, transparent 70%)`);
content = content.replace(/radial-gradient\(ellipse 50% 40% at 30% 50%, rgba\(236,72,153,0.04\) 0%, transparent 60%\)/g, 
  `radial-gradient(ellipse 60% 50% at 80% 50%, ${AMBIENT_GLOW_RED} 0%, transparent 60%)`);
  
// Pulse animation for glow
content = content.replace(/className="absolute inset-0 pointer-events-none"/, `className="absolute inset-0 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}`);

// 4. Update text colors in Hero
content = content.replace(/color: '#2D2A26'/g, `color: '#F3E8EB'`);
content = content.replace(/color: '#6B6560'/g, `color: '${TEXT_NORMAL}'`);
content = content.replace(/color: '#9C9590'/g, `color: '${TEXT_MUTED}'`);

// 5. Signal Narrative hook card
content = content.replace(/background: PAPER_WHITE/g, `background: CARD_BG`);
content = content.replace(/border: \`1px solid \${INK_BLACK}10\`/g, `border: \`1px solid \${VELVET_DARK_WINE}40\``);
content = content.replace(/boxShadow: '0 20px 40px -10px rgba\(0,0,0,0.05\)'/g, `boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)'`);

// Text inside SIGNAL
content = content.replace(/color: '#5C5450'/g, `color: '${TEXT_NORMAL}'`);
content = content.replace(/color: '#8A7A75'/g, `color: '${TEXT_MUTED}'`);
content = content.replace(/color: INK_BLACK/g, `color: '${TEXT_HIGHLIGHT}'`);

// 6. Decode section
content = content.replace(/color: '#2B2827'/g, `color: '#F3E8EB'`);
content = content.replace(/color: '#7a7068'/g, `color: '${TEXT_NORMAL}'`);

// 7. Dimension pills (Dims)
content = content.replace(/background: '\#fff'/g, `background: 'rgba(255,255,255,0.03)'`);
content = content.replace(/border: '1px solid #f0ebe6'/g, `border: \`1px solid \${VELVET_DARK_WINE}30\``);
content = content.replace(/color: '#2D2A26'/g, `color: '#E6CDD5'`);
// Ensure DIMS card title
content = content.replace(/color: '\#211F1E'/g, `color: '#E6CDD5'`);

// 8. Types Marquee backgrounds
// "linear-gradient(160deg, ${p.color}18 0%, ${p.color}08 60%, #fff 100%)"
content = content.replace(/#fff 100%/g, `${CARD_BG} 100%`);
// border
content = content.replace(/border: \`1px solid \${p.color}15\`/g, `border: \`1px solid \${p.color}30\``);
// text
content = content.replace(/color: '#211F1E'/g, `color: '#F3E8EB'`);
content = content.replace(/color: '#8A7A75'/g, `color: '${TEXT_NORMAL}'`);
content = content.replace(/background: 'rgba\(255,255,255,0.8\)'/g, `background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'`);

// 9. Call to action button
// Currently: backgroundColor: INK_BLACK, color: PAPER_WHITE
content = content.replace(/backgroundColor: INK_BLACK, color: PAPER_WHITE/g, `backgroundColor: VELVET_ROSE, color: '#FFF'`);
// Footer
content = content.replace(/background: '#FAF8F5'/g, `background: VOID_BG`);


fs.writeFileSync('src/app/xpti/XptiHomeContent.tsx', content, 'utf8');
console.log('Colors replaced in XptiHomeContent.tsx');
