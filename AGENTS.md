# Repository Guidelines

## Introduction
1. Welcome to the  Technical Quiz Platform
2. Some of the question has python, it should be able to use markdown and view the code 
3. To validate someone's knowledge this application has certain questions in json format and it would give quiz using javascript
4. It uses css, javascript and html

## Project Structure & Module Organization
- `programming/index.html`: Web entry point for the quiz UI.
- `programming/js/`: Client code — `quiz-platform.js` (core), `quiz-data-manager.js` (data I/O), `quiz-ui-manager.js` (rendering), `quiz-manager.js` (quiz flow).
- `programming/css/quiz-platform.css`: Styles.
- `programming/surveys.json`: Registry of quizzes shown in the UI.
- `programming/<category>/*.json`: Question banks (e.g., `python/advanced-data-structures-questions.json`).
- `programming/doc/`: Authoring prompts and structure docs.
- `escape_json.py`: Utility to HTML-escape strings inside JSON question files.

## Build, Test, and Development Commands
- Serve locally (required — avoids CORS):
  - `cd programming && python3 -m http.server 8000` → open `http://localhost:8000`.
  - or `cd programming && npx http-server`.
- Deployment: static files only. See `README.md` for the Nginx location block and copy commands.
- Validate JSON escaping: `python3 escape_json.py programming/<category>/<file>.json`.

## Coding Style & Naming Conventions
- JavaScript: 4-space indent, semicolons, single quotes; classes `PascalCase`, functions/vars `camelCase`, constants `UPPER_SNAKE`.
- Files: hyphenated lowercase (e.g., `quiz-ui-manager.js`, `fenwick-tree-questions.json`).
- Surveys (`programming/surveys.json`) entries must include: `id`, `title`, `description`, `questionsFile` (path relative to `programming/`).
- Questions JSON: each item should provide `title` or `question`, `choices` (or `options`), and `correctAnswer`.

## Testing Guidelines
- Smoke test locally: load home, open a category/subcategory, start a quiz, finish a few questions; ensure no console errors.
- Data validation: incorrect or missing fields surface warnings in the console; fix before submitting.
- Large diffs to questions: prefer separate PRs per topic/category.

## Commit & Pull Request Guidelines
- Use concise, imperative subjects: `feat(programming/python): add fenwick-tree questions`, `fix(js): handle surveys fetch timeout`.
- PRs should include:
  - What changed and why; linked issue (if any).
  - Where the quiz is registered (surveys entry and file path).
  - Manual test steps (server used, URL, screenshots if UI changes).

## Adding or Updating Quizzes
- Add questions under `programming/<category>/<topic>-questions.json`.
- Register in `programming/surveys.json` (ensure unique `id`).
- If introducing a new category/subcategory, extend `categoryStructure` in `programming/js/quiz-platform.js`.
- Run locally via a web server and verify the quiz renders and loads questions without errors.


# Agents

## Include
- src/
- app/

## Ignore
- doc/
- .vscode/
- .git/
