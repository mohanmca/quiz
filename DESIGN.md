Technical Quiz Platform — Design & Usage

Overview
- Static web app: HTML + CSS + JavaScript; no build step.
- Loads quizzes declared in JSON, renders them in the browser, and computes a score with a detailed review.
- Code and answers support simple markdown, including inline code and fenced code blocks.

How It Works
- Home screen lists all quizzes from `programming/data/json/surveys.json`.
- Search filters by title/description; the category select filters by the `category` field.
- Start Quiz fetches the quiz’s `questionsFile`, normalizes question fields, and renders one question per page with navigation.
- Progress shows answered count and percentage. Submit computes your score; Stop shows a partial score.
- Review section highlights correct answers and your selection for each question.

Data Model
- surveys.json (registry used by the UI)
  - id: unique string used to deep-link and identify the quiz.
  - title, description: shown in cards and at the top of the quiz.
  - category, difficulty, estimatedTime, icon, color: used for filtering and display.
  - questionsFile: path (relative to `programming/`) to the questions JSON file.
- questions JSON (array)
  - title or question: the prompt text. Supports inline code and fenced code blocks.
  - choices or options: array of strings for answers. Markdown-lite supported per item.
  - correctAnswer: can be:
    - a number (index of the correct choice),
    - a string (must match the correct choice’s string), or
    - an array of numbers/strings for multi-correct cases. The UI accepts one selection but will still mark all correct options in the review.

Markdown & Code Support
- Inline code: wrap with backticks, for example `len(arr)`.
- Fenced blocks:
  ```python
  def two_sum(nums, target):
      seen = {}
      for i, x in enumerate(nums):
          if target - x in seen:
              return seen[target - x], i
          seen[x] = i
  ```
- All content is HTML-escaped first. Allowed formatting is limited to inline code and fenced code blocks; other HTML is not rendered.

Running Locally
- Serve from a web server to avoid CORS errors:
  - `cd programming && python3 -m http.server 8000` → open http://localhost:8000
  - or `cd programming && npx http-server`
- Deep-link to a quiz: append `?id=<surveyId>` or `#id=<surveyId>` to the URL.
  - Example: `http://localhost:8000/?id=python-internals`

User Flow
- Choose a quiz on the home screen (use search/category to narrow).
- For each question, select one answer.
- Use Back/Next to navigate; progress updates based on how many questions you’ve answered.
- Submit to see your score and a complete review.
- Retry Quiz resets your selections; Back to Quizzes returns home.

Authoring Tips (for adding quizzes)
- Keep `surveys.json` entries unique by `id`.
- Prefer concise, clear prompts. For code, use fenced blocks.
- Ensure `choices` are unambiguous; when using `correctAnswer` by value, match the exact string (including whitespace).
- Validate escaping with `escape_json.py` if your JSON contains code or special characters.

Files & Architecture
- Entry point: `programming/index.html` (loads `programming/app.js`).
- App: `app.js` implements minimal fetch + DOM rendering, markdown-lite, scoring, and review.
- Data: `programming/data/json/surveys.json` plus per-topic JSON files under `programming/data/json/<category>/...`.
- Styles: inline styles in `index.html` for the minimal UI; `programming/css/quiz-platform.css` applies to the legacy SurveyJS UI.
- Legacy UI (optional): `programming/js/*` contains a SurveyJS-based implementation with more structure (categories/subcategories, managers). The current index.html does not load it by default.

Troubleshooting
- CORS/Network errors: you must run via a local server (not file://). See Running Locally.
- “No valid questions”: verify your questions JSON is an array and each item provides prompt, choices/options, and correctAnswer.
- Rendering issues: check the browser console for JSON parse or fetch errors.

Security & Privacy
- All user interaction and scoring happens client-side. No data is sent to a backend.
- HTML is escaped before rendering; only simple code formatting is supported.

