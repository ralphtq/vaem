# A class (rdfs:Class, or an instance of a metaclass that is a subclass of
# rdfs:Class) becomes an owl:Class. Node shapes that are not classes are
# removed later.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?c a owl:Class }
WHERE {
  ?c a ?t .
  FILTER(isIRI(?c))
  FILTER(?t = rdfs:Class || EXISTS { ?t rdfs:subClassOf+ rdfs:Class })
}
