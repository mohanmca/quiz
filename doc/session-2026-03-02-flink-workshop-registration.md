# Session Notes: Flink Workshop Registration

## What changed
- Regenerated `programming/data/json/articles.json` so `programming/articles/flink_workshop.html` is listed in the Articles tab.
- Added an `examLink` root metadata field to `programming/data/json/flink_quiz.json` pointing at `articles/flink_workshop.html`.
- Updated `generate_articles_json.py` to HTML-unescape `<title>` text before generating article titles and tags.

## Notes
- The workshop article already contains its own in-page `Exam` mode, so the quiz JSON now exposes the canonical page where that exam experience lives.
- `articles.json` is generated from article HTML titles via `python3 generate_articles_json.py`.
- Without unescaping the title, the generated Flink article entry would have shown `&amp;` in the UI and produced an incorrect `amp` tag.

## Verification
- Validated `programming/data/json/flink_quiz.json` with `python3 -m json.tool`.
- Confirmed the regenerated article registry contains `articles/flink_workshop.html`.
