---
name: ontology-design
description: Design rules for the SHACL/RDF graphs — property shape naming, rdfs:isDefinedBy on every resource with vaem:isElaboratedIn for additions to other ontologies, one GMD_ graph metadata resource per graph, multi-line rdf:HTML dcterms:description strings with <p> paragraphs, and vaem:usesNonImportedResource for every elaborated resource from another namespace, and versioned owl:imports within a repository, unversioned across repositories. Use when adding, renaming, reviewing or fixing classes, node shapes, property shapes or graph metadata in src/.
---

# Ontology design rules

These rules apply to every graph in `src/`. Apply
them when you add or change resources, and check them when you review a change.
The files in `src/` carry release tokens (`$$VERSION$$` and others; see
`RELEASING.md`): write graph IRIs with the token, never with a version number.

## In VAEM

- Namespace: `http://www.linkedmodel.org/schema/vaem#` (prefix `vaem:`, a hash
  namespace: local names follow the `#`).
- Source: `src/shacl/SCHEMA_vaem.ttl`. The OWL schema is derived from it at
  build time by `scripts/derive_owl.py`: never edit OWL by hand; change the
  SHACL, a step in `scripts/owl-derivation/steps/`, or
  `scripts/owl-derivation/overlay.ttl`. See `RELEASING.md`.
- Graph IRIs: `http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem` and
  `http://www.linkedmodel.org/$$VERSION$$/schema/vaem`; graph metadata
  `vaem:GMD_VAEM`.
- The examples below use VAEM resources, and VOAG's `voag:Attribution` where a
  resource from another namespace is needed.

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
vaem:GraphMetaData
  a rdfs:Class, sh:NodeShape ;
  sh:property vaem:GraphMetaData-graphTitle .

vaem:GraphMetaData-graphTitle
  a sh:PropertyShape ;
  rdfs:isDefinedBy <http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem> ;
  sh:maxCount 1 ;
  sh:or vaem:StringOrLangString ;
  sh:path vaem:graphTitle .
```

Wrong: `vaem:GraphTitleShape`, `vaem:GraphMetaData_graphTitle`, or an inline
`sh:property [ sh:path vaem:graphTitle ]`.

When renaming a property shape, rename every `sh:property` that points at it,
in `src/shacl/` and in the ontologies that use
VAEM (VOAG, DTYPE, DEONA, NRMDOC, TROM and others).

### Current practice, not yet decided

The repositories handle these cases as described. Follow current practice, and
ask the maintainer before applying a different reading:

- **A property from another namespace:** VAEM names the shape with the
  property's local name only, e.g. `vaem:Aspect-broader` for
  `sh:path skos:broader`, and `vaem:GraphMetaData-description` for
  `sh:path dcterms:description`.
- **Inverse paths** (`sh:path [ sh:inversePath p ]`): `<NodeShape>-<p>-inverse`.
  VAEM has none at present.
- **A shape shared by several node shapes:** named after the most general one
  (the superclass). VAEM has none at present.
- **Property shapes no node shape uses:** whether each must be attached to the
  node shape in its name is open. VAEM has none at present.

## Rule 2: rdfs:isDefinedBy on every resource; vaem:isElaboratedIn outside the graph's namespace

For every IRI that is the subject of triples in a graph:

- **In the graph's own namespace** (here the namespace of `vaem:`): exactly one `rdfs:isDefinedBy`, pointing
  at the graph's ontology IRI. This covers classes, node shapes, property
  shapes, properties, property groups, RDF lists, individuals and the graph
  metadata.
- **Not in the graph's namespace** (a resource of another ontology that this
  graph adds to): exactly one `rdfs:isDefinedBy`, pointing at the
  **unversioned** graph IRI of the ontology whose namespace it is in (no
  `$$…$$` token and no version number, e.g.
  `<https://w3id.org/voag/schema>` for a `voag:` resource); **and** a
  `vaem:isElaboratedIn`
  pointing at the containing graph's ontology IRI.

```turtle
# In VAEM's SHACL schema graph: a VAEM resource
vaem:GraphMetaData-graphTitle
  a sh:PropertyShape ;
  rdfs:isDefinedBy <http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem> ;
  sh:path vaem:graphTitle .

# In VAEM's SHACL schema graph: additions to a VOAG resource
voag:Attribution
  a rdfs:Class, sh:NodeShape ;
  rdfs:isDefinedBy <https://w3id.org/voag/schema> ;
  vaem:isElaboratedIn <http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem> .
```

- Blank nodes are not resources in this sense and need neither.
- The `owl:Ontology` resource itself needs neither.
- `scripts/release.py` fails when a resource has more than one
  `rdfs:isDefinedBy` in a file, so add it once per resource.
- The unversioned IRI is the "latest" form of the other ontology's graph
  IRI (for VOAG, `https://w3id.org/voag/schema`); the ontology's own
  graph uses the versioned form. No entry in `release.json` is needed for it.

## Rule 3: one GMD_ graph metadata resource per graph

Every graph has exactly one `vaem:GraphMetaData` resource:

- in the **same namespace** (the same CURIE prefix) as the graph's resources;
- named `GMD_` followed by that **prefix in upper case**;
- linked from the ontology with `vaem:hasGraphMetadata`;
- with its own `rdfs:isDefinedBy` (rule 2).

| Graph | Prefix | Graph metadata |
|---|---|---|
| VAEM schema (SHACL and OWL) | `vaem:` | `vaem:GMD_VAEM` |

```turtle
<http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem>
  a owl:Ontology ;
  vaem:hasGraphMetadata vaem:GMD_VAEM .

vaem:GMD_VAEM
  a vaem:GraphMetaData ;
  rdfs:isDefinedBy <http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem> ;
  vaem:hasGraphRole vaem:SchemaGraph ;
  vaem:isMetadataFor <http://www.linkedmodel.org/$$VERSION$$/schema/vaem> ;
  vaem:namespacePrefix "vaem" ;
  vaem:revision "$$VERSION$$" ;
  vaem:releaseDate "$$RELEASE_DATE$$"^^xsd:date .
```

## Rule 4: multi-sentence descriptions are multi-line HTML strings

A `dcterms:description` with more than one sentence is written as a Turtle
multi-line string: triple quotes, with a line break inside the literal (start
each sentence on a new line), typed `rdf:HTML` with its paragraphs in
`<p>` elements (below). A single sentence stays an ordinary string.

```turtle
vaem:Domain
  dcterms:description """
<p>A domain is a subject area of interest.
Examples of domains are "chemistry", "physics", "material science", "mechanics" and "medicine".</p>
"""^^rdf:HTML .
```

Wrong:

```turtle
  dcterms:description "A domain is a subject area of interest. Examples of domains are \"chemistry\", \"physics\", \"material science\", \"mechanics\" and \"medicine\"."^^rdf:HTML ;
```

The line break inside the literal is what keeps the string multi-line:
Spotless rewrites the file from its triples, so a triple-quoted string with no
line break inside can come back as an ordinary one-line string. The same
applies whatever the literal's datatype.

A description on more than one line is HTML:

1. Each paragraph (the text before a blank line, and the text after the last
   one; the whole text if there are no blank lines) is wrapped in
   `<p>…</p>`, still one sentence per line inside it. A paragraph that already
   starts with a block element (`<p>`, `<div>`, `<ol>`, `<ul>`, `<table>` …)
   is left as it is.
2. The blank lines are removed.
3. The string is typed `^^rdf:HTML`; a language tag such as `@en` is dropped,
   because an `rdf:HTML` literal cannot carry one.

In text that was not HTML before, escape `&`, `<` and `>` as `&amp;`, `&lt;`
and `&gt;` (`<maintainer@vim.org>` becomes `&lt;maintainer@vim.org&gt;`,
`R&D` becomes `R&amp;D`). A one-line description stays an ordinary string,
with no markup.

```turtle
voag:CLS_AGPL_V3PT0-00
  dcterms:description """
<p>"This License" refers to version 3 of the GNU Affero General Public License.</p>
<p>"The Program" refers to any copyrightable work licensed under this License.
Each licensee is addressed as "you".
"Licensees" and "recipients" may be individuals or organizations.</p>
"""^^rdf:HTML ;
```

Wrong: the same text as plain lines with a blank line between the paragraphs
and no `^^rdf:HTML`.

What counts as a sentence end: `.`, `!` or `?` (with any closing quote or
bracket) followed by a space and a capital letter, a digit or an opening
quote or bracket. These do not end a sentence:

- abbreviations: `e.g.`, `i.e.`, `etc.`, `Inc.`, `Ltd.`, `Corp.`, `No.`,
  `Sec.`, `v.`, `vs.`, month names such as `Oct.` and `Sept.`;
- initials and acronyms with stops: `U.S.`, `C.F.R.`;
- clause numbers at the start of the text: `3. All copies …`, `1.1 "Copyright Holder" …`.

A company suffix does end a sentence when an ordinary sentence opener follows
it ("…Zend Technologies Ltd. For written permission…"), but not before a name
("Unicode, Inc. License Agreement") or in all-capitals text ("SILICON
GRAPHICS, INC. BE LIABLE").

A long text that is already triple-quoted, such as a license clause, keeps
its layout: its paragraphs (now `<p>` elements) and numbered or lettered
items stay as they are; only a line holding more than one sentence is split.
A heading run into its text ("2.2. Contributor Grant. Subject to…") is split
like a sentence, so the heading gets its own line. Start the string with a
line break after the opening `"""`, so a text that begins with a quote or a
tag does not run into it (`""""This License"…`).

`scripts/split_descriptions.py` applies this rule to one-line and triple-quoted
strings, including the HTML steps above. Run it
without `--write` first: it lists every split point
(`…end of one sentence || start of the next…`); check them, add any
abbreviation it splits wrongly to its `ABBREV` set, then run it again with
`--write`:

```
python3 scripts/split_descriptions.py src/<folder>/*.ttl
python3 scripts/split_descriptions.py --write src/<folder>/*.ttl
```

Inside a triple-quoted string, write a double quote as a plain `"`, never as
`\"`: Turtle needs the escape only in an ordinary one-line string. When you
convert a one-line string to a multi-line one, remove the backslashes. The only
exceptions are a `"` immediately before the closing `"""` and three `"` in a
row, which still need `\"`.

```turtle
  dcterms:description """
<p>The property "vaem:owningParty" is used to refer to a "Party" that has the IP rights
on the graph.</p>
"""^^rdf:HTML ;
```

Wrong, inside a triple-quoted string: `The property \"vaem:owningParty\" is used to refer to a \"Party\"`.

## Rule 5: list elaborated resources from other namespaces in the graph metadata

Every resource from another namespace that the graph elaborates (adds to,
marked with `vaem:isElaboratedIn` under rule 2) is listed in the graph's
`GMD_` resource (rule 3) with `vaem:usesNonImportedResource`.

```turtle
# In VAEM's SHACL schema graph
voag:Attribution
  a rdfs:Class, sh:NodeShape ;
  rdfs:isDefinedBy <https://w3id.org/voag/schema> ;
  vaem:isElaboratedIn <http://www.linkedmodel.org/$$VERSION$$/schema/shacl/vaem> .

vaem:GMD_VAEM
  a vaem:GraphMetaData ;
  vaem:usesNonImportedResource voag:Attribution .
```

When you add an elaboration, add its `vaem:usesNonImportedResource` in the
same change; when you remove the last elaboration of a resource, remove the
entry too.

## Rule 6: owl:imports: versioned within the repository, unversioned across repositories

- An `owl:imports` of a graph **in the same repository** names its versioned
  IRI, with the same `$$VERSION$$` as the importing graph, so a release imports
  its own graphs at that release.
- An `owl:imports` of a graph **from another repository** names that graph's
  unversioned IRI (the graph IRI without its version segment), which stands
  for the latest version. No other `$$…$$` token appears in an import.

```turtle
# In a license graph: VOAG's SHACL schema, from this repository
<https://w3id.org/voag/$$VERSION$$/refdata/license-ccby-4pt0>
  a owl:Ontology ;
  owl:imports <https://w3id.org/voag/$$VERSION$$/schema/shacl> .

# In VOAG's SHACL schema graph: VAEM and DTYPE, from other repositories
<https://w3id.org/voag/$$VERSION$$/schema/shacl>
  a owl:Ontology ;
  owl:imports <http://www.linkedmodel.org/schema/dtype> ;
  owl:imports <http://www.linkedmodel.org/schema/vaem> .
```

Wrong: `owl:imports <http://www.linkedmodel.org/3.0.0/schema/vaem>` or
`owl:imports <http://www.linkedmodel.org/$$VAEM_VERSION$$/schema/vaem>` (another
repository: no version).

`scripts/release.py` checks both cases and fails on a wrong import.

## Checking

Before committing, run the release build (`python3 scripts/release.py
--version <next>-SNAPSHOT --out target/check`) and look at each changed
resource against the five rules. When renaming, search the ontologies that use
VAEM for the old name.
