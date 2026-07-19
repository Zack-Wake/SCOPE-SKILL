<!-- Working name FORGE. Rename here + in README if you pick another. -->
<!-- Read by Claude Code before any session. Keep honest and current. -->

## Project

**Name:** FORGE — personal build pipeline

**What it does:** Takes one seed term and carries it through six stages — FIND → SCOPE → BUILD → RANK → MONETISE → PUBLISH — to a published, monetised, ranking website. Built for one user (Zack), own build decisions. Not a client product, not multi-tenant.

**Status:** Stage 1 (FIND) exists at v2. SCOPE (S2) is the active build. Schema contract defined in S2-001. Stage 3–6 not built.

## This repo's role — S2 SCOPE

SCOPE receives one Vault-band niche record from FIND (schema_version 1.2) and produces two artifacts:

1. **Machine-readable JSON handoff** (`data/specs/<niche_id>.json`) — flat, self-sufficient. BUILD reads only this; it never reads back into FIND.
2. **Written build plan** (`data/plans/<niche_id>.md`) — decision-complete. Every page, layout intent, content requirement, and skill invocation named. BUILD spends tokens building, not deciding.

## How the pipeline works (data flow)

1. **FIND** extrapolates niche data from one seed, sequences it, ranks best→worst via the revenue formula.
2. The full ranked shortlist is **KEPT — never filter rows** (emerging niches stay tracked).
3. Only strongest niches (Vault-band, Tier A/B/C) pass into SCOPE.
4. SCOPE → BUILD → RANK → MONETISE → PUBLISH each consume the previous stage's structured handoff.

## Stages (each is a separate skill / repo)

- **S1 FIND** — SERP Opportunity Finder (exists, v2)
- **S2 SCOPE** — Build Spec: cheapest effective build + build-target selection (this repo)
- **S3 BUILD** — Site Scaffolder
- **S4 RANK** — SEO
- **S5 MONETISE** — revenue mechanism(s)
- **S6 PUBLISH** — deploy, monitor, harden, iterate

## Build-target selection (SCOPE decides — get the facts right)

The pipeline chooses the build tool per niche. Only Claude Code runs natively in VS Code:

- **Claude Code** — agentic, VS Code / terminal. Full-control Next.js + Supabase builds.
- **Replit** — its own cloud IDE + Agent. VS Code-like, has an extension, separate environment. Fast hosted prototypes.
- **Lovable** — browser-based AI app builder. NOT in VS Code; syncs to GitHub, then pull into VS Code. Fast UI-first marketing sites.

Selector chooses on build type and cost, not habit. Decision and reason are mandatory fields in the SCOPE→BUILD JSON.

## Stack (default)

- Next.js + Supabase (standard)
- n8n for automation (later — only after the manual flow is proven)
- Claude Code on Windows, VS Code
- Per-niche build target may vary (see above)

## Quality bars (DoD on EVERY SCOPE output)

- **BUILD raises no questions** caused by ambiguity or missing decisions. BUILD has an explicit duty to halt-and-flag contradictions — flagging a broken spec is a pass for BUILD, a fail for SCOPE.
- **No AI slop.** Distinctive, intentional design intent. If differentiation is generic, it's not done.
- **Search intent per page** — every page in the spec has a mandatory, specific search intent. "General information" is not an intent.
- **Adapt, don't clone** — competitor patterns noted may be adopted but must be reinterpreted. Own design, own copy, own structure.
- **Human review** — every SCOPE spec must pass human review before BUILD is invoked. The gate is: BUILD raises no questions after reading it.

## Autonomy ladder

- **L0 (now):** human approves EVERY stage gate.
- **L1:** human approves at stage boundaries only; skill runs freely within a stage.
- **L2:** runs multiple stages when explicitly prompted, stopping at named checkpoints.
- **Never autonomous for:** publishing live, security sign-off, anything that spends money.
- A stage earns the next level only after running clean ~5× under human approval.

## Handoff contracts

- SCOPE reads: `references/vault_schema.md` in the FIND repo (schema_version 1.2, 25 fields).
- SCOPE emits: `scope_schema.md` (this repo) — the SCOPE→BUILD contract.
- **Keystone:** the full contract is in `scope_schema.md`. This CLAUDE.md is the context layer only.

## Git Rules

- **One repo per skill/site, one branch per packet.** Map by packet prefix: PROD→FORGE repo, S1→FIND, S2→SCOPE, S3→the site's own repo, S4→RANK, S5→MONETISE, S6→PUBLISH.
- **Find the packet's repo.** If it exists → branch `task/[packet-id]-desc`, work to DoD, test, push, PR. If it doesn't (first packet of a new skill/site) → create the repo named for the skill/site, init with CLAUDE.md + README, then same flow.
- **Test before PR** = DoD met + nothing regressed + the packet's validation gate passes.
- **Never commit to main.** Always branch → PR → human review of the diff → merge.
- At L0, repo-create and branch can run unattended; **merge stays human-reviewed every time**.

## Claude Code rules

- Read this file before touching anything
- Work only on the packet's declared scope
- Stop at Definition of Done — do not expand scope
- Don't modify files outside the packet's declared targets
- Produce a change summary when done

## Must not do

- Change the stack without a new packet
- Delete files without explicit instruction
- Invent conventions not defined here
- Mark a SCOPE spec Done without the gate passing (BUILD must be able to execute without questions)
- **Rebuild an existing skill from scratch.** Read current SKILL.md + references/ first and EXTEND. Recreating working functionality is a failure, not progress.
- Touch the FIND repo or vault_schema.md — SCOPE is a consumer, not an owner, of that contract.
- Fabricate or default missing S1 fields — if a required field is absent in the handoff, flag it, don't invent.

## The one rule (anti-side-track)

New idea mid-session → write it as a Draft packet tagged with its stage → keep building the current thing. Capture, don't chase.
