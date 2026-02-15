# Session Notes — 2025-09-08 (Python Internals expansion)

What changed
- Expanded `programming/data/json/python/python-internals-questions.json` to 100 questions (added q26–q100 previously).
- Added `tags` (subtopics) and `difficulty` to q26–q100 by programmatically categorizing titles/choices.

Tagging scheme (examples)
- GIL/Threads, Bytecode/Frames, Dict Internals, MRO/Lookup, Descriptors, GC/Weakref, Serialization, Memory/Data Model, Async/Concurrency, Scopes/Closures, Import System, Performance, C-API, Exceptions.
- Difficulty: Easy/Medium/Hard (most Medium; deep descriptor/C-API questions marked Hard).

Validation
- JSON parsed successfully post-update; random spot-checks confirm tags/difficulty present.

Follow-ups
- If desired, extend tagging to the first 25 questions; add UI filters for tags/difficulty.
