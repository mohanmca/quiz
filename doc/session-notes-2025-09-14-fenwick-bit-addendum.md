# Session Notes — Addendum (2025-09-14)

Update summary:
- Article: Added a focused subsection explaining `i & (i-1)` vs `i & -i`, why they differ, and how both power Fenwick operations. Included equivalent query loop using `i = i & (i-1)`.
- Quiz: Added questions q33 (what `i & (i-1)` does) and q34 (equivalence of `i -= i & -i` and `i = i & (i-1)`).

Key insight:
- Parent move in query can be expressed either by subtracting the isolated LSB (`i -= i & -i`) or by clearing the LSB directly (`i = i & (i-1)`). Update step specifically requires adding the LSB, so `i += i & -i` is not interchangeable with clearing the LSB.

