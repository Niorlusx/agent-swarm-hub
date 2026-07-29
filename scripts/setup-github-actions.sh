#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Niorlusx/agent-swarm-hub}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install from https://cli.github.com/."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run 'gh auth login' first."
  exit 1
fi

echo "Configuring Actions workflow permissions for ${REPO}..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/actions/permissions/workflow" \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=true >/dev/null

echo "Configuration complete."
echo "Confirmed settings:"
echo "- Workflow permissions: Read and write"
echo "- Allow GitHub Actions to create and approve pull requests: enabled"
