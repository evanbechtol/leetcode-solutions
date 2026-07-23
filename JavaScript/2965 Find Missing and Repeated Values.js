/**
 * @param {number[][]} grid
 * @return {number[]}
 */
var findMissingAndRepeatedValues = function(grid) {
    const n = grid.length;
    const freq = new Array((n * n) + 1).fill(0);
    let repeated = 0;
    let missing = 0;

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            freq[grid[r][c]]++;

            if (freq[grid[r][c]] > 1) {
                repeated = grid[r][c];
            }
        }
    }

    for (let i = 1; i < freq.length; i++) {
        if (freq[i] === 0) {
            missing = i;
        }
    }

    return [repeated, missing];
};

console.log(findMissingAndRepeatedValues([[1, 3], [2, 2]])); // [2, 4]
