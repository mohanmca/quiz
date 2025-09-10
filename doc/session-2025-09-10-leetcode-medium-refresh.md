# Session Notes — 2025-09-10 — LeetCode Medium Patterns Refresh

## What changed
- Article `programming/articles/leetcode-medium-python.html` expanded:
  - Added sections: Order of Code, Binary Search, Two Pointers, Merge Intervals, Monotonic Stack, Prefix Sum, Union-Find, and Combinatorics & Off-by-One.
  - Emphasized execution order templates per pattern to avoid off-by-one bugs.
- Quiz `programming/data/json/python/leetcode-medium-questions.json` extended with pattern-coded snippets (<=22 lines):
  - lower_bound/upper_bound, two_sum_sorted, merge_intervals, next_greater (monotonic stack), subarray_sum == k (prefix sum), DSU minimal, and a bounds-based count helper.

## What I learned / reinforced
- The quiz supports inline fenced code; ensure JSON escaping for backticks and newlines.
- Keeping snippets under ~22 lines enforces template clarity and interview-friendliness.
- Order-of-operations sections help reduce off-by-one and invariant mistakes.

## Tricky parts
- Balancing completeness with the 22‑line constraint; chose canonical templates rather than full problem variants.
- Preserved existing questions and added new ones without breaking JSON structure.

## Verification
- Open the article locally; ensure new ToC anchors work and code highlights.
- Start the quiz and confirm new code-based questions render properly and answers match.

