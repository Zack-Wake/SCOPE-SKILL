# SCOPE Skill — Load, Validate, Emit

## What this skill does

Reads one Vault handoff record (FIND output, schema_version 1.2), validates it against the
preconditions in `scope_schema.md`, and emits both SCOPE→BUILD contract artifacts:

- `data/specs/<niche_id>.json` — machine-readable handoff (Output A)
- `data/plans/<niche_id>.md` — written build plan (Output B)

**Current state — S2 skeleton only.** All S2 decision fields (system_type, archetype,
build_target, page map, skills_required, etc.) are emitted as explicit TODO markers.
Decision logic is added in later packets. This skeleton proves the load→validate→emit
pipeline is correct before any logic is layered in.

## When to invoke

When a vault-band handoff record is ready and you want to:
1. Validate it passes all SCOPE preconditions, OR
2. Produce the structured output files the skeleton emits (useful for testing or pipeline verification)

Do not invoke when:
- The record is watchlist or excluded band (validation will halt, correctly)
- You want completed S2 decisions — those require a later packet

## How to run

No install needed — stdlib only.

From the repo root:

```
node scripts/run.js <path-to-handoff-record>
```

To run on the bundled fixture:

```
node scripts/run.js fixtures/building-survey-head.json
```

Output goes to `data/specs/` and `data/plans/` by default. Pass a second argument to
override the output directory:

```
node scripts/run.js fixtures/building-survey-head.json my-output/
```

## What it checks (hard failures — halts on any)

| Check | Failure message |
|---|---|
| `schema_version` == "1.2" | `unsupported schema_version: expected '1.2', got ...` |
| `band` == "vault" | `invalid band: expected 'vault', got ...` |
| All required S1 fields present | `missing required field: '<field>'` (one line per field) |

On failure: prints all errors, exits non-zero. Never proceeds on partial input.
Never substitutes a default. Never fabricates a missing value.

## What it carries forward (soft flags, not failures)

| Condition | Effect on output |
|---|---|
| `revenue_confidence` == "low" | `plan_confidence` cannot exceed MED; warning surfaced in plan header |
| `notes` contains "validate before build" | Warning surfaced in plan header |
| `competitor_notes_manual` absent (always in skeleton) | `plan_confidence` = LOW |

## What the output contains

**JSON spec (`data/specs/<niche_id>.json`):**
- All S1 fields carried forward verbatim
- `schema_version`: "2.0" (SCOPE output schema)
- `scoped_at`: today's date
- `plan_confidence`: computed from flags (always LOW in skeleton)
- All S2 decision fields as explicit TODO strings
- `competitor_notes_manual`: null
- `skills_required`: one TODO placeholder entry
- `pages`: one TODO placeholder entry

**Markdown plan (`data/plans/<niche_id>.md`):**
All 8 required sections present (header block, niche summary, build decision,
monetisation hypothesis, differentiation, page inventory, skills to invoke,
open questions, competitor notes). All S2 content is TODO.

## What this skill does NOT do

- No decision logic — system_type, archetype, build_target are all TODO
- No page map generation
- No monetisation reasoning
- No domain or hosting selection
- No reading from the FIND repo (fixture is the sole input source after copy)

## Requirements

- Node.js (stdlib only — no external packages, no npm install)
- Input record must be a valid JSON file conforming to vault_schema.md v1.2
