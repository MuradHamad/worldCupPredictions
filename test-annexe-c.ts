import { GroupLetter } from './src/lib/annexe-c';

const THIRD_SLOT_GROUPS = [
  ['A', 'B', 'C', 'D', 'F'], // 74 (slot 2) - 1E
  ['C', 'D', 'F', 'G', 'H'], // 77 (slot 5) - 1I
  ['C', 'E', 'F', 'H', 'I'], // 79 (slot 7) - 1A
  ['E', 'H', 'I', 'J', 'K'], // 80 (slot 8) - 1L
  ['B', 'E', 'F', 'I', 'J'], // 81 (slot 9) - 1D
  ['A', 'E', 'H', 'I', 'J'], // 82 (slot 10) - 1G
  ['E', 'F', 'G', 'I', 'J'], // 85 (slot 13) - 1B
  ['D', 'E', 'I', 'J', 'L'], // 87 (slot 15) - 1K
];
const SLOT_NUMBERS = [2, 5, 7, 8, 9, 10, 13, 15];

function sortGroupsAlphabetically(groups: string[]): string[] {
  return [...groups].sort();
}

function generateAnnexeC() {
  const combinations: Record<string, Record<number, string>> = {};
  
  function generateCombinations(
    index: number,
    current: Set<string>,
    result: Record<number, string>
  ) {
    if (index === THIRD_SLOT_GROUPS.length) {
      if (current.size === 8) {
        const key = sortGroupsAlphabetically(Array.from(current)).join('');
        if (!combinations[key]) {
          combinations[key] = { ...result };
        }
      }
      return;
    }
    
    const slotNum = SLOT_NUMBERS[index];
    
    for (const g of THIRD_SLOT_GROUPS[index]) {
      if (!current.has(g)) {
        current.add(g);
        result[slotNum] = g;
        generateCombinations(index + 1, current, result);
        delete result[slotNum];
        current.delete(g);
      }
    }
  }

  generateCombinations(0, new Set(), {});
  
  return combinations;
}

const c = generateAnnexeC();
console.log(Object.keys(c).length);
