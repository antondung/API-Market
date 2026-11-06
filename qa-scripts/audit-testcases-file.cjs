const fs = require('fs');
const content = fs.readFileSync('docs/test/Sprint4_TestCases.md', 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.startsWith('| **['));
console.log('Total TC rows found:', lines.length);

let emptyActual = 0;
let notPass = 0;

lines.forEach(l => {
  const parts = l.split('|');
  const id = parts[1].trim();
  const actual = parts[8].trim();
  const status = parts[9].trim();
  if (!actual || actual === 'Ready' || actual === '-') {
    console.log('Empty Actual:', id);
    emptyActual++;
  }
  if (!status.includes('Pass')) {
    console.log('Not Pass:', id, status);
    notPass++;
  }
});

console.log(`Summary: Total=${lines.length}, EmptyActual=${emptyActual}, NotPass=${notPass}`);
if (lines.length === 53 && emptyActual === 0 && notPass === 0) {
  console.log('ALL 53 TEST CASES ARE 100% COMPLETE AND PASS!');
} else {
  process.exit(1);
}
