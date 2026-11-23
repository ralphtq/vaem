# Named RDF lists used only as SHACL values (the object of sh:or, sh:and,
# sh:xone or sh:in, e.g. vaem:StringOrLangString) are SHACL helpers: their
# members are shapes. They are removed with their triples; the list cells
# become orphaned blank nodes and are removed afterwards.
from rdflib import URIRef, Namespace

SH = Namespace("http://www.w3.org/ns/shacl#")


def apply(graph, shacl_iri, owl_iri):
    helpers = {o for p in (SH["or"], SH["and"], SH.xone, SH["in"])
               for o in graph.objects(None, p) if isinstance(o, URIRef)}
    for helper in helpers:
        graph.remove((helper, None, None))
        graph.remove((None, None, helper))
