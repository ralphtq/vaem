# Every use of the SHACL graph IRI (the ontology, rdfs:isDefinedBy,
# vaem:isElaboratedIn, vaem:isMetadataFor) now names the OWL graph.
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sh: <http://www.w3.org/ns/shacl#>

DELETE { {{SHACL}} ?p ?o } INSERT { {{OWL}} ?p ?o } WHERE { {{SHACL}} ?p ?o } ;
DELETE { ?s ?p {{SHACL}} } INSERT { ?s ?p {{OWL}} } WHERE { ?s ?p {{SHACL}} }
