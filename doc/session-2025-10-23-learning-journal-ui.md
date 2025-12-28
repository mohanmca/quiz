# Session 2025-10-23 — Learning Journal UI

## What I changed
- wired a new Learning Journal panel into `programming/app.js` so logs from `data/json/logs.json` render alongside quizzes and articles
- added styling hooks in `programming/index.html` to make the journal browseable with collapsible entries and tag pills
- refactored the home view into three color-coded tabs so quizzes, articles, and the journal live in distinct panels
- captured the 2025-10-23 Python hashing reflection in the new JSON source with markdown + code so it appears through the UI

## What I learned
- keeping journal content in JSON is easiest when the front-end already has markdown rendering helpers (`mdToHtml`), so I reused that instead of inventing a bespoke renderer
- tag filters get more useful when every section respects them; sharing the search state across quizzes, articles, and logs keeps the interface consistent
- CSS custom properties made it painless to theme each tab without duplicating rules—the buttons and panels simply read `--tab-color`/`--tab-bg`
- adding syntax-highlighted code to collapsible panels just needs a well-timed `applySyntaxHighlighting` call after the DOM opens

## What was tricky
- `computeItemTags` stuffed quiz-centric defaults (quiz, practice, etc.) into journal entries, so I wrote a lighter tag derivation path for logs
- escaping triple-quote docstrings inside JSON is fussy; generating the JSON via a tiny Python helper kept the markdown intact without hand-escaping every character
- balancing tinted tab backgrounds with table readability meant forcing white table cells so text stayed legible
