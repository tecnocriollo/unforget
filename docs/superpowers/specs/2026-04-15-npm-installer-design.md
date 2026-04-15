# npm installer design

**Date:** 2026-04-15  
**Status:** approved

## Goal

Replace `install.sh` with a cross-platform Node.js CLI published to npm so users can run:

```
npx install-unforget
```

The installer detects which AI assistants are available on the machine, presents a numbered selection list, and symlinks the skill into the chosen assistants' skills directories. The selected set becomes the source of truth for which instruction files `/unforget` writes.

## Files changed

| Action | File |
|--------|------|
| Delete | `install.sh` |
| Add | `package.json` |
| Add | `bin/install.js` |
| Update | `SKILL.md` — respect symlinks; add `--all` flag |
| Update | `README.md` — npm-only install instructions |

## package.json

- `name`: `install-unforget`
- `bin`: `{ "install-unforget": "./bin/install.js" }`
- `engines`: `{ "node": ">=18" }`
- No runtime dependencies — Node built-ins only.

## bin/install.js

### Assistant registry

Hardcoded list of four assistants:

| Assistant | CLI binary | Config dir | Skill target dir |
|-----------|-----------|------------|-----------------|
| Claude Code | `claude` | `~/.claude` | `~/.claude/skills` |
| Gemini CLI | `gemini` | `~/.gemini` | `~/.gemini/skills` |
| Codex | `codex` | `~/.codex` | `~/.codex/skills` |
| Copilot CLI | `gh` | `~/.agents` | `~/.agents/skills` |

### Detection

For each assistant, mark as detected if:
1. The CLI binary is found in `PATH` (`which <bin>` / `where <bin>` on Windows), **or**
2. The config directory exists (`~/.claude`, `~/.gemini`, etc.)

### `--all` flag

Skip detection and the prompt entirely. Select all four assistants.

### Interactive flow (no `--all`)

```
Detecting assistants...
  [1] Claude Code   ✓ detected
  [2] Gemini CLI    ✓ detected
  [3] Codex         — not found
  [4] Copilot CLI   — not found

Install for (Enter to accept detected, e.g. 1 3 4, or "all"):
>
```

- Pressing Enter with no input installs all detected assistants.
- Typing `all` installs all four regardless of detection.
- Typing space-separated numbers (e.g. `1 3`) installs only those.

### Symlinking

For each selected assistant:
- `mkdir -p <target-dir>`
- `fs.symlinkSync(skillDir, linkPath, 'junction')` — `junction` works on Windows without admin rights for directories.
- If the link already points to the right place: print `✓ already linked`.
- If something else exists at that path: print a warning and skip.

`skillDir` is resolved from `__dirname` (the location of `bin/install.js` inside the cloned/cached package).

### Output

```
  ✓ Claude Code — linked ~/.claude/skills/unforget
  ✓ Gemini CLI  — linked ~/.gemini/skills/unforget
Done.
```

## SKILL.md changes

Step 4 ("Write instruction files") adds a pre-write check:

> Before writing each target file, check whether `~/<assistant-skills-dir>/unforget` exists. Skip that file if it does not. If `/unforget` is invoked with `--all`, skip the check and write all four files.

No other steps change.

## README.md changes

- Remove the `install.sh` section.
- Replace all per-assistant install blocks with a single `npx install-unforget` command.
- Add a note that `--all` installs for all assistants without prompting.
- Add a note that on Windows, symlinking may require Developer Mode enabled.

## Out of scope

- Publishing to npm registry (user can run `npx` against the GitHub repo URL or a local path for now).
- Uninstall command.
- Updating an existing installation.
