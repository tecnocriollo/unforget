'use strict';
const { execSync } = require('child_process');
const { mkdirSync, symlinkSync, readlinkSync, existsSync } = require('fs');
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

function parseSelection(input, detectedIndices, total) {
  const trimmed = input.trim();
  if (trimmed === '') return detectedIndices;
  if (trimmed === 'all') return Array.from({ length: total }, (_, i) => i);
  return trimmed
    .split(/\s+/)
    .map(n => parseInt(n, 10) - 1)
    .filter(n => Number.isInteger(n) && n >= 0 && n < total);
}

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

module.exports = { ASSISTANTS, expandHome, isInPath, isDetected, parseSelection, linkSkill };
