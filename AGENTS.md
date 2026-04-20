<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:karpathy-guidelines -->
# Karpathy-Inspired Coding Discipline

Source: adapted from `forrestchang/andrej-karpathy-skills`.
Local copy: `KARPATHY-CLAUDE.md`.

For non-trivial coding tasks:

## 1. Think Before Coding

- State assumptions explicitly.
- If ambiguity exists, ask instead of guessing.
- Present tradeoffs when multiple reasonable paths exist.
- Push back when a simpler approach exists.
- If something is unclear, stop and clarify.

## 2. Simplicity First

- Implement the minimum code that solves the requested problem.
- Do not add speculative features, abstractions, configurability, or impossible-scenario error handling.
- If the solution feels overengineered, simplify it.

## 3. Surgical Changes

- Touch only the code required for the task.
- Do not refactor, reformat, or "improve" unrelated nearby code.
- Match the existing style unless the task requires otherwise.
- Remove only the unused code created by your own change.
- Mention unrelated issues instead of fixing them opportunistically.

## 4. Goal-Driven Execution

- Convert requests into verifiable success criteria.
- Prefer tests, checks, builds, or direct behavioral verification.
- For multi-step work, state a short plan where each step has a verification check.
- Iterate until the success criteria are satisfied or a real blocker is identified.

Tradeoff: bias toward caution over speed. For trivial one-line fixes, use judgment.
<!-- END:karpathy-guidelines -->

<!-- BEGIN:sbti-project-execution -->
# SBTI Project Execution Addendum

Apply the general coding discipline with these repo-specific constraints:

- Treat each universe, module, and visual surface as intentional. Do not rename, restyle, or reorganize adjacent concept systems unless asked.
- Respect the Next.js and UI design rules in this file before reaching for broader refactors.
- Prefer narrow verification tied to the changed surface: targeted lint or typecheck, exact route or page render, focused script run, or preview smoke check.
- For production-sensitive flows such as Supabase, auth, payments, and OG/image routes, verify the exact path changed before doing cleanup around it.
- Keep secrets and local tokens out of diffs, examples, logs, and user-facing responses.
<!-- END:sbti-project-execution -->

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
