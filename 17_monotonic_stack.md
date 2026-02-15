## [When to use MDS, when to use MIS](https://leetcode.com/problems/sum-of-subarray-minimums/solution/)

1. To know the next and previous larger elements, we can use a monotonically decreasing stack.
2. To know the next and previous smaller elements, we can use a monotonically increasing stack.
3. There are two other stacks
   1. Monotonically non-decreasing stack (when duplicates)
   2. Monotonically non-increasing stack (when duplicates)


## [What is Monotonic Decreasing (from bottom to top) Stack?](https://github.com/mohanmca/CodingChallenges/blob/master/src/main/java/leetcode/educative/monotonic_stack/MonotonicStack.java) 

1. Keeps the largest element of the given array at the bottom of the stack and its successive smaller element (if it is in place) would be retained
   1. If larger element appears before second largest element but after largest element they are popped 
2. Every time an item is popped, we get to know about its next larger item.
3. Good Data structure to find PGE, NGE, PSE, NSE 
   1. Popping out for - Next greater element would eject the Previous smaller element (NGE, PSE)
   2. Placement after - Next smaller element would be placed right on top of Previous greater element(PGE, NSE)
   3. In any given input, if there are subsequence with increasing order, They are collapsed and last larger element of sub-sequence alone retained
4. Strongest person joins the stack and beating/popping everyone who are weaker at the top of the stack (ahead of him)
   1. Next person joins stack right beside him, if and only if he is weaker than the prior person
   2. Monotonic decreasing stack contains largest at the bottom, and smallest at the top
   3. The smallest element would be available in-stack if and only if it was added as the last element
   4. If sorted array pushed from tail (n-1) to front (in reverse order) into a stack, it looks like "Monotonic Decreasing Stack"
   5. Monotonic decreasing stack is dictated by *reverse natural sorted order - descending*
6. Once MD stack is constructed it gives illusion of processing sorted elements in descending order
   1. It is assured to be in the decreasing sequence (all the element after the largest elements are considered, element before the largest elements are filtered out)


## What does popping out element means?

1. In MDS, popping gives two facts
   1. Larger element on the right is popping smaller element on the left.
   2. Decreasing trend is changed, since new bigger element appears after smaller element
   3. We are encountering valley and followed by peak.
2. In MIS, popping gives two facts
   1. Smaller element on the right is popping larger element on the left.
   2. Increasing trend is changed, since new smaller element appears after larger element
   3. We are encountering peak and followed by valley

## Sample output Monotonic Increasing (forward and backward construction)

```pre
//CodingChallenges\src\main\java\leetcode\educative\monotonic_stack\MonotonicStack.java
[46, 36, 13, 2, 91, 31, 93, 95, 52, 79]
 1 -                 [46] -             [0] - [1, 0, 0] -> [in-relative order vs pruned, vs total-pruned] 
 2 -                 [36] -             [1] - [1, 1, 1] -> [in-relative order vs pruned, vs total-pruned] 
 3 -                 [13] -             [2] - [1, 1, 2] -> [in-relative order vs pruned, vs total-pruned] 
 4 -                  [2] -             [3] - [1, 1, 3] -> [in-relative order vs pruned, vs total-pruned] 
 5 -              [2, 91] -          [3, 4] - [2, 0, 3] -> [in-relative order vs pruned, vs total-pruned] 
 6 -              [2, 31] -          [3, 5] - [2, 1, 4] -> [in-relative order vs pruned, vs total-pruned] 
 7 -          [2, 31, 93] -       [3, 5, 6] - [3, 0, 4] -> [in-relative order vs pruned, vs total-pruned] 
 8 -      [2, 31, 93, 95] -    [3, 5, 6, 7] - [4, 0, 4] -> [in-relative order vs pruned, vs total-pruned] 
 9 -          [2, 31, 52] -       [3, 5, 8] - [4, 2, 6] -> [in-relative order vs pruned, vs total-pruned] 
10 -      [2, 31, 52, 79] -    [3, 5, 8, 9] - [5, 0, 6] -> [in-relative order vs pruned, vs total-pruned] 
** - [46, 36, 13, 2, 91, 31, 93, 95, 52, 79] -      [2, 31, 52, 79] -    [3, 5, 8, 9] - [5, null, 6] -> [in-relative order vs pruned, vs total-pruned] ** - Final

[46, 36, 13, 2, 91, 31, 93, 95, 52, 79]
10 -                 [79] -             [9] - [1, 0, 0] -> [in-relative order vs pruned, vs total-pruned] 
 9 -                 [52] -             [8] - [1, 1, 1] -> [in-relative order vs pruned, vs total-pruned] 
 8 -             [52, 95] -          [8, 7] - [2, 0, 1] -> [in-relative order vs pruned, vs total-pruned] 
 7 -             [52, 93] -          [8, 6] - [2, 1, 2] -> [in-relative order vs pruned, vs total-pruned] 
 6 -                 [31] -             [5] - [2, 2, 4] -> [in-relative order vs pruned, vs total-pruned] 
 5 -             [31, 91] -          [5, 4] - [3, 0, 4] -> [in-relative order vs pruned, vs total-pruned] 
 4 -                  [2] -             [3] - [3, 2, 6] -> [in-relative order vs pruned, vs total-pruned] 
 3 -              [2, 13] -          [3, 2] - [4, 0, 6] -> [in-relative order vs pruned, vs total-pruned] 
 2 -          [2, 13, 36] -       [3, 2, 1] - [5, 0, 6] -> [in-relative order vs pruned, vs total-pruned] 
 1 -      [2, 13, 36, 46] -    [3, 2, 1, 0] - [6, 0, 6] -> [in-relative order vs pruned, vs total-pruned] 
** - [46, 36, 13, 2, 91, 31, 93, 95, 52, 79] ** - Final
```

1. index
2. total array
3. Current Monotonic increasing stack - values
4. Current Monotonic increasing stack - indices
5. [number of them were in order required by MIS, pruned at current stage, pruned overall]
   1. in-relative order - it would prune zero element, it is relatively in increasing or decreasing order with respect to prior element processed


## Properties of Monotonic-Stack (after construction and during construction)

1. Monotonic increasing stack filters-out
   1. All element before smallest element
   2. That is not in its order after smallest element
   3. This invariance is maintained for any subarray it processed
2. Find the smallest element at the bottom, and next successive element and so on (between elements are thrown out)
3. After the construction (Monotonic Increasing Stack)
   1. If element and prior element has gap, it shows there were out-of-order elements within those ranges
4. There are 4 kinds of monotonic stacks can be constructed

## Relationship between monotonic stack and monotonic queue

```txt
inputs                           [8, 71, 57, 39, 26, 18, 15, 80, 31, 97, 49, 75, 68, 66, 53]
ofDecreasingStack [top-->bottom] [53, 66, 68, 75, 97]
ofIncreasingQueue [head-->tail]  [8, 15, 31, 49, 53] 
ofIncreasingStack [top-->bottom] [53, 49, 31, 15, 8] 
ofDecreasingQueue [head-->tail]  [97, 75, 68, 66, 53]
```

## Monotonic Stack Problem Patterns and Range Queries
1. It is possible to calculate
   1. Range of bigger numbers between two smaller numbers
   2. Range of smaller number between two larger numbers
2. When dealing with Array, prefer store index as result
   1. From index, you can look up element, but not other way.
3. Finding span is simple
   1. For nums[i], if we need to count of 'smaller or equal' to nums[i] before nums[j], Monotonic Decreasing Stack would help
   2. SPAN is also useful in stock related trading applications
4. Peak and Trough
   1. Trend changing is easily detected by Monotonic stack
   2. Peak followed by trough - can be detected by Monotonic increasing Stack
   3. Trough followed by peak - can be detected by Monotonic decreasing Stack
5. if i < j, find bigger number from left to right, i.e nums[j] > nums[i] - construct Monotonic Decreasing Stack from left to right
6. Find smaller number from left to right - construct Monotonic increasing Stack from left to right
7. In some cases, we are allowed to kick only one element (Stock trading only one transaction allowed!)

## Range of the min and max (using monotonic stacks)
```pre
How can the monotonous increase stack be applied to range problems?

For example:
Consider the element 3 in the following vector:

                         [2, 9, 7, 8, 3, 4, 6, 1]
      	                 |                     |
            the previous less element of 3     the next less element of 3 	                         

After finding both NSE and PSE of 3, we can determine the
distance between 3 and 2(previous less) , and the distance between 3 and 1(next less).
In this example, the distance is 4 and 3 respectively.

How many subarrays with 3 being its minimum value?
The answer is 4*3.

9 7 8 3
9 7 8 3 4
9 7 8 3 4 6
7 8 3
7 8 3 4
7 8 3 4 6
8 3
8 3 4
8 3 4 6
3
3 4
3 4 6

How much the element 3 contributes to the final answer?
It is 3*(4*3).
What is the final answer?
Denote by left[i] the distance between element A[i] and its PLE.
Denote by right[i] the distance between element A[i] and its NLE.

The final answer is,
sum(A[i]*left[i]*right[i] )
```

## Next bigger/smaller element towards lefts/right

1. Looking at the index 'i' of the element, and if 'j' is kicked out by 'i', we can find the range of elements between j and i
   1. If traversed from left to right, 'i' would be higher than j
   2. If traversed from right to left, 'i' would be lower than j
2. We can find max-left, max-right, min-left, min-right
   1. How to find first smaller to left?  [-1,-1,-1,4,5]
   2. How to find first larger to left?   [-1, 8, 6, 6, 8]
   3. How to find first smaller to right? [6,4,-1,-1,-1]
   4. How to find first larger to right?  [-1,7,5,7,-1]


## Monotonic-Sequence Problems

1. [FindNextSmallerLargerInTheRightAndLeft](https://github.com/mohanmca/CodingChallenges/blob/master/src/main/java/leetcode/educative/monotonic_stack/FindNextSmallerLarger.java)
2. [Online stock span](https://leetcode.com/problems/online-stock-span/)
3. [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
4. [Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/)
5. [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/)
6. [132 Pattern](https://leetcode.com/problems/132-pattern/)
7. [Shortest Unsorted Continuous Subarray](https://leetcode.com/problems/shortest-unsorted-continuous-subarray/)
8. [Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)
9. [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)
10. [85. Maximal Rectangle Leetcode Hard](https://leetcode.com/problems/Maximal-Rectangle/description/)
11. [Sliding window maximum](https://leetcode.com/problems/sliding-window-maximum/description/)
12. [907. Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/description/)
13. [42. Trapping Rain Water](https://leetcode.com/problems/Trapping-Rain-Water/description/)
14. [1130. Minimum Cost Tree From Leaf Values](https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/discuss/339959/One-Pass-O(N)-Time-and-Space)
15. [856. Score of Parentheses](https://leetcode.com/problems/score-of-parentheses/discuss/141777/C++JavaPython-O(1)-Space)
16. [768. Max Chunks To Make Sorted II](https://leetcode.com/problems/Max-Chunks-To-Make-Sorted-II/description/)
17. [316. Remove duplicate letter](https://leetcode.com/problems/remove-duplicate-letters/description/)
18. [321. Create Maximum Number](https://leetcode.com/problems/create-maximum-number/description/)
19. [402. Remove K Digits](https://leetcode.com/problems/remove-k-digits/description/)


## [1-Find next larger-smaller sequence-Not-LeetCode]

```java
public class FindNextSmallerLarger {
   private int[] smallerToRight;
    private int[] smallerToLeft;
    private int[] largerToRight;
    private int[] largerToLeft;

    public FindNextSmallerLarger(int[] nums) {
        this.nums = nums;
        buildSequence(this.nums);
    }

    private void buildSequence(final int[] nums) {
        smallerToRight = new int[nums.length];
        smallerToLeft = new int[nums.length];
        largerToRight = new int[nums.length];
        largerToLeft = new int[nums.length];
        Arrays.fill(smallerToRight, -1);
        Arrays.fill(smallerToLeft, -1);
        Arrays.fill(largerToRight, -1);
        Arrays.fill(largerToLeft, -1);
        buildDecreasingSequence();
        buildIncreasingSequence();
    }

    /**
     * @See To find smaller build Increasing Sequence
     * @see <a href="https://github.com/mohanmca/CodingChallenges/blob/master/src/md/Monotonic.md#rules-to-build-the-type-of-sequence">rules-to-build-the-type-of-sequence</a>
     */
    private void buildIncreasingSequence() {
        Stack<Integer> stack = new Stack<Integer>();
        for (int i = 0; i < nums.length; i++) {
            while (!stack.isEmpty() && nums[i] <= nums[stack.peek()]) {
                int k = stack.pop();
                smallerToRight[k] = nums[i];
            }
            if (!stack.isEmpty()) {
                smallerToLeft[i] = nums[stack.peek()];
            }
            stack.push(i);
        }
    }

    /**
     * Decreasing Sequence for larger
     */
    private void buildDecreasingSequence() {
        Stack<Integer> stack = new Stack<Integer>();
        for (int i = 0; i < nums.length; i++) {
            while (!stack.isEmpty() && nums[i] >= nums[stack.peek()]) {
                int k = stack.pop();
                largerToRight[k] = nums[i];
            }
            if (!stack.isEmpty()) {
                largerToLeft[i] = nums[stack.peek()];
            }
            stack.push(i);
        }
    }

    public int[] getSmallerToRight() {
        return smallerToRight;
    }

    public int[] getSmallerToLeft() {
        return smallerToLeft;
    }

    public int[] getLargerToLeft() {
        return largerToLeft;
    }

    public int[] getLargerToRight() {
        return largerToRight;
    }
}
```


## [4-496. Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/)
-The next greater element of some element x in an array is the first greater element that is to the right of x in the same array. -
Input: nums1 = [4,1,2], nums2 = [1,3,4,2], Output: [-1,3,-1]
The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.
You are given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2.
For each 0 <= i < nums1.length, find the index j such that nums1[i] == nums2[j] and determine the next greater element of nums2[j] in nums2.
If there is no next greater element, then the answer for this query is -1.
Return an array ans of length nums1.length such that ans[i] is the next greater element as described above.
%

```java
public int[] nextGreaterElement(int[] nums1, int[] nums2) {

    Stack<Integer>  stack = new Stack<Integer>();

    // Larger element == Decreasing Sequence == Big Guy kicks out, small guy
    Map<Integer, Integer> mapping = new HashMap<Integer, Integer>();
    for(int i=0; i<nums2.length; i++) {
        while(!stack.isEmpty() && nums2[i] > nums2[stack.peek()]) {
            mapping.put(nums2[stack.pop()], nums2[i] );
        }
        stack.push(i);
    }

    int[] answer = new int[nums1.length];
    for(int i=0;i<nums1.length;i++) {
        answer[i] = mapping.containsKey(nums1[i]) ?  mapping.get(nums1[i]) : -1;
    }
    return answer;
}
```

## [503. Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/)
Given a circular integer array nums (i.e., the next element of nums[nums.length - 1] is nums[0]), return the next greater number for every element in nums.


The next greater number of a number x is the first greater number to its traversing-order next in the array, which means you could search circularly to find its next greater number.
If it doesn't exist, return -1 for this number.
%

```java
    public int[] nextGreaterElement(int[] nums1) {

        Stack<Integer> stack = new Stack<Integer>();
        int[] answer = new int[nums1.length];
        Arrays.fill(answer, -1);
        // Larger element == Decreasing Sequence == Big Guy kicks out, small guy

        int N = nums1.length;

        for (int i = 0; i < (nums1.length * 2) ; i++) {
            while (!stack.isEmpty() && nums1[i % N] > nums1[stack.peek()]) {
                answer[stack.pop()] = nums1[i % N];
            }
            stack.push(i % N);
        }
        return answer;
    }
```

## [Online stock span](https://leetcode.com/problems/online-stock-span/)

2-The span of that stock's price for the current day. The span of the stock's price today is defined as the maximum number of consecutive days (starting from today and going backward) for which the stock price was less than or equal to today's price. For example, if the price of a stock over the next 7 days were [100,80,60,70,60,75,85], then the stock spans would be [1,1,1,2,1,4,6].
%

```java
public class OnlineStockSpan {

    Stack<int[]> stack = new Stack<int[]>();

    public OnlineStockSpan() {
    }

    public int next(int price) {
        // when new price comes all prices smaller and equals are removed..
        // we are finding greater element, then it is decreasing sequence
        // and maximum span is returned
        int smallerPrices = 1;
        while (!stack.isEmpty() && stack.peek()[1] <= price) {
            int[] indexedPrice = stack.pop();
            smallerPrices += indexedPrice[0];
        }


        int[] indexPrice = new int[]{smallerPrices, price};
        stack.push(indexPrice);
        return smallerPrices;
    }

    private static int[] stockSpan(int[] prices) {
        int[] result = new int[prices.length];
        OnlineStockSpan stockSpanner = new OnlineStockSpan();
        for (int i = 0; i < prices.length; i++) {
            result[i] = stockSpanner.next(prices[i]);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] prices = new int[]{100, 80, 60, 70, 60, 75, 85};

        int[] result = stockSpan(prices);
        System.out.println(Arrays.toString(result));
    }
    
}
```

## [3-739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.
%

```java
    public int[] dailyTemperatures(int[] temperatures) {
        Stack<Integer> deque = new Stack<>();
        int[] counter = new int[temperatures.length];
        Arrays.fill(counter, 0);
        deque.add(0);
        for (int i = 1; i < temperatures.length; i++) {
            while (!deque.isEmpty() && temperatures[i] > temperatures[deque.peek()]) {
                int oldI = deque.pop();
                counter[oldI] = i - oldI;
            }
            deque.push(i);
        }
        return counter;
    }
```

## [456. 132 Pattern](https://leetcode.com/problems/132-pattern/)
6-Given an array of n integers nums, a 132 pattern is a subsequence of three integers nums[i], nums[j] and nums[k] such that i < j < k and nums[i] < nums[k] < nums[j].
Return true if there is a 132 pattern in nums, otherwise, return false.
Example 1: Input: nums = [1,2,3,4], Output: false, Explanation: There is no 132 pattern in the sequence.
%
```java
/**
 * @see <a href='https://leetcode.com/problems/132-pattern/solution/>132 Pattern</a>
 **/
    public boolean find132pattern(int[] nums) {
        if (nums.length < 3)
            return false;
        Stack < Integer > stack = new Stack < > ();
        int[] min = new int[nums.length];
        min[0] = nums[0];
        for (int i = 1; i < nums.length; i++)
            min[i] = Math.min(min[i - 1], nums[i]);
        for (int j = nums.length - 1; j >= 0; j--) {
            if (nums[j] > min[j]) {
                while (!stack.isEmpty() && stack.peek() <= min[j])
                    stack.pop();
                if (!stack.isEmpty() && stack.peek() < nums[j])
                    return true;
                stack.push(nums[j]);
            }
        }
        return false;
    }
```

## [581. Shortest Unsorted Continuous Subarray](https://leetcode.com/problems/shortest-unsorted-continuous-subarray/)

```java
    public int findUnsortedSubarray(int[] nums) {
        if (nums.length <= 1) return 0;
        // find next smaller number on the right - i, build increasing stack
        // find next larger number on the left, build decreasing stack
        // j [j-i]+1
        Stack<Integer> stack = new Stack<>();
        int left = nums.length;
        for (int i = 0; i < nums.length; i++) {
            while (!stack.isEmpty() && nums[i] < nums[stack.peek()]) {
                left = Math.min(left, stack.pop());
            }
            stack.push(i);
        }

        int right = -1;
        for (int i = nums.length - 1; i > -1; i--) {
            while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
                right = Math.max(right, stack.pop());
            }
            stack.push(i);
        }
        return left < right ? (right - left) + 1 : 0;
    }
```
## [122. Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)
You are given an integer array prices where prices[i] is the price of a given stock on the ith day.

On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. 
Find and return the maximum profit you can achieve.
%

```java
    public int maxProfit(int[] prices) {
        Deque<Integer> stack = new ArrayDeque<>();
        int profit = 0;
        for(int i=0;i<prices.length;i++) {
            while(!stack.isEmpty() && prices[stack.peek()] < prices[i] )    {
                profit += prices[i] - prices[stack.pop()];
                break;
            }
            stack.push(i);
        }
        return profit;
    }
```

## [84. Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)

<details>
<summary>Brute force</summary>

```java
public class Solution {
    public int largestRectangleArea(int[] heights) {
        int maxArea = 0;
        int length = heights.length;
        for (int i = 0; i < length; i++) {
            int minHeight = Integer.MAX_VALUE;
            for (int j = i; j < length; j++) {
                minHeight = Math.min(minHeight, heights[j]);
                maxArea = Math.max(maxArea, minHeight * (j - i + 1));
            }
        }
        return maxArea;
    }
}
```
</details>


<details>
<summary>Brute force</summary>

```java
public class Solution {
    public int calculateArea(int[] heights, int start, int end) {
        if (start > end)
            return 0;
        int minindex = start;
        for (int i = start; i <= end; i++)
            if (heights[minindex] > heights[i])
                minindex = i;
        return Math.max(heights[minindex] * (end - start + 1),
                        Math.max(calculateArea(heights, start, minindex - 1),
                                calculateArea(heights, minindex + 1, end))
                );
    }

    public int largestRectangleArea(int[] heights) {
        return calculateArea(heights, 0, heights.length - 1);
    }
}
```
</details>

<details>
<summary>Monotonic stack</summary>


```java    
public int largestRectangleArea(int[] heights) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1);
        int length = heights.length;
        int maxArea = 0;
        for (int i = 0; i < length; i++) {
            while ((stack.peek() != -1) && (heights[stack.peek()] >= heights[i])) {
                int currentHeight = heights[stack.pop()];
                int currentWidth = i - stack.peek() - 1;
                maxArea = Math.max(maxArea, currentHeight * currentWidth);
            }
            stack.push(i);
        }
        while (stack.peek() != -1) {
            int currentHeight = heights[stack.pop()];
            int currentWidth = length - stack.peek() - 1;
            maxArea = Math.max(maxArea, currentHeight * currentWidth);
        }
        return maxArea;
    }
```
</details>

## [42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)

```java
int trap(vector<int>& height)
{
    int ans = 0, current = 0;
    stack<int> st;
    while (current < height.size()) {
        while (!st.empty() && height[current] > height[st.top()]) {
            int top = st.top();
            st.pop();
            if (st.empty())
                break;
            int distance = current - st.top() - 1;
            int bounded_height = min(height[current], height[st.top()]) - height[top];
            ans += distance * bounded_height;
        }
        st.push(current++);
    }
    return ans;
}
```

## [2289. Steps to Make Array Non-decreasing](https://leetcode.com/problems/steps-to-make-array-non-decreasing/)

```java
    public int totalSteps(int[] nums) {
        int n = nums.length-1;
        Stack<Integer> s = new Stack<Integer>();
        int[] dp = new int[nums.length];
        int res = 0;
        for(int i=n; i >= 0; i--) {            
            while(!s.isEmpty() && nums[s.peek()] < nums[i] ) {
                dp[i] = Math.max(++dp[i], dp[s.pop()]);
                res = Math.max(res, dp[i]);
            }
            s.push(i);
        }
        return res;
    }
```

## [907. Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/)
Given an array of integers arr, find the sum of min(b), where b ranges over every (contiguous) subarray of arr. 
Since the answer may be large, return the answer modulo 109 + 7.
Input: arr = [3,1,2,4], Output: 17
Explanation: Subarrays are [3], [1], [2], [4], [3,1], [1,2], [2,4], [3,1,2], [1,2,4], [3,1,2,4].
Minimums are 3, 1, 2, 4, 1, 1, 2, 1, 1, 1. Hence Sum is 17.
%

```java
class Solution {
    public int sumSubarrayMins(int[] arr) {
        int MOD = 1000000007;

        Stack<Integer> stack = new Stack<>();
        long sumOfMinimums = 0;

        // building monotonically increasing stack
        for (int i = 0; i <= arr.length; i++) {

            // when i reaches the array length, it is an indication that
            // all the elements have been processed, and the remaining
            // elements in the stack should now be popped out.

            while (!stack.empty() && (i == = arr.length || arr[stack.peek()] >= arr[i])) {

                // Notice the sign ">=", This ensures that no contribution
                // is counted twice. rightBoundary takes equal or smaller 
                // elements into account while leftBoundary takes only the
                // strictly smaller elements into account

                int mid = stack.pop();
                int leftBoundary = stack.empty() ? -1 : stack.peek();
                int rightBoundary = i;

                // count of subarrays where mid is the minimum element
                long count = (long) (mid - leftBoundary) * (rightBoundary - mid) % MOD;

                sumOfMinimums += (count * arr[mid]) % MOD;
                sumOfMinimums %= MOD;
            }
            stack.push(i);
        }

        return (int) (sumOfMinimums);
    }
}
```

## [Follow-up 25_bits_binary_anki Tricks](./25_bits_binary_anki.md)

## How to create anki from this markdown file
* mdanki 17_monotonic_stack.md 17_monotonic_stack.apkg --deck "Mohan::CodeInterview::LeetCode::Pattern::Monotonic_stack"

## Monotonic Stack
* [Traceback URL](https://github.com/mohanmca/CodingChallenges/blob/master/src/md/coding_patterns/17_monotonic_stack.md)
* [LeetCode - A comprehensive guide and template for monotonic stack based problems](https://leetcode.com/discuss/study-guide/2347639/a-comprehensive-guide-and-template-for-monotonic-stack-based-problems)
* [RogerNadal Replit](https://replit.com/@RogerNadal/MonotonicStack?v=1)
* [RogerNadal CodeForces](https://codeforces.com/submissions/rogernadal)
* [Monotonic Stack](https://labuladong.gitbook.io/algo-en/ii.-data-structure/monotonicstack)
* [Monotonic stack](https://medium.com/techtofreedom/algorithms-for-interview-2-monotonic-stack-462251689da8)
* [Monotonic stack in python](https://helloacm.com/the-monotone-stack-implementation-in-python/)
* [Monotonic Stack](https://medium.com/@vishnuvardhan623/monotonic-stack-e9dcc4fa8c3e)
* [Practiced Code](https://github.com/mohanmca/CodingChallenges/blob/master/src/main/java/leedcode/monotonic/FindNextSmallerLarger.java)
* [Monotonic Video](https://www.youtube.com/watch?v=m4hvxzLoN_I)
* [MonotonicStack.java]((https://github.com/mohanmca/CodingChallenges/blob/master/src/main/java/leetcode/educative/monotonic_stack/MonotonicStack.java))


## How to create anki from this markdown file

* mdanki 17_monotonic_stack.md Monotonic.apkg --deck "Mohan::CodeInterview::LeetCode::Pattern::17_Monotonic"
