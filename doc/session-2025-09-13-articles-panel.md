# Session Notes — Articles Panel (Collapsible)

Date: 2025-09-13

## Changes
- Added `programming/data/json/articles.json` registry listing all article pages (including those without quizzes).
- Updated `programming/app.js` to fetch `articles.json` and render a collapsible “Articles” panel at the top of the home page with a table: Title, Open, Path.
- Panel is collapsed by default and can be toggled with a Show/Hide button.

## Rationale
- Provides a single, browsable index of articles so users can discover content independent of quizzes.

