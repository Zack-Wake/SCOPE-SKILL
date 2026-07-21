# SCOPE Skill — Load, Validate, Emit

## What this skill does

Reads one Vault handoff record (FIND output, schema_version 1.2), validates it against the
preconditions in `scope_schema.md`, and emits both SCOPE→BUILD contract artifacts:

- `data/specs/<niche_id>.json` — machine-readable handoff (Output A)
- `data/plans/<niche_id>.md` — written build plan (Output B)

**Current state — S2-014.** `system_type` and `archetype` are inferred from
`monetisation_tag` (S2-011). `build_target` is selected from `system_type` +
`archetype` (S2-002). The `pages` array is now derived from `archetype`, `head_keyword`,
and `cluster_keywords` using the rule tables below. All other S2 decision fields remain
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
- `schema_version`: "2.1" (SCOPE output schema)
- `scoped_at`: today's date
- `plan_confidence`: computed from flags (always LOW until competitor data present)
- `system_type`: inferred from monetisation_tag (or TODO if unmapped)
- `archetype`: inferred from monetisation_tag (or TODO if unmapped)
- `inference_basis`: which rule fired and from which input value (or UNMAPPED message)
- `build_target`: selected from system_type + archetype (or TODO if upstream unresolved or combination unmapped)
- `build_target_reason`: the rule that fired and why the other two targets were not chosen (or TODO with cascade reason)
- All remaining top-level S2 decision fields as explicit TODO strings
- `competitor_notes_manual`: null
- `skills_required`: one TODO placeholder entry
- `pages`: derived array — one entry per baseline structural page plus one per cluster keyword (or single TODO entry if archetype unresolved)

**Markdown plan (`data/plans/<niche_id>.md`):**
All 8 required sections present (header block, niche summary, build decision,
monetisation hypothesis, differentiation, page inventory, skills to invoke,
open questions, competitor notes). All S2 content is TODO.

## Build-target selection rules: build_target

Primary inputs: `system_type` and `archetype` from the inference step (S2-011).
Rules match on the exact combination. Every rule is generic — it applies to any niche
with that system_type + archetype pair.
To add coverage: append a row here and add the matching entry to `RULES` in `scripts/select-target.js`.

| system_type | archetype | build_target | Rationale |
|---|---|---|---|
| `website` | `lead-gen` | `claude-code` | Lead-gen needs Next.js page control and form-backend wiring; Lovable's template-first pace cannot provide this and Replit is prototype-grade |
| `website` | `content` | `lovable` | Content sites are UI-first with no backend; Lovable exports fast static pages and syncs via GitHub; Claude Code's full stack is not justified |
| `website` | `commerce` | `claude-code` | Commerce needs payment integration and a product data layer; Next.js + Supabase handles checkout and API routes; Lovable cannot wire a payment provider |
| `website` | `directory` | `claude-code` | Directory builds need database-backed filterable listings; Supabase + Next.js handles the data model and page scale; Lovable has no data layer |
| `website` | `hybrid` | `claude-code` | Hybrid archetypes have mixed concerns requiring full-stack control; Lovable and Replit are too constrained for undetermined hybrid requirements |
| `web-app` | `tool` | `claude-code` | Web-app signals production accounts and backend; Next.js + Supabase is the correct stack; Replit is prototype-grade and Lovable has no backend depth |
| `software` | `tool` | `claude-code` | Software builds require local toolchain and terminal access; only Claude Code supports build and packaging workflows |

**No match (UNMAPPED combination):** `build_target` stays TODO and `build_target_reason` names the unresolved combination. Human decision required before BUILD proceeds.

**Upstream TODO cascade:** If `system_type` or `archetype` is still TODO (inference step produced no rule match), `build_target` stays TODO and `build_target_reason` states that upstream resolution is required.

---

## Page-map derivation rules: pages array

Primary inputs: `archetype` (from S2-011), `head_keyword`, and `cluster_keywords` from the vault record.
To add coverage: update the baseline table here AND the `BASELINE` object in `scripts/page-map.js`.

**Cascade:** If `archetype` is TODO or unmapped, the `pages` array keeps a single TODO entry and the `source` field names the block. No pages are invented.

### Baseline page sets (structural pages per archetype)

The first entry in each archetype is the primary page (`/`), anchored to `head_keyword` in its `search_intent` TODO. Remaining entries are structural pages always present for that archetype.

| archetype | slug | page_type | search_intent TODO references |
|---|---|---|---|
| `lead-gen` | `/` | `landing` | head_keyword |
| `lead-gen` | `/about` | `about` | archetype baseline |
| `lead-gen` | `/contact` | `contact` | archetype baseline |
| `content` | `/` | `landing` | head_keyword |
| `content` | `/about` | `about` | archetype baseline |
| `commerce` | `/` | `landing` | head_keyword |
| `commerce` | `/about` | `about` | archetype baseline |
| `commerce` | `/contact` | `contact` | archetype baseline |
| `directory` | `/` | `listing` | head_keyword |
| `directory` | `/about` | `about` | archetype baseline |
| `directory` | `/contact` | `contact` | archetype baseline |
| `tool` | `/` | `tool` | head_keyword |
| `tool` | `/about` | `about` | archetype baseline |
| `hybrid` | `/` | `landing` | head_keyword |
| `hybrid` | `/about` | `about` | archetype baseline |

### Cluster keyword pages

Each entry in `cluster_keywords` produces one additional page. `page_type` is determined by archetype:

| archetype | cluster keyword page_type |
|---|---|
| `lead-gen` | `content` |
| `content` | `content` |
| `commerce` | `listing` |
| `directory` | `listing` |
| `tool` | `content` |
| `hybrid` | `content` |

- **slug:** keyword slugified (`/` + lowercase, spaces and punctuation → hyphens)
- **source:** `cluster_keyword: "<keyword verbatim>"`
- **search_intent:** `TODO: [search_intent — source: cluster_keyword "<keyword verbatim>"]`

---

## What this skill does NOT do

- No search_intent authoring — slots and provenance only (S2-014 creates the slot; a later packet authors intent)
- No domain or hosting selection
- No monetisation reasoning
- No reading from the FIND repo (fixture is the sole input source after copy)

## Requirements

- Node.js (stdlib only — no external packages, no npm install)
- Input record must be a valid JSON file conforming to vault_schema.md v1.2
