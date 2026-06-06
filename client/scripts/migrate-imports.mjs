import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

const TOP_LEVEL = ['api', 'app', 'assets', 'components', 'constants', 'context', 'features', 'pages', 'utils'];

function migrateContent(content) {
  let result = content;

  for (const folder of TOP_LEVEL) {
    const re = new RegExp(`from ['"](?:\\.\\./)+${folder}/`, 'g');
    result = result.replace(re, `from '@/${folder}/`);
    const importRe = new RegExp(`import ['"](?:\\.\\./)+${folder}/`, 'g');
    result = result.replace(importRe, `import '@/${folder}/`);
    const dotRe = new RegExp(`from ['"]\\./${folder}/`, 'g');
    result = result.replace(dotRe, `from '@/${folder}/`);
  }

  result = result.replace(/@\/features\/user\/settingsService/g, '@/features/users/settingsService');
  result = result.replace(/@\/components\/skeletons\//g, '@/components/ui/skeletons/');
  result = result.replace(/from ['"]\.\/App\.jsx['"]/g, "from '@/App'");
  result = result.replace(/from ['"]\.\/app\/store\.js['"]/g, "from '@/app/store'");
  result = result.replace(/from ['"]\.\/context\//g, "from '@/context/");
  result = result.replace(/from ['"]\.\/index\.css['"]/g, "from '@/index.css'");

  return result;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(jsx?|mjs)$/.test(entry.name)) continue;

    const original = fs.readFileSync(full, 'utf8');
    const updated = migrateContent(original);
    if (updated !== original) {
      fs.writeFileSync(full, updated);
      console.log('updated:', path.relative(srcDir, full));
    }
  }
}

walk(srcDir);
console.log('Import migration done.');
