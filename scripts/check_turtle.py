"""Parse every .ttl file in the repository and fail if any does not parse."""
import pathlib
import sys

import rdflib

failed = 0
for path in sorted(pathlib.Path(".").rglob("*.ttl")):
    if ".git" in path.parts:
        continue
    try:
        graph = rdflib.Graph().parse(path, format="turtle")
        print(f"ok    {len(graph):6d} triples  {path}")
    except Exception as exc:  # noqa: BLE001
        failed += 1
        print(f"FAIL  {path}: {exc}")
sys.exit(1 if failed else 0)
