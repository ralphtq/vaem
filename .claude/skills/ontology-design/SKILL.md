---
name: ontology-design
description: Design rules for the SHACL/RDF graphs in VAEM, DEONA, NRMDOC and TROM — property shape naming, rdfs:isDefinedBy on every resource with vaem:isElaboratedIn for additions to other ontologies, one GMD_ graph metadata resource per graph, multi-line dcterms:description strings, and vaem:usesNonImportedResource for every elaborated resource from another namespace. Use when adding, renaming, reviewing or fixing classes, node shapes, property shapes or graph metadata in src/.
---

# Ontology design rules

These rules apply to every graph in `src/` of VAEM, DEONA, NRMDOC and TROM. Apply
them when you add or change resources, and check them when you review a change.
The files in `src/` carry release tokens (`$$VERSION$$` and others; see
`RELEASING.md`): write graph IRIs with the token, never with a version number.

## In VAEM

- Namespace: `http://www.linkedmodel.org/schema/vaem#` (prefix `vaem:`, a hash
  namespace: local names follow the `#`).
- Two sources, changed together: `src/shacl/SCHEMA_vaem.ttl` (the source) and
  `src/owl/SCHEMA_vaem.ttl`. See `RELEASING.md`.
- Graph IRIs: `http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem` and
  `http://www.linkedmodel.org/$$VERSION$$/schema/vaem`; graph metadata
  `vaem:GMD_VAEM`.
- The examples below come from DEONA, which uses the same rules; apply them to
  `vaem:` resources in the same way.

## Rule 1: property shape names

Every property shape is a **named** resource (an IRI, never a blank node), and
its local name is

```
<NodeShape>-<property>
```

where `<NodeShape>` is the local name of the node shape that refers to it with
`sh:property`, and `<property>` is the local name of the property in its
`sh:path`.

```turtle
deona:Compliance
  a trom:TraitClass, sh:NodeShape ;
  sh:property deona:Compliance-regulatedParty .

deona:Compliance-regulatedParty
  a sh:PropertyShape ;
  rdfs:isDefinedBy <https://w3id.org/deona/$$VERSION$$/schema> ;
  sh:path deona:regulatedParty ;
  sh:class deona:RegulatedParty .
```

Wrong: `deona:RegulatedPartyShape`, `deona:Compliance_regulatedParty`, or an
inline `sh:property [ sh:path deona:regulatedParty ]`.

When renaming a property shape, rename every `sh:property` that points at it,
in this repository and in the repositories that use this one (DEONA uses NRMDOC
and TROM).

### Current practice, not yet decided

The repositories handle these cases as described. Follow current practice, and
ask the maintainer before applying a different reading:

- **Inverse paths** (`sh:path [ sh:inversePath p ]`): `<NodeShape>-<p>-inverse`,
  e.g. `deona:PermissionKind-subsumingNormKind-inverse`.
- **A shape shared by several node shapes:** named after the most general one
  (the superclass), e.g. `nrmdoc:DocumentPart-fullText`, used by `Article` and
  others.
- **A property from another namespace:** prefix and local name joined by `_`,
  e.g. `deona:Norm-skos_broader` for `sh:path skos:broader`.
- **Property shapes no node shape uses:** some exist (for example
  `trom:Identifiable-title`); whether each must be attached to the node shape in
  its name is open.

## Rule 2: rdfs:isDefinedBy on every resource; vaem:isElaboratedIn outside the graph's namespace

For every IRI that is the subject of triples in a graph:

- **In the graph's own namespace** (the namespace of its prefix: `vaem:`,
  `deona:`, `deona.rc:`, `nrmdoc:`, `trom:`): exactly one `rdfs:isDefinedBy`, pointing
  at the graph's ontology IRI. This covers classes, node shapes, property
  shapes, properties, property groups, RDF lists, individuals and the graph
  metadata.
- **Not in the graph's namespace** (a resource of another ontology that this
  graph adds to): exactly one `rdfs:isDefinedBy`, pointing at the
  **unversioned** graph IRI of the ontology whose namespace it is in (no
  `$$…$$` token and no version number, e.g.
  `<https://w3id.org/nrmdoc/schema>`); **and** a `vaem:isElaboratedIn`
  pointing at the containing graph's ontology IRI.

```turtle
# In DEONA's schema graph: a DEONA resource
deona:Paragraph-regulatedParty
  a sh:PropertyShape ;
  rdfs:isDefinedBy <https://w3id.org/deona/$$VERSION$$/schema> ;
  sh:path deona:regulatedParty .

# In DEONA's schema graph: additions to an NRMDOC resource
nrmdoc:Paragraph
  a sh:NodeShape ;
  rdfs:isDefinedBy <https://w3id.org/nrmdoc/schema> ;
  sh:property deona:Paragraph-regulatedParty ;
  vaem:isElaboratedIn <https://w3id.org/deona/$$VERSION$$/schema> .
```

- Blank nodes are not resources in this sense and need neither.
- The `owl:Ontology` resource itself needs neither.
- `scripts/release.py` fails when a resource has more than one
  `rdfs:isDefinedBy` in a file, so add it once per resource.
- The unversioned IRI is the "latest" form of the other ontology's graph
  IRI (`https://w3id.org/nrmdoc/schema`, `https://w3id.org/trom/schema`); the
  ontology's own graph uses the versioned form. No entry in `release.json`
  is needed for it.

Open case: the DEONA taxonomy shares the `deona:` namespace with the DEONA
schema, and adds to `deona:Norm`, which the schema defines. Read as "in the
graph's namespace", it would get the taxonomy's `rdfs:isDefinedBy`, a second
one; read as "defined by another graph", it would get the schema's
`rdfs:isDefinedBy` plus `vaem:isElaboratedIn` for the taxonomy. Today it has
only `vaem:isElaboratedIn`. Ask the maintainer before changing it.

## Rule 3: one GMD_ graph metadata resource per graph

Every graph has exactly one `vaem:GraphMetaData` resource:

- in the **same namespace** (the same CURIE prefix) as the graph's resources;
- named `GMD_` followed by that **prefix in upper case**;
- linked from the ontology with `vaem:hasGraphMetadata`;
- with its own `rdfs:isDefinedBy` (rule 2).

| Graph | Prefix | Graph metadata |
|---|---|---|
| TROM schema | `trom:` | `trom:GMD_TROM` |
| NRMDOC schema | `nrmdoc:` | `nrmdoc:GMD_NRMDOC` |
| DEONA schema | `deona:` | `deona:GMD_DEONA` |

```turtle
<https://w3id.org/trom/$$VERSION$$/schema>
  a owl:Ontology ;
  vaem:hasGraphMetadata trom:GMD_TROM .

trom:GMD_TROM
  a vaem:GraphMetaData ;
  rdfs:isDefinedBy <https://w3id.org/trom/$$VERSION$$/schema> ;
  vaem:isMetadataFor <https://w3id.org/trom/$$VERSION$$/schema> ;
  vaem:namespace "https://w3id.org/trom/" ;
  vaem:namespacePrefix "trom" ;
  vaem:revision "$$VERSION$$" ;
  vaem:releaseDate "$$RELEASE_DATE$$"^^xsd:date .
```

Open case: the DEONA taxonomy shares the `deona:` prefix with the DEONA
schema, so the rule gives both graphs `deona:GMD_DEONA`. Ask the maintainer how
to name the taxonomies' graph metadata before adding it.

## Rule 4: multi-sentence descriptions are multi-line strings

A `dcterms:description` with more than one sentence is written as a Turtle
multi-line string: triple quotes, with a line break inside the literal (start
each sentence on a new line). A single sentence stays an ordinary string.

```turtle
deona:Grant
  dcterms:description """
A Grant is a kind of obligation.
An example of its use can be found when modeling policies.
"""@en ;
```

Wrong:

```turtle
  dcterms:description "A Grant is a kind of obligation. An example of its use can be found when modeling policies."@en ;
```

The line break inside the literal is what keeps the string multi-line:
Spotless rewrites the file from its triples, so a triple-quoted string with no
line break inside can come back as an ordinary one-line string. The same
applies whatever the literal's language tag or datatype (`@en`, `rdf:HTML`):
keep the existing tag or datatype when converting.

## Rule 5: list elaborated resources from other namespaces in the graph metadata

Every resource from another namespace that the graph elaborates (adds to,
marked with `vaem:isElaboratedIn` under rule 2) is listed in the graph's
`GMD_` resource (rule 3) with `vaem:usesNonImportedResource`.

```turtle
# In DEONA's schema graph
nrmdoc:Paragraph
  a sh:NodeShape ;
  rdfs:isDefinedBy <https://w3id.org/nrmdoc/schema> ;
  sh:property deona:Paragraph-regulatedParty ;
  vaem:isElaboratedIn <https://w3id.org/deona/$$VERSION$$/schema> .

deona:GMD_DEONA
  a vaem:GraphMetaData ;
  vaem:usesNonImportedResource nrmdoc:Paragraph .
```

When you add an elaboration, add its `vaem:usesNonImportedResource` in the
same change; when you remove the last elaboration of a resource, remove the
entry too.

## Checking

Before committing, run the release build (`python3 scripts/release.py
--version <next>-SNAPSHOT --out target/check`) and look at each changed
resource against the three rules. When renaming, search the other two
repositories for the old name.
