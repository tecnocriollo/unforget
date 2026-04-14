<!-- unforget: auto-generated — do not edit this block manually -->
## Last Session
_2026-04-14 — Updated the `unforget` skill to include a session resume in generated instruction files_
- The `unforget` skill lives at `~/.claude/skills/unforget/SKILL.md`
- Added step 3 to the skill: distill current conversation into a `## Last Session` block (≤10 bullets)
- Updated block format to include `## Last Session` section with date, summary, decisions, files changed, and open questions
- Updated rules: session resume always written even without docs; replaces (not accumulates) previous session
- If no `docs/` exists, omit `## Project Context` and `## Docs` — write only `## Last Session`
- Next: consider adding a `## Last Session` history limit (e.g., keep last N sessions) if users want a trail
<!-- /unforget -->
