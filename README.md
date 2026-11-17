# VAEM — Vocabulary About Essential Metadata

VAEM is a small SHACL Schema and Vocabulary, also available in OWL, for the
essential metadata that an ontology or graph needs: dates and times, graph
roles, governance, attribution, and where the graph is documented and
registered. Other ontologies import it to give themselves this foundation. It
is used by [DTYPE](http://www.linkedmodel.org/schema/dtype),
[VOAG](http://voag.linkedmodel.org/schema/voag) and [QUDT](https://qudt.org).

## IRIs

| What | IRI | File |
|---|---|---|
| Ontology (current) | `http://www.linkedmodel.org/schema/vaem` | `schema/vaem.ttl` (v2.0) |
| Namespace | `http://www.linkedmodel.org/schema/vaem#` (prefix `vaem:`) | |
| v2.0 | `http://www.linkedmodel.org/2.0/schema/vaem` | `2.0/schema/SCHEMA_vaem-v2.0.ttl` |
| v3.0 (draft) | `http://www.linkedmodel.org/3.0/schema/vaem` | `3.0/schema/SCHEMA_vaem-v3.0.ttl` |
| v3.0 SHACL (no OWL) | `http://www.linkedmodel.org/3.0.0/schema/shacl/vaem` | `3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl` |

The IRIs are unchanged by the move out of `linkedmodels`. `schema/vaem.ttl`
is what the unversioned IRI resolves to, and is kept identical to
`2.0/schema/vaem.ttl`.

## Layout

```
schema/          current (unversioned) VAEM
1.1/schema/      v1.1 catalog schema
2.0/schema/      v2.0 schema
3.0/schema/      v3.0 schema (in development)
3.0/schema/shacl/ SHACL-only version of v3.0, generated from the OWL
scripts/         parse check and the SHACL generator
images/          logo
```

## SHACL schema

`3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl` is a SHACL-only version of
VAEM 3.0: classes are `rdfs:Class` and `sh:NodeShape`, properties are
`rdf:Property`, and there are no OWL constructs apart from the
`owl:Ontology` header. It is generated from the 3.0 OWL, so edit
`3.0/schema/SCHEMA_vaem-v3.0.ttl` and regenerate rather than editing it by
hand:

```
python3 scripts/gen_vaem_shacl.py 3.0/schema/SCHEMA_vaem-v3.0.ttl \
  3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl \
  http://www.linkedmodel.org/3.0.0/schema/shacl/vaem \
  "SCHEMA VAEM SHACL Version 3.0.0" <date>
```

The last argument is written to `dcterms:modified` in the graph metadata.

## Dependencies

VAEM has no `owl:imports`. Its graph metadata refers to VOAG's license
individual `voag:CC-SHAREALIKE_3PT0-US` (and, in 3.0, to `voag:Attribution`
and `voag:Party`) without importing VOAG. DTYPE imports VAEM; VOAG imports
VAEM and DTYPE. The SHACL schemas of DTYPE and VOAG import the VAEM SHACL
schema.

## Work in progress

These branches carry VAEM work that has not yet been merged into `main`:

- `shacl_conversion`: SHACL shapes for v2.0
- `profiles`: v3.0 schema revisions and `3.0/vocab/VOCAB_VAEM-DISCIPLINES-v3.0.ttl`

## History

VAEM was previously maintained in
[ralphtq/linkedmodels](https://github.com/ralphtq/linkedmodels) under
`vaem/vaem.linkedmodel.org/`. Its full commit history was carried over when it
moved here.

## License

The ontology metadata declares VAEM to be issued under the Creative Commons
Attribution-ShareAlike 3.0 United States license, with attribution to
Linkedmodels. The license for this repository is under review.
