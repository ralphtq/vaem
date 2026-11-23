# A property whose shapes all use the same single sh:class C (an
# owl:ObjectProperty) or the same single sh:datatype D (an
# owl:DatatypeProperty) gets that rdfs:range, if it has no range yet.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?p rdfs:range ?c }
WHERE {
  { SELECT ?p (COUNT(DISTINCT ?c0) AS ?n) (SAMPLE(?c0) AS ?c)
    WHERE { ?p a owl:ObjectProperty . ?ps sh:path ?p ; sh:class ?c0 } GROUP BY ?p }
  FILTER(?n = 1)
  FILTER NOT EXISTS { ?ps2 sh:path ?p . FILTER NOT EXISTS { ?ps2 sh:class ?c } }
  FILTER NOT EXISTS { ?p rdfs:range ?any }
} ;
INSERT { ?p rdfs:range ?d }
WHERE {
  { SELECT ?p (COUNT(DISTINCT ?d0) AS ?n) (SAMPLE(?d0) AS ?d)
    WHERE { ?p a owl:DatatypeProperty . ?ps sh:path ?p ; sh:datatype ?d0 } GROUP BY ?p }
  FILTER(?n = 1)
  FILTER NOT EXISTS { ?ps2 sh:path ?p . FILTER NOT EXISTS { ?ps2 sh:datatype ?d } }
  FILTER NOT EXISTS { ?p rdfs:range ?any }
}
