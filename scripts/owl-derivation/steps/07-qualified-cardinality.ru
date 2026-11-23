# sh:qualifiedValueShape [ sh:class C ] with sh:qualifiedMinCount 1:
# owl:someValuesFrom C; with a higher count, owl:minQualifiedCardinality n and
# owl:onClass C. sh:qualifiedMaxCount: owl:maxQualifiedCardinality.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:someValuesFrom ?v ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:qualifiedMinCount ?n ; sh:qualifiedValueShape/sh:class ?v .
        FILTER(isIRI(?p) && xsd:integer(?n) = 1) } ;
INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:minQualifiedCardinality ?m ; owl:onClass ?v ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:qualifiedMinCount ?n ; sh:qualifiedValueShape/sh:class ?v .
        FILTER(isIRI(?p) && xsd:integer(?n) > 1) BIND(STRDT(STR(?n), xsd:nonNegativeInteger) AS ?m) } ;
INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:maxQualifiedCardinality ?m ; owl:onClass ?v ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:qualifiedMaxCount ?n ; sh:qualifiedValueShape/sh:class ?v .
        FILTER(isIRI(?p)) BIND(STRDT(STR(?n), xsd:nonNegativeInteger) AS ?m) }
