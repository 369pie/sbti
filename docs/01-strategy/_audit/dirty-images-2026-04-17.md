# Dirty Image Audit — 2026-04-17

**54** thumbnails flagged for content-side review.

Heuristics (not OCR):
1. Path contains a composite-card marker (`/cards/`, `/relationships/`, `-card.webp`)
2. Thumbnail size > 120 KB (clean character thumbs typically 20-90 KB)

**Action for content team**: open each flagged thumb; if it contains rendered Chinese title text, UI chrome, or screenshot of a result page, regenerate a clean character-only thumb and replace.

| Path | Size (KB) | Why flagged |
|---|---:|---|
| `public/images/types/cpti/relationships/thumbs/party.webp` | 22 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/allies.webp` | 21 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/rivals.webp` | 21 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/plastic.webp` | 20 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/lovers.webp` | 18 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/mentor.webp` | 18 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/parent.webp` | 18 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/homies.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/rookie.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/settled.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/twins.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/united.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/weirdos.webp` | 17 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/enemies.webp` | 16 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/glued.webp` | 16 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/paradox.webp` | 16 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/sync.webp` | 16 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/volcano.webp` | 16 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/inmate.webp` | 15 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/keeper.webp` | 15 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/mirror.webp` | 15 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/shield.webp` | 15 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/soul.webp` | 15 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/free.webp` | 14 | matches composite marker /\/relationships\// |
| `public/images/types/cpti/relationships/thumbs/iceberg.webp` | 12 | matches composite marker /\/relationships\// |
| `public/images/types/bird/cards/thumbs/simp.webp` | 9 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/dior-s.webp` | 7 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/ctrl.webp` | 6 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/drunk.webp` | 6 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/sexy.webp` | 6 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/atm-er.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/boss.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/emo.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/food-ie.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/game-r.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/joke-r.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/luck-y.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/mum.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/nerd.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/party.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/rebel.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/sleep.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/talk-er.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/than-k.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/thin-k.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/woc.webp` | 5 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/chill.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/drama.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/fake.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/love-r.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/malo.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/oh-no.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/shy.webp` | 4 | matches composite marker /\/cards\// |
| `public/images/types/bird/cards/thumbs/solo.webp` | 4 | matches composite marker /\/cards\// |