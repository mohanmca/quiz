# Session Notes — Consolidate Trapdoors into Rabin–Karp (2025-09-14)

## Summary
- Merged the five “Rolling Hash Trapdoors” quizzes into the main Rabin–Karp quiz file.
- Appended a comprehensive appendix to the Rabin–Karp article, preserving all Trapdoors content and code samples.
- Removed the five Trapdoors entries from the quiz registry so users access everything from one place.

## What changed
- Extended `programming/data/json/python/rabin-karp-rolling-hash-questions.json` with all Trapdoors questions (deduped by title).
- Updated `programming/articles/rabin-karp.html` with an "Appendix: Rolling Hash Trapdoors (I–V)" section including:
  - Polynomial formulations (poly_hash)
  - Modulus/normalization patterns
  - Sliding window update and validation
  - Edge cases (Unicode/bytes) and negatives
  - Double hashing and the testing order rationale
- Filtered out the five Trapdoors entries from `programming/data/json/surveys.json`.

## Rationale
- Single, authoritative article and quiz reduce duplication and confusion while retaining all material.
- Keeps "Read Article" for Rabin–Karp as the go-to reference.

## Notes
- Original Trapdoors files remain in the repo for history but are no longer listed in `surveys.json`.
