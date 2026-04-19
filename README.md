# unforget

A skill for AI coding assistants that writes compact project context into each assistant's instruction file — so every assistant starts a session already knowing the project and what happened last time.

On each run it:
1. Reads every `.md` file under `docs/`
2. Distills the current conversation into a **last-session resume**
3. Writes both into the `<!-- unforget -->` block in each instruction file

Target files updated:

| Assistant | File |
|-----------|------|
| Claude Code | `CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Codex / OpenAI | `AGENTS.md` |
| OpenCode | `~/.opencode/plugins/unforget/unforget/SKILL.md` |

---

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

### OpenCode

The plugin auto-installs via the npm installer after cloning, or manually:

```bash
git clone https://github.com/tecnocriollo/unforget ~/.claude/skills/unforget
mkdir -p ~/.opencode/plugins
ln -sf ~/.claude/skills/unforget ~/.opencode/plugins/unforget
```

Restart OpenCode to discover the plugin.

---

## Usage

In any project, run:

```
/unforget
```

The skill synthesizes your `docs/` and the current session into all four instruction files. If `docs/` doesn't exist yet, it still writes the last-session resume.

---

## What gets written

The skill only ever touches content between the `<!-- unforget -->` markers. Everything else in your instruction files is left untouched.

```markdown
<!-- unforget: auto-generated — do not edit this block manually -->
## Project Context

**Project:** my-app — one-line purpose

**Stack:** TypeScript, Next.js, PostgreSQL

**Key rules:**
- Use `pnpm` for all package management
- All API routes live under `src/app/api/`

**Commands:**
- `pnpm dev` — start dev server
- `pnpm test` — run tests
- `pnpm build` — production build

## Last Session
_2026-04-14 — Refactored auth middleware_
- Moved session token storage to comply with new legal requirements
- Modified `src/middleware/auth.ts` — uses httpOnly cookies instead of localStorage
- Next: update integration tests to cover the new cookie flow

## Docs
Full documentation lives in `docs/`. Key files:
- `docs/architecture.md` — system design and key decisions
<!-- /unforget -->
```

---

## Updating

```bash
cd ~/.claude/skills/unforget && git pull
```

## License

MIT
