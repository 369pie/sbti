const STORAGE_KEY = 'wtfti.theme';
const DEFAULT_THEME = 'light';
const DEFAULT_COLOR_SCHEME = 'light';

/**
 * Runs before hydration to apply the saved WTFTI visual mode.
 * Keep this as a server component so React does not warn about client-rendered scripts.
 *
 * 2026-08-17：合并宇宙暗色页判断。2026-10-20：/today、/bottle 已是 v3 奶油日记，移出暗色名单
 *（否则 body + 页脚被染成丝绒夜深紫），只剩 /wtfti/letters。
 * 宇宙页首帧前直接置暗 + 上 cosmicLock（防全局 provider hydrate 覆盖），
 * 页内 CosmicThemeBinder 稍后接管并负责离场恢复。后缀正则兼容 basePath。
 */
export function WtftiThemeNoFlashScript() {
  const code = `(() => {
    try {
      var b = document.body;
      var p = location.pathname;
      var cosmic = /(^|\\/)wtfti\\/letters\\/?$/.test(p);
      if (cosmic) {
        b.dataset._cosmicPrev = b.dataset.theme || '';
        b.dataset.theme = 'wtfti-dark';
        b.dataset.cosmicLock = '1';
        document.documentElement.style.colorScheme = 'dark';
        return;
      }
      var k = ${JSON.stringify(STORAGE_KEY)};
      var v = localStorage.getItem(k);
      if (v !== 'light' && v !== 'dark') v = ${JSON.stringify(DEFAULT_THEME)};
      b.dataset.theme = 'wtfti-' + v;
      b.dataset.wtftiTheme = v;
      document.documentElement.style.colorScheme = v === 'dark' ? 'dark' : 'light';
    } catch (_) {
      document.body.dataset.theme = 'wtfti-' + ${JSON.stringify(DEFAULT_THEME)};
      document.body.dataset.wtftiTheme = ${JSON.stringify(DEFAULT_THEME)};
      document.documentElement.style.colorScheme = ${JSON.stringify(DEFAULT_COLOR_SCHEME)};
    }
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
