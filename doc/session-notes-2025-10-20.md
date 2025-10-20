# Session Notes — 2025-10-20

## What I learned
- Refreshed the Slick architecture by rereading `doc/paradox` chapters in `/Users/mohannarayanaswamy/git/slick`, especially the sections on `DBIOAction`, streaming, and configuration.
- Documented how profiles, capabilities, and schema DSL pieces interlock so the quiz questions can draw from authoritative references.
- Practiced generating long-form instructional HTML that still matches the existing article styling conventions in `programming/articles`.

## What was tricky
- Keeping the article above 10k words without drifting off-topic required careful section planning so every quiz objective was covered once but not repeated excessively.
- Building a 100+ item quiz by hand needed a lightweight pipeline (temporary text file -> Python script) to avoid JSON syntax mistakes and to keep choices aligned with the new article sections.
- Watching for escaped characters (`&lt;`, `&gt;`, `\"`) in the raw question text was important so the final JSON remains human readable and renders as expected inside the quiz app.

### Essential Slick follow-up
- Installed `PyPDF2` and `pdfminer.six` to extract text from the local Essential Slick PDF when native macOS tooling was unavailable.
- Summarised each chapter into `programming/articles/essential-slick.html`, keeping the structure and exercises aligned with the workbook.
- Authored an 80-question quiz at `programming/data/json/scala-slick/essential-slick-3-questions.json` and registered it in `surveys.json` so the UI exposes the new study path.
