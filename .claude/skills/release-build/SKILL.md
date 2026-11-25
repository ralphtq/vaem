---
name: release-build
description: How scripts/release.py turns the folders of src/ into the versioned and unversioned (latest) graphs in dist/, and what release.json holds. Use when adding a src/ folder or graph, renaming one, changing release.json, or explaining where a built or released file comes from, or building a release locally.
---

# Release build: from `src/` folders to `dist/` graphs

`scripts/release.py` builds every graph of a VAEM release. **There is no
list of files**: the graphs come from the layout of `src/`.

## The rule

- Every folder directly under `src/` is a folder of graphs. Its name is used,
  unchanged, as the folder in `dist/`.
- Every `src/<folder>/<name>.ttl` is one graph. Files that are not `.ttl`
  (a `README.md`, `.DS_Store`) and sub-folders are ignored.
- It is written twice:
  - versioned: `dist/<version>/<folder>/<name>-v<version>.ttl`, with the
    release tokens (`$$VERSION$$`, `$$RELEASE_DATE$$`, …) filled in;
  - unversioned: `dist/latest/<folder>/<name>.ttl`, where this repository's
    graph IRIs and file URLs lose the version (see `RELEASING.md`).
- If `release.json` has `derive_owl`, the OWL schema is derived from the one
  graph in `src/<derive_owl.from>/` (`scripts/derive_owl.py`) and written to
  `dist/<version>/owl/<name>_OWL-v<version>.ttl` and
  `dist/latest/owl/<name>_OWL.ttl`, where `<name>` is that graph's file name.
  `src/owl/` must therefore not exist, and the `from` folder must hold exactly
  one `.ttl` file; the build stops otherwise.
- **Graph IRIs do not follow the file layout.** They are written in the source
  files (with `$$VERSION$$`) and in `derive_owl.graph`, and a move or rename of
  a file does not change them. Only file names and folders follow `src/`.
- File URLs a graph gives for itself (`vaem:turtleFileURL`, `vaem:rdfxmlFileURL`)
  do follow the layout: when a file moves, change them in the source (and, for
  the OWL schema, in `scripts/owl-derivation/overlay.ttl`, which replaces the
  derived values).

## In VAEM today

| Source | Graphs | Versioned | Unversioned |
|---|---|---|---|
| `src/shacl/` | `SCHEMA_vaem` | `<version>/shacl/<name>-v<version>.ttl` | `latest/shacl/<name>.ttl` |
| derived from `src/shacl/` | `SCHEMA_vaem_OWL` | `<version>/owl/SCHEMA_vaem_OWL-v<version>.ttl` | `latest/owl/SCHEMA_vaem_OWL.ttl` |

## `release.json`

| Key | Meaning |
|---|---|
| `version` | the next release (X.Y.Z); snapshots build `<version>-SNAPSHOT` |
| `derive_owl` | `from`: the `src/` folder of the SHACL schema; `graph`: the OWL graph IRI (with `$$VERSION$$`); `overlay`: statements replacing derived values |

The release workflow updates `version` (and `CHANGELOG.md`) itself.

## Checks

The build fails if a token is left over, a graph does not parse, a resource
has more than one `rdfs:isDefinedBy`, an `rdf:HTML` literal is not well-formed
HTML (the message names the resource and the line, e.g. `unexpected-end-tag p`
for `<p><li>` or `</ol></p>`), two graphs would be written to the same
unversioned file, an unversioned copy differs from its versioned graph by more
than the version in IRIs, or validation fails.

- **Validation.** The graph in `src/shacl/` (the `derive_owl.from` folder)
  must conform to its own shapes.

## Adding or changing graphs

- **A new graph in an existing folder:** add `src/<folder>/<name>.ttl`. Nothing
  else is needed for the build.
- **A new kind of graph:** add a new folder under `src/`; it becomes a new
  folder in `dist/` and in the release.
- **Renaming a file or folder** renames the published files (and their
  download URLs), not the graph IRIs. Fix the file URLs it gives for itself,
  the README's file lists, and tell users of the old download links.
- After any change, build and look at the output:

  ```
  python3 scripts/release.py --version <version>-SNAPSHOT --out target/check
  find target/check -name '*.ttl' | sort
  ```

## Building locally

Run these from the repository's folder on your own computer.

**Once per repository:** the build needs `rdflib` and `pyshacl`. Install them
in a virtual environment in `.venv/` (git-ignored; each repository has its own):

```
python3 -m venv .venv
source .venv/bin/activate
python -m pip install rdflib pyshacl
```

**Each time:**

```
source .venv/bin/activate
python3 scripts/release.py --out target/dist
```

While `.venv` is active, the prompt starts with `(.venv)`; activate it again in
each new Terminal session.

This builds the version in `release.json` (now 3.0.1), dated today, into
`target/dist/<version>/…` and, unversioned, `target/dist/latest/…` (see the
table above). Options:

- `--version <version>-SNAPSHOT` for a snapshot; `--date YYYY-MM-DD` for another
  release date.
- `--out` must be a folder inside the repository. Use `target/…`, which is
  git-ignored; without `--out` the build writes to `dist/`, which is not.

**Reading the result.** A good build ends with
`release <version> (<date>) built in target/dist/; all checks passed`.
The build prints no warnings when all is well.
A failed build ends with `RELEASE CHECKS FAILED:` and one line per problem,
naming the file and, where there is one, the resource (see Checks above), and
exits with status 1.

**Common problems:**

- `ModuleNotFoundError: No module named 'rdflib'`: the virtual environment is
  missing or not active. Run `source .venv/bin/activate`; if `.venv/` does not
  exist yet, do the once-per-repository steps first.
- `... is not in the subpath of ...`: `--out` points outside the repository;
  use `target/…`.
- `rdf:HTML is not well-formed`: a description's HTML has a stray or unclosed
  tag (for example `<p><li>` or `</ol></p>`); fix it in `src/` (rule 4 in the
  ontology-design skill).

A local build only writes files on your computer. To publish a release, run
the **Release** workflow on GitHub (see `RELEASING.md`).

## Where the graphs end up

- Snapshot workflow (every push to `main`): the files of `dist/` are attached
  to the rolling `snapshot` pre-release.
- Release workflow: every `dist/**/*.ttl` and a zip are attached to the
  GitHub release, and `dist/<version>/` and `dist/latest/` are committed as
  `releases/<version>/` and `releases/latest/`.
