---
name: issue
description: Work one task on the personal website (noahberrie.com, Astro) end-to-end on its own branch — take a free-text task you give after /issue (e.g. "fix the layout shift on the works page" or "the info page loads slowly"), reproduce, fix, verify with a clean build + real browser, run the mandatory /simplify → /code-review → /security-review review gauntlet (each skill invoked top-level so its own review agents run; a subagent re-builds + re-screenshots every affected route after each step), commit, then present plain-language trade-offs. On approval: push + PR + squash-merge to main (GitHub Actions deploys to noahberrie.com) + close any linked issue.
trigger: /issue
allowed-tools: Skill
---

# /issue

Take one task and carry it through a full, isolated pipeline:
**take the task → branch → reproduce → diagnose → fix → verify (build + browser) → /simplify → /code-review → /security-review → commit → present trade-offs → (on approval) push + PR + merge (deploys) → close any linked issue.**

You invoke `/issue` with a plain-English task — e.g. `/issue fix the layout shift on the works page` or `/issue the info page loads slowly`. (You can also point at a GitHub issue — a number, URL, or "the latest open one" — but no issue is required; the free-text task is the spec.) One task per run.

This repo is an **Astro v5 static site** (`output: 'static'`) deployed to **https://noahberrie.com via GitHub Pages**: the workflow `.github/workflows/deploy.yml` runs `astro build` and deploys on every **push to `main`** — so merging to `main` is a production deploy. There is a real build and dev server, so **both a clean `npm run build` and a real-browser render are the verification gates.**

- `REPO = no-ahb/website`
- `ROOT = /Users/noahberrie/Developer/personal-website`
- File-based routing under `src/pages/` (`trailingSlash: 'always'`, so URLs end in `/`):
  `index.astro` → `/`, `info.astro` → `/info/`, `scoring.astro` → `/scoring/`, `works/[...slug].astro` → `/works/<slug>/`, `404.astro`.
- Layout `src/layouts/Base.astro`; components in `src/components/` (`Nav`, `WorkCard`, `AudioPlayer`); global styles in `src/styles/main.css`; helpers in `src/lib/` (e.g. `asset.ts`); content collection `works` in `src/content/works/` (typed frontmatter: `title`, `medium`, `year`, `thumbnail`, `sortOrder`, `draft`, …).

---

## Environment
- **Node:** Astro 5 needs Node ≥20 (CI uses 22). The default shell node on this machine is too old — if `astro` / `npm run` fails with an engine error, run `nvm use 22` first.
- Dev (explore/repro): `npm run dev` → http://localhost:4321. Build (the gate): `npm run build` → `dist/`. Preview the built output (what Pages serves): `npm run preview` → http://localhost:4321.

---

## HARD RULES — read before doing anything
1. **Nothing leaves the machine until you approve — then everything does.** No `git push`, PR, merge, or issue close during the work. On approval, run the whole Phase 9 closeout in one go without re-asking between steps. Merging to `main` **deploys to noahberrie.com**, so that approval is the explicit yes the push/merge needs.
2. **Verify before claiming it works** (Phase 5): `npm run build` must pass AND a real-browser screenshot of the affected route(s) must look right. "It builds" alone isn't enough — load the page.
3. **The Phase 6 review gauntlet is mandatory and never silently skipped** — /simplify → /code-review → /security-review run in that fixed order on every task, each invoked top-level (not wrapped in a subagent).
4. **Keep the diff minimal** — do the one task, no drive-by refactors or new abstractions. Default to no comments; add one only where the *why* is non-obvious.
5. **Tone:** direct, plain, brief. State the result and stop. No filler, no recap.
6. **Stage files by name** — never `git add -A` blindly (avoid sweeping in `.video-originals/` or other large local originals). `dist/`, `.astro/`, `node_modules/` are gitignored; large image/video originals go through `npm run optimize-images` and only the optimized assets are committed.

---

## Pipeline

### Phase 1 — Take the task & branch
1. Parse the task from what you typed after `/issue`. If you pointed at a GitHub issue (number/URL/"latest open"), `gh issue view <n> --comments` and use it; otherwise the free-text task is the spec. Restate it in one plain-English line and note which route/screen it touches.
2. Branch off the latest main:
   ```bash
   cd "$ROOT"
   git fetch origin main
   git switch -c fix/<slug> origin/main
   ```
   `<slug>` = short lowercase topic, e.g. `works-layout-shift` (prefix `issue-<n>-` if tied to an issue). For parallel tasks, use a worktree under `.claude/worktrees/` instead so branches don't collide.

### Phase 2 — Reproduce & locate
- Map the task's route → page in `src/pages/`, then the layout/components/styles it pulls in (`Base.astro`, `src/components/*`, `src/styles/main.css`). Content lives in `src/content/`.
- If it's visual/behavioral, reproduce in a browser: `npm run dev`, load the route, screenshot (Phase 5 command). For a screenshot you provide, `curl -sL "<url>" -o /tmp/issue-before.png` and Read it.

### Phase 3 — Diagnose
State the root cause in one or two plain sentences. Note confidence and anything uncertain.

### Phase 4 — Fix (on the branch)
Edit the relevant `src/**/*.astro` / `.ts` / `src/styles/main.css` / content. Match surrounding style (`.astro` components with frontmatter + scoped/global CSS, plain semantic class names, the `works` content schema, `src/lib/asset.ts` for asset paths). New images/video: run `npm run optimize-images` (sharp) and reference the optimized asset; keep originals in `.video-originals/` out of git.

### Phase 5 — Verify (build + browser) — the gate
```bash
cd "$ROOT"                 # nvm use 22 first if astro errors on node engine
npm run build              # MUST succeed — the real compile/type gate
npm run preview >/tmp/issue-srv.log 2>&1 &
for i in $(seq 1 40); do curl -sf http://localhost:4321/ >/dev/null && break; sleep 0.5; done
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1280,1400 \
  --virtual-time-budget=6000 --screenshot=/tmp/issue-after.png \
  "http://localhost:4321/<route>/"
pkill -f "astro preview"
```
Read `/tmp/issue-after.png`, confirm the fix renders against the built output and nothing nearby regressed. Check the affected route plus any route the change could touch. Report the build result and what you saw.

### Phase 6 — Review gauntlet (mandatory · sequential · /simplify → /code-review → /security-review)

**Hardcoded.** All three steps run on every task, in this exact order, with no skipping or reordering — even for a one-line fix.

**Invoke each skill top-level from this orchestrator loop, one at a time, via the Skill tool — do NOT wrap a skill inside a subagent.** Each is itself a subagent-orchestrated review (`/code-review`, `/security-review`, and `/simplify` fan out to their own internal review agents), and a subagent cannot spawn further subagents — so wrapping one in a subagent would suppress or break its fan-out. Running them at the top level is what lets each skill be *implemented by its own subagents*. The `/issue` frontmatter pre-approves the `Skill` tool, so they run without a permission prompt. Run them in sequence; each sees the working tree as left by the previous step. They review this branch's uncommitted diff (before the Phase 7 commit).

- **Step 6a — `/simplify` (quality).** Invoke `skill: "simplify"`. It reviews the changed code for reuse, simplification, efficiency, and altitude cleanups and **applies** the fixes — quality only; it does **not** hunt for bugs (that's 6b). Stay scoped to files changed this run; preserve behavior; match repo style.
- **Step 6b — `/code-review` (correctness bugs).** Invoke `skill: "code-review"` with args `high --fix` to find correctness bugs in the diff and apply the fixes. Do **not** use the `ultra` level (a billed, user-triggered cloud review you can't launch).
- **Step 6c — `/security-review` (security).** Invoke `skill: "security-review"` on the branch's pending changes. Risk surface for this static Astro site: XSS via `set:html` or inline scripts fed unescaped/external data, secrets accidentally shipped into client-side JS, untrusted external embeds/links, and any remote/user content pulled in at build time (content collections, `fetch` in frontmatter).

**After each step, a dedicated verification subagent rigorously tests every new branch of code.** Spawn it with **full tool access** (`agentType: general-purpose`, model `sonnet` — `Tools: *`, so it can run `npm` + headless Chrome). It must (1) **enumerate every new or changed code path** the fix + this step introduced — each added conditional/branch, route, conditional render, data/empty/error case — and verify each, then (2) **re-run the Phase 5 gate**: `npm run build` must pass, then screenshot each affected route (build + preview) and confirm it renders with no regression. Report the build result and routes checked. (`nvm use 22` first if node errors.)

**HARD RULE 1 still binds every step:** nothing is pushed, merged, or deployed here — review changes stay local on the branch until you approve in Phase 8.

Capture per step: what the skill found & changed (or "no changes needed"), every new branch the verification subagent exercised, the build result, and the routes screenshotted. **Report all three steps in the Phase 8 "Checked" line** so the whole gauntlet is auditable.

### Phase 7 — Commit
```bash
git add <specific files>
git commit
```
Conventional summary + a body explaining the user-facing problem and the fix, ending with:
```
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```
Stage files by name (never `git add -A` — avoid sweeping in `.video-originals/` or other local originals). **Do not push.**

### Phase 8 — Present (plain language + trade-offs), then wait
Terse. One short line per field; drop any that would say "none". Then stop for the user.
```
**Task:** <one line — what you asked for>
**Cause:** <one line, plain>
**Fix:** <what changed>
**Checked:** <build pass/fail · browser route(s) screenshotted + result · gauntlet — simplify / code-review / security-review: each found & changed or "no changes" + new branches exercised>
**Options:** <only if a real fork — ≤2, one line each>
**You:** approve → I push + PR + squash-merge to main (deploys to noahberrie.com) + close any linked issue / tweak / discard
```

### Phase 9 — On approval, close out automatically
"Approve" (or any clear yes) triggers ALL of this in one turn — don't re-ask between steps:
1. `git push -u origin fix/<slug>`
2. `gh pr create` with a body summarizing the change (add `Closes #<n>` only if tied to an issue).
3. **Merge:** `gh pr merge --squash --delete-branch` (squash is the convention; merge to `main` triggers the Pages deploy, ~1–2 min). **If merge is blocked** (protection/checks): STOP, leave PR + branch + issue untouched, report the blocker — steps 4–5 run only after a real merge.
4. Optionally confirm the deploy went green: `gh run watch` (or `gh run list --workflow=deploy.yml`). If tied to an issue, confirm `#<n>` closed (the `Closes #<n>` usually does it on merge; otherwise `gh issue close <n> --comment "<what was done + PR link>"`).
5. Clean up: `git switch main && git pull` so root is back on the deployed main; the branch was deleted by `--delete-branch` (else `git branch -D` + `git push origin --delete`).
If you tweak instead of approving, iterate on the same branch and re-present.
