def rabinkarp(word, pattern) -> list[int]:
    N = len(pattern)
    M = 1_000_000_007
    base = 256

    P = [ord(c) for c in pattern]
    W = [ord(c) for c in word]

    def poly_hash(nums) -> int:
        H = 0
        for i,n in enumerate(nums):
            H = ((H * base)  + n)%M
        return H
    
    result = []
    Hp = poly_hash(P)
    Hw = poly_hash(W[:N])

    pow_m_1 = pow(base, N-1, M)

    if Hp==Hw and pattern == word[:N]:
        result.append(0)
    
    for i in range(N, len(word)):
        Hw = (Hw - (W[i-N]*pow_m_1) % M)%M
        Hw = (Hw*base + W[i])%M
        start = i - N + 1
        if Hp==Hw and pattern == word[start:start+N]:
            result.append(i)
    return result


print(rabinkarp("abradacabra","abra"))
