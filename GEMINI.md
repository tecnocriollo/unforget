<!-- unforget: auto-generated — do not edit this block manually -->
## Project Context

**Project:** unforget — skill that writes AI assistant context files from project docs + session history

**Stack:** Markdown, Bash

**Key rules:**
- Only modify content between `<!-- unforget -->` and `<!-- /unforget -->` markers
- Session resume replaces (never accumulates) previous `## Last Session`
- Block must stay under 50 lines — compress ruthlessly

## Last Session
_2026-04-15 — Added README.md scanning to the unforget skill_
- Updated `~/.claude/skills/unforget/SKILL.md`: step 1 now globs `docs/**/*.md` + checks root `README.md`
- Updated block format: `## Docs` section now lists `README.md` first if present
- Updated `~/.claude/skills/unforget/README.md`: intro list, usage text, and example block reflect new source

## Docs
- `README.md` — skill overview and installation instructions for Claude Code, Gemini, Codex, OpenCode
<!-- /unforget -->
