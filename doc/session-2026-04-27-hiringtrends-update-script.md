# Session 2026-04-27: Hiringtrends Update Script

## Summary
- Added `update_hntrends.sh` at the repository root.
- The script locates the newest `hiringtrends-site-*.zip` in `/Users/mohannarayanaswamy/git/gohiringtrends/dist` unless a zip path is supplied as an argument.
- It validates archive entries, verifies zip integrity, clears `programming/hiringtrends`, and copies the extracted site contents into place.

## Notes
- The inspected archive is a flat static site bundle with root assets and year folders, matching the existing `programming/hiringtrends` layout.
- The update intentionally replaces the prior checked-in hiringtrends content, including the older copied zip file that existed in the target directory.
