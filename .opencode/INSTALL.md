# Installing unforget for OpenCode

## Setup

Add the plugin to your `opencode.json`:

```json
{
  "plugin": ["unforget@git+https://github.com/tecnocriollo/unforget.git"]
}
```

Restart OpenCode — the plugin auto-installs and registers the skill.

## Pinning a version

```json
{
  "plugin": ["unforget@git+https://github.com/tecnocriollo/unforget.git#v1.0.0"]
}
```

## Updating

Update the version tag (or remove it to track latest) and restart OpenCode.

## Removal

Remove the entry from `opencode.json` and restart.
