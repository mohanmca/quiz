Approach 2: Rabin-Karp: Constant-time Slice Using Rolling Hash
Rabin-Karp algorithm is used to perform a multiple pattern search. It's used for plagiarism detection and in bioinformatics to look for similarities in two or more proteins.

Detailed implementation of the Rabin-Karp algorithm for quite a complex case you could find in the article Longest Duplicate Substring, we do a very basic implementation.

The idea is to slice over the string and to compute the hash of the sequence in the sliding window, both in a constant time.

Let's use the string AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT as an example. First, convert the string to an integer array:

'A' -> 0, 'C' -> 1, 'G' -> 2, 'T' -> 3
AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT -> 00000111110000011111100000222333. Time to compute the hash for the first sequence of length L: 0000011111. The sequence could be considered as a number in a numeral system with the base 4 and hashed as

h 
0
​
 =∑ 
i=0
L−1
​
 c 
i
​
 4 
L−1−i
 

Here c 
0..4
​
 =0 and c 
5..9
​
 =1 are digits of 0000011111.

Now let's consider the slice AAAAACCCCC -> AAAACCCCCA. For int arrays that means 0000011111 -> 0000111110, to remove one leading 0 and add one trailing 0. One integer in, and one out, let's recompute the hash:

h 
1
​
 =(h 
0
​
 ×4−c 
0
​
 4 
L
 )+c 
L+1
​
 .

Voila, window slice, and hash recomputation are both done in a constant time.

Algorithm

Iterate over the start position of the sequence: from 1 to N−L.

If start == 0, compute the hash of the first sequence s[0: L].

Otherwise, compute the rolling hash from the previous hash value.

If the hash is in the hashset, one met a repeated sequence, time to update the output.

Otherwise, add hash in the hashset.

Return output list.

```
class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        L, n = 10, len(s)
        if n <= L:
            return []

        # rolling hash parameters: base a
        a = 4
        aL = pow(a, L)

        # convert string to array of integers
        to_int = {"A": 0, "C": 1, "G": 2, "T": 3}
        nums = [to_int.get(s[i]) for i in range(n)]

        h = 0
        seen, output = set(), set()
        # iterate over all sequences of length L
        for start in range(n - L + 1):
            # compute hash of the current sequence in O(1) time
            if start != 0:
                h = h * a - nums[start - 1] * aL + nums[start + L - 1]

            # compute hash of the first sequence in O(L) time
            else:
                for i in range(L):
                    h = h * a + nums[i]

            # update output and hashset of seen sequences
            if h in seen:
                output.add(s[start : start + L])
            seen.add(h)
        return list(output)
```

Approach 4: Rolling Hash Based Algorithm
Intuition
The rolling hash approach uses hash functions to efficiently compare different substrings of the original string with those of the reversed string. Hashing helps determine if a substring matches another by comparing hash values rather than individual characters.

Rolling hashes were designed to handle substring matching and comparison problems by allowing incremental updates to hash values as we slide through the string. This reduces the number of comparisons needed by comparing hash values instead of actual substrings.

To start, we compute hash values for all prefixes of the original string and all suffixes of the reversed string using a rolling hash function. The rolling hash function allows us to update the hash values incrementally, which speeds up the computation compared to recalculating hashes from scratch.

Next, we compare the hash values of the prefixes from the original string with the hash values of the suffixes from the reversed string. When the hash values match, it indicates that the corresponding substrings are identical. This helps us find the longest palindromic prefix.

For example: Suppose our string is "aacecaaa". We calculate hash values for the prefixes of "aacecaaa" and the suffixes of its reverse, "aaacecaa". The hash comparisons reveal that the longest palindromic prefix is "aacecaaa". We then reverse the remaining part of the string ("a"), yielding "a". Prepending this reversed part to the original string gives "aaacecaaa".


Hash Calculation Details:
To give you a clearer idea of how the hashing is calculated, let's see this:

We initialize two hash values: one for the original string and one for its reversed version. Let’s use base 29 and a large prime modulus 10 
9
 +7 for hashing. We also initialize a variable to keep track of powers of the base.

We iterate through each character of the original string and compute its hash. Suppose we start with the hash value 0 and process characters one by one:


Character  
′
 a 
′
 :

Update hash:

hash=(hash×base+character_value)%mod

Suppose character_value for  
′
 a 
′
  is 1.

hash=(0×29+1)%1000000007=1


Character  
′
 a 
′
 :

Update hash:

hash=(1×29+1)%1000000007=30


Continue this for all characters. After processing "aacecaaa", let’s assume the final hash is 23456789 for this substring.

We do a similar hash calculation for the reversed string "aaacecaa". We compute the hash values for each prefix of the reversed string. Let’s assume the final hash of the reversed string is 34567890.

To compare substrings, we use a rolling hash. As we move the window of comparison along the combined string, we update the hash values based on the new and old characters entering and exiting the window. If the hash of a prefix of the original string matches the hash of a suffix of the reversed string, that prefix is palindromic. Now the comparison shows that the longest prefix of "aacecaaa" that matches a suffix of "aaacecaa" is "aacecaa". This tells us that "aacecaa" is a palindromic segment. Now we identify the remaining part of the original string that extends beyond the palindromic prefix. For "aacecaaa", the remaining part is "a".

So we reverse the remaining part ("a") to get "a", and prepend this reversed part to the original string.

Thus the shortest palindrome is "aaacecaaa".

Algorithm
Initialize hash parameters:

Set hashBase to 29 and modValue to 10 
9
 +7.
Initialize forwardHash and reverseHash to 0.
Initialize powerValue to 1.
Initialize palindromeEndIndex to -1.
Iterate over each character currentChar in the string s:

Update forwardHash to include the current character:
Compute forwardHash as (forwardHash * hashBase + (currentChar - 'a' + 1)) % modValue.
Update reverseHash to include the current character:
Compute reverseHash as (reverseHash + (currentChar - 'a' + 1) * powerValue) % modValue.
Update powerValue for the next character:
Compute powerValue as (powerValue * hashBase) % modValue.
If forwardHash matches reverseHash, update palindromeEndIndex to the current index i.
After the loop, find the suffix that follows the longest palindromic prefix:

Extract the suffix from the string s starting from palindromeEndIndex + 1 to the end.
Reverse the suffix to prepare for prepending.
Concatenate the reversed suffix to the original string s and return the result:

Return reversedSuffix + s.

```
class Solution:
    def shortestPalindrome(self, s: str) -> str:
        hash_base = 29
        mod_value = int(1e9 + 7)
        forward_hash = 0
        reverse_hash = 0
        power_value = 1
        palindrome_end_index = -1

        # Calculate rolling hashes and find the longest palindromic prefix
        for i, current_char in enumerate(s):
            # Update forward hash
            forward_hash = (
                forward_hash * hash_base + (ord(current_char) - ord("a") + 1)
            ) % mod_value

            # Update reverse hash
            reverse_hash = (
                reverse_hash + (ord(current_char) - ord("a") + 1) * power_value
            ) % mod_value
            power_value = (power_value * hash_base) % mod_value

            # If forward and reverse hashes match, update palindrome end index
            if forward_hash == reverse_hash:
                palindrome_end_index = i

        # Find the remaining suffix after the longest palindromic prefix
        suffix = s[palindrome_end_index + 1 :]

        # Reverse the remaining suffix
        reversed_suffix = suffix[::-1]

        # Prepend the reversed suffix to the original string and return the result
        return reversed_suffix + s
```


Intuition
The KMP algorithm is used for pattern matching within strings. The KMP algorithm computes prefix functions to identify substrings that match specific patterns. In our case, we use this efficiency to compute the longest palindromic prefix. We construct a combined string of the original string, a special delimiter, and the reversed original string. By applying KMP, we can determine the longest prefix of the original string that matches a suffix of the reversed string.

First, we construct a new string by concatenating the original string, a delimiter (such as "#"), and the reversed original string. This combined string looks like "original#reversed". The delimiter "#" is crucial because it ensures that we are only comparing the original string with its reversed version, and not inadvertently matching parts of the reversed string with itself.

To proceed, we calculate the prefix function for this combined string. The prefix function or partial match table is an array where each element at index i indicates the length of the longest prefix of the substring ending at i which is also a suffix. This helps us identify the longest segment where the prefix of the original string matches a suffix in the reversed string. The purpose is to identify how much of the original string matches a suffix of the reversed string.


For example: We construct a combined string using the original string s, a delimiter "#", and the reversed version of s. This combined string helps us find the longest palindromic prefix by applying the KMP algorithm. For the string "aacecaaa", the reversed string is "aaacecaa". Thus, the combined string becomes "aacecaaa#aaacecaa".

The prefix function helps us determine the length of the longest prefix of the original string that can be matched by a suffix of the reversed string. For the combined string "aacecaaa#aaacecaa", the prefix function will reveal that the longest palindromic prefix of "aacecaaa" is "aacecaa".

To create the shortest palindrome, we need to prepend characters to the original string. Specifically, we reverse the portion of the original string that extends beyond the longest palindromic prefix and prepend it. In this case, the part of the original string that extends beyond "aacecaa" is "a". Reversing "a" gives "a", so we prepend "a" to "aacecaaa" and the result is "aaacecaaa".



The algorithm to generate the prefix table is described below:

prefixTable[0] = 0;
for (int i = 1; i < n; i++) {
    int length = prefixTable[i - 1];
    while (length > 0 && s.charAt(i) != s.charAt(length)) {
        length = prefixTable[length - 1];
    }
    if (s.charAt(i) == s.charAt(length)) {
        length++;
    }
    prefixTable[i] = length;
}
Begin by setting prefixTable[0] = 0 since there is no proper prefix for the first character.
Next, iterate over i from 1 to n - 1:
Set length = prefixTable[i - 1], which represents the longest prefix length for the substring up to the previous character.
While length > 0 and the character at position i doesn't match the character at position length, set length = prefixTable[length - 1]. This step is essential when we encounter a mismatch, and we attempt to match a shorter prefix, which is the value of prefixTable[length - 1], until either we find a match or length becomes 0.
If s.charAt(i) == s.charAt(length), we increment length by 1 (extend the matching prefix).
Finally, set prefixTable[i] = length.
The lookup table generation is as illustrated below:

KMP

Algorithm
shortestPalindrome function:

Create reversedString by reversing the input string s.
Concatenate s, a separator #, and reversedString to form combinedString.
Call buildPrefixTable(combinedString) to compute the prefix table for combinedString.
Extract the length of the longest palindromic prefix from the last value in the prefix table (prefixTable[combinedString.length() - 1]).
Compute suffix by taking the substring of s starting from the length of the longest palindromic prefix.
Reverse suffix and prepend it to s to form and return the shortest palindrome.
buildPrefixTable function:

Initialize prefixTable with the same length as the input string s and set length to 0.
Iterate over s from index 1 to the end:
While length is greater than 0 and the current character does not match the character at the current length, update length to the value at prefixTable[length - 1].
If the current character matches the character at length, increment length.
Set prefixTable[i] to the current length.
Return the prefixTable.
The result is the shortest palindrome string formed by appending the reversed suffix of s to s.

Implementation

Complexity Analysis
Let n be the length of the input string.

Time complexity: O(n)

Creating the reversed string requires a pass through the original string, which takes O(n) time.

Concatenating s, #, and reversedString takes O(n) time, as concatenating strings of length n is linear in the length of the strings.

Constructing the prefix table involves iterating over the combined string of length 2n+1. The buildPrefixTable method runs in O(m) time, where m is the length of the combined string. In this case, m=2n+1, so the time complexity is O(n).

Extracting the suffix and reversing it are both O(n) operations.

Combining these, the overall time complexity is O(n).

Space complexity: O(n)

The reversedString and combinedString each use O(n) space.

The prefixTable array has a size of 2n+1, which is O(n). Other variables used (such as length and indices) use O(1) space.

Combining these, the overall space complexity is O(n).

```
class Solution:
    def shortestPalindrome(self, s: str) -> str:
        # Reverse the original string
        reversed_string = s[::-1]

        # Combine the original and reversed strings with a separator
        combined_string = s + "#" + reversed_string

        # Build the prefix table for the combined string
        prefix_table = self._build_prefix_table(combined_string)

        # Get the length of the longest palindromic prefix
        palindrome_length = prefix_table[-1]

        # Construct the shortest palindrome by appending the reverse of the suffix
        suffix = reversed_string[: len(s) - palindrome_length]
        return suffix + s

    # Helper function to build the KMP prefix table
    def _build_prefix_table(self, s: str) -> list:
        prefix_table = [0] * len(s)
        length = 0

        # Build the table by comparing characters
        for i in range(1, len(s)):
            while length > 0 and s[i] != s[length]:
                length = prefix_table[length - 1]
            if s[i] == s[length]:
                length += 1
            prefix_table[i] = length
        return prefix_table
```


Approach #4: Binary Search with Rolling Hash [Accepted]
Intuition

As in Approach #2, we will binary search for the answer. However, we will use a rolling hash (Rabin-Karp algorithm) to store hashes in our set structure.

Algorithm

For some prime p, consider the following function modulo some prime modulus M:

hash(S)=∑ 
0≤i<len(S)
​
 p 
i
 ∗S[i]

Notably, hash(S[1:]+x)= 
p
(hash(S)−S[0])
​
 +p 
n−1
 x. This shows we can get the hash of all A[i:i+guess] in linear time. We will also use the fact that p 
−1
 =p 
M−2
 modM.

For every i >= length - 1, we will want to record the hash of A[i-length+1], A[i-length+2], ..., A[i]. After, we will truncate the first element by h = (h - A[i - (length - 1)]) * Pinv % MOD to get ready to add the next element.

To make our algorithm airtight, we also make a naive check when our work with rolling hashes says that we have found a match.

```
class Solution(object):
    def findLength(self, A, B):
        P, MOD = 113, 10**9 + 7
        Pinv = pow(P, MOD - 2, MOD)
        def check(guess):
            def rolling(A, length):
                if length == 0:
                    yield 0, 0
                    return

                h, power = 0, 1
                for i, x in enumerate(A):
                    h = (h + x * power) % MOD
                    if i < length - 1:
                        power = (power * P) % MOD
                    else:
                        yield h, i - (length - 1)
                        h = (h - A[i - (length - 1)]) * Pinv % MOD

            hashes = collections.defaultdict(list)
            for ha, start in rolling(A, guess):
                hashes[ha].append(start)
            for ha, start in rolling(B, guess):
                iarr = hashes.get(ha, [])
                if any(A[i: i + guess] == B[start: start + guess] for i in iarr):
                    return True
            return False

        lo, hi = 0, min(len(A), len(B)) + 1
        while lo < hi:
            mi = (lo + hi) // 2
            if check(mi):
                lo = mi + 1
            else:
                hi = mi
        return lo - 1
Java
```

Approach 1: Binary Search + Rabin-Karp
String Searching Algorithms

The problem is a follow-up of Longest Repeating Substring, and is typically used to check if you're comfortable with string searching algortihms.

Best algorithms have a linear execution time on average. The most popular ones are Aho-Corasick,
KMP and Rabin-Karp: Aho-Corasick is used by fgrep, KMP is used for chinese string searching, and Rabin-Karp is used for plagiarism detection and in bioinformatics to look for similarities in two or more proteins.

The first two are optimized for a single pattern search, and Rabin-Karp for a multiple pattern search, that is exactly the case here.

Split into two subtasks

Here we have a "two in one" problem:

Perform a search by a substring length in the interval from 1 to N.

Check if there is a duplicate substring of a given length L.

Subtask one: Binary search

A naive solution would be to check all possible string lengths one by one starting from N - 1: if there is a duplicate substring of length N - 1, then of length N - 2, etc. Note that if there is a duplicate substring of length k, it means that there is a duplicate substring of length k - 1. Hence one could use a binary search by string length here, and have the first problem solved in O(logN) time.

fig

Subtask two: Rabin-Karp

Subtask two, to check if there is a duplicate substring of a given length, is a multiple pattern search. Let's use the Rabin-Karp algorithm to solve it in a linear time.

The idea is very simple:

Move a sliding window of length L along the string of length N.

Check if the string in the sliding window
is in the hash set of already-seen strings.

If yes, the duplicate substring is right here.

If not, save the string in the sliding window in the hash set.

Current

The linear time implementation of this idea is a bit
tricky because of two technical problems:

How to implement a string slice in a constant time?

Hashset memory consumption could be huge for very long strings.
One could keep the string hash instead of the string itself but hash generation costs O(L) for the string of length L, and the complexity of the algorithm would be O((N−L)L), N - L for the slice and L for the hash generation. Therefore, we should think about how to generate a hash in a constant time.

Let's now address these problems.

String slice in a constant time

That's a very language-dependent problem. For the moment for Java and Python there is no straightforward solution, and to move the sliding window in a constant time one has to convert the string to another data structure.

Python is already providing memoryview, which is known to be surprisingly slow, and there is a lot of discussion about strview.

The simplest solution both for Java and Python is to convert string to an integer array of ASCII values.

Rolling hash: hash generation in a constant time

To generate a hash of an array of length L, one needs O(L) time.

How to have the constant time of hash generation? Use the advantage of slice: only one integer in, and only one - out.

That's the idea of rolling hash. Here we'll implement the simplest one, polynomial rolling hash. Beware that's polynomial rolling hash is NOT the Rabin fingerprint.

Since one deals here with lowercase English letters, all values in the integer array are between 0 and 25:

arr[i] = (int)S.charAt(i) - (int)'a'

So one could consider string abcd -> [0, 1, 2, 3] as a number in a numeral system with the base 26. Hence abcd -> [0, 1, 2, 3] could be hashed as

h 
0
​
 =0×26 
3
 +1×26 
2
 +2×26 
1
 +3×26 
0
 

Let's write the same formula in a generalized way, where c 
i
​
  is an integer array element and a=26 is a system base.

h 
0
​
 =c 
0
​
 a 
L−1
 +c 
1
​
 a 
L−2
 +...+c 
i
​
 a 
L−1−i
 +...+c 
L−1
​
 a 
1
 +c 
L
​
 a 
0
 

h 
0
​
 =∑ 
i=0
L−1
​
 c 
i
​
 a 
L−1−i
 

Now let's consider the slice abcd -> bcde. For int arrays that means [0, 1, 2, 3] -> [1, 2, 3, 4], to remove the number 0 and to add the number 4.

h 
1
​
 =(h 
0
​
 −0×26 
3
 )×26+4×26 
0
 

Let's look at what changed piece by piece. First, we subtracted 0×26 
3
  from h 
0
​
 ; this removed the contribution of the first element in the array from the hash. Then we multiplied the remaining hash value by 26, which increased the power of the base value for each of the elements remaining in the array (i.e., 2×26 
1
 )×26=2×26 
2
 ). Finally, we add the contribution of the new element (e) to the hash. This results in:

h 
1
​
 =1×26 
3
 +2×26 
2
 +3×26 
1
 +4×26 
0
 

Thus after applying a constant amount of operations to the hash for abcd, we have obtained the hash for the next substring, bcde.

In general form:

h 
1
​
 =(h 
0
​
 a−c 
0
​
 a 
L
 )+c 
L+1
​
 

Now hash regeneration is perfect and fits in a constant time. There is one more issue to address: the possible overflow problem.

How to avoid overflow:

a 
L
  could be a large number and hence the idea is to set limits to avoid the overflow. To set limits means to limit a hash by a modulus and instead of using the hash itself, we will use h % modulus.

We should select a modulus that is large enough for our purpose, but how large is that? You can read more about the topic here.

We must use caution when using a rolling hash to assess the equality of two substrings. The modulus can be thought of as the number of bins that we will use to store the starting index of seen substrings. So there is a higher probability of having two different substrings being stored in the same bin (h % modulus) when the modulus is small.

When two different strings have the same hash value, we call this a collision. In an ideal setting, where every test case is known, this issue could be resolved by adjusting the modulus to avoid collisions. However, in a real-world setting, whenever two substrings have the same hash, we must verify that the substrings are truly equal. This leads to a Rabin-Karp time complexity of O(L(N−L)) in the worst case when many substring hashes collide.

Fortunately, we can reduce the probability of collisions by selecting a good value for our modulus.

Generally speaking, a good modulus will have two traits:

The modulus is not too big and not too small. That is to say, it is large, which helps reduce the probability of collisions, but it is still small enough to fit in a 32-bit integer.
It is prime. This helps increase the uniformity of our hash values after taking h % modulus, which in turn decreases the probability of collisions occurring. If you would like to know more about why this is, you can read about it here.
Here, we will use our favorite modulus, 10 
9
 +7, which satisfies both of these conditions.

One last note, there is another overflow issue here that is purely Java-related. While in Python, the hash regeneration goes perfectly fine, in Java, the same thing is better to rewrite to avoid long overflow. Check here the nice explanation by @hqt.


Binary search algorithm

Use binary search by a substring length to check lengths from 1 to N
left = 1, right = N. While left != right:

L = left + (right - left) / 2

If search(L) != -1 (i.e. there is a duplicate substring), left = L + 1

Otherwise (no duplicate substring), right = L.

Return a duplicate string of length left - 1, or an empty string if
there is no such a string.

Rabin-Karp algorithm

Compute the hash of the substring consisting of the first L characters of string S.

We will initialize the hash map of already seen substrings with this hash value as a key and a list containing the starting index of the substring (0) as the value.

The reason we store the first index of the substring is so that if we see this hash value again, we can compare the current substring to each substring that has the same hash value to see if the two strings actually match or if this is a hash collision.

Every time we compare two strings will cost O(L) time. If we designed a very poor hash function or picked a very weak modulus value (like 1), we could potentially spend O(L⋅(N−L) 
2
 ) time comparing each substring of length L to all previous substrings of length L on each call to search.

Fortunately, the hash function we are using guarantees that there will not be any collisions between hash values that are less than MOD (before taking the modulus). Furthermore, selecting a large, prime modulus helps create a more uniform distribution of the hash values that are greater than MOD. So the probability of two hash values colliding is very small, and on average, we expect the number of collisions to be negligible. Therefore, we can expect the search function to take O(N) time on average.

Iterate over the start position of each substring in S from 1 to N−L. Note we already initialized our hashmap with the substring starting at index zero.

Compute the rolling hash based on the previous hash value.

If the hash is in t


```
class Solution:
    def search(self, L: int, a: int, MOD: int, n: int, nums: List[int]) -> str:
        """
        Rabin-Karp with polynomial rolling hash.
        Search a substring of given length
        that occurs at least 2 times.
        @return start position if the substring exits and -1 otherwise.
        """
        # Compute the hash of the substring S[:L].
        h = 0
        for i in range(L):
            h = (h * a + nums[i]) % MOD
              
        # Store the already seen hash values for substrings of length L.
        seen = collections.defaultdict(list)
        seen[h].append(0)
        
        # Const value to be used often : a**L % MOD
        aL = pow(a, L, MOD) 
        for start in range(1, n - L + 1):
            # Compute the rolling hash in O(1) time
            h = (h * a - nums[start - 1] * aL + nums[start + L - 1]) % MOD
            if h in seen:
                # Check if the current substring matches any of the previous substrings with hash h.
                current_substring = nums[start : start + L]
                if any(current_substring == nums[index : index + L] for index in seen[h]):
                    return start
            seen[h].append(start)
        return -1
        
    def longestDupSubstring(self, S: str) -> str:
        # Modulus value for the rolling hash function to avoid overflow.
        MOD = 10**9 + 7
        
        # Select a base value for the rolling hash function.
        a = 26
        n = len(S)
        
        # Convert string to array of integers to implement constant time slice.
        nums = [ord(S[i]) - ord('a') for i in range(n)]
        
        # Use binary search to find the longest duplicate substring.
        start = -1
        left, right = 1, n - 1
        while left <= right:
            # Guess the length of the longest substring.
            L = left + (right - left) // 2
            start_of_duplicate = self.search(L, a, MOD, n, nums)
            
            # If a duplicate substring of length L exists, increase left and store the
            # starting index of the duplicate substring.  Otherwise decrease right.
            if start_of_duplicate != -1:
                left = L + 1
                start = start_of_duplicate
            else:
                right = L - 1
        
        # The longest substring (if any) begins at index start and ends at start + left.
        return S[start : start + left - 1]
```


Approach 2: Hash
Maybe you think the approach above is not fast enough. Let's write the hash function ourselves to improve the speed.

Note that we will have at most 2 
k
  string, can we map each string to a number in [0, 2 
k
 −1]?

We can. Recall the binary number, we can treat the string as a binary number, and take its decimal form as the hash value. In this case, each binary number has a unique hash value. Moreover, the minimum is all 0, which is zero, while the maximum is all 1, which is exactly 2 
k
 −1.

Because we can directly apply bitwise operations to decimal numbers, it is not even necessary to convert the binary number to a decimal number explicitly.

What's more, we can get the current hash from the last one. This method is called Rolling Hash. All we need to do is to remove the most significant digit and to add a new least significant digit with bitwise operations.

For example, say s="11010110", and k=3, and we just finish calculating the hash of the first substring: "110" (hash is 4+2=6, or 110). Now we want to know the next hash, which is the hash of "101".

We can start from the binary form of our hash, which is 110. First, we shift left, resulting 1100. We do not need the first digit, so it is a good idea to do 1100 & 111 = 100. The all-one 111 helps us to align the digits. Now we need to apply the lowest digit of "101", which is 1, to our hash, and by using |, we get 100 | last_digit = 100 | 1 = 101.

Write them together, we have: new_hash = ((old_hash << 1) & all_one) | last_digit_of_new_hash.

With rolling hash method, we only need O(1) to calculate the next hash, because bitwise operations (&, <<, |, etc.) are only cost O(1).

This time, we can use a simple list to store our hashs, and we will not have hash collision. Those advantages make this approach faster.


Let N be the length of s.

Time complexity: O(N). We need to iterate the string, and use O(1) to calculate the hash of each substring.

Space complexity: O(2 
k
 ). There are 2 
k
  elements in the list.

  Intuition
In our previous approach, we manually extracted substrings from the string s and hashed each one to check for uniqueness. These two operations significantly increase the time complexity, adding an extra factor of n. To improve this, we need a better way to represent substrings and compare them for equality without explicitly extracting each one.

One efficient solution is to use a rolling hash technique. A rolling hash allows us to compute the hash of a substring in constant time, as we extend or shrink the substring by just one character. Instead of recalculating the entire hash from scratch, we reuse the previously computed hash and update it based on the added or removed character.

First, an intuitive way to create unique hashes for substrings is by using their numeric representation. For example, if we know the hash of "1212" is 1212, finding the hash of "1212x" is straightforward: it’s 10 * 1212 + x. This approach works well because every unique string maps to a unique number.

However, as strings get longer, their numeric representation can exceed the limits of an integer variable, causing overflow issues. To solve this, we use the modulo operation to shrink the hash into a manageable range. For example, we can choose a large modulus like 10^9.

Using a modulus introduces a new challenge: collisions. For instance, the strings "1212" and "100001212" (since 10 
9
 +1212) would hash to the same value: 1212. To reduce collisions, we use a large prime number as the base of the hash instead of 10. A prime base ensures a more even distribution of hash values, lowering the chances of two different substrings producing the same hash.

Algorithm
Initialize n to the size of the string s.
Initialize an empty set validSubstringHashes to store unique hashes of valid substrings.
Initialize prime to a prime number greater than 10, (e.g., 31) and mod to a large value (e.g., 10e9).
Iterate over s with start from 0 to n - 1:
Initialize a frequency table digitFrequency of size 10 to store the frequency of each digit in the substring s[start: end].
Initialize substringHash, maxDigitFrequency, and uniqueDigitsCount to 0.
Loop with end from start to n - 1:
Set currentDigit to s[end] - '0'.
If this is the first time currentDigit occurs in the substring (i.e., digitFrequency[currentDigit] == 0), increment uniqueDigitsCount by 1.
Increment digitFrequency[currentDigit] by 1.
Set maxDigitFrequency to the maximum of its current value and the frequency of currentDigit, digitFrequency[currentDigit].
Update substringHash to (prime * substringHash + (currentDigit + 1)) % mod (Adding 1 to currentDigit ensures unique hashes when currentDigit is 0).
If all characters in the substring have the same frequency (maxDigitFrequency): maxDigitFrequency * uniqueDigitsCount == end - start + 1.
Insert substringHash to validSubstringHashes set.
Return the size of validSubstringHashes.

```
class Solution:
    def equalDigitFrequency(self, s: str) -> int:
        n = len(s)  # Size of the string
        prime = 31  # Prime base for the rolling hash
        mod = 10**9  # Large prime modulus to avoid overflow
        valid_substring_hashes = set()

        for start in range(n):
            digit_frequency = [0] * 10  # Frequency array for digits 0-9
            # Track number of unique digits in the substring
            unique_digits_count = 0
            substring_hash = 0  # Rolling hash for the current substring
            # Maximum frequency of any digit in the substring
            max_digit_frequency = 0

            for end in range(start, n):
                current_digit = int(s[end]) - 0  # Convert char to digit (0-9)

                # If this digit appears for the first time, increment unique_digits
                if digit_frequency[current_digit] == 0:
                    unique_digits_count += 1

                digit_frequency[current_digit] += 1
                max_digit_frequency = max(
                    max_digit_frequency, digit_frequency[current_digit]
                )

                # Update rolling hash
                substring_hash = (
                    prime * substring_hash + current_digit + 1
                ) % mod

                # Check if all digits in the substring have the same frequency
                if max_digit_frequency * unique_digits_count == end - start + 1:
                    # Insert unique hash
                    valid_substring_hashes.add(substring_hash)

        return len(valid_substring_hashes)
```


Approach 2: Rabin-Karp: Constant-time Slice Using Rolling Hash
Rabin-Karp algorithm is used to perform a multiple pattern search. It's used for plagiarism detection and in bioinformatics to look for similarities in two or more proteins.

Detailed implementation of the Rabin-Karp algorithm for quite a complex case you could find in the article Longest Duplicate Substring, we do a very basic implementation.

The idea is to slice over the string and to compute the hash of the sequence in the sliding window, both in a constant time.

Let's use the string AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT as an example. First, convert the string to an integer array:

'A' -> 0, 'C' -> 1, 'G' -> 2, 'T' -> 3
AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT -> 00000111110000011111100000222333. Time to compute the hash for the first sequence of length L: 0000011111. The sequence could be considered as a number in a numeral system with the base 4 and hashed as

h 
0
​
 =∑ 
i=0
L−1
​
 c 
i
​
 4 
L−1−i
 

Here c 
0..4
​
 =0 and c 
5..9
​
 =1 are digits of 0000011111.

Now let's consider the slice AAAAACCCCC -> AAAACCCCCA. For int arrays that means 0000011111 -> 0000111110, to remove one leading 0 and add one trailing 0. One integer in, and one out, let's recompute the hash:

h 
1
​
 =(h 
0
​
 ×4−c 
0
​
 4 
L
 )+c 
L+1
​
 .

Voila, window slice, and hash recomputation are both done in a constant time.

Algorithm

Iterate over the start position of the sequence: from 1 to N−L.

If start == 0, compute the hash of the first sequence s[0: L].

Otherwise, compute the rolling hash from the previous hash value.

If the hash is in the hashset, one met a repeated sequence, time to update the output.

Otherwise, add hash in the hashset.

Return output list.

Implementation


Complexity Analysis

Time complexity : O(N−L), that is O(N) for the constant L=10. In the loop executed N−L+1 one builds a hash in a constant time, that results in O(N−L) time complexity.

Space complexity : O(N−L) to keep the hashset, that results in O(N) for the constant L=10.

```
class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        L, n = 10, len(s)
        if n <= L:
            return []

        # rolling hash parameters: base a
        a = 4
        aL = pow(a, L)

        # convert string to array of integers
        to_int = {"A": 0, "C": 1, "G": 2, "T": 3}
        nums = [to_int.get(s[i]) for i in range(n)]

        h = 0
        seen, output = set(), set()
        # iterate over all sequences of length L
        for start in range(n - L + 1):
            # compute hash of the current sequence in O(1) time
            if start != 0:
                h = h * a - nums[start - 1] * aL + nums[start + L - 1]

            # compute hash of the first sequence in O(L) time
            else:
                for i in range(L):
                    h = h * a + nums[i]

            # update output and hashset of seen sequences
            if h in seen:
                output.add(s[start : start + L])
            seen.add(h)
        return list(output)
```

https://leetcode.com/problem-list/rolling-hash/

---

Double hashing is used in **Rabin–Karp** (and other rolling-hash–based algorithms) to **reduce the probability of hash collisions**.

---

## 🔹 Why collisions happen

* A single modular hash (e.g., `hash % M`) maps infinitely many strings into just `M` possible values.
* Two different substrings may produce the same hash — this is a **collision**.
* If you rely on only one hash, you’d need to **verify substrings** with an `O(m)` check every time a collision occurs. With bad luck or adversarial inputs, this can degrade performance.

---

## 🔹 What double hashing does

Instead of keeping **one hash**, you keep **two independent hashes** with different:

* **Bases** (`base1`, `base2`)
* **Moduli** (`M1`, `M2`)

Then each substring is represented as a **pair**:

$$
H(s) = \big( H_1(s) \;,\; H_2(s) \big)
$$

For a match:

* Both `H1(substring) == H1(pattern)` and `H2(substring) == H2(pattern)` must hold.
* Probability of random collision drops from about `1/M` to `1/(M1*M2)`. With moduli ≈ 1e9, this is astronomically small.

---

## 🔹 When to use double hashing

1. **Competitive programming / LeetCode / coding interviews**

   * Often a single large prime modulus (≈ 1e9+7) is enough.
   * Double hashing is added for safety against crafted test cases.

2. **Adversarial or cryptographic contexts**

   * If input can be chosen by an attacker, single hashing is risky.
   * Double hashing makes collision attacks far less practical.

3. **Production systems (like plagiarism checkers, search engines, DNA sequencing tools)**

   * Reliability is crucial, so double hashing avoids false positives.

---

## 🔹 Example

In your `rabin_karp_double`:

```python
pow1 = pow(base1, m-1, M1)
pow2 = pow(base2, m-1, M2)

hp1 = H(p, base1, M1); hw1 = H(t[:m], base1, M1)
hp2 = H(p, base2, M2); hw2 = H(t[:m], base2, M2)

# later, a match only counts if both hashes agree
if hw1 == hp1 and hw2 == hp2 and text[i:i+m] == pattern:
    ans.append(i)
```

Here, **two independent rolling hashes** must both match before verifying the substring. This almost eliminates spurious collisions.

---

✅ In short:
**Double hashing is used when you want to minimize the chance of collisions to nearly zero, especially in adversarial or high-reliability settings.**

---


Great question — the choice of **base** is one of the most important design decisions in polynomial rolling hash (like in Rabin–Karp).

---

## 🔹 What is the **base**?

In polynomial hashing, a string is treated like a number in a **positional numeral system** with base `B`:

$$
H(s) = (s_0 \cdot B^0 + s_1 \cdot B^1 + \dots + s_{m-1} \cdot B^{m-1}) \bmod M
$$

* Each character (or symbol) is mapped to an integer (`s_i`).
* The **base** `B` is the multiplier that separates positions.
* Example: in decimal numbers, the "base" is 10.

  * The number `472` means `4×10² + 7×10¹ + 2×10⁰`.
* Similarly, `"abc"` with base `31` is:

  $$
  H("abc") = 1 \cdot 31^0 + 2 \cdot 31^1 + 3 \cdot 31^2
  $$

---

## 🔹 How to choose a base

The base must be **larger than the alphabet size**, otherwise different strings might map to the same hash more easily.

### Typical choices:

1. **Lowercase letters (`'a'..'z'`)**

   * Alphabet size ≈ 26.
   * Use a small prime like **31** or **53**.
   * Why prime? Helps spread values uniformly under modulus.

2. **ASCII / bytes (0–255)**

   * Alphabet size = 256.
   * Use base = **257** (prime slightly above 256).
   * Or simply **256**, which works naturally for byte sequences.

3. **Unicode text**

   * Alphabet size is large (up to 1,114,112).
   * Common to use **larger primes** like 131, 137, 911382323.
   * In practice, keep `base < M` to avoid overflow.

---

## 🔹 Rules of thumb

* **B > alphabet size**, usually a **small prime**.
* Avoid `B` too small → more collisions.
* Avoid `B` too close to `M` → might cause bad modular distribution.
* Typical values used in CP/LeetCode:

  * `31`, `53` → for letters.
  * `131`, `137` → safe for mixed text.
  * `256` or `257` → for byte-oriented hashing.

---

## 🔹 Why base matters

Imagine base = 2 and alphabet = {a=1, b=2}.

* Hash("ab") = `1*2^0 + 2*2^1 = 5`.
* Hash("ba") = `2*2^0 + 1*2^1 = 4`.
  They’re too close together and will collide easily under modulo.
  Using base = 31 spreads them out much more evenly.

---

✅ **Summary:**
The **base** is like the radix in a number system. Choose it as a small prime larger than the alphabet size (e.g., 31, 53 for letters; 257 for bytes). The goal is to maximize hash distribution and minimize collisions.

---

Would you like me to also explain how the choice of **modulus `M`** interacts with the base (e.g., why `10^9+7` is common)?
