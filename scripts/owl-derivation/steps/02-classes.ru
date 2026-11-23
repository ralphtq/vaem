# A class becomes an owl:Class: an rdfs:Class, an instance of a metaclass that
# is a subclass of rdfs:Class (in this graph) or of trom:TraitClass (whose
# definition is in TROM, not in the graphs that use it), or a node shape with
# an rdfs:subClassOf. Node shapes that are not classes are removed later.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX trom: <http://www.linkedmodel.org/schema/trom#>

INSERT { ?c a owl:Class }
WHERE {
  { ?c a ?t .
    FILTER(?t = rdfs:Class || ?t = trom:TraitClass || EXISTS { ?t rdfs:subClassOf+ rdfs:Class }) }
  UNION
  { ?c a sh:NodeShape ; rdfs:subClassOf ?super }
  FILTER(isIRI(?c))
}
