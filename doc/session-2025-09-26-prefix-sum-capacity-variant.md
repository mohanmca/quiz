# Session Notes - 2025-09-26 Prefix Sum Capacity Variant

## What I touched
- Expanded `programming/articles/leetcode-medium-python.html` with a difference-array prefix sum write-up and Python snippet.
- Added a matching car-pooling question in `programming/data/json/python/leetcode-medium-questions.json` and ensured the JSON stays valid.

## What I learned / want to remember
- The "capacity burning" trick is just prefix sums framed as remaining capacity; subtracting each net delta is equivalent to tracking cumulative passengers.
- When editing the big quiz bank, run `python3 -m json.tool ...` after changes; it quickly surfaces subtle structural issues like stray `},` lines.

## Tricky bits
- `apply_patch` on minified JSON is touchy; anchoring patches with nearby keys (e.g., the `name` field) keeps insertions from jumping to the top of the file.
- The file already had an extra `},` that broke parsing once I validated the JSON, so I trimmed it while keeping the surrounding content intact.
