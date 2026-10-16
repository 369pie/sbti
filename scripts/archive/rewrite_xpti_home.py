import re

with open('src/app/xpti/XptiHomeContent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make it beautifully minimal:
content = content.replace("const XPTI_ACCENT = '#a855f7';", "const XPTI_ACCENT = '#6A2A3E'; // VELVET_WINE")
content = content.replace("const XPTI_PINK   = '#ec4899';", "const XPTI_PINK   = '#A3526E'; // VELVET_ROSE\nconst CHAMPAGNE = '#D6C5B3';\nconst PAPER_WHITE = '#FAF8F5';\nconst INK_BLACK = '#1C1A19';")

content = content.replace("background: `radial-gradient(circle at 50% -20%, ${XPTI_PINK} 0%, transparent 60%)`", 
                          "background: `radial-gradient(ellipse at 50% -20%, ${CHAMPAGNE} 0%, transparent 70%)`")

content = content.replace("background: `linear-gradient(135deg, ${XPTI_PINK}, ${XPTI_ACCENT})`", 
                          "backgroundColor: INK_BLACK, color: PAPER_WHITE")
content = content.replace("boxShadow: `0 6px 28px rgba(168,85,247,0.20)`", 
                          "boxShadow: `0 10px 30px -10px rgba(0,0,0,0.15)`")

content = content.replace("'linear-gradient(145deg, #2D1F3D, #1E1B2E)'", "PAPER_WHITE")
content = content.replace("'1px solid rgba(168,85,247,0.10)'", "`1px solid ${CHAMPAGNE}`")

content = content.replace("radial-gradient(circle at 100% 0%, rgba(168,85,247,0.08) 0%, transparent 60%)", 
                          "radial-gradient(circle at 100% 0%, rgba(214,197,179,0.3) 0%, transparent 60%)")

content = content.replace("'rgba(255,255,255,0.65)'", "'#5C5450'")
content = content.replace("'rgba(236,72,153,0.85)'", "XPTI_ACCENT")
content = content.replace("'rgba(255,255,255,0.25)'", "'#8A7A75'")
content = content.replace("'rgba(255,255,255,0.7)'", "INK_BLACK")

content = content.replace("'1px solid rgba(168,85,247,0.06)'", "'1px solid rgba(0,0,0,0.06)'")

with open('src/app/xpti/XptiHomeContent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

