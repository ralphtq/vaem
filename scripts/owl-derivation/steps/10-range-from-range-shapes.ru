# A node shape that targets the subjects of p (sh:targetSubjectsOf p) and
# constrains p to one sh:datatype or sh:class gives p that rdfs:range, if p is
# declared in this graph and has no range yet.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

INSERT { ?p rdfs:range ?r }
WHERE {
  ?s a sh:NodeShape ; sh:targetSubjectsOf ?p ; sh:property ?ps .
  ?ps sh:path ?p . { ?ps sh:datatype ?r } UNION { ?ps sh:class ?r }
  ?p a ?pt . FILTER(?pt IN (rdf:Property, owl:ObjectProperty, owl:DatatypeProperty))
  FILTER NOT EXISTS { ?p rdfs:range ?any }
}
