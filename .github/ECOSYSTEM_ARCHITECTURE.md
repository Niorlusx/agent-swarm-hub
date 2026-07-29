# Ecosystem Architecture

## Overview

`agent-swarm-hub` is the control-plane repository for the automation ecosystem. The hub owns the controller workflow, records swarm state, and fans out synchronization events to downstream repositories when the controller completes successfully.

## Workflow Topology

1. **`swarm-controller.yml`** runs on pushes to `main`, on a 5-minute schedule, and by manual dispatch.
2. **`ecosystem-sync.yml`** runs after successful `AI Swarm Controller` executions or by manual dispatch.
3. **Downstream repositories** listen for the `repository_dispatch` event type `ecosystem-sync`.

## Permissions Model

Use the same baseline permissions across controller-style workflows:

```yaml
permissions:
  contents: write
  pull-requests: write
  actions: write
```

- `contents: write` allows state commits, repository dispatches, and other repository updates.
- `pull-requests: write` supports future automation that opens or updates pull requests.
- `actions: write` supports workflow-to-workflow coordination across the ecosystem.

## Authentication Standard

- Always pass `${{ secrets.GITHUB_TOKEN }}` to `actions/checkout@v4`.
- Use the standard bot identity:
  - `github-actions[bot]`
  - `41898282+github-actions[bot]@users.noreply.github.com`
- For cross-repository dispatch, configure `ECOSYSTEM_SYNC_TOKEN` with access to the target repositories.

## Repository Settings Checklist

For every ecosystem repository:

- Enable **Settings → Actions → General → Read and write permissions**
- Enable **Allow GitHub Actions to create and approve pull requests**
- Add `ECOSYSTEM_SYNC_TARGETS` as a repository variable when dispatch targets are ready
- Add `ECOSYSTEM_SYNC_TOKEN` as a repository secret for cross-repository dispatch
- Confirm branch protection rules still allow the intended automation path

## Cross-Repository Operation Example

```yaml
on:
  repository_dispatch:
    types: [ ecosystem-sync ]
```

Example payload fields sent by the hub:

- `source_repository`
- `source_workflow`
- `source_run_id`
- `source_sha`

## Troubleshooting

### 403 permission denied for `github-actions[bot]`

1. Verify the workflow has a `permissions` block with `contents: write`.
2. Confirm repository Actions settings allow read/write workflow permissions.
3. Ensure checkout receives `${{ secrets.GITHUB_TOKEN }}`.
4. Ensure push or dispatch steps run with `GITHUB_TOKEN` or `ECOSYSTEM_SYNC_TOKEN`.

### Cross-repo sync does not fire

1. Verify `ECOSYSTEM_SYNC_TARGETS` contains comma-separated `owner/repo` values.
2. Confirm `ECOSYSTEM_SYNC_TOKEN` has access to each target repository.
3. Confirm target repositories subscribe to `repository_dispatch` type `ecosystem-sync`.
