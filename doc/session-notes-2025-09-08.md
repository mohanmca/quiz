Session Notes — 2025-09-08

Changes made
- Expanded `programming/articles/rabin-karp.html` with:
  - “Where Rabin–Karp Shines” usage section (plagiarism detection, bioinformatics k-mers, log signatures, duplicates, multi-pattern lookup).
  - A compact Python snippet `rk_find_all` demonstrating a minimal rolling-hash search.
  - KMP quick primer section with an `build_lps` example and usage contrast.
  - RK vs KMP comparison table (goals, complexity, preprocessing, collisions, multi-pattern, usage, memory).
  - Light table styling for consistent visuals.
  - Added a DNA repeated k-mer example (base-4 rolling hash) with a compact Python snippet under the Usage section.
- Added two new sections on modulo arithmetic: fundamentals (addition, subtraction, multiplication, exponentiation, inverses) and interview tricks (normalization, pow with mod, inverses, double hashing, randomized bases, overflow notes).
  - Appended two practice tasks + a tiny Python test harness for fast pow and modular inverse with randomized checks.
- Expanded collisions section with when/why to use double hashing and included simple probability bounds: per-window ~1/M, union bound N/M, and with double hashing ~1/(M1*M2).
  - Added an off-by-one checklist (start = i - m + 1, window count n - m + 1, remove text[i-m], verify text[start:start+m]).
- Inserted two small ASCII diagrams clarifying forward (rightward) and backward (leftward) window slides with indices and incoming/outgoing positions.
  - Added inline SVG versions of both diagrams for sharper visuals while retaining ASCII as readable context.
  - Added a dedicated "Choosing the Base b" subsection: alphabet coverage, avoiding b=1, co-prime with M, randomized base, and guidance for bytes/DNA/lowercase.

Also updated quiz
- Rewrote `programming/data/json/python/rabin-karp-rolling-hash-questions.json` to 30 items covering:
- Now expanded to 40 items by adding 10 questions on modulo math properties, inverses, powmod, normalization, and overflow considerations.
  - Further expanded to 46 items with questions on distributivity, congruence definition, residue classes, modular division preconditions, nCr mod p approach, and correct pow call usage.
- Reached 50 items after adding: window count n-m+1, correct start index i-m+1, and collision probability (~1/M and ~1/(M1*M2)).
  - Reached 56 items by adding base-selection questions (guidelines, avoiding b=1, double-hash independent bases, bytes b=256 rationale, randomized base, and b < M preference).
  - Rolling hash math, base/mod choices, negative handling, collision verification, double hashing.
  - Practical usage including plagiarism detection, bio k-mers, multi-pattern matching constraints.
  - KMP basics: purpose, LPS table, complexity, and direct contrasts vs Rabin–Karp.

What I referenced/learned
- Drew content and examples from `rabin.md` (DNA/k-mer rolling hash, plagiarism/bioinformatics usages, KMP prefix-function explanation and contrasting goals).
- Reinforced the distinction: RK excels at multi-pattern fixed-length windows via hashing; KMP excels at single pattern, no-collision deterministic scanning.

Tricky points
- Ensuring the HTML table and new sections integrate cleanly with existing styles and the in-page TOC, without disrupting the article’s custom syntax highlighter.
- Keeping new Python snippets small and focused to satisfy “smaller code segment,” while avoiding duplication of the existing, fuller implementation.

Next ideas
- Add a short DNA repeated-sequence example (as in `rabin.md`) as an optional exercise, and link to any quiz items that discuss KMP to cross-connect topics.
