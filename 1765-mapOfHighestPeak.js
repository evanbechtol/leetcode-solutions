/**
 * URL: https://leetcode.com/problems/map-of-highest-peak/description/?envType=daily-question&envId=2025-01-22
 * Description:
 * You are given an integer matrix isWater of size m x n that represents a map of land and water cells.

    If isWater[i][j] == 0, cell (i, j) is a land cell.
    If isWater[i][j] == 1, cell (i, j) is a water cell.

    You must assign each cell a height in a way that follows these rules:

        The height of each cell must be non-negative.
        If the cell is a water cell, its height must be 0.
        Any two adjacent cells must have an absolute height difference of at most 1. 
        A cell is adjacent to another cell if the former is directly north, east, south, or west of the latter (i.e., their sides are touching).

    Find an assignment of heights such that the maximum height in the matrix is maximized.

    Return an integer matrix height of size m x n where height[i][j] is cell (i, j)'s height. 
    If there are multiple solutions, return any of them.

    Example 1:
        Input: isWater = [[0,1],[0,0]]
        Output: [[1,0],[2,1]]
        Explanation: The image shows the assigned heights of each cell.
        The blue cell is the water cell, and the green cells are the land cells.
    
    Example 2:
        Input: isWater = [[0,0,1],[1,0,0],[0,0,0]]
        Output: [[1,1,0],[0,1,1],[1,2,2]]
        Explanation: A height of 2 is the maximum possible height of any assignment.
        Any height assignment that has a maximum height of 2 while still meeting the rules will also be accepted.
*/

/**
 * @description this approaches uses a breadth first search to traverse the cells
 * we start by finding all the cells which are water in "isWater", add them to a queue,
 * and mark their location in cellHeights. Then we iterate over the queue, and for each water cell
 * we update the heights of the neighboring cells. We continue this process until we have visited.
 * @param {number[][]} isWater
 * @return {number[][]}
 */
var highestPeak = function(isWater) {
    // these represent the possible directions (x, y) for an adjacent cell
    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];
    const m = isWater.length;
    const n = isWater[0].length;
    const cellHeights = Array.from({ length: m }, () => Array(n).fill(-1));
    const cellQueue = [];

    // iterate over every cell in isWater
    // if we encounter a water cell, add it to the cellQueue & mark it as
    // a water cell in cellHeights
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (isWater[i][j] === 1) {
                cellQueue.push([i, j]);
                cellHeights[i][j] = 0;
            }
        }
    }

    let heightOfNextLayer = 1;

    while (cellQueue.length) {
        let layerSize = cellQueue.length;

        for (let i = 0; i < layerSize; i++) {
            // pop the current cell from the queue
            const [x, y] = cellQueue.shift();

            // update the heights of the neighboring cells
            for (let j = 0; j < 4; j++) {
                const newX = x + dx[j];
                const newY = y + dy[j];
                // if the cell is valid and has not been updated, update it
                if (newX >= 0 && newX < m && newY >= 0 && newY < n && cellHeights[newX][newY] === -1) {
                    cellHeights[newX][newY] = heightOfNextLayer;
                    cellQueue.push([newX, newY]);
                }
            }
        }

        // increment height of next layer as we move further from water
        heightOfNextLayer++;
    }

    return cellHeights;
};

highestPeak([[0,1],[0,0]]);