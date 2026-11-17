# Changelog

## Unreleased

- Moved VAEM out of `ralphtq/linkedmodels` into its own repository, with its
  full commit history. IRIs are unchanged.
- `schema/vaem.ttl` brought in line with `2.0/schema/vaem.ttl` (adds the
  `rdfs:label` "VAEM Schema v2.0" and `dct:modified` 2020-03-25).
- Reasoner logs, test files and `.hide` copies moved to `archive/`.
- Removed `external/dcat.ttl` (an unused copy of the W3C DCAT vocabulary).
- Renamed `vaem.www/` to `www/` and dropped the TopBraid logos (and the
  unused `lm-poweredby-logo` CSS rule that referenced one of them).
- Removed the generated HTML documentation (`doc/2014`, `doc/2015`), the
  `debug/` folder and `test_unbound_graph.ttl`. They remain in the history.
- Added a GitHub Action that checks every `.ttl` file parses.
