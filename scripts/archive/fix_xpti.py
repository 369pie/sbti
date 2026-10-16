import os

gen_file = 'scripts/runninghub-image-generator.mjs'
with open(gen_file, 'r', encoding='utf-8') as f:
    gen_content = f.read()

gen_content = gen_content.replace(
'''    return buildUniverseCardPrompt({
      seriesLabel: config.seriesLabel,
      concept: type.concept,
      card: type.card,
      themeColor: config.themeColor,
    });''', 
'''    return buildUniverseCardPrompt({
      seriesLabel: config.seriesLabel,
      artStyle: config.artStyle,
      seriesTone: config.seriesTone,
      concept: type.concept,
      card: type.card,
      themeColor: config.themeColor,
    });''')

with open(gen_file, 'w', encoding='utf-8') as f:
    f.write(gen_content)

prompts_file = 'scripts/runninghub-prompts.mjs'
with open(prompts_file, 'r', encoding='utf-8') as f:
    p_content = f.read()

p_content = p_content.replace(
'''export function buildUniverseCardPrompt({ seriesLabel, concept, card, themeColor }) {
  const { name, number, code, backronym, tagline, tags, quote } = card;''',
'''export function buildUniverseCardPrompt({ seriesLabel, artStyle, seriesTone, concept, card, themeColor }) {
  const { name, number, code, backronym, tagline, tags, quote } = card;
  const { typeTitle, punchline } = card; // For alternative structures like XPTI

  if (artStyle === 'dark-aesthetic') {
    return [
      `[Overall Style & Visual Hierarchy]`,
      `${seriesTone}`, 
      `${concept}`,
      `[Typography Layer - Top Foreground]`,
      `ALL TEXT HERE MUST SURMOUNT THE CHARACTER'S HEAD IF THEY OVERLAP.`,
      `At the very top edge, small fine text reading "XPTI 情欲人格图谱".`,
      `Below it, massive, impactful, bold typography text reading "${typeTitle || name}".`,
      `Below the title, stylized prominent text reading "${code}".`,
      `Underneath, a short expressive tagline text reading "${tagline}".`,
      `Ensure high contrast so the text remains 100% readable.`,
      `[Typography Layer - Bottom Foreground]`,
      `Layered intimately near the bottom of the canvas, vividly superimposed over the character's lower torso or clothes:`,
      `Three cleanly designed info-graphic boxes lined up horizontally.`,
      `The first box: "${tags ? tags[0] : ''}".`,
      `The second box: "${tags ? tags[1] : ''}".`,
      `The third box: "${tags ? tags[2] : ''}".`,
      `At the absolute bottom center edge, stylish elegant text serving as the punchline, reading: "${punchline || quote}".`
    ].filter(Boolean).join('\\n\\n');
  }
''')

with open(prompts_file, 'w', encoding='utf-8') as f:
    f.write(p_content)

print("Patched!")
