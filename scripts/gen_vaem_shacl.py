"""Convert a VAEM OWL schema to the noOWL (SHACL-only) form.

The SHACL schema is the source of VAEM; this script is kept as a check that
the OWL file and the SHACL file say the same thing.

Check (writes nothing; exit status 1 if they differ):
  python3 gen_vaem_shacl.py <owl.ttl> <shacl.ttl> <shacl-ontology-IRI> <label> --check

Write a SHACL file from the OWL:
  python3 gen_vaem_shacl.py <owl.ttl> <out.ttl> <shacl-ontology-IRI> <label> <modified-date>
"""
import sys
import rdflib
from rdflib import RDF, RDFS, OWL, URIRef, Literal, Namespace
from rdflib.namespace import XSD

SH = Namespace("http://www.w3.org/ns/shacl#")
V = Namespace("http://www.linkedmodel.org/schema/vaem#")
DCT = Namespace("http://purl.org/dc/terms/")
VAEM_ONT_PREFIX = "http://www.linkedmodel.org/"

src, out, shacl_iri, label, modified = sys.argv[1:6]
check = modified == "--check"
if check:
    # compare with the existing SHACL file, taking its own dcterms:modified
    existing = rdflib.Graph().parse(out, format="turtle")
    modified = str(next(existing.objects(None, URIRef("http://purl.org/dc/terms/modified"))))
S = URIRef(shacl_iri)
g = rdflib.Graph().parse(src, format="turtle")
h = rdflib.Graph()
for p, ns in g.namespaces():
    h.bind(p, ns)
h.bind("dcterms", DCT)
h.bind("sh", SH)

owl_ont = next(g.subjects(RDF.type, OWL.Ontology))

def is_vaem_ont(x):
    # any VAEM ontology IRI, versioned or not (e.g. .../3.0/schema/vaem, .../2.0/schema/vaem)
    s = str(x)
    return isinstance(x, URIRef) and s.startswith(VAEM_ONT_PREFIX) and s.endswith("/schema/vaem")

DATATYPE_NS = (str(XSD), "http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML", str(RDFS.Literal))

def is_datatype(x):
    return str(x).startswith(DATATYPE_NS) or (x, RDF.type, RDFS.Datatype) in g

def value_constraint(x):
    return (SH.datatype if is_datatype(x) else SH["class"]), x

restrictions = set()
shaped = set()          # properties that got a class-scoped shape
for c, r in list(g.subject_objects(RDFS.subClassOf)):
    if (r, RDF.type, OWL.Restriction) not in g:
        continue
    restrictions.add(r)
    prop = g.value(r, OWL.onProperty)
    ps = URIRef(f"{c}-{str(prop).split('#')[-1]}")
    h.add((c, SH.property, ps))
    h.add((ps, RDF.type, SH.PropertyShape))
    h.add((ps, SH.path, prop))
    h.add((ps, RDFS.isDefinedBy, S))
    mc = g.value(r, OWL.maxCardinality) or g.value(r, OWL.cardinality)
    if mc is not None:
        h.add((ps, SH.maxCount, Literal(int(mc))))
    avf = g.value(r, OWL.allValuesFrom) or g.value(prop, RDFS.range)
    if avf is not None and avf != RDFS.Resource:
        h.add((ps,) + value_constraint(avf))
    shaped.add(prop)

for prop, dom in g.subject_objects(RDFS.domain):       # domain -> shape on that class
    ps = URIRef(f"{dom}-{str(prop).split('#')[-1]}")
    h.add((dom, SH.property, ps)); h.add((ps, RDF.type, SH.PropertyShape)); h.add((ps, SH.path, prop)); h.add((ps, RDFS.isDefinedBy, S))
    rng = g.value(prop, RDFS.range)
    if rng is not None and rng != RDFS.Resource:
        h.add((ps,) + value_constraint(rng))
    shaped.add(prop)

for prop, rng in g.subject_objects(RDFS.range):          # remaining ranges -> P-range node shape
    if prop in shaped or rng == RDFS.Resource:
        continue
    local = str(prop).split('#')[-1]
    ns_ = URIRef(f"{prop}-range"); b = rdflib.BNode()
    h.add((ns_, RDF.type, SH.NodeShape)); h.add((ns_, RDFS.label, Literal(f"Values of {local}")))
    h.add((ns_, SH.targetSubjectsOf, prop)); h.add((ns_, RDFS.isDefinedBy, S)); h.add((ns_, SH.property, b))
    h.add((b, SH.path, prop)); h.add((b,) + value_constraint(rng))

def in_restriction(n):
    return n in restrictions

for s, p, o in g:
    if in_restriction(s) or in_restriction(o):
        continue
    if p in (RDFS.range, RDFS.domain):
        continue
    if s == owl_ont:
        continue                                   # header rebuilt below
    if p == RDFS.isDefinedBy and is_vaem_ont(o):
        o = S                                      # point at the SHACL ontology
    if p == RDF.type and o == OWL.Class:
        h.add((s, RDF.type, RDFS.Class)); h.add((s, RDF.type, SH.NodeShape)); continue
    if p == RDF.type and o in (OWL.ObjectProperty, OWL.DatatypeProperty, OWL.AnnotationProperty):
        h.add((s, RDF.type, RDF.Property)); continue
    if p == RDFS.subClassOf and o == OWL.Thing:
        continue                                   # no OWL top class in the noOWL schema
    h.add((s, p, o))

# ontology header
h.add((S, RDF.type, OWL.Ontology))
h.add((S, RDFS.label, Literal(label)))
for p_, o_ in g.predicate_objects(owl_ont):        # keep the header's own annotations
    if p_ in (RDF.type, RDFS.label, OWL.versionIRI, OWL.imports):
        continue
    h.add((S, p_, o_))

# metadata: conversion date
for gmd in h.subjects(RDF.type, V.GraphMetaData):
    h.remove((gmd, DCT.modified, None))
    h.add((gmd, DCT.modified, Literal(modified, datatype=XSD.date)))

# fail loudly if any OWL construct other than the header type survived
left = [(s, p, o) for s, p, o in h if s != S and any(str(t).startswith(str(OWL)) for t in (p, o) if isinstance(t, URIRef))]
assert not left, left

if check:
    from rdflib.compare import to_isomorphic, graph_diff
    _, only_owl, only_shacl = graph_diff(to_isomorphic(h), to_isomorphic(existing))
    for label_, triples in (("only in the OWL", only_owl), ("only in the SHACL file", only_shacl)):
        for t in sorted(triples, key=str):
            print(f"{label_}: " + " ".join(h.namespace_manager.normalizeUri(x) if isinstance(x, URIRef) else repr(str(x))[:80] for x in t))
    print(f"OWL and SHACL {'match' if not only_owl and not only_shacl else 'differ'}: "
          f"{len(only_owl)} triples only in the OWL, {len(only_shacl)} only in the SHACL file")
    sys.exit(1 if only_owl or only_shacl else 0)
h.serialize(out, format="turtle")
print(f"{len(g)} triples in -> {len(h)} triples out")
