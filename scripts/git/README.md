# Git Scripts

Scripts for version management and releases.

## Versioning System

TimeTracker uses a 4-part version: `X.Y.Z.B` where:

- `X.Y.Z` = Semantic version (set via tags)
- `B` = Build number (auto-increments with each commit, resets on version bump)

The build number is derived from `git describe --tags --long`, counting commits since the last version tag.

Example progression:

```
v1.0.0 tag created     → 1.0.0.0
commit                 → 1.0.0.1
commit                 → 1.0.0.2
v1.0.1 tag created     → 1.0.1.0  (build number resets)
commit                 → 1.0.1.1
```

## Scripts

### bump-version.js

Creates a new version tag (bumps major/minor/patch).

```bash
node scripts/git/bump-version.js patch   # 1.0.0 → 1.0.1
node scripts/git/bump-version.js minor   # 1.0.1 → 1.1.0
node scripts/git/bump-version.js major   # 1.1.0 → 2.0.0
```

**What it does:**

1. Gets current version from latest git tag
2. Bumps the specified part
3. Creates annotated git tag
4. Pushes tag to remote

**Requirements:**

- Clean working tree
- On any branch (typically `dev`)

### release.js

Merges `dev` into `main` and creates a GitHub release.

```bash
node scripts/git/release.js
```

**What it does:**

1. Validates you're on `dev` with clean working tree
2. Gets the latest version tag
3. Pulls latest from remote
4. Merges `dev` into `main` (fast-forward only)
5. Pushes `main` and tags to GitHub
6. Creates GitHub release (requires `gh` CLI)
7. Switches back to `dev`

**Requirements:**

- On `dev` branch
- Clean working tree
- Version tag exists (run `bump-version.js` first)
- [GitHub CLI](https://cli.github.com/) installed (optional, for release creation)

## Typical Workflow

1. **Development:** Work on `dev` branch, commit changes
   - Builds show: `1.0.0.1`, `1.0.0.2`, etc.

2. **Version bump:** When ready for a new version

   ```bash
   node scripts/git/bump-version.js patch
   ```

   - Creates tag `v1.0.1`
   - Next build shows: `1.0.1.0`

3. **Release to production:** When ready to deploy

   ```bash
   node scripts/git/release.js
   ```

   - Merges to `main`
   - Creates GitHub release
   - Netlify auto-deploys

## Traceability

Each build includes in `version.json`:

- `version`: Full version string (e.g., `1.0.0.5`)
- `commit`: Short commit hash (e.g., `f76fe51`)
- `buildTime`: ISO timestamp

To find which commit a build came from:

```bash
git show <commit-hash>
# or
git log --oneline | grep <commit-hash>
```
