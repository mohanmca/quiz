## Session: Register Flink Article in Articles Index

### Date
- 2026-02-15

### What Changed
- Regenerated `programming/data/json/articles.json` using `python3 generate_articles_json.py`.
- Verified that the generated index includes:
  - `path`: `articles/flink.html`
  - `title`: `Apache Flink: Stream Processing from First Principles`

### Validation
- Confirmed `flink` entry exists in `programming/data/json/articles.json`.
- Validated JSON syntax with:
  - `python3 -m json.tool programming/data/json/articles.json`

### Notes / Tricky Areas
- The Articles tab is driven by `programming/data/json/articles.json`, not by manually editing `programming/index.html`.
- Running the generator keeps ordering and tag metadata consistent with the rest of the project.
