# Installing unforget for Codex

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/tecnocriollo/unforget ~/.codex/unforget
   ```

2. Symlink the skills directory so Codex discovers it:
   ```bash
   mkdir -p ~/.codex/skills
   ln -sf ~/.codex/unforget ~/.codex/skills/unforget
   ```

3. Restart Codex (quit and relaunch the CLI) to discover the skill.

## Verification

Check that the symlink exists:
```bash
ls -la ~/.codex/skills/unforget
```

## Updating

```bash
cd ~/.codex/unforget && git pull
```
Skills update instantly through the symlink — no restart needed after the initial setup.

## Removal

```bash
rm ~/.codex/skills/unforget
# optionally: rm -rf ~/.codex/unforget
```
