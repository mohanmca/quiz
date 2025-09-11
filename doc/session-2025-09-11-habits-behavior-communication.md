# Session Notes — Habits, Behavior, and Communication

Date: 2025-09-11

## What changed
- Added new article: `programming/articles/habits-behavior-communication.html` (quotes, diagrams/tables, Python tools, scenarios, Anki link).
- Added 50+ question quiz: `programming/data/json/self-improvement/habits-behavior-words-questions.json`.
- Registered quiz in `programming/data/json/surveys.json` with `id: habits-behavior-communication` and `articleFile` mapping for “Read Article”.
- Added Anki deck CSV: `programming/data/anki/habits-behavior-communication.csv` and linked it from the article.

## What was tricky
- Ensuring the article content comprehensively covers all quiz topics (habits loop, B=MAP, identity habits, environment design, communication phrasing, quotes on habits/behavior/character) without overlong text.
- Keeping JSON strings simple (no code fences) so runtime escaping is safe and consistent with the app’s markdown-lite renderer.
- Matching the platform’s “Read Article” behavior (uses `articleFile` in `surveys.json`) and providing a deep link to start the quiz by `?id=`.

## What I learned / reinforced
- The app’s minimal markdown and Python syntax highlighting patterns (from `programming/app.js`) and how articles replicate a compatible highlighter.
- Adding resources like Anki CSVs is straightforward as static assets; links can point to `programming/data/anki/...`.
- Self-improvement quizzes benefit from scenario phrasing and word-choice tables that are easily remembered and tested.

## Next ideas
- Add a small “Anki” icon/button on quiz result page when `articleFile` and a `ankiFile` key exist in surveys.json.
- Consider a tiny “export selected Qs as CSV” utility to auto-generate Anki decks from quiz JSON.

