class FenwickSum:
    """Fenwick Tree for sums (1-based internal indexing).

    Supports:
      - add(i, delta): point update at 0-based i
      - prefix(i): sum of [0..i] inclusive (0-based)
      - range_sum(l, r): sum of [l..r] inclusive
    """
    def __init__(self, n: int):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i: int, delta: int) -> None:
        i += 1  # shift to 1-based
        while i <= self.n:
            self.t[i] += delta
            i += i & -i

    def prefix(self, i: int) -> int:
        print(self.t)
        i += 1
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s

    def range_sum(self, l: int, r: int) -> int:
        if r < l:
            return 0
        return self.prefix(r) - (self.prefix(l - 1) if l > 0 else 0)

    @classmethod
    def build(cls, arr):
        bit = cls(len(arr))
        for i, v in enumerate(arr):
            bit.add(i, v)
        return bit

###
# mohannarayanaswamy@Mohans-MacBook-Air src % python3 Fenwick.py
# [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
# 528
# [0, 1, 3, 3, 10, 5, 11, 7, 36, 9, 19, 11, 42, 13, 27, 15, 136, 17, 35, 19, 74, 21, 43, 23, 164, 25, 51, 27, 106, 29, 59, 31, 528]
# 36
# [0, 1, 3, 3, 10, 5, 11, 7, 36, 9, 19, 11, 42, 13, 27, 15, 136, 17, 35, 19, 74, 21, 43, 23, 164, 25, 51, 27, 106, 29, 59, 31, 528]
# 55
###
import random
vals = list(range(1,33))
print(vals)
fs = FenwickSum.build(vals)

print(sum(vals))
print(fs.prefix(7))
print(fs.prefix(9))
