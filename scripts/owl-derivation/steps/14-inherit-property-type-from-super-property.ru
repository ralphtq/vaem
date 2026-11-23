# A property still typed only rdf:Property takes the OWL property type of a
# super-property (rdfs:subPropertyOf, transitively) when its super-properties
# agree on one type.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

INSERT { ?p a ?t }
WHERE {
  { SELECT ?p (COUNT(DISTINCT ?t0) AS ?n) (SAMPLE(?t0) AS ?t)
    WHERE { ?p a rdf:Property ; rdfs:subPropertyOf+ ?super . ?super a ?t0 .
            FILTER(?t0 IN (owl:ObjectProperty, owl:DatatypeProperty)) } GROUP BY ?p }
  FILTER(?n = 1)
  FILTER NOT EXISTS { ?p a ?other . FILTER(?other IN (owl:ObjectProperty, owl:DatatypeProperty, owl:AnnotationProperty)) }
}
