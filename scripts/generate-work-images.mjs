#!/usr/bin/env node

import { runImageGeneratorCli } from './runninghub-image-generator.mjs';

runImageGeneratorCli({ moduleKey: 'work', args: process.argv.slice(2) }).catch((err) => {
  console.error('\nFatal:', err.message || err);
  process.exit(1);
});
