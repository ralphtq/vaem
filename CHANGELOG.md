# Changelog

## Unreleased

- Moved VAEM out of `ralphtq/linkedmodels` into its own repository, with its
  full commit history. IRIs are unchanged.
- `schema/vaem.ttl` brought in line with `2.0/schema/vaem.ttl` (adds the
  `rdfs:label` "VAEM Schema v2.0" and `dct:modified` 2020-03-25).
- Removed `external/dcat.ttl` (an unused copy of the W3C DCAT vocabulary).
- Removed `vaem.www/`, the CSS, JS and images used by the old generated
  documentation (including the TopBraid logos). The VAEM logo is now at
  `images/logos/vaem_logo_300x110.png`, as in DTYPE and VOAG.
- Removed the generated HTML documentation (`doc/2014`, `doc/2015`), the
  `debug/` folder and `test_unbound_graph.ttl`. They remain in the history.
- Removed the 1.0 SPIN libraries and SWP test page, the 2.0 SPARQLMotion
  generator scripts, reasoner logs, test files and `.hide` copies. They
  remain in the history.
- Fixed spelling in the schema descriptions (registry, solely,
  organization, introduced).
- Linkedmodels is now the owner and steward (`vaem:LinkedModels`).
- VAEM 3.0: the acronym is expanded as "Vocabulary About Essential Metadata";
  the `withAttributionTo` shape no longer rejects text attributions; added
  `acronym`, `title`, `url`, `timestamp`, `aspectScope`, `disciplineScope`,
  `domainScope` and `viewpointScope`; `dash:reifiableBy` is declared once.
- Graph roles: descriptions that referred to SPIN now refer to SHACL;
  `vaem:SPINlibraryGraph` is renamed `vaem:SHACLlibraryGraph` (2.0);
  `vaem:UnspecifiedGraphRole` has its own description and the prefix
  `UNSPECIFIED`; removed `vaem:UtilityGraph` (2.0 and 3.0) and
  `vaem:ViewerGraph` and `vaem:ViewGraph` (2.0); graph-role labels use
  "Graph" consistently (3.0).
- Added the graph roles `vaem:AIGovernanceGraph` (prefix `AIGOV`) and
  `vaem:PoliciesGraph` (prefix `POLICIES`) to VAEM 3.0.
- Added the SHACL-only schema `3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl`,
  generated from VAEM 3.0 by `scripts/gen_vaem_shacl.py`.
- The SHACL schema is now the source of VAEM 3.0 and the OWL file is generated
  from it. `scripts/gen_vaem_shacl.py` (OWL to SHACL) is kept as a check, with
  a `--check` option that compares the two files without writing anything.
- Added a GitHub Action that checks every `.ttl` file parses.

