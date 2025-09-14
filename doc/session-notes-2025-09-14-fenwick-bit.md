# Session Notes — Fenwick Tree Article and Quiz (2025-09-14)

Changes made:
- Rewrote `programming/articles/fenwick-tree-fundamentals.html` into a deep-dive guide.
  - Added sections: overview & mental model, bit trick (i & -i), core API (`FenwickSum`), variants (RUPQ, RURQ with two BITs, 2D Fenwick), order statistics (find k-th), coordinate compression, FenwickMax for DP, mappings to LeetCode problems, pitfalls and complexity.
  - Included multiple Python code snippets with syntax highlighting.

- Expanded quiz `programming/data/json/python/fenwick-tree-questions.json`.
  - Kept foundational questions.
  - Added advanced questions covering: RUPQ concept, RURQ prefix formula, 2D BIT update skeleton, order-statistics bitmask step, when to prefer BIT vs Segment Tree, BIT-friendly problems, 2D complexity, inversion counting complexity, and coordinate compression use.

What I learned / reinforced:
- RURQ derivation using two BITs and why `prefix(x) = sum(B1,x) * x - sum(B2,x)` works (telescoping with weighted differences).
- Using Fenwick as a prefix-maximum structure (swap sum→max) enables LIS-like DP in O(n log n) with value compression.
- 2D Fenwick is straightforward conceptually (nested loops), but constants are higher; still valuable for dense update/query workloads.
- Order-statistics on a frequency Fenwick is an elegant binary lifting trick using the implicit power-of-two tree shape.

Tricky aspects addressed:
- Keeping 0-based inputs with 1-based internal indexing consistent across sum, max, RUPQ, RURQ and 2D variants (especially bounds around `r+1 < n`).
- Embedding fenced Python code inside JSON quiz choices while preserving escaping for the app’s markdown-lite renderer.
- Curating LeetCode mappings where BIT is a primary or competitive approach and calling out cases where Segment Tree/heap may be more idiomatic (e.g., Skyline).

Next ideas:
- Add a few hands-on mini exercises in the article (e.g., implement `find_by_order` and validate with unit tests in a small JS runner or Python notebook link).
- Consider a separate quiz focused solely on BIT applications (inversions, order-statistics, LIS-II, range updates) with small, runnable snippets.

