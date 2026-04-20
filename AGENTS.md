<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ui-design-defaults -->
# UI / UX Design Defaults

For ANY frontend UI work in this repo (new screens, redesigns, share cards, prototypes, marketing pages, slide decks), the `cc-design` skill at `~/.claude/skills/cc-design/SKILL.md` is the **default methodology**. Read it before producing visuals — even for small tweaks.

When the task touches design tokens / accessibility / component systems, additionally consult `frontend-design-system` and `web-design-guidelines` skills.

Brand vocabulary baseline (Editorial Atelier × 暮光博物笔记 × Cosmic Romance):

- Type: `var(--font-display)` = Cormorant Garamond + Noto Serif SC; italic for emotional emphasis; UPPERCASE eyebrow with 0.32–0.42em letter-spacing
- Palette: 暮紫底 `#1a1530` / 玫瑰陶土 `#C07A8E` (`--color-rose`) / 金箔 `#C9A676` (`--color-gold-leaf`) / 米白 `#F5F0E8` / 暗面紫 `#9C7CFF`
- Motifs: 椭圆轨道环 / 罗马数字章节徽章 (I-VI) / 金色细分割线 / 散点星屑 / 玫瑰光晕 box-shadow / 双层 radial planet orb
- Tone: female-leaning, editorial, mysticism-romantic — avoid AI-slop gradients, hard shadows, generic dark-cosmic templates

Reference implementation: [src/components/galaxy/GalaxyPreview.tsx](src/components/galaxy/GalaxyPreview.tsx).
<!-- END:ui-design-defaults -->
