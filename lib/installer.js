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
