# Fields SCOPE requires from the incoming vault record.
# s1_notes maps from 'notes' and is nullable — not included here.
REQUIRED_S1_FIELDS = [
    "niche_id",
    "niche_label",
    "head_keyword",
    "cluster_keywords",
    "cluster_volume",
    "volume_confidence",
    "competition_tier",
    "opportunity_tier",
    "monetisation_tag",
    "rpv_low",
    "rpv_high",
    "monthly_revenue_low",
    "monthly_revenue_high",
    "revenue_confidence",
    "schema_version",
    "band",
]


def validate(record):
    """
    Validate a vault handoff record against the preconditions in scope_schema.md §1.
    Raises ValueError with all failures listed if any hard checks fail.
    Returns a flags dict for soft conditions carried forward into the spec.
    """
    errors = []

    if record.get("schema_version") != "1.2":
        errors.append(
            f"unsupported schema_version: expected '1.2', got {record.get('schema_version')!r}"
        )

    if record.get("band") != "vault":
        errors.append(
            f"invalid band: expected 'vault', got {record.get('band')!r} — "
            "watchlist and excluded niches do not reach SCOPE"
        )

    for field in REQUIRED_S1_FIELDS:
        if field not in record:
            errors.append(f"missing required field: '{field}'")

    if errors:
        raise ValueError(
            "Validation failed — halting:\n"
            + "\n".join(f"  - {e}" for e in errors)
        )

    flags = {}
    if record.get("revenue_confidence") == "low":
        flags["revenue_confidence_low"] = True
    notes = record.get("notes") or ""
    if "validate before build" in notes.lower():
        flags["validate_before_build"] = True

    return flags
