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

---

## Installation

### Claude Code

Clone manually into your global skills directory:

```bash
git clone https://github.com/tecnocriollo/unforget ~/.claude/skills/unforget
```

### Gemini CLI

```bash
gemini extensions install https://github.com/tecnocriollo/unforget
```

To update later:

```bash
gemini extensions update unforget
```

### Codex

See [`.codex/INSTALL.md`](.codex/INSTALL.md) for full steps. Short version:

```bash
git clone https://github.com/tecnocriollo/unforget ~/.codex/unforget
mkdir -p ~/.codex/skills
ln -sf ~/.codex/unforget ~/.codex/skills/unforget
```

Restart Codex to discover the skill.

### OpenCode

Add to your `opencode.json`:

```json
{
  "plugin": ["unforget@git+https://github.com/tecnocriollo/unforget.git"]
}
```

Restart OpenCode — the plugin auto-installs and registers the skill. See [`.opencode/INSTALL.md`](.opencode/INSTALL.md) for details.

### All assistants at once

After cloning to `~/.claude/skills/unforget`, run the install script:

```bash
~/.claude/skills/unforget/install.sh
```

This symlinks the skill for Claude Code, Gemini CLI, Codex, and Copilot CLI in one step.

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
/plugin update unforget
```

Or if installed manually:

```bash
cd ~/.claude/skills/unforget && git pull
```

## License

MIT
