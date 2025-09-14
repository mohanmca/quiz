# Session Notes — Rolling Hash Trapdoors (2025-09-14)

## Summary
- Added five focused quizzes to stress-test polynomial and rolling hash understanding, each with a dedicated article:
  1. Polynomial formulations
  2. Modulus and normalization
  3. Sliding window update
  4. Edge cases and negatives
  5. Double hashing and rationale for testing order
- Registered all five in `programming/data/json/surveys.json` with `articleFile` links.

## Why this order
- Poly hash first establishes a ground-truth reference; rolling updates are verified against it.
- Modulus rules must be clear before subtracting outgoing contributions.
- Sliding update then becomes a small, checkable step.
- Edge cases (Unicode/negatives) ensure robustness beyond happy paths.
- Double hashing last compounds concepts and focuses on parameter independence.

## Tricky bits
- Ensuring each article contains Python code and explicitly covers all questions.
- Keeping filenames hyphenated lowercase to match repository conventions.

## Files added
- Questions: `programming/data/json/python/rolling-hash-trapdoors-part{1..5}-questions.json`
- Articles: `programming/articles/rolling-hash-trapdoors-part{1..5}.html`
- Surveys registry updated: `programming/data/json/surveys.json`
