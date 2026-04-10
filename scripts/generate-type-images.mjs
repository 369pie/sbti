#!/usr/bin/env node

import { listGeneratorModules, runImageGeneratorCli } from './runninghub-image-generator.mjs';

function printUsage(modules) {
  console.log('Usage:');
  console.log('  node scripts/generate-type-images.mjs <module> [slugs...] [--dry-run] [--force]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/generate-type-images.mjs work');
  console.log('  node scripts/generate-type-images.mjs love lick emperor --dry-run');
  console.log('  node scripts/generate-type-images.mjs daily --force');
  console.log('');
  console.log(`Available modules: ${modules.join(', ')}`);
}

async function main() {
  const args = process.argv.slice(2);
  const modules = await listGeneratorModules();

  if (args.includes('--help') || args.includes('-h')) {
    printUsage(modules);
    return;
  }

  if (args.includes('--list-modules')) {
    console.log(modules.join(', '));
    return;
  }

  if (args.length === 0 || args[0].startsWith('--')) {
    printUsage(modules);
    process.exit(1);
  }

  const [moduleKey, ...restArgs] = args;
  await runImageGeneratorCli({ moduleKey, args: restArgs });
}

main().catch((err) => {
  console.error('\nFatal:', err.message || err);
  process.exit(1);
});
