## Summary

- Registered `programming/articles/flink_workshop_2_2.html` by regenerating `programming/data/json/articles.json`.
- Fixed the article so it renders correctly from the direct article URL as a standalone workshop page.

## Changes

- Normalized invalid non-breaking spaces in `programming/articles/flink_workshop_2_2.html` that had been inserted between HTML tag names and attributes.
- Removed broken inline JavaScript separator comments from the embedded `SLIDES` script so the browser can parse and execute the workshop renderer.
- Rebuilt `programming/data/json/articles.json` so the article appears in the Articles tab with the title `Apache Flink 2.2 Comprehensive Workshop`.

## Validation

- Loaded `http://127.0.0.1:8001/programming/articles/flink_workshop_2_2.html` from a local static server rooted at the repository.
- Verified the page renders the first slide, progress indicator, navigation controls, and table of contents.
- Extracted the embedded script and confirmed it passes `node --check`.

## Notes

- The blank page was caused by two separate generation defects:
  1. UTF-8 non-breaking spaces were used where HTML requires normal ASCII spaces in tag syntax.
  2. JavaScript `//` separator comments were emitted inline with code, which commented out slide objects and initialization logic.
