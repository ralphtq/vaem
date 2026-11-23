# Steps that need RDF lists, which SPARQL Update handles badly.
#
# - sh:or of shapes that each have one sh:class: an owl:allValuesFrom restriction
#   to the owl:unionOf those classes; of shapes that each have one sh:datatype:
#   to an rdfs:Datatype that is the owl:unionOf those datatypes.
# - sh:in (v1 ... vn): an owl:allValuesFrom restriction to owl:oneOf (v1 ... vn).
from rdflib import OWL, RDF, RDFS, BNode, Namespace
from rdflib.collection import Collection

SH = Namespace("http://www.w3.org/ns/shacl#")


def restrict(graph, cls, prop, value):
    r = BNode()
    graph.add((cls, RDFS.subClassOf, r))
    graph.add((r, RDF.type, OWL.Restriction))
    graph.add((r, OWL.onProperty, prop))
    graph.add((r, OWL.allValuesFrom, value))


def apply(graph, shacl_iri, owl_iri):
    for cls in list(graph.subjects(RDF.type, OWL.Class)):
        for ps in list(graph.objects(cls, SH.property)):
            prop = graph.value(ps, SH.path)
            if prop is None or isinstance(prop, BNode):
                continue
            alternatives = graph.value(ps, SH["or"])
            if alternatives is not None:
                members = list(Collection(graph, alternatives))
                if not members:  # a list defined in another graph, e.g. dash:HTMLOrStringOrLangString
                    continue
                classes = [graph.value(m, SH["class"]) for m in members]
                datatypes = [graph.value(m, SH.datatype) for m in members]
                if all(classes):
                    union = BNode()
                    graph.add((union, RDF.type, OWL.Class))
                    graph.add((union, OWL.unionOf, Collection(graph, BNode(), classes).uri))
                    restrict(graph, cls, prop, union)
                elif all(datatypes):
                    union = BNode()
                    graph.add((union, RDF.type, RDFS.Datatype))
                    graph.add((union, OWL.unionOf, Collection(graph, BNode(), datatypes).uri))
                    restrict(graph, cls, prop, union)
            values = graph.value(ps, SH["in"])
            if values is not None and list(Collection(graph, values)):
                one_of = BNode()
                graph.add((one_of, OWL.oneOf, Collection(graph, BNode(), list(Collection(graph, values))).uri))
                restrict(graph, cls, prop, one_of)
