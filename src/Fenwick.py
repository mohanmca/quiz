class Fenwick:
    def __init__(self, n: int):
        self.n = n
        self.t = [0]*(n+1)
    
    def update(self, i, delta):
        i +=1
        while i <= self.n:
            self.t[i] += delta
            i += i & -i
        
    def prefixsum(self, i):
        i +=1
        s = 0
        print(self.t[1:i+1])
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s
    
    
    @classmethod
    def build(cls, nums):
        ft = cls(len(nums))
        for i, n in enumerate(nums):
            ft.update(i+1, n)
        return ft

nums = list(range(1,33))
ft = Fenwick.build(nums)    
print(ft.prefixsum(6))
print(ft.prefixsum(10))
print(ft.prefixsum(16))