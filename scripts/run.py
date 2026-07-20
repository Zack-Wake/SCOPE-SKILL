#!/usr/bin/env python3
"""
SCOPE skeleton runner — load, validate, emit.
Usage: python scripts/run.py <path-to-handoff-record> [output-dir]
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from loader import load_record
from validator import validate
from emitter import emit


def main():
    if len(sys.argv) < 2:
        print(
            "Usage: python scripts/run.py <path-to-handoff-record> [output-dir]",
            file=sys.stderr,
        )
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "data"

    print(f"Loading:    {input_path}")
    record = load_record(input_path)
    print(f"Record:     {record.get('niche_id', '<unknown>')} (schema_version {record.get('schema_version')})")

    print("Validating...")
    try:
        flags = validate(record)
    except ValueError as e:
        print(f"\n{e}", file=sys.stderr)
        sys.exit(1)

    if flags:
        for flag, _ in flags.items():
            print(f"  Flag: {flag}")

    print(f"Emitting to {output_dir}/")
    spec_path, plan_path = emit(record, flags, output_dir)
    print(f"  Spec:  {spec_path}")
    print(f"  Plan:  {plan_path}")
    print("Done.")


if __name__ == "__main__":
    main()
