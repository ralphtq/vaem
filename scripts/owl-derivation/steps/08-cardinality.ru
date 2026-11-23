# sh:minCount and sh:maxCount: owl:cardinality when they are equal,
# otherwise owl:minCardinality (above 0) and owl:maxCardinality.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:cardinality ?m ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:minCount ?lo ; sh:maxCount ?hi .
        FILTER(isIRI(?p) && xsd:integer(?lo) = xsd:integer(?hi)) BIND(STRDT(STR(?hi), xsd:nonNegativeInteger) AS ?m) } ;
INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:minCardinality ?m ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:minCount ?lo .
        FILTER(isIRI(?p) && xsd:integer(?lo) > 0)
        FILTER NOT EXISTS { ?ps sh:maxCount ?hi . FILTER(xsd:integer(?hi) = xsd:integer(?lo)) }
        BIND(STRDT(STR(?lo), xsd:nonNegativeInteger) AS ?m) } ;
INSERT { ?c rdfs:subClassOf [ a owl:Restriction ; owl:onProperty ?p ; owl:maxCardinality ?m ] }
WHERE { ?c a owl:Class ; sh:property ?ps . ?ps sh:path ?p ; sh:maxCount ?hi .
        FILTER(isIRI(?p))
        FILTER NOT EXISTS { ?ps sh:minCount ?lo . FILTER(xsd:integer(?hi) = xsd:integer(?lo)) }
        BIND(STRDT(STR(?hi), xsd:nonNegativeInteger) AS ?m) }
