const fs = require('fs');

const combos = JSON.parse(fs.readFileSync('combinations.json'));

const slotMap = {
  '1A': 7,
  '1B': 13,
  '1D': 9,
  '1E': 2,
  '1G': 10,
  '1I': 5,
  '1K': 15,
  '1L': 8
};

const fullAnnexeC = {};

for (const c of combos) {
  const groups = [c['1A'], c['1B'], c['1D'], c['1E'], c['1G'], c['1I'], c['1K'], c['1L']];
  const sorted = groups.slice().sort().join('');
  
  fullAnnexeC[sorted] = {
    [slotMap['1A']]: c['1A'],
    [slotMap['1B']]: c['1B'],
    [slotMap['1D']]: c['1D'],
    [slotMap['1E']]: c['1E'],
    [slotMap['1G']]: c['1G'],
    [slotMap['1I']]: c['1I'],
    [slotMap['1K']]: c['1K'],
    [slotMap['1L']]: c['1L']
  };
}

const tsCode = `// Generated Annexe C mappings
export const FULL_ANNEXE_C: Record<string, Record<number, GroupLetter>> = ${JSON.stringify(fullAnnexeC, null, 2)};
`;

fs.writeFileSync('generated_annexe_c.ts', tsCode);
console.log('Done generating generated_annexe_c.ts');
