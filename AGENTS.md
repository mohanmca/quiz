# Technical Article cum Quiz Platform — Agent Guide

1. This repository hosts a static, browser-based quiz platform. Quizzes are described in JSON, loaded over HTTP, and rendered with HTML/CSS/JavaScript. Many questions include Python snippets rendered as markdown with code fences.
1. Every topic also accompanies its own article under programming/articles/
1. Use this file as your quick-start map: structure, how it runs, how data is shaped, and where to make changes.
2. Every Quiz should have a article under programming/articles
3. Ensure articles covers all the question in respective quiz
4. Article should have python code
5. Articles should be accesible using "Read Article" similar to "Rabin–Karp Rolling Hash Fundamentals" under articles folder similar to /Users/mohannarayanaswamy/git/quiz/programming/articles/rabin-karp.html



## How It Works
- Data source: `programming/data/json/surveys.json` lists quizzes (title, description, category, file path, etc.). Each entry points to a questions JSON file under `programming/data/json/...`.
- Runtime: The UI is a dependency-free app served from `programming/index.html` and implemented in `programming/app.js`.
  - Home lists quizzes with search and category filter.
  - Start Quiz fetches the referenced questions JSON, normalizes each item, and renders one-by-one with navigation.
  - Markdown: basic support for inline code and fenced code blocks (```lang ... ```), with strong HTML escaping to prevent injection.
  - Correctness: `correctAnswer` may be an index, a value, or an array of indices/values. Review shows your selection and the correct choices.
.- Note: A historical SurveyJS-based UI previously lived under `programming/js/` and has been removed to simplify the codebase.

## Run Locally (required — avoids CORS)
- `cd programming && python3 -m http.server 8000` then open `http://localhost:8000`.
- Or `cd programming && npx http-server`.

## Project Structure (from git ls-files)
- Root
  - `AGENTS.md` — this file.
  - `README.md` — Nginx, deployment steps, and authoring notes.
  - `escape_json.py` — HTML-escapes strings in question JSON.
  - `package-lock.json` — present if using a simple static server locally.
- `programming/`
  - `index.html` — entry page (uses `app.js`).
  - `app.js` — minimal, dependency-free quiz app (fetch + DOM only).
  - `css/quiz-platform.css` — legacy stylesheet (not required by `index.html`).
  - `simple/index.html` — self-contained simple demo page.
  - `js/` — currently empty (legacy code/docs removed).
  - `data/json/` — quiz registry + question banks
    - `surveys.json` — quiz registry used by `app.js`.
    - Categories and example files (full list tracked in git):
      - `aws/`: `aws-policy-permissions-questions.json`, `k8s-secrets-questions.json`
      - `golang/`: `questions.json`
      - `infrastructure/`: `terraform-terragrunt-questions.json`
      - `jvm/`: `questions.json`
      - `messaging/`: `kafka-part1-questions.json`, `kafka-broker-part2-questions.json`, `kafka-consumer-part3-questions.json`
      - `postgres/`: `postgres-data-model-index-performance-questions.json`, `postgres-query-planning-internals-questions.json`, `postgres-vacuum-autovacuum-deep-dive-questions.json`
      - `python/`: `advanced-data-structures-questions.json`, `airflow-questions.json`, `bit-manipulation-questions.json`, `data-structures-questions.json`, `dunder-methods-questions.json`, `fenwick-tree-questions.json`, `leetcode-medium-questions.json`, `type-internals-questions.json`, `rabin-karp-rolling-hash-questions.json`
      - `scala-slick/`: `questions.json`
      - `trading/`: `crypto-derivatives-questions.json`, `oms-fix-questions.json`
  - `doc/` — authoring aids: `CATEGORY_STRUCTURE.md`, `PROMPT.md`, `currentprompt.md`.

Notes:
- `programming/index.html` displays “Data source: programming/data/json” to clarify the expected location of the data.
- Some historical docs/files may exist in the git history; the current runtime path is the minimal app in `app.js`.

## Data Model
- surveys.json entry fields:
  - Required: `id`, `title`, `description`, `questionsFile` (path relative to `programming/`), plus typically `category`, `difficulty`.
  - Optional: `icon`, `color`, `estimatedTime`, `timePerQuestion`, `maxTimeToFinish`.
- question item (normalized by `app.js`):
  - `title` or `question`: text (markdown-lite supported).
  - `choices` or `options`: array of strings (markdown-lite supported).
  - `correctAnswer`: index (number), value (string), or array of indices/values.

## Coding Style
- JavaScript: 4-space indent, semicolons, single quotes; classes `PascalCase`, functions/vars `camelCase`, constants `UPPER_SNAKE`.
- Filenames: hyphenated lowercase for JSON and JS (e.g., `fenwick-tree-questions.json`).

## Adding or Updating Quizzes
- Place a new questions file under `programming/data/json/<category>/<topic>-questions.json`.
- Register it in `programming/data/json/surveys.json` with a unique `id` and `questionsFile` path.
- If you rely on the legacy SurveyJS UI, ensure mappings exist in `programming/js/quiz-data-manager.js` and category structure in `programming/js/quiz-platform.js`.
- Run locally and verify the quiz renders, loads, and scores without console errors.

## Validation & Utilities
- Run a local server to avoid CORS errors (see Run Locally).
- Escape JSON content that includes markup/code: `python3 escape_json.py programming/data/json/<category>/<file>.json`.
- Console shows warnings when survey or question fields are missing/invalid.

## Deployment
- Static site; see `README.md` for the Nginx location block and copy commands.

# Agents

## Include
- src/
- app/

## Ignore
- doc/
- .vscode/
- .git/
- programming/doc/

# AGENTS.md

## Permissions
- tool: shell
  commands:
    - curl
    - ls
    - cat
    - echo
  ask_permission: false

## Capabilities
- name: shell
  description: Allows running local shell commands
  allowed: true
  ask: false
  commands:
    - curl
    - "*"

## TODO for everysession by Codex
1. Can you create document under doc after every session which involves code change, document what you learnt and what was tricky so human can learn from this session and improve his knowledge