# sh:hasValue V: an owl:hasValue V restriction.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:hasValue ?v ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:hasValue ?v . FILTER(isIRI(?p)) }
