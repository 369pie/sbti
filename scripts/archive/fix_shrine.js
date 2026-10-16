const fs = require('fs');

const path = 'src/app/api/galaxy/shrine-card/route.tsx';
let content = fs.readFileSync(path, 'utf8');

// Just a quick regex to ensure we don't accidentally break things.
// Instead of scripting it via JS, I'll use the replace tool.
