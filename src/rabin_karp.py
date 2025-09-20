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

import random
rand = [0]* 32
vals = [random.randint(0,32) for x in rand]
print(vals)
fs = FenwickSum.build(vals)

print(sum(vals))
print(fs.prefix(7))
print(fs.prefix(9))
