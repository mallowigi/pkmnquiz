import fs from 'fs';
import path from 'path';

const localesDir = 'src/locales';
const enPath = path.join(localesDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const files = fs.readdirSync(localesDir).filter(file => file.endsWith('.json') && file !== 'en.json');

function getKeys(obj) {
  const keys = [];
  const walk = (o, p = '') => {
    for (const k in o) {
      const full = p ? `${p}.${k}` : k;
      if (typeof o[k] === 'object' && o[k] !== null && !Array.isArray(o[k])) {
        walk(o[k], full);
      } else {
        keys.push(full);
      }
    }
  };
  walk(obj);
  return keys;
}

const enKeys = getKeys(en);

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  const locale = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let modified = false;

  const sync = (source, target) => {
    for (const key in source) {
      if (!(key in target)) {
        if (typeof source[key] === 'string') {
          target[key] = `__MISSING_TRANSLATION__:${source[key]}`;
        } else {
          target[key] = source[key];
        }
        modified = true;
        console.log(`Added missing key "${key}" to ${file}`);
      } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (typeof target[key] !== 'object' || target[key] === null || Array.isArray(target[key])) {
          target[key] = {};
          modified = true;
        }
        sync(source[key], target[key]);
      }
    }
    
    // Optional: Remove extra keys not in source
    for (const key in target) {
      if (!(key in source)) {
        delete target[key];
        modified = true;
        console.log(`Removed extra key "${key}" from ${file}`);
      }
    }
  };

  sync(en, locale);

  if (modified) {
    // Sort keys alphabetically for consistency
    const sortObject = (obj) => {
      return Object.keys(obj).sort().reduce((res, key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          res[key] = sortObject(obj[key]);
        } else {
          res[key] = obj[key];
        }
        return res;
      }, {});
    };

    const sortedLocale = sortObject(locale);
    fs.writeFileSync(filePath, JSON.stringify(sortedLocale, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`${file} is already in sync.`);
  }
});
