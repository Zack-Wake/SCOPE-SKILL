# SCOPE — Build Spec Stage

Part of the FORGE personal build pipeline.

## What this is

SCOPE is stage two of FORGE. It takes one niche record from FIND (a Vault-band, Tier A/B/C entry) and produces a build spec BUILD can execute without asking questions.

## The six stages

```
FIND → SCOPE → BUILD → RANK → MONETISE → PUBLISH
```

- **FIND** — rank niches best→worst from one seed (SERP Opportunity Finder)
- **SCOPE** — cheapest effective build spec + pick the build tool (this repo)
- **BUILD** — scaffold the site (Next.js + Supabase)
- **RANK** — SEO it to the top
- **MONETISE** — wire in revenue (affiliate / ads / lead-gen / own-product, possibly several)
- **PUBLISH** — deploy, harden, monitor, iterate

See `CLAUDE.md` for the data flow, build-target rules, autonomy ladder, and handoff contracts.

## What SCOPE outputs

Two artifacts per niche:

1. `data/specs/<niche_id>.json` — machine-readable SCOPE→BUILD handoff. Flat, self-sufficient. BUILD never reads back into FIND.
2. `data/plans/<niche_id>.md` — written build plan. Every page, layout intent, content requirement, and skill invocation named.

The contract defining both artifacts is `scope_schema.md`.

## Status

Schema contract defined (S2-001). Stage logic not yet built. Next: S2-002 will define the SCOPE skill itself against this contract.

## How to work in this repo

Packet workflow. Pick a Ready packet → branch → build to the Definition of Done → review the diff → mark Done. One packet, one branch, one session. New ideas become Draft packets, not detours.

## Quality bar

BUILD raises no questions caused by ambiguity or missing decisions after reading the spec.
