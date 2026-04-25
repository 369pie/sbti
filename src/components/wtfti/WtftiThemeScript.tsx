const STORAGE_KEY = 'wtfti.theme';
const DEFAULT_THEME = 'light';
const DEFAULT_COLOR_SCHEME = 'light';

/**
 * Runs before hydration to apply the saved WTFTI visual mode.
 * Keep this as a server component so React does not warn about client-rendered scripts.
 */
export function WtftiThemeNoFlashScript() {
  const code = `(() => {
    try {
      var k = ${JSON.stringify(STORAGE_KEY)};
      var v = localStorage.getItem(k);
      if (v !== 'light' && v !== 'dark') v = ${JSON.stringify(DEFAULT_THEME)};
      document.body.dataset.theme = 'wtfti-' + v;
      document.body.dataset.wtftiTheme = v;
      document.documentElement.style.colorScheme = v === 'dark' ? 'dark' : 'light';
    } catch (_) {
      document.body.dataset.theme = 'wtfti-' + ${JSON.stringify(DEFAULT_THEME)};
      document.body.dataset.wtftiTheme = ${JSON.stringify(DEFAULT_THEME)};
      document.documentElement.style.colorScheme = ${JSON.stringify(DEFAULT_COLOR_SCHEME)};
    }
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
