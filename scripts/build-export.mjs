import { execSync } from 'child_process';

// Keep API routes in the build so server-backed features such as creator
// applications, CPTI claims, and auth mutations continue to work in production.
execSync('next build --webpack', { stdio: 'inherit' });
