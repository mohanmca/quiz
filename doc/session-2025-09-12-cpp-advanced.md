# Session Notes — Modern C++ Article + Quiz + Anki

Date: 2025-09-12

## What changed
- Added article: `programming/articles/cpp-value-lifetimes-ownership-templates-concurrency.html` (deep guide + cheat sheet, diagrams, sections for 9 major topics).
- Added quiz JSON (initial batch): `programming/data/json/cpp/cpp-advanced-value-lifetimes-questions.json` (foundation questions; will extend to full 200 on request/next pass).
- Added Anki CSV: `programming/data/anki/cpp-advanced.csv` ~120+ cards covering key rules and distinctions (value categories, lifetimes, RAII, templates/SFINAE/Concepts, object model, concurrency, tooling).
- Registered quiz in `programming/data/json/surveys.json` with `articleFile` and `ankiFile` so UI shows both “Read Article” and Anki download (on results page and article header).

## Tricky points
- Keeping wording compact yet precise for advanced semantics (value categories, lifetime extension, noexcept implications) while staying suitable for MCQ and spaced-repetition cards.
- Avoiding JSON pitfalls (quotes/commas) given large item counts and ensuring render compatibility with the markdown-lite engine (no code fences inside JSON strings).

## Next steps
- Scale the quiz JSON to the full 200 questions (currently seeded) and synchronize Anki CSV to 200 items.
- Add small ASCII diagrams for memory model and coroutine lifetimes if desired.

