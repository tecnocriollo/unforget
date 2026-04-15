---
name: unforget
description: Use when you want to generate or refresh AI assistant context files (CLAUDE.md, copilot-instructions.md, GEMINI.md, AGENTS.md) from a project's docs/ folder and the current conversation, so every assistant starts with full project context and a last-session resume.
trigger: /unforget [--all]
---

# /unforget

Read every `.md` file in `docs/`, synthesize project context, **and distill the current conversation into a last-session resume** — then write both into each AI assistant's instruction file so no assistant ever starts cold.

## Target files

| Assistant | Instruction file |
|-----------|-----------------|
| Claude Code | `CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Codex / OpenAI | `AGENTS.md` |

## Steps

1. **Discover docs** — glob `docs/**/*.md` from project root. Warn if missing or empty but continue to step 2 (session resume is still useful without docs).

2. **Read and synthesize docs** — read every discovered file. Extract:
   - Project name and one-line purpose
   - Tech stack (languages, frameworks, runtimes, databases)
   - Key architectural decisions or constraints
   - Conventions the assistant must follow (naming, style, testing)
   - Important commands (`dev`, `build`, `test`, `deploy`)
   - Anything explicitly marked "AI context" or "assistant context"

3. **Distill session resume** — scan the current conversation and extract:
   - What the user was working on (task/feature/bug)
   - Key decisions made and why
   - Files created or modified (with one-line purpose each)
   - Open questions or next steps the user mentioned
   - Any preferences or constraints the user expressed
   Keep it under 10 bullet points. Skip trivial back-and-forth. Only include what a future assistant needs to hit the ground running.

4. **Write instruction files** — before writing each target file, check whether the corresponding symlink exists under the assistant's skills directory (e.g. `~/.claude/skills/unforget`, `~/.gemini/skills/unforget`). Skip any target whose symlink is absent — that assistant was not selected during install. If `/unforget` is invoked with `--all`, skip the symlink check and write all four files regardless. For each file that passes the check, either create it fresh or surgically update only the `<!-- unforget -->…<!-- /unforget -->` block. Never touch content outside that block.

5. **Reference source docs** — if docs were found, include a `## Docs` section listing each file read.

## Block format (inserted into each file)

```markdown
<!-- unforget: auto-generated — do not edit this block manually -->
## Project Context

**Project:** <name> — <one-line purpose>

**Stack:** <comma-separated tech>

**Key rules:**
- <rule extracted from docs>
- <rule extracted from docs>

**Commands:**
- `<dev command>` — start dev server
- `<test command>` — run tests
- `<build command>` — production build

## Last Session
_<date> — <one-line summary of what was worked on>_
- <decision or action taken>
- <file created/modified — what it does>
- <open question or next step>

## Docs
Full documentation lives in `docs/`. Key files:
- `docs/<file>.md` — <one-line summary>
<!-- /unforget -->
```

Keep the block under 50 lines. Compress ruthlessly — this loads into every session.

**If no docs exist:** omit the `## Project Context` and `## Docs` sections; write only `## Last Session`.

## Rules

- Only modify content between `<!-- unforget -->` and `<!-- /unforget -->`. Everything outside is untouched.
- If the target file doesn't exist, create it with only the unforget block.
- Do not hallucinate — only synthesize what is actually in the docs or conversation.
- Session resume is always written, even if there are no docs.
- Session resume replaces the previous `## Last Session` block — do not accumulate history.
- After writing, print a one-line summary: files created vs updated, docs read, session resume included.

## Platform notes

The skill uses standard file tools. On each platform, use the native equivalent:

| Operation | Claude Code | Gemini CLI | Codex | Copilot CLI |
|-----------|-------------|------------|-------|-------------|
| Read file | `Read` | `read_file` | native | `view` |
| Write file | `Write` | `write_file` | native | `create` |
| Edit file | `Edit` | `replace` | native | `edit` |
| Glob | `Glob` | `glob` | native | `glob` |
| Shell | `Bash` | `run_shell_command` | native | `bash` |

## Installation

```bash
npx install-unforget
```

To install for all assistants without prompting:

```bash
npx install-unforget --all
```

Until published to npm, clone and run directly:

```bash
git clone https://github.com/tecnocriollo/unforget ~/.claude/skills/unforget
node ~/.claude/skills/unforget/bin/install.js
```
