Session Notes — 2025-09-08

Changes made
- Expanded `programming/articles/rabin-karp.html` with:
  - “Where Rabin–Karp Shines” usage section (plagiarism detection, bioinformatics k-mers, log signatures, duplicates, multi-pattern lookup).
  - A compact Python snippet `rk_find_all` demonstrating a minimal rolling-hash search.
  - KMP quick primer section with an `build_lps` example and usage contrast.
  - RK vs KMP comparison table (goals, complexity, preprocessing, collisions, multi-pattern, usage, memory).
  - Light table styling for consistent visuals.
- Added a DNA repeated k-mer example (base-4 rolling hash) with a compact Python snippet under the Usage section.

Also updated quiz
- Rewrote `programming/data/json/python/rabin-karp-rolling-hash-questions.json` to 30 items covering:
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
