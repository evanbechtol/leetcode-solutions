/**
 * @param {number} n
 * @return {boolean}
 */
var checkPowersOfThree = function(n) {
    if (n === 0) {
        return false;
    }

    while (n > 0) {
        if (n % 3 === 2) {
            return false;
        }

        n = Math.round(n / 3);
    }

    return true;
};