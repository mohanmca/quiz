# Session Notes — NVC Cheat‑Card, Anki + UI Button

Date: 2025-09-11

## What changed
- Article `programming/articles/habits-behavior-communication.html`:
  - Added an “NVC Cheat‑Card” table (Component, Ask Yourself, Example).
- Anki deck `programming/data/anki/habits-behavior-communication.csv`:
  - Appended cards for WOOP/mental contrasting, empathic openings, precommitment, temptation bundling, fresh start effect.
- Survey registry `programming/data/json/surveys.json`:
  - Added `ankiFile` to the `habits-behavior-communication` entry.
- App UI `programming/app.js`:
  - On the result page, added a “Download Anki CSV” button when `ankiFile` is present in the current survey.

## Notes
- Kept scope surgical: only this quiz/article and minimal UI enhancement.
- The Anki link also remains in the article toolbar.

## Next
- Optionally surface the Anki button on the quiz card itself.

