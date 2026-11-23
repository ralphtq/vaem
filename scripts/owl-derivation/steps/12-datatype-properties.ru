# A property declared in this graph whose shapes all point at literals
# (sh:datatype, sh:nodeKind sh:Literal, or an sh:or whose members all have an
# sh:datatype) becomes an owl:DatatypeProperty.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?p a owl:DatatypeProperty }
WHERE {
  ?p a rdf:Property .
  FILTER EXISTS { ?ps sh:path ?p . { ?ps sh:datatype ?x } UNION { ?ps sh:nodeKind sh:Literal }
                  UNION { ?ps sh:or ?alts . FILTER NOT EXISTS { ?alts rdf:rest*/rdf:first ?m . FILTER NOT EXISTS { ?m sh:datatype ?d } } } }
  FILTER NOT EXISTS {
    ?ps2 sh:path ?p .
    { ?ps2 sh:class ?y } UNION { ?ps2 sh:qualifiedValueShape/sh:class ?y }
    UNION { ?ps2 sh:nodeKind ?k . FILTER(?k IN (sh:IRI, sh:BlankNodeOrIRI, sh:BlankNode)) }
  }
}
