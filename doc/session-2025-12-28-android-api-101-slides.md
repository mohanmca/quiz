# Session 2025-12-28 - Android API 101 Slides

## What I changed
- generated a new slide-based article at `programming/articles/android-api-101-slides.html` by converting each Android API card into its own slide and adding section intro slides with the original Kotlin snippets
- added a dedicated slide controller script at `programming/articles/assets/android-api-101-slides/slides.js` with space-bar navigation plus localStorage and cookie progress persistence
- registered the new slide deck in `programming/data/json/articles.json` so it appears as a separate article entry

## What I learned
- the existing Android API article structure maps cleanly into slide content when each card becomes a single focused slide
- carrying over the original Kotlin code snippets into section intro slides helps keep the slide deck grounded in practical usage
- reusing the monotonic-stack slide navigation model keeps the UX consistent while allowing new keys and progress storage per article

## What was tricky
- keeping the slide deck readable with 150+ slides while still preserving each API blurb verbatim
- ensuring progress tracking keys and cookie names stay unique to avoid collision with other slide articles
