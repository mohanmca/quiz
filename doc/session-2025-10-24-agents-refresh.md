# Session 2025-10-24 - AGENTS.md Refresh

## What I changed
- archived the previous agent instructions to `AGENTS.md.2025-10-24` before replacing the live guide
- added postfix traversal and hash-set O(n) journal entries to `programming/data/json/logs.json`, covering product-of-array-except-self and longest consecutive sequence tips
- captured a reverse iteration journal entry showing index recovery patterns and added zip- and slice-based variants for index/value pairing
- rewrote `AGENTS.md` with an up-to-date repo overview, workflow expectations, and content authoring checklists for future agents
- reiterated the ongoing requirement to log future changes under `doc/` so the habit stays visible in the handbook

## What I learned
- `generate_articles_json.py` rebuilds the article registry automatically, so the handbook should point agents to it instead of hand-curating JSON
- the SPA in `programming/app.js` now serves quizzes, articles, and a learning journal from one tabbed view, which changes how agents should think about data sources
- the worktree already contains unrelated dirty files (e.g., `programming/app.js`), so instructing agents not to revert existing edits is critical

## What was tricky
- balancing system/developer constraints with project-specific advice in one document without turning it into a duplicate README
- keeping the guide ASCII-only while referring to topics that historically use special characters (handled by wording around Rabin-Karp rather than copying symbols)
- tracking pre-existing diffs so the new instructions call out the need to avoid touching user-owned changes
