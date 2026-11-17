# Releasing VAEM

A release is built from the files in `src/`, which carry tokens instead of
version numbers. Nothing in `1.1/`, `2.0/`, `3.0/` or `schema/` is changed by
a release.

| Token | Replaced by |
|---|---|
| `$$VERSION$$` | the release version, e.g. `3.0.0` |
| `$$RELEASE_DATE$$` | the release date, `YYYY-MM-DD` |
| `$$<NAME>_VERSION$$` | the version of an imported ontology, from `imports` in `release.json` |

The version appears in every `rdfs:isDefinedBy`, the ontology IRIs,
`owl:versionIRI`, `vaem:isMetadataFor`, `vaem:revision`, `vaem:turtleFileURL`
and the metadata labels and titles.

## Edit

Change `src/shacl/SCHEMA_vaem.ttl` (the source) and make the same change in
`src/owl/SCHEMA_vaem.ttl`. Write versions as tokens, never as numbers.

## Try a release locally

```
python3 scripts/release.py --version 3.0.0
```

This writes `dist/<version>/…` and fails if a token is left over, a file does
not parse, a construct has more than one `rdfs:isDefinedBy`, the SHACL schema
does not conform to its own shapes, or the OWL and SHACL files differ.
`--version` defaults to `release.json` and `--date` to today.

## Dry run on GitHub

Every push to `release-pipeline`, and every pull request, runs the
**Release dry run** workflow. It builds `<version>-SNAPSHOT` and attaches the
built files to the run as the `vaem-dist-snapshot` artifact.

## Publish a release

Run the **Release** workflow (Actions → Release → Run workflow) with the
version. It must be one step on from the last `vX.Y.Z` tag. The workflow
builds and checks the release, adds the version to `CHANGELOG.md`, sets
`release.json` to the next patch version, tags `vX.Y.Z` and creates a GitHub
Release with the files and a zip. The workflow is only offered once it is on
the default branch.
