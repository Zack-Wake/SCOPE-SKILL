import json


def load_record(path):
    with open(path, "r", encoding="utf-8") as f:
        record = json.load(f)
    # Strip SCOPE-internal provenance wrapper if present — not part of vault schema
    record.pop("_provenance", None)
    return record
