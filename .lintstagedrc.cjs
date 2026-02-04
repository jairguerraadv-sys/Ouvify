const path = require('path');

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function relativeTo(dir, filePath) {
  return path.relative(dir, filePath).split(path.sep).join('/');
}

module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => {
    const tasks = [];

    const frontendFiles = files.filter((f) => f.startsWith('apps/frontend/'));
    const otherFiles = files.filter((f) => !f.startsWith('apps/frontend/'));

    if (frontendFiles.length) {
      const rel = frontendFiles.map((f) => shellQuote(relativeTo('apps/frontend', f))).join(' ');
      tasks.push(`cd apps/frontend && npx eslint --fix ${rel}`);
      tasks.push(`cd apps/frontend && npx prettier --write ${rel}`);
    }

    if (otherFiles.length) {
      const quoted = otherFiles.map(shellQuote).join(' ');
      tasks.push(`npx prettier --write ${quoted}`);
    }

    return tasks;
  },

  '*.{json,md,yml,yaml}': ['npx prettier --write'],

  '*.py': ['black', 'isort'],
};
