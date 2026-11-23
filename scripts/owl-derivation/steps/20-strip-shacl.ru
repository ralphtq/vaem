# Remove everything SHACL-only: property shapes and their blank nodes (removed
# with orphans in step 21), node shapes that are not classes, property groups,
# every sh: triple, and rdfs:Class typing where owl:Class is present.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

DELETE { ?s ?p ?o } WHERE { ?s a ?t . FILTER(STRSTARTS(STR(?t), STR(sh:))) FILTER NOT EXISTS { ?s a owl:Class } ?s ?p ?o } ;
DELETE { ?s ?p ?o } WHERE { ?s ?p ?o . FILTER(STRSTARTS(STR(?p), STR(sh:))) } ;
DELETE { ?s a ?t } WHERE { ?s a ?t . FILTER(STRSTARTS(STR(?t), STR(sh:))) } ;
DELETE { ?s ?p ?o } WHERE { ?s ?p ?o . FILTER(isIRI(?o) && STRSTARTS(STR(?o), STR(sh:)) && ?p != rdf:type) } ;
DELETE { ?c a rdfs:Class } WHERE { ?c a rdfs:Class , owl:Class }
