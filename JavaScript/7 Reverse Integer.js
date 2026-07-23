/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
    const bit = Math.pow(2, 31) - 1;
    const reversed = x.toString().split('').reverse().join('');
    const result = parseInt(reversed);

    if (result > bit || result < -bit) {
        return 0;
    }

    return x < 0 ? -result : result;
};