/**
 * Gentle AI reply for treehole posts. Uses APIMART OpenAI-compatible chat.
 * Stub fallback when key missing or upstream fails — still feels warm.
 */

const TEXT_MODEL = process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

const STUB_REPLIES = [
  '听到了。你愿意写下来，已经很勇敢了。今晚先好好吃饭、早点睡，明天我们再慢慢想。',
  '嗯，我接住了。这件事不必现在就想通——你先抱抱自己一下，好吗？',
  '谢谢你告诉我。你的感受是真的，不是矫情。想说更多随时写，我会在。',
  '先把呼吸放慢一点。你不是一个人扛着，至少在这里，有人认真看完了。',
  '写出来就好一点，对吧。今天不用完美，照顾好自己这一小会儿就够了。',
];

function stubReply(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) h = (h * 31 + content.charCodeAt(i)) >>> 0;
  return STUB_REPLIES[h % STUB_REPLIES.length];
}

const SYSTEM = `你是 WTFTI「懂我」树洞里的温柔姐姐。用户刚写下一段私密心情。
规则：
- 用简体中文，像闺蜜说话，短（60–120字），不要说教、不要列清单、不要提「宇宙/神域」。
- 先共情，再轻轻一句陪伴；不要诊断、不要建议吃药、不要引导自伤。
- 若内容像危机，只温和劝她联系现实中的人/热线，不要展开细节。
- 只输出回复正文，不要标题、不要引号包裹。`;

export async function generateTreeholeReply(content: string, opts?: { crisis?: boolean }): Promise<{ reply: string; stub: boolean }> {
  if (opts?.crisis) {
    return {
      reply:
        '我看到了，也有点心疼。先别一个人硬撑——身边有信任的人就打个电话；如果现在很危险，请看页面上的援助热线。你的话我先只留给你，不会公开。',
      stub: true,
    };
  }

  const apiKey = process.env.APIMART_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { reply: stubReply(content), stub: true };
  }

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0.7,
        max_tokens: 220,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: content.slice(0, 500) },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.warn('[treehole/ai-reply] upstream', res.status);
      return { reply: stubReply(content), stub: true };
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!text || text.length < 8) return { reply: stubReply(content), stub: true };
    return { reply: text.slice(0, 400), stub: false };
  } catch (err) {
    console.warn('[treehole/ai-reply] failed', err instanceof Error ? err.message : err);
    return { reply: stubReply(content), stub: true };
  }
}
