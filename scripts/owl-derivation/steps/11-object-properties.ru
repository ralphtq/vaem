# A property declared in this graph whose shapes all point at resources
# (sh:class, sh:node to a class, a qualified sh:class, sh:nodeKind sh:IRI or
# sh:BlankNodeOrIRI, or an sh:or whose members all have an sh:class) and never
# at literals becomes an owl:ObjectProperty.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?p a owl:ObjectProperty }
WHERE {
  ?p a rdf:Property .
  FILTER EXISTS {
    ?ps sh:path ?p .
    { ?ps sh:class ?x } UNION { ?ps sh:qualifiedValueShape/sh:class ?x } UNION { ?ps sh:node ?x . ?x a owl:Class }
    UNION { ?ps sh:nodeKind ?k . FILTER(?k IN (sh:IRI, sh:BlankNodeOrIRI, sh:BlankNode)) }
    UNION { ?ps sh:or ?alts . ?alts rdf:first ?first . FILTER NOT EXISTS { ?alts rdf:rest*/rdf:first ?m . FILTER NOT EXISTS { ?m sh:class ?c } } }
  }
  FILTER NOT EXISTS {
    ?ps2 sh:path ?p .
    { ?ps2 sh:datatype ?y } UNION { ?ps2 sh:nodeKind sh:Literal } UNION { ?ps2 sh:or/rdf:rest*/rdf:first/sh:datatype ?y }
  }
}
