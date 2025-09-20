Session: 2025-09-20 — Python Data Structures: LRU, Infinity, Utilities

What changed
- Expanded `programming/articles/python-data-structures.html` with new sections:
  - LRU Cache (OrderedDict implementation and functools.lru_cache memoization)
  - Infinity & Sentinels (float('inf'), -inf usage, Dijkstra init)
  - Bisect & LIS trick (bisect_left, insort, patience method)
  - Prefix sums with itertools.accumulate
  - Handy templates (sliding window, monotonic queue)
- Appended 10 related questions (q26–q35) to `programming/data/json/python/data-structures-questions.json` to align quiz with the new article content.

Why
- User requested coverage for LRU cache, infinity handling, and other utilities commonly used in LeetCode.
- Repo guideline: article should cover all questions in its quiz and be accessible via “Read Article”. The existing survey already linked `articles/python-data-structures.html`, so we updated that article and extended the quiz accordingly.

Notes / Tricky parts
- The quiz UI renders single-choice radios, so questions were framed to avoid multi-answer ambiguity (e.g., for infinity, chose a single “most portable” option).
- Retained existing quiz ID `python-data-structures` and `articleFile` mapping to avoid breaking links. No changes needed to `surveys.json`.
- Article uses its own simple Python syntax highlighting; examples were kept Pythonic and within that highlighter’s capabilities.

Next ideas
- Add a small section on Union-Find and an accompanying pair of questions if desired.
- Consider a dedicated “LeetCode Utilities” quiz if more breadth is needed beyond data structures.

Extension (same day)
- Pulled canonical patterns from `python.py` and integrated into the same article with new sections:
  - Two Pointers (both-ends and two arrays)
  - Fast/Slow Pointers and Reverse Linked List
  - Build String efficiently with `''.join`
  - Prefix-sum + hashmap (subarray sum equals k)
  - Tree DFS/BFS (recursive/iterative, level sizing)
  - Graph DFS/BFS (seen handling)
  - Heap Top-K (size-k min-heap)
  - Binary search variants (lower/upper bound, exact)
  - Binary search on answer (min/max feasible)
  - Backtracking skeleton and DP + memoization
  - Trie template
- Dijkstra’s algorithm (with `math.inf` and heap)
- Coin Change (backtracking) aligned with `src/coinchange.py`
- Extended quiz (`data-structures-questions.json`) with q36–q52 to cover each new section.

Further extension
- Added sections and quiz coverage for:
  - Bucket Sort (small-range integer sort, Top-K frequent via buckets)
  - Radix Sort (LSD, base-10, stable counting per digit; non-negative ints)
  - Cyclic Sort (1..n placement; also used to find missing/duplicate)
  - Greedy patterns and tips (interval scheduling by earliest finish, meeting rooms two-pointer sweep, exchange argument)
- Quiz appended q56–q63 to validate these concepts.

DSU addition
- Added Disjoint Set Union (Union-Find) section with path compression and union by rank, plus a connected components example.
- Quiz appended q64–q68 covering DSU init, path compression, union by rank/size, connectivity check, and amortized complexity.

Islands & bridge patterns
- Added three sections:
  - Islands via grid DFS/BFS (mark visited or flip to '0')
  - Islands via DSU with id = r*C + c
  - Shortest Bridge using island marking + multi-source BFS
- Quiz appended q69–q73 to check these techniques and the BFS-layer answer definition.
