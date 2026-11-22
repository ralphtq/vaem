"""Build a VAEM release from the tokenised sources in src/.

Substitutes the version and release date into copies of the source files
under dist/, then checks them. Nothing outside dist/ is written.

  python3 scripts/release.py                      # version from release.json, date = today (UTC)
  python3 scripts/release.py --version 3.0.0-SNAPSHOT --date 2026-11-17

Tokens:
  $$VERSION$$       the release version, e.g. 3.0.0
  $$RELEASE_DATE$$  the release date, YYYY-MM-DD

Each graph is also written without its version, as <out>/latest/...: an
unversioned ("latest") copy whose graph IRIs have no version segment, e.g.
<out>/latest/schema/SCHEMA_x.ttl, published with the release.

Checks (any failure exits with status 1):
  - no $$TOKEN$$ is left in the output
  - every output file parses as Turtle
  - no construct has more than one rdfs:isDefinedBy
  - each unversioned copy parses, has no versioned IRI of this repository
    left, and differs from its versioned graph only in those IRIs
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
from rdflib import OWL, RDF, RDFS, Literal, URIRef
from rdflib.compare import to_isomorphic

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKEN = re.compile(r"\$\$[A-Z_]+\$\$")
VERSIONED = re.compile(r"/\d+\.\d+(\.\d+)?(-SNAPSHOT)?/")


def latest_path(dist, version):
    """Where the unversioned copy of a graph goes: latest/..., with no version in the file name."""
    path = dist.replace("{version}/", "latest/", 1)
    return re.sub(r"[-_]?v\{version\}", "", path).format(version=version)


def write_latest(built, out, version):
    """Write and check the unversioned ("latest") copy of every graph.

    In each copy, this repository's versioned graph IRIs and file URLs lose
    their version, e.g. https://w3id.org/trom/0.0.1/schema becomes
    https://w3id.org/trom/schema, and .../SCHEMA_trom-v0.0.1.ttl becomes
    .../SCHEMA_trom.ttl. The version stays in labels, titles and
    vaem:revision. A copy must parse, have no versioned IRI of this repository
    left, and say exactly what the versioned graph says with those IRIs mapped.
    """
    failures = []
    bases = sorted({iri[:iri.index(f"/{version}/") + 1]
                    for _, _, graph in built
                    for iri in map(str, graph.subjects(RDF.type, OWL.Ontology)) if f"/{version}/" in iri})
    versioned_prefixes = [f"{base}{version}/" for base in bases]

    file_version = re.compile(r"[-_]?v" + re.escape(version) + r"(?=\.(?:ttl|rdf|zip)\b)")

    def unversion(value):
        for base, prefix in zip(bases, versioned_prefixes):
            value = value.replace(prefix, base)
        if any(base in value for base in bases):
            value = file_version.sub("", value)
        return value

    def mapped(term):
        if isinstance(term, URIRef):
            return URIRef(unversion(str(term)))
        if isinstance(term, Literal):
            return Literal(unversion(str(term)), lang=term.language, datatype=term.datatype)
        return term

    names = {}
    for f, text, graph in built:
        names.setdefault(pathlib.PurePath(f["dist"].format(version=version)).name, []).append(f["dist"])
        target = out / latest_path(f["dist"], version)
        names.setdefault(target.name, []).append(str(target))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(unversion(text), encoding="utf-8")
        rel = target.relative_to(ROOT)
        try:
            latest = rdflib.Graph().parse(target, format="turtle")
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{rel}: does not parse: {exc}")
            continue
        left = sorted({str(t) for triple in latest for t in triple
                       if isinstance(t, URIRef) and any(str(t).startswith(p) for p in versioned_prefixes)})
        if left:
            failures.append(f"{rel}: versioned IRIs left: {', '.join(left[:5])}")
        expected = rdflib.Graph()
        for triple in graph:
            expected.add(tuple(mapped(t) for t in triple))
        if to_isomorphic(expected) != to_isomorphic(latest):
            failures.append(f"{rel}: differs from the versioned graph by more than its IRIs")
        print(f"built {rel} ({len(latest)} triples, unversioned)")
    for name, paths in names.items():
        if len(paths) > 1:
            failures.append(f"two output files are both named {name} (release assets need unique names)")
    return failures


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
    imports, own, built = [], set(), []
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
        built.append((f, text, graph))
        imports.extend((rel, str(o)) for o in graph.objects(None, OWL.imports))
        own.update(unversioned(str(s)) for s in graph.subjects(RDF.type, OWL.Ontology))
        multi = [s for s in set(graph.subjects(RDFS.isDefinedBy, None))
                 if len(set(graph.objects(s, RDFS.isDefinedBy))) > 1]
        if multi:
            failures.append(f"{rel}: {len(multi)} constructs with more than one rdfs:isDefinedBy")
        print(f"built {rel} ({len(graph)} triples)")

    failures.extend(check_imports(imports, own, args.version))
    if not failures:
        failures.extend(write_latest(built, out, args.version))

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
