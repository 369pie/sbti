import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The remnants look like:
    # const themeId = wtftiTheme === 'dark' ? 'celestial' : 'pale';
    #       if (stored === 'pale' || stored === 'celestial') return stored;
    #     }
    #     return 'celestial';
    #   });
    
    # We want to match from `const themeId...;` to `  });` and only keep `const themeId...;`
    # Or simply:
    content = re.sub(
        r"const themeId = wtftiTheme === 'dark' \? 'celestial' : 'pale';.*?\}\s*return 'celestial';\s*\}\);",
        "const themeId = wtftiTheme === 'dark' ? 'celestial' : 'pale';",
        content,
        flags=re.DOTALL
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath in ['src/components/MystiResultContent.tsx', 'src/components/MystiGachaContent.tsx', 'src/components/MystiDailyContent.tsx']:
    fix_file(filepath)

