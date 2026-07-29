# GitHub Actions Setup Guide

## Goal
Fix 403 push errors for workflows and enable cross-repository synchronization.

## 1) Configure Repository Settings (required once)
1. Open **Settings → Actions → General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Enable **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

## 2) Required Workflow Configuration
For any workflow that must push commits:
- Declare:
  - `permissions.contents: write`
  - `permissions.pull-requests: write` (if PR operations are needed)
  - `permissions.actions: write` (if workflow orchestration/dispatch is needed)
- Use checkout with explicit token:
  - `actions/checkout@v4` + `token: ${{ secrets.GITHUB_TOKEN }}`
- Use standard bot identity:
  - `github-actions[bot]`
  - `github-actions[bot]@users.noreply.github.com`
- Export `GITHUB_TOKEN` in push step environment
- Skip empty commits by checking staged diff before commit

## 3) Optional Cross-Repo Sync Token
If dispatching events to another private repository, add:
- `ECOSYSTEM_SYNC_TOKEN` (PAT with access to target repository)
- Optional repository variables for sync target:
  - `ECOSYSTEM_SYNC_OWNER`
  - `ECOSYSTEM_SYNC_REPO`

## 4) Validation Checklist
- Swarm workflow runs successfully
- State/log files commit without 403
- Ecosystem sync workflow triggers after successful swarm run
- Satellite dispatch is visible in workflow logs

## 5) Troubleshooting
### 403 denied to github-actions[bot]
- Re-check repository Actions permissions setting
- Confirm workflow has `permissions.contents: write`
- Confirm checkout and push steps use `GITHUB_TOKEN`

### No commit produced
- Expected when no tracked files changed
- Ensure state or log files actually update each run
