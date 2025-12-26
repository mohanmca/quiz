# Session Notes — Monotonic Stack Presentation and Quiz (2025-12-25)

Changes made:
- Added presentation-style article `programming/articles/monotonic-stack.html` with space-bar navigation, slide-based layout, and local storage + cookie progress tracking.
- Updated the article progress indicator to show both slide count and percentage.
- Added a JS init guard and a default active slide so the deck renders even if scripts load late.
- Fixed HTML-escaped comparison operators inside the slide script that broke keyboard navigation.
- Moved the slide JavaScript into `programming/articles/assets/monotonic-stack.js` and referenced it via a script tag.
- Added quiz `programming/data/json/python/monotonic-stack-questions.json` with 110 questions covering definitions, stack variants, range contributions, and coding problems.
- Registered the new quiz in `programming/data/json/surveys.json` and regenerated `programming/data/json/articles.json`.

What I learned / reinforced:
- Duplicate handling in monotonic stacks requires strictness on one side and non-strict on the other to avoid double counting.
- Range contribution problems (sum of subarray minimums) boil down to PSE/NSE distances and left * right counts.
- Slide-style articles still work as standalone pages in the current SPA, as long as the article path is registered.

Tricky aspects addressed:
- Preserving all markdown content while splitting into compact slides and keeping code blocks readable.
- Keeping quiz strings JSON-safe by generating the file via Python and validating with `python3 -m json.tool`.
- Tracking progress in both local storage and cookies without interfering with keyboard navigation.
