# Session 2025-11-03 - Sliding Window Deque Journal Entry

## What I changed
- appended a LeetCode 239 learning journal entry to `programming/data/json/logs.json` using a python helper so the array stays sorted and formatted
- double-checked the existing journal schema before writing to avoid mismatched keys or markdown quirks

## What I learned
- sliding windows punish stack-only structures because the left edge needs O(1) pruning; a deque keeps both ends available without copying
- pairing value and index inside the deque is what lets the algorithm evict stale maxima without rescanning the window
- rewriting the solution reminded me that each element is touched twice at most, so the deque logic preserves the O(n) bound even with aggressive popping

## What was tricky
- wording the reflection so it emphasized the failure mode of a stack while keeping the advice anchored to the LeetCode 239 example
- keeping the markdown string in JSON readable without introducing unescaped characters or stray indentation
