const fs = require('fs');
const he = require('./he.json');
const en = require('./en.json');

// Helper to get all keys
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Helper to get value by path
function getByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to set value by path
function setByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

const heKeys = getAllKeys(he);
const enKeys = getAllKeys(en);
const missingInEn = heKeys.filter(k => !enKeys.includes(k));

console.log(`Adding ${missingInEn.length} missing translations...`);

missingInEn.forEach(key => {
  const heValue = getByPath(he, key);
  setByPath(en, key, heValue); // Will translate manually
});

fs.writeFileSync('./en.json', JSON.stringify(en, null, 2));
console.log('Done! Wrote updated en.json');
