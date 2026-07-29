# Ecosystem Architecture

## Purpose
`agent-swarm-hub` is the control repository for swarm state updates and ecosystem-wide coordination events.

## Core Workflows

### 1) AI Swarm Controller (`.github/workflows/swarm-controller.yml`)
- Runs on `push`, schedule (`*/5 * * * *`), and manual dispatch
- Maintains `.swarm/state/swarm.json` (the only artifact committed per run)
- Logs deployments to `.swarm/logs/deploy.log` (workflow log only — not committed)
- Commits and pushes only when `.swarm/state/swarm.json` actually changes

### 2) Ecosystem Sync (`.github/workflows/ecosystem-sync.yml`)
- Triggers after successful Swarm Controller runs or via manual dispatch
- Reads target repository from repository variables `ECOSYSTEM_SYNC_OWNER` / `ECOSYSTEM_SYNC_REPO`
- Skips dispatch gracefully when those variables are not set
- Emits a `sync-from-agent-swarm-hub` repository dispatch event to the configured satellite repo
- Uses `ECOSYSTEM_SYNC_TOKEN` secret for cross-repo access (falls back to `GITHUB_TOKEN` for public repos)

## Repository Roles
- **Hub (this repo):** source of swarm state and orchestration trigger events
- **Satellite repos:** consume `sync-from-agent-swarm-hub` dispatch events and execute repo-specific automation

## Deployment Flow
1. Swarm Controller runs and updates `.swarm/state/swarm.json`.
2. Workflow commits and pushes state using `41898282+github-actions[bot]@users.noreply.github.com` identity.
3. Successful completion triggers Ecosystem Sync.
4. Ecosystem Sync dispatches `sync-from-agent-swarm-hub` to the configured satellite repo.

## Configuration

### Required repository variables (Settings → Secrets and variables → Actions → Variables)
| Variable | Description |
|---|---|
| `ECOSYSTEM_SYNC_OWNER` | GitHub owner/org of the satellite repository |
| `ECOSYSTEM_SYNC_REPO` | Name of the satellite repository |

### Optional secret
| Secret | Description |
|---|---|
| `ECOSYSTEM_SYNC_TOKEN` | PAT with `repo` scope for private satellite repos. If absent, `GITHUB_TOKEN` is used (only works for public repos). |

## One-Time Admin Requirement
In this repository: **Settings → Actions → General**
- Set Workflow permissions to **Read and write permissions**
- Enable **Allow GitHub Actions to create and approve pull requests**
