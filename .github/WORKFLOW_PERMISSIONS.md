# Workflow Permissions & Authentication Guide

## Overview
This document standardizes GitHub Actions permissions and authentication across the agent-swarm-hub ecosystem.

## Key Principles

### 1. Minimal Permissions
Each workflow declares only the permissions it needs:
```yaml
permissions:
  contents: write      # For pushing commits/tags
  pull-requests: write # For creating/updating PRs
  actions: write       # For triggering other workflows
```

### 2. Token Management
- Always use `${{ secrets.GITHUB_TOKEN }}` (automatically provided by GitHub Actions)
- Pass token explicitly to `actions/checkout@v4`:
  ```yaml
  - uses: actions/checkout@v4
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
  ```
- Export as environment variable for git operations:
  ```yaml
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ```

### 3. Git Configuration
Use the standard GitHub Actions bot identity:
```yaml
git config --local user.name "github-actions[bot]"
git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
```

### 4. Push Operations
Always check for changes before committing:
```yaml
git add .swarm/state/swarm.json
if ! git diff --cached --quiet; then
  git commit -m "Message [skip ci]"
  git push origin "HEAD:${GITHUB_REF_NAME}"
fi
```

Add the workflow token to any step that pushes:
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Repository Settings

### Enable Workflow Permissions
1. Go to **Settings → Actions → General**
2. Select **"Read and write permissions"**
3. Check **"Allow GitHub Actions to create and approve pull requests"**

### Branch Protection Rules
Recommended rules for `main`:
- ✅ Require status checks to pass
- ✅ Require pull request reviews (1+ reviewer)
- ✅ Dismiss stale PR reviews
- ✅ Require up-to-date branches

## Workflow Templates

### Standard Commit/Push Workflow
```yaml
name: Example Workflow
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  actions: write
  
jobs:
  work:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Make changes
        run: |
          timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
          echo "{\"updated_at\":\"${timestamp}\"}" > state.json
      
      - name: Commit and push
        run: |
          git config --local user.name "github-actions[bot]"
          git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
          
          git add state.json
          if ! git diff --cached --quiet; then
            git commit -m "automated commit [skip ci]"
            git push origin "HEAD:${GITHUB_REF_NAME}"
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Error: "Permission denied to github-actions[bot]"
**Solution:**
1. Check repository settings → Actions → General → "Read and write permissions"
2. Verify workflow has `permissions: { contents: write }`
3. Ensure `token: ${{ secrets.GITHUB_TOKEN }}` in checkout step
4. Add `GITHUB_TOKEN` env variable to push step

### Error: "fatal: unable to access repository"
**Solution:**
1. Verify `actions/checkout@v4` has `token` parameter
2. Check GITHUB_TOKEN is exported as environment variable
3. Ensure git config uses the standard `github-actions[bot]` identity

### Workflow runs but doesn't push changes
**Solution:**
1. Add the intended files with `git add`
2. Check for staged changes with `git diff --cached --quiet`
3. Check branch name matches the push target and `HEAD:${GITHUB_REF_NAME}`

## Related Documentation

- [`ECOSYSTEM_ARCHITECTURE.md`](./ECOSYSTEM_ARCHITECTURE.md)

## Cross-Repo Coordination

For workflows that span multiple repositories, use:
- `actions/github-script@v7` for API calls
- Repository dispatch events
- Workflow outputs to pass data between repos

Example:
```yaml
- uses: actions/github-script@v7
  with:
    script: |
      await github.rest.repos.createDispatchEvent({
        owner: 'Niorlusx',
        repo: 'omni-decoder-elite',
        event_type: 'sync-from-hub'
      });
```

## Security Considerations

1. **Never commit secrets** — Use GitHub Secrets Management
2. **Scope tokens carefully** — Use minimal required permissions
3. **Review workflow runs** — Check logs for unexpected behavior
4. **Use branch protection** — Prevent direct pushes to main
5. **Sign commits** — Consider GPG signing for production workflows

## References
- [GitHub Actions Permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
- [GitHub Token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Checkout Action](https://github.com/actions/checkout)
