/**
 * View-mode state (W3 + W4).
 *
 * Five gallery layouts the user can switch between, persisted per device.
 *   - 'grid'         — default 2/3/4/5-col grid (W1/W2 baseline)
 *   - 'binder'       — 9-slot card-sleeve pages (W3)
 *   - 'pile'         — strewn-on-table pile, draggable (W4)
 *   - 'reel'         — fullscreen 5s/card auto-play (W4)
 *   - 'constellation'— unlocked cards as star nodes (W4)
 */

export type ViewMode = 'grid' | 'binder' | 'pile' | 'reel' | 'constellation';

export const VIEW_MODE_ORDER: ViewMode[] = ['grid', 'binder', 'pile', 'reel', 'constellation'];

export const VIEW_MODE_LABEL: Record<ViewMode, { label: string; emoji: string; hint: string }> = {
  grid:          { label: '抽屉', emoji: '🗂', hint: '默认网格' },
  binder:        { label: '卡册', emoji: '📒', hint: '九宫格活页' },
  pile:          { label: '堆叠', emoji: '🃏', hint: '撒在桌上' },
  reel:          { label: '幻灯', emoji: '🎞', hint: '自动播放' },
  constellation: { label: '星图', emoji: '✦',  hint: '星座连线' },
};

const STORAGE_KEY = 'wtf-museum-view-mode-v1';

export function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (VIEW_MODE_ORDER as string[]).includes(raw)) return raw as ViewMode;
  } catch { /* swallow */ }
  return 'grid';
}

export function saveViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, mode); } catch { /* swallow */ }
}
