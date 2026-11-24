# Releasing VAEM

A release is built from the files in `src/`, which carry tokens instead of
version numbers. Nothing in `1.1/`, `2.0/`, `3.0/` or `schema/` is changed by
a release.

|       Token        |            Replaced by            |
|--------------------|-----------------------------------|
| `$$VERSION$$`      | the release version, e.g. `3.0.0` |
| `$$RELEASE_DATE$$` | the release date, `YYYY-MM-DD`    |

The version appears in every `rdfs:isDefinedBy`, the ontology IRIs,
`owl:versionIRI`, `vaem:isMetadataFor`, `vaem:revision`, `vaem:turtleFileURL`
and the metadata labels and titles.

## Edit

Change `src/shacl/SCHEMA_vaem.ttl`, which is the source. The OWL schema is not
edited: `scripts/release.py` derives it from the SHACL schema at build time
(see `scripts/owl-derivation/README.md`). Write versions as tokens, never as
numbers. `archive/SCHEMA_vaem.ttl` is the hand-made OWL schema the derivation
replaced; nothing reads it.

## Where the built graphs go

The build has no list of files. Every `src/<folder>/<name>.ttl` is built to
`dist/<version>/<folder>/<name>-v<version>.ttl` and, unversioned, to
`dist/latest/<folder>/<name>.ttl`. The OWL schema derived from the graph in
`src/shacl/` (`derive_owl` in `release.json`) goes to
`dist/<version>/owl/<name>_OWL-v<version>.ttl` and `dist/latest/owl/<name>_OWL.ttl`.
Graph IRIs are set in the sources and do not follow the file layout. See
`.claude/skills/release-build/SKILL.md`.

## Try a release locally

```
python3 scripts/release.py --version 3.0.0
```

This writes `dist/<version>/…`, and an unversioned ("latest") copy of each
graph in `dist/latest/…` (graph IRIs and file names without the version).
It fails if an unversioned copy differs from its versioned graph by more
than those IRIs, or if a token is left over, a file does
not parse, a construct has more than one `rdfs:isDefinedBy`, or the SHACL
schema does not conform to its own shapes.
`--version` defaults to `release.json` and `--date` to today.

## Snapshots

Every push to `main` runs the
**Snapshot** workflow. It builds `<version>-SNAPSHOT`, where `<version>` is the
next release in `release.json`, runs all the checks, and replaces the rolling
**snapshot** pre-release on GitHub: the `snapshot` tag moves to the pushed
commit and the release's files are replaced. Its IRIs carry `-SNAPSHOT`, so a
snapshot is never mistaken for a finished version. Pull requests get a dry run
only: the files are attached to the workflow run, nothing is published.

## Publish a release

A release is the snapshot you have checked, rebuilt with the final version:

1. Check the current snapshot (Releases → snapshot).
2. Run the **Release** workflow (Actions → Release → Run workflow) on `main`.
   Leave the version blank to release the version in `release.json` (the
   snapshot's version without `-SNAPSHOT`), or enter it, e.g. `3.0.0`.

The workflow refuses to publish unless the version is one step on from the
last `vX.Y.Z` tag, the run is on the commit the snapshot was built from, and
the rebuilt files say the same as the snapshot apart from the version and
release dates (`scripts/compare_snapshot.py`). It then adds the version to
`CHANGELOG.md`, sets `release.json` to the next patch version, commits the
built files to `releases/<version>/` (the same layout as `dist/<version>/`)
and the unversioned ones to `releases/latest/` (replacing the previous
release's), tags `vX.Y.Z`,
creates the GitHub Release with the files and a zip, and removes the snapshot
pre-release until the next push. The workflow is only offered once it is on
the default branch.
