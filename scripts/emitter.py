import json
import os
from datetime import date


def _plan_confidence(record, competitor_notes_manual):
    if competitor_notes_manual is None:
        return "LOW"
    if record.get("revenue_confidence") == "low":
        return "LOW"
    return "MED"


def _build_spec(record, flags):
    competitor_notes_manual = None  # no decision logic in this skeleton
    confidence = _plan_confidence(record, competitor_notes_manual)

    return {
        # --- Identity and provenance ---
        "schema_version": "2.0",
        "scoped_at": date.today().isoformat(),
        "plan_confidence": confidence,
        # --- S1 fields carried forward verbatim ---
        "niche_id": record["niche_id"],
        "niche_label": record["niche_label"],
        "head_keyword": record["head_keyword"],
        "cluster_keywords": record["cluster_keywords"],
        "cluster_volume": record["cluster_volume"],
        "volume_confidence": record["volume_confidence"],
        "competition_tier": record["competition_tier"],
        "opportunity_tier": record["opportunity_tier"],
        "monetisation_tag": record["monetisation_tag"],
        "rpv_low": record["rpv_low"],
        "rpv_high": record["rpv_high"],
        "monthly_revenue_low": record["monthly_revenue_low"],
        "monthly_revenue_high": record["monthly_revenue_high"],
        "revenue_confidence": record["revenue_confidence"],
        "s1_notes": record.get("notes"),
        # --- S2 decisions — all TODO: decision logic added in later packets ---
        "system_type": "TODO: [SCOPE decision required — website / web-app / software]",
        "archetype": "TODO: [SCOPE decision required — lead-gen / commerce / content / directory / tool / hybrid]",
        "build_target": "TODO: [SCOPE decision required — claude-code / replit / lovable]",
        "build_target_reason": "TODO: [one or two sentences explaining why this target was chosen over the other two — must be specific, not 'best fit']",
        "domain_proposed": "TODO: [proposed domain name, e.g. niche-hub.co.uk — a recommendation, not a purchase instruction]",
        "hosting_decision": "TODO: [hosting approach including platform, tier, and reason — e.g. 'Vercel — free tier, suits Next.js static export']",
        "monetisation_hypothesis": "TODO: [sketch of revenue mechanism, visitor action, and value capture — depth capped here; MONETISE skill owns implementation]",
        "differentiation": "TODO: [one to three specific edges where this build wins — must name at least one meaningful edge; 'good design' alone fails]",
        "competitor_notes_manual": None,
        "skills_required": [
            {
                "skill": "TODO: [skill name as it appears in a /skill-name invocation]",
                "step": 0,
                "phase": "TODO: [phase label — design / scaffold / content / test / review]",
                "purpose": "TODO: [one sentence: what decision or output this skill produces at this step]",
            }
        ],
        "pages": [
            {
                "slug": "TODO: [URL slug — e.g. / or /cost or /about]",
                "page_type": "TODO: [landing / content / tool / listing / contact / about / legal]",
                "search_intent": "TODO: [mandatory — what the searcher is trying to find or get answered, as a specific user goal, not a category label]",
                "layout_intent": "TODO: [structural logic of this page: what occupies the hero, how the page converts or progresses, key sections in order]",
                "content_requirements": [
                    "TODO: [H1 direction, key claims to make, trust signals needed, CTAs, any mandatory inclusions]"
                ],
            }
        ],
    }


def _build_plan(record, flags, spec):
    lines = []

    lines += [
        f"# Build Plan — {record['niche_label']}",
        "",
        f"niche_id:         {spec['niche_id']}",
        f"scoped_at:        {spec['scoped_at']}",
        f"plan_confidence:  {spec['plan_confidence']}",
        f"build_target:     {spec['build_target']}",
        f"opportunity_tier: {spec['opportunity_tier']}",
        "",
    ]

    if flags.get("validate_before_build") or flags.get("revenue_confidence_low"):
        lines += [
            "⚠ VALIDATE BEFORE BUILD — revenue_confidence is low. "
            "Verify volume and RPV before committing build time.",
            "",
        ]

    lines += ["---", ""]

    # 1. Niche summary
    lines += [
        "## 1. Niche summary",
        "",
        "TODO: [two to four sentences — what the niche is, who the searcher is, "
        "and why the revenue opportunity exists; enough for a cold reader without FIND output]",
        "",
        "---",
        "",
    ]

    # 2. Build decision
    lines += [
        "## 2. Build decision",
        "",
        f"- **System type and archetype:** {spec['system_type']} / {spec['archetype']}",
        f"- **Build target:** {spec['build_target']}",
        f"  - Reason: {spec['build_target_reason']}",
        f"- **Domain:** {spec['domain_proposed']}",
        f"- **Hosting:** {spec['hosting_decision']}",
        "",
        "---",
        "",
    ]

    # 3. Monetisation hypothesis
    lines += [
        "## 3. Monetisation hypothesis",
        "",
        spec["monetisation_hypothesis"],
        "",
    ]
    if spec["plan_confidence"] == "LOW":
        lines += [
            "**Confidence note:** plan_confidence is LOW — competitor data is absent. "
            "Monetisation sketch must be validated before committing build time.",
            "",
        ]
    lines += ["---", ""]

    # 4. Differentiation
    lines += [
        "## 4. Differentiation",
        "",
        spec["differentiation"],
        "",
        "> **ADAPT, DON'T CLONE:** competitor patterns may inform this spec but must be "
        "reinterpreted — own design, own copy, own structure. "
        "The test: side-by-side, neither site looks derived from the other.",
        "",
        "---",
        "",
    ]

    # 5. Page inventory
    lines += ["## 5. Page inventory", ""]
    for page in spec["pages"]:
        lines += [
            f"### {page['slug']} — {page['page_type']}",
            "",
            f"**Search intent:** {page['search_intent']}",
            "",
            f"**Layout intent:** {page['layout_intent']}",
            "",
            "**Content requirements:**",
        ]
        for req in page["content_requirements"]:
            lines.append(f"- {req}")
        lines.append("")
    lines += ["---", ""]

    # 6. Skills to invoke
    lines += ["## 6. Skills to invoke", ""]
    for skill in spec["skills_required"]:
        lines += [
            f"**Step {skill['step']} — {skill['skill']}** ({skill['phase']})",
            f"Purpose: {skill['purpose']}",
            "",
        ]
    lines += ["---", ""]

    # 7. Open questions
    lines += [
        "## 7. Open questions",
        "",
        "TODO: [list named, bounded questions requiring human input before BUILD starts — "
        "delete this section if the spec is complete and no questions remain]",
        "",
        "---",
        "",
    ]

    # 8. Competitor notes
    lines += ["## 8. Competitor notes", ""]
    if spec.get("competitor_notes_manual"):
        lines += [
            "**Confidence:** human-observed. Automated enrichment pending.",
            "",
            spec["competitor_notes_manual"],
            "",
        ]
    else:
        lines += [
            "None present — plan_confidence is LOW as a result.",
            "",
        ]

    return "\n".join(lines)


def emit(record, flags, output_dir="data"):
    niche_id = record["niche_id"]
    specs_dir = os.path.join(output_dir, "specs")
    plans_dir = os.path.join(output_dir, "plans")
    os.makedirs(specs_dir, exist_ok=True)
    os.makedirs(plans_dir, exist_ok=True)

    spec = _build_spec(record, flags)
    plan = _build_plan(record, flags, spec)

    spec_path = os.path.join(specs_dir, f"{niche_id}.json")
    plan_path = os.path.join(plans_dir, f"{niche_id}.md")

    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)

    with open(plan_path, "w", encoding="utf-8") as f:
        f.write(plan)

    return spec_path, plan_path
