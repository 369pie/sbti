/**
 * stripLeadingEmoji — 剥离字符串开头的 emoji/符号 + 空格
 * 用于将 universe 的 hit_label/os_label/symptoms_label 中的前缀 emoji 替换为 <Glyph />
 *
 * 例："💥 一击" → "一击"
 * 例："🧠 OS 解读" → "OS 解读"
 * 例："症状清单" → "症状清单" (无 emoji 时保持原样)
 */
export function stripLeadingEmoji(text: string | null | undefined): string {
  if (!text) return '';
  // Unicode emoji & symbol range, plus ZWJ sequences + variation selector
  return text
    .replace(
      /^[\u2000-\u3300\uFE00-\uFE0F\u{1F000}-\u{1FAFF}\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}\u200D]+\s*/u,
      '',
    )
    .trim();
}
