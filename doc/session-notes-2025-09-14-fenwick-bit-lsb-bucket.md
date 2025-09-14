# Session Notes — LSB as Bucket Span (2025-09-14)

Added an explanatory subsection to clarify that `i & -i` (LSB) equals the bucket span for index `i`:
- Example: `i=12 (1100b)`, `i & -i = 4 (0100b)` ⇒ index 12 covers `[9..12]`.
- Connected this to the update step `i += i & -i` as the upward jump to the next bucket that still aggregates `i`.

This reinforces the mental model for why Fenwick updates “climb” using the isolated lowest set bit.

