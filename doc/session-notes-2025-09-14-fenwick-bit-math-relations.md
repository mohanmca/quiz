# Session Notes — Mathematical Relations Addendum (2025-09-14)

Added a concise math subsection to the Fenwick article:
- Defined L = i & -i and showed identities:
  - i & (i-1) = i - L
  - i = (i & (i-1)) + (i & -i) with disjoint bits
  - Link to two’s complement: -i = ~i + 1, so i & -i isolates LSB
  - Trailing zeros relation: L = 1 << tz(i)

Quiz addition:
- q37 asserts the identity i & (i-1) = i - (i & -i).

Rationale:
- These identities unify the mental model for why query uses parent steps and update uses upward steps in Fenwick.

