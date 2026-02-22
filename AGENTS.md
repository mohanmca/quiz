# Technical Article cum Quiz Platform - Agent Handbook

## Mission Snapshot
- This repo powers a static browser-based quiz + article experience served from `programming/`.
- Quizzes are JSON definitions registered in `programming/data/json/surveys.json`; articles are HTML under `programming/articles/` and listed in `programming/data/json/articles.json`.
- The SPA in `programming/app.js` runs entirely in-browser (tabs: Quizzes, Articles, Learning Journal) and fetches JSON at runtime.

## Local Runtime
- Serve from `programming/` to avoid CORS: `cd programming && python3 -m http.server 8000` (or `npx http-server`).
- Open `http://localhost:8000` and monitor the browser console for warnings thrown by `app.js`.
- There is no bundler/dev server; edit files directly and refresh.
-- codex --allow-system


## 3. Article, Documentation & Quiz Generation (keyword DQ)

When generating articles or quizzes, follow these specifications:

### Article Requirements
| Requirement | Details |
|-------------|---------|
| **Formats** | HTML|
| **Content Coverage** | Code explanation, gRPC, SQL, tables, major APIs |
| **PR Integration** | Use `gh` CLI to scan PRs and include timeline |
| **Readability** | Human-readable with technical depth |
| **Theme** | Light, don't use dark background |

1. white-space: pre; // ensure diagram and code-blocks rendered properly html

### Quiz Requirements
1. Provide **4 answer options** per question
2. 50 - Quiz should be interactive and validate answers **after each questions are submitted**
3. Include feedback on incorrect answers
4. All the quiz informtaion should be saved in json along html file
5. Quiz could be like slide show, should not increase page hight due to number of quizzes
6. It can use local state in browser should display progress
7. Upon right answer slide should move automatically
8. Answers should be shuffled, so user won't use same option
9. Ask few questins about the classNames and traits
10. All the failed questions can be attempted at the end of the quiz (with user/option)

## Directory Tour
- `/programming/index.html` bootstraps the SPA and wires in `app.js`, CSS, and JSON data sources.
- `/programming/app.js` handles fetch, quiz rendering, markdown conversion, and tab switching (Quizzes/Articles/Journal).
- `/programming/data/json/` holds `surveys.json`, `articles.json`, `logs.json`, and category folders with question banks.
- `/programming/articles/` contains static HTML articles that must stay in lockstep with quizzes.
- `/doc/` captures per-session notes; add a new document here whenever you modify repository content.
- `/src/` hosts supporting Python snippets (e.g., `src/rabinkarp.py`) that supplement articles/quizzes.
- Root utilities: `escape_json.py` (escape quiz JSON), `generate_articles_json.py` (rebuild article registry), `README.md` (deployment/authoring), `DESIGN.md` (architecture background).

## Data & Content Model
- `programming/data/json/surveys.json`: each survey entry includes `id`, `title`, `description`, `category`, `difficulty`, optional metadata, and `questionsFile` (path relative to `programming/`).
- Question banks accept `title`|`question`, `choices`|`options`, and `correctAnswer` (number index, string value, or array of either). Keep strings markdown-friendly; runtime escaping prevents injection.
- `programming/data/json/articles.json` drives the Articles tab: `{ "path": "articles/...", "title": "...", "tags": [...] }`. Run `python3 generate_articles_json.py` after adding or renaming HTML articles.
- `programming/data/json/logs.json` feeds the Learning Journal tab. Follow the existing schema (`id`, `date`, `title`, `category`, `mood`, `tags`, `content` markdown).

## Frontend Behaviour Notes
- `app.js` converts markdown to escaped HTML with fenced-code support via `mdToHtml`; avoid embedding raw HTML in JSON.
- Tab metadata is defined in `app.js` (`TABS`). Adding new panels requires wiring both the metadata and renderer.
- Quiz state lives in `state.answers`; ensure choice ordering matches any `correctAnswer` indices or values.

## Content Authoring Checklist
1. Every quiz must have a companion article under `programming/articles/` that covers each question and includes at least one Python code block.
2. Ensure articles surface in the UI:
   - Save HTML as `programming/articles/<topic>.html`.
   - Update `articles.json` (or rerun `generate_articles_json.py`).
   - Confirm "Read Article" links resolve correctly (see `rabin-karp.html` as the model).
3. When creating quizzes:
   - Place JSON under `programming/data/json/<category>/<topic>-questions.json`.
   - Add a `surveys.json` entry with a unique `id`, matching `questionsFile`, and metadata (category, difficulty, tags, timing if needed).
   - Run `escape_json.py` if the content includes code fences or HTML-sensitive characters.
   - Align quiz coverage with the companion article narrative.
4. Structure articles so sections map to quiz progression, highlight remediation tips, and weave in combinatorial or navigation insights when relevant.

## Scripts & Utilities
- `python3 escape_json.py programming/data/json/<category>/<file>.json` - escape JSON strings before committing quizzes containing code or markup.
- `python3 generate_articles_json.py` - rescan `programming/articles/` and rewrite `articles.json` with titles and tags.
- Use `rg`/`rg --files` for searches per repo convention (faster and sandbox-friendly than `grep`).

## Agent Workflow Expectations
- Run shell commands via `['bash','-lc', ...]` and always set the `workdir` parameter; avoid chaining `cd` in command strings.
- Respect sandboxing (workspace-write) and restricted network; request escalated permissions with justification only when necessary.
- Use the planning tool for multi-step tasks (skip only for trivial work) and update it as steps complete; never create single-step plans.
- Prefer ASCII when editing; only introduce non-ASCII when the target file already relies on it.
- Keep code comments minimal and purposeful; avoid narrating obvious intent.
- Do not revert or overwrite user-made changes outside your scope; stop and ask if unexpected edits appear.
- Review diffs and run available validations/tests before finishing whenever possible.

## Testing & QA
- Serve the site locally and smoke-test quizzes, articles, and the journal. Watch the browser console for fetch/markdown warnings.
- Verify quiz navigation, scoring, and progress indicators; ensure article links and code blocks render properly.
- Validate JSON with `python -m json.tool < file` or similar before loading in the app.

## Deployment Reference
- `README.md` captures the Nginx location block and static deployment steps (copying to `/var/www/indiatruck/public/`). Follow it when preparing releases.

## Session Documentation
- Every session that changes repository content must add a note under `doc/` (e.g., `session-YYYY-MM-DD-topic.md`) summarizing edits, lessons, and tricky areas.

## Helpful References
- `README.md` for operational workflows.
- `DESIGN.md` and `programming/doc/` for architectural and historical context.
- Existing `doc/session-*.md` files for examples of the expected depth in session documentation.



## Serve locally always without asking..
cd programming && python3 -m http.server 8000

Stay consistent with these practices so future agents can build quizzes, articles, and journal entries quickly while keeping the platform coherent.
