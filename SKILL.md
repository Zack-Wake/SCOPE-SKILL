# SCOPE Skill — Load, Validate, Emit

## What this skill does

Reads one Vault handoff record (FIND output, schema_version 1.2), validates it against the
preconditions in `scope_schema.md`, and emits both SCOPE→BUILD contract artifacts:

- `data/specs/<niche_id>.json` — machine-readable handoff (Output A)
- `data/plans/<niche_id>.md` — written build plan (Output B)

**Current state — S2-011.** `system_type` and `archetype` are now inferred from
`monetisation_tag` using the rule table below. All other S2 decision fields remain
explicit TODO markers and are filled by later packets.

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

## Inference rules: system_type and archetype

Primary input: `monetisation_tag` from the vault record. Rules match on tag prefix.
Every rule is generic — it applies to any niche carrying that tag value.
To add coverage: append a row here and add the matching entry to `RULES` in `scripts/infer.js`.

| monetisation_tag prefix | system_type | archetype | Rationale |
|---|---|---|---|
| `lead-gen-` | `website` | `lead-gen` | Lead-gen site; CMS-driven, no app logic needed |
| `affiliate-` | `website` | `content` | Content-driven affiliate; article/review structure |
| `ecommerce-` | `website` | `commerce` | Product catalogue + checkout |
| `commerce-` | `website` | `commerce` | As above |
| `saas-` | `web-app` | `tool` | Subscription SaaS; requires accounts + backend |
| `tool-` | `web-app` | `tool` | Interactive tool; dynamic features required |
| `directory-` | `website` | `directory` | Listing/directory; filterable index pages |
| `content-` | `website` | `content` | Pure content play; no significant app logic |
| `software-` | `software` | `tool` | Downloadable or installable product |

**No match:** Both `system_type` and `archetype` remain `TODO`. The `inference_basis` field
in the JSON spec records the unmapped tag. Human decision required before BUILD proceeds.

---

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
- `plan_confidence`: computed from flags (always LOW until competitor data present)
- `system_type`: inferred from monetisation_tag (or TODO if unmapped)
- `archetype`: inferred from monetisation_tag (or TODO if unmapped)
- `inference_basis`: which rule fired and from which input value (or UNMAPPED message)
- All remaining S2 decision fields as explicit TODO strings
- `competitor_notes_manual`: null
- `skills_required`: one TODO placeholder entry
- `pages`: one TODO placeholder entry

**Markdown plan (`data/plans/<niche_id>.md`):**
All 8 required sections present (header block, niche summary, build decision,
monetisation hypothesis, differentiation, page inventory, skills to invoke,
open questions, competitor notes). All S2 content is TODO.

## What this skill does NOT do

- No build-target selection — build_target remains TODO (next packet)
- No page map generation
- No monetisation reasoning
- No domain or hosting selection
- No reading from the FIND repo (fixture is the sole input source after copy)

## Requirements

- Node.js (stdlib only — no external packages, no npm install)
- Input record must be a valid JSON file conforming to vault_schema.md v1.2
