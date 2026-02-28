const THIRD_SLOT_GROUPS = [
  ['A', 'B', 'C', 'D', 'F'],
  ['C', 'D', 'F', 'G', 'H'],
  ['C', 'E', 'F', 'H', 'I'],
  ['E', 'H', 'I', 'J', 'K'],
  ['B', 'E', 'F', 'I', 'J'],
  ['A', 'E', 'H', 'I', 'J'],
  ['E', 'F', 'G', 'I', 'J'],
  ['D', 'E', 'I', 'J', 'L'],
];
const SLOT_NUMBERS = [2, 5, 7, 8, 9, 10, 13, 15];

function sortGroupsAlphabetically(groups) {
  return [...groups].sort();
}

function countCombinations() {
  const combinations = {};
  
  function generateCombinations(index, current, result) {
    if (index === THIRD_SLOT_GROUPS.length) {
      if (current.size === 8) {
        const key = sortGroupsAlphabetically(Array.from(current)).join('');
        if (!combinations[key]) {
          combinations[key] = [];
        }
        combinations[key].push({ ...result });
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
  
  let multiple = 0;
  for (const k in combinations) {
    if (combinations[k].length > 1) {
       multiple++;
    }
  }
  return { total: Object.keys(combinations).length, multiple };
}

console.log(countCombinations());
