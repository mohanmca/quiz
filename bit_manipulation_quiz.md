# Bit Manipulation - Complete Interview Guide

## Validation Tools for Binary Calculations
1. Windows Calculator (switch to Programmer mode)
2. Java Shell: `Integer.toBinaryString(1<<6)`
3. Command line bitwise calculator: `bitwise "1 & (1 << 2)"`
4. [Binary Calculator Online](https://www.rapidtables.com/calc/math/binary-calculator.html)
5. Python: `bin(number)`, `format(number, 'b')`

## Essential Bit Manipulation Interview Questions (Top 15)

1. **XOR Properties**: What are the key properties and use cases?
2. **Hamming Distance**: How to compute distance between two numbers?
3. **Brian Kernighan's Algorithm**: How to count set bits efficiently?
4. **Bit Isolation**: How to isolate/clear rightmost and leftmost bits?
5. **Power of 2 Check**: Multiple approaches to verify power of 2
6. **Odd/Even Check**: Bitwise vs modulo comparison
7. **Sign Detection**: How to check positive/negative without comparison
8. **Bit Manipulation in Arrays**: Single number variations
9. **Subset Generation**: Using bitmasks for combinations
10. **Range Bitwise AND**: Finding common prefixes
11. **Bit Reversal**: Reversing bits in 32-bit integers
12. **Gray Code**: Generation and properties
13. **Missing Number**: Using XOR properties
14. **Duplicate Detection**: Bit manipulation approaches
15. **Binary Addition/Subtraction**: Without arithmetic operators

## Fundamental Bitwise Operations & Properties

### Basic Operations Results
```
x & ~x  => 0          (AND with complement)
x | ~x  => all 1s     (OR with complement)  
x ^ ~x  => all 1s     (XOR with complement)
x ^ 1s  => ~x         (XOR with all 1s)
x ^ 0   => x          (XOR with zero)
x ^ x   => 0          (XOR with self)
```

### Complement and Negative Relations
```
~x = -x - 1           (One's complement relation)
~(x-1) = -x           (Useful for bit manipulation)
~-x = x - 1           (Negative complement)
x + ~x = -1           (Sum with complement)

Example: 5, -5, ~5, ~-5 => 5, -5, -6, 4
```

### Boolean Algebra for Bits
```
A ⊕ B = A·~B + ~A·B  (XOR definition)
~(A ⊕ B) = ~A ∨ ~B   (De Morgan's law)
~(A ∨ B) = ~A ∧ ~B   (De Morgan's law)
A ⊕ A = 0            (Self XOR)
A ⊕ 0 = A            (Identity)
```

## Bit Position Manipulation

### Generate Bit Masks
```java
// nth bit is 1, rest are 0
Integer.toBinaryString(1 << 6)    // "1000000" (7th bit is 1)

// nth bit is 0, rest are 1  
Integer.toBinaryString(~(1 << 6)) // "11111111111111111111111110111111"

// Last n bits are 0, rest are 1
int mask = -1 << 5;               // "11111111111111111111111111100000"

// Last n bits are 1, rest are 0
int mask = (1 << 5) - 1;          // "11111"
```

### Check, Set, Clear, Toggle Operations
```java
// Check if nth bit is set
boolean isSet = (num & (1 << n)) != 0;

// Set nth bit
num = num | (1 << n);

// Clear nth bit  
num = num & ~(1 << n);

// Toggle nth bit
num = num ^ (1 << n);

// Clear all bits from MSB to i (inclusive)
int mask = (1 << i) - 1;
num = num & mask;

// Clear all bits from i to LSB (inclusive)
int mask = -1 << (i + 1);
num = num & mask;
```

## Advanced Bit Isolation Techniques

### Isolate Rightmost Set Bit (LSB)
```java
// Method 1: Most common
int rightmost = num & -num;

// Method 2: Alternative form
int rightmost = num & ~(num - 1);

// Example: num = 12 (1100)
// rightmost = 4 (0100)
```

### Turn Off Rightmost Set Bit
```java
// Brian Kernighan's trick - used in bit counting
int result = num & (num - 1);

// Example: num = 12 (1100) -> result = 8 (1000)
```

### Isolate Rightmost Zero Bit
```java
int rightmostZero = ~num & (num + 1);
```

## Number Property Checks

### Power of 2 Detection
```java
// Method 1: Isolate rightmost bit
boolean isPowerOf2 = (n > 0) && (n & -n) == n;

// Method 2: Turn off rightmost bit  
boolean isPowerOf2 = (n > 0) && (n & (n - 1)) == 0;

// Why it works: Power of 2 has exactly one bit set
```

### Odd/Even Check
```java
boolean isEven = (num & 1) == 0;  // More efficient than num % 2
boolean isOdd = (num & 1) == 1;
```

### Increment/Decrement by 1 for Odd/Even
```java
// If odd, decrease by 1; if even, increase by 1
int result = num ^ 1;
```

## Arithmetic Operations Using Bits

### Addition Without + Operator
```java
public int add(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;  // Calculate carry
        a = a ^ b;                 // Sum without carry
        b = carry;                 // Update carry
    }
    return a;
}
```

### Subtraction Without - Operator
```java
public int subtract(int x, int y) {
    while (y != 0) {
        int borrow = (~x) & y;     // Calculate borrow
        x = x ^ y;                 // Difference without borrow
        y = borrow << 1;           // Update borrow
    }
    return x;
}
```

### Multiplication and Division
```java
// Multiply by 2^n
int result = num << n;

// Divide by 2^n (for positive numbers)
int result = num >> n;

// Multiply by 3: 3*x = 4*x - x = (x << 2) - x
int multiplyBy3(int x) {
    return (x << 2) - x;
}
```

## Common Interview Patterns

### Hamming Distance Calculation
```java
public int hammingDistance(int x, int y) {
    return Integer.bitCount(x ^ y);
}

// Manual implementation
public int hammingDistanceManual(int x, int y) {
    int xor = x ^ y;
    int count = 0;
    while (xor != 0) {
        count += xor & 1;
        xor >>= 1;
    }
    return count;
}
```

### Count Set Bits (Hamming Weight)
```java
// Brian Kernighan's algorithm - O(number of set bits)
public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;  // Turn off rightmost set bit
        count++;
    }
    return count;
}

// Built-in method
public int hammingWeight(int n) {
    return Integer.bitCount(n);
}
```

### Single Number Variations
```java
// Single Number I: All appear twice except one
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;  // XOR cancels duplicates
    }
    return result;
}

// Single Number II: All appear thrice except one
public int singleNumberII(int[] nums) {
    int seenOnce = 0, seenTwice = 0;
    for (int num : nums) {
        seenOnce = ~seenTwice & (seenOnce ^ num);
        seenTwice = ~seenOnce & (seenTwice ^ num);
    }
    return seenOnce;
}
```

## Subset Generation Using Bitmasks

### Generate All Subsets
```java
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    int n = nums.length;
    
    // 2^n possible subsets
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) {
                subset.add(nums[i]);
            }
        }
        result.add(subset);
    }
    return result;
}
```

### Iterate Through All Subsets of a Given Mask
```java
// Iterate through all subsets of bitmask
for (int subset = bitmask; subset > 0; subset = (subset - 1) & bitmask) {
    // Process current subset
}
```

## Advanced Interview Problems

### Range Bitwise AND
```java
// Find bitwise AND of range [m, n]
public int rangeBitwiseAnd(int m, int n) {
    int shift = 0;
    while (m != n) {
        m >>= 1;
        n >>= 1;
        shift++;
    }
    return m << shift;  // Common prefix
}
```

### Reverse Bits
```java
public int reverseBits(int n) {
    int result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>= 1;
    }
    return result;
}
```

### Find Complement
```java
public int findComplement(int num) {
    int bitLength = Integer.toBinaryString(num).length();
    int mask = (1 << bitLength) - 1;
    return num ^ mask;
}
```

### Missing Number
```java
public int missingNumber(int[] nums) {
    int xor = 0;
    for (int i = 0; i <= nums.length; i++) {
        xor ^= i;
    }
    for (int num : nums) {
        xor ^= num;
    }
    return xor;
}
```

## Two's Complement and Negative Numbers

### Understanding Two's Complement
```
For 8-bit representation:
Positive: 0 to 127 (0x00 to 0x7F)
Negative: -128 to -1 (0x80 to 0xFF)

To get negative representation:
1. Write positive number in binary
2. Flip all bits (one's complement)  
3. Add 1 (two's complement)

Example: -28 in 8-bit
28 = 00011100
~28 = 11100011
-28 = 11100011 + 1 = 11100100
```

### Sign Detection
```java
// Check if number is negative (MSB is 1)
boolean isNegative = (num & (1 << 31)) != 0;

// Check sign without comparison
int sign = (num >> 31) | ((-num) >>> 31);  // 1 if non-zero, 0 if zero
```

## Shift Operations

### Logical vs Arithmetic Shifts
```java
// Arithmetic right shift (preserves sign)
int arithmeticShift = num >> n;

// Logical right shift (fills with zeros)
int logicalShift = num >>> n;

// Left shift (same for both)
int leftShift = num << n;
```

## Binary Encoding Techniques

### String to Integer Encoding
```java
// Encode string length into 4 bytes
public String intToString(int x) {
    char[] bytes = new char[4];
    for (int i = 3; i >= 0; i--) {
        bytes[3 - i] = (char) ((x >> (i * 8)) & 0xFF);
    }
    return new String(bytes);
}

// Decode bytes string to integer
public int stringToInt(String bytesStr) {
    int result = 0;
    for (char c : bytesStr.toCharArray()) {
        result = (result << 8) + (int) c;
    }
    return result;
}
```

## Performance Considerations

### Time Complexity Analysis
```
Basic operations (AND, OR, XOR, NOT): O(1)
Count set bits (Brian Kernighan): O(number of set bits)
Generate all subsets: O(n * 2^n)
Bit manipulation on 32-bit integer: O(1) to O(32) = O(1)
```

### Space Complexity
```
Most bit operations: O(1) extra space
Subset generation: O(2^n) space for output
Bitmask DP: O(2^n) for state space
```

## Common Pitfalls and Edge Cases

### Integer Overflow
```java
// Be careful with left shifts
int safe = (num < Integer.MAX_VALUE >> k) ? num << k : overflow_handling;

// Use long for intermediate calculations
long result = ((long) a * b) >> k;
```

### Negative Number Handling
```java
// Right shift of negative numbers
int num = -8;  // 11111111111111111111111111111000
int result = num >> 2;  // 11111111111111111111111111111110 (-2)
int logicalResult = num >>> 2;  // 00111111111111111111111111111110 (large positive)
```

## Monthly LeetCode Problems (Bit Manipulation)

1. [Single Number](https://leetcode.com/problems/single-number/)
2. [Single Number II](https://leetcode.com/problems/single-number-ii/)
3. [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)
4. [Counting Bits](https://leetcode.com/problems/counting-bits/)
5. [Missing Number](https://leetcode.com/problems/missing-number/)
6. [Reverse Bits](https://leetcode.com/problems/reverse-bits/)
7. [Power of Two](https://leetcode.com/problems/power-of-two/)
8. [Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/)
9. [Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers/)
10. [Hamming Distance](https://leetcode.com/problems/hamming-distance/)

## Quick Reference Cheat Sheet

```java
// Common bit manipulation snippets
int getBit(int num, int i) { return (num & (1 << i)) != 0 ? 1 : 0; }
int setBit(int num, int i) { return num | (1 << i); }
int clearBit(int num, int i) { return num & ~(1 << i); }
int toggleBit(int num, int i) { return num ^ (1 << i); }
int isolateRightmostBit(int num) { return num & -num; }
int turnOffRightmostBit(int num) { return num & (num - 1); }
boolean isPowerOfTwo(int num) { return num > 0 && (num & (num - 1)) == 0; }
int countSetBits(int num) { int count = 0; while (num != 0) { num &= num - 1; count++; } return count; }
```

## References
1. [Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)
2. [HackerEarth Bit Manipulation](https://www.hackerearth.com/practice/algorithms/dynamic-programming/bit-masking/tutorial/)
3. [TopCoder Bitmask Tutorial](https://www.topcoder.com/thrive/articles/A%20bit%20of%20fun:%20fun%20with%20bits)
4. [Two's Complement Explanation](https://www.cs.cornell.edu/~tomf/notes/cps104/twoscomp.html)
5. [Brian Kernighan's Algorithm](https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetKernighan)

## Anki Deck Generation
```bash
mdanki 25_bits_binary_anki.md 25_bits_binary_anki.apkg --deck "Mohan::CodeInterview::LeetCode::Pattern::25_bits_binary_anki"
```

## Interview Tips and XOR Magic

### The Golden Rule for Bit Manipulation Interviews
**Start with XOR when you don't know how to begin!** This technique works for many problems:
- Single Number variations
- Finding differences  
- Binary arithmetic without operators
- Maximum XOR problems
- DNA sequence problems

### XOR Fundamental Properties (Interview Critical)
```
0 ⊕ x = x          (XOR with zero gives the original number)
x ⊕ x = 0          (XOR with self gives zero)
x ⊕ y = y ⊕ x      (Commutative property)
(x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)  (Associative property)
```

## Arithmetic Operations Using Bits

### XOR-Based Addition (Core Interview Pattern)

**Key Insight**: XOR gives sum without carry, AND gives carry positions

```java
public int add(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;  // Calculate carry (common set bits shifted left)
        a = a ^ b;                 // Sum without carry (XOR of all bits)
        b = carry;                 // Update carry for next iteration
    }
    return a;
}

// Step-by-step example: 5 + 3
// 5 = 101, 3 = 011
// Step 1: a=101, b=011, carry=(101&011)<<1 = 001<<1 = 010, a=101^011=110, b=010
// Step 2: a=110, b=010, carry=(110&010)<<1 = 010<<1 = 100, a=110^010=100, b=100  
// Step 3: a=100, b=100, carry=(100&100)<<1 = 100<<1 = 1000, a=100^100=000, b=1000
// Step 4: a=000, b=1000, carry=(000&1000)<<1 = 000<<1 = 000, a=000^1000=1000, b=000
// Result: 1000 = 8 ✓
```

### XOR-Based Subtraction (Advanced Interview Pattern)

**Key Insight**: XOR gives difference without borrow, (~x & y) gives borrow positions

```java
public int subtract(int x, int y) {
    while (y != 0) {
        int borrow = (~x & y) << 1;  // Calculate borrow (y's set bits where x is unset)
        x = x ^ y;                   // Difference without borrow
        y = borrow;                  // Update borrow for next iteration
    }
    return x;
}

// Step-by-step example: 5 - 3  
// 5 = 101, 3 = 011
// Step 1: x=101, y=011, borrow=(~101&011)<<1 = (010&011)<<1 = 010<<1 = 100
//         x=101^011=110, y=100
// Step 2: x=110, y=100, borrow=(~110&100)<<1 = (001&100)<<1 = 000<<1 = 000  
//         x=110^100=010, y=000
// Result: 010 = 2 ✓
```

### Optimized Approach - Reduce to Positive Cases
```java
public int getSum(int a, int b) {
    // Reduce all cases to: sum of two positive integers where x > y
    if (a < b) return getSum(b, a);  // Ensure a >= b
    
    // Handle negative numbers by converting subtraction
    if (b < 0 && a >= 0) return subtract(a, -b);
    if (a < 0 && b < 0) return -getSum(-a, -b);
    
    // Both positive: use XOR addition
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}

private int subtract(int x, int y) {
    while (y != 0) {
        int borrow = (~x & y) << 1;
        x = x ^ y;
        y = borrow;
    }
    return x;
}
```

## Language-Specific Considerations for Bit Manipulation

### Java's Two's Complement Magic
```java
// Java automatically handles 32-bit overflow and negative numbers
// After each operation: implicit & 0xFFFFFFFF (32-bit mask)
// Overflow management: x > 0x7FFFFFFF becomes ~(x ^ 0xFFFFFFFF)

public int addJava(int a, int b) {
    // Java's two's complement handles negatives automatically!
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;  // Java handles 32-bit limit and sign automatically
}
```

### Python's Unlimited Precision Handling
```python
def add_python(a, b):
    # Python needs manual 32-bit simulation
    mask = 0xFFFFFFFF  # 32-bit mask
    max_int = 0x7FFFFFFF  # Maximum positive 32-bit integer
    
    while b != 0:
        carry = ((a & b) << 1) & mask
        a = (a ^ b) & mask  
        b = carry
    
    # Handle negative result (if MSB is set)
    return a if a <= max_int else ~(a ^ mask)
```

### Interview Edge Cases to Remember
```java
// Edge cases that trip up candidates:
add(0, 0)           // Should return 0
add(INT_MAX, 1)     // Overflow handling  
add(-1, 1)          // Should return 0
add(-1, -1)         // Should return -2
subtract(0, 1)      // Should return -1
subtract(1, 1)      // Should return 0
```

## Advanced XOR Patterns for Interviews

### Single Number Pattern (XOR Cancellation)
```java
// Pattern: a ^ a = 0, so duplicates cancel out
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;  // All pairs cancel, single remains
    }
    return result;
}
```

### Finding Two Missing Numbers Using XOR
```java
public int[] findTwoMissing(int[] nums, int n) {
    // XOR all numbers and expected numbers
    int xor = 0;
    for (int i = 1; i <= n; i++) xor ^= i;
    for (int num : nums) xor ^= num;
    
    // xor now contains XOR of two missing numbers
    int rightmostBit = xor & -xor;  // Isolate rightmost different bit
    
    int group1 = 0, group2 = 0;
    for (int i = 1; i <= n; i++) {
        if ((i & rightmostBit) != 0) group1 ^= i;
        else group2 ^= i;
    }
    
    for (int num : nums) {
        if ((num & rightmostBit) != 0) group1 ^= num;
        else group2 ^= num;
    }
    
    return new int[]{group1, group2};
}
```

### XOR for Bit Difference Counting
```java
// Count positions where two numbers differ
public int countDifferentBits(int a, int b) {
    int xor = a ^ b;  // XOR highlights different bits
    return Integer.bitCount(xor);  // Count set bits
}
```

## Interview Problem Patterns Using XOR

### Pattern 1: Array Element Pairing
- **Single Number**: Find element appearing once when others appear twice
- **Single Number II**: Find element appearing once when others appear thrice
- **Single Number III**: Find two elements appearing once when others appear twice

### Pattern 2: Missing Element Detection  
- **Missing Number**: Find missing number in sequence
- **Find Missing and Duplicate**: Locate both missing and duplicate numbers

### Pattern 3: Bit Manipulation Arithmetic
- **Sum of Two Integers**: Add without + operator
- **Subtract Without Operator**: Subtract without - operator  
- **Multiply/Divide by Powers of 2**: Using shifts with XOR validation

### Pattern 4: String/Array Comparison
- **Hamming Distance**: Count different bit positions
- **Total Hamming Distance**: Sum of hamming distances between all pairs

## XOR Optimization Tricks

### Memory-Efficient Swapping
```java
// Swap without temporary variable (be careful with same reference!)
void swap(int a, int b) {
    if (a != b) {  // Important: check for same reference
        a = a ^ b;
        b = a ^ b;  // b = (a^b) ^ b = a
        a = a ^ b;  // a = (a^b) ^ a = b  
    }
}
```

### Efficient Complement Generation
```java
// Toggle all bits in a range
int toggleBitsInRange(int num, int start, int end) {
    int mask = ((1 << (end - start + 1)) - 1) << start;
    return num ^ mask;
}
```