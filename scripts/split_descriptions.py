"""Design rule 4: put each sentence of a multi-sentence dcterms:description on its own line.

  python3 scripts/split_descriptions.py src/<folder>/*.ttl           # dry run
  python3 scripts/split_descriptions.py --write src/<folder>/*.ttl   # rewrite the files

A one-line string ("...") of two or more sentences becomes a triple-quoted
string with one sentence per line, with \" written as a plain " (as rule 4
requires inside triple quotes). In a string that is already triple-quoted,
each line of more than one sentence is split in the same way; blank lines and
the line structure (paragraphs, numbered items) are kept, and the string is
made to start and end with a line break. The text is otherwise unchanged.

A description that ends up on more than one line is then made HTML (rule 4):
each paragraph (text between blank lines; the whole text if there are none)
is wrapped in <p>...</p> unless it already starts with a block element
(<p>, <div>, <ol>, <ul>, <table>, ...), the blank lines are removed, and the
string is typed ^^rdf:HTML (any language tag is dropped). In text that was not
HTML before, &, < and > are escaped as &amp;, &lt; and &gt;. One-line
descriptions are left as they are. The dry run prints every split point
("...end of one sentence || start of the next...") so it can be checked before
writing.

What ends a sentence is set out under rule 4 in
.claude/skills/ontology-design/SKILL.md: ".", "!" or "?" (with any closing
quote or bracket), a space, then a capital letter, a digit or an opening quote
or bracket; but not after an abbreviation (ABBREV), initials ("U.S.",
"C.F.R."), or a clause number ("3. All copies"). A company suffix (COMPANY)
ends a sentence only before an ordinary sentence opener (OPENERS). A
bracketed cross-reference ("(See Section 2)") stays with the sentence before it. Add to these
sets when a dry run shows a wrong split.
"""
import pathlib
import re
import sys

ABBREV = {
    "e.g", "i.e", "etc", "inc", "ltd", "co", "corp", "llc", "no", "nos", "sec", "secs",
    "art", "para", "v", "vs", "mr", "mrs", "ms", "dr", "st", "jr", "sr", "cf", "fig",
    "approx", "viz", "al", "ver", "rev", "pp", "ed", "eds", "dept", "govt", "ch", "cl",
    "ref", "est", "op", "ibid", "u.s", "u.s.a", "u.k", "e.u",
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
}
# A company suffix ends the sentence before a usual sentence opener
# ("...Zend Technologies Ltd. For written permission"), not otherwise
# ("Unicode, Inc. License Agreement", "SILICON GRAPHICS, INC. BE LIABLE").
COMPANY = {"inc", "ltd", "corp", "co", "llc"}
OPENERS = re.compile(r"(For|No|If|The|This|These|You|Your|Any|Each|In|Such|Licensee|Nothing)\b")

BOUNDARY = re.compile(r'[.!?](?:\\"|["\')\]])*\s+(?=(?:\\"|["(\[])*[A-Z0-9])')
ONE_LINE = re.compile(r'(dcterms:description\s+)"(?!"")((?:[^"\\\n]|\\.)*)"((?:\^\^\S+|@[\w-]+)?)')
LONG = re.compile(r'(dcterms:description\s+)"""((?:[^"\\]|\\.|"(?!""))*)"""((?:\^\^\S+|@[\w-]+)?)', re.S)


def sentences(text):
    """The sentences of text, in order."""
    out, start = [], 0
    for m in BOUNDARY.finditer(text):
        last = re.search(r"(\S+)$", text[: m.start()])
        word = re.sub(r"<[^>]*>", "", last.group(1)).lower().strip('("\\') if last else ""
        stem = word.rstrip(".")
        if re.match(r"\(See\b", text[m.end():]):                  # "...a Modification. (See Section 2)"
            continue
        if text[m.start()] == "." and not (stem in COMPANY and OPENERS.match(text[m.end():])):
            if (stem in ABBREV
                    or re.fullmatch(r"[a-z]", word)                # a single initial
                    or re.fullmatch(r"\d+[a-z]?(\.\d+)*", word)    # clause number: "3." "3.1." "3a."
                    or re.fullmatch(r"[ivxlc]+(\.\d+)*", word)      # roman clause number: "IV." "V.1."
                    or re.fullmatch(r"[a-z](\.\d+)+", word)         # lettered clause number: "A.1."
                    or re.fullmatch(r"([a-z]\.)+[a-z]", word)):    # initials: "U.S", "C.F.R"
                continue
        out.append(text[start: m.end()].rstrip())
        start = m.end()
    out.append(text[start:].strip())
    return [s for s in out if s]


BLOCK = re.compile(r"<(p|div|ol|ul|dl|table|h[1-6]|pre|blockquote|section|hr)\b", re.I)
HTML = "^^rdf:HTML"


def as_html(body, suffix):
    """body (the lines of a multi-line description) as rule 4's HTML; returns (body, suffix)."""
    lines = body.split("\n")
    if len([l for l in lines if l.strip()]) < 2:
        return body, suffix
    was_html = suffix.endswith("HTML")
    paragraphs = [p.strip("\n") for p in re.split(r"\n[ \t]*\n+", body) if p.strip()]
    out = []
    for para in paragraphs:
        if not was_html:
            para = para.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        out.append(para if BLOCK.match(para.lstrip()) else f"<p>{para}</p>")
    return "\n".join(out), HTML


def main():
    args = sys.argv[1:]
    write = "--write" in args
    files = [a for a in args if a != "--write"]
    if not files:
        sys.exit(__doc__)
    n_strings = n_files = 0
    for name in files:
        path = pathlib.Path(name)
        text = path.read_text(encoding="utf-8")

        def replace(m):
            nonlocal n_strings
            parts = sentences(m.group(2))
            if len(parts) < 2:
                return m.group(0)
            n_strings += 1
            if not write:
                for a, b in zip(parts, parts[1:]):
                    print(f"{path.name}: ...{a[-40:]} || {b[:40]}...")
            # Inside a triple-quoted string a double quote is written plain (rule 4):
            # drop the backslash, but keep one where three quotes would meet.
            body = "\n".join(parts).replace('\\"', '"').replace('"""', '\\"""')
            body, suffix = as_html(body, m.group(3))
            return f'{m.group(1)}"""\n{body}\n"""{suffix}'

        def replace_long(m):
            nonlocal n_strings
            lines = []
            for line in m.group(2).strip("\n").split("\n"):
                parts = sentences(line) if line.strip() else []
                if len(parts) > 1 and not write:
                    for a, b in zip(parts, parts[1:]):
                        print(f"{path.name}: ...{a[-40:]} || {b[:40]}...")
                lines.extend(parts if len(parts) > 1 else [line.rstrip()])
            body = "\n".join(lines).replace('\\"', '"').replace('"""', '\\"""')
            body, suffix = as_html(body, m.group(3))
            new_string = f'{m.group(1)}"""\n{body}\n"""{suffix}'
            if new_string != m.group(0):
                n_strings += 1
            return new_string

        new = LONG.sub(replace_long, ONE_LINE.sub(replace, text))
        if new != text:
            n_files += 1
            if write:
                path.write_text(new, encoding="utf-8")
    verb = "rewritten" if write else "to rewrite (dry run; add --write)"
    print(f"{n_strings} descriptions in {n_files} files {verb}", file=sys.stderr)


if __name__ == "__main__":
    main()
