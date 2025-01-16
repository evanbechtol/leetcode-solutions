/**
 * @param {string} s
 * @return {number}
 */
var maxScore = function(s) {
    let ones = 0;
    let zeroes = 0;
    let best = -Infinity;

    for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '1') {
            ones++;
        } else {
            zeroes++;
        }

        best = Math.max(best, zeroes - ones);
    }

    if (s[s.length - 1] === '1') {
        ones++;
    }

    return best + ones;
};