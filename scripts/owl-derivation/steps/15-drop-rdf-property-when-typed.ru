# rdf:Property is dropped where a specific OWL property type was derived.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

DELETE { ?p a rdf:Property }
WHERE { ?p a rdf:Property ; a ?t . FILTER(?t IN (owl:ObjectProperty, owl:DatatypeProperty, owl:AnnotationProperty)) }
