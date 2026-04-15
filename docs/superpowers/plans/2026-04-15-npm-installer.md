# npm installer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `install.sh` with a cross-platform Node.js CLI (`npx install-unforget`) that detects installed AI assistants, prompts the user, and symlinks the skill into selected assistants' skills directories.

**Architecture:** Logic lives in `lib/installer.js` (pure, testable functions) and is wired into a CLI in `bin/install.js`. Tests use Node's built-in `node:test` runner — no test dependencies. The skill (`SKILL.md`) checks for symlinks before writing instruction files, respecting the user's selection.

**Tech Stack:** Node.js ≥18 (built-ins only: `fs`, `os`, `path`, `child_process`, `readline`, `node:test`)

---

## File map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `package.json` | npm package metadata and bin entry |
| Create | `lib/installer.js` | assistant registry, detection, selection parsing, symlinking |
| Create | `bin/install.js` | CLI entry point: arg parsing, prompt, output |
| Create | `test/installer.test.js` | unit tests for lib/installer.js |
| Modify | `SKILL.md` | add symlink check to step 4; document `--all` flag |
| Modify | `README.md` | replace all install sections with npx instructions |
| Delete | `install.sh` | replaced by npm CLI |

---

### Task 1: Create package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "install-unforget",
  "version": "1.0.0",
  "description": "Installer for the unforget AI assistant skill",
  "bin": {
    "install-unforget": "./bin/install.js"
  },
  "scripts": {
    "test": "node --test test/installer.test.js"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": ["unforget", "skill", "ai", "assistant"],
  "author": "tecnocriollo",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/tecnocriollo/unforget"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add package.json for npx install-unforget"
```

---

### Task 2: lib/installer.js — registry, detection, and expandHome

**Files:**
- Create: `lib/installer.js`
- Create: `test/installer.test.js`

- [ ] **Step 1: Write failing tests**

Create `test/installer.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { expandHome, ASSISTANTS, isInPath } = require('../lib/installer');
const os = require('os');
const path = require('path');

test('expandHome replaces ~ with home directory', () => {
  const result = expandHome('~/.claude');
  assert.equal(result, path.join(os.homedir(), '.claude'));
});

test('expandHome leaves non-tilde paths unchanged', () => {
  assert.equal(expandHome('/absolute/path'), '/absolute/path');
});

test('ASSISTANTS has exactly 4 entries', () => {
  assert.equal(ASSISTANTS.length, 4);
});

test('ASSISTANTS entries have required fields', () => {
  for (const a of ASSISTANTS) {
    assert.ok(a.name, 'missing name');
    assert.ok(a.bin, 'missing bin');
    assert.ok(a.configDir, 'missing configDir');
    assert.ok(a.skillDir, 'missing skillDir');
  }
});

test('isInPath finds node (always present in Node environment)', () => {
  assert.equal(isInPath('node'), true);
});

test('isInPath returns false for nonexistent binary', () => {
  assert.equal(isInPath('__nonexistent_binary_xyz__'), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test test/installer.test.js
```

Expected: `Error: Cannot find module '../lib/installer'`

- [ ] **Step 3: Create lib/installer.js with registry, expandHome, isInPath**

```js
'use strict';
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const os = require('os');
const path = require('path');

const ASSISTANTS = [
  { name: 'Claude Code', bin: 'claude', configDir: '~/.claude', skillDir: '~/.claude/skills' },
  { name: 'Gemini CLI',  bin: 'gemini', configDir: '~/.gemini', skillDir: '~/.gemini/skills' },
  { name: 'Codex',       bin: 'codex',  configDir: '~/.codex',  skillDir: '~/.codex/skills'  },
  { name: 'Copilot CLI', bin: 'gh',     configDir: '~/.agents', skillDir: '~/.agents/skills' },
];

function expandHome(p) {
  if (p.startsWith('~/') || p === '~') {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

function isInPath(bin) {
  const cmd = process.platform === 'win32' ? `where ${bin}` : `which ${bin}`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isDetected(assistant) {
  return isInPath(assistant.bin) || existsSync(expandHome(assistant.configDir));
}

module.exports = { ASSISTANTS, expandHome, isInPath, isDetected };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test test/installer.test.js
```

Expected: all 6 tests pass, `✔ expandHome replaces ~ with home directory` etc.

- [ ] **Step 5: Commit**

```bash
git add lib/installer.js test/installer.test.js
git commit -m "feat: add assistant registry and detection logic"
```

---

### Task 3: lib/installer.js — parseSelection

**Files:**
- Modify: `lib/installer.js`
- Modify: `test/installer.test.js`

- [ ] **Step 1: Add failing tests for parseSelection**

Append to `test/installer.test.js`:

```js
const { parseSelection } = require('../lib/installer');

test('parseSelection: empty input returns detected indices', () => {
  const detected = [0, 1];
  assert.deepEqual(parseSelection('', detected, 4), [0, 1]);
});

test('parseSelection: "all" returns all indices', () => {
  assert.deepEqual(parseSelection('all', [0], 4), [0, 1, 2, 3]);
});

test('parseSelection: space-separated numbers returns those indices (1-based)', () => {
  assert.deepEqual(parseSelection('1 3', [], 4), [0, 2]);
});

test('parseSelection: ignores out-of-range numbers', () => {
  assert.deepEqual(parseSelection('0 5 2', [], 4), [1]);
});

test('parseSelection: trims whitespace', () => {
  assert.deepEqual(parseSelection('  2  ', [], 4), [1]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test test/installer.test.js
```

Expected: `TypeError: parseSelection is not a function`

- [ ] **Step 3: Add parseSelection to lib/installer.js**

Add after `isDetected`:

```js
function parseSelection(input, detectedIndices, total) {
  const trimmed = input.trim();
  if (trimmed === '') return detectedIndices;
  if (trimmed === 'all') return Array.from({ length: total }, (_, i) => i);
  return trimmed
    .split(/\s+/)
    .map(n => parseInt(n, 10) - 1)
    .filter(n => Number.isInteger(n) && n >= 0 && n < total);
}
```

Also add `parseSelection` to the `module.exports` line:

```js
module.exports = { ASSISTANTS, expandHome, isInPath, isDetected, parseSelection };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test test/installer.test.js
```

Expected: all 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/installer.js test/installer.test.js
git commit -m "feat: add parseSelection for interactive assistant picker"
```

---

### Task 4: lib/installer.js — linkSkill

**Files:**
- Modify: `lib/installer.js`
- Modify: `test/installer.test.js`

- [ ] **Step 1: Add failing tests for linkSkill**

Append to `test/installer.test.js`:

```js
const { linkSkill } = require('../lib/installer');
const fs = require('fs');

test('linkSkill creates symlink in target dir', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-test-'));
  const fakeSkillDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-src-'));
  const assistant = {
    name: 'Test',
    bin: 'test',
    configDir: '~/.test',
    skillDir: tmpDir,
  };

  const result = linkSkill(assistant, fakeSkillDir);
  assert.equal(result, 'linked');
  const linkPath = path.join(tmpDir, 'unforget');
  assert.ok(fs.existsSync(linkPath));

  fs.rmSync(tmpDir, { recursive: true });
  fs.rmSync(fakeSkillDir, { recursive: true });
});

test('linkSkill returns "already linked" when symlink already points to skillDir', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-test-'));
  const fakeSkillDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-src-'));
  const assistant = { name: 'Test', bin: 'test', configDir: '~/.test', skillDir: tmpDir };

  linkSkill(assistant, fakeSkillDir); // first call creates it
  const result = linkSkill(assistant, fakeSkillDir); // second call should detect it
  assert.equal(result, 'already linked');

  fs.rmSync(tmpDir, { recursive: true });
  fs.rmSync(fakeSkillDir, { recursive: true });
});

test('linkSkill returns "skipped" when path exists but is not the right symlink', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-test-'));
  const fakeSkillDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unforget-src-'));
  const assistant = { name: 'Test', bin: 'test', configDir: '~/.test', skillDir: tmpDir };

  const linkPath = path.join(tmpDir, 'unforget');
  fs.mkdirSync(linkPath); // plain directory, not a symlink

  const result = linkSkill(assistant, fakeSkillDir);
  assert.equal(result, 'skipped');

  fs.rmSync(tmpDir, { recursive: true });
  fs.rmSync(fakeSkillDir, { recursive: true });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test test/installer.test.js
```

Expected: `TypeError: linkSkill is not a function`

- [ ] **Step 3: Add linkSkill to lib/installer.js**

Add `const { mkdirSync, symlinkSync, readlinkSync, existsSync } = require('fs');` at the top (replace the existing `existsSync` import line):

```js
const { execSync } = require('child_process');
const { mkdirSync, symlinkSync, readlinkSync, existsSync } = require('fs');
const os = require('os');
const path = require('path');
```

Add `linkSkill` after `parseSelection`:

```js
function linkSkill(assistant, skillDir) {
  const targetDir = expandHome(assistant.skillDir);
  mkdirSync(targetDir, { recursive: true });
  const linkPath = path.join(targetDir, 'unforget');

  if (existsSync(linkPath)) {
    try {
      const existing = readlinkSync(linkPath);
      if (existing === skillDir) return 'already linked';
    } catch {
      // not a symlink
    }
    return 'skipped';
  }

  const type = process.platform === 'win32' ? 'junction' : 'dir';
  symlinkSync(skillDir, linkPath, type);
  return 'linked';
}
```

Update `module.exports`:

```js
module.exports = { ASSISTANTS, expandHome, isInPath, isDetected, parseSelection, linkSkill };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test test/installer.test.js
```

Expected: all 14 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/installer.js test/installer.test.js
git commit -m "feat: add linkSkill with cross-platform symlink support"
```

---

### Task 5: bin/install.js — CLI entry point

**Files:**
- Create: `bin/install.js`

- [ ] **Step 1: Create bin/install.js**

```js
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
```

- [ ] **Step 2: Make bin/install.js executable (macOS/Linux)**

```bash
chmod +x bin/install.js
```

- [ ] **Step 3: Smoke test with --all flag**

```bash
node bin/install.js --all
```

Expected output (exact paths will vary):
```
  ✓ Claude Code  — linked (or already linked)
  ✓ Gemini CLI   — linked (or already linked)
  ✓ Codex        — linked (or already linked)
  ✓ Copilot CLI  — linked (or already linked)
Done.
```

- [ ] **Step 4: Smoke test interactive mode**

```bash
node bin/install.js
```

Expected: detection output, then prompt. Type `1` and press Enter. Verify only Claude Code gets linked.

- [ ] **Step 5: Commit**

```bash
git add bin/install.js
git commit -m "feat: add CLI entry point for npx install-unforget"
```

---

### Task 6: Update SKILL.md — symlink check and --all flag

**Files:**
- Modify: `SKILL.md`

The current step 4 in SKILL.md reads:

> **Write instruction files** — for each target, either create it fresh or surgically update only the `<!-- unforget -->…<!-- /unforget -->` block. Never touch content outside that block.

- [ ] **Step 1: Update the trigger line to note --all**

In `SKILL.md`, change:
```
trigger: /unforget
```
to:
```
trigger: /unforget [--all]
```

- [ ] **Step 2: Add symlink check to step 4**

In `SKILL.md`, replace the step 4 block:

```markdown
4. **Write instruction files** — for each target, either create it fresh or surgically update only the `<!-- unforget -->…<!-- /unforget -->` block. Never touch content outside that block.
```

with:

```markdown
4. **Write instruction files** — before writing each target file, check whether the corresponding symlink exists under the assistant's skills directory (e.g. `~/.claude/skills/unforget`, `~/.gemini/skills/unforget`). Skip any target whose symlink is absent — that assistant was not selected during install. If `/unforget` is invoked with `--all`, skip the symlink check and write all four files regardless. For each file that passes the check, either create it fresh or surgically update only the `<!-- unforget -->…<!-- /unforget -->` block. Never touch content outside that block.
```

- [ ] **Step 3: Run tests to make sure nothing broke**

```bash
node --test test/installer.test.js
```

Expected: all 14 tests still pass.

- [ ] **Step 4: Commit**

```bash
git add SKILL.md
git commit -m "feat: skill respects installed assistants, add --all flag"
```

---

### Task 7: Update README.md — npm-only install

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Installation section**

In `README.md`, replace the entire `## Installation` section (lines from `## Installation` down to just before `---` that precedes `## Usage`) with:

```markdown
## Installation

```bash
npx install-unforget
```

The installer detects which AI assistants are available on your machine and prompts you to confirm which ones to set up. To install for all assistants without prompting:

```bash
npx install-unforget --all
```

> **Windows note:** Symlinking directories requires Developer Mode to be enabled (Settings → For developers → Developer Mode).

Until published to the npm registry, clone the repo and run directly:

```bash
git clone https://github.com/tecnocriollo/unforget ~/.claude/skills/unforget
node ~/.claude/skills/unforget/bin/install.js
```
```

- [ ] **Step 2: Remove the Updating section's reference to install.sh**

Find the `## Updating` section. It currently reads:

```markdown
## Updating

```bash
cd ~/.claude/skills/unforget && git pull
```
```

Leave this section as-is — it still applies (the repo is still cloned locally).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README to npm-only install via npx"
```

---

### Task 8: Delete install.sh

**Files:**
- Delete: `install.sh`

- [ ] **Step 1: Delete install.sh**

```bash
git rm install.sh
```

- [ ] **Step 2: Run full test suite one last time**

```bash
node --test test/installer.test.js
```

Expected: all 14 tests pass.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove install.sh, replaced by npx install-unforget"
```
