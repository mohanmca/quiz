# Session 2025-11-03 - Truthy OR Journal Entry

## What I changed
- added a learning journal record (`log-2025-11-03-python-truthy-or`) to `programming/data/json/logs.json`
- validated the JSON with `python -m json.tool` to keep the SPA fetch happy

## What I learned
- Python's `or` returns the first truthy operand, so it can stand in for `x if x else y` in linked-list merges without an explicit conditional
- short-circuiting works as flow control; combining it with truthiness means one line can both choose the node and advance the pointer logic

## What was tricky
- ensuring the reflection warned about falsy-but-valid values (like `0`) so readers know when `or` might skip a legitimate operand
- keeping backticks and code fences escaped properly inside the JSON string to avoid breaking the Learning Journal renderer
