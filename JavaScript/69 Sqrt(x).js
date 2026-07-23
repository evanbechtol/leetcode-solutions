/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function(x) {
    if (x < 2) {
        return x;
    }
    const target = Math.floor(x * 0.5);
    let left = 0;
    let right = x;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const sqr = mid * mid;

        if (sqr === x) {
            return mid; 
        }

        if (sqr < x) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return right;
};