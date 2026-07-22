# Scope Schema — SCOPE→BUILD Contract (S2-001)

Single source of truth for what SCOPE emits to BUILD. One Vault-band niche record in → two artifacts out. This file defines both artifacts, all fields, and all contract clauses.

---

## 1. Input

SCOPE receives exactly **one** niche record conforming to the FIND Vault schema (schema_version 1.2, 25 fields — see `references/vault_schema.md` in the FIND repo). One record in → one build spec out.

**Preconditions SCOPE enforces before producing output:**

| Check | Failure action |
|---|---|
| `schema_version` is "1.2" | Halt. Log: `unsupported schema_version`. |
| `band` is "vault" | Halt. Watchlist and excluded niches do not reach SCOPE. |
| All required S1 fields present | Halt per missing field. Never fabricate or default. |
| `revenue_confidence` is "low" | Carry forward; `plan_confidence` cannot exceed MED unless overridden by human. |
| `notes` contains "validate before build" | Carry forward the flag; surface it in the build plan header. |

SCOPE never reads back into FIND after receiving the record. The emitted spec is self-sufficient.

---

## 2. Output A — Machine-readable handoff (JSON)

**File path:** `data/specs/<niche_id>.json`

Flat structure. No nested objects except `skills_required` (array of objects) and `pages` (array of objects). BUILD reads only this file — no FIND data sources, no Vault Sheet.

### 2.1 Top-level fields

#### Identity and provenance

| Field | Type | Required | Meaning |
|---|---|---|---|
| `schema_version` | string | Yes | SCOPE schema version. Value: `"2.3"`. Bump on any contract change. See §8 for changelog. |
| `scoped_at` | string (ISO date) | Yes | Date this spec was produced (YYYY-MM-DD). |
| `plan_confidence` | enum | Yes | `"LOW"` / `"MED"` / `"HIGH"`. LOW when competitor data absent or `revenue_confidence` is low. MED is the standard working confidence. HIGH requires human-observed competitor data AND verified revenue. |

#### S1 fields carried forward (verbatim — not re-derived)

| Field | Type | Source field | Meaning |
|---|---|---|---|
| `niche_id` | string | `niche_id` | Slug. Primary key for this spec. |
| `niche_label` | string | `niche_label` | Human-readable niche name. |
| `head_keyword` | string | `head_keyword` | Primary target keyword. |
| `cluster_keywords` | string[] | `cluster_keywords` | Supporting keyword cluster. ⚠ See §7 (Known errata). |
| `cluster_volume` | number | `cluster_volume` | Estimated monthly search volume. |
| `volume_confidence` | enum | `volume_confidence` | `"low"` / `"med"` / `"high"`. |
| `competition_tier` | enum | `competition_tier` | `"GREEN"` / `"YELLOW"` / `"ORANGE"`. Informs build ambition. |
| `opportunity_tier` | enum | `opportunity_tier` | `"A"` / `"B"` / `"C"`. A=GREEN, B=YELLOW, C=ORANGE. |
| `monetisation_tag` | string | `monetisation_tag` | FIND's monetisation classification (e.g. `lead-gen-local`, `affiliate-saas-high-ticket`). |
| `rpv_low` | number | `rpv_low` | Revenue-per-visitor, low estimate (£). |
| `rpv_high` | number | `rpv_high` | Revenue-per-visitor, high estimate (£). |
| `monthly_revenue_low` | number | `monthly_revenue_low` | Projected monthly revenue, low (£). |
| `monthly_revenue_high` | number | `monthly_revenue_high` | Projected monthly revenue, high (£). |
| `revenue_confidence` | enum | `revenue_confidence` | `"low"` / `"med"` / `"high"`. |
| `s1_notes` | string \| null | `notes` | FIND flags carried verbatim (e.g. `"validate before build"`, CPC path flags). Null if none. |

#### S2 decisions (set by SCOPE)

| Field | Type | Required | Meaning |
|---|---|---|---|
| `system_type` | enum | Yes | `"website"` — static or CMS-driven, no significant app logic. `"web-app"` — user accounts, dynamic features, significant backend. `"software"` — downloadable, installable, or SaaS. |
| `archetype` | enum | Yes | `"lead-gen"` / `"commerce"` / `"content"` / `"directory"` / `"tool"` / `"hybrid"`. The structural model that organises the site. |
| `inference_basis` | string | Yes | Traces the rule that set `system_type` and `archetype`. Two forms: **match** — `"rule matched: monetisation_tag \"<value>\" (prefix \"<prefix>\") → system_type \"<type>\", archetype \"<archetype>\""`. **miss (UNMAPPED)** — `"UNMAPPED: no rule for monetisation_tag \"<value>\"; system_type and archetype remain TODO"`. |
| `build_target` | enum | Yes | `"claude-code"` / `"replit"` / `"lovable"`. Which build tool BUILD will use. |
| `build_target_reason` | string | Yes | One or two sentences explaining why this target was chosen over the others. Specific — not "best fit". |
| `domain_proposed` | string | Yes | Proposed domain name (e.g. `"building-survey-hub.co.uk"`). A recommendation, not a purchase instruction. |
| `hosting_decision` | string | Yes | Hosting approach (e.g. `"Vercel — free tier, suits Next.js static export"`, `"Replit deployment, hosted"`, `"Netlify — Lovable export"`). Include tier and reason. |
| `monetisation_hypothesis` | string | Yes | Sketch of how revenue is generated: mechanism, what the visitor does, how value is captured. Depth capped here — the MONETISE skill owns the implementation. |
| `differentiation` | string | Yes | Where this build wins. One to three specific areas where it will be meaningfully better than observed alternatives. Must name at least one meaningful edge — "good design" alone fails. Parity or weaker performance elsewhere is acceptable. |
| `competitor_notes_manual` | string \| null | No | Human-observed competitor notes: top-ranking sites, their approach, gaps spotted. `null` when absent. When present, also set `plan_confidence` appropriately. Automated enrichment (via S1 future packet) will populate this field later; this slot reserves the space. |
| `skills_required` | object[] | Yes | Ordered list of skills BUILD must invoke. See §2.2. |
| `pages` | object[] | Yes | One entry per page in the build. See §2.3. At least one page required. |
| `pages_flagged_for_review` | object[] | Yes | Cluster keywords that were not converted to pages because they matched a generic search modifier. Always present; empty `[]` when nothing was flagged. NOT nullable. See §2.4. |

### 2.2 `skills_required` array

Each entry names a skill BUILD must invoke, at which step, and for what purpose.

| Sub-field | Type | Required | Meaning |
|---|---|---|---|
| `skill` | string | Yes | Skill name as it would appear in a Claude Code `/skill-name` invocation (e.g. `"frontend-design"`, `"brainstorming"`, `"test-driven-development"`). |
| `step` | number | Yes | Build step number at which this skill is invoked. Steps are BUILD-internal; SCOPE assigns numbers sequentially from 1. |
| `phase` | string | Yes | Human-readable phase label (e.g. `"design"`, `"scaffold"`, `"content"`, `"test"`, `"review"`). |
| `purpose` | string | Yes | One sentence: what decision or output this skill produces at this step. |

### 2.3 `pages` array

One entry per page. Every page must have a `search_intent` — this field is mandatory and cannot be omitted or left generic. A page without a search intent is an incomplete spec.

| Sub-field | Type | Required | Meaning |
|---|---|---|---|
| `slug` | string | Yes | URL slug (e.g. `"/"`, `"/cost"`, `"/about"`). |
| `page_type` | enum | Yes | `"landing"` / `"content"` / `"tool"` / `"listing"` / `"contact"` / `"about"` / `"legal"`. |
| `source` | string | Yes | What produced this page slot. Two forms: **baseline** — `"archetype baseline: <archetype> → <page_type>"` (page exists because the archetype rule requires it). **keyword** — `"cluster_keyword: \"<keyword>\""` (page derives from a cluster keyword, quoted verbatim). Preserved for traceability; BUILD does not act on this field directly. |
| `search_intent` | string | Yes | **Mandatory.** What the searcher is trying to find or get answered. Written as a specific user goal, not a category. Example: `"Find out what a full structural survey costs for a 3-bed house in the UK"` — not `"Informational"`. |
| `layout_intent` | string | Yes | The structural logic of this page: what occupies the hero, how the page converts or progresses, key sections in order. Sufficient for BUILD to make layout decisions without designing from scratch. |
| `content_requirements` | string[] | Yes | Ordered list of content decisions: H1 direction, key claims to make, trust signals needed, CTAs, any mandatory inclusions (e.g. schema markup, specific data). At least one entry per page. |

### 2.4 `pages_flagged_for_review` array

Cluster keywords that matched a generic search modifier and were therefore not converted to pages. Always present in the emitted spec — `[]` when no keywords were flagged. Never null. Human review is required before any flagged keyword is added as a page or discarded.

| Sub-field | Type | Required | Meaning |
|---|---|---|---|
| `keyword` | string | Yes | The cluster keyword verbatim, exactly as it appears in the input record. |
| `modifier_matched` | string | Yes | The specific modifier term that triggered the flag (e.g. `"near me"`, `"best"`, `"cheap"`). |
| `reason` | string | Yes | Human-readable explanation. Value: `"search modifier, not a topic — human review required"`. |

---

## 3. Output B — Written build plan (markdown)

**File path:** `data/plans/<niche_id>.md`

Human-readable. Decision-complete. BUILD reads this alongside the JSON to understand the reasoning behind the spec; it does not need to derive any decision from this document that is not already in the JSON. The plan is the explanation layer; the JSON is the contract layer.

### 3.1 Required sections (in this order)

**Header block**

```
# Build Plan — <niche_label>

niche_id:         <niche_id>
scoped_at:        <date>
plan_confidence:  <LOW | MED | HIGH>
build_target:     <claude-code | replit | lovable>
opportunity_tier: <A | B | C>
```

If `s1_notes` contains `"validate before build"`:

```
⚠ VALIDATE BEFORE BUILD — revenue_confidence is low. Verify volume and RPV before committing build time.
```

---

**1. Niche summary**

Two to four sentences: what the niche is, who the searcher is, and why the revenue opportunity exists. Enough context for a cold reader to understand the target without reading the FIND output.

---

**2. Build decision**

- System type and archetype — what kind of site this is and why
- Build target chosen and why the other two were rejected (brief — one sentence each)
- Domain proposed and hosting rationale

---

**3. Monetisation hypothesis**

How the site makes money. Mechanism, visitor action, value capture. Depth is a sketch — MONETISE skill owns implementation. If `plan_confidence` is LOW: note the uncertainty and what needs validating.

---

**4. Differentiation**

Where this build wins. Name the specific edges. If competitor notes are present, reference what was observed and how the build reinterprets (not copies) it.

> **ADAPT, DON'T CLONE:** competitor patterns may inform this spec but must be reinterpreted — own design, own copy, own structure. The test: side-by-side, neither site looks derived from the other.

---

**5. Page inventory**

One subsection per page. Each subsection must include: slug, page type, search intent (verbatim from JSON), layout intent, and content requirements. No page may be named in the plan without a search intent.

Format:

```
### <slug> — <page_type>

**Search intent:** <verbatim from JSON>

**Layout intent:** <narrative>

**Content requirements:**
- <item>
- <item>
```

---

**6. Skills to invoke**

Ordered list matching `skills_required` in the JSON. For each: step number, skill name, phase, purpose. This section exists so a human reviewer can verify the skill sequence before BUILD runs.

---

**7. Open questions (if any)**

Named, bounded questions that require human input before BUILD starts. An empty section here means the spec is complete. Questions caused by ambiguity in SCOPE's own output are a SCOPE failure — fix the spec, don't push the question to BUILD.

---

**8. Competitor notes (if present)**

If `competitor_notes_manual` is populated: paste it here in full, with a header noting confidence is `human-observed` and automated enrichment is pending.

---

## 4. Contract clauses

### QUALITY FLOOR

Quality bars are non-negotiable minimums. Token-efficiency is measured only after bars are met. Only ambiguity tokens and rework tokens count against SCOPE. A spec that is thin but unambiguous is better than a verbose spec with gaps.

**Minimum bars for a passing spec:**

- Every field in §2 is populated (or explicitly null where nullable)
- Every page has a specific, non-generic `search_intent`
- `differentiation` names at least one meaningful edge
- `build_target_reason` is specific (not a tautology)
- `skills_required` names every skill BUILD will need — omitting one is a spec failure
- `monetisation_hypothesis` is a sketch, not a blank

### GATE

A spec passes when BUILD raises no questions caused by ambiguity or missing decisions.

BUILD has an explicit duty to halt-and-flag contradictions or gaps rather than guess:

- Flagging a broken spec is a **pass for BUILD** and a **fail for SCOPE**
- Questions caused by BUILD's own execution complexity are normal — BUILD handles those
- Questions caused by the spec being incomplete or ambiguous are SCOPE failures — the spec must be fixed before BUILD resumes

Human review over the docs always. Merging a spec to main requires human sign-off.

### ADAPT, DON'T CLONE

Competitor patterns observed during scoping may inform the spec but must be reinterpreted:

- Own design direction (not a copy of an observed layout)
- Own copy approach (not paraphrased competitor headlines)
- Own structure (not a one-to-one copy of a competitor's site map)

**Test:** side-by-side with any observed competitor, neither site should look derived from the other. Failing this test is a spec failure, regardless of how "good" the observed competitor's approach is.

---

## 5. Fixture validation reference

The Tier A building-survey records (`building-survey-head.json`, `building-survey-cost.json`) in the FIND repo's `data/handoffs/` directory serve as the reference fixture for validating this schema. Any change to scope_schema.md must remain readable against those records without contradiction.

These records are **validation fixtures only** — not design input. The schema is niche-agnostic. No field in this schema is specific to building surveys or any other niche.

**Provenance:** The table below was derived by reading the following files on 2026-07-19, read-only, with no modifications made to the FIND repo:
- `C:\REPOS\find-skill\data\handoffs\building-survey-head.json`
- `C:\REPOS\find-skill\data\handoffs\building-survey-cost.json`

These files live in the FIND repo (`C:\REPOS\find-skill`), which is outside this repo. They are not copied or reproduced here.

**Key fixture facts to remain consistent with:**

| Fact | Fixture value | Schema implication |
|---|---|---|
| `schema_version` on input | `"1.2"` | SCOPE enforces this version check |
| `band` on input | `"vault"` | Only vault-band records enter SCOPE |
| `monetisation_tag` on input | `"lead-gen-professional"` | SCOPE accepts any string — no enum enforcement on incoming tag |
| `volume_confidence` on input | `"low"` | Maps to `plan_confidence` ceiling of MED |
| `revenue_confidence` on input | `"low"` / `"med"` | Low → carry "validate before build" flag |
| `opportunity_tier` on input | `"B"` / `"C"` | Carried forward verbatim |
| `realistic_rank` on input | `"4-6"` / `"7-10"` | String range — SCOPE carries it forward as context; BUILD does not use it directly |

---

## 6. Future packets (named, not built here)

The following are out of scope for S2-001 and captured here so they do not derail the current build:

- **Automated competitor enrichment** — populating `competitor_notes_manual` via S1's future scrape pipeline rather than human observation. Field slot is reserved; value is null until that packet ships.
- **SCOPE skill logic** — the actual Claude Code skill that reads a handoff record and produces these artifacts. S2-001 defines the contract; the skill is a separate packet (S2-002).
- **`monetisation_hypothesis` depth** — full monetisation implementation belongs to S5 MONETISE. The hypothesis field is intentionally shallow.
- **Multi-record batching** — SCOPE currently processes one record at a time. Batch processing (multiple niches in one session) is a future packet.

---

## 7. Known errata

**`cluster_keywords` — format mismatch between vault_schema.md and emitted JSON**

`vault_schema.md` documents the `cluster_keywords` column as "comma-separated" (a single string). The actual emitted handoff files use a JSON array (e.g. `["survey level 3", "cost", "template", "near me"]`). `scope_schema.md` follows the emitted format and types this field as `string[]`.

This is an unresolved discrepancy. Neither form is canonical here — vault_schema.md is authoritative for the Vault Sheet column layout; the emitted JSON files are authoritative for what SCOPE actually receives. The inconsistency sits between those two documents. Do not resolve it in this schema; a future packet must align vault_schema.md, the emit script, and this schema together.

---

## 8. Changelog

| Version | Change | Reason |
|---|---|---|
| `2.3` | Added `pages_flagged_for_review` array (§2.4) to Output A; added corresponding row to §2.1 top-level fields | Formalises the modifier-flag list required by S2-016 (page-slot triage); contract must precede code that depends on it. |
| `2.2` | Added `source` field to §2.3 pages array | Formalises the page provenance field required by S2-014 (page-map derivation); contract must precede code that depends on it. |
| `2.1` | Added `inference_basis` field to §2.1 S2 decisions table | Formalises the traceability field introduced by S2-011 (archetype inference); contract must precede code that depends on it. |
| `2.0` | Initial contract | S2-001 baseline. |
