<!-- Stage 2 of FORGE. Read by Claude Code before any session. -->
<!-- Keep honest and current. Parent rules live in the FORGE repo. -->

## Project

**Name:** SCOPE — Stage 2 of FORGE

**What it does:** Takes ONE validated niche record from FIND (Vault
handoff, schema_version 1.2) and produces a decision-complete build
spec that BUILD executes without asking clarifying questions.

**Status:** Not built. First packet = S2-001, the SCOPE→BUILD contract
(scope_schema.md). No S2 logic exists yet.

## Position in the pipeline

FIND → **SCOPE** → BUILD → RANK → MONETISE → PUBLISH

- **In:** one Vault handoff record (25 fields, vault_schema.md v1.2).
  One record in → one build spec out. Never batch, never re-rank —
  ranking and cutting is FIND's gate, already passed.
- **Out:** two artifacts — a machine-readable handoff (JSON) and a
  written build plan (markdown). Both self-sufficient: BUILD never
  reads back into FIND.

## What SCOPE owns

- system_type (website / web app / software) + archetype
- build_target (Claude Code / Replit / Lovable) + reason
- domain + hosting
- monetisation_hypothesis — SKETCH ONLY (S5 and the monetisation
  skill own the depth)
- skills_required — which skills BUILD must invoke, at which step
- search_intent — per page, mandatory
- differentiation — where this build wins
- page map / site structure

## What SCOPE does NOT own

- Ranking or filtering niches (FIND)
- Deep monetisation strategy (MONETISE)
- SEO execution (RANK)
- Deploy, monitoring, iteration (PUBLISH)

Seeding those stages is in scope. Running them is not. This is what
keeps S2 thin.

## Core principles

- **Generic, niche-agnostic.** SCOPE must handle any record FIND
  emits, for any niche, forever. Never hardcode assumptions from any
  one niche — sample records are validation fixtures, not design input.
- **Design-first.** Define the output contract before writing logic.
- **Decision-complete specs.** Every page, layout intent, content
  requirement and skill invocation named. BUILD spends tokens
  building, not deciding.
- **Search intent is the root.** Every page states what the searcher
  is trying to find or get answered, and exists to serve it. Sites
  feel templated when they're built for keywords instead of people.
- **Adapt, don't clone.** Competitor patterns may be adopted but must
  be reinterpreted — own design, own copy, own structure. Test:
  side-by-side, neither site looks derived from the other.
- **Clean gap beats a guessed number.** Missing data is flagged
  (plan_confidence LOW), never estimated into looking solid.

## Quality floor vs token efficiency

Quality bars are non-negotiable minimums. Token-efficiency is measured
only AFTER the bars are met, and only ambiguity/rework tokens count
against SCOPE. Tokens spent building well are the formula working —
they are never traded against quality.

## Validation gate

A spec passes when BUILD raises no questions caused by ambiguity or
missing decisions. BUILD has an explicit duty to halt-and-flag
contradictions — flagging a broken spec is a PASS for BUILD and a FAIL
for SCOPE. Human review over the docs always (autonomy L0).

## Git rules

- One branch per packet: `task/[packet-id]-short-desc`
- Never commit to main. Branch → PR → human review → merge
- Test before PR = DoD met, nothing regressed, gate passes
- Done means merged and pushed — not built, not tested

## Must not do

- Hardcode any single niche's assumptions
- Batch or re-rank records
- Expand beyond the packet's declared targets
- Touch the FIND repo or vault_schema.md
- Invent conventions not defined here or in the FORGE CLAUDE.md
- Mark a packet Done without the DoD fully met

## The one rule (anti-side-track)

New idea mid-session → write it as a Draft packet tagged with its
stage → keep building the current thing. Capture, don't chase.

## Learning note (required on every change summary)

End every change summary with a section titled LEARNING NOTE:
- 2-4 sentences, plain English, no jargon
- Explain the ONE key concept used in this packet as if I have no
  technical background
- Use an analogy from trades or everyday life where it helps
- Define any unavoidable technical term in brackets on first use
