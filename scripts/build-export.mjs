import { cpSync, existsSync, mkdtempSync, renameSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

const appApi = join('src', 'app', 'api');
const backupRoot = mkdtempSync(join(tmpdir(), 'sbti-app-api-'));
const backupApi = join(backupRoot, 'api');
let movedApi = false;

try {
  // Move API routes out of the app directory for static export
  if (existsSync(appApi)) {
    renameSync(appApi, backupApi);
    movedApi = true;
    console.log('Moved', appApi, '->', backupApi);
  }

  // Run build
  execSync('next build --webpack', { stdio: 'inherit' });
} finally {
  // Restore API routes regardless of build success/failure
  if (movedApi && existsSync(backupApi)) {
    if (existsSync(appApi)) {
      cpSync(backupApi, appApi, { recursive: true, force: true });
      rmSync(backupApi, { recursive: true, force: true });
      console.log('Merged', backupApi, '->', appApi);
    } else {
      renameSync(backupApi, appApi);
      console.log('Restored', backupApi, '->', appApi);
    }
  }

  rmSync(backupRoot, { recursive: true, force: true });
}
