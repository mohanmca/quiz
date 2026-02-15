# Session Notes — 2025-09-08 (Python List API quiz)

What changed
- Added new quiz entry in `programming/data/json/surveys.json` with id `python-list-api`.
- Created `programming/data/json/python/python-list-api-questions.json` (45 questions) focused solely on list operations and pitfalls.
- Added article `programming/articles/python-list-api.html` summarizing all covered APIs with Python examples.

Coverage highlights
- Mutating methods (append/extend/insert/pop/remove/clear/reverse/sort) and their return value semantics (None).
- Copying vs aliasing: slicing, list(), copy(), shallow vs deepcopy, 2D list multiplication pitfall.
- Slicing rules, out-of-range clamping, slice deletion, step restrictions.
- Sorting: in-place vs new, stability, key functions, multi-key sort.
- Comprehensions and common patterns (flatten, Counter, ordered-unique via dict.fromkeys).
- Iterators: reversed(), enumerate(start=1), join with map(str).

Tricky bits
- Ensuring no JSON escapes break: kept questions textual and concise; validated JSON loads.
- Covered breadth without relying on non-list libraries except minor mentions (itertools.repeat/copy module) for correctness.

Follow-ups
- If you want 60–80 questions, I can append more edge-case items (index behavior, negative steps on slice assignment, subtle id changes with concat vs extend).
