import { execSync } from 'child_process';
import fs from 'fs';

const vi = execSync('git -C "C:/Users/duwn/Documents/api-market" show bd63a9be4d6a668001ab4fc81d773554facf25aa:frontend/src/i18n/vi.json', { 
  encoding: 'utf8', 
  maxBuffer: 50 * 1024 * 1024 
});
fs.writeFileSync('./src/i18n/vi.json', vi, 'utf8');

const overrides = execSync('git -C "C:/Users/duwn/Documents/api-market" show bd63a9be4d6a668001ab4fc81d773554facf25aa:frontend/src/i18n/vi-overrides.json', { 
  encoding: 'utf8', 
  maxBuffer: 50 * 1024 * 1024 
});
fs.writeFileSync('./src/i18n/vi-overrides.json', overrides, 'utf8');

console.log('Done! Verified size vi.json:', vi.length, 'overrides:', overrides.length);
