import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "fix_*.js",
    "fix-*.js",
    "patch_*.js",
  ]),
  // design-system-v2 §1 铁律 4：Every color must be a token。
  // 禁止 Tailwind 任意值硬编码 hex；canvas / ShareImageGenerator / src/lib 数据常量为豁免区（见规范 §10）。
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(bg|text|border)-\\[#[0-9a-fA-F]{3,8}/]",
          message:
            "禁止硬编码 hex 颜色类（design-system-v2 §1）：请使用 --color-* token（如 bg-bg-primary / text-text-secondary）。",
        },
        {
          selector:
            "TemplateLiteral > TemplateElement[value.raw=/(bg|text|border)-\\[#[0-9a-fA-F]{3,8}/]",
          message:
            "禁止硬编码 hex 颜色类（design-system-v2 §1）：请使用 --color-* token（如 bg-bg-primary / text-text-secondary）。",
        },
      ],
    },
  },
]);

export default eslintConfig;
