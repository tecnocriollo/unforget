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

function parseSelection(input, detectedIndices, total) {
  const trimmed = input.trim();
  if (trimmed === '') return detectedIndices;
  if (trimmed === 'all') return Array.from({ length: total }, (_, i) => i);
  return trimmed
    .split(/\s+/)
    .map(n => parseInt(n, 10) - 1)
    .filter(n => Number.isInteger(n) && n >= 0 && n < total);
}

module.exports = { ASSISTANTS, expandHome, isInPath, isDetected, parseSelection };
