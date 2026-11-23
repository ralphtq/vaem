# Deriving the OWL schema from the SHACL schema

The SHACL schema (`src/shacl/SCHEMA_vaem.ttl`) is the source. The OWL schema
is derived from it at build time: `scripts/release.py` builds the SHACL graph,
then `scripts/derive_owl.py` applies the steps below to a copy of it and
writes the result as `dist/<version>/schema/SCHEMA_vaem-v<version>.ttl`, with
the graph IRI `http://www.linkedmodel.org/<version>/schema/vaem` (the `derive_from`
entry in `release.json`). Nothing in `src/` is OWL, so the two cannot drift
apart. The method follows QUDT's SHACL-to-OWL derivation, with far fewer steps.

To derive from a built SHACL file by hand:

```
python3 scripts/derive_owl.py dist/<version>/schema/shacl/SCHEMA_vaem_noOWL_v<version>.ttl \
  http://www.linkedmodel.org/<version>/schema/vaem --overlay scripts/owl-derivation/overlay.ttl > owl.ttl
```

## Steps (`steps/`, applied in file-name order)

`.ru` files are SPARQL Updates, in which `{{SHACL}}` and `{{OWL}}` stand for
the two graph IRIs; `.py` files are Python steps for RDF lists.

| Step | What it does |
|---|---|
| 01 | Every use of the SHACL graph IRI (ontology, `rdfs:isDefinedBy`, `vaem:isElaboratedIn`, `vaem:isMetadataFor`) names the OWL graph instead |
| 02 | Classes (`rdfs:Class`, or instances of a subclass of it) become `owl:Class` |
| 03–06 | A class's property shapes become restrictions: `sh:class` and `sh:datatype` → `owl:allValuesFrom`; `sh:node` to something that is not a local shape → `owl:allValuesFrom`; `sh:hasValue` → `owl:hasValue` |
| 07 | Qualified shapes: `sh:qualifiedMinCount 1` → `owl:someValuesFrom`; higher → `owl:minQualifiedCardinality` with `owl:onClass`; `sh:qualifiedMaxCount` → `owl:maxQualifiedCardinality` |
| 08 | `sh:minCount`/`sh:maxCount` → `owl:cardinality` when equal, otherwise `owl:minCardinality` (above 0) and `owl:maxCardinality` |
| 09 | `sh:or` of classes or of datatypes → `owl:allValuesFrom` a union; `sh:in` → `owl:allValuesFrom` an `owl:oneOf` |
| 10 | Range shapes (`sh:targetSubjectsOf p` with one `sh:datatype`/`sh:class`) → `rdfs:range` of p |
| 11–12 | A property declared here becomes `owl:ObjectProperty` when its shapes only point at resources, `owl:DatatypeProperty` when they only point at literals (an `sh:or` counts when all its members have an `sh:class`, or all an `sh:datatype`); mixed properties stay `rdf:Property` |
| 13 | A typed property whose shapes all use one `sh:class` or one `sh:datatype` gets it as `rdfs:range` |
| 14 | A property with no evidence of its own takes the type its super-properties agree on |
| 15 | `rdf:Property` is dropped where an OWL property type was derived |
| 19 | Named lists used only as SHACL values (`sh:or`, `sh:and`, `sh:xone`, `sh:in`), such as `vaem:StringOrLangString`, are removed |
| 20 | Everything SHACL-only is removed: shapes, groups, `sh:` triples, and `rdfs:Class` where `owl:Class` is present |

Afterwards, orphaned blank nodes are removed and `overlay.ttl` is applied: for
each subject and predicate in it, the derived values are replaced by the
overlay's. Use the overlay only for what the SHACL schema cannot say.

Properties with no evidence in the shapes (no shape uses them, no range, no
typed super-property) stay `rdf:Property`.

## Checks

`release.py` fails if the derived graph has a SHACL term left, still uses the
SHACL graph IRI, lacks the OWL ontology, has a class with shapes but no
`owl:Class`, has a malformed restriction or one that contradicts its
property's type, restricts a property defined here that has no type, or has
orphaned blank nodes. The usual checks (parsing, a single `rdfs:isDefinedBy`,
imports, the unversioned copy) apply to it as to every built graph.
