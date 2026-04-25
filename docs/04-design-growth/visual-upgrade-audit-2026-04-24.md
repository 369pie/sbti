# WTFTI UI/UX Visual Upgrade Audit — 2026-04-24

## Scope

Reviewed the main browsing path across desktop and mobile:

- `/`, `/wtfti/`, `/xpti/`, `/cpti/`, `/types/`, `/card/`
- Secondary surfaces sampled: `/soulti/`, `/mysti/`, `/her-voice/`, `/contact/`

Methodology: `taste-skill` + cc-design framing, then direct browser screenshot audit. Design target: female-leaning editorial atelier, romantic mysticism, premium collectible interface, with light mode echoing Summer Blush and dark mode echoing Lumina Ritual.

## Critical Findings

1. First screens were too sparse on core landing pages.
   Home, XPTI, and CPTI all had strong typography, but the right side of the viewport felt under-composed. A female-oriented premium site needs an immediate object of desire: cards, image stack, ritual panel, or collectible preview.

2. Reading rhythm was uneven.
   Several pages mixed huge hero type with tiny meta text and compressed controls. The eye had to jump between large editorial lines and cramped functional labels.

3. Emoji was overused as UI language.
   Emoji worked as data flavor, but tab bars, badges, gallery fallbacks, relationship states, and card tabs used it as iconography. On mobile this created noise and made the product feel less designed.

4. Loading and empty states felt unfinished.
   `/card/` showed a bare spinner on first load. For a card-collection product, even loading should feel like a soft reveal, not an app shell waiting for data.

5. Card count was high, but hierarchy was low.
   `/types/` had rich assets, yet repeated small pills, duplicate icon labels, tiny counters, and dense card grids reduced scanning quality.

6. Theme language was inconsistent across universes.
   WTFTI dark/light tokens were strong, but other universe pages still had legacy accents, generic shadows, and mixed UI idioms.

## Upgrade Direction

- Use short code marks (`WT`, `CP`, `ID`, `UNI`) as the primary UI icon language.
- Keep emoji as hidden/content metadata only where it is part of an IP dataset, not as general navigation or action chrome.
- Each major landing page gets a two-column first viewport: editorial copy plus a premium visual object.
- Prefer fewer, stronger cards; avoid card-in-card composition and decorative over-framing.
- Raise tap targets to at least 44px for primary controls.
- Use skeletons that preview the eventual layout.
- Make dark mode luminous and ceremonial; make light mode milky, blush-toned, and readable.

## First Implementation Pass

Completed:

- Global button, hero-card, code-mark, and skeleton primitives.
- Home first viewport upgraded with WTFTI collectible image stack.
- XPTI first viewport upgraded with radar and dimension preview.
- CPTI first viewport upgraded with relationship map and model preview.
- Types gallery tab/fallback language moved from emoji to consistent code marks.
- WTF Card loading state upgraded from bare spinner to layout skeleton.
- WTF Card tab/pinned/relationship/appraisal surfaces moved toward code-mark UI language.

## Next Priorities

1. Extend the same visual system to `/wtfti/` sub-universes, SoulTI, Mysti, Her Voice, and Contact.
2. Normalize all universe landing pages around one editorial shell with local visual objects.
3. Replace remaining small pills with segmented controls where selection is mutually exclusive.
4. Add route-level visual regression screenshots for desktop/mobile light/dark.
5. Tune copy density: reduce labels, increase paragraph line-height, and make each section answer one user question.

