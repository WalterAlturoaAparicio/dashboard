# Contributing — GitFlow Branch Strategy

## Branch model

```
master ──────────────────────────────────────── (production, Railway deploys here)
    │
    └── develop ─────────────────────────────── (integration, PRs merge here)
            │
            ├── feature/frequency-chart ─────── (new features)
            ├── feature/ticket-export
            └── hotfix/scraper-selector ──────── (urgent fix, branches from master)
```

## Branch types

| Branch | Base | Merges into | Purpose |
|--------|------|-------------|---------|
| `master` | — | — | Production. Railway auto-deploys on every push. **Protected — no direct push.** |
| `develop` | `master` | `master` | Integration branch. All features land here before going to production. |
| `feature/<name>` | `develop` | `develop` | New functionality. One feature per branch. |
| `hotfix/<name>` | `master` | `master` + `develop` | Urgent production fix. Bypass `develop`. |
| `refactor/<name>` | `develop` | `develop` | Code refactoring without behavior change. |

## Workflow

### Starting a new feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... work ...
git push -u origin feature/my-feature
# Open PR: feature/my-feature → develop
```

### Releasing to production

```bash
git checkout master
git merge develop --no-ff -m "release: vX.Y.Z"
git push origin master
# Railway deploys automatically
```

### Hotfix

```bash
git checkout master
git pull origin master
git checkout -b hotfix/fix-scraper
# ... fix ...
git push -u origin hotfix/fix-scraper
# Open two PRs:
#   hotfix/fix-scraper → master
#   hotfix/fix-scraper → develop
```

## Commit message conventions

Use the format: `<type>: <short description>`

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build scripts, dependencies, config |
| `ci` | CI/CD changes |

Examples:
```
feat: add PDF export for generated tickets
fix: scraper selector updated for new baloto.com layout
refactor: monorepo restructure (backend→apps/api)
docs: add Railway deployment guide
test: add E2E test for sync rate limiting
```

## Pull request rules

- **Target branch**: `develop` (or `master` for hotfixes)
- **Title**: follow commit convention above
- **Description**: explain *what* and *why*, not *how*
- **Reviews**: at least 1 approval required before merge
- **CI**: all tests must pass (`yarn test` + `yarn test:e2e`)
- **No direct push** to `master` — enforced via GitHub branch protection

## Branch protection (master)

`master` is protected with these rules:
- Require pull request before merging
- Require at least 1 approving review
- Block force pushes
- Block branch deletion
