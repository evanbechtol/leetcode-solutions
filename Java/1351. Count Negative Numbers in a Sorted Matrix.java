/**
 * 1351. Count Negative Numbers in a Sorted Matrix
Solved
Easy
Topics
premium lock iconCompanies
Hint

Given a m x n matrix grid which is sorted in non-increasing order both row-wise and column-wise, return the number of negative numbers in grid.

 

Example 1:

Input: grid = [[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]
Output: 8
Explanation: There are 8 negatives number in the matrix.

Example 2:

Input: grid = [[3,2],[1,0]]
Output: 0

 

Constraints:

    m == grid.length
    n == grid[i].length
    1 <= m, n <= 100
    -100 <= grid[i][j] <= 100

 
Follow up: Could you find an O(n + m) solution?
 */
/**
 * Brute force:
 * Iterate over each row and check each element. If it's negative, increase our negative count.
 * The time complexity for this is O(n^2)
 * 
 * Optimized approach:
 * Utilize a binary search for each row.We know that IF there is a negative number, then our right pointer
 * will be on a negative. We can then check if our left & mid is a negative. 
 * 
 * The number of negatives in a row is right - left + 1
 * 
 * Edge cases:
 * 1. Right is negative and mid is not, we update left to  mid + 1, right stays where it is, mid is recalculated.
 */

/**BRUTE FORCE
 * 
 * class Solution {
    public int countNegatives(int[][] grid) {
        int numNegatives = 0;

        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[i].length; j++) {
                if (grid[i][j] < 0) {
                    numNegatives++;
                }
            }
        }

        return numNegatives;
    }
}
 */

/**
 * Using Binary Search
 */
class Solution {
    public int countNegatives(int[][] grid) {
        int numNegatives = 0;

        for (int[] row : grid) {
            int left = 0;
            int right = row.length - 1;
            while (left <= right) {
                int mid = left + (right - left) / 2;
                // if this is true, everything in the right half is negative
                if (row[mid] < 0) {
                    numNegatives += right - mid + 1;

                    // check the left-half
                    right = mid - 1;
                } else {
                    // there are no negatives in the left half if mid is greater than zero
                    left = mid + 1;
                }
            }
        }
        return numNegatives;
    }
}