# Ecosystem Architecture

## Purpose
`agent-swarm-hub` is the control repository for swarm state updates and ecosystem-wide coordination events.

## Core Workflows

### 1) AI Swarm Controller (`/home/runner/work/agent-swarm-hub/agent-swarm-hub/.github/workflows/swarm-controller.yml`)
- Runs on `push`, schedule (`*/5 * * * *`), and manual dispatch
- Maintains `.swarm/state/swarm.json`
- Logs deployments to `.swarm/logs/deploy.log`
- Commits and pushes only when there are actual state/log changes

### 2) Ecosystem Sync (`/home/runner/work/agent-swarm-hub/agent-swarm-hub/.github/workflows/ecosystem-sync.yml`)
- Triggers after successful Swarm Controller runs
- Emits a repository dispatch event for satellite synchronization
- Currently targets `Niorlusx/omni-decoder-elite`

## Repository Roles
- **Hub (this repo):** source of swarm state and orchestration trigger events
- **Satellite repos:** consume sync events and execute repo-specific automation

## Deployment Flow
1. Swarm Controller runs and updates state/log files.
2. Workflow commits and pushes updates using `github-actions[bot]`.
3. Successful completion triggers Ecosystem Sync.
4. Ecosystem Sync dispatches `sync-from-agent-swarm-hub` to satellites.

## One-Time Admin Requirement
In this repository: **Settings → Actions → General**
- Set Workflow permissions to **Read and write permissions**
- Enable **Allow GitHub Actions to create and approve pull requests**
