<!-- unforget: auto-generated — do not edit this block manually -->
## Project Context

**Project:** unforget — skill that writes AI assistant context files from project docs + session history

**Stack:** Node.js ≥18, Markdown

**Key rules:**
- Only modify content between `<!-- unforget -->` and `<!-- /unforget -->` markers
- Session resume replaces (never accumulates) previous `## Last Session`
- Block must stay under 50 lines — compress ruthlessly
- No runtime npm dependencies — Node built-ins only

**Commands:**
- `node --test test/installer.test.js` — run tests
- `npx install-unforget` — install skill for detected assistants
- `npx install-unforget --all` — install for all assistants, no prompt

## Last Session
_2026-04-15 — Replaced install.sh with cross-platform npm installer_
- Added `package.json` — npm package, `bin: install-unforget`
- Added `lib/installer.js` — ASSISTANTS registry, detection (PATH + config dir), `parseSelection`, `linkSkill`
- Added `bin/install.js` — CLI: detects assistants, numbered prompt, `--all` flag
- Added `test/installer.test.js` — 15 tests via node:test, zero dependencies
- Updated `SKILL.md` step 4: checks symlinks before writing; added `/unforget --all` flag
- Updated `README.md`: npx-only install instructions
- Deleted `install.sh`

## Docs
- `docs/superpowers/specs/2026-04-15-npm-installer-design.md` — design spec for npm installer
- `docs/superpowers/plans/2026-04-15-npm-installer.md` — implementation plan
<!-- /unforget -->
