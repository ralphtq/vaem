"""Build a VAEM release from the tokenised sources in src/.

Substitutes the version and release date into copies of the source files
under dist/, then checks them. Nothing outside dist/ is written.

  python3 scripts/release.py                      # version from release.json, date = today (UTC)
  python3 scripts/release.py --version 3.0.0-SNAPSHOT --date 2026-11-17

Tokens:
  $$VERSION$$       the release version, e.g. 3.0.0
  $$RELEASE_DATE$$  the release date, YYYY-MM-DD

Checks (any failure exits with status 1):
  - no $$TOKEN$$ is left in the output
  - every output file parses as Turtle
  - no construct has more than one rdfs:isDefinedBy
  - an owl:imports of a graph of this repository carries the version being
    built ($$VERSION$$); an import of another repository's graph names its
    latest, unversioned IRI (e.g. http://www.linkedmodel.org/schema/vaem)
  - the SHACL schema conforms to its own shapes (pySHACL)
"""
import argparse
import datetime
import json
import pathlib
import re
import shutil
import sys

import rdflib
from rdflib import OWL, RDF, RDFS

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKEN = re.compile(r"\$\$[A-Z_]+\$\$")
VERSIONED = re.compile(r"/\d+\.\d+(\.\d+)?(-SNAPSHOT)?/")


def unversioned(iri):
    """The IRI without its version segment, e.g. https://w3id.org/trom/schema."""
    return VERSIONED.sub("/", iri, count=1)


def check_imports(imports, own, version):
    """Imports of this repository's graphs carry the version being built; others carry none."""
    wrong = []
    for rel, iri in imports:
        if unversioned(iri) in own:
            if f"/{version}/" not in iri:
                wrong.append(f"{rel}: owl:imports <{iri}> is a graph of this repository: "
                             f"import it with the version being built, /{version}/")
        elif VERSIONED.search(iri):
            wrong.append(f"{rel}: owl:imports <{iri}> is a graph of another repository: "
                         f"import its latest, unversioned IRI, <{unversioned(iri)}>")
    return wrong


def main():
    config = json.loads((ROOT / "release.json").read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default=config["version"])
    parser.add_argument("--date", default=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d"))
    parser.add_argument("--out", default="dist")
    args = parser.parse_args()

    if not re.fullmatch(r"\d+\.\d+\.\d+(-SNAPSHOT)?", args.version):
        sys.exit(f"version {args.version!r} must be X.Y.Z or X.Y.Z-SNAPSHOT")
    datetime.date.fromisoformat(args.date)

    values = {"VERSION": args.version, "RELEASE_DATE": args.date}

    out = ROOT / args.out
    if out.exists():
        shutil.rmtree(out)

    failures = []
    imports, own = [], set()
    written = {}
    for f in config["files"]:
        text = (ROOT / f["src"]).read_text(encoding="utf-8")
        for key, value in values.items():
            text = text.replace(f"$${key}$$", value)
        target = out / f["dist"].format(version=args.version)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
        written[f["role"]] = target
        rel = target.relative_to(ROOT)

        left = sorted(set(TOKEN.findall(text)))
        if left:
            failures.append(f"{rel}: tokens left: {', '.join(left)}")
        try:
            graph = rdflib.Graph().parse(target, format="turtle")
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{rel}: does not parse: {exc}")
            continue
        imports.extend((rel, str(o)) for o in graph.objects(None, OWL.imports))
        own.update(unversioned(str(s)) for s in graph.subjects(RDF.type, OWL.Ontology))
        multi = [s for s in set(graph.subjects(RDFS.isDefinedBy, None))
                 if len(set(graph.objects(s, RDFS.isDefinedBy))) > 1]
        if multi:
            failures.append(f"{rel}: {len(multi)} constructs with more than one rdfs:isDefinedBy")
        print(f"built {rel} ({len(graph)} triples)")

    failures.extend(check_imports(imports, own, args.version))

    shacl = written.get("shacl")
    if shacl and not failures:
        from pyshacl import validate
        graph = rdflib.Graph().parse(shacl, format="turtle")
        conforms, _, report = validate(graph, shacl_graph=graph, inference="none")
        if not conforms:
            failures.append(f"{shacl.relative_to(ROOT)}: does not conform to its own shapes\n{report}")
        else:
            print("SHACL schema conforms to its own shapes")

    if failures:
        print("\nRELEASE CHECKS FAILED:")
        for failure in failures:
            print(f"  - {failure}")
        sys.exit(1)
    print(f"\nrelease {args.version} ({args.date}) built in {out.relative_to(ROOT)}/; all checks passed")


if __name__ == "__main__":
    main()
