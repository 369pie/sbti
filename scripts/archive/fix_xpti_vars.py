import re

with open('scripts/runninghub-prompts.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to change the function signature and the prompt generation.
# Look at original:
# export function buildUniverseCardPrompt({ seriesLabel, concept, card, themeColor }) {
# Let's use string replace rather than regex.
new_sig = "export function buildUniverseCardPrompt({ seriesLabel, artStyle, seriesTone, concept, card, themeColor }) {"
content = content.replace("export function buildUniverseCardPrompt({ seriesLabel, concept, card, themeColor }) {", new_sig)

# Wait! The main caller is in runninghub-image-generator.mjs
