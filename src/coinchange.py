def coinchange(amount: int, coins: list[int]) -> int:
    N = len(coins)
    def backtrack(index, amount, coins) -> int:
        if amount == 0: return 0
        if (index >= N or amount < 0): return float("inf")
        mincount = float("inf")
        
        x =  amount // coins[index]
        for i in range(0, x+1):
            remaining = i * coins[index]
            count = backtrack(index+1,  amount - remaining, coins)
            mincount = min(count+i, mincount)
        return mincount
    value = backtrack(0, amount, coins)
    return -1 if  value == float("inf") else value

coins = [1,2]
print(coinchange(5,coins))
print(coinchange(0,coins))