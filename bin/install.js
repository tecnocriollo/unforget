#!/usr/bin/env node
'use strict';
const readline = require('readline');
const path = require('path');
const { ASSISTANTS, isDetected, parseSelection, linkSkill } = require('../lib/installer');

const skillDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const forceAll = args.includes('--all');

function run(selectedIndices) {
  for (const i of selectedIndices) {
    const assistant = ASSISTANTS[i];
    const result = linkSkill(assistant, skillDir);
    const label = assistant.name.padEnd(12);
    if (result === 'linked') {
      console.log(`  ✓ ${label} — linked`);
    } else if (result === 'already linked') {
      console.log(`  ✓ ${label} — already linked`);
    } else {
      console.log(`  ! ${label} — skipped (path exists and is not a symlink to this install)`);
    }
  }
  console.log('Done.');
}

if (forceAll) {
  run(ASSISTANTS.map((_, i) => i));
  process.exit(0);
}

console.log('Detecting assistants...');
const detectedIndices = ASSISTANTS
  .map((a, i) => ({ a, i }))
  .filter(({ a }) => isDetected(a))
  .map(({ i }) => i);

for (let i = 0; i < ASSISTANTS.length; i++) {
  const detected = detectedIndices.includes(i);
  const status = detected ? '✓ detected  ' : '— not found ';
  console.log(`  [${i + 1}] ${ASSISTANTS[i].name.padEnd(14)} ${status}`);
}

console.log('');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Install for (Enter to accept detected, e.g. 1 3 4, or "all"): ', (answer) => {
  rl.close();
  const selected = parseSelection(answer, detectedIndices, ASSISTANTS.length);
  if (selected.length === 0) {
    console.log('No assistants selected. Nothing to do.');
    process.exit(0);
  }
  console.log('');
  run(selected);
});
