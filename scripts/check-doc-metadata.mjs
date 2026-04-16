import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(repoRoot, 'docs');

const ACTIVE_FIELDS = [
  'Owner',
  'Status',
  'Priority',
  'Last Updated',
  'Review Cadence',
  'Next Decision',
];

const ARCHIVE_FIELDS = ['Archive Status', 'Read This For', 'Current Authority'];

const PRIORITY_PATTERN = /^(P0|P1|P2|P3|Reference)$/;
const STATUS_PATTERN = /^(Canonical|Active|Historical)\b/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CADENCE_PATTERN = /^(Weekly|Twice weekly|Monthly|Quarterly|On|Before|Only when|Until)\b/;
const NEXT_DECISION_PATTERN = /^Decide\b/;

async function collectMarkdownFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return collectMarkdownFiles(entryPath);
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function formatRel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function addError(errors, relPath, lineNumber, message) {
  errors.push(`${relPath}:${lineNumber} ${message}`);
}

function parseHeaderBlock(lines, fields, relPath, errors) {
  const titleIndex = lines.findIndex((line) => line.trim().length > 0);

  if (titleIndex === -1) {
    addError(errors, relPath, 1, 'file is empty');
    return null;
  }

  if (!lines[titleIndex].startsWith('# ')) {
    addError(errors, relPath, titleIndex + 1, 'expected first non-empty line to be a level-1 heading');
    return null;
  }

  let cursor = titleIndex + 1;
  while (cursor < lines.length && lines[cursor].trim() === '') {
    cursor += 1;
  }

  const values = new Map();

  for (const field of fields) {
    const line = lines[cursor];
    const lineNumber = cursor + 1;

    if (!line) {
      addError(errors, relPath, lineNumber, `missing metadata line for "${field}"`);
      return null;
    }

    const match = line.match(/^> ([^:]+):\s*(.+)$/);
    if (!match) {
      addError(errors, relPath, lineNumber, `expected metadata line in the form "> ${field}: ..."`);
      return null;
    }

    const [, actualField, value] = match;
    if (actualField !== field) {
      addError(errors, relPath, lineNumber, `expected metadata field "${field}" but found "${actualField}"`);
      return null;
    }

    values.set(field, value.trim());
    cursor += 1;
  }

  return values;
}

function validateActiveFields(values, relPath, errors) {
  const owner = values.get('Owner');
  const status = values.get('Status');
  const priority = values.get('Priority');
  const lastUpdated = values.get('Last Updated');
  const reviewCadence = values.get('Review Cadence');
  const nextDecision = values.get('Next Decision');

  if (!owner) {
    addError(errors, relPath, 1, 'Owner must not be empty');
  }

  if (!STATUS_PATTERN.test(status)) {
    addError(errors, relPath, 1, `invalid Status "${status}"; expected it to start with Canonical, Active, or Historical`);
  }

  if (!PRIORITY_PATTERN.test(priority)) {
    addError(errors, relPath, 1, `invalid Priority "${priority}"; expected P0, P1, P2, P3, or Reference`);
  }

  if (!DATE_PATTERN.test(lastUpdated)) {
    addError(errors, relPath, 1, `invalid Last Updated "${lastUpdated}"; expected YYYY-MM-DD`);
  }

  if (!CADENCE_PATTERN.test(reviewCadence)) {
    addError(errors, relPath, 1, `invalid Review Cadence "${reviewCadence}"; expected it to start with Weekly, Twice weekly, Monthly, Quarterly, On, Before, Only when, or Until`);
  }

  if (!NEXT_DECISION_PATTERN.test(nextDecision)) {
    addError(errors, relPath, 1, `invalid Next Decision "${nextDecision}"; expected it to start with "Decide"`);
  }
}

function validateArchiveFields(values, relPath, errors) {
  const archiveStatus = values.get('Archive Status');
  const readThisFor = values.get('Read This For');
  const currentAuthority = values.get('Current Authority');

  if (archiveStatus !== 'Superseded') {
    addError(errors, relPath, 1, `invalid Archive Status "${archiveStatus}"; expected "Superseded"`);
  }

  if (!readThisFor) {
    addError(errors, relPath, 1, 'Read This For must not be empty');
  }

  if (!currentAuthority || !currentAuthority.includes('](')) {
    addError(errors, relPath, 1, 'Current Authority must include at least one markdown link');
  }
}

async function main() {
  const files = await collectMarkdownFiles(docsRoot);
  const errors = [];
  let activeCount = 0;
  let archiveCount = 0;

  for (const filePath of files) {
    const relPath = formatRel(filePath);
    const content = await readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const titleIndex = lines.findIndex((line) => line.trim().length > 0);
    let cursor = titleIndex + 1;
    while (cursor < lines.length && lines[cursor].trim() === '') {
      cursor += 1;
    }

    const firstMetadataLine = lines[cursor] ?? '';
    const isArchiveRedirect = firstMetadataLine.startsWith('> Archive Status:');

    if (isArchiveRedirect) {
      const values = parseHeaderBlock(lines, ARCHIVE_FIELDS, relPath, errors);
      if (values) {
        validateArchiveFields(values, relPath, errors);
        archiveCount += 1;
      }
      continue;
    }

    const values = parseHeaderBlock(lines, ACTIVE_FIELDS, relPath, errors);
    if (values) {
      validateActiveFields(values, relPath, errors);
      activeCount += 1;
    }
  }

  if (errors.length > 0) {
    console.error('Doc metadata validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Doc metadata OK: ${activeCount} active docs and ${archiveCount} superseded archive docs validated.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});