# sh:class C on a property shape of class X: X rdfs:subClassOf
# [ owl:onProperty p ; owl:allValuesFrom C ].
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:allValuesFrom ?v ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:class ?v . FILTER(isIRI(?p)) }
