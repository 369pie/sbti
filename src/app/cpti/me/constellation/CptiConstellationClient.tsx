'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listCodexRecords, type CodexRecord } from '@/lib/cpti/codex-archive';
import { CPTI_RELATIONSHIP_TYPES } from '@/lib/cpti/relationships';
import { getCptiPersonalityBySlug } from '@/lib/cpti/personalities';

interface Node {
  id: string;          // partner id (nickname:personalitySlug)
  label: string;       // display name
  personalitySlug?: string;
  emoji: string;
  color: string;
  count: number;       // number of records pointing to this partner
  x: number;
  y: number;
}

interface Edge {
  fromId: string;
  toId: string;
  relationshipSlug: string;
  color: string;
  label: string;
  recordId: string;
}

const W = 720;
const H = 520;
const CENTER = { x: W / 2, y: H / 2 };
const ME_RADIUS = 26;
const NODE_RADIUS = 18;

function partnerKey(rec: CodexRecord): string {
  return `${rec.partnerNickname || 'ta'}::${rec.personalitySlugB || 'unknown'}`;
}

function partnerLabel(rec: CodexRecord): string {
  return rec.partnerNickname?.trim() || (rec.personalitySlugB ? (getCptiPersonalityBySlug(rec.personalitySlugB)?.name ?? '某人') : '某人');
}

function partnerEmoji(rec: CodexRecord): string {
  if (rec.personalitySlugB) {
    const p = getCptiPersonalityBySlug(rec.personalitySlugB);
    if (p) return p.emoji;
  }
  return '✦';
}

function partnerColor(rec: CodexRecord): string {
  if (rec.personalitySlugB) return getCptiPersonalityBySlug(rec.personalitySlugB)?.color ?? '#C9A676';
  return '#C9A676';
}

function relationshipColor(slug: string): string {
  return CPTI_RELATIONSHIP_TYPES.find(r => r.slug === slug)?.color ?? '#C07A8E';
}

function relationshipName(slug: string): string {
  return CPTI_RELATIONSHIP_TYPES.find(r => r.slug === slug)?.name ?? slug;
}

function buildGraph(records: CodexRecord[]): { nodes: Node[]; edges: Edge[] } {
  // group by partner identity
  const byPartner = new Map<string, CodexRecord[]>();
  for (const r of records) {
    const k = partnerKey(r);
    const arr = byPartner.get(k) ?? [];
    arr.push(r);
    byPartner.set(k, arr);
  }

  const partners = Array.from(byPartner.entries());
  const N = partners.length;
  const ringR = Math.min(W, H) * 0.36;

  const nodes: Node[] = partners.map(([id, recs], i) => {
    const angle = (i / Math.max(1, N)) * Math.PI * 2 - Math.PI / 2;
    return {
      id,
      label: partnerLabel(recs[0]),
      personalitySlug: recs[0].personalitySlugB,
      emoji: partnerEmoji(recs[0]),
      color: partnerColor(recs[0]),
      count: recs.length,
      x: CENTER.x + Math.cos(angle) * ringR,
      y: CENTER.y + Math.sin(angle) * ringR,
    };
  });

  const edges: Edge[] = [];
  for (const [id, recs] of partners) {
    // pick the most recent record per relationship slug
    const byRel = new Map<string, CodexRecord>();
    for (const r of recs) {
      const cur = byRel.get(r.relationshipSlug);
      if (!cur || r.updatedAt > cur.updatedAt) byRel.set(r.relationshipSlug, r);
    }
    for (const [slug, r] of byRel) {
      edges.push({
        fromId: 'ME',
        toId: id,
        relationshipSlug: slug,
        color: relationshipColor(slug),
        label: relationshipName(slug),
        recordId: r.id,
      });
    }
  }
  return { nodes, edges };
}

export default function CptiConstellationClient() {
  const [records, setRecords] = useState<CodexRecord[] | null>(null);
  const [hover, setHover] = useState<{ kind: 'node' | 'edge'; id: string } | null>(null);

  useEffect(() => {
    setRecords(listCodexRecords());
  }, []);

  const graph = useMemo(() => (records ? buildGraph(records) : { nodes: [], edges: [] }), [records]);

  if (records === null) {
    return <main className="min-h-screen bg-bg-primary px-4 py-10 text-text-primary">加载中…</main>;
  }

  if (records.length === 0) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 py-10 text-text-primary">
        <div className="max-w-xl mx-auto text-center space-y-4 pt-16">
          <h1 className="text-3xl font-display">关系星图</h1>
          <p className="text-text-secondary text-sm">你还没有归档过任何关系。先去测一个，回来这里就会有星座。</p>
          <Link href="/cpti/" className="inline-block px-4 py-2 rounded-lg bg-accent text-bg-primary text-sm">去测试 →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-xs tracking-[0.4em] text-amber-300/70 uppercase">CPTI · Constellation</p>
          <h1 className="text-3xl md:text-4xl font-display">你的关系星图</h1>
          <p className="text-sm text-text-secondary">
            {graph.nodes.length} 颗星 · {graph.edges.length} 条关系连线
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-bg-secondary/40 via-bg-primary to-bg-primary p-2 md:p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* faint orbit ring */}
            <circle cx={CENTER.x} cy={CENTER.y} r={Math.min(W, H) * 0.36} fill="none" stroke="rgba(201,166,118,0.18)" strokeDasharray="2 6" />

            {/* edges */}
            {graph.edges.map((e, i) => {
              const to = graph.nodes.find(n => n.id === e.toId);
              if (!to) return null;
              const isHover = hover?.kind === 'edge' && hover.id === `${i}`;
              return (
                <line
                  key={`e-${i}`}
                  x1={CENTER.x} y1={CENTER.y} x2={to.x} y2={to.y}
                  stroke={e.color}
                  strokeOpacity={isHover ? 0.95 : 0.45}
                  strokeWidth={isHover ? 2 : 1.2}
                  onMouseEnter={() => setHover({ kind: 'edge', id: `${i}` })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}

            {/* ME node */}
            <g>
              <circle cx={CENTER.x} cy={CENTER.y} r={ME_RADIUS} fill="#1a1530" stroke="#C9A676" strokeWidth={2} />
              <text x={CENTER.x} y={CENTER.y + 5} textAnchor="middle" fontSize={14} fill="#C9A676" fontFamily="serif">我</text>
            </g>

            {/* partner nodes */}
            {graph.nodes.map(n => {
              const isHover = hover?.kind === 'node' && hover.id === n.id;
              return (
                <g key={n.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHover({ kind: 'node', id: n.id })}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={n.x} cy={n.y} r={NODE_RADIUS + (isHover ? 4 : 0)}
                    fill={`${n.color}33`} stroke={n.color} strokeWidth={isHover ? 2 : 1.2} />
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={14}>{n.emoji}</text>
                  <text x={n.x} y={n.y + NODE_RADIUS + 14} textAnchor="middle" fontSize={11} fill="#F5F0E8">
                    {n.label.length > 6 ? n.label.slice(0, 6) + '…' : n.label}
                  </text>
                  {n.count > 1 && (
                    <text x={n.x + NODE_RADIUS - 2} y={n.y - NODE_RADIUS + 4} textAnchor="middle" fontSize={9} fill="#C9A676">×{n.count}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* hover info */}
          <div className="px-4 py-3 text-xs text-text-secondary min-h-[44px]">
            {hover?.kind === 'edge' && (() => {
              const e = graph.edges[parseInt(hover.id, 10)];
              if (!e) return null;
              return (
                <Link href={`/cpti/relationship/${e.relationshipSlug}/`} className="hover:text-rose-300">
                  ✦ <span className="font-medium" style={{ color: e.color }}>{e.label}</span> · 点击查看完整解读 →
                </Link>
              );
            })()}
            {hover?.kind === 'node' && (() => {
              const n = graph.nodes.find(x => x.id === hover.id);
              if (!n) return null;
              const p = n.personalitySlug ? getCptiPersonalityBySlug(n.personalitySlug) : undefined;
              return <span>{n.label} · {p ? `${p.name}（${p.code}）` : '未知人格'} · 共 {n.count} 段关系</span>;
            })()}
            {!hover && <span className="text-text-muted">悬停在星点或连线上查看详情</span>}
          </div>
        </section>

        <div className="flex gap-2 justify-center text-xs">
          <Link href="/cpti/me/codex/" className="px-3 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-secondary/40">回到 Codex</Link>
          <Link href="/cpti/" className="px-3 py-2 rounded-lg bg-accent/90 text-bg-primary hover:bg-accent">再测一段</Link>
        </div>
      </div>
    </main>
  );
}
