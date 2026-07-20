# SCOPE — Stage 2 of FORGE

## What this is

Stage 2 of the FORGE pipeline. Takes one validated niche from FIND and
writes the build spec BUILD works from — what's being built, why, for
whom, and to what standard.

## In / out

**In:** one Vault handoff record from FIND (`schema_version 1.2`,
25 fields, defined in the FIND repo's `vault_schema.md`). One record
in, one spec out.

**Out:**
- a machine-readable handoff (JSON) BUILD consumes
- a written build plan (markdown) a human can read, edit and approve

Both are self-sufficient — BUILD never needs to reach back into FIND.

## The job in one line

Produce a plan detailed enough that BUILD can create a site that looks
like a good human made it, without stopping to ask what was meant.

## What it decides

System type and archetype · build target · domain and hosting · page
map · per-page search intent · differentiation · monetisation
hypothesis (sketch only) · which skills BUILD must invoke.

## What it doesn't

Ranking niches (FIND) · deep monetisation (MONETISE) · SEO execution
(RANK) · deploy and iterate (PUBLISH). SCOPE seeds those stages, it
doesn't run them.

## Design rules

- Generic and niche-agnostic — any niche FIND emits, forever
- Contract before logic
- Search intent before keywords
- Adapt competitor patterns, never clone them
- Flag gaps honestly; never estimate a number into looking solid

## Status

Not built. First packet: **S2-001** — define `scope_schema.md`, the
SCOPE→BUILD contract. No logic until the contract is agreed.

## How to work in this repo

One packet, one branch, one session. Branch → build to the Definition
of Done → PR → human review → merge. New ideas become Draft packets,
not detours. See `CLAUDE.md` for the full rules.
