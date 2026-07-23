/**
 * @param {number} n
 * @return {number}
 */
var arrangeCoins = function(n) {
    // set the ends of the range to search
    let left = 1;
    let right = n;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const numCoins = (mid * (mid + 1)) / 2;

        if (numCoins === n) {
            // we found an exact solution; return this
            return mid;
        } else if (numCoins < n) {
            // need more levels
            left = mid + 1;
        } else {
            // need fewer levels
            right = mid - 1;
        }
    }

    // If we get this far, left is at the smallest value of k that will hold > n coins.
    // We also know that k levels won't hold EXACTLY n coins.
    // If it was exact, we woudl have returned early from the while loop.
    // Therefore, we know that the last complete level is not left but left - 1
    return left - 1;
};