# VAEM — Vocabulary About Essential Metadata

VAEM is a small OWL vocabulary for the essential metadata that an ontology or
graph needs: dates and times, graph roles, governance, attribution, and where
the graph is documented and registered. Other ontologies import it to give
themselves this foundation. It is used by [DTYPE](http://www.linkedmodel.org/schema/dtype),
[VOAG](http://voag.linkedmodel.org/schema/voag) and [QUDT](https://qudt.org).

## IRIs

| What | IRI | File |
|---|---|---|
| Ontology (current) | `http://www.linkedmodel.org/schema/vaem` | `schema/vaem.ttl` (v2.0) |
| Namespace | `http://www.linkedmodel.org/schema/vaem#` (prefix `vaem:`) | |
| v2.0 | `http://www.linkedmodel.org/2.0/schema/vaem` | `2.0/schema/SCHEMA_vaem-v2.0.ttl` |
| v3.0 (draft) | `http://www.linkedmodel.org/3.0/schema/vaem` | `3.0/schema/SCHEMA_vaem-v3.0.ttl` |

The IRIs are unchanged by the move out of `linkedmodels`. `schema/vaem.ttl`
is what the unversioned IRI resolves to, and is kept identical to
`2.0/schema/vaem.ttl`.

## Layout

```
schema/        current (unversioned) VAEM
1.0/ 1.1/      earlier versions, SPIN libraries and SWP pages
2.0/           v2.0 schema and the SWP/SMS generator scripts
3.0/           v3.0 schema (in development)
www/           CSS, JS and images used by the generated documentation
archive/       reasoner logs, test files and superseded copies, kept for reference
```

## Dependencies

VAEM has no `owl:imports`. Its own graph metadata (`vaem:GMD_VAEM`) uses a few
VOAG terms (`voag:Attribution`, `voag:Party`, `voag:GovernedObject`, the
license individual) without importing VOAG. DTYPE imports VAEM; VOAG imports
VAEM and DTYPE.

## Work in progress

These branches carry VAEM work that has not yet been merged into `main`:

- `shacl-schemas`: SHACL-only (no OWL) version of v3.0, `3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl`
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
