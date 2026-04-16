# RunningHub API Channels

> Owner: Infra
> Status: Active Operations Reference
> Priority: P2
> Last Updated: 2026-04-16
> Review Cadence: On vendor, endpoint, or channel-policy changes
> Next Decision: Decide whether channel routing stays manual-by-user-intent or becomes policy-based

This repo currently uses RunningHub for image generation through `scripts/runninghub-config.mjs` and `scripts/runninghub-image-generator.mjs`.

## Default Policy

- Default channel: RunningHub official stable text-to-image endpoint
- Use this by default unless the user explicitly asks for `低价渠道版本`
- Current shared config keeps the official stable endpoint as the default

## Channel A: Official Stable Version

This is the current default used by the repo.

- API base: `https://www.runninghub.cn/openapi/v2`
- Text-to-image endpoint: `/rhart-image-n-g31-flash-official/text-to-image`
- Config source: `RUNNINGHUB_TEXT2IMG_ENDPOINT`
- Current default resolution in repo config: `2k`

Recommended usage:

- Production-quality first pass
- Final deliverables where quality/stability matter more than cost
- Style validation images when the user asks for the best/stable version

## Channel B: Low-Cost Version

Use this only when the user explicitly says `用低价渠道版本` or equivalent.

- API base: `https://www.runninghub.cn/openapi/v2`
- Text-to-image endpoint: `/rhart-image-n-g31-flash/text-to-image`
- Auth: `Authorization: Bearer ${RUNNINGHUB_API_KEY}`
- Required payload fields:
  - `prompt`: string
  - `resolution`: one of `1k`, `2k`, `4k`
- Optional payload field:
  - `aspectRatio`: one of `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`, `1:4`, `4:1`, `1:8`, `8:1`

Example request:

```bash
curl --location --request POST 'https://www.runninghub.cn/openapi/v2/rhart-image-n-g31-flash/text-to-image' \
--header "Content-Type: application/json" \
--header "Authorization: Bearer ${RUNNINGHUB_API_KEY}" \
--data-raw '{
  "prompt": "一幅精美的明代国漫风格插画。一位穿着飞鱼服的锦衣卫站在古老的城墙上，俯瞰着繁华的京城夜景。画面采用平涂风格，线条硬朗，色彩对比强烈，背景有灯笼的光晕和几缕薄雾。",
  "aspectRatio": "9:16",
  "resolution": "1k"
}'
```

Query endpoint:

- `/query`

Notes:

- Result URLs expire after 24 hours
- Uploaded media URLs also expire after 1 day
- This repo can already switch to this channel by overriding `RUNNINGHUB_TEXT2IMG_ENDPOINT`
- No separate code path is required if only the text-to-image endpoint changes

## Switching Rules

### If user says `用官方稳定版本`

Use:

- `/rhart-image-n-g31-flash-official/text-to-image`

### If user says `用低价渠道版本`

Use:

- `/rhart-image-n-g31-flash/text-to-image`

Suggested runtime override example:

```bash
RUNNINGHUB_TEXT2IMG_ENDPOINT=/rhart-image-n-g31-flash/text-to-image
RUNNINGHUB_TEXT2IMG_RESOLUTION=1k
```

## Current Scope

The low-cost channel documentation provided here is for text-to-image only.

If later a low-cost img2img endpoint is provided, add it here before using it in the shared generator.