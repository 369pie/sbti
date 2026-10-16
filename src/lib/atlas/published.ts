import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { AtlasEntry } from './entries';

interface PublishedAtlasRow {
  id: string;
  title: string;
  body_md: string;
  excerpt: string | null;
  cover_note: string | null;
  slug: string | null;
  source_topic_week: string | null;
  publish_issue: string | null;
  published_at: string | null;
  created_at: string;
}

const SELECT_COLS = 'id,title,body_md,excerpt,cover_note,slug,source_topic_week,publish_issue,published_at,created_at';

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

function issueLabel(issue: string | null): string {
  if (!issue) return '开放共写';
  if (issue.endsWith('-spring')) return '春季共写';
  if (issue.endsWith('-summer')) return '夏季共写';
  if (issue.endsWith('-autumn')) return '秋季共写';
  if (issue.endsWith('-winter')) return '冬季共写';
  return issue;
}

function toAtlasEntry(row: PublishedAtlasRow): AtlasEntry | null {
  if (!row.slug) return null;
  const issue = issueLabel(row.publish_issue);
  return {
    slug: row.slug,
    title: row.title,
    short: row.excerpt ?? row.cover_note ?? '来自 HER AURORA 共写投稿池，已由守光人收入极光星图。',
    pillar: 'self',
    pillar_label: issue,
    body: row.body_md,
    coords: {
      star: '编辑部待定',
      moon: row.source_topic_week ?? 'Q3 共写',
      wuxing: '待归档',
    },
    voices: [],
    also_known_as: [row.title],
    edit_status: 'co-writing',
  };
}

export async function getPublishedAtlasEntries(limit = 60): Promise<AtlasEntry[]> {
  const admin = tryAdmin();
  if (!admin) return [];

  const { data, error } = await admin
    .from('atlas_submissions')
    .select(SELECT_COLS)
    .eq('status', 'published')
    .not('slug', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) {
    console.warn('[atlas/published] list failed', error.message);
    return [];
  }

  return ((data ?? []) as PublishedAtlasRow[])
    .map(toAtlasEntry)
    .filter((entry): entry is AtlasEntry => Boolean(entry));
}

export async function findPublishedAtlasEntryBySlug(slug: string): Promise<AtlasEntry | null> {
  const admin = tryAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from('atlas_submissions')
    .select(SELECT_COLS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.warn('[atlas/published] detail failed', error.message);
    return null;
  }

  return data ? toAtlasEntry(data as PublishedAtlasRow) : null;
}