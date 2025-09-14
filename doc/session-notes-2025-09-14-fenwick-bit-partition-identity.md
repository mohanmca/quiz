# Session Notes — Partition Identity (2025-09-14)

Quiz update:
- Added q38 reinforcing the partition identity `i = (i & (i-1)) + (i & -i)` with disjoint bits.

Why it matters:
- Encodes the idea that `i & -i` (LSB) and `i & (i-1)` split `i` into non-overlapping parts, mirroring Fenwick’s block + parent decomposition used in queries and motivating the parent step.

