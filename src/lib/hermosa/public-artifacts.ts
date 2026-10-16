import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type {
  HermosaContributionMetadata,
  HermosaCurationStatus,
  HermosaKind,
} from './tags';

export type HermosaArtifactKind = Extract<HermosaKind, 'voice' | 'book' | 'ai_question'>;

export interface HermosaArtifactRow {
  id: string;
  kind: HermosaArtifactKind;
  text: string;
  signature: string | null;
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  consent_to_feature: boolean;
  echo_count: number;
  is_featured: boolean;
  curation_status: HermosaCurationStatus;
  created_at: string;
}

export interface FetchHermosaArtifactsOptions {
  kind: HermosaArtifactKind;
  week?: string | null;
  limit?: number;
  selectedOnly?: boolean;
  consentedOnly?: boolean;
}

export async function fetchHermosaArtifacts({
  kind,
  week,
  limit = 100,
  selectedOnly = false,
  consentedOnly = false,
}: FetchHermosaArtifactsOptions): Promise<HermosaArtifactRow[]> {
  try {
    const admin = createAdminSupabaseClient();
    let query = admin
      .from('hermosa_messages')
      .select('id,kind,text,signature,metadata,topic_week,consent_to_feature,echo_count,is_featured,curation_status,created_at')
      .eq('kind', kind)
      .eq('is_published', true)
      .eq('flagged', false)
      .neq('safety_level', 'blocked')
      .order('is_featured', { ascending: false })
      .order('echo_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 120));

    if (week) query = query.eq('topic_week', week);
    if (selectedOnly) query = query.in('curation_status', ['selected', 'published']);
    if (consentedOnly) query = query.eq('consent_to_feature', true);

    const { data } = await query;
    return (data ?? []) as HermosaArtifactRow[];
  } catch {
    return [];
  }
}

export function formatHermosaArtifactCopy(row: HermosaArtifactRow): string {
  if (row.kind === 'book') {
    const title = row.metadata?.book_title ?? '未命名书籍';
    const author = row.metadata?.book_author ? ` / ${row.metadata.book_author}` : '';
    const note = row.metadata?.book_note || row.metadata?.book_quote || row.text;
    return `《${title}》${author}\n${note}\n署名：${row.signature || 'Anonymous'}`;
  }

  if (row.kind === 'ai_question') {
    const context = row.metadata?.ai_context ? `场景：${row.metadata.ai_context}\n` : '';
    const tool = row.metadata?.ai_tool ? `工具：${row.metadata.ai_tool}\n` : '';
    return `${context}${tool}问题：${row.metadata?.ai_question || row.text}\n署名：${row.signature || 'Anonymous'}`;
  }

  return `「${row.text}」\n署名：${row.signature || 'Anonymous'}`;
}
