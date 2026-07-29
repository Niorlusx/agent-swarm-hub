# agent-swarm-hub
Main hub controlling all agents - 24/7 development automation mega swarm. Connects Web, GitHub, Google Cloud, Automation Orchestration, Stripe.

## Workflow authentication baseline
- All write-capable workflows use:
  - `permissions: contents: write` and `pull-requests: write`
  - `actions/checkout@v4` with `token: ${{ secrets.GITHUB_TOKEN }}`
  - standard git identity:
    - `github-actions[bot]`
    - `41898282+github-actions[bot]@users.noreply.github.com`
- Push steps export `GITHUB_TOKEN` in the step environment.

## Reusable workflow template
- `.github/workflows/base-permissions.yml` provides the shared baseline for:
  - permissions
  - token wiring
  - standard git identity

## Branch protection policy
- `.github/branch-protection.yaml` defines required protections for `main`:
  - required status checks for workflow jobs
  - pull request review requirement
  - stale review dismissal on new commits

## Ecosystem coordination
- `workflow_dispatch` is enabled for manual/automation orchestration.
- This repository acts as the control hub; sibling repositories (for example `omni-decoder-elite`) should mirror the same token/permission baseline for synchronized automation.
