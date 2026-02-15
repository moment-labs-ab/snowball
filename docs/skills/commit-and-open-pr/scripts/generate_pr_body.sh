#!/usr/bin/env bash

set -euo pipefail

BASE_BRANCH="${1:-develop}"
OUT_FILE="${2:-/tmp/pr_body.md}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: run inside a git repository." >&2
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${CURRENT_BRANCH}" == "${BASE_BRANCH}" ]]; then
  echo "Error: current branch matches base branch (${BASE_BRANCH})." >&2
  exit 1
fi

BASE_REF="${BASE_BRANCH}"
if git show-ref --verify --quiet "refs/remotes/origin/${BASE_BRANCH}"; then
  BASE_REF="origin/${BASE_BRANCH}"
fi

COMMITS_TEXT="$(git log --pretty=format:'- %h %s' "${BASE_REF}..HEAD" || true)"
FILES_TEXT="$(git diff --name-only "${BASE_REF}...HEAD" || true)"
SCOPES_TEXT="$(printf '%s\n' "${FILES_TEXT}" | awk -F/ 'NF {print $1}' | sort -u || true)"

{
  echo "# Description"
  echo
  echo "Summarize the intent and outcome of this PR in 2-4 sentences."
  echo
  echo "# Functional Changes Made"
  echo
  echo "## Commit Summary"
  if [[ -n "${COMMITS_TEXT}" ]]; then
    printf '%s\n' "${COMMITS_TEXT}"
  else
    echo "- No new commits found compared to ${BASE_REF}."
  fi
  echo
  echo "## Changed Files"
  if [[ -n "${FILES_TEXT}" ]]; then
    printf '%s\n' "${FILES_TEXT}" | sed 's/^/- /'
  else
    echo "- No file-level diff found compared to ${BASE_REF}."
  fi
  echo
  echo "## Impacted Areas"
  if [[ -n "${SCOPES_TEXT}" ]]; then
    printf '%s\n' "${SCOPES_TEXT}" | sed 's/^/- /'
  else
    echo "- Unknown"
  fi
  echo
  echo "# UI/UX Changes Made"
  echo
  echo "- Add user-facing updates, interaction changes, and copy changes."
  echo "- If none: None."
  echo
  echo "# Technical Details"
  echo
  echo "- Note architecture or implementation choices."
  echo
  echo "# Testing"
  echo
  echo "- Automated tests added/updated:"
  echo "- Manual validation performed:"
  echo "- Commands run:"
  echo
  echo "# Risk / Rollout"
  echo
  echo "- Risk level: Low / Medium / High"
  echo "- Potential failure modes:"
  echo "- Rollout strategy:"
  echo
  echo "# Migration / Data Impact"
  echo
  echo "- Schema/data changes:"
  echo "- Backfill needed:"
  echo "- If none: None."
  echo
  echo "# Rollback Plan"
  echo
  echo "- Step-by-step rollback instructions."
  echo
  echo "# Linked Issues"
  echo
  echo "- Closes #"
  echo "- Related #"
  echo
  echo "# Reviewer Focus Areas"
  echo
  echo "- Note high-risk logic and files for deep review."
  echo
  echo "# Screenshots / Recordings"
  echo
  echo "- Add before/after assets for UI work."
  echo "- If none: None."
} >"${OUT_FILE}"

echo "Wrote PR body draft to ${OUT_FILE}"
