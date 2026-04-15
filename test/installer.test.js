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

test('parseSelection: deduplicates repeated numbers', () => {
  assert.deepEqual(parseSelection('1 1 2', [], 4), [0, 1]);
});
