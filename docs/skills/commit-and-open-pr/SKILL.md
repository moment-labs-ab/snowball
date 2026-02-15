---
name: commit-and-open-pr
description: Stage and commit current-branch changes, push the branch, and create or update a GitHub pull request targeting develop with a complete reviewer-ready description. Use when the user asks to package work into a PR, asks to commit and open a PR, or needs a high-quality PR summary with functional and UI/UX impact.
---

# Commit and Open PR

## Overview

Execute an end-to-end Git workflow from the current branch to a PR against `develop`, then produce a detailed PR description that lets another engineer understand exactly what changed.

## Prerequisites

- Run inside a Git repository.
- Ensure `gh` CLI is installed and authenticated.
- Use `develop` as the default base branch unless the user specifies a different base.

## Workflow

1. Inspect repository state.
- Run `git rev-parse --abbrev-ref HEAD` and `git status --short`.
- Confirm the current branch is not the base branch.
- If there are no changes, do not create a commit. Explain that there is nothing to commit.

2. Stage and commit all local changes.
- Run `git add -A`.
- Write a concise commit message in imperative mood, ideally <= 72 characters.
- Run `git commit -m "<message>"`.
- If there are no staged changes after `git add -A`, skip commit and continue only if a PR update is still requested.

3. Push branch to remote.
- Run `git push -u origin <current-branch>` on first push.
- Run `git push` for subsequent updates.

4. Build a detailed PR description.
- Run `scripts/generate_pr_body.sh develop /tmp/pr_body.md` from this skill.
- Replace placeholders with concrete facts from the diff and commit history.
- Keep all sections even when empty; write `None` when not applicable.

5. Create or update pull request.
- If no PR exists: run
  `gh pr create --base develop --head <current-branch> --title "<pr-title>" --body-file /tmp/pr_body.md`.
- If a PR already exists for the branch: run
  `gh pr edit <pr-number-or-url> --title "<pr-title>" --body-file /tmp/pr_body.md`.
- Prefer PR title style: `<scope>: <summary>` and keep it specific.

6. Report outcome.
- Return commit SHA, branch name, and PR URL.
- Summarize key changes in 3-6 bullets.

## PR Description Quality Bar

Always include these sections in the PR body:

1. `Description`
2. `Functional Changes Made`
3. `UI/UX Changes Made`
4. `Technical Details`
5. `Testing`
6. `Risk / Rollout`
7. `Migration / Data Impact`
8. `Rollback Plan`
9. `Linked Issues`
10. `Reviewer Focus Areas`
11. `Screenshots / Recordings` (when UI changed)

These additional sections make the PR self-contained for reviewers and for future debugging.

## Resources

- Template: `references/pr-body-template.md`
- Body generator: `scripts/generate_pr_body.sh`
