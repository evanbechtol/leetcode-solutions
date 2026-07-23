/**
 * URL: https://leetcode.com/problems/grid-game/description/?envType=daily-question&envId=2025-01-21
 * 
 * Description: 
 *  You are given a 0-indexed 2D array grid of size 2 x n, where grid[r][c] represents the number of points at position (r, c) on the matrix. Two robots are playing a game on this matrix.
    Both robots initially start at (0, 0) and want to reach (1, n-1). Each robot may only move to the right ((r, c) to (r, c + 1)) or down ((r, c) to (r + 1, c)).
    At the start of the game, the first robot moves from (0, 0) to (1, n-1), collecting all the points from the cells on its path. For all cells (r, c) traversed on the path, grid[r][c] is set to 0. Then, the second robot moves from (0, 0) to (1, n-1), collecting the points on its path. Note that their paths may intersect with one another.
    The first robot wants to minimize the number of points collected by the second robot. In contrast, the second robot wants to maximize the number of points it collects. If both robots play optimally, return the number of points collected by the second robot.

   Example 1:
      Input: grid = [[2,5,4],[1,5,1]]
      Output: 4
      Explanation: The optimal path taken by the first robot is shown in red, and the optimal path taken by the second robot is shown in blue.
      The cells visited by the first robot are set to 0.
      The second robot will collect 0 + 0 + 4 + 0 = 4 points.
   
   Example 2:
      Input: grid = [[3,3,1],[8,5,2]]
      Output: 4
      Explanation: The optimal path taken by the first robot is shown in red, and the optimal path taken by the second robot is shown in blue.
      The cells visited by the first robot are set to 0.
      The second robot will collect 0 + 3 + 1 + 0 = 4 points.
   
   Example 3:
      Input: grid = [[1,3,1,15],[1,3,3,1]]
      Output: 7
      Explanation: The optimal path taken by the first robot is shown in red, and the optimal path taken by the second robot is shown in blue.
      The cells visited by the first robot are set to 0.
      The second robot will collect 0 + 1 + 3 + 3 + 0 = 7 points.
      
   Contraints:
    - grid.length == 2
    - n == grid[r].length
    - 1 <= n <= 5 * 104
    - 1 <= grid[r][c] <= 105
 */

/**
 * What is this really asking for?
 *    - The goal is to minimize the amount of points that the second robot can collect.
 *    - Since the robots can only move right or down, determining where the first robot turns down
 *      is critical to minimizing the points that the second robot can collect.
 * How would you solve this by hand?
 *    - We know that the red robot wants to minimize the points that the second robot can collect, 
 *      and the blue robot wants to maximize the number of points it can collect. This means that
 *      the blue robot wants to avoid the cells that the red robot has visited where possible.
 * Why does the below implementation work?
 *    - It ensures that the highest score at each step is minimized by comparing the top and bottom
 *      row sums, and adjusting them dynamically as the robots move across the grid.
 * 
    Step 1: Sum the Top Row
        Calculate the total sum of the top row (grid[0]).
        This represents the score available to the second robot initially if the first robot doesn’t take any cells from the top row.
        Why? The top row sum decreases as the first robot progresses.

    Step 2: Traverse Columns
        Use a sliding window approach 🪟:
            Deduct the value of the current column from the top row's sum (representing the first robot collecting these cells).
            Add the value of the current column to the bottom row's cumulative sum (bottom).
            Calculate the maximum score left for the second robot using max(top, bottom).
            Track the minimum "maximum score" possible using res.

    Step 3: Minimize the Maximum
        The goal is to minimize the "worst-case scenario" for the second robot, ensuring a balanced outcome.
 */

/**
 * @param {number[][]} grid
 * @return {number}
 */
var gridGame = function (grid) {
   //get the sum of all elements of the first row
   let firstRowSum = grid[0].reduce((acc, curr) => acc += curr, 0);
   let secondRowSum = 0;
   // Since we want the smallest value possible, initialize minSum to Infinity and go down from there
   let minSum = Infinity;

   for (let turnIndex = 0; turnIndex < grid[0].length; ++turnIndex) {
      // we subtract the current element from first row sum to simulate the first robot
      // taking the points for this cell
      firstRowSum -= grid[0][turnIndex];
      
      // get the larger of first row and second row sums. this simulates the first robot
      // turning down to the second row, when the sum is larger than the first row.
      // Then, find the minimum of the maximum scores encountered
      minSum = Math.min(minSum, Math.max(firstRowSum, secondRowSum));

      // add to the second row sum so that we know when the first robot will turn down
      // when the sum of the second row is greater than the first row, the robot turns
      secondRowSum += grid[1][turnIndex];
   }

   return minSum;
};