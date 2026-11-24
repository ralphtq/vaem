"""Derive an OWL schema graph from a SHACL schema graph.

  python3 scripts/derive_owl.py <shacl.ttl> <owl-graph-IRI> [--overlay <overlay.ttl>] > owl.ttl

The SHACL schema is the source; the OWL schema is derived from it at build time
by scripts/release.py ("derive_owl" in release.json). The steps are
the files in scripts/owl-derivation/steps/, applied in file-name order to a copy
of the SHACL graph:

  - NN-*.ru: a SPARQL Update. {{SHACL}} and {{OWL}} stand for the two graph IRIs.
  - NN-*.py: a Python step for what SPARQL handles badly (RDF lists); it
    defines apply(graph, shacl_iri, owl_iri).

Then the overlay (scripts/owl-derivation/overlay.ttl, if any) is applied: for
each subject and predicate in it, the derived values are replaced by the
overlay's. Use it for what the shapes cannot say, such as the OWL graph's label
or the type of a property used in mixed ways.

check_owl() lists what is wrong with a derived graph; release.py fails on it.
See scripts/owl-derivation/README.md for the steps and the checks.
"""
import argparse
import pathlib
import sys

import rdflib
from rdflib import OWL, RDF, RDFS, BNode, Namespace, URIRef

SH = Namespace("http://www.w3.org/ns/shacl#")
STEPS = pathlib.Path(__file__).resolve().parent / "owl-derivation" / "steps"
PROPERTY_TYPES = {OWL.ObjectProperty, OWL.DatatypeProperty, OWL.AnnotationProperty, RDF.Property}


def remove_orphan_blank_nodes(graph):
    """Remove blank nodes that nothing refers to, until there are none."""
    while True:
        referenced = {o for o in graph.objects() if isinstance(o, BNode)}
        orphans = {s for s in graph.subjects() if isinstance(s, BNode) and s not in referenced}
        if not orphans:
            return
        for s in orphans:
            graph.remove((s, None, None))


def apply_overlay(graph, overlay):
    for s, p in {(s, p) for s, p, _ in overlay}:
        graph.remove((s, p, None))
    for triple in overlay:
        graph.add(triple)


def derive(shacl, shacl_iri, owl_iri, overlay=None, steps=STEPS):
    """Return the OWL graph derived from the SHACL graph (which is not changed)."""
    graph = rdflib.Graph()
    for prefix, namespace in shacl.namespaces():
        graph.bind(prefix, namespace)
    for triple in shacl:
        graph.add(triple)
    for step in sorted(steps.iterdir()):
        if step.suffix == ".ru":
            update = step.read_text(encoding="utf-8")
            update = update.replace("{{SHACL}}", f"<{shacl_iri}>").replace("{{OWL}}", f"<{owl_iri}>")
            graph.update(update)
        elif step.suffix == ".py":
            namespace = {}
            exec(compile(step.read_text(encoding="utf-8"), str(step), "exec"), namespace)  # noqa: S102
            namespace["apply"](graph, URIRef(shacl_iri), URIRef(owl_iri))
    remove_orphan_blank_nodes(graph)
    if overlay is not None:
        apply_overlay(graph, overlay)
    return graph


def check_owl(owl, shacl, shacl_iri, owl_iri):
    """What is wrong with a derived OWL graph, as a list of messages."""
    problems = []
    name = owl.namespace_manager.normalizeUri
    sh_terms = sorted({str(t) for triple in owl for t in triple if isinstance(t, URIRef) and str(t).startswith(str(SH))})
    if sh_terms:
        problems.append(f"SHACL terms left: {', '.join(sh_terms[:5])}")
    if any(URIRef(shacl_iri) in triple for triple in owl):
        problems.append(f"the SHACL graph IRI <{shacl_iri}> is still used")
    if (URIRef(owl_iri), RDF.type, OWL.Ontology) not in owl:
        problems.append(f"<{owl_iri}> is not an owl:Ontology")
    shaped = {c for c in shacl.subjects(SH.property, None) if isinstance(c, URIRef)}
    trait_class = URIRef("http://www.linkedmodel.org/schema/trom#TraitClass")
    classes = {c for c in shaped
               if (c, RDF.type, RDFS.Class) in shacl or (c, RDF.type, trait_class) in shacl
               or (c, RDF.type, SH.NodeShape) in shacl and (c, RDFS.subClassOf, None) in shacl
               or any((t, RDFS.subClassOf, RDFS.Class) in shacl for t in shacl.objects(c, RDF.type))}
    missing = sorted(name(c) for c in classes if (c, RDF.type, OWL.Class) not in owl)
    if missing:
        problems.append(f"classes with shapes but no owl:Class: {', '.join(missing[:10])}")
    declared = {p for p in owl.subjects(RDF.type, None) if set(owl.objects(p, RDF.type)) & PROPERTY_TYPES}
    for r in set(owl.subjects(RDF.type, OWL.Restriction)):
        props = list(owl.objects(r, OWL.onProperty))
        values = [p for p in (OWL.allValuesFrom, OWL.someValuesFrom, OWL.hasValue, OWL.cardinality,
                              OWL.minCardinality, OWL.maxCardinality, OWL.minQualifiedCardinality,
                              OWL.maxQualifiedCardinality, OWL.qualifiedCardinality) if (r, p, None) in owl]
        if len(props) != 1 or len(values) != 1:
            problems.append(f"malformed restriction on {', '.join(name(p) for p in props) or 'no property'}")
            continue
        p = props[0]
        types = set(owl.objects(p, RDF.type))
        v = owl.value(r, OWL.allValuesFrom)
        if v is not None and OWL.ObjectProperty in types and str(v).startswith(str(rdflib.XSD)):
            problems.append(f"object property {name(p)} restricted to the datatype {name(v)}")
        if v is not None and OWL.DatatypeProperty in types and (v, RDF.type, OWL.Class) in owl:
            problems.append(f"datatype property {name(p)} restricted to the class {name(v)}")
    own = {s for s in owl.subjects(RDFS.isDefinedBy, URIRef(owl_iri))}
    untyped = sorted(name(p) for p in set(owl.objects(None, OWL.onProperty))
                     if p in own and p not in declared)
    if untyped:
        problems.append(f"restricted properties defined here but not typed: {', '.join(untyped[:10])}")
    referenced = {o for o in owl.objects() if isinstance(o, BNode)}
    if any(isinstance(s, BNode) and s not in referenced for s in owl.subjects()):
        problems.append("orphaned blank nodes")
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("shacl", help="a built SHACL schema (no $$ tokens)")
    parser.add_argument("owl_iri", help="the OWL graph IRI, e.g. https://w3id.org/voag/2.0.0/schema")
    parser.add_argument("--overlay")
    args = parser.parse_args()
    shacl = rdflib.Graph().parse(args.shacl, format="turtle")
    shacl_iri = next(iter(shacl.subjects(RDF.type, OWL.Ontology)))
    overlay = rdflib.Graph().parse(args.overlay, format="turtle") if args.overlay else None
    owl = derive(shacl, str(shacl_iri), args.owl_iri, overlay)
    for problem in check_owl(owl, shacl, str(shacl_iri), args.owl_iri):
        print(f"problem: {problem}", file=sys.stderr)
    sys.stdout.write(owl.serialize(format="turtle"))


if __name__ == "__main__":
    main()
