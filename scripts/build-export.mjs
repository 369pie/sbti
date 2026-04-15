import { renameSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const appApi = join('src', 'app', 'api');
const backupApi = join('src', 'app_api_backup');

try {
  // Move API routes out of the app directory for static export
  if (existsSync(appApi)) {
    renameSync(appApi, backupApi);
    console.log('Moved', appApi, '->', backupApi);
  }

  // Run build
  execSync('next build', { stdio: 'inherit' });
} finally {
  // Restore API routes regardless of build success/failure
  if (existsSync(backupApi)) {
    renameSync(backupApi, appApi);
    console.log('Restored', backupApi, '->', appApi);
  }
}
