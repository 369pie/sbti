import re
import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Import useWtftiTheme
    if 'useWtftiTheme' not in content:
        content = content.replace("import type { MystiTheme", "import { useWtftiTheme } from '@/components/wtfti/WtftiThemeProvider';\nimport type { MystiTheme")
        # In case the above didn't match, fallback
        if 'useWtftiTheme' not in content:
            content = content.replace("import { MYSTI_THEMES }", "import { useWtftiTheme } from '@/components/wtfti/WtftiThemeProvider';\nimport { MYSTI_THEMES }")
            
    # 2. Replace useState and toggleTheme
    # We find the component function body.
    # It usually has `const [themeId, setThemeId] = useState<MystiTheme['id']>(...)`
    state_pattern = re.compile(r'const \[themeId,\s*setThemeId\]\s*=\s*useState<MystiTheme\[\'id\'\]>\(.*?\);', re.DOTALL)
    
    # We replace it with:
    # const { theme: wtftiTheme } = useWtftiTheme();
    # const themeId = wtftiTheme === 'dark' ? 'celestial' : 'pale';
    replacement = "const { theme: wtftiTheme } = useWtftiTheme();\n  const themeId = wtftiTheme === 'dark' ? 'celestial' : 'pale';"
    content = state_pattern.sub(replacement, content)
    
    # 3. Remove toggleTheme
    toggle_pattern = re.compile(r'const toggleTheme = useCallback\(\(\) => \{.*?\},\s*\[\]\);', re.DOTALL)
    content = toggle_pattern.sub('', content)
    
    # 4. Remove the button
    # The button looks like <button onClick={toggleTheme} ... > {theme.label} </button>
    button_pattern = re.compile(r'<button[^>]*onClick=\{toggleTheme\}[^>]*>.*?<\/button>', re.DOTALL)
    content = button_pattern.sub('', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath in ['src/components/MystiResultContent.tsx', 'src/components/MystiGachaContent.tsx', 'src/components/MystiDailyContent.tsx']:
    patch_file(filepath)

