/**
 * @param {number} num
 * @return {boolean}
 */
var isPerfectSquare = function(num) {
    if (num < 1) {
        return false;
    }

    let left = 1;
    let right = num;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const sqr = mid * mid;
        
        if (sqr === num) {
            return true;
        }

        if (sqr < num) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return false;
};