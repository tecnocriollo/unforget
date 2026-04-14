#!/usr/bin/env bash
# unforget skill installer
# Symlinks the skill into every known AI assistant's skills directory.

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="$(basename "$SKILL_DIR")"

install_to() {
  local target_dir="$1"
  local assistant="$2"
  local link="$target_dir/$SKILL_NAME"

  mkdir -p "$target_dir"

  if [ -L "$link" ] && [ "$(readlink "$link")" = "$SKILL_DIR" ]; then
    echo "  ✓ $assistant — already linked"
  elif [ -e "$link" ]; then
    echo "  ! $assistant — $link exists and is not a symlink, skipping"
  else
    ln -s "$SKILL_DIR" "$link"
    echo "  ✓ $assistant — linked $link → $SKILL_DIR"
  fi
}

echo "Installing unforget skill..."
install_to "$HOME/.claude/skills"   "Claude Code   (~/.claude/skills)"
install_to "$HOME/.gemini/skills"   "Gemini CLI    (~/.gemini/skills)"
install_to "$HOME/.codex/skills"    "Codex         (~/.codex/skills)"
install_to "$HOME/.agents/skills"   "Copilot CLI   (~/.agents/skills)"
echo "Done."
