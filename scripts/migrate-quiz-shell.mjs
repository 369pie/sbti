#!/usr/bin/env node
/**
 * Migrate the 4-axis "standard" Quiz components to use QuizShell.
 * Idempotent: if the file already imports QuizShell, it's skipped.
 *
 * Touches: WorkQuiz, SoultiQuiz, BirdQuiz, DrunkQuiz, FlowerQuiz, BantiQuiz.
 * Skipped (different structure): IdentifyQuiz (has name phase),
 * DailyQuiz (cached redirect), CreatorQuiz (router/multi-mode).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** @type {Array<{file:string, defaultsConst:string, optionType:string, modelNames:string, modelColors:string, defaultModelKey:string, accent:string, eyebrow:string, footer:string, finishingLabel:string, layoutId:string}>} */
const TARGETS = [
  {
    file: 'src/components/WorkQuiz.tsx',
    defaultsConst: 'WORK_DEFAULT_OPTIONS',
    optionType: 'WorkAnswerOption',
    modelNames: 'WORK_MODEL_NAMES',
    modelColors: 'WORK_MODEL_COLORS',
    defaultModelKey: 'drive',
    accent: '#5B6E6A',
    eyebrow: 'Work · 打工人格',
    footer: 'WTFti · WORK · 打工人设地图',
    finishingLabel: '正在给你对号入座打工人设',
    layoutId: 'work-selected-ring',
  },
  {
    file: 'src/components/SoultiQuiz.tsx',
    defaultsConst: 'SOULTI_DEFAULT_OPTIONS',
    optionType: 'SoultiAnswerOption',
    modelNames: 'SOULTI_MODEL_NAMES',
    modelColors: 'SOULTI_MODEL_COLORS',
    defaultModelKey: 'tide',
    accent: '#A85A6E',
    eyebrow: 'Soulti · 灵魂之味',
    footer: 'WTFti · SOULTI · 灵魂之味',
    finishingLabel: '正在打捞你的灵魂之味',
    layoutId: 'soulti-selected-ring',
  },
  {
    file: 'src/components/BirdQuiz.tsx',
    defaultsConst: 'BIRD_DEFAULT_OPTIONS',
    optionType: 'AnswerOption',
    modelNames: 'MODEL_NAMES',
    modelColors: 'MODEL_COLORS',
    defaultModelKey: 'self',
    accent: '#7A8A82',
    eyebrow: 'Bird · 你是哪种鸟',
    footer: 'WTFti · BIRD · 群鸟图鉴',
    finishingLabel: '正在为你寻一只对应的鸟',
    layoutId: 'bird-selected-ring',
  },
  {
    file: 'src/components/DrunkQuiz.tsx',
    defaultsConst: 'DRUNK_DEFAULT_OPTIONS',
    optionType: 'DrunkAnswerOption',
    modelNames: 'DRUNK_MODEL_NAMES',
    modelColors: 'DRUNK_MODEL_COLORS',
    defaultModelKey: 'talk',
    accent: '#C9882A',
    eyebrow: 'Drunk · 酒后人格',
    footer: 'WTFti · DRUNK · 微醺人格',
    finishingLabel: '正在为你倒一杯人格',
    layoutId: 'drunk-selected-ring',
  },
  {
    file: 'src/components/FlowerQuiz.tsx',
    defaultsConst: 'FLOWER_DEFAULT_OPTIONS',
    optionType: 'FlowerAnswerOption',
    modelNames: 'FLOWER_MODEL_NAMES',
    modelColors: 'FLOWER_MODEL_COLORS',
    defaultModelKey: 'photosynthesis',
    accent: '#B85470',
    eyebrow: 'Flower · 花的人格',
    footer: 'WTFti · FLOWER · 花语图鉴',
    finishingLabel: '正在为你择一朵对应的花',
    layoutId: 'flower-selected-ring',
  },
  {
    file: 'src/components/BantiQuiz.tsx',
    defaultsConst: 'BANTI_DEFAULT_OPTIONS',
    optionType: 'AnswerOption',
    modelNames: 'MODEL_NAMES',
    modelColors: 'MODEL_COLORS',
    defaultModelKey: 'self',
    accent: '#8C3E3E',
    eyebrow: 'Banti · 班味人格',
    footer: 'WTFti · BANTI · 班味地图',
    finishingLabel: '正在打包你的班味人格',
    layoutId: 'banti-selected-ring',
  },
];

function migrate(target) {
  const filepath = path.join(ROOT, target.file);
  let src = fs.readFileSync(filepath, 'utf8');

  if (src.includes("from './QuizShell'")) {
    console.log(`✓ skip ${target.file} (already migrated)`);
    return false;
  }

  // 1. Swap framer-motion import for QuizShell import.
  src = src.replace(
    /import \{ motion, AnimatePresence \} from 'framer-motion';\n/,
    "import { QuizShell, QuestionTitle, QuizOptions, QuizOption } from './QuizShell';\n",
  );

  // 2. Drop unused progress declaration.
  src = src.replace(
    /\n  const progress = \(\(currentIndex\)\) \/ total\) \* 100;\n/,
    '\n',
  );
  src = src.replace(
    /\n  const progress = \(\(currentIndex\) \/ total\) \* 100;\n/,
    '\n',
  );

  // 3. Replace the entire return JSX block with QuizShell version.
  const returnStart = src.indexOf('  return (\n    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">');
  if (returnStart < 0) {
    console.log(`✗ skip ${target.file} (return shape not found)`);
    return false;
  }

  // Find the closing of the component function: the final `}\n` after `</div>\n  );\n}`.
  const componentEnd = src.indexOf('\n  );\n}\n', returnStart);
  if (componentEnd < 0) {
    console.log(`✗ skip ${target.file} (component end not found)`);
    return false;
  }
  const tail = '\n  );\n}\n';

  const replacement = `  const accent = modelColor.base ?? '${target.accent}';

  return (
    <QuizShell
      currentIndex={currentIndex}
      total={total}
      direction={direction === 1 ? 1 : -1}
      onBack={handleBack}
      accent={accent}
      eyebrow="${target.eyebrow}"
      dimensionLabel={\`\${currentQ.dimension} · \${${target.modelNames}[currentQ.model]}\`}
      footerLabel="${target.footer}"
      finishing={isFinishing}
      finishingLabel="${target.finishingLabel}"
    >
      <QuestionTitle>{currentQ.text}</QuestionTitle>
      <QuizOptions>
        {(currentQ.options ?? ${target.defaultsConst}).map((opt: ${target.optionType}) => {
          const selected = answers.get(currentQ.id) === opt.value;
          return (
            <QuizOption
              key={opt.key}
              marker={opt.key}
              label={opt.label}
              selected={selected}
              disabled={isFinishing}
              accent={accent}
              onSelect={() => handleAnswer(currentQ.id, opt.value as Answer)}
            />
          );
        })}
      </QuizOptions>
    </QuizShell>`;

  src = src.slice(0, returnStart) + replacement + '\n  );\n}\n';

  // After replacement the surrounding may have a leftover `if (!mounted ...` block intact — that's ok.
  // But we accidentally clipped the `if (!mounted || !currentQ)` early-return. Re-verify:
  // Actually, the early-return block sits BEFORE the `return (` line we located, so it's preserved.

  fs.writeFileSync(filepath, src, 'utf8');
  console.log(`✓ migrated ${target.file}`);
  return true;
}

let migrated = 0;
for (const target of TARGETS) {
  if (migrate(target)) migrated += 1;
}
console.log(`\nDone. Migrated ${migrated}/${TARGETS.length} files.`);
