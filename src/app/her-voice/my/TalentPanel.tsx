'use client';

/**
 * /her-voice/my · <TalentPanel/>
 * ─────────────────────────────────────────────
 * 沙龙·接单档案：浏览器本地驱动（无账号）。
 *
 * 写入 hermosa_talents（POST → 拿到 { id, edit_token } 存入 localStorage），
 * 后续在同一台浏览器可编辑 / 下线。
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import {
  loadTalentProfile,
  saveTalentProfile,
  clearTalentProfile,
  type TalentLocalProfile,
} from '@/lib/hermosa/talent-storage';

const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';
const MONO = 'ui-monospace, "SF Mono", monospace';
const SERIF_DISPLAY = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';

const MAX_HANDLE = 24;
const MAX_PITCH = 140;
const MAX_SKILL = 12;
const MAX_NOTE = 80;

interface ApiTalent {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  contact_note: string | null;
  is_open_to_collab: boolean;
  contactable: boolean;
  curation_status: string;
  created_at: string;
}

interface PostResponse {
  ok: boolean;
  talent?: ApiTalent;
  edit_token?: string;
  error?: string;
}

interface PatchResponse {
  ok: boolean;
  talent?: ApiTalent;
  deleted?: boolean;
  error?: string;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function TalentPanel() {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<TalentLocalProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<{ whispers_total: number; whispers_7d: number } | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<{
    qualified: boolean;
    contribution_count: number;
    min_contributions: number;
  } | null>(null);
  const [handle, setHandle] = useState('');
  const [pitch, setPitch] = useState('');
  const [skill1, setSkill1] = useState('');
  const [skill2, setSkill2] = useState('');
  const [skill3, setSkill3] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [openToCollab, setOpenToCollab] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const local = loadTalentProfile();
    if (local) {
      setProfile(local);
      setHandle(local.handle);
      setPitch(local.pitch);
      setSkill1(local.skills[0] ?? '');
      setSkill2(local.skills[1] ?? '');
      setSkill3(local.skills[2] ?? '');
      setEmail(local.contact_email ?? '');
      setNote(local.contact_note ?? '');
      setOpenToCollab(local.is_open_to_collab);
      // 拉服务端真值 + whisper 统计
      void (async () => {
        try {
          const url = `/api/hermosa/talents?id=${encodeURIComponent(local.id)}&edit_token=${encodeURIComponent(local.edit_token)}`;
          const res = await fetch(getApiPath(url), { cache: 'no-store' });
          const data = (await res.json()) as {
            ok: boolean;
            stats?: { whispers_total: number; whispers_7d: number };
          };
          if (data.ok && data.stats) setStats(data.stats);
        } catch {
          /* ignore */
        }
      })();
    } else {
      // 没档案：探一下准入闸门，决定 empty state 提示文案
      void (async () => {
        try {
          const res = await fetch(getApiPath('/api/hermosa/talents/eligibility'), { cache: 'no-store' });
          if (!res.ok) return;
          const data = (await res.json()) as {
            qualified: boolean;
            contribution_count: number;
            min_contributions: number;
          };
          setEligibility(data);
        } catch {
          /* ignore */
        }
      })();
    }
    setHydrated(true);
  }, []);

  const skills = useMemo(
    () => [skill1, skill2, skill3].map((s) => s.trim()).filter(Boolean).slice(0, 3),
    [skill1, skill2, skill3],
  );

  const canSubmit =
    handle.trim().length > 0 &&
    pitch.trim().length > 0 &&
    pitch.trim().length <= MAX_PITCH &&
    (email.trim().length === 0 || isValidEmail(email.trim())) &&
    !busy;

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (!profile) {
        const res = await fetch(getApiPath('/api/hermosa/talents'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            handle: handle.trim(),
            pitch: pitch.trim(),
            skills,
            contact_email: email.trim() || null,
            contact_note: note.trim() || null,
          }),
        });
        const data = (await res.json()) as PostResponse;
        if (!data.ok || !data.talent || !data.edit_token) {
          setError(data.error ?? 'submit_failed');
          return;
        }
        const local: TalentLocalProfile = {
          id: data.talent.id,
          edit_token: data.edit_token,
          handle: data.talent.handle,
          pitch: data.talent.pitch,
          skills: data.talent.skills,
          contact_email: email.trim() || null,
          contact_note: data.talent.contact_note,
          is_open_to_collab: data.talent.is_open_to_collab,
          updated_at: new Date().toISOString(),
        };
        saveTalentProfile(local);
        setProfile(local);
        setEditing(false);
        setSavedAt(Date.now());
      } else {
        const res = await fetch(getApiPath('/api/hermosa/talents'), {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: profile.id,
            edit_token: profile.edit_token,
            handle: handle.trim(),
            pitch: pitch.trim(),
            skills,
            contact_email: email.trim() || null,
            contact_note: note.trim() || null,
            is_open_to_collab: openToCollab,
          }),
        });
        const data = (await res.json()) as PatchResponse;
        if (!data.ok || !data.talent) {
          setError(data.error ?? 'update_failed');
          return;
        }
        const local: TalentLocalProfile = {
          ...profile,
          handle: data.talent.handle,
          pitch: data.talent.pitch,
          skills: data.talent.skills,
          contact_email: email.trim() || null,
          contact_note: data.talent.contact_note,
          is_open_to_collab: data.talent.is_open_to_collab,
          updated_at: new Date().toISOString(),
        };
        saveTalentProfile(local);
        setProfile(local);
        setEditing(false);
        setSavedAt(Date.now());
      }
    } catch {
      setError('network');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleOpen(next: boolean) {
    if (!profile) return;
    setBusy(true);
    setError(null);
    setOpenToCollab(next);
    try {
      const res = await fetch(getApiPath('/api/hermosa/talents'), {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          edit_token: profile.edit_token,
          is_open_to_collab: next,
        }),
      });
      const data = (await res.json()) as PatchResponse;
      if (!data.ok || !data.talent) {
        setError(data.error ?? 'toggle_failed');
        setOpenToCollab(!next);
        return;
      }
      const local: TalentLocalProfile = {
        ...profile,
        is_open_to_collab: data.talent.is_open_to_collab,
        updated_at: new Date().toISOString(),
      };
      saveTalentProfile(local);
      setProfile(local);
      setSavedAt(Date.now());
    } catch {
      setError('network');
      setOpenToCollab(!next);
    } finally {
      setBusy(false);
    }
  }

  function handleClearLocal() {
    if (!window.confirm('从本机移除接单档案的编辑权限？远端档案不会立即下线。')) return;
    clearTalentProfile();
    setProfile(null);
    setEditing(false);
    setHandle('');
    setPitch('');
    setSkill1('');
    setSkill2('');
    setSkill3('');
    setEmail('');
    setNote('');
    setOpenToCollab(true);
  }

  if (!hydrated) return null;

  // ── Empty / first-time state ────────────────────────────────
  if (!profile && !editing) {
    const gateBlocked = eligibility !== null && !eligibility.qualified;
    return (
      <section className="hv-talent" style={panelStyle}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 720px) {
                .hv-talent { padding: 28px 18px !important; }
                .hv-talent-form { grid-template-columns: 1fr !important; }
              }
            `,
          }}
        />
        <div style={eyebrowStyle}>§ 接单档案 · TALENT</div>
        <h2 style={titleStyle}>
          开放<span style={{ color: ACCENT, fontStyle: 'italic' }}>合作</span>
        </h2>
        <div style={ruleStyle} />
        <p style={ledeStyle}>
          把你的一技之长写到这里，别的女性创作者、品牌方、独立项目方就能在
          沙龙名录里找到你。无账号系统：编辑权属于这台浏览器。
        </p>

        {gateBlocked ? (
          <div
            style={{
              marginTop: 22,
              padding: '18px 20px',
              border: `1px solid ${ACCENT}`,
              background: 'rgba(192, 81, 47, 0.06)',
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.42em',
                color: ACCENT,
                textTransform: 'uppercase',
              }}
            >
              § 准入闸门 · ECHO GATE
            </div>
            <p style={{ margin: 0, fontStyle: 'italic', color: INK }}>
              沙龙先给「贡献过的人」 ——
              请先在主墙留下至少 {eligibility?.min_contributions ?? 1} 句话，再回来开档。
              你目前是 {eligibility?.contribution_count ?? 0} / {eligibility?.min_contributions ?? 1}。
            </p>
            <a
              href={withBasePath('/her-voice/')}
              style={{
                ...primaryBtnStyle,
                textDecoration: 'none',
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              → 去主墙留一句
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <button onClick={() => setEditing(true)} style={primaryBtnStyle}>
              → 写一个档案
            </button>
            {eligibility && eligibility.qualified ? (
              <span
                style={{
                  alignSelf: 'center',
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                }}
              >
                ✓ 已贡献 {eligibility.contribution_count} 条 · 闸门已开
              </span>
            ) : null}
          </div>
        )}
      </section>
    );
  }

  // ── Editing form ────────────────────────────────────────────
  if (editing) {
    return (
      <section className="hv-talent" style={panelStyle}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 720px) {
                .hv-talent { padding: 28px 18px !important; }
                .hv-talent-form { grid-template-columns: 1fr !important; }
              }
            `,
          }}
        />
        <div style={eyebrowStyle}>§ 接单档案 · {profile ? 'EDIT' : 'NEW'}</div>
        <h2 style={titleStyle}>
          {profile ? '修改我的' : '写下我的'}<span style={{ color: ACCENT, fontStyle: 'italic' }}>接单档案</span>
        </h2>
        <div style={ruleStyle} />

        <div className="hv-talent-form" style={formGridStyle}>
          <Field label="昵称 · HANDLE" hint={`≤ ${MAX_HANDLE}`}>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.slice(0, MAX_HANDLE))}
              placeholder="她的名字"
              style={inputStyle}
            />
          </Field>
          <Field label="一句话 · PITCH" hint={`${pitch.length} / ${MAX_PITCH}`}>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value.slice(0, MAX_PITCH))}
              placeholder="我能帮你做什么 · 一句话讲清楚。"
              rows={3}
              style={textareaStyle}
            />
          </Field>
          <Field label="技能标签 · SKILLS" hint="最多 3 个">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                [skill1, setSkill1],
                [skill2, setSkill2],
                [skill3, setSkill3],
              ].map(([val, set], i) => (
                <input
                  key={i}
                  value={val as string}
                  onChange={(e) =>
                    (set as (v: string) => void)(e.target.value.slice(0, MAX_SKILL))
                  }
                  placeholder={`#标签${i + 1}`}
                  style={{ ...inputStyle, flex: '1 1 100px', minWidth: 100 }}
                />
              ))}
            </div>
          </Field>
          <Field label="联系邮箱 · CONTACT" hint="项目方通过双盲 Whisper 投递；不公开">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 120))}
              placeholder="you@example.com"
              type="email"
              style={inputStyle}
            />
          </Field>
          <Field label="接活备注 · NOTE" hint={`${note.length} / ${MAX_NOTE}（可空）`}>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
              placeholder="例：周末有空 · 中英文皆可"
              style={inputStyle}
            />
          </Field>
        </div>

        {error ? (
          error === 'not_qualified' ? (
            <div
              style={{
                marginTop: 10,
                padding: '14px 16px',
                border: `1px solid ${ACCENT}`,
                background: 'rgba(192, 81, 47, 0.06)',
                fontStyle: 'italic',
                color: INK,
              }}
            >
              · 准入闸门未开 —— 请先去
              <a href={withBasePath('/her-voice/')} style={{ color: ACCENT, marginLeft: 4 }}>
                主墙
              </a>
              留至少 1 句话再回来开档。·
            </div>
          ) : (
            <div style={errorStyle}>· 出了点问题：{error} ·</div>
          )
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
          <button onClick={handleSubmit} disabled={!canSubmit} style={primaryBtnStyle}>
            {busy ? '· SAVING ·' : profile ? '→ 更新档案' : '→ 发布档案'}
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setError(null);
              if (profile) {
                setHandle(profile.handle);
                setPitch(profile.pitch);
                setSkill1(profile.skills[0] ?? '');
                setSkill2(profile.skills[1] ?? '');
                setSkill3(profile.skills[2] ?? '');
                setEmail(profile.contact_email ?? '');
                setNote(profile.contact_note ?? '');
              }
            }}
            style={secondaryBtnStyle}
          >
            取消
          </button>
        </div>
      </section>
    );
  }

  // ── Saved profile · read-only summary ───────────────────────
  return (
    <section className="hv-talent" style={panelStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 720px) {
              .hv-talent { padding: 28px 18px !important; }
              .hv-talent-actions { flex-direction: column; align-items: stretch !important; }
              .hv-talent-actions button { width: 100%; }
            }
          `,
        }}
      />
      <div style={eyebrowStyle}>
        § 接单档案 · {profile!.is_open_to_collab ? 'OPEN TO COLLAB' : 'PAUSED'}
      </div>
      <h2 style={titleStyle}>
        {profile!.handle}
      </h2>
      <div style={ruleStyle} />
      <p style={pitchStyle}>「{profile!.pitch}」</p>

      {profile!.skills.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {profile!.skills.map((s) => (
            <span key={s} style={skillChipStyle}>#{s}</span>
          ))}
        </div>
      ) : null}

      <dl style={metaStyle}>
        <div style={metaRowStyle}>
          <dt style={metaKeyStyle}>CONTACT</dt>
          <dd style={metaValStyle}>
            {profile!.contact_email
              ? '已预留 · 项目方可发起 Whisper'
              : '未预留'}
          </dd>
        </div>
        {profile!.contact_note ? (
          <div style={metaRowStyle}>
            <dt style={metaKeyStyle}>NOTE</dt>
            <dd style={metaValStyle}>{profile!.contact_note}</dd>
          </div>
        ) : null}
        <div style={metaRowStyle}>
          <dt style={metaKeyStyle}>STATUS</dt>
          <dd style={metaValStyle}>
            {profile!.is_open_to_collab ? '在岗 · 出现在公开名录' : '暂停 · 不在公开名录'}
          </dd>
        </div>
        {stats && stats.whispers_total > 0 ? (
          <div style={metaRowStyle}>
            <dt style={metaKeyStyle}>ASKED</dt>
            <dd style={metaValStyle}>
              {stats.whispers_total} 次询问
              {stats.whispers_7d > 0 ? ` · 近 7 天 ${stats.whispers_7d} 次` : ''}
              {' · 已直接发到你邮箱'}
            </dd>
          </div>
        ) : null}
      </dl>

      {error ? <div style={errorStyle}>· {error} ·</div> : null}
      {savedAt ? <div style={savedHintStyle}>· 已保存 ·</div> : null}
      {copyHint ? <div style={savedHintStyle}>· {copyHint} ·</div> : null}

      <div className="hv-talent-actions" style={actionRowStyle}>
        <button
          onClick={() => handleToggleOpen(!profile!.is_open_to_collab)}
          disabled={busy}
          style={profile!.is_open_to_collab ? secondaryBtnStyle : primaryBtnStyle}
        >
          {profile!.is_open_to_collab ? '◯ 暂停接单' : '● 重新营业'}
        </button>
        <button onClick={() => setEditing(true)} style={secondaryBtnStyle}>
          ✎ 修改
        </button>
        <a
          href={withBasePath(`/her-voice/talents/${profile!.id}/`)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...secondaryBtnStyle, textDecoration: 'none' }}
        >
          → 我的档案页
        </a>
        <button
          onClick={async () => {
            try {
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${withBasePath(`/her-voice/talents/${profile!.id}/`)}`;
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setCopyHint('链接已复制');
                window.setTimeout(() => setCopyHint(null), 2400);
              }
            } catch {
              setCopyHint('复制失败 · 请手动复制');
              window.setTimeout(() => setCopyHint(null), 2400);
            }
          }}
          style={secondaryBtnStyle}
        >
          ⧉ 复制分享链接
        </button>
        <a
          href={withBasePath('/her-voice/talents/')}
          style={{ ...secondaryBtnStyle, textDecoration: 'none' }}
        >
          → 公开名录
        </a>
        <button onClick={handleClearLocal} style={ghostBtnStyle}>
          移除本机权限
        </button>
      </div>
    </section>
  );
}

// ── helpers ────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        {hint ? <span style={{ opacity: 0.7 }}>{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

// ── styles ─────────────────────────────────────────────────────

const panelStyle: CSSProperties = {
  marginBottom: 32,
  padding: '32px 32px 28px',
  background: PAPER_RAISED,
  borderTop: `3px solid ${INK}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  fontFamily: SERIF_DISPLAY,
  color: INK,
};

const eyebrowStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  color: ACCENT,
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: '12px 0 0',
  fontSize: 'clamp(28px, 4vw, 40px)',
  lineHeight: 1.05,
  fontStyle: 'italic',
  letterSpacing: '-0.01em',
  fontWeight: 500,
};

const ruleStyle: CSSProperties = {
  width: 48,
  height: 2,
  background: ACCENT,
  margin: '14px 0 18px',
};

const ledeStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.85,
  color: INK,
  opacity: 0.78,
  fontStyle: 'italic',
  maxWidth: 560,
};

const pitchStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(17px, 2vw, 20px)',
  lineHeight: 1.65,
  fontStyle: 'italic',
  color: INK,
  paddingLeft: 14,
  borderLeft: `3px solid ${ACCENT}`,
};

const skillChipStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.24em',
  color: INK,
  textTransform: 'uppercase',
  padding: '6px 12px',
  border: `1px solid ${HAIRLINE}`,
};

const metaStyle: CSSProperties = {
  margin: '20px 0 0',
  display: 'grid',
  gap: 8,
};

const metaRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '88px 1fr',
  gap: 12,
  paddingTop: 8,
  borderTop: `1px dotted ${HAIRLINE}`,
};

const metaKeyStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  textTransform: 'uppercase',
};

const metaValStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontStyle: 'italic',
  color: INK,
  lineHeight: 1.55,
};

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 18,
  marginTop: 18,
};

const inputStyle: CSSProperties = {
  border: 'none',
  borderBottom: `1px solid ${INK}`,
  background: 'transparent',
  padding: '8px 0',
  fontFamily: SERIF_DISPLAY,
  fontStyle: 'italic',
  fontSize: 16,
  color: INK,
  borderRadius: 0,
  width: '100%',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 60,
  lineHeight: 1.6,
};

const primaryBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '12px 22px',
  background: INK,
  color: PAPER,
  border: `1px solid ${INK}`,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  borderRadius: 0,
};

const secondaryBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: 'transparent',
  color: INK,
  border: `1px solid ${HAIRLINE}`,
};

const ghostBtnStyle: CSSProperties = {
  ...secondaryBtnStyle,
  border: 'none',
  color: INK_MUTED,
  letterSpacing: '0.32em',
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 22,
  alignItems: 'center',
};

const errorStyle: CSSProperties = {
  marginTop: 14,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.32em',
  color: ACCENT,
  textTransform: 'uppercase',
};

const savedHintStyle: CSSProperties = {
  marginTop: 14,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  textTransform: 'uppercase',
};
