/**
 * @param {number[][]} grid
 * @return {number}
 */
var countNegatives = function(grid) {
    let count = 0;
    const cols = grid[0].length;
    
    // for every row in the matrix
    for (const row of grid) {
        let left = 0;
        let right = cols - 1;

        while (left <= right) {
            const mid = Math.floor(left + (right - left) / 2);

            if (row[mid] < 0) {
                count += right - mid + 1; // all elements from mid index to right index are negative
                right = mid - 1; // search for negative number in the left half of the row
            } else {
                left = mid + 1; // left half does not contain negative numbers
            }
        }
    }

    return count;
};