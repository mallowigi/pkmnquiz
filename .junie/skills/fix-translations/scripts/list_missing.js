import fs from 'fs';
import path from 'path';

const localesDir = 'src/locales';
const enPath = path.join(localesDir, 'en.json');

if (!fs.existsSync(enPath)) {
  console.error('English locale file not found at src/locales/en.json');
  process.exit(1);
}

const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json') && file !== 'en.json');

function getMissingKeys(obj, prefix = '') {
  let missing = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      missing = missing.concat(getMissingKeys(value, fullKey));
    } else if (typeof value === 'string' && value.startsWith('__MISSING_TRANSLATION__:')) {
      const enValue = value.replace('__MISSING_TRANSLATION__:', '');
      missing.push({ key: fullKey, enValue });
    }
  }
  return missing;
}

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  const locale = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const missing = getMissingKeys(locale);
  
  if (missing.length > 0) {
    console.log(`\n### ${file}`);
    missing.forEach(m => {
      console.log(`- ${m.key}: "${m.enValue}"`);
    });
  }
});
