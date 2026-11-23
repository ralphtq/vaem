# VAEM — Vocabulary About Essential Metadata

VAEM is a small SHACL Schema and Vocabulary, also available in OWL, for the
essential metadata that an ontology or graph needs: dates and times, graph
roles, governance, attribution, and where the graph is documented and
registered. Other ontologies import it to give themselves this foundation. It
is used by [DTYPE](http://www.linkedmodel.org/schema/dtype),
[VOAG](http://voag.linkedmodel.org/schema/voag) and [QUDT](https://qudt.org).

## IRIs

|        What         |                            IRI                             |                      File                       |
|---------------------|------------------------------------------------------------|-------------------------------------------------|
| Ontology (current)  | `http://www.linkedmodel.org/schema/vaem`                   | `schema/vaem.ttl` (v2.0)                        |
| Namespace           | `http://www.linkedmodel.org/schema/vaem#` (prefix `vaem:`) |                                                 |
| v2.0                | `http://www.linkedmodel.org/2.0/schema/vaem`               | `2.0/schema/SCHEMA_vaem-v2.0.ttl`               |
| v3.0 (draft)        | `http://www.linkedmodel.org/3.0/schema/vaem`               | `3.0/schema/SCHEMA_vaem-v3.0.ttl`               |
| v3.0 SHACL (no OWL) | `http://www.linkedmodel.org/3.0.0/schema/shacl/vaem`       | `3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl` |

The IRIs are unchanged by the move out of `linkedmodels`. `schema/vaem.ttl`
is what the unversioned IRI resolves to, and is kept identical to
`2.0/schema/vaem.ttl`.

## Layout

```
schema/          current (unversioned) VAEM
1.1/schema/      v1.1 catalog schema
2.0/schema/      v2.0 schema
3.0/schema/      v3.0 schema (in development)
3.0/schema/shacl/ SHACL-only version of v3.0 (the source for the 3.0 OWL)
src/shacl/       SHACL source of the next release (the OWL schema is derived
                 from it at build time)
archive/         the hand-made OWL schema the derivation replaced
scripts/         parse check, release build (with the OWL derivation) and
                 snapshot comparison
images/          logo
```

## SHACL schema

`3.0/schema/shacl/SCHEMA_vaem_noOWL_v3.0.0.ttl` is a SHACL-only version of
VAEM 3.0: classes are `rdfs:Class` and `sh:NodeShape`, properties are
`rdf:Property`, and there are no OWL constructs apart from the
`owl:Ontology` header.

The SHACL schema in `src/shacl/` is the source of VAEM. The build derives the
OWL schema from it with `scripts/derive_owl.py` (see
[scripts/owl-derivation/README.md](scripts/owl-derivation/README.md)), so
make changes in the SHACL schema only.

## Build the graphs locally

`scripts/release.py` builds VAEM's graphs from `src/`, with the version and
release date filled in, and checks them. It needs Python 3 with `rdflib` and
`pyshacl`; a virtual environment in `.venv/` (git-ignored) keeps them apart
from other projects. From the top of the repository:

```
python3 -m venv .venv
source .venv/bin/activate
python -m pip install rdflib pyshacl
python3 scripts/release.py --out target/dist
```

Next time, only `source .venv/bin/activate` and the last line are needed. The
build uses the version in `release.json` and today's date, and writes:

```
target/dist/<version>/schema/SCHEMA_vaem-v<version>.ttl
target/dist/<version>/schema/shacl/SCHEMA_vaem_noOWL_v<version>.ttl
```

It also writes an unversioned ("latest") copy of each graph, in which this
repository's graph IRIs and file URLs have no version (the version stays in
labels and `vaem:revision`), and checks that it differs from the versioned
graph only in those IRIs (see the section on unversioned graphs below):

```
target/dist/latest/schema/SCHEMA_vaem.ttl
target/dist/latest/schema/shacl/SCHEMA_vaem_noOWL.ttl
```

Add `--version <version>-SNAPSHOT` for a snapshot, or `--date YYYY-MM-DD` for
another release date. Without `--out` the graphs go to `dist/`; `--out` must be
a folder inside the repository, and `target/` is git-ignored. The build fails
if a token is left over, a graph does not parse, or a check fails; see
[RELEASING.md](RELEASING.md) for the checks.

## Unversioned ("latest") graphs

Every build also makes an unversioned copy of each graph, for anyone who wants
"the latest VAEM" rather than a particular release. Other repositories
import VAEM by its unversioned IRI (design rule 6), e.g. `http://www.linkedmodel.org/schema/vaem`.

- **What changes:** in the copy, VAEM's own versioned graph IRIs lose their
  version: the ontology IRI, `rdfs:isDefinedBy`, imports of VAEM's own graphs,
  `vaem:isMetadataFor`, and file URLs and names. `http://www.linkedmodel.org/<version>/schema/vaem` becomes
  `http://www.linkedmodel.org/schema/vaem`. The version stays in labels, titles and `vaem:revision`, so a copy
  still says which release it came from. Imports of other repositories are
  unversioned already and do not change.
- **How it is checked:** `scripts/release.py` fails if a copy does not parse,
  still has a versioned IRI of VAEM, or differs from its versioned graph in
  anything but those IRIs. Two output files with the same name also fail the
  build, because GitHub release files need unique names.
- **Where it is published:** every push to `main` attaches the copies to the
  rolling `snapshot` pre-release, and the Release workflow attaches them to
  each release. The files have no version in their names, so these URLs always
  serve the newest release:

```
https://github.com/ralphtq/vaem/releases/latest/download/SCHEMA_vaem.ttl
https://github.com/ralphtq/vaem/releases/latest/download/SCHEMA_vaem_noOWL.ttl
```

## Formatting

The source schemas in `src/` and the Markdown files are formatted with
[Spotless](https://github.com/diffplug/spotless), using the settings QUDT
uses. `pom.xml` holds those settings; it covers
`src/**/*.ttl`, `README.md`, `CHANGELOG.md` and `RELEASING.md`, and nothing
in the version folders.

You need Java 25 (the RDF formatter will not run on older Java) and Maven
3.6.3 or later. Maven uses the Java in `JAVA_HOME`, so check `mvn -v` shows
Java 25 first. On a Mac with Homebrew:

```
brew install --cask temurin@25
export JAVA_HOME=$(/usr/libexec/java_home -v 25)
mvn -v
```

Run these from the top of the repository. To list the files that need
formatting, without changing anything:

```
mvn spotless:check
```

To format them in place:

```
mvn spotless:apply
```

Formatting does not change the triples, but it removes `#` comments from
Turtle files. Review the result with `git diff`, and undo it with
`git restore <files>` if needed.

The **Format** workflow on GitHub runs `spotless:check` on every push and
pull request, and fails if a file is not formatted. To format on GitHub
instead, run it from the Actions tab with "apply" ticked: it formats the
files, checks that no triples changed, and commits the result to the branch.

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
