# Repository Sync Setup Guide

This guide shows how to keep `Basselbi/justhelplebanon` and `belbizri/lebanese-red-cross` in perfect sync.

## Option 1: Local Sync Script (Manual)

### Setup
The sync script is already created at `scripts/sync-repos.js`. It uses your already-configured git remotes.

### Usage

**Sync the current dev branch:**
```bash
node scripts/sync-repos.js
```

**Sync a specific branch:**
```bash
node scripts/sync-repos.js --branch main
```

**Sync all branches:**
```bash
node scripts/sync-repos.js --all
```

The script will:
- Fetch latest from both repos
- Compare commit history
- Push from `origin` to `belbizri` mirror
- Log all activity to `.sync-log.txt`

### Manual Git Commands (if you prefer)

```bash
# Sync dev branch
git push belbizri origin/dev:dev

# Sync main branch  
git push belbizri origin/main:main

# Sync all branches
git push belbizri --all
```

---

## Option 2: GitHub Actions (Automatic)

### Setup for Basselbi/justhelplebanon

1. **Create a Personal Access Token** (if you don't have one):
   - Go to https://github.com/settings/tokens/new
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Copy the token

2. **Add Secret to Repository**:
   - Go to https://github.com/Basselbi/justhelplebanon/settings/secrets/actions
   - Click "New repository secret"
   - Name: `GH_PAT`
   - Value: Paste your token
   - Click "Add secret"

3. **The workflow is ready**:
   - Located at `.github/workflows/sync-to-mirror.yml`
   - Automatically runs when you push to `dev` or `main`
   - Also available for manual trigger in Actions tab

### Setup for belbizri/lebanese-red-cross (Reverse Sync - Optional)

If you also want to sync FROM the mirror back to origin (bidirectional):

1. **In belbizri's repo**, create `.github/workflows/sync-to-origin.yml`:

```yaml
name: Sync to Origin Repo

on:
  push:
    branches:
      - dev
      - main
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Add origin remote
        run: |
          git remote add origin https://${{ secrets.GH_PAT }}@github.com/Basselbi/justhelplebanon.git || true
          git remote set-url origin https://${{ secrets.GH_PAT }}@github.com/Basselbi/justhelplebanon.git

      - name: Fetch and sync
        run: |
          git fetch origin
          git fetch
          git push origin HEAD:dev -f
          git push origin HEAD:main -f

      - name: Cleanup
        if: always()
        run: git remote set-url origin https://github.com/Basselbi/justhelplebanon.git
```

---

## How It Works

### Local Script Flow
```
sync-repos.js
├── Validate git remotes
├── Fetch from origin & belbizri
├── Compare branches
├── Push from origin → belbizri
└── Log results
```

### GitHub Actions Flow (Auto-sync Basselbi → belbizri)
```
Push to Basselbi/justhelplebanon
    ↓
Workflow triggers
    ↓
Fetch both repos
    ↓
Push dev & main to belbizri
    ↓
Sync complete ✓
```

### Bidirectional Flow (if both workflows enabled)
```
Push to Basselbi → Auto-sync to belbizri
Push to belbizri → Auto-sync to Basselbi
(Both stay in perfect sync)
```

---

## Troubleshooting

### "Mirror remote not found"
The script will automatically add it if missing.

### "Permission denied" errors
- Check that `origin` and `belbizri` remotes are configured:
  ```bash
  git remote -v
  ```
- For GitHub Actions: Verify the `GH_PAT` secret is set correctly

### Merge conflicts
These workflows use force push (`-f`) to keep repos identical:
```bash
git push belbizri origin/dev:dev -f
```
**This means the mirror always matches the origin exactly.**

### Check sync status
```bash
# View remotes
git remote -v

# View last commits on each
git log origin/dev -1
git log belbizri/dev -1
```

---

## Quick Commands Cheatsheet

```bash
# Manual sync (local)
node scripts/sync-repos.js

# Manual sync all branches
node scripts/sync-repos.js --all

# Manual sync specific branch
node scripts/sync-repos.js --branch main

# Git command for dev
git push belbizri origin/dev:dev

# Git command for all
git push belbizri --all

# View sync log
cat scripts/.sync-log.txt
```

---

## Security Notes

- **Local Script**: Uses existing git credentials/SSH
- **GitHub Actions**: Uses Personal Access Token in secrets
  - Token never appears in logs
  - Credentials removed after sync completes
  - Token can be revoked anytime

---

## What Gets Synced

✅ All commits  
✅ All branches  
✅ Tags (optional, add `--tags` to scripts)  
✅ Complete commit history  

❌ Release notes (separate entity)  
❌ Issues/PRs (not version controlled)  
❌ Wiki (separate repo)  

---

## Next Steps

1. **Test the local script**:
   ```bash
   node scripts/sync-repos.js
   ```

2. **For auto-sync (GitHub Actions)**:
   - Create the `GH_PAT` secret in Basselbi/justhelplebanon

3. **Verify sync**:
   ```bash
   git fetch --all
   git log origin/dev -1 --oneline
   git log belbizri/dev -1 --oneline
   ```
